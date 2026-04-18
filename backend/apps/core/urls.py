from django.urls import include, path
from rest_framework.routers import SimpleRouter

from apps.interactions.views import InteractionJournalEntryViewSet
from apps.people.views import PersonProfileDetailViewSet, PersonViewSet
from apps.reminders.views import ReminderViewSet

from . import views


router = SimpleRouter(trailing_slash=False)
router.register("people", PersonViewSet, basename="people")
router.register("profile-details", PersonProfileDetailViewSet, basename="profile-details")
router.register("interactions", InteractionJournalEntryViewSet, basename="interactions")
router.register("reminders", ReminderViewSet, basename="reminders")

urlpatterns = [
    path("auth/", include("apps.users.urls")),
    path("home", views.home, name="home"),
    path("garden", views.garden, name="garden"),
    path("search", views.search, name="search"),
]

urlpatterns += router.urls
