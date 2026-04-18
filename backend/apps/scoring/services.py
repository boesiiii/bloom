from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from .models import RelationshipScoreEvent, ScoreEventType


def clamp_points(value):
    return max(0, min(100, int(value)))


def plant_state_for_points(points):
    if points >= 80:
        return {"growth_stage": "blooming", "bloom_state": "blooming", "tone": "bright"}
    if points >= 60:
        return {"growth_stage": "growing", "bloom_state": "budding", "tone": "fresh"}
    if points >= 40:
        return {"growth_stage": "sprout", "bloom_state": "none", "tone": "steady"}
    if points >= 20:
        return {"growth_stage": "wilting", "bloom_state": "faded", "tone": "soft"}
    return {"growth_stage": "seed", "bloom_state": "none", "tone": "dormant"}


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
    person = interaction.person
    met_cadence = interval_was_met(person, interaction.interaction_date)

    person.last_interaction_at = interaction.interaction_date
    person.next_goal_due_at = person.calculate_next_goal_due(interaction.interaction_date)

    if met_cadence:
        person.current_streak += 1
        person.longest_streak = max(person.longest_streak, person.current_streak)
    else:
        person.current_streak = 1

    person.save(
        update_fields=[
            "last_interaction_at",
            "next_goal_due_at",
            "current_streak",
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


@transaction.atomic
def complete_reminder(reminder):
    from apps.reminders.models import ReminderStatus

    reminder.status = ReminderStatus.DONE
    reminder.completed_at = timezone.now()
    reminder.save(update_fields=["status", "completed_at", "updated_at"])
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


@transaction.atomic
def apply_missed_goal_check(person):
    if not person.next_goal_due_at or person.next_goal_due_at >= timezone.now():
        return None

    missed_events = person.score_events.filter(
        event_type__in=[ScoreEventType.MISSED_GOAL, ScoreEventType.REPEATED_MISS],
        created_at__gte=person.next_goal_due_at,
    ).count()

    if missed_events == 0:
        return create_score_event(
            person,
            ScoreEventType.MISSED_GOAL,
            -1,
            "Goal window passed; small nudge only",
        )

    person.current_streak = 0
    person.next_goal_due_at = timezone.now() + timedelta(days=max(1, person.cadence_days // 2))
    person.save(update_fields=["current_streak", "next_goal_due_at", "relationship_health", "plant_type", "updated_at"])
    return create_score_event(
        person,
        ScoreEventType.REPEATED_MISS,
        -5,
        "Repeated missed cadence window",
    )
