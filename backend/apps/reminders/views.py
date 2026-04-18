from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.scoring.services import complete_reminder, snooze_reminder

from .models import Reminder
from .serializers import ReminderSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer

    def get_queryset(self):
        queryset = Reminder.objects.filter(user=self.request.user).select_related("person", "interaction")
        person_id = self.request.query_params.get("person")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("q")
        if person_id:
            queryset = queryset.filter(person_id=person_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(Q(text__icontains=search) | Q(person__name__icontains=search))
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        reminder = self.get_object()
        reminder = complete_reminder(reminder)
        return Response(ReminderSerializer(reminder, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="snooze")
    def snooze(self, request, pk=None):
        reminder = self.get_object()
        days = int(request.data.get("days", 1))
        reminder = snooze_reminder(reminder, days=days)
        return Response(ReminderSerializer(reminder, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="mark-missed")
    def mark_missed(self, request):
        updated = Reminder.objects.filter(
            user=request.user,
            status__in=["pending", "snoozed"],
            due_at__lt=timezone.now(),
        ).update(status="missed")
        return Response({"updated": updated}, status=status.HTTP_200_OK)
