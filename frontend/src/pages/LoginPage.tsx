import { useState } from "react";
import { Wrench, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { api, SPECIALTIES } from "../api";

type Role = "customer" | "technician" | "admin";

interface Props {
  onLogin: (role: Role, name: string, id: string, token: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const features = [
  "Verified technicians in 12 specialties",
  "Real-time request tracking & updates",
  "Competitive offers, transparent pricing",
  "Rated & reviewed by real customers",
];

export default function LoginPage({ onLogin, showToast }: Props) {
  const [tab, setTab]         = useState<"login" | "register">("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [role, setRole]       = useState<Role>("customer");
  const [specialty, setSpecialty] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    const data = await api.login(loginEmail, loginPassword);
    onLogin(data.role, data.name, data.id, data.token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        await doLogin(email, password);
        showToast("Welcome back!", "success");
      } else {
        if (role === "technician" && !specialty) {
          showToast("Choose a specialty to register as a technician.", "error");
          setLoading(false);
          return;
        }
        await api.register({ name, email, password, role, phone, specialty: role === "technician" ? specialty : undefined });
        await doLogin(email, password);
        showToast("Account created successfully!", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--c-bg)" }}>
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: "var(--c-bg-soft)", borderRight: "1px solid var(--c-border)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.08]"
            style={{ background: "radial-gradient(circle, #FF5C00, transparent)" }} />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #FF5C00, transparent)" }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-[#FF5C00] flex items-center justify-center shadow-lg">
              <Wrench size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
              FixIt
            </span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
              Home maintenance,{" "}
              <span className="text-[#FF5C00]">done right.</span>
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "var(--c-muted)" }}>
              Connect with skilled technicians in minutes. Post a request, receive offers, and get your home fixed fast.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--c-orange-bg)", border: "1px solid var(--c-orange-br)" }}>
                  <CheckCircle size={11} className="text-[#FF5C00]" />
                </div>
                <span className="text-sm" style={{ color: "var(--c-muted)" }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs" style={{ color: "var(--c-faint)" }}>© 2026 FixIt Technologies, Inc.</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: "var(--c-bg)" }}>
        <div className="w-full max-w-[400px] animate-fade-slide">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#FF5C00] flex items-center justify-center">
              <Wrench size={15} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>FixIt</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--c-text)" }}>
            {tab === "login" ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--c-muted)" }}>
            {tab === "login" ? "Welcome back — let's get things fixed." : "Join thousands of satisfied customers."}
          </p>

          <div className="flex p-1 rounded-xl mb-6" style={{ background: "var(--c-raised)" }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={
                  tab === t
                    ? { background: "var(--c-surface)", color: "var(--c-text)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                    : { color: "var(--c-muted)" }
                }
              >
                {t === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Sara Mitchell" required
                    className="input-focus w-full h-11 px-3.5 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="input-focus w-full h-11 px-3.5 rounded-xl" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="input-focus w-full h-11 px-3.5 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="input-focus w-full h-11 px-3.5 pr-10 rounded-xl" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--c-faint)" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {tab === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>I am a</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["customer", "technician"] as Role[]).map((r) => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className="h-10 rounded-xl text-sm font-medium transition-all duration-150 capitalize border"
                        style={
                          role === r
                            ? { borderColor: "#FF5C00", background: "var(--c-orange-bg)", color: "#FF5C00" }
                            : { borderColor: "var(--c-border)", color: "var(--c-muted)" }
                        }>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                {role === "technician" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--c-text)" }}>Specialty</label>
                    <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} required
                      className="input-focus w-full h-11 px-3.5 rounded-xl">
                      <option value="">Choose a specialty</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            <button type="submit" disabled={loading}
              className="btn-press w-full h-11 rounded-xl bg-[#FF5C00] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#E05000] transition-colors disabled:opacity-60 mt-2">
              {loading ? (
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-white"
                      style={{ animation: `pulse-dot 0.8s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </span>
              ) : (
                <>{tab === "login" ? "Sign in" : "Create account"}<ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
