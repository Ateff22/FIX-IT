import { useState, useEffect } from "react";
import { Plus, MapPin, Clock, ChevronRight, FileText } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { api, specialtyLabel, formatDate } from "../api";

type Status = "pending" | "accepted" | "completed";

interface Request {
  id: string; title: string; specialty: string; location: string;
  date: string; status: Status; offers: number; description: string;
}

const FILTERS: Array<{ label: string; value: Status | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
];

interface Props {
  onNewRequest: () => void;
  onViewDetail: (id: string) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full rounded mb-2" />
      <div className="skeleton h-3 w-3/4 rounded mb-4" />
      <div className="flex gap-4">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </div>
  );
}

export default function CustomerDashboard({ onNewRequest, onViewDetail }: Props) {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getRequests()
      .then(async (data: any[]) => {
        const mapped: Request[] = data.map((r) => ({
          id: r._id,
          title: r.title,
          specialty: specialtyLabel(r.specialty),
          location: r.location,
          date: formatDate(r.createdAt),
          status: r.status,
          offers: 0,
          description: r.description,
        }));
        if (cancelled) return;
        setRequests(mapped);
        setLoading(false);
        const withOffers = await Promise.all(
          mapped.map(async (r) => {
            try {
              const offers = await api.getOffersForRequest(r.id);
              return { ...r, offers: Array.isArray(offers) ? offers.length : 0 };
            } catch {
              return r;
            }
          })
        );
        if (!cancelled) setRequests(withOffers);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    const t = setTimeout(() => setVisible(true), 100);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "var(--c-bg-soft)" }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
              My Requests
            </h1>
            <p className="text-sm" style={{ color: "var(--c-muted)" }}>
              {counts.all} total · {counts.pending} pending attention
            </p>
          </div>
          <div className="hidden sm:flex gap-4">
            {[{ label: "Pending", value: counts.pending, color: "#FF5C00" }, { label: "Completed", value: counts.completed, color: "var(--c-text)" }].map((s) => (
              <div key={s.label} className="text-right">
                <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</p>
                <p className="text-xs" style={{ color: "var(--c-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`chip ${filter === f.value ? "active" : ""}`}>
              {f.label}
              <span className={`text-xs rounded-full px-1.5 font-semibold ${filter === f.value ? "bg-white/20 text-white" : ""}`}
                style={filter !== f.value ? { background: "var(--c-raised)", color: "var(--c-muted)" } : {}}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border"
              style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
              <FileText size={28} style={{ color: "var(--c-border)" }} />
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--c-text)" }}>No requests found</h3>
            <p className="text-sm mb-6" style={{ color: "var(--c-muted)" }}>
              {filter === "all" ? "You haven't posted any requests yet." : `No ${filter} requests right now.`}
            </p>
            <button onClick={onNewRequest}
              className="btn-press h-10 px-5 rounded-xl bg-[#FF5C00] text-white text-sm font-semibold hover:bg-[#E05000] transition-colors">
              Post a request
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger ${visible ? "" : "opacity-0"}`}>
            {filtered.map((req) => (
              <button key={req.id} onClick={() => onViewDetail(req.id)}
                className="card-hover text-left rounded-2xl p-5 border group"
                style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-[#FF5C00] uppercase tracking-wide">{req.specialty}</span>
                  <StatusBadge status={req.status} />
                </div>
                <h3 className="font-semibold text-sm mb-2 group-hover:text-[#FF5C00] transition-colors leading-snug"
                  style={{ color: "var(--c-text)" }}>
                  {req.title}
                </h3>
                <p className="text-xs line-clamp-2 mb-4 leading-relaxed" style={{ color: "var(--c-muted)" }}>
                  {req.description}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--c-faint)" }}>
                  <span className="flex items-center gap-1.5"><MapPin size={11} />{req.location}</span>
                  <span className="flex items-center gap-1.5"><Clock size={11} />{req.date}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t"
                  style={{ borderColor: "var(--c-border-sub)" }}>
                  <span className="text-xs" style={{ color: "var(--c-muted)" }}>
                    {req.offers > 0
                      ? <><span className="font-semibold" style={{ color: "var(--c-text)" }}>{req.offers}</span> offer{req.offers !== 1 ? "s" : ""} received</>
                      : "Awaiting offers"}
                  </span>
                  <ChevronRight size={14} className="group-hover:text-[#FF5C00] transition-colors" style={{ color: "var(--c-faint)" }} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={onNewRequest}
        className="btn-press fixed bottom-8 right-8 h-14 px-6 rounded-2xl bg-[#FF5C00] text-white font-semibold text-sm flex items-center gap-2.5 hover:bg-[#E05000] transition-all z-30"
        style={{ boxShadow: "0 8px 24px rgba(255,92,0,0.35)" }}>
        <Plus size={18} />
        New Request
      </button>
    </div>
  );
}
