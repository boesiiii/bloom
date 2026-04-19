from datetime import date, datetime, time

from django.utils import timezone

from .models import Reminder, ReminderKind, ReminderRepeat, ReminderStatus


def next_birthday_due_at(birthday, now=None):
    current_date = timezone.localdate(now)

    def birthday_for_year(year):
        try:
            return birthday.replace(year=year)
        except ValueError:
            return date(year, 2, 28)

    birthday_date = birthday_for_year(current_date.year)
    if birthday_date < current_date:
        birthday_date = birthday_for_year(current_date.year + 1)

    due_at = datetime.combine(birthday_date, time(hour=9))
    return timezone.make_aware(due_at, timezone.get_current_timezone())


def _same_birthday_day(due_at, birthday):
    local_due_date = timezone.localtime(due_at).date()
    if birthday.month == 2 and birthday.day == 29:
        return (local_due_date.month, local_due_date.day) in ((2, 28), (2, 29))
    return (local_due_date.month, local_due_date.day) == (birthday.month, birthday.day)


def sync_birthday_reminder(person):
    birthday_reminders = list(
        Reminder.objects.filter(
            user=person.user,
            person=person,
            kind=ReminderKind.BIRTHDAY,
        ).order_by("id")
    )

    if not person.birthday:
        for reminder in birthday_reminders:
            reminder.delete()
        return None

    reminder = birthday_reminders[0] if birthday_reminders else None
    for duplicate in birthday_reminders[1:]:
        duplicate.delete()

    due_at = next_birthday_due_at(person.birthday)
    if reminder and reminder.status != ReminderStatus.DONE and _same_birthday_day(reminder.due_at, person.birthday):
        due_at = reminder.due_at

    defaults = {
        "text": f"{person.display_name}'s birthday",
        "due_at": due_at,
        "repeat": ReminderRepeat.YEARLY,
        "status": ReminderStatus.PENDING,
        "kind": ReminderKind.BIRTHDAY,
        "interaction": None,
    }

    if reminder:
        for field, value in defaults.items():
            setattr(reminder, field, value)
        reminder.save(update_fields=[*defaults.keys(), "updated_at"])
        return reminder

    return Reminder.objects.create(
        user=person.user,
        person=person,
        **defaults,
    )
