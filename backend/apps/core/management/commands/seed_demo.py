from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.interactions.models import InteractionJournalEntry, InteractionTag, InteractionTagMap
from apps.people.models import Person, PersonProfileDetail
from apps.reminders.models import Reminder
from apps.scoring.models import RelationshipScoreEvent, ScoreEventType


class Command(BaseCommand):
    help = "Create a demo account and relationship garden data."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete the demo account before reseeding.")

    def handle(self, *args, **options):
        User = get_user_model()
        email = "demo@example.com"
        password = "demo12345"

        if options["reset"]:
            User.objects.filter(email=email).delete()

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"name": "Demo Friend"},
        )
        if created:
            user.set_password(password)
            user.save()

        now = timezone.now()
        people_specs = [
            {
                "name": "Anna",
                "relationship_type": "friend",
                "contact_frequency": "weekly",
                "relationship_points": 72,
                "current_streak": 3,
                "longest_streak": 7,
                "last_interaction_at": now - timedelta(days=4),
                "notes_summary": "Likes low-key plans and thoughtful check-ins.",
                "details": [("like", "sushi"), ("hobby", "yoga"), ("topic", "job interview"), ("preference", "quiet cafes")],
                "interactions": [
                    ("in_person", "Coffee after work", "She seemed stressed about the interview next week.", "stressed", 4, True, True, ["coffee", "interview"]),
                    ("text", "Sent article", "Shared the article about focus rituals.", "positive", 8, False, False, ["work"]),
                ],
                "reminders": [("Ask about interview", now + timedelta(days=2), "pending")],
                "events": [("cadence_goal_met", 8, "Weekly interaction logged within target window"), ("interaction_logged", 5, "Meaningful coffee catch-up")],
            },
            {
                "name": "Tom",
                "relationship_type": "friend",
                "contact_frequency": "biweekly",
                "relationship_points": 48,
                "current_streak": 0,
                "longest_streak": 4,
                "last_interaction_at": now - timedelta(days=18),
                "next_goal_due_at": now - timedelta(days=4),
                "notes_summary": "Football fan; easier to reconnect with a specific match or plan.",
                "details": [("hobby", "football"), ("like", "spicy ramen"), ("topic", "new apartment")],
                "interactions": [
                    ("call", "Quick phone check-in", "Caught up about moving boxes and weekend plans.", "neutral", 18, True, False, ["moving"]),
                ],
                "reminders": [("Send moving-in message", now - timedelta(days=1), "snoozed")],
                "events": [("missed_goal", -1, "First missed cadence window"), ("repeated_miss", -5, "Follow-up slipped more than once")],
            },
            {
                "name": "Sarah",
                "relationship_type": "family",
                "contact_frequency": "monthly",
                "relationship_points": 85,
                "current_streak": 5,
                "longest_streak": 5,
                "last_interaction_at": now - timedelta(days=10),
                "notes_summary": "A calm monthly rhythm works well.",
                "details": [("like", "cats"), ("preference", "quiet places"), ("gift_idea", "plant book")],
                "interactions": [
                    ("video_call", "Sunday video call", "Talked about the balcony garden and summer plans.", "happy", 10, True, False, ["family", "plants"]),
                ],
                "reminders": [("Share balcony photo", now + timedelta(days=9), "pending")],
                "events": [("streak_bonus", 10, "Three healthy cadence intervals in a row"), ("cadence_goal_met", 8, "Monthly rhythm kept")],
            },
            {
                "name": "Dad",
                "relationship_type": "family",
                "contact_frequency": "weekly",
                "relationship_points": 65,
                "current_streak": 2,
                "longest_streak": 6,
                "last_interaction_at": now - timedelta(days=6),
                "birthday": now.date() + timedelta(days=15),
                "notes_summary": "Likes practical updates and short calls.",
                "details": [("important_date", "Birthday soon"), ("food", "apple pie"), ("topic", "doctor appointment")],
                "interactions": [
                    ("call", "Sunday call", "Short call about appointments and the garden.", "positive", 6, True, False, ["family"]),
                ],
                "reminders": [("Plan birthday call", now + timedelta(days=7), "pending")],
                "events": [("interaction_logged", 5, "Meaningful call logged")],
            },
            {
                "name": "Maya",
                "relationship_type": "partner",
                "contact_frequency": "daily",
                "relationship_points": 34,
                "current_streak": 0,
                "longest_streak": 9,
                "last_interaction_at": now - timedelta(days=3),
                "next_goal_due_at": now - timedelta(days=2),
                "notes_summary": "Daily connection matters; tiny moments count.",
                "details": [("like", "morning walks"), ("dislike", "last-minute plan changes"), ("preference", "voice notes")],
                "interactions": [
                    ("text", "Voice note", "Sent a quick voice note after work.", "anxious", 3, False, True, ["check-in"]),
                ],
                "reminders": [("Make a warm check-in", now - timedelta(hours=6), "pending")],
                "events": [("repeated_miss", -5, "Repeated missed daily check-ins"), ("prolonged_inactivity", -8, "Long gap for a daily cadence")],
            },
        ]

        for spec in people_specs:
            next_due = spec.get("next_goal_due_at") or spec["last_interaction_at"] + timedelta(days={"daily": 1, "weekly": 7, "biweekly": 14, "monthly": 30}[spec["contact_frequency"]])
            person, _ = Person.objects.update_or_create(
                user=user,
                name=spec["name"],
                defaults={
                    "relationship_type": spec["relationship_type"],
                    "contact_frequency": spec["contact_frequency"],
                    "relationship_points": spec["relationship_points"],
                    "current_streak": spec["current_streak"],
                    "longest_streak": spec["longest_streak"],
                    "last_interaction_at": spec["last_interaction_at"],
                    "next_goal_due_at": next_due,
                    "notes_summary": spec["notes_summary"],
                    "birthday": spec.get("birthday"),
                },
            )

            PersonProfileDetail.objects.filter(person=person).delete()
            for category, value in spec["details"]:
                PersonProfileDetail.objects.create(person=person, category=category, value=value)

            InteractionJournalEntry.objects.filter(person=person).delete()
            for interaction_type, title, body, mood, days_ago, meaningful, follow_up, tags in spec["interactions"]:
                interaction = InteractionJournalEntry.objects.create(
                    user=user,
                    person=person,
                    interaction_type=interaction_type,
                    title=title,
                    body=body,
                    mood=mood,
                    interaction_date=now - timedelta(days=days_ago),
                    was_meaningful=meaningful,
                    follow_up_needed=follow_up,
                )
                for tag_name in tags:
                    tag, _ = InteractionTag.objects.get_or_create(name=tag_name, defaults={"slug": tag_name.replace(" ", "-")})
                    InteractionTagMap.objects.get_or_create(interaction=interaction, tag=tag)

            Reminder.objects.filter(person=person).delete()
            for text, due_at, status in spec["reminders"]:
                Reminder.objects.create(user=user, person=person, text=text, due_at=due_at, status=status)

            RelationshipScoreEvent.objects.filter(person=person).delete()
            for event_type, delta, reason in spec["events"]:
                RelationshipScoreEvent.objects.create(
                    user=user,
                    person=person,
                    event_type=getattr(ScoreEventType, event_type.upper(), event_type),
                    points_delta=delta,
                    reason=reason,
                )

        self.stdout.write(self.style.SUCCESS("Seeded demo account: demo@example.com / demo12345"))
