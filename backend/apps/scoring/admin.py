from django.contrib import admin

from .models import RelationshipScoreEvent


@admin.register(RelationshipScoreEvent)
class RelationshipScoreEventAdmin(admin.ModelAdmin):
    list_display = ("person", "user", "event_type", "points_delta", "reason", "created_at")
    list_filter = ("event_type",)
    search_fields = ("person__name", "reason", "user__email")
