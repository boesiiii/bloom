from calendar import monthrange
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from .models import RelationshipScoreEvent, ScoreEventType


def clamp_points(value):
    return max(0, min(100, int(value)))


def growth_stage_for_value(growth):
    if growth >= 100:
        return "fully_bloomed"
    if growth >= 75:
        return "blooming"
    if growth >= 50:
        return "budding"
    if growth >= 25:
        return "growing"
    if growth > 0:
        return "sprout"
    return "seed"


def bloom_state_for_growth(growth, disconnection_streak):
    if growth >= 100 and disconnection_streak == 0:
        return "full_bloom"
    if growth >= 75:
        return "faded" if disconnection_streak else "blooming"
    if growth >= 50:
        return "faded" if disconnection_streak else "budding"
    return "none"


def plant_state_for_person(person):
    growth = max(0, min(100, int(person.plant_growth or 0)))
    disconnection_streak = max(0, min(10, int(person.disconnection_streak or 0)))
    if disconnection_streak >= 10:
        growth = 0

    stage = growth_stage_for_value(growth)
    if disconnection_streak >= 10:
        tone = "restart"
    elif disconnection_streak:
        tone = "wilting"
    elif growth >= 100:
        tone = "bright"
    elif growth >= 50:
        tone = "fresh"
    elif growth > 0:
        tone = "steady"
    else:
        tone = "seed"

    return {
        "growth_stage": stage,
        "bloom_state": bloom_state_for_growth(growth, disconnection_streak),
        "tone": tone,
        "growth": growth,
        "growth_goal": 100,
        "disconnection_streak": disconnection_streak,
        "decay_progress": disconnection_streak * 10,
        "needs_restart": disconnection_streak >= 10,
    }


def create_score_event(person, event_type, points_delta, reason):
    event = RelationshipScoreEvent.objects.create(
        user=person.user,
        person=person,
        event_type=event_type,
        points_delta=points_delta,
        reason=reason,
    )
    person.relationship_points = clamp_points(person.relationship_points + points_delta)
    person.save(update_fields=["relationship_points", "relationship_health", "plant_type", "updated_at"])
    return event


def interval_was_met(person, interaction_date):
    if not person.last_interaction_at:
        return True
    due_with_grace = person.next_goal_due_at or person.calculate_next_goal_due(person.last_interaction_at)
    return interaction_date <= due_with_grace + timedelta(hours=12)


@transaction.atomic
def handle_interaction_logged(interaction):
    participants = list(interaction.participants.all())
    people = []
    seen_ids = set()
    for person in [interaction.person, *participants]:
        if person.id in seen_ids:
            continue
        people.append(person)
        seen_ids.add(person.id)

    for person in people:
        handle_interaction_logged_for_person(interaction, person)


def handle_interaction_logged_for_person(interaction, person):
    met_cadence = interval_was_met(person, interaction.interaction_date)

    person.last_interaction_at = interaction.interaction_date
    person.next_goal_due_at = person.calculate_next_goal_due(interaction.interaction_date)

    if met_cadence:
        person.current_streak += 1
        person.longest_streak = max(person.longest_streak, person.current_streak)
        person.plant_growth = min(100, max(person.plant_growth, person.current_streak))
    else:
        person.current_streak = 1
        person.plant_growth = max(1, person.plant_growth)

    person.disconnection_streak = 0

    person.save(
        update_fields=[
            "last_interaction_at",
            "next_goal_due_at",
            "plant_growth",
            "current_streak",
            "disconnection_streak",
            "longest_streak",
            "relationship_health",
            "plant_type",
            "updated_at",
        ]
    )

    if interaction.was_meaningful:
        create_score_event(
            person,
            ScoreEventType.INTERACTION_LOGGED,
            5,
            "Meaningful interaction logged",
        )

    if met_cadence:
        create_score_event(
            person,
            ScoreEventType.CADENCE_GOAL_MET,
            8,
            "Interaction happened within the cadence window",
        )

    if person.current_streak and person.current_streak % 3 == 0:
        create_score_event(
            person,
            ScoreEventType.STREAK_BONUS,
            10,
            "Three healthy cadence intervals in a row",
        )


