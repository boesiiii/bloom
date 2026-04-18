from django.db.models import Q
from rest_framework import viewsets

from apps.scoring.services import handle_interaction_logged

from .models import InteractionJournalEntry
from .serializers import InteractionJournalEntrySerializer


class InteractionJournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = InteractionJournalEntrySerializer

    def get_queryset(self):
        queryset = (
            InteractionJournalEntry.objects.filter(user=self.request.user)
            .select_related("person")
            .prefetch_related("tags")
        )
        person_id = self.request.query_params.get("person")
        search = self.request.query_params.get("q")
        if person_id:
            queryset = queryset.filter(person_id=person_id)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(body__icontains=search)
                | Q(person__name__icontains=search)
                | Q(tags__name__icontains=search)
            ).distinct()
        return queryset

    def perform_create(self, serializer):
        interaction = serializer.save()
        handle_interaction_logged(interaction)
