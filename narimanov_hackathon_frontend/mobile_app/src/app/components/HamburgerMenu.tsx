import { X, Map, FileText, Bot, User, LogOut, MapPin, ChevronRight, Gift, CloudRain } from "lucide-react";
import { motion } from "motion/react";

type Screen = string;

interface Props {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onClose: () => void;
  onLogout: () => void;
  userName: string;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  screen: Screen;
  color: string;
  bg: string;
}

// Groups: each group separated by a thin divider, no text labels
const userGroups: NavItem[][] = [
  [
    { icon: <Map size={16} />, label: 'Map', screen: 'user_map', color: '#0B5CFF', bg: '#EEF3FF' },
    { icon: <CloudRain size={16} />, label: 'Rain Map', screen: 'water_management', color: '#0EA5E9', bg: '#EAF7FF' },
  ],
  [
    { icon: <FileText size={16} />, label: 'My Reports', screen: 'my_reports', color: '#F97316', bg: '#FFF4ED' },
    { icon: <Gift size={16} />, label: 'Rewards', screen: 'rewards', color: '#0B5CFF', bg: '#EEF3FF' },
  ],
  [
    { icon: <Bot size={16} />, label: 'AI Assistant', screen: 'ai_chat', color: '#7C3AED', bg: '#F3EEFF' },
    { icon: <User size={16} />, label: 'Profile', screen: 'profile', color: '#6B7280', bg: '#F3F4F6' },
  ],
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function HamburgerMenu({ currentScreen, onNavigate, onClose, onLogout, userName }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex" }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(8,18,45,0.6)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: -310 }}
        animate={{ x: 0 }}
        exit={{ x: -310 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: "relative",
          width: 290,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0 32px 32px 0",
          overflow: "hidden",
          boxShadow: "12px 0 60px rgba(0,0,0,0.4)",
          background: "#FFFFFF",
          touchAction: "none",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(150deg, #08122D 0%, #0B2A8A 55%, #1248E8 100%)",
          padding: "calc(var(--cg-safe-top) + 18px) 18px 20px",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -35, right: -35, width: 110, height: 110, borderRadius: "50%", background: "rgba(11,92,255,0.22)" }} />
          <div style={{ position: "absolute", bottom: -25, left: -12, width: 90, height: 90, borderRadius: "50%", background: "rgba(124,58,237,0.18)" }} />

          <button onClick={onClose} style={{
            position: "absolute", top: "calc(var(--cg-safe-top) + 18px)", right: 16,
            width: 30, height: 30, borderRadius: 10,
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <X size={13} color="white" />
          </button>

          {/* Avatar + name row */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 15, flexShrink: 0,
              background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.07))",
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontFamily: "Inter, sans-serif", fontWeight: 800, color: "white",
            }}>
              {getInitials(userName)}
            </div>
            <div>
              <div style={{ color: "white", fontSize: 14, fontFamily: "Inter, sans-serif", fontWeight: 700, letterSpacing: "-0.2px" }}>
                {userName}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                <span style={{
                  fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "white",
                  background: "linear-gradient(135deg,#0B5CFF,#1a3a8f)",
                  padding: "2px 8px", borderRadius: 20,
                }}>
                  Citizen
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={9} color="rgba(255,255,255,0.4)" />
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Inter, sans-serif" }}>Narimanov</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav items — fixed layout, no scroll ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "12px 10px var(--cg-bottom-gap)",
          overflow: "hidden",
          touchAction: "none",
        }}>
          {/* Groups */}
          <div>
            {userGroups.map((group, gi) => (
              <div key={gi}>
                {group.map(({ icon, label, screen, color, bg }) => {
                  const isActive = currentScreen === screen;
                  return (
                    <motion.button
                      key={screen}
                      onClick={() => { onNavigate(screen); onClose(); }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 11,
                        padding: "6px 8px",
                        background: isActive ? `linear-gradient(135deg,${color}16,${color}06)` : "transparent",
                        border: "none", cursor: "pointer", borderRadius: 13, marginBottom: 1,
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                        background: isActive ? color : bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: isActive ? `0 3px 10px ${color}45` : "none",
                        transition: "all 0.2s",
                      }}>
                        <span style={{ color: isActive ? "white" : color }}>{icon}</span>
                      </div>
                      <span style={{
                        flex: 1, textAlign: "left",
                        fontSize: 13, fontFamily: "Inter, sans-serif",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? color : "#1E2A3B",
                      }}>
                        {label}
                      </span>
                      {isActive
                        ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}` }} />
                        : <ChevronRight size={13} color="#D0D8E4" />
                      }
                    </motion.button>
                  );
                })}
                {/* Divider between groups */}
                {gi < userGroups.length - 1 && (
                  <div style={{ height: 1, background: "#EFF2F7", margin: "5px 4px" }} />
                )}
              </div>
            ))}
          </div>

          {/* ── Bottom: Logout + version ── */}
          <div>
            <div style={{ height: 1, background: "#EFF2F7", margin: "0 4px 6px" }} />
            <motion.button
              onClick={onLogout}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 11,
                padding: "6px 8px",
                background: "transparent", border: "none", cursor: "pointer", borderRadius: 13,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: "#FEE2E2",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <LogOut size={16} color="#E53935" />
              </div>
              <span style={{ fontSize: 13, fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#E53935" }}>
                Logout
              </span>
            </motion.button>
            <div style={{ textAlign: "center", paddingTop: 8, fontSize: 9, fontFamily: "Inter, sans-serif", color: "#C4CDDC", letterSpacing: "0.5px" }}>
              CITY GRIND · v1.0.0
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
