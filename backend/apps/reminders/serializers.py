from rest_framework import serializers

from apps.people.serializers import PersonBriefSerializer

from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    person_detail = PersonBriefSerializer(source="person", read_only=True)

    class Meta:
        model = Reminder
        fields = (
            "id",
            "user",
            "person",
            "person_detail",
            "interaction",
            "text",
            "due_at",
            "repeat",
            "status",
            "kind",
            "completed_at",
            "snooze_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "kind", "completed_at", "snooze_count", "created_at", "updated_at")

    def validate_person(self, person):
        request = self.context["request"]
        if person.user_id != request.user.id:
            raise serializers.ValidationError("Person does not belong to the current user.")
        return person

    def validate_interaction(self, interaction):
        if interaction is None:
            return interaction
        request = self.context["request"]
        if interaction.user_id != request.user.id:
            raise serializers.ValidationError("Interaction does not belong to the current user.")
        return interaction

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
