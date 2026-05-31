import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Menu, Bot, Navigation, ScanLine, CloudRain, Map as MapIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Issue, STATUS_COLORS } from "./mockData";
import { IssueBottomSheet } from "./IssueBottomSheet";
import { HamburgerMenu } from "./HamburgerMenu";

const NARIMANOV: [number, number] = [40.4093, 49.8671];

function createIssuePin(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.45);"></div>`,
    iconSize: [30, 30], iconAnchor: [15, 30],
  });
}

interface Props {
  currentScreen: string;
  issues?: Issue[];
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onStartReportWithPhoto: (file: File) => void;
  onViewIssueDetails: (issue: Issue) => void;
  userName: string;
}

export function MapScreen({ currentScreen, issues = [], onNavigate, onLogout, onStartReportWithPhoto, onViewIssueDetails, userName }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const scannerInputRef = useRef<HTMLInputElement>(null);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const visibleIssues = issues.filter(i => i.source !== "ai");

  // Init map
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current, {
      center: NARIMANOV, zoom: 15, zoomControl: false, attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Issue markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    visibleIssues.forEach(issue => {
      const marker = L.marker([issue.lat, issue.lng], { icon: createIssuePin(STATUS_COLORS[issue.status]) })
        .addTo(map).on("click", () => setSelectedIssue(issue));
      markersRef.current.push(marker);
    });
  }, [visibleIssues.map(i => i.id + i.status).join(",")]);

  function handleNavigate() {
    if (!mapRef.current) return;
    setNavigating(true);
    mapRef.current.flyTo(NARIMANOV, 15, { animate: true, duration: 0.9 });
    setTimeout(() => setNavigating(false), 1000);
  }

  function handleScannerPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    onStartReportWithPhoto(file);
  }

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#08122D" }}>
      {/* ── Full-screen map ── */}
      <div
        ref={mapDivRef}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: "calc(-1 * env(safe-area-inset-bottom))",
          left: 0,
          zIndex: 1,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 400, padding: "max(18px, calc(env(safe-area-inset-top) + 10px)) 14px 0", pointerEvents: "none" }}
      >
        <button aria-label="Open menu" onClick={() => setShowMenu(true)} style={{
          width: 54, height: 54, borderRadius: 18,
          background: "white", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.22)", pointerEvents: "auto",
        }}>
          <Menu size={25} color="#08122D" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.04 }}
        style={{
          position: "absolute",
          top: 0,
          left: 82,
          right: 14,
          zIndex: 400,
          paddingTop: "max(18px, calc(env(safe-area-inset-top) + 10px))",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: 54,
            borderRadius: 16,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid #E2EAF8",
            boxShadow: "0 8px 24px rgba(8,18,45,0.16)",
            backdropFilter: "blur(14px)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
            padding: 4,
            pointerEvents: "auto",
          }}
        >
          <button
            aria-label="City map"
            style={{
              border: "none",
              borderRadius: 12,
              background: "#0B5CFF",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <MapIcon size={16} />
            City
          </button>
          <button
            aria-label="Rain impact map"
            onClick={() => onNavigate("water_management")}
            style={{
              border: "none",
              borderRadius: 12,
              background: "transparent",
              color: "#667085",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <CloudRain size={17} />
            Rain
          </button>
        </div>
      </motion.div>

      {/* ── BOTTOM BAR ── */}
      <input
        id="map-scanner-camera-input"
        ref={scannerInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleScannerPhoto}
      />
      <div style={{
        position: "absolute",
        bottom: "var(--cg-bottom-gap)",
        left: 0,
        right: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        pointerEvents: "none",
      }}>
        <motion.button
          aria-label="Use current location"
          onClick={handleNavigate}
          animate={navigating ? { scale: [1, 1.15, 1] } : {}}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.4 }}
          style={{
            width: 64, height: 64, borderRadius: 999, border: "none", cursor: "pointer",
            background: navigating ? "linear-gradient(135deg,#0B5CFF,#1a3a8f)" : "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: navigating ? "0 4px 16px rgba(11,92,255,0.5)" : "0 4px 16px rgba(0,0,0,0.18)",
            transition: "background 0.3s, box-shadow 0.3s", flexShrink: 0, pointerEvents: "auto",
          }}
        >
          <Navigation size={27} color={navigating ? "white" : "#0B5CFF"} />
        </motion.button>

        <motion.label
          aria-label="Report Issue"
          htmlFor="map-scanner-camera-input"
          role="button"
          tabIndex={0}
          whileTap={{ scale: 0.93 }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              scannerInputRef.current?.click();
            }
          }}
          style={{
          width: 86, height: 86, borderRadius: 999, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#0B5CFF,#1933B7)",
          color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 14px 34px rgba(11,92,255,0.48), 0 0 0 8px rgba(255,255,255,0.28)",
          flexShrink: 0, pointerEvents: "auto",
        }}>
          <ScanLine size={38} strokeWidth={2.4} />
        </motion.label>

        <motion.button aria-label="Open AI Assistant" whileTap={{ scale: 0.94 }} onClick={() => onNavigate("ai_chat")} style={{
          width: 64, height: 64, borderRadius: 999, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#7C3AED,#5b21b6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(124,58,237,0.4)", flexShrink: 0, pointerEvents: "auto",
        }}>
          <Bot size={27} color="white" />
        </motion.button>
      </div>

      {/* Issue bottom sheet */}
      <AnimatePresence>
        {selectedIssue && (
          <div style={{ zIndex: 500, position: "absolute", inset: 0 }}>
            <IssueBottomSheet
              issue={selectedIssue}
              onClose={() => setSelectedIssue(null)}
              onViewDetails={issue => { setSelectedIssue(null); onViewIssueDetails(issue); }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Hamburger menu */}
      <AnimatePresence>
        {showMenu && (
          <div style={{ zIndex: 600, position: "absolute", inset: 0 }}>
            <HamburgerMenu
              currentScreen={currentScreen} onNavigate={onNavigate}
              onClose={() => setShowMenu(false)} onLogout={onLogout} userName={userName}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
