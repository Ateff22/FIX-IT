import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Ban, AlertTriangle, X } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { api, specialtyLabel, formatDate } from "../api";

interface User {
  id: string; name: string; email: string; role: string; status: "active" | "inactive"; joined: string;
}
interface Request {
  id: string; title: string; customer: string; specialty: string; status: string; date: string;
}
interface Review {
  id: string; customer: string; technician: string; rating: number; comment: string; date: string; flagged: boolean;
}

type Tab = "users" | "requests" | "reviews";

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade"
      style={{ background: "rgba(0,0,0,0.35)" }}>
      <div className="rounded-2xl border p-6 w-80 animate-scale-in"
        style={{ background: "var(--c-surface)", borderColor: "var(--c-border)", boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
          style={{ background: "var(--c-orange-bg)", borderColor: "var(--c-orange-br)" }}>
          <AlertTriangle size={18} className="text-[#FF5C00]" />
        </div>
        <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>Are you sure?</h3>
        <p className="text-sm mb-5" style={{ color: "var(--c-muted)" }}>{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 h-10 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: "var(--c-border)", color: "var(--c-muted)" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-[#FF5C00] text-white text-sm font-semibold hover:bg-[#E05000] transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ fontSize: 11, color: s <= rating ? "#FF5C00" : "var(--c-border)" }}>★</span>
      ))}
    </div>
  );
}

