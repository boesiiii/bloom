from django.contrib import admin

from .models import InteractionJournalEntry, InteractionTag, InteractionTagMap


class InteractionTagMapInline(admin.TabularInline):
    model = InteractionTagMap
    extra = 0


@admin.register(InteractionJournalEntry)
class InteractionJournalEntryAdmin(admin.ModelAdmin):
    list_display = ("title", "person", "user", "interaction_type", "mood", "interaction_date", "was_meaningful")
    list_filter = ("interaction_type", "mood", "was_meaningful", "follow_up_needed")
    search_fields = ("title", "body", "person__name", "user__email")
    inlines = [InteractionTagMapInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(InteractionTag)
class InteractionTagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(InteractionTagMap)
class InteractionTagMapAdmin(admin.ModelAdmin):
    list_display = ("interaction", "tag")
