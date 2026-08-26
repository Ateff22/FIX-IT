import { useState, useRef } from "react";
import { ArrowLeft, Upload, X, Check, ChevronRight } from "lucide-react";
import { api, SPECIALTIES } from "../api";

interface Props {
  onBack: () => void;
  onSubmit: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const STEPS = ["Details", "Specialty", "Upload", "Review"];

export default function NewRequest({ onBack, onSubmit, showToast }: Props) {
  const [step, setStep]           = useState(0);
  const [title, setTitle]         = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation]   = useState("");
  const [specialty, setSpecialty] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [dragOver, setDragOver]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const canNext = () => {
    if (step === 0) return title.trim() && description.trim() && location.trim();
    if (step === 1) return !!specialty;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("specialty", specialty);
      formData.append("location", location);
      if (photoFile) formData.append("photo", photoFile);
      await api.createRequest(formData);
      onSubmit();
      showToast("Request posted! Technicians will reach out soon.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not post request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "var(--c-bg-soft)" }}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: "var(--c-muted)" }}>
          <ArrowLeft size={14} />Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
          Post a New Request
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--c-muted)" }}>
          Tell us what needs fixing and skilled technicians will send you offers.
        </p>

        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: i < step ? "#2B2B2B" : i === step ? "#FF5C00" : "var(--c-surface)",
                    border: i === step ? "2px solid #FF5C00" : i < step ? "2px solid #2B2B2B" : "2px solid var(--c-border)",
                    color: i <= step ? "white" : "var(--c-faint)",
                    boxShadow: i === step ? "0 0 0 4px rgba(255,92,0,0.15)" : "none",
                  }}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className="text-xs mt-1.5 font-medium"
                  style={{ color: i === step ? "#FF5C00" : i < step ? "var(--c-text)" : "var(--c-faint)" }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-5 transition-all duration-500"
                  style={{ background: i < step ? "#2B2B2B" : "var(--c-border)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-6 animate-scale-in"
          style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>

          {step === 0 && (
            <div className="space-y-5">
              {[
                { label: "Request Title", value: title, set: setTitle, placeholder: "e.g. Kitchen sink is leaking" },
                { label: "Location",      value: location, set: setLocation, placeholder: "e.g. Downtown, Apt 4B" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>{f.label}</label>
                  <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} required
                    className="input-focus w-full h-11 px-3.5 rounded-xl" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail — what happened, how long, anything you've tried..."
                  rows={4} className="input-focus w-full px-3.5 py-3 rounded-xl resize-none" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-sm mb-4" style={{ color: "var(--c-muted)" }}>Choose the type of technician you need</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {SPECIALTIES.map((sp) => (
                  <button key={sp.id} type="button" onClick={() => setSpecialty(sp.id)}
                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-200"
                    style={{
                      borderColor: specialty === sp.id ? "#FF5C00" : "var(--c-border)",
                      background: specialty === sp.id ? "var(--c-orange-bg)" : "var(--c-surface)",
                      boxShadow: specialty === sp.id ? "0 0 0 3px rgba(255,92,0,0.12)" : "none",
                    }}>
                    <span className="text-2xl">{sp.icon}</span>
                    <span className="text-xs font-semibold text-center leading-tight"
                      style={{ color: specialty === sp.id ? "#FF5C00" : "var(--c-text)" }}>
                      {sp.label}
                    </span>
                    {specialty === sp.id && (
                      <div className="w-4 h-4 rounded-full bg-[#FF5C00] flex items-center justify-center">
                        <Check size={9} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm mb-4" style={{ color: "var(--c-muted)" }}>Add a photo to help technicians understand the issue (optional)</p>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: dragOver ? "#FF5C00" : "var(--c-border)",
                  background: dragOver ? "var(--c-orange-bg)" : "transparent",
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border"
                  style={{ background: "var(--c-raised)", borderColor: "var(--c-border)" }}>
                  <Upload size={20} style={{ color: dragOver ? "#FF5C00" : "var(--c-faint)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>
                    {dragOver ? "Drop to upload" : "Drag & drop a photo here"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--c-muted)" }}>or click to browse · PNG, JPG</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleFiles(e.target.files)} />
              </div>
              {photoPreview && (
                <div className="mt-4 relative rounded-xl overflow-hidden w-28 h-28" style={{ background: "var(--c-raised)" }}>
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  <button onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(""); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: "var(--c-text)" }}>Review your request</h3>
              {[
                { label: "Title",     value: title },
                { label: "Specialty", value: SPECIALTIES.find((s) => s.id === specialty)?.label || "" },
                { label: "Location",  value: location },
                { label: "Photo",     value: photoFile ? "1 photo attached" : "No photo" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-3 border-b last:border-0"
                  style={{ borderColor: "var(--c-border-sub)" }}>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-muted)" }}>{row.label}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--c-text)" }}>{row.value || "—"}</span>
                </div>
              ))}
              <div className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-muted)" }}>Description</span>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--c-text)" }}>{description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="h-11 px-5 rounded-xl border text-sm font-medium transition-all"
              style={{ borderColor: "var(--c-border)", color: "var(--c-muted)", background: "transparent" }}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              className="btn-press flex-1 h-11 rounded-xl bg-[#FF5C00] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#E05000] transition-colors disabled:opacity-40">
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-press flex-1 h-11 rounded-xl bg-[#FF5C00] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#E05000] transition-colors disabled:opacity-60">
              {submitting ? (
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-white"
                      style={{ animation: `pulse-dot 0.8s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </span>
              ) : "Post Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
