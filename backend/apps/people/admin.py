from django.contrib import admin

from .models import Person, PersonProfileDetail


class PersonProfileDetailInline(admin.TabularInline):
    model = PersonProfileDetail
    extra = 0


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "user",
        "relationship_type",
        "contact_frequency",
        "plant_type",
        "plant_growth",
        "relationship_points",
        "relationship_health",
        "current_streak",
        "disconnection_streak",
        "next_goal_due_at",
    )
    list_filter = ("relationship_type", "contact_frequency", "plant_type", "relationship_health", "is_favorite")
    search_fields = ("name", "nickname", "notes_summary", "user__email")
    inlines = [PersonProfileDetailInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(PersonProfileDetail)
class PersonProfileDetailAdmin(admin.ModelAdmin):
    list_display = ("person", "category", "value")
    list_filter = ("category",)
    search_fields = ("person__name", "value")
