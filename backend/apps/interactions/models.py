from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.utils import timezone


class InteractionType(models.TextChoices):
    IN_PERSON = "in_person", "In person"
    CALL = "call", "Call"
    TEXT = "text", "Text"
    VIDEO_CALL = "video_call", "Video call"
    EVENT = "event", "Event"
    GIFT = "gift", "Gift"
    OTHER = "other", "Other"


class Mood(models.TextChoices):
    POSITIVE = "positive", "Positive"
    NEUTRAL = "neutral", "Neutral"
    NEGATIVE = "negative", "Negative"
    STRESSED = "stressed", "Stressed"
    HAPPY = "happy", "Happy"
    SAD = "sad", "Sad"
    ANXIOUS = "anxious", "Anxious"


class InteractionJournalEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="interactions")
    person = models.ForeignKey("people.Person", on_delete=models.CASCADE, related_name="interactions")
    interaction_type = models.CharField(
        max_length=24,
        choices=InteractionType.choices,
        default=InteractionType.TEXT,
    )
    title = models.CharField(max_length=180)
    body = models.TextField(blank=True)
    mood = models.CharField(max_length=20, choices=Mood.choices, default=Mood.NEUTRAL)
    interaction_date = models.DateTimeField(default=timezone.now)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    was_meaningful = models.BooleanField(default=True)
    follow_up_needed = models.BooleanField(default=False)
    follow_up_completed_at = models.DateTimeField(null=True, blank=True)
    tags = models.ManyToManyField("InteractionTag", through="InteractionTagMap", related_name="interactions")
    participants = models.ManyToManyField(
        "people.Person",
        through="InteractionParticipant",
        related_name="journal_entries",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-interaction_date", "-created_at")
        indexes = [
            models.Index(fields=["user", "interaction_date"]),
            models.Index(fields=["person", "interaction_date"]),
        ]

    def __str__(self):
        return f"{self.person} - {self.title}"


class InteractionTag(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True, blank=True)

    class Meta:
        ordering = ("name",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class InteractionTagMap(models.Model):
    interaction = models.ForeignKey(InteractionJournalEntry, on_delete=models.CASCADE)
    tag = models.ForeignKey(InteractionTag, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("interaction", "tag")

    def __str__(self):
        return f"{self.interaction_id}:{self.tag}"


class InteractionParticipant(models.Model):
    interaction = models.ForeignKey(InteractionJournalEntry, on_delete=models.CASCADE)
    person = models.ForeignKey("people.Person", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("interaction", "person")
        indexes = [
            models.Index(fields=["person", "interaction"]),
        ]

    def __str__(self):
        return f"{self.interaction_id}:{self.person_id}"