def handle_profile_enriched(person, detail):
    create_score_event(
        person,
        ScoreEventType.PROFILE_ENRICHED,
        1,
        f"Added {detail.get_category_display().lower()} detail",
    )


def _add_months(value, months):
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


def next_repeating_due_at(reminder, now=None):
    from apps.reminders.models import ReminderRepeat

    now = now or timezone.now()
    due_at = reminder.due_at
    increments = {
        ReminderRepeat.DAILY: lambda value: value + timedelta(days=1),
        ReminderRepeat.WEEKLY: lambda value: value + timedelta(days=7),
        ReminderRepeat.BIWEEKLY: lambda value: value + timedelta(days=14),
        ReminderRepeat.MONTHLY: lambda value: _add_months(value, 1),
        ReminderRepeat.YEARLY: lambda value: _add_months(value, 12),
    }
    increment = increments.get(reminder.repeat)
    if not increment:
        return None

    next_due = increment(due_at)
    while next_due <= now:
        next_due = increment(next_due)
    return next_due


@transaction.atomic
def complete_reminder(reminder):
    from apps.reminders.models import ReminderRepeat, ReminderStatus

    next_due_at = next_repeating_due_at(reminder)
    reminder.status = ReminderStatus.PENDING if reminder.repeat != ReminderRepeat.NONE and next_due_at else ReminderStatus.DONE
    reminder.completed_at = timezone.now()
    update_fields = ["status", "completed_at", "updated_at"]
    if next_due_at:
        reminder.due_at = next_due_at
        update_fields.append("due_at")
    reminder.save(update_fields=update_fields)
    create_score_event(
        reminder.person,
        ScoreEventType.REMINDER_COMPLETED,
        3,
        "Follow-up reminder completed",
    )
    return reminder


@transaction.atomic
def snooze_reminder(reminder, days=1):
    from apps.reminders.models import ReminderStatus

    reminder.status = ReminderStatus.SNOOZED
    reminder.snooze_count += 1
    reminder.due_at = reminder.due_at + timedelta(days=days)
    reminder.save(update_fields=["status", "snooze_count", "due_at", "updated_at"])
    if reminder.snooze_count >= 3:
        create_score_event(
            reminder.person,
            ScoreEventType.REPEATED_MISS,
            -5,
            "Reminder snoozed several times",
        )
    return reminder


def missed_window_count(person, now):
    if not person.next_goal_due_at or person.next_goal_due_at >= now:
        return 0

    count = 0
    due_at = person.next_goal_due_at
    while due_at < now and count < 10:
        count += 1
        due_at += timedelta(days=person.cadence_days)
    return count


@transaction.atomic
def apply_missed_goal_check(person):
    now = timezone.now()
    missed_windows = missed_window_count(person, now)
    if not missed_windows:
        return None

    previous_disconnection_streak = person.disconnection_streak
    person.current_streak = 0
    person.disconnection_streak = min(10, person.disconnection_streak + missed_windows)
    person.plant_growth = 0 if person.disconnection_streak >= 10 else max(0, person.plant_growth - (10 * missed_windows))
    person.next_goal_due_at = person.next_goal_due_at + timedelta(days=person.cadence_days * missed_windows)
    person.save(
        update_fields=[
            "current_streak",
            "disconnection_streak",
            "plant_growth",
            "next_goal_due_at",
            "relationship_health",
            "plant_type",
            "updated_at",
        ]
    )

    if person.disconnection_streak >= 10 and previous_disconnection_streak < 10:
        return create_score_event(
            person,
            ScoreEventType.PROLONGED_INACTIVITY,
            -8,
            "Ten missed cadence windows; plant returned to seed",
        )

    if previous_disconnection_streak == 0:
        return create_score_event(
            person,
            ScoreEventType.MISSED_GOAL,
            -1,
            "Goal window passed; small nudge only",
        )

    return create_score_event(
        person,
        ScoreEventType.REPEATED_MISS,
        -5,
        "Repeated missed cadence window",
    )


def refresh_overdue_people_for_user(user):
    from apps.people.models import Person

    now = timezone.now()
    for person in Person.objects.filter(user=user, next_goal_due_at__lt=now):
        apply_missed_goal_check(person)
