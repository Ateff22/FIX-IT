const BASE_URL = "";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("fixit_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res: Response) {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (email: string, password: string) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  register: (body: { name: string; email: string; password: string; role: string; phone?: string; specialty?: string }) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),

  getRequests: (params: { specialty?: string; status?: string; search?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.specialty) qs.append("specialty", params.specialty);
    if (params.status) qs.append("status", params.status);
    if (params.search) qs.append("search", params.search);
    const query = qs.toString();
    return fetch(`${BASE_URL}/api/requests${query ? `?${query}` : ""}`, {
      headers: { ...authHeaders() },
    }).then(handle);
  },

  createRequest: (formData: FormData) =>
    fetch(`${BASE_URL}/api/requests`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: formData,
    }).then(handle),

  completeRequest: (id: string) =>
    fetch(`${BASE_URL}/api/requests/${id}/complete`, {
      method: "PUT",
      headers: { ...authHeaders() },
    }).then(handle),

  deleteRequest: (id: string) =>
    fetch(`${BASE_URL}/api/requests/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    }).then(handle),

  submitOffer: (requestId: string, price: number, estimatedTime: string) =>
    fetch(`${BASE_URL}/api/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ requestId, price, estimatedTime }),
    }).then(handle),

  acceptOffer: (offerId: string) =>
    fetch(`${BASE_URL}/api/offers/${offerId}/accept`, {
      method: "PUT",
      headers: { ...authHeaders() },
    }).then(handle),

  getOffersForRequest: (requestId: string) =>
    fetch(`${BASE_URL}/api/offers/${requestId}`, {
      headers: { ...authHeaders() },
    }).then(handle),

  submitRating: (requestId: string, stars: number, comment: string) =>
    fetch(`${BASE_URL}/api/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ requestId, stars, comment }),
    }).then(handle),

  getAdminUsers: () =>
    fetch(`${BASE_URL}/api/admin/users`, { headers: { ...authHeaders() } }).then(handle),

  toggleBanUser: (id: string) =>
    fetch(`${BASE_URL}/api/admin/users/${id}/ban`, {
      method: "PUT",
      headers: { ...authHeaders() },
    }).then(handle),

  getAdminRatings: () =>
    fetch(`${BASE_URL}/api/admin/ratings`, { headers: { ...authHeaders() } }).then(handle),

  deleteRating: (id: string) =>
    fetch(`${BASE_URL}/api/admin/ratings/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    }).then(handle),
};

export const SPECIALTIES: Array<{ id: string; label: string; icon: string }> = [
  { id: "plumber", label: "Plumber", icon: "🔧" },
  { id: "electrician", label: "Electrician", icon: "⚡" },
  { id: "ac-technician", label: "AC Technician", icon: "❄️" },
  { id: "carpenter", label: "Carpenter", icon: "🪵" },
  { id: "painter", label: "Painter", icon: "🖌️" },
  { id: "mason", label: "Mason", icon: "🧱" },
  { id: "appliance-technician", label: "Appliance Technician", icon: "🔌" },
  { id: "locksmith", label: "Locksmith", icon: "🔑" },
  { id: "glass-aluminum-technician", label: "Glass & Aluminum Technician", icon: "🪟" },
  { id: "cleaning-technician", label: "Cleaning Technician", icon: "🧹" },
  { id: "gardener", label: "Gardener", icon: "🌿" },
  { id: "electronics-technician", label: "Electronics Technician", icon: "📱" },
];

export function specialtyLabel(id: string): string {
  return SPECIALTIES.find((s) => s.id === id)?.label || id;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
