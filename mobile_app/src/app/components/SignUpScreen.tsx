import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight } from "lucide-react";
import heydarImg from "../../imports/heyder_aliyev-2.jpg";
import { CityGrindLogo } from "./CityGrindLogo";

interface Props {
  onBack: () => void;
  onSignUp: (input: { username: string; password: string; email?: string | null }) => Promise<void>;
}

export function SignUpScreen({ onBack, onSignUp }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const confirm = form.confirm.trim();

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSignUp({
        username,
        password,
        email: email || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      overflow: "hidden", touchAction: "none", userSelect: "none",
      background: "#0B1120",
    }}>
      {/* ── Hero with rounded bottom corners ── */}
      <div style={{ position: "relative", flexShrink: 0, height: 268, borderRadius: "0 0 36px 36px", overflow: "hidden" }}>
        <img
          src={heydarImg}
          alt="Heydar Aliyev Center"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(8,18,45,0.65) 0%, rgba(8,18,45,0.2) 50%, rgba(8,18,45,0.88) 100%)",
        }} />

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute", top: 52, left: 20,
            width: 40, height: 40, borderRadius: 14, cursor: "pointer",
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowLeft size={18} color="white" />
        </button>

        {/* Title on image */}
        <div style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <CityGrindLogo size={32} />
            <span style={{ color: "white", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 700 }}>City Grind</span>
          </div>
          <div style={{ color: "white", fontSize: 22, fontFamily: "Inter, sans-serif", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Create Account
          </div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "Inter, sans-serif", marginTop: 3 }}>
            Join as a citizen of Baku
          </div>
        </div>
      </div>

      {/* ── Gap ── */}
      <div style={{ height: 14, flexShrink: 0, background: "#0B1120" }} />

      {/* ── Form sheet — fixed, no scroll ── */}
      <div style={{
        flex: 1, background: "white", borderRadius: "28px 28px 0 0",
        display: "flex", flexDirection: "column", overflow: "hidden",
        touchAction: "none", boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: "#E5E7EB" }} />
        </div>

        {/* Content — fixed layout, no overflow */}
        <div style={{ flex: 1, padding: "10px 24px 20px", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Personal Info section */}
          <div style={{ fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 10 }}>
            Personal Information
          </div>

          <Field label="Username" focused={focused === "username"}
            icon={<User size={15} color={focused === "username" ? "#0B5CFF" : "#C0C0C0"} />}>
            <input style={inputStyle} placeholder="Choose a username"
              value={form.username} onChange={e => set("username", e.target.value)}
              onFocus={() => setFocused("username")} onBlur={() => setFocused(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }} />
          </Field>

          <Field
            label="Email (optional)"
            focused={focused === "email"}
            icon={<Mail size={15} color={focused === "email" ? "#0B5CFF" : "#C0C0C0"} />}
          >
            <input
              style={inputStyle}
              placeholder="your@email.com"
              type="email"
              value={form.email} onChange={e => set("email", e.target.value)}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
          </Field>

          {/* Security section */}
          <div style={{ fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 10, marginTop: 14 }}>
            Security
          </div>

          <Field label="Password" focused={focused === "password"}
            icon={<Lock size={15} color={focused === "password" ? "#0B5CFF" : "#C0C0C0"} />}>
            <input style={inputStyle} placeholder="Create a strong password"
              type={showPw ? "text" : "password"}
              value={form.password} onChange={e => set("password", e.target.value)}
              onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }} />
            <button onClick={() => setShowPw(v => !v)} style={eyeBtn}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </Field>

          <Field label="Confirm Password" focused={focused === "confirm"}
            icon={<Lock size={15} color={focused === "confirm" ? "#0B5CFF" : "#C0C0C0"} />}>
            <input style={inputStyle} placeholder="Repeat your password"
              type={showCf ? "text" : "password"}
              value={form.confirm} onChange={e => set("confirm", e.target.value)}
              onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }} />
            <button onClick={() => setShowCf(v => !v)} style={eyeBtn}>
              {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </Field>

          <div style={{ height: 10 }} />

          {error && (
            <div style={{
              marginBottom: 10,
              borderRadius: 14,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#B91C1C",
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              padding: "10px 12px",
              lineHeight: 1.45,
            }}>
              {error}
            </div>
          )}

          {/* Create Account button */}
          <button
            onClick={() => void submit()}
            disabled={loading}
            style={{
              width: "100%", height: 54, borderRadius: 18, border: "none", cursor: "pointer",
              background: loading ? "#7EA6FF" : "linear-gradient(135deg, #0B5CFF 0%, #1a3a8f 100%)",
              color: "white", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15,
              boxShadow: "0 8px 28px rgba(11,92,255,0.38)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              flexShrink: 0, letterSpacing: "-0.2px",
              opacity: loading ? 0.85 : 1,
            }}
          >
            {loading ? "Creating account..." : <>Create Account <ChevronRight size={18} /></>}
          </button>

          {/* Sign in link */}
          <div style={{ textAlign: "center", marginTop: 14, flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Already have an account? </span>
            <button
              onClick={onBack}
              style={{ fontSize: 13, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#0B5CFF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1, border: "none", outline: "none", background: "transparent",
  fontFamily: "Inter, sans-serif", fontSize: 14, color: "#08122D",
};

const eyeBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  padding: 0, color: "#C0C0C0", flexShrink: 0,
};

function Field({ label, icon, focused, children }: {
  label: React.ReactNode;
  icon: React.ReactNode;
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600,
        color: focused ? "#0B5CFF" : "#6B7280", letterSpacing: "0.3px",
        marginBottom: 6, transition: "color 0.2s",
      }}>
        {label}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 14px", height: 48, borderRadius: 14,
        background: "#F9FAFB",
        border: `1.5px solid ${focused ? "#0B5CFF" : "#F0F0F0"}`,
        transition: "border-color 0.2s",
      }}>
        {icon}
        {children}
      </div>
    </div>
  );
}
