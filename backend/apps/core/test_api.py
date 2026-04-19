from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.interactions.models import InteractionJournalEntry
from apps.people.models import Person
from apps.reminders.models import Reminder, ReminderKind, ReminderRepeat, ReminderStatus
from apps.scoring.services import apply_missed_goal_check


class RelationshipApiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(email="test@example.com", password="pass12345", name="Test User")
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_create_person_assigns_plant_and_health(self):
        response = self.client.post("/api/v1/people", {"name": "Alex", "contact_frequency": "daily"}, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["plant_type"], "sunflower")
        self.assertEqual(response.data["relationship_points"], 50)
        self.assertEqual(response.data["relationship_health"], "needs_attention")
        self.assertEqual(response.data["plant_growth"], 0)
        self.assertEqual(response.data["plant"]["growth_stage"], "seed")

    def test_person_birthday_creates_yearly_reminder(self):
        response = self.client.post(
            "/api/v1/people",
            {"name": "Maya", "contact_frequency": "weekly", "birthday": "1994-05-12"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        reminder = Reminder.objects.get(person_id=response.data["id"], kind=ReminderKind.BIRTHDAY)
        self.assertEqual(reminder.text, "Maya's birthday")
        self.assertEqual(reminder.repeat, ReminderRepeat.YEARLY)
        self.assertEqual(reminder.status, ReminderStatus.PENDING)
        self.assertEqual(timezone.localtime(reminder.due_at).date().month, 5)
        self.assertEqual(timezone.localtime(reminder.due_at).date().day, 12)

    def test_removing_birthday_deletes_auto_birthday_reminder(self):
        response = self.client.post(
            "/api/v1/people",
            {"name": "Maya", "contact_frequency": "weekly", "birthday": "1994-05-12"},
            format="json",
        )
        person_id = response.data["id"]
        self.assertTrue(Reminder.objects.filter(person_id=person_id, kind=ReminderKind.BIRTHDAY).exists())

        self.client.patch(f"/api/v1/people/{person_id}", {"birthday": None}, format="json")

        self.assertFalse(Reminder.objects.filter(person_id=person_id, kind=ReminderKind.BIRTHDAY).exists())

    def test_interaction_logging_updates_points_and_next_due_date(self):
        person = Person.objects.create(user=self.user, name="Nina", contact_frequency="weekly")
        before = person.relationship_points
        response = self.client.post(
            "/api/v1/interactions",
            {
                "person": person.id,
                "interaction_type": "call",
                "title": "Weekly call",
                "body": "Talked about her new role.",
                "mood": "positive",
                "interaction_date": timezone.now().isoformat(),
                "was_meaningful": True,
                "follow_up_needed": False,
                "tag_names": ["career"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        person.refresh_from_db()
        self.assertGreater(person.relationship_points, before)
        self.assertEqual(person.plant_growth, 1)
        self.assertEqual(person.disconnection_streak, 0)
        self.assertGreater(person.next_goal_due_at, timezone.now() + timedelta(days=6))

    def test_group_interaction_tracks_multiple_people(self):
        anna = Person.objects.create(user=self.user, name="Anna", contact_frequency="weekly")
        tom = Person.objects.create(user=self.user, name="Tom", contact_frequency="weekly")
        response = self.client.post(
            "/api/v1/interactions",
            {
                "person": anna.id,
                "participant_ids": [anna.id, tom.id],
                "interaction_type": "event",
                "title": "Group hangout",
                "body": "Coffee and a walk together.",
                "mood": "happy",
                "interaction_date": timezone.now().isoformat(),
                "was_meaningful": True,
                "follow_up_needed": False,
                "tag_names": ["group"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(set(response.data["participant_ids"]), {anna.id, tom.id})
        self.assertEqual(len(response.data["participant_details"]), 2)
        anna.refresh_from_db()
        tom.refresh_from_db()
        self.assertGreater(anna.relationship_points, 50)
        self.assertGreater(tom.relationship_points, 50)

    def test_missed_windows_decay_plant_until_restart(self):
        person = Person.objects.create(
            user=self.user,
            name="Lena",
            contact_frequency="daily",
            current_streak=80,
            plant_growth=80,
            next_goal_due_at=timezone.now() - timedelta(days=3, minutes=1),
        )

        apply_missed_goal_check(person)

        person.refresh_from_db()
        self.assertEqual(person.current_streak, 0)
        self.assertEqual(person.disconnection_streak, 4)
        self.assertEqual(person.plant_growth, 40)

        person.next_goal_due_at = timezone.now() - timedelta(days=10, minutes=1)
        person.save(update_fields=["next_goal_due_at"])

        apply_missed_goal_check(person)

        person.refresh_from_db()
        self.assertEqual(person.disconnection_streak, 10)
        self.assertEqual(person.plant_growth, 0)

    def test_complete_interaction_follow_up(self):
        person = Person.objects.create(user=self.user, name="Maya", contact_frequency="weekly")
        interaction = InteractionJournalEntry.objects.create(
            user=self.user,
            person=person,
            interaction_type="text",
            title="Voice note",
            body="Needs a reply tomorrow.",
            mood="neutral",
            follow_up_needed=True,
        )

        response = self.client.post(f"/api/v1/interactions/{interaction.id}/complete-follow-up", {}, format="json")

        self.assertEqual(response.status_code, 200)
        interaction.refresh_from_db()
        self.assertFalse(interaction.follow_up_needed)
        self.assertIsNotNone(interaction.follow_up_completed_at)
        self.assertIsNotNone(response.data["follow_up_completed_at"])

    def test_yearly_reminder_completion_reschedules_next_year(self):
        person = Person.objects.create(user=self.user, name="Dad", birthday=date(1970, 4, 18))
        reminder = Reminder.objects.create(
            user=self.user,
            person=person,
            text="Dad's birthday",
            due_at=timezone.now() - timedelta(hours=1),
            repeat=ReminderRepeat.YEARLY,
            kind=ReminderKind.BIRTHDAY,
        )

        response = self.client.post(f"/api/v1/reminders/{reminder.id}/complete", {}, format="json")

        self.assertEqual(response.status_code, 200)
        reminder.refresh_from_db()
        self.assertEqual(reminder.status, ReminderStatus.PENDING)
        self.assertGreater(reminder.due_at, timezone.now() + timedelta(days=300))
        self.assertIsNotNone(reminder.completed_at)

    def test_home_endpoint_returns_dashboard_sections(self):
        Person.objects.create(user=self.user, name="Mira", contact_frequency="monthly")
        response = self.client.get("/api/v1/home")

        self.assertEqual(response.status_code, 200)
        self.assertIn("today_focus", response.data)
        self.assertIn("relationship_health_summary", response.data)
        self.assertIn("reminders_widget", response.data)
        self.assertIn("needs_follow_up_widget", response.data)
        self.assertIn("garden_preview", response.data)
