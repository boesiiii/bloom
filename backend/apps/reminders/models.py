from django.conf import settings
from django.db import models


class ReminderRepeat(models.TextChoices):
    NONE = "none", "None"
    DAILY = "daily", "Daily"
    WEEKLY = "weekly", "Weekly"
    BIWEEKLY = "biweekly", "Bi-weekly"
    MONTHLY = "monthly", "Monthly"
    YEARLY = "yearly", "Yearly"


class ReminderStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    DONE = "done", "Done"
    SNOOZED = "snoozed", "Snoozed"
    MISSED = "missed", "Missed"


class ReminderKind(models.TextChoices):
    CUSTOM = "custom", "Custom"
    BIRTHDAY = "birthday", "Birthday"


class Reminder(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reminders")
    person = models.ForeignKey("people.Person", on_delete=models.CASCADE, related_name="reminders")
    interaction = models.ForeignKey(
        "interactions.InteractionJournalEntry",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reminders",
    )
    text = models.CharField(max_length=220)
    due_at = models.DateTimeField()
    repeat = models.CharField(max_length=20, choices=ReminderRepeat.choices, default=ReminderRepeat.NONE)
    status = models.CharField(max_length=20, choices=ReminderStatus.choices, default=ReminderStatus.PENDING)
    kind = models.CharField(max_length=24, choices=ReminderKind.choices, default=ReminderKind.CUSTOM)
    completed_at = models.DateTimeField(null=True, blank=True)
    snooze_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("status", "due_at")
        indexes = [
            models.Index(fields=["user", "status", "due_at"]),
            models.Index(fields=["person", "due_at"]),
            models.Index(fields=["person", "kind"]),
        ]

    def __str__(self):
        return f"{self.person}: {self.text}"
