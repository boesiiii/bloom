from rest_framework import serializers

from .models import RelationshipScoreEvent


class RelationshipScoreEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelationshipScoreEvent
        fields = ("id", "person", "event_type", "points_delta", "reason", "created_at")
