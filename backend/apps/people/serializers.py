from collections import defaultdict

from rest_framework import serializers

from apps.scoring.services import plant_state_for_person

from .models import Person, PersonProfileDetail


class PersonProfileDetailSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = PersonProfileDetail
        fields = ("id", "person", "category", "category_label", "value", "created_at", "updated_at")
        read_only_fields = ("id", "person", "created_at", "updated_at")


class PersonBriefSerializer(serializers.ModelSerializer):
    is_overdue = serializers.BooleanField(read_only=True)
    plant = serializers.SerializerMethodField()

    class Meta:
        model = Person
        fields = (
            "id",
            "name",
            "nickname",
            "relationship_type",
            "avatar_url",
            "contact_frequency",
            "plant_type",
            "relationship_points",
            "relationship_health",
            "plant_growth",
            "current_streak",
            "disconnection_streak",
            "last_interaction_at",
            "next_goal_due_at",
            "is_overdue",
            "plant",
        )

    def get_plant(self, obj):
        return {"type": obj.plant_type, **plant_state_for_person(obj)}


class PersonSerializer(serializers.ModelSerializer):
    profile_details = PersonProfileDetailSerializer(many=True, read_only=True)
    profile_details_grouped = serializers.SerializerMethodField()
    recent_interactions = serializers.SerializerMethodField()
    reminders = serializers.SerializerMethodField()
    score_events = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    plant = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Person
        fields = (
            "id",
            "name",
            "nickname",
            "relationship_type",
            "birthday",
            "avatar_url",
            "notes_summary",
            "is_favorite",
            "contact_frequency",
            "plant_type",
            "relationship_points",
            "relationship_health",
            "plant_growth",
            "current_streak",
            "disconnection_streak",
            "longest_streak",
            "last_interaction_at",
            "next_goal_due_at",
            "created_at",
            "updated_at",
            "is_overdue",
            "summary",
            "plant",
            "profile_details",
            "profile_details_grouped",
            "recent_interactions",
            "reminders",
            "score_events",
        )
        read_only_fields = (
            "id",
            "plant_type",
            "relationship_health",
            "plant_growth",
            "current_streak",
            "disconnection_streak",
            "longest_streak",
            "last_interaction_at",
            "next_goal_due_at",
            "created_at",
            "updated_at",
        )

    def get_profile_details_grouped(self, obj):
        grouped = defaultdict(list)
        for detail in obj.profile_details.all():
            grouped[detail.category].append(detail.value)
        return grouped

    def get_recent_interactions(self, obj):
        entries = []
        for interaction in obj.interactions.all()[:5]:
            participants = list(interaction.participants.all())
            if not participants:
                participants = [interaction.person]
            entries.append(
                {
                    "id": interaction.id,
                    "person": interaction.person_id,
                    "person_detail": {"id": interaction.person_id, "name": interaction.person.name},
                    "participant_ids": [person.id for person in participants],
                    "participant_details": [
                        {
                            "id": person.id,
                            "name": person.name,
                            "nickname": person.nickname,
                            "avatar_url": person.avatar_url,
                            "relationship_type": person.relationship_type,
                            "contact_frequency": person.contact_frequency,
                            "plant_type": person.plant_type,
                            "relationship_health": person.relationship_health,
                        }
                        for person in participants
                    ],
                    "interaction_type": interaction.interaction_type,
                    "title": interaction.title,
                    "body": interaction.body,
                    "mood": interaction.mood,
                    "interaction_date": interaction.interaction_date,
                    "was_meaningful": interaction.was_meaningful,
                    "follow_up_needed": interaction.follow_up_needed,
                    "follow_up_completed_at": interaction.follow_up_completed_at,
                }
            )
        return entries

    def get_reminders(self, obj):
        return [
            {
                "id": reminder.id,
                "text": reminder.text,
                "due_at": reminder.due_at,
                "status": reminder.status,
                "repeat": reminder.repeat,
                "kind": reminder.kind,
                "snooze_count": reminder.snooze_count,
            }
            for reminder in obj.reminders.all()[:5]
        ]

    def get_score_events(self, obj):
        return [
            {
                "id": event.id,
                "event_type": event.event_type,
                "points_delta": event.points_delta,
                "reason": event.reason,
                "created_at": event.created_at,
            }
            for event in obj.score_events.all()[:6]
        ]

    def get_summary(self, obj):
        details = list(obj.profile_details.all()[:3])
        summary = []
        if obj.notes_summary:
            summary.append(obj.notes_summary)
        summary.append(f"{obj.get_contact_frequency_display()} connection target")
        summary.extend(f"{detail.get_category_display()}: {detail.value}" for detail in details)
        return summary[:4]

    def get_plant(self, obj):
        return {"type": obj.plant_type, **plant_state_for_person(obj)}
