type Status = "pending" | "accepted" | "completed" | "cancelled" | "active" | "inactive";

interface Props {
  status: Status;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: Props) {
  const sizeClass = size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1";

  const styles: Record<Status, React.CSSProperties> = {
    pending:   { background: "var(--c-orange-bg)", color: "#FF5C00", border: "1px solid var(--c-orange-br)" },
    accepted:  { background: "var(--c-raised)",    color: "var(--c-text)",  border: "1px solid var(--c-border)" },
    completed: { background: "#3A3A3A",             color: "#FFFFFF",        border: "1px solid #3A3A3A" },
    cancelled: { background: "transparent",         color: "var(--c-muted)", border: "1px solid var(--c-border)" },
    active:    { background: "var(--c-orange-bg)", color: "#FF5C00", border: "1px solid var(--c-orange-br)" },
    inactive:  { background: "transparent",         color: "var(--c-muted)", border: "1px solid var(--c-border)" },
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide transition-all duration-200 ${sizeClass}`}
      style={styles[status]}
    >
      {status === "pending" && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"
          style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
        />
      )}
      {status === "pending" ? "Pending"
       : status === "accepted" ? "Accepted"
       : status === "completed" ? "Completed"
       : status === "cancelled" ? "Cancelled"
       : status === "active" ? "Active"
       : "Inactive"}
    </span>
  );
}
