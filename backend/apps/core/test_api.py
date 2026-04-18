from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.people.models import Person


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
        self.assertGreater(person.next_goal_due_at, timezone.now() + timedelta(days=6))

    def test_home_endpoint_returns_dashboard_sections(self):
        Person.objects.create(user=self.user, name="Mira", contact_frequency="monthly")
        response = self.client.get("/api/v1/home")

        self.assertEqual(response.status_code, 200)
        self.assertIn("today_focus", response.data)
        self.assertIn("relationship_health_summary", response.data)
        self.assertIn("garden_preview", response.data)
