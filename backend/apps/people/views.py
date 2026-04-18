from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.scoring.serializers import RelationshipScoreEventSerializer
from apps.scoring.services import handle_profile_enriched, refresh_overdue_people_for_user
from apps.reminders.services import sync_birthday_reminder

from .models import Person, PersonProfileDetail
from .serializers import PersonProfileDetailSerializer, PersonSerializer


class PersonViewSet(viewsets.ModelViewSet):
    serializer_class = PersonSerializer

    def get_queryset(self):
        refresh_overdue_people_for_user(self.request.user)
        queryset = (
            Person.objects.filter(user=self.request.user)
            .prefetch_related("profile_details", "interactions__participants", "interactions__tags", "reminders", "score_events")
        )
        search = self.request.query_params.get("q")
        health = self.request.query_params.get("health")
        relationship_type = self.request.query_params.get("relationship_type")
        plant_type = self.request.query_params.get("plant_type")
        overdue = self.request.query_params.get("overdue")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(nickname__icontains=search)
                | Q(notes_summary__icontains=search)
                | Q(profile_details__value__icontains=search)
            ).distinct()
        if health:
            queryset = queryset.filter(relationship_health=health)
        if relationship_type:
            queryset = queryset.filter(relationship_type=relationship_type)
        if plant_type:
            queryset = queryset.filter(plant_type=plant_type)
        if overdue == "true":
            from django.utils import timezone

            queryset = queryset.filter(next_goal_due_at__lt=timezone.now())
        return queryset

    def perform_create(self, serializer):
        person = serializer.save(user=self.request.user)
        sync_birthday_reminder(person)

    def perform_update(self, serializer):
        person = serializer.save()
        sync_birthday_reminder(person)

    @action(detail=True, methods=["post"], url_path="details")
    def add_detail(self, request, pk=None):
        person = self.get_object()
        serializer = PersonProfileDetailSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        detail = serializer.save(person=person)
        handle_profile_enriched(person, detail)
        return Response(PersonProfileDetailSerializer(detail).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="score-events")
    def score_events(self, request, pk=None):
        person = self.get_object()
        serializer = RelationshipScoreEventSerializer(person.score_events.all(), many=True)
        return Response(serializer.data)


class PersonProfileDetailViewSet(viewsets.ModelViewSet):
    serializer_class = PersonProfileDetailSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return PersonProfileDetail.objects.filter(person__user=self.request.user).select_related("person")
