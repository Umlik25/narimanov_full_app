import { useState } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight } from "lucide-react";
import heydarImg from "../../imports/heyder_aliyev-2.jpg";
import { CityGrindLogo } from "./CityGrindLogo";

interface Props {
  onBack: () => void;
  onSignUp: () => void;
}

export function SignUpScreen({ onBack, onSignUp }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [contactMode, setContactMode] = useState<'phone' | 'email'>('phone');
  const [form, setForm] = useState({ name: "", phone: "", password: "", confirm: "" });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

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

          <Field label="Full Name" focused={focused === "name"}
            icon={<User size={15} color={focused === "name" ? "#0B5CFF" : "#C0C0C0"} />}>
            <input style={inputStyle} placeholder="Enter your full name"
              value={form.name} onChange={e => set("name", e.target.value)}
              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
          </Field>

          <Field
            label={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{contactMode === 'phone' ? 'Phone Number' : 'Email Address'}</span>
                <button
                  onClick={() => setContactMode(m => m === 'phone' ? 'email' : 'phone')}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "#EEF3FF", border: "none", borderRadius: 8, cursor: "pointer",
                    padding: "3px 8px", color: "#0B5CFF",
                    fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 10,
                  }}
                >
                  {contactMode === 'phone' ? <Mail size={10} /> : <Phone size={10} />}
                  Use {contactMode === 'phone' ? 'Email' : 'Phone'}
                </button>
              </div>
            }
            focused={focused === "phone"}
            icon={contactMode === 'phone'
              ? <Phone size={15} color={focused === "phone" ? "#0B5CFF" : "#C0C0C0"} />
              : <Mail size={15} color={focused === "phone" ? "#0B5CFF" : "#C0C0C0"} />
            }
          >
            <input
              style={inputStyle}
              placeholder={contactMode === 'phone' ? '+994 XX XXX XX XX' : 'your@email.com'}
              type={contactMode === 'phone' ? 'tel' : 'email'}
              value={form.phone} onChange={e => set("phone", e.target.value)}
              onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
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
              onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} />
            <button onClick={() => setShowPw(v => !v)} style={eyeBtn}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </Field>

          <Field label="Confirm Password" focused={focused === "confirm"}
            icon={<Lock size={15} color={focused === "confirm" ? "#0B5CFF" : "#C0C0C0"} />}>
            <input style={inputStyle} placeholder="Repeat your password"
              type={showCf ? "text" : "password"}
              value={form.confirm} onChange={e => set("confirm", e.target.value)}
              onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)} />
            <button onClick={() => setShowCf(v => !v)} style={eyeBtn}>
              {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </Field>

          <div style={{ height: 10 }} />

          {/* Create Account button */}
          <button
            onClick={onSignUp}
            style={{
              width: "100%", height: 54, borderRadius: 18, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #0B5CFF 0%, #1a3a8f 100%)",
              color: "white", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15,
              boxShadow: "0 8px 28px rgba(11,92,255,0.38)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              flexShrink: 0, letterSpacing: "-0.2px",
            }}
          >
            Create Account <ChevronRight size={18} />
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
