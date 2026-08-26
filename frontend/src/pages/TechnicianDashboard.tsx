import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Clock, ChevronDown, Send, X } from "lucide-react";
import { api, SPECIALTIES, specialtyLabel, formatDate } from "../api";

interface Request {
  id: string; title: string; specialty: string; location: string;
  date: string; description: string; photo: string | null; offerCount: number;
}

interface Props {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  onViewDetail: (id: string) => void;
}

function OfferForm({ requestId, onClose, onSent, showToast }: { requestId: string; onClose: () => void; onSent: () => void; showToast: Props["showToast"] }) {
  const [price, setPrice] = useState("");
  const [note, setNote]   = useState("");
  const [days, setDays]   = useState("1");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!price) return;
    setSending(true);
    try {
      await api.submitOffer(requestId, Number(price), `${days} day${days !== "1" ? "s" : ""}${note ? ` — ${note}` : ""}`);
      onSent();
      onClose();
      showToast("Offer sent! The customer will be notified.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not send offer.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t mt-4 pt-4 space-y-3 animate-fade-slide" style={{ borderColor: "var(--c-border-sub)" }}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Your Price ($)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="120"
            className="input-focus w-full h-9 px-3 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Est. Days</label>
          <select value={days} onChange={(e) => setDays(e.target.value)}
            className="input-focus w-full h-9 px-3 rounded-lg">
            {["1","2","3","5","7","14"].map((d) => (
              <option key={d} value={d}>{d} day{d !== "1" ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Message (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about your approach, materials included, etc."
          rows={2} className="input-focus w-full px-3 py-2 rounded-lg resize-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={onClose}
          className="h-9 w-9 rounded-lg border flex items-center justify-center transition-colors"
          style={{ borderColor: "var(--c-border)", color: "var(--c-muted)" }}>
          <X size={13} />
        </button>
        <button onClick={handleSend} disabled={!price || sending}
          className="btn-press flex-1 h-9 rounded-lg bg-[#FF5C00] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#E05000] transition-colors disabled:opacity-50">
          {sending ? (
            <span className="flex gap-1">
              {[0,1,2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-white"
                  style={{ animation: `pulse-dot 0.8s ease-in-out ${i*0.15}s infinite` }} />
              ))}
            </span>
          ) : <><Send size={13} />Send Offer</>}
        </button>
      </div>
    </div>
  );
}

export default function TechnicianDashboard({ showToast, onViewDetail }: Props) {
  const [search, setSearch]         = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [visible, setVisible]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [requests, setRequests]     = useState<Request[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    api.getRequests({ status: "pending", specialty: specFilter === "All" ? undefined : specFilter, search: search || undefined })
      .then(async (data: any[]) => {
        const mapped: Request[] = data.map((r) => ({
          id: r._id, title: r.title, specialty: specialtyLabel(r.specialty), location: r.location,
          date: formatDate(r.createdAt), description: r.description, photo: r.photo || null, offerCount: 0,
        }));
        setRequests(mapped);
        setLoading(false);
        const withOffers = await Promise.all(
          mapped.map(async (r) => {
            try {
              const offers = await api.getOffersForRequest(r.id);
              return { ...r, offerCount: Array.isArray(offers) ? offers.length : 0 };
            } catch {
              return r;
            }
          })
        );
        setRequests(withOffers);
      })
      .catch(() => setLoading(false));
  }, [search, specFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "var(--c-bg-soft)" }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
            Browse Requests
          </h1>
          <p className="text-sm" style={{ color: "var(--c-muted)" }}>
            Open requests matching your specialty · find jobs that fit your expertise
          </p>
        </div>

        <div className="rounded-2xl border p-4 mb-5" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--c-faint)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="input-focus w-full h-10 pl-9 pr-4 rounded-xl" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            <button onClick={() => setSpecFilter("All")} className={`chip ${specFilter === "All" ? "active" : ""}`}>All</button>
            {SPECIALTIES.map((s) => (
              <button key={s.id} onClick={() => setSpecFilter(s.id)} className={`chip ${specFilter === s.id ? "active" : ""}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs mb-4" style={{ color: "var(--c-muted)" }}>
          {requests.length} result{requests.length !== 1 ? "s" : ""}{search && ` for "${search}"`}
        </p>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <p className="text-sm" style={{ color: "var(--c-muted)" }}>Loading requests…</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center py-20 animate-fade">
            <Search size={32} className="mb-3" style={{ color: "var(--c-border)" }} />
            <h3 className="font-semibold mb-1" style={{ color: "var(--c-text)" }}>No requests found</h3>
            <p className="text-sm" style={{ color: "var(--c-muted)" }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={`space-y-3 ${visible ? "stagger" : "opacity-0"}`}>
            {requests.map((req) => (
              <div key={req.id} className="rounded-2xl border p-5 transition-all duration-200 hover:shadow-md"
                style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <button className="flex-1 min-w-0 text-left" onClick={() => onViewDetail(req.id)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-[#FF5C00] uppercase tracking-wide">{req.specialty}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1.5" style={{ color: "var(--c-text)" }}>{req.title}</h3>
                    <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--c-muted)" }}>{req.description}</p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: "var(--c-faint)" }}>
                      <span className="flex items-center gap-1.5"><MapPin size={11} />{req.location}</span>
                      <span className="flex items-center gap-1.5"><Clock size={11} />{req.date}</span>
                    </div>
                  </button>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs" style={{ color: "var(--c-muted)" }}>
                      {req.offerCount > 0 ? `${req.offerCount} offers` : "No offers yet"}
                    </span>
                    <button
                      onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                      className="btn-press h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150"
                      style={
                        expanded === req.id
                          ? { background: "var(--c-raised)", color: "var(--c-text)" }
                          : { background: "#FF5C00", color: "white" }
                      }>
                      {expanded === req.id ? "Cancel" : "Send Offer"}
                      <ChevronDown size={12} style={{ transform: expanded === req.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                  </div>
                </div>
                <div className={`offer-form ${expanded === req.id ? "open" : "closed"}`}>
                  {expanded === req.id && (
                    <OfferForm requestId={req.id} onClose={() => setExpanded(null)} onSent={load} showToast={showToast} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
