from django.utils.text import slugify
from rest_framework import serializers

from apps.people.models import Person
from apps.people.serializers import PersonBriefSerializer

from .models import InteractionJournalEntry, InteractionTag, InteractionTagMap


class InteractionTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteractionTag
        fields = ("id", "name", "slug")


class InteractionJournalEntrySerializer(serializers.ModelSerializer):
    person_detail = PersonBriefSerializer(source="person", read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=80),
        write_only=True,
        required=False,
    )
    tags = InteractionTagSerializer(many=True, read_only=True)

    class Meta:
        model = InteractionJournalEntry
        fields = (
            "id",
            "user",
            "person",
            "person_detail",
            "interaction_type",
            "title",
            "body",
            "mood",
            "interaction_date",
            "duration_minutes",
            "was_meaningful",
            "follow_up_needed",
            "tags",
            "tag_names",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")

    def validate_person(self, person):
        request = self.context["request"]
        if person.user_id != request.user.id:
            raise serializers.ValidationError("Person does not belong to the current user.")
        return person

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        validated_data["user"] = self.context["request"].user
        interaction = super().create(validated_data)
        self._sync_tags(interaction, tag_names)
        return interaction

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        interaction = super().update(instance, validated_data)
        if tag_names is not None:
            self._sync_tags(interaction, tag_names)
        return interaction

    def _sync_tags(self, interaction, tag_names):
        normalized = [name.strip() for name in tag_names if name and name.strip()]
        interaction.tags.clear()
        for name in normalized:
            tag, _ = InteractionTag.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name},
            )
            InteractionTagMap.objects.get_or_create(interaction=interaction, tag=tag)


class FastInteractionSerializer(serializers.Serializer):
    person = serializers.PrimaryKeyRelatedField(queryset=Person.objects.all())
    body = serializers.CharField(allow_blank=True, required=False)

    def validate_person(self, person):
        request = self.context["request"]
        if person.user_id != request.user.id:
            raise serializers.ValidationError("Person does not belong to the current user.")
        return person
