const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_KEY = "relationship_garden_token";

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  const looksLikeBrokenLanValue = configured && /^https?:\/\/api(\/|$)/.test(configured);

  if (configured && !looksLikeBrokenLanValue) {
    return configured.replace(/\/$/, "");
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "localhost";
  return `${protocol}//${hostname}:8000/api/v1`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const shouldSendToken = token && !path.startsWith("/auth/login") && !path.startsWith("/auth/signup");
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(shouldSendToken ? { Authorization: `Token ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail || data?.non_field_errors?.[0] || data?.email?.[0] || "Something went wrong.";
    if (response.status === 401) {
      setToken(null);
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
        window.location.assign("/login");
      }
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function jsonRequest(path, method, body) {
  return request(path, {
    method,
    body: JSON.stringify(body)
  });
}

export const api = {
  signup: (payload) => jsonRequest("/auth/signup", "POST", payload),
  login: (payload) => jsonRequest("/auth/login", "POST", payload),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  home: () => request("/home"),
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  people: (params = {}) => request(`/people${query(params)}`),
  person: (id) => request(`/people/${id}`),
  createPerson: (payload) => jsonRequest("/people", "POST", payload),
  updatePerson: (id, payload) => jsonRequest(`/people/${id}`, "PATCH", payload),
  deletePerson: (id) => request(`/people/${id}`, { method: "DELETE" }),
  addProfileDetail: (id, payload) => jsonRequest(`/people/${id}/details`, "POST", payload),
  updateProfileDetail: (id, payload) => jsonRequest(`/profile-details/${id}`, "PATCH", payload),
  deleteProfileDetail: (id) => request(`/profile-details/${id}`, { method: "DELETE" }),
  interactions: (params = {}) => request(`/interactions${query(params)}`),
  interaction: (id) => request(`/interactions/${id}`),
  createInteraction: (payload) => jsonRequest("/interactions", "POST", payload),
  updateInteraction: (id, payload) => jsonRequest(`/interactions/${id}`, "PATCH", payload),
  completeInteractionFollowUp: (id) => jsonRequest(`/interactions/${id}/complete-follow-up`, "POST", {}),
  deleteInteraction: (id) => request(`/interactions/${id}`, { method: "DELETE" }),
  reminders: (params = {}) => request(`/reminders${query(params)}`),
  reminder: (id) => request(`/reminders/${id}`),
  createReminder: (payload) => jsonRequest("/reminders", "POST", payload),
  updateReminder: (id, payload) => jsonRequest(`/reminders/${id}`, "PATCH", payload),
  completeReminder: (id) => jsonRequest(`/reminders/${id}/complete`, "POST", {}),
  snoozeReminder: (id, days = 1) => jsonRequest(`/reminders/${id}/snooze`, "POST", { days }),
  garden: (params = {}) => request(`/garden${query(params)}`),
  scoreEvents: (personId) => request(`/people/${personId}/score-events`)
};

function query(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}
