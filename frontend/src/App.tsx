import { useState, useCallback, useEffect } from "react";
import Navbar from "./components/Navbar";
import Toast, { ToastData } from "./components/Toast";
import LoginPage from "./pages/LoginPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import NewRequest from "./pages/NewRequest";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import RequestDetail from "./pages/RequestDetail";
import AdminDashboard from "./pages/AdminDashboard";

type Role = "customer" | "technician" | "admin";
type Page =
  | "login"
  | "customer-dashboard"
  | "new-request"
  | "technician-dashboard"
  | "request-detail"
  | "admin-dashboard";

export default function App() {
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem("fixit_role") as Role) || null);
  const [userName, setUserName] = useState(() => localStorage.getItem("fixit_name") || "");
  const [userId, setUserId] = useState(() => localStorage.getItem("fixit_id") || "");
  const [page, setPage] = useState<Page>(() => {
    const savedRole = localStorage.getItem("fixit_role");
    if (savedRole === "customer") return "customer-dashboard";
    if (savedRole === "technician") return "technician-dashboard";
    if (savedRole === "admin") return "admin-dashboard";
    return "login";
  });
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const showToast = useCallback((message: string, type: ToastData["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLogin = (r: Role, name: string, id: string, token: string) => {
    localStorage.setItem("fixit_token", token);
    localStorage.setItem("fixit_role", r);
    localStorage.setItem("fixit_name", name);
    localStorage.setItem("fixit_id", id);
    setRole(r);
    setUserName(name);
    setUserId(id);
    if (r === "customer") setPage("customer-dashboard");
    else if (r === "technician") setPage("technician-dashboard");
    else setPage("admin-dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("fixit_token");
    localStorage.removeItem("fixit_role");
    localStorage.removeItem("fixit_name");
    localStorage.removeItem("fixit_id");
    setRole(null);
    setUserName("");
    setUserId("");
    setPage("login");
    showToast("You've been signed out.", "info");
  };

  const navigate = (p: Page) => setPage(p);

  return (
    <div className="min-h-screen" style={{ background: "var(--c-bg-soft)" }}>
      <Navbar
        role={role}
        currentPage={page}
        onNavigate={navigate}
        onLogout={handleLogout}
        userName={userName}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
      />

      <main>
        {page === "login" && (
          <LoginPage onLogin={handleLogin} showToast={showToast} />
        )}
        {page === "customer-dashboard" && role === "customer" && (
          <CustomerDashboard
            onNewRequest={() => navigate("new-request")}
            onViewDetail={(id) => { setSelectedRequestId(id); navigate("request-detail"); }}
          />
        )}
        {page === "new-request" && role === "customer" && (
          <NewRequest
            onBack={() => navigate("customer-dashboard")}
            onSubmit={() => navigate("customer-dashboard")}
            showToast={showToast}
          />
        )}
        {page === "technician-dashboard" && role === "technician" && (
          <TechnicianDashboard
            showToast={showToast}
            onViewDetail={(id) => { setSelectedRequestId(id); navigate("request-detail"); }}
          />
        )}
        {page === "request-detail" && role && (
          <RequestDetail
            requestId={selectedRequestId}
            role={role}
            userId={userId}
            onBack={() => navigate(role === "technician" ? "technician-dashboard" : "customer-dashboard")}
            showToast={showToast}
          />
        )}
        {page === "admin-dashboard" && role === "admin" && (
          <AdminDashboard showToast={showToast} />
        )}
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
