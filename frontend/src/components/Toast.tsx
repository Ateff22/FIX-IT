import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface Props {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle size={16} className="text-[#FF5C00]" />,
  error:   <AlertCircle size={16} style={{ color: "var(--c-muted)" }} />,
  info:    <Info        size={16} style={{ color: "var(--c-muted)" }} />,
};

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div
      className="animate-toast flex items-center gap-3 rounded-xl px-4 py-3 border min-w-[280px] max-w-[360px]"
      style={{
        background: "var(--c-surface)",
        borderColor: "var(--c-border)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
      }}
    >
      {icons[toast.type]}
      <span className="text-sm font-medium flex-1" style={{ color: "var(--c-text)" }}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} style={{ color: "var(--c-muted)" }}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
