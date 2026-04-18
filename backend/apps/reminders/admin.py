from django.contrib import admin

from .models import Reminder


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ("text", "person", "user", "due_at", "status", "repeat", "kind", "snooze_count")
    list_filter = ("status", "repeat", "kind")
    search_fields = ("text", "person__name", "user__email")
    readonly_fields = ("created_at", "updated_at", "completed_at")
