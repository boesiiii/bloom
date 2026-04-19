from django.conf import settings
from django.db import models


class ScoreEventType(models.TextChoices):
    INTERACTION_LOGGED = "interaction_logged", "Interaction logged"
    CADENCE_GOAL_MET = "cadence_goal_met", "Cadence goal met"
    REMINDER_COMPLETED = "reminder_completed", "Reminder completed"
    STREAK_BONUS = "streak_bonus", "Streak bonus"
    PROFILE_ENRICHED = "profile_enriched", "Profile enriched"
    MISSED_GOAL = "missed_goal", "Missed goal"
    REPEATED_MISS = "repeated_miss", "Repeated miss"
    PROLONGED_INACTIVITY = "prolonged_inactivity", "Prolonged inactivity"
    RECOVERY_BONUS = "recovery_bonus", "Recovery bonus"


class RelationshipScoreEvent(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="score_events")
    person = models.ForeignKey("people.Person", on_delete=models.CASCADE, related_name="score_events")
    event_type = models.CharField(max_length=32, choices=ScoreEventType.choices)
    points_delta = models.SmallIntegerField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["person", "created_at"]),
            models.Index(fields=["event_type"]),
        ]

    def __str__(self):
        return f"{self.person} {self.points_delta:+} {self.event_type}"
