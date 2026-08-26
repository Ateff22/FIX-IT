import { Wrench, Bell, ChevronDown, LogOut, User, Sun, Moon } from "lucide-react";
import { useState } from "react";

type Role = "customer" | "technician" | "admin" | null;
type Page =
  | "login"
  | "customer-dashboard"
  | "new-request"
  | "technician-dashboard"
  | "request-detail"
  | "admin-dashboard";

interface Props {
  role: Role;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userName?: string;
  dark: boolean;
  onToggleDark: () => void;
}

const navLinks: Record<NonNullable<Role>, Array<{ label: string; page: Page }>> = {
  customer: [
    { label: "My Requests", page: "customer-dashboard" },
    { label: "New Request", page: "new-request" },
  ],
  technician: [{ label: "Browse Requests", page: "technician-dashboard" }],
  admin: [{ label: "Dashboard", page: "admin-dashboard" }],
};

export default function Navbar({ role, currentPage, onNavigate, onLogout, userName, dark, onToggleDark }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!role) return null;

  return (
    <nav
      className="sticky top-0 z-40 w-full border-b transition-colors duration-200"
      style={{ background: "var(--c-nav)", borderColor: "var(--c-border)" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate(role === "admin" ? "admin-dashboard" : role === "technician" ? "technician-dashboard" : "customer-dashboard")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-[#FF5C00] flex items-center justify-center">
            <Wrench size={14} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
            FixIt
          </span>
        </button>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks[role].map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                currentPage === link.page
                  ? { background: "var(--c-surface)", color: "#FF5C00", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                  : { color: "var(--c-muted)" }
              }
              onMouseEnter={(e) => {
                if (currentPage !== link.page) {
                  (e.target as HTMLElement).style.background = "var(--c-surface)";
                  (e.target as HTMLElement).style.color = "var(--c-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== link.page) {
                  (e.target as HTMLElement).style.background = "transparent";
                  (e.target as HTMLElement).style.color = "var(--c-muted)";
                }
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{ color: "var(--c-muted)" }}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{ color: "var(--c-muted)" }}
          >
            <Bell size={16} />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-[#FF5C00] flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:block max-w-24 truncate" style={{ color: "var(--c-text)" }}>
                {userName || "Account"}
              </span>
              <ChevronDown size={14} style={{ color: "var(--c-muted)" }} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border shadow-lg overflow-hidden animate-scale-in z-50"
                style={{ background: "var(--c-surface)", borderColor: "var(--c-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
              >
                <div className="px-3 py-2.5 border-b" style={{ borderColor: "var(--c-border)" }}>
                  <p className="text-xs" style={{ color: "var(--c-muted)" }}>Signed in as</p>
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--c-text)" }}>{userName}</p>
                  <p className="text-xs text-[#FF5C00] capitalize mt-0.5">{role}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--c-muted)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--c-raised)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
