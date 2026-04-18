from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class RelationshipType(models.TextChoices):
    FRIEND = "friend", "Friend"
    FAMILY = "family", "Family"
    WORK = "work", "Work"
    PARTNER = "partner", "Partner"
    OTHER = "other", "Other"


class ContactFrequency(models.TextChoices):
    DAILY = "daily", "Daily"
    WEEKLY = "weekly", "Weekly"
    BIWEEKLY = "biweekly", "Bi-weekly"
    MONTHLY = "monthly", "Monthly"


class PlantType(models.TextChoices):
    SUNFLOWER = "sunflower", "Sunflower"
    TULIP = "tulip", "Tulip"
    ORCHID = "orchid", "Orchid"
    CACTUS = "cactus", "Cactus"


class RelationshipHealth(models.TextChoices):
    THRIVING = "thriving", "Thriving"
    HEALTHY = "healthy", "Healthy"
    NEEDS_ATTENTION = "needs_attention", "Needs attention"
    AT_RISK = "at_risk", "At risk"
    DORMANT = "dormant", "Dormant"


class ProfileDetailCategory(models.TextChoices):
    HOBBY = "hobby", "Hobby"
    LIKE = "like", "Like"
    DISLIKE = "dislike", "Dislike"
    FOOD = "food", "Food"
    TRAIT = "trait", "Trait"
    GIFT_IDEA = "gift_idea", "Gift idea"
    IMPORTANT_DATE = "important_date", "Important date"
    TOPIC = "topic", "Topic"
    HABIT = "habit", "Habit"
    PREFERENCE = "preference", "Preference"
    ALLERGY = "allergy", "Allergy"
    OTHER = "other", "Other"


PLANT_BY_FREQUENCY = {
    ContactFrequency.DAILY: PlantType.SUNFLOWER,
    ContactFrequency.WEEKLY: PlantType.TULIP,
    ContactFrequency.BIWEEKLY: PlantType.ORCHID,
    ContactFrequency.MONTHLY: PlantType.CACTUS,
}

CADENCE_DAYS = {
    ContactFrequency.DAILY: 1,
    ContactFrequency.WEEKLY: 7,
    ContactFrequency.BIWEEKLY: 14,
    ContactFrequency.MONTHLY: 30,
}


class Person(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="people")
    name = models.CharField(max_length=160)
    nickname = models.CharField(max_length=160, blank=True)
    relationship_type = models.CharField(
        max_length=20,
        choices=RelationshipType.choices,
        default=RelationshipType.FRIEND,
    )
    birthday = models.DateField(null=True, blank=True)
    avatar_url = models.URLField(blank=True)
    notes_summary = models.TextField(blank=True)
    is_favorite = models.BooleanField(default=False)
    contact_frequency = models.CharField(
        max_length=20,
        choices=ContactFrequency.choices,
        default=ContactFrequency.WEEKLY,
    )
    plant_type = models.CharField(
        max_length=20,
        choices=PlantType.choices,
        default=PlantType.TULIP,
    )
    relationship_points = models.PositiveSmallIntegerField(default=50)
    relationship_health = models.CharField(
        max_length=24,
        choices=RelationshipHealth.choices,
        default=RelationshipHealth.NEEDS_ATTENTION,
    )
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_interaction_at = models.DateTimeField(null=True, blank=True)
    next_goal_due_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-is_favorite", "name")
        indexes = [
            models.Index(fields=["user", "name"]),
            models.Index(fields=["relationship_health"]),
            models.Index(fields=["next_goal_due_at"]),
        ]

    def __str__(self):
        return self.name

    @property
    def display_name(self):
        return self.nickname or self.name

    @property
    def is_overdue(self):
        return bool(self.next_goal_due_at and self.next_goal_due_at < timezone.now())

    @property
    def cadence_days(self):
        return CADENCE_DAYS.get(self.contact_frequency, 7)

    def calculate_next_goal_due(self, from_date=None):
        anchor = from_date or self.last_interaction_at or timezone.now()
        return anchor + timedelta(days=self.cadence_days)

    @staticmethod
    def health_for_points(points):
        if points >= 80:
            return RelationshipHealth.THRIVING
        if points >= 60:
            return RelationshipHealth.HEALTHY
        if points >= 40:
            return RelationshipHealth.NEEDS_ATTENTION
        if points >= 20:
            return RelationshipHealth.AT_RISK
        return RelationshipHealth.DORMANT

    def save(self, *args, **kwargs):
        self.plant_type = PLANT_BY_FREQUENCY.get(self.contact_frequency, PlantType.TULIP)
        self.relationship_points = max(0, min(100, int(self.relationship_points or 0)))
        self.relationship_health = self.health_for_points(self.relationship_points)
        if not self.next_goal_due_at:
            self.next_goal_due_at = self.calculate_next_goal_due()
        super().save(*args, **kwargs)


class PersonProfileDetail(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="profile_details")
    category = models.CharField(
        max_length=32,
        choices=ProfileDetailCategory.choices,
        default=ProfileDetailCategory.OTHER,
    )
    value = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("category", "value")
        indexes = [models.Index(fields=["category"])]

    def __str__(self):
        return f"{self.person}: {self.category}={self.value}"
