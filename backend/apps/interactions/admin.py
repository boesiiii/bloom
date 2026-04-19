from django.contrib import admin

from .models import InteractionJournalEntry, InteractionParticipant, InteractionTag, InteractionTagMap


class InteractionTagMapInline(admin.TabularInline):
    model = InteractionTagMap
    extra = 0


class InteractionParticipantInline(admin.TabularInline):
    model = InteractionParticipant
    extra = 0


@admin.register(InteractionJournalEntry)
class InteractionJournalEntryAdmin(admin.ModelAdmin):
    list_display = ("title", "person", "user", "interaction_type", "mood", "interaction_date", "was_meaningful")
    list_filter = ("interaction_type", "mood", "was_meaningful", "follow_up_needed")
    search_fields = ("title", "body", "person__name", "participants__name", "user__email")
    inlines = [InteractionParticipantInline, InteractionTagMapInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(InteractionTag)
class InteractionTagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(InteractionTagMap)
class InteractionTagMapAdmin(admin.ModelAdmin):
    list_display = ("interaction", "tag")


@admin.register(InteractionParticipant)
class InteractionParticipantAdmin(admin.ModelAdmin):
    list_display = ("interaction", "person", "created_at")
    search_fields = ("interaction__title", "person__name")
