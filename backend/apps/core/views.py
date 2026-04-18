from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.interactions.models import InteractionJournalEntry
from apps.interactions.serializers import InteractionJournalEntrySerializer
from apps.people.models import Person
from apps.people.serializers import PersonBriefSerializer
from apps.reminders.models import Reminder
from apps.reminders.serializers import ReminderSerializer
from apps.scoring.services import refresh_overdue_people_for_user


@api_view(["GET"])
def home(request):
    refresh_overdue_people_for_user(request.user)
    now = timezone.now()
    people = Person.objects.filter(user=request.user)
    reminders = Reminder.objects.filter(user=request.user).select_related("person")

    health_counts = {
        item["relationship_health"]: item["count"]
        for item in people.values("relationship_health").annotate(count=Count("id"))
    }
    overdue_people = people.filter(next_goal_due_at__lt=now)
    overdue_reminders = reminders.filter(status__in=["pending", "snoozed"], due_at__lt=now)
    today_reminders = reminders.filter(status__in=["pending", "snoozed"], due_at__date=now.date())
    reminder_widget_items = reminders.filter(status__in=["pending", "snoozed"]).order_by("due_at")[:4]
    open_follow_ups = (
        InteractionJournalEntry.objects.filter(
            user=request.user,
            follow_up_needed=True,
            follow_up_completed_at__isnull=True,
        )
        .select_related("person")
        .prefetch_related("tags", "participants")
        .order_by("-interaction_date", "-created_at")
    )

    today_focus_people = list(overdue_people.order_by("relationship_points")[:3])
    if len(today_focus_people) < 3:
        today_focus_people.extend(
            people.exclude(id__in=[person.id for person in today_focus_people]).order_by("next_goal_due_at")[: 3 - len(today_focus_people)]
        )

    suggested_actions = []
    for person in today_focus_people:
        suggested_actions.append(
            {
                "type": "log_interaction",
                "person": PersonBriefSerializer(person).data,
                "text": f"Reach out to {person.display_name} with one small check-in.",
            }
        )
    for reminder in today_reminders.order_by("due_at")[:2]:
        suggested_actions.append(
            {
                "type": "complete_reminder",
                "reminder": ReminderSerializer(reminder, context={"request": request}).data,
                "text": reminder.text,
            }
        )

    garden_preview = list(overdue_people.order_by("relationship_points")[:2])
    garden_preview.extend(people.exclude(id__in=[person.id for person in garden_preview]).order_by("-relationship_points")[: 4 - len(garden_preview)])

    return Response(
        {
            "greeting": f"Hi {request.user.name or request.user.email.split('@')[0]}",
            "today_focus": PersonBriefSerializer(today_focus_people, many=True).data,
            "relationship_health_summary": {
                "thriving": health_counts.get("thriving", 0),
                "healthy": health_counts.get("healthy", 0),
                "needs_attention": health_counts.get("needs_attention", 0),
                "at_risk": health_counts.get("at_risk", 0),
                "dormant": health_counts.get("dormant", 0),
                "overdue_goals": overdue_people.count(),
                "overdue_reminders": overdue_reminders.count(),
                "total": people.count(),
            },
            "reminders_widget": {
                "items": ReminderSerializer(reminder_widget_items, many=True, context={"request": request}).data,
                "overdue_count": overdue_reminders.count(),
                "today_count": today_reminders.count(),
            },
            "needs_follow_up_widget": {
                "items": InteractionJournalEntrySerializer(open_follow_ups[:4], many=True, context={"request": request}).data,
                "count": open_follow_ups.count(),
            },
            "suggested_actions": suggested_actions[:5],
            "garden_preview": PersonBriefSerializer(garden_preview, many=True).data,
        }
    )


@api_view(["GET"])
def garden(request):
    refresh_overdue_people_for_user(request.user)
    now = timezone.now()
    people = Person.objects.filter(user=request.user)
    health_counts = {
        item["relationship_health"]: item["count"]
        for item in people.values("relationship_health").annotate(count=Count("id"))
    }
    overdue_people = people.filter(next_goal_due_at__lt=now)
    overdue_reminders = Reminder.objects.filter(
        user=request.user,
        status__in=["pending", "snoozed"],
        due_at__lt=now,
    )
    queryset = people.prefetch_related("profile_details")
    plant_type = request.query_params.get("plant_type")
    health = request.query_params.get("health")
    if plant_type:
        queryset = queryset.filter(plant_type=plant_type)
    if health:
        queryset = queryset.filter(relationship_health=health)

    sort = request.query_params.get("sort", "needs_attention")
    if sort == "thriving":
        queryset = queryset.order_by("-relationship_points", "next_goal_due_at")
    elif sort == "cadence":
        queryset = queryset.order_by("contact_frequency", "name")
    elif sort == "recent":
        queryset = queryset.order_by("-last_interaction_at")
    else:
        queryset = queryset.order_by("relationship_points", "next_goal_due_at")

    return Response(
        {
            "relationship_health_summary": {
                "thriving": health_counts.get("thriving", 0),
                "healthy": health_counts.get("healthy", 0),
                "needs_attention": health_counts.get("needs_attention", 0),
                "at_risk": health_counts.get("at_risk", 0),
                "dormant": health_counts.get("dormant", 0),
                "overdue_goals": overdue_people.count(),
                "overdue_reminders": overdue_reminders.count(),
                "total": people.count(),
            },
            "plants": PersonBriefSerializer(queryset, many=True).data,
        }
    )


@api_view(["GET"])
def search(request):
    refresh_overdue_people_for_user(request.user)
    query = request.query_params.get("q", "").strip()
    if not query:
        return Response({"people": [], "interactions": [], "reminders": []})

    people = Person.objects.filter(user=request.user).filter(
        Q(name__icontains=query)
        | Q(nickname__icontains=query)
        | Q(notes_summary__icontains=query)
        | Q(profile_details__value__icontains=query)
    ).distinct()[:8]
    interactions = InteractionJournalEntry.objects.filter(user=request.user).filter(
        Q(title__icontains=query) | Q(body__icontains=query) | Q(person__name__icontains=query) | Q(participants__name__icontains=query)
    ).select_related("person").prefetch_related("participants").distinct()[:8]
    reminders = Reminder.objects.filter(user=request.user).filter(
        Q(text__icontains=query) | Q(person__name__icontains=query)
    ).select_related("person")[:8]

    return Response(
        {
            "people": PersonBriefSerializer(people, many=True).data,
            "interactions": InteractionJournalEntrySerializer(interactions, many=True, context={"request": request}).data,
            "reminders": ReminderSerializer(reminders, many=True, context={"request": request}).data,
        }
    )
