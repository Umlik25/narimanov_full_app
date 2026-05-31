import { useState } from "react";
import { Lock, User, Eye, EyeOff, ChevronRight, ShieldCheck } from "lucide-react";
import heydarImg from "../../imports/heyder_aliyev-2.jpg";
import { CityGrindLogo } from "./CityGrindLogo";

interface Props {
  onLogin: (username: string, password: string) => Promise<void>;
  onSignUp: () => void;
}

export function LoginScreen({ onLogin, onSignUp }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onLogin(cleanUsername, cleanPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        background: "#0B1120",
      }}
    >
      {/* ── Hero image with rounded bottom corners ── */}
      <div style={{ position: "relative", flexShrink: 0, height: 310, borderRadius: "0 0 36px 36px", overflow: "hidden" }}>
        <img
          src={heydarImg}
          alt="Heydar Aliyev Center"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 20%",
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(8,18,45,0.5) 0%, rgba(8,18,45,0.05) 40%, rgba(8,18,45,0.82) 100%)",
        }} />

        {/* Branding */}
        <div style={{ position: "absolute", bottom: 26, left: 24, right: 24, display: "flex", alignItems: "center", gap: 14 }}>
          <CityGrindLogo size={50} />
          <div>
            <div style={{ color: "white", fontSize: 22, fontFamily: "Inter, sans-serif", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
              City Grind
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 400, marginTop: 2 }}>
              City Services · Baku
            </div>
          </div>
        </div>
      </div>

      {/* ── Gap between image and form ── */}
      <div style={{ height: 20, flexShrink: 0, background: "#0B1120" }} />

      {/* ── Form sheet ── */}
      <div style={{
        flex: 1,
        background: "white",
        borderRadius: "28px 28px 0 0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        touchAction: "none",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 6, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: "#E5E7EB" }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "16px 24px 28px", display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 26, fontFamily: "Inter, sans-serif", fontWeight: 800, color: "#08122D", letterSpacing: "-0.6px", lineHeight: 1.1 }}>
                Welcome back
              </div>
              <div style={{ fontSize: 13, fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#9CA3AF", marginTop: 5 }}>
                Sign in to your account
              </div>
            </div>
            <div style={{
              padding: "7px 13px", borderRadius: 12,
              background: "#EEF3FF",
              color: "#0B5CFF",
              fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5,
              flexShrink: 0,
            }}>
              <User size={13} />
              Citizen
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: 14, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#6B7280", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>
              Username
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "0 16px", height: 54, borderRadius: 16,
              background: "#F9FAFB",
              border: `1.5px solid ${focusedField === "email" ? "#0B5CFF" : "#F0F0F0"}`,
              transition: "border-color 0.2s",
            }}>
              <User size={16} color={focusedField === "email" ? "#0B5CFF" : "#C0C0C0"} />
              <input
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "Inter, sans-serif", fontSize: 14, color: "#08122D" }}
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submit();
                  }
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 26, flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#6B7280", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Password
              </div>
              <button style={{ fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#0B5CFF", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Forgot password?
              </button>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "0 16px", height: 54, borderRadius: 16,
              background: "#F9FAFB",
              border: `1.5px solid ${focusedField === "password" ? "#0B5CFF" : "#F0F0F0"}`,
              transition: "border-color 0.2s",
            }}>
              <Lock size={16} color={focusedField === "password" ? "#0B5CFF" : "#C0C0C0"} />
              <input
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "Inter, sans-serif", fontSize: 14, color: "#08122D" }}
                placeholder="Enter your password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submit();
                  }
                }}
              />
              <button onClick={() => setShowPw(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#C0C0C0" }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: 14,
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

          {/* Sign In */}
          <button
            onClick={() => void submit()}
            disabled={loading}
            style={{
              width: "100%", height: 56, borderRadius: 18, border: "none", cursor: "pointer",
              background: loading ? "#7EA6FF" : "linear-gradient(135deg, #0B5CFF 0%, #1a3a8f 100%)",
              color: "white", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16,
              boxShadow: "0 8px 28px rgba(11,92,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              flexShrink: 0,
              letterSpacing: "-0.2px",
              opacity: loading ? 0.85 : 1,
            }}
          >
            {loading ? "Signing in..." : <>Sign In <ChevronRight size={19} /></>}
          </button>

          <button
            type="button"
            aria-label="Fast access with mygov ID"
            style={{
              width: "100%", height: 46, borderRadius: 16, border: "1.5px solid #D7E3FF", cursor: "pointer",
              background: "#F5F8FF",
              color: "#0B5CFF", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              flexShrink: 0, marginTop: 12,
            }}
          >
            <ShieldCheck size={17} />
            Continue with <span style={{ letterSpacing: "-0.2px" }}>mygov ID</span>
          </button>

          {/* Sign up nudge */}
          <div style={{ textAlign: "center", flexShrink: 0, marginTop: "auto", paddingTop: 12, paddingBottom: 6 }}>
            <span style={{ fontSize: 13, fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Don't have an account? </span>
            <button
              onClick={onSignUp}
              style={{ fontSize: 13, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#0B5CFF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Sign up
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
