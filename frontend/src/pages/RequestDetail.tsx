import { ArrowLeft, CheckCircle, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api, specialtyLabel, formatDate } from "../api";

type Role = "customer" | "technician" | "admin";

interface Props {
  requestId: string;
  role: Role;
  userId: string;
  onBack: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

interface RequestData {
  id: string; title: string; specialty: string; location: string;
  date: string; description: string; status: string;
}

interface Offer {
  id: string; techId: string; techName: string; price: number;
  estimatedTime: string; status: string;
}

const STEPS = ["Posted", "Accepted", "Completed"];

function Stars({ rating, onChange }: { rating: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button" disabled={!onChange} onClick={() => onChange?.(s)}
          style={{ background: "none", border: "none", padding: 0, cursor: onChange ? "pointer" : "default" }}>
          <Star size={onChange ? 20 : 11}
            className={s <= Math.floor(rating) ? "text-[#FF5C00] fill-[#FF5C00]" : ""}
            style={s > Math.floor(rating) ? { color: "var(--c-border)", fill: "var(--c-border)" } : {}} />
        </button>
      ))}
    </div>
  );
}

export default function RequestDetail({ requestId, role, userId, onBack, showToast }: Props) {
  const [request, setRequest] = useState<RequestData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.getRequests(), api.getOffersForRequest(requestId)])
      .then(([reqs, offersData]: [any[], any[]]) => {
        const found = reqs.find((r) => r._id === requestId);
        if (found) {
          setRequest({
            id: found._id, title: found.title, specialty: specialtyLabel(found.specialty),
            location: found.location, date: formatDate(found.createdAt),
            description: found.description, status: found.status,
          });
        }
        setOffers(offersData.map((o: any) => ({
          id: o._id, techId: o.technician?._id || o.technician,
          techName: o.technician?.name || "Technician", price: o.price,
          estimatedTime: o.estimatedTime, status: o.status,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [requestId]);

  useEffect(() => { load(); }, [load]);

  const currentStep = !request ? 0 : request.status === "completed" ? 2 : request.status === "accepted" ? 1 : 0;
  const accepted = offers.find((o) => o.status === "accepted");

  const handleAccept = async (offerId: string) => {
    if (confirming !== offerId) { setConfirming(offerId); return; }
    setActionLoading(offerId);
    try {
      await api.acceptOffer(offerId);
      showToast("Offer accepted! The technician has been notified.", "success");
      setConfirming(null);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not accept offer.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async () => {
    if (!request) return;
    setActionLoading("complete");
    try {
      await api.completeRequest(request.id);
      showToast("Request marked as completed.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not mark completed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRate = async () => {
    if (!request || ratingStars === 0) {
      showToast("Choose a star rating first.", "error");
      return;
    }
    setActionLoading("rate");
    try {
      await api.submitRating(request.id, ratingStars, ratingComment);
      showToast("Thanks for the review!", "success");
      setRatingSubmitted(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not submit rating.", "error");
      if (err instanceof Error && err.message.toLowerCase().includes("already")) setRatingSubmitted(true);
    } finally {
      setActionLoading(null);
    }
  };

  const canCompleteAsTechnician = role === "technician" && request?.status === "accepted" && accepted?.techId === userId;
  const canRateAsCustomer = role === "customer" && request?.status === "completed" && !ratingSubmitted;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center" style={{ background: "var(--c-bg-soft)" }}>
        <p className="text-sm" style={{ color: "var(--c-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center gap-3" style={{ background: "var(--c-bg-soft)" }}>
        <p className="text-sm" style={{ color: "var(--c-muted)" }}>Request not found.</p>
        <button onClick={onBack} className="text-sm text-[#FF5C00]">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "var(--c-bg-soft)" }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: "var(--c-muted)" }}>
          <ArrowLeft size={14} />Back
        </button>

        <div className="rounded-2xl border p-6 mb-5 animate-fade-slide"
          style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-5" style={{ color: "var(--c-muted)" }}>
            Request Progress
          </h3>
          <div className="flex items-start">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center relative">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div className="flex-1 h-0.5 transition-all duration-500"
                      style={{ background: i <= currentStep ? "#FF5C00" : "var(--c-border)" }} />
                  )}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500"
                    style={{
                      background: i < currentStep ? "#FF5C00" : i === currentStep ? "var(--c-orange-bg)" : "var(--c-raised)",
                      border: i <= currentStep ? "2px solid #FF5C00" : "2px solid var(--c-border)",
                      boxShadow: i === currentStep ? "0 0 0 4px rgba(255,92,0,0.12)" : "none",
                    }}>
                    {i < currentStep
                      ? <CheckCircle size={16} className="text-white" />
                      : <span className="text-xs font-bold" style={{ color: i === currentStep ? "#FF5C00" : "var(--c-faint)" }}>{i + 1}</span>}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 transition-all duration-500"
                      style={{ background: i < currentStep ? "#FF5C00" : "var(--c-border)" }} />
                  )}
                </div>
                <span className="text-xs mt-2 font-medium"
                  style={{ color: i <= currentStep ? "var(--c-text)" : "var(--c-faint)" }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-5 animate-fade-slide"
          style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-[#FF5C00] uppercase tracking-wide">{request.specialty}</span>
          </div>
          <h1 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
            {request.title}
          </h1>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--c-muted)" }}>{request.description}</p>
          <div className="flex gap-5 text-xs" style={{ color: "var(--c-faint)" }}>
            <span>📍 {request.location}</span>
            <span>🕐 Posted {request.date}</span>
          </div>
          {canCompleteAsTechnician && (
            <button onClick={handleComplete} disabled={actionLoading === "complete"}
              className="btn-press mt-5 h-10 px-5 rounded-xl bg-[#FF5C00] text-white text-sm font-semibold hover:bg-[#E05000] transition-colors">
              {actionLoading === "complete" ? "Marking…" : "Mark as completed"}
            </button>
          )}
        </div>

        {canRateAsCustomer && (
          <div className="rounded-2xl border p-6 mb-5 animate-fade-slide"
            style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--c-text)" }}>Rate this technician</h3>
            <div className="mb-3"><Stars rating={ratingStars} onChange={setRatingStars} /></div>
            <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)}
              placeholder="How did it go?" rows={2} className="input-focus w-full px-3.5 py-2.5 rounded-xl resize-none mb-3" />
            <button onClick={handleRate} disabled={actionLoading === "rate"}
              className="btn-press h-9 px-5 rounded-xl bg-[#FF5C00] text-white text-sm font-semibold hover:bg-[#E05000] transition-colors">
              {actionLoading === "rate" ? "Submitting…" : "Submit rating"}
            </button>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>
              {offers.length} Offer{offers.length !== 1 ? "s" : ""} Received
            </h2>
            {!accepted && role === "customer" && (
              <p className="text-xs" style={{ color: "var(--c-muted)" }}>Click Accept to confirm a technician</p>
            )}
          </div>

          {offers.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--c-muted)" }}>No offers yet.</p>
          ) : (
            <div className="space-y-3 stagger">
              {offers.map((offer) => {
                const isAccepted = accepted?.id === offer.id;
                const isOtherAccepted = !!accepted && accepted.id !== offer.id;
                const isConfirming = confirming === offer.id;
                const isLoading = actionLoading === offer.id;

                return (
                  <div key={offer.id}
                    className="rounded-2xl border p-5 transition-all duration-300"
                    style={{
                      background: "var(--c-surface)",
                      borderColor: isAccepted ? "#FF5C00" : "var(--c-border)",
                      boxShadow: isAccepted ? "0 0 0 3px rgba(255,92,0,0.12)" : "none",
                      opacity: isOtherAccepted ? 0.45 : 1,
                    }}>
                    {isAccepted && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: "var(--c-border-sub)" }}>
                        <CheckCircle size={14} className="text-[#FF5C00]" />
                        <span className="text-xs font-semibold text-[#FF5C00]">Offer Accepted</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{ background: "var(--c-raised)", borderColor: "var(--c-border)" }}>
                          <span className="text-sm font-bold" style={{ color: "var(--c-text)" }}>{offer.techName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--c-text)" }}>{offer.techName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
                          ${offer.price}
                        </p>
                        <p className="text-xs" style={{ color: "var(--c-muted)" }}>{offer.estimatedTime}</p>
                      </div>
                    </div>
                    {role === "customer" && !isOtherAccepted && !isAccepted && request.status === "pending" && (
                      <div className="mt-4 flex gap-2">
                        {isConfirming ? (
                          <>
                            <p className="flex-1 text-xs self-center" style={{ color: "var(--c-muted)" }}>Confirm accepting this offer?</p>
                            <button onClick={() => setConfirming(null)}
                              className="h-9 px-4 rounded-xl border text-xs font-medium transition-colors"
                              style={{ borderColor: "var(--c-border)", color: "var(--c-muted)" }}>
                              Cancel
                            </button>
                            <button onClick={() => handleAccept(offer.id)} disabled={isLoading}
                              className="btn-press h-9 px-5 rounded-xl bg-[#FF5C00] text-white text-xs font-semibold hover:bg-[#E05000] flex items-center gap-2">
                              {isLoading ? "…" : "Confirm"}
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleAccept(offer.id)}
                            className="btn-press h-9 px-5 rounded-xl border text-xs font-semibold transition-all duration-150"
                            style={{ borderColor: "var(--c-border)", color: "var(--c-text)" }}>
                            Accept Offer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