export default function AdminDashboard({ showToast }: { showToast: (msg: string, type?: "success" | "error" | "info") => void }) {
  const [tab, setTab]       = useState<Tab>("users");
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([api.getAdminUsers(), api.getRequests(), api.getAdminRatings()])
      .then(([usersData, requestsData, ratingsData]: [any[], any[], any[]]) => {
        setUsers(usersData.map((u) => ({
          id: u._id, name: u.name, email: u.email, role: u.role,
          status: u.isActive ? "active" : "inactive", joined: formatDate(u.createdAt),
        })));
        setRequests(requestsData.map((r) => ({
          id: r._id, title: r.title, customer: r.customer?.name || "—",
          specialty: specialtyLabel(r.specialty), status: r.status, date: formatDate(r.createdAt),
        })));
        setReviews(ratingsData.map((rv) => ({
          id: rv._id, customer: rv.customer?.name || "—", technician: rv.technician?.name || "—",
          rating: rv.stars, comment: rv.comment || "", date: formatDate(rv.createdAt), flagged: rv.stars <= 2,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleBan = async (user: User) => {
    try {
      await api.toggleBanUser(user.id);
      showToast(`${user.name} ${user.status === "active" ? "banned" : "unbanned"}.`, "info");
      loadAll();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update user.", "error");
    }
  };

  const handleDeleteRequest = async (req: Request) => {
    try {
      await api.deleteRequest(req.id);
      showToast("Request deleted.", "info");
      loadAll();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete request.", "error");
    }
  };

  const handleDeleteReview = async (rv: Review) => {
    try {
      await api.deleteRating(rv.id);
      showToast("Review removed.", "info");
      loadAll();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete review.", "error");
    }
  };

  const thStyle: React.CSSProperties = { color: "var(--c-muted)", textAlign: "left", padding: "12px 20px" };
  const tdStyle: React.CSSProperties = { padding: "14px 20px" };

  const filteredUsers    = users.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredRequests = requests.filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase()));
  const filteredReviews  = reviews.filter((r) => !search || r.customer.toLowerCase().includes(search.toLowerCase()) || r.technician.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label: "Total Users",     value: users.length },
    { label: "Open Requests",   value: requests.filter((r) => r.status === "pending" || r.status === "accepted").length },
    { label: "Flagged Reviews", value: reviews.filter((r) => r.flagged).length },
    { label: "Completed Jobs",  value: requests.filter((r) => r.status === "completed").length },
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center" style={{ background: "var(--c-bg-soft)" }}>
        <p className="text-sm" style={{ color: "var(--c-muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "var(--c-bg-soft)" }}>
      {modal && <ConfirmModal message={modal.message} onConfirm={() => { modal.onConfirm(); setModal(null); }} onCancel={() => setModal(null)} />}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>Admin Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--c-muted)" }}>Platform overview and management</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={s.label} className="rounded-2xl border p-5 animate-fade-slide"
              style={{ background: "var(--c-surface)", borderColor: "var(--c-border)", animationDelay: `${i*0.06}s` }}>
              <p className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>{s.value}</p>
              <p className="text-xs" style={{ color: "var(--c-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="flex p-1 rounded-xl gap-1 border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            {(["users", "requests", "reviews"] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
                style={tab === t ? { background: "#FF5C00", color: "white" } : { color: "var(--c-muted)" }}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--c-faint)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="input-focus h-9 pl-9 pr-3 rounded-xl w-52" />
          </div>
        </div>

        {tab === "users" && (
          <div className="rounded-2xl border overflow-hidden animate-fade-slide"
            style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-raised)" }}>
                  {["Name","Role","Status","Joined"].map((l) => (
                    <th key={l} style={thStyle}><span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-muted)" }}>{l}</span></th>
                  ))}
                  <th style={{ ...thStyle, textAlign: "right" }}><span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-muted)" }}>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--c-border-sub)" }}>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border"
                          style={{ background: "var(--c-raised)", borderColor: "var(--c-border)" }}>
                          <span className="text-xs font-bold" style={{ color: "var(--c-text)" }}>{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>{user.name}</p>
                          <p className="text-xs" style={{ color: "var(--c-faint)" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><span className="text-xs font-medium capitalize" style={{ color: "var(--c-muted)" }}>{user.role}</span></td>
                    <td style={tdStyle}><StatusBadge status={user.status} /></td>
                    <td style={tdStyle}><span className="text-xs" style={{ color: "var(--c-muted)" }}>{user.joined}</span></td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button onClick={() => setModal({
                        message: `${user.status === "active" ? "Ban" : "Unban"} ${user.name}?`,
                        onConfirm: () => handleBan(user),
                      })}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all ml-auto"
                      style={{ color: user.status === "inactive" ? "#FF5C00" : "var(--c-faint)", background: user.status === "inactive" ? "var(--c-orange-bg)" : "transparent" }}>
                        <Ban size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "requests" && (
          <div className="rounded-2xl border overflow-hidden animate-fade-slide"
            style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-raised)" }}>
                  {["Title","Customer","Specialty","Status","Date"].map((l) => (
                    <th key={l} style={thStyle}><span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-muted)" }}>{l}</span></th>
                  ))}
                  <th style={{ ...thStyle, textAlign: "right" }}><span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-muted)" }}>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid var(--c-border-sub)" }}>
                    <td style={tdStyle}><p className="text-sm font-medium max-w-[180px] truncate" style={{ color: "var(--c-text)" }}>{req.title}</p></td>
                    <td style={tdStyle}><span className="text-xs" style={{ color: "var(--c-muted)" }}>{req.customer}</span></td>
                    <td style={tdStyle}><span className="text-xs font-medium text-[#FF5C00]">{req.specialty}</span></td>
                    <td style={tdStyle}><StatusBadge status={req.status as any} /></td>
                    <td style={tdStyle}><span className="text-xs" style={{ color: "var(--c-muted)" }}>{req.date}</span></td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button onClick={() => setModal({
                        message: `Delete request "${req.title}"?`,
                        onConfirm: () => handleDeleteRequest(req),
                      })}
                      className="w-7 h-7 rounded-lg flex items-center justify-center ml-auto"
                      style={{ color: "var(--c-faint)" }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-3 animate-fade-slide stagger">
            {filteredReviews.map((rv) => (
              <div key={rv.id} className="rounded-2xl border p-5 transition-all duration-200"
                style={{
                  background: "var(--c-surface)",
                  borderColor: rv.flagged ? "var(--c-orange-br)" : "var(--c-border)",
                }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <span className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>{rv.customer}</span>
                        <span className="text-sm mx-1.5" style={{ color: "var(--c-faint)" }}>→</span>
                        <span className="text-sm font-medium" style={{ color: "var(--c-muted)" }}>{rv.technician}</span>
                      </div>
                      {rv.flagged && (
                        <span className="text-xs font-semibold text-[#FF5C00] flex items-center gap-1 px-2 py-0.5 rounded-full"
                          style={{ background: "var(--c-orange-bg)", border: "1px solid var(--c-orange-br)" }}>
                          <AlertTriangle size={10} />Low rating
                        </span>
                      )}
                    </div>
                    <Stars rating={rv.rating} />
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--c-muted)" }}>{rv.comment}</p>
                    <p className="text-xs mt-2" style={{ color: "var(--c-faint)" }}>{rv.date}</p>
                  </div>
                  <button onClick={() => setModal({
                    message: `Remove this review by ${rv.customer}?`,
                    onConfirm: () => handleDeleteReview(rv),
                  })}
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ color: "var(--c-faint)" }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
            {filteredReviews.length === 0 && (
              <p className="text-sm py-8 text-center" style={{ color: "var(--c-muted)" }}>No reviews found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
