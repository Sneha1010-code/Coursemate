import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  signup: (email, password, username) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    }),
  createProfile: (username) =>
    request("/profiles/me", { method: "POST", body: JSON.stringify({ username }) }),
  getMyProfile: () => request("/profiles/me"),
  updateCourseDetails: (payload) =>
    request("/profiles/me/course", { method: "PUT", body: JSON.stringify(payload) }),
  updateProfileSetup: (payload) =>
    request("/profiles/me/setup", { method: "PUT", body: JSON.stringify(payload) }),
  getMatches: () => request("/matches"),
  sendConnectionRequest: (recipientId) =>
    request("/connections", { method: "POST", body: JSON.stringify({ recipient_id: recipientId }) }),
  getConnections: () => request("/connections"),
  acceptConnection: (id) => request(`/connections/${id}/accept`, { method: "PATCH" }),
  declineConnection: (id) => request(`/connections/${id}/decline`, { method: "PATCH" }),
  cancelConnection: (id) => request(`/connections/${id}`, { method: "DELETE" }),
};
