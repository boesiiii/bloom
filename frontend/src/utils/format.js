export const healthLabels = {
  thriving: "Thriving",
  healthy: "Healthy",
  needs_attention: "Needs attention",
  at_risk: "At risk",
  dormant: "Dormant"
};

export const frequencyLabels = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly"
};

export const plantLabels = {
  sunflower: "Sunflower",
  tulip: "Tulip",
  orchid: "Orchid",
  cactus: "Cactus"
};

export function formatDate(value, fallback = "Not set") {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export function formatDateTime(value, fallback = "Not set") {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatInputDateTime(value) {
  const date = value ? new Date(value) : new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

export function toIsoFromLocal(value) {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "?";
}

export function isOverdue(value) {
  return Boolean(value && new Date(value) < new Date());
}
