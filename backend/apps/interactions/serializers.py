from django.utils.text import slugify
from rest_framework import serializers

from apps.people.models import Person
from apps.people.serializers import PersonBriefSerializer

from .models import InteractionJournalEntry, InteractionParticipant, InteractionTag, InteractionTagMap


class InteractionTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteractionTag
        fields = ("id", "name", "slug")


class InteractionJournalEntrySerializer(serializers.ModelSerializer):
    person_detail = PersonBriefSerializer(source="person", read_only=True)
    participant_details = PersonBriefSerializer(source="participants", many=True, read_only=True)
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
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
            "participant_details",
            "participant_ids",
            "interaction_type",
            "title",
            "body",
            "mood",
            "interaction_date",
            "duration_minutes",
            "was_meaningful",
            "follow_up_needed",
            "follow_up_completed_at",
            "tags",
            "tag_names",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "follow_up_completed_at", "created_at", "updated_at")

    def validate_person(self, person):
        request = self.context["request"]
        if person.user_id != request.user.id:
            raise serializers.ValidationError("Person does not belong to the current user.")
        return person

    def validate_participant_ids(self, participant_ids):
        request = self.context["request"]
        normalized_ids = []
        for person_id in participant_ids:
            if person_id not in normalized_ids:
                normalized_ids.append(person_id)
        found_ids = set(Person.objects.filter(user=request.user, id__in=normalized_ids).values_list("id", flat=True))
        missing_ids = [person_id for person_id in normalized_ids if person_id not in found_ids]
        if missing_ids:
            raise serializers.ValidationError("All participants must belong to the current user.")
        return normalized_ids

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        participant_ids = validated_data.pop("participant_ids", None)
        validated_data["user"] = self.context["request"].user
        interaction = super().create(validated_data)
        self._sync_participants(interaction, participant_ids)
        self._sync_tags(interaction, tag_names)
        return interaction

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        participant_ids = validated_data.pop("participant_ids", None)
        interaction = super().update(instance, validated_data)
        if participant_ids is not None or "person" in validated_data:
            self._sync_participants(interaction, participant_ids)
        if tag_names is not None:
            self._sync_tags(interaction, tag_names)
        return interaction

    def to_representation(self, instance):
        data = super().to_representation(instance)
        participant_ids = list(instance.participants.values_list("id", flat=True))
        if instance.person_id not in participant_ids:
            participant_ids.insert(0, instance.person_id)
        data["participant_ids"] = participant_ids
        return data

    def _sync_tags(self, interaction, tag_names):
        normalized = [name.strip() for name in tag_names if name and name.strip()]
        interaction.tags.clear()
        for name in normalized:
            tag, _ = InteractionTag.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name},
            )
            InteractionTagMap.objects.get_or_create(interaction=interaction, tag=tag)

    def _sync_participants(self, interaction, participant_ids):
        ids = participant_ids if participant_ids is not None else []
        normalized_ids = [interaction.person_id]
        for person_id in ids:
            if person_id not in normalized_ids:
                normalized_ids.append(person_id)

        interaction.participants.clear()
        for person_id in normalized_ids:
            InteractionParticipant.objects.get_or_create(interaction=interaction, person_id=person_id)


class FastInteractionSerializer(serializers.Serializer):
    person = serializers.PrimaryKeyRelatedField(queryset=Person.objects.all())
    body = serializers.CharField(allow_blank=True, required=False)

    def validate_person(self, person):
        request = self.context["request"]
        if person.user_id != request.user.id:
            raise serializers.ValidationError("Person does not belong to the current user.")
        return person
