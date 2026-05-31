import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Menu, Plus, Bot, Navigation, Search, SlidersHorizontal, X, MapPin, Loader, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { mockIssues, Issue, STATUS_COLORS, STATUS_LABELS, IssueStatus, CATEGORY_ICONS } from "./mockData";
import { IssueBottomSheet } from "./IssueBottomSheet";
import { HamburgerMenu } from "./HamburgerMenu";

interface SearchSuggestion {
  type: 'issue' | 'place';
  label: string;
  sub: string;
  lat: number;
  lng: number;
  issue?: Issue;
  icon?: string;
  zoom?: number; // override zoom level on flyTo
}

const NARIMANOV: [number, number] = [40.4093, 49.8671];

// Azerbaijan bounding box for coordinate validation
const AZ_BOUNDS = { minLat: 38.3, maxLat: 41.95, minLng: 44.7, maxLng: 50.8 };
function inAzerbaijan(lat: number, lng: number) {
  return lat >= AZ_BOUNDS.minLat && lat <= AZ_BOUNDS.maxLat && lng >= AZ_BOUNDS.minLng && lng <= AZ_BOUNDS.maxLng;
}

// Hardcoded precise coordinates for well-known Azerbaijan landmarks
// All coordinates verified against OSM/satellite imagery
const AZ_LANDMARKS: { keywords: string[]; label: string; sub: string; lat: number; lng: number; zoom: number }[] = [
  // Baku mosques & religious sites
  // All coordinates from Wikipedia verified DMS conversions
  // Bibi-Heybat: 40°20′13″N 49°49′52″E = 40.3370, 49.8311
  { keywords: ['bibi heybat', 'bibi-heybat', 'bibiheybat', 'heybat mosque', 'heybət', 'bibi heybet', 'bibi xanım', 'bibi'], label: 'Bibi-Heybat Mosque', sub: 'Caspian Coast, Baku', lat: 40.3370, lng: 49.8311, zoom: 18 },
  { keywords: ['taza pir', 'tazapir', 'tazəpir mosque'], label: 'Taza Pir Mosque', sub: 'Baku', lat: 40.3741, lng: 49.8461, zoom: 19 },
  { keywords: ['juma mosque', 'cümə məscidi', 'friday mosque icheri'], label: 'Juma Mosque (Old City)', sub: 'İçərişəhər, Baku', lat: 40.3659, lng: 49.8356, zoom: 19 },
  // Maiden Tower: 40°21′58″N 49°50′13″E = 40.3661, 49.8369
  { keywords: ['maiden tower', 'qiz qalasi', 'qız qalası', 'kiz kalesi'], label: 'Maiden Tower', sub: 'İçərişəhər, Baku', lat: 40.3661, lng: 49.8369, zoom: 19 },
  // Heydar Aliyev Center: 40°23′43″N 49°52′02″E = 40.3953, 49.8672
  { keywords: ['heydar aliyev center', 'heydər əliyev mərkəzi', 'heydar aliev center', 'heyder aliyev center', 'aliyev center'], label: 'Heydar Aliyev Center', sub: 'Narimanov, Baku', lat: 40.3953, lng: 49.8672, zoom: 18 },
  // Flame Towers: 40°21′58″N 49°50′39″E = 40.3661, 49.8442
  { keywords: ['flame tower', 'alov qulesi', 'alov qülələri', 'flame towers', 'alov qüllələri'], label: 'Flame Towers', sub: 'Səbail, Baku', lat: 40.3661, lng: 49.8442, zoom: 18 },
  { keywords: ['icherisheher', 'icheri sheher', 'içərişəhər', 'old city baku', 'baku old city', 'inner city'], label: 'İçərişəhər (Old City)', sub: 'Səbail, Baku', lat: 40.3663, lng: 49.8352, zoom: 17 },
  { keywords: ['baku boulevard', 'bulvar', 'primorsky boulevard', 'dəniz kənarı'], label: 'Baku Boulevard', sub: 'Baku', lat: 40.3617, lng: 49.8399, zoom: 17 },
  { keywords: ['nizami street', 'nizami küçəsi', 'istiqlaliyyət küçəsi'], label: 'Nizami Street', sub: 'Baku', lat: 40.3716, lng: 49.8375, zoom: 18 },
  // Baku Station: 40°22′45″N 49°51′02″E = 40.3792, 49.8506
  { keywords: ['baku railway', 'baki vokzal', 'dəmiryol vokzalı', 'train station baku', 'vokzal'], label: 'Baku Railway Station', sub: 'Baku', lat: 40.3792, lng: 49.8506, zoom: 18 },
  { keywords: ['crystal hall', 'kristal zal', 'eurovision baku'], label: 'Crystal Hall', sub: 'Baku', lat: 40.3494, lng: 49.8430, zoom: 18 },
  // Tofiq Bahramov: 40°24′34″N 49°51′44″E = 40.4094, 49.8622
  { keywords: ['tofiq bahramov', 'republican stadium', 'national stadium baku', 'olympic stadium baku'], label: 'Tofiq Bahramov Stadium', sub: 'Narimanov, Baku', lat: 40.4094, lng: 49.8622, zoom: 18 },
  { keywords: ['white city', 'ağ şəhər', 'ag sheher'], label: 'White City (Ağ Şəhər)', sub: 'Baku', lat: 40.3800, lng: 49.8910, zoom: 17 },
  { keywords: ['narimanov district', 'nərimanov rayonu', 'narimanov rayon'], label: 'Narimanov District', sub: 'Baku', lat: 40.4093, lng: 49.8671, zoom: 15 },
  // Airport: 40°28′05″N 50°02′50″E = 40.4681, 50.0472
  { keywords: ['baku airport', 'heydar aliyev airport', 'hava limanı', 'gyd', 'beynəlxalq aeroport'], label: 'Heydar Aliyev International Airport', sub: 'Baku', lat: 40.4681, lng: 50.0472, zoom: 16 },
  // Ateshgah: 40°24′35″N 50°04′19″E = 40.4097, 50.0719
  { keywords: ['ateshgah', 'atəşgah', 'fire temple', 'surakhani fire', 'atash'], label: 'Ateshgah Fire Temple', sub: 'Suraxanı, Baku', lat: 40.4097, lng: 50.0719, zoom: 18 },
  // Gobustan: 40°04′19″N 49°22′22″E = 40.0719, 49.3728
  { keywords: ['gobustan', 'qobustan', 'rock art', 'petroglyph'], label: 'Gobustan National Park', sub: 'Gobustan, Azerbaijan', lat: 40.0719, lng: 49.3728, zoom: 15 },
  // Yanar Dag: 40°30′05″N 49°56′02″E = 40.5014, 49.9339
  { keywords: ['yanardağ', 'yanardag', 'burning mountain', 'fire mountain'], label: 'Yanar Dağ (Burning Mountain)', sub: 'Abşeron, Baku', lat: 40.5014, lng: 49.9339, zoom: 18 },
  // Cities - Wikipedia coordinates
  { keywords: ['sumgait', 'sumqayit', 'sumgayit city'], label: 'Sumqayıt', sub: 'Sumqayıt, Azerbaijan', lat: 40.5897, lng: 49.6686, zoom: 13 },
  { keywords: ['ganja', 'gəncə', 'gence city'], label: 'Gəncə', sub: 'Ganja, Azerbaijan', lat: 40.6828, lng: 46.3606, zoom: 13 },
  { keywords: ['sheki', 'şəki', 'shaki city'], label: 'Şəki', sub: 'Sheki, Azerbaijan', lat: 41.1990, lng: 47.1706, zoom: 13 },
  { keywords: ['lankaran', 'lənkəran', 'lenkoran'], label: 'Lənkəran', sub: 'Lankaran, Azerbaijan', lat: 38.7529, lng: 48.8516, zoom: 13 },
  { keywords: ['gabala', 'qəbələ', 'gabala city'], label: 'Qəbələ', sub: 'Gabala, Azerbaijan', lat: 40.9979, lng: 47.8453, zoom: 13 },
  { keywords: ['shamakhi', 'şamaxı', 'samaxi'], label: 'Şamaxı', sub: 'Shamakhi, Azerbaijan', lat: 40.6314, lng: 48.6461, zoom: 13 },
  { keywords: ['mingachevir', 'mingəçevir', 'mingechaur'], label: 'Mingəçevir', sub: 'Mingachevir, Azerbaijan', lat: 40.7703, lng: 47.0500, zoom: 13 },
  { keywords: ['nakhchivan', 'naxçıvan', 'nakhichevan'], label: 'Naxçıvan', sub: 'Nakhchivan, Azerbaijan', lat: 39.2090, lng: 45.4120, zoom: 13 },
];

function matchLandmarks(q: string): SearchSuggestion[] {
  const lower = q.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(w => w.length >= 3);
  return AZ_LANDMARKS
    .filter(lm => lm.keywords.some(kw =>
      kw.includes(lower) ||
      lower.includes(kw) ||
      words.some(w => kw.includes(w))
    ))
    .map(lm => ({ type: 'place' as const, label: lm.label, sub: lm.sub, lat: lm.lat, lng: lm.lng, zoom: lm.zoom }));
}

const STATUS_FILTERS = ["all", "new", "ai_review", "assigned", "in_progress", "overdue", "resolved"] as const;
const LEGEND_ITEMS = [
  { color: "#0B5CFF", label: "New" },
  { color: "#7C3AED", label: "AI Review" },
  { color: "#F97316", label: "In Progress" },
  { color: "#E53935", label: "Overdue" },
  { color: "#16A34A", label: "Resolved" },
];

function createIssuePin(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.45);"></div>`,
    iconSize: [30, 30], iconAnchor: [15, 30],
  });
}

function createSearchPin() {
  return L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#0B5CFF,#7C3AED);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 18px rgba(11,92,255,0.7);"></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36],
  });
}

interface Props {
  role: "user" | "admin";
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onViewIssueDetails: (issue: Issue) => void;
  userName: string;
}

export function MapScreen({ role, currentScreen, onNavigate, onLogout, onViewIssueDetails, userName }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchPinRef = useRef<L.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [navigating, setNavigating] = useState(false);

  // Search — Google Maps style
  const [searchActive, setSearchActive] = useState(false); // is search panel open?
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pinnedResult, setPinnedResult] = useState<SearchSuggestion | null>(null);

  const visibleIssues = role === "user" ? mockIssues.filter(i => i.source !== "ai") : mockIssues;
  const filtered = activeFilter === "all" ? visibleIssues : visibleIssues.filter(i => i.status === activeFilter);
  const activeCount = visibleIssues.filter(i => ["new", "assigned", "in_progress"].includes(i.status)).length;
  const aiCount = visibleIssues.filter(i => i.status === "ai_review").length;
  const overdueCount = visibleIssues.filter(i => i.status === "overdue").length;

  // Init map
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current, {
      center: NARIMANOV, zoom: 15, zoomControl: false, attributionControl: false,
    });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 }).addTo(map);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, opacity: 0.75 }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Issue markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    filtered.forEach(issue => {
      const marker = L.marker([issue.lat, issue.lng], { icon: createIssuePin(STATUS_COLORS[issue.status]) })
        .addTo(map).on("click", () => { setSelectedIssue(issue); closeSearch(); });
      markersRef.current.push(marker);
    });
  }, [filtered.map(i => i.id + i.status).join(",")]);

  // Debounced geocoding — Google-style: viewbox bias, multi-strategy fallback
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) { setSuggestions([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      const q = searchQuery.toLowerCase().trim();

      // Fuzzy issue matching — score by how many query words match
      const words = q.split(/\s+/).filter(Boolean);
      const scoredIssues = visibleIssues
        .map(i => {
          const hay = `${i.title} ${i.location} ${i.description} ${i.category}`.toLowerCase();
          let score = 0;
          words.forEach(w => {
            if (hay.includes(w)) score += w.length; // longer match = more weight
          });
          // Bonus for prefix match on title
          if (i.title.toLowerCase().startsWith(q)) score += 10;
          return { issue: i, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => ({
          type: 'issue' as const,
          label: x.issue.title,
          sub: x.issue.location,
          lat: x.issue.lat,
          lng: x.issue.lng,
          issue: x.issue,
          icon: CATEGORY_ICONS[x.issue.category],
        }));

      // Check local landmark database first (precise hardcoded coords)
      const landmarkHits = matchLandmarks(searchQuery);

      // Nominatim — 3 parallel queries for maximum coverage across Azerbaijan
      const BASE = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&countrycodes=az&limit=50";
      const headers = { 'Accept-Language': 'en', 'User-Agent': 'CityGrind/1.0' };

      let nominatimResults: SearchSuggestion[] = [];
      try {
        const [r1, r2, r3] = await Promise.allSettled([
          fetch(`${BASE}&q=${encodeURIComponent(searchQuery)}`, { headers }).then(r => r.json()),
          fetch(`${BASE}&q=${encodeURIComponent(searchQuery + ' küçəsi')}`, { headers }).then(r => r.json()),
          fetch(`${BASE}&q=${encodeURIComponent(searchQuery + ' Azerbaijan')}`, { headers }).then(r => r.json()),
        ]);

        const allRaw: any[] = [
          ...(r1.status === 'fulfilled' ? r1.value : []),
          ...(r2.status === 'fulfilled' ? r2.value : []),
          ...(r3.status === 'fulfilled' ? r3.value : []),
        ];

        // Deduplicate by place_id, and validate coordinates are actually in Azerbaijan
        const seen = new Set<string>();
        nominatimResults = allRaw
          .filter(r => {
            if (seen.has(r.place_id)) return false;
            seen.add(r.place_id);
            const lat = parseFloat(r.lat);
            const lng = parseFloat(r.lon);
            return inAzerbaijan(lat, lng); // discard anything outside AZ bounds
          })
          .slice(0, 10)
          .map((r: any) => {
            const label = r.namedetails?.['name:az'] || r.namedetails?.['name:en'] || r.namedetails?.name || r.name || r.display_name.split(',')[0];
            const parts = r.display_name.split(',');
            const sub = parts.slice(1, 4).join(', ').trim() || 'Azerbaijan';
            return { type: 'place' as const, label, sub, lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
          });
      } catch (_) {}

      // Merge: landmarks first (precise), then Nominatim, deduplicated by label
      const usedLabels = new Set(landmarkHits.map(l => l.label.toLowerCase()));
      const filteredNominatim = nominatimResults.filter(r => !usedLabels.has(r.label.toLowerCase()));
      const placeSuggestions = [...landmarkHits, ...filteredNominatim].slice(0, 12);

      setSuggestions([...scoredIssues, ...placeSuggestions]);
      setSearchLoading(false);
    }, 420);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  function openSearch() {
    setSearchActive(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function closeSearch() {
    setSearchActive(false);
    setSearchQuery("");
    setSuggestions([]);
    inputRef.current?.blur();
  }

  function placeSearchPin(lat: number, lng: number) {
    if (!mapRef.current) return;
    if (searchPinRef.current) { searchPinRef.current.remove(); searchPinRef.current = null; }
    searchPinRef.current = L.marker([lat, lng], { icon: createSearchPin(), zIndexOffset: 1000 }).addTo(mapRef.current);
  }

  function handleSelectSuggestion(s: SearchSuggestion) {
    closeSearch();
    setPinnedResult(s);
    const zoom = s.zoom ?? (s.type === 'issue' ? 18 : 17);
    if (mapRef.current) mapRef.current.flyTo([s.lat, s.lng], zoom, { animate: true, duration: 1.0 });
    if (s.type === 'place') {
      placeSearchPin(s.lat, s.lng);
    } else {
      if (searchPinRef.current) { searchPinRef.current.remove(); searchPinRef.current = null; }
      if (s.issue) setSelectedIssue(s.issue);
    }
  }

  function handleNavigate() {
    if (!mapRef.current) return;
    setNavigating(true);
    mapRef.current.flyTo(NARIMANOV, 15, { animate: true, duration: 0.9 });
    setTimeout(() => setNavigating(false), 1000);
  }

  const issueSuggestions = suggestions.filter(s => s.type === 'issue');
  const placeSuggestions = suggestions.filter(s => s.type === 'place');

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ── Full-screen map ── */}
      <div ref={mapDivRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

      {/* ── Normal top bar (when search is closed) ── */}
      <AnimatePresence>
        {!searchActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 400, padding: "var(--cg-map-top) 14px 0", pointerEvents: "none" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
              <button onClick={() => setShowMenu(true)} style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: "white", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
              }}>
                <Menu size={20} color="#08122D" />
              </button>

              {/* Tap to open search */}
              <button onClick={openSearch} style={{
                flex: 1, display: "flex", alignItems: "center", gap: 8,
                background: "white", borderRadius: 14, padding: "0 14px", height: 44,
                border: "none", cursor: "pointer", textAlign: "left",
                boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
              }}>
                <Search size={15} color="#9CA3AF" />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: pinnedResult ? "#08122D" : "#9CA3AF", fontWeight: pinnedResult ? 600 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pinnedResult ? pinnedResult.label : "Search streets, issues, places…"}
                </span>
                {pinnedResult && (
                  <button onClick={e => { e.stopPropagation(); setPinnedResult(null); if (searchPinRef.current) { searchPinRef.current.remove(); searchPinRef.current = null; } }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    <X size={14} color="#9CA3AF" />
                  </button>
                )}
              </button>

              {role === "admin" && (
                <button onClick={() => setShowFilters(f => !f)} style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: showFilters ? "#0B5CFF" : "white", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: showFilters ? "0 4px 16px rgba(11,92,255,0.4)" : "0 4px 16px rgba(0,0,0,0.22)",
                  transition: "all 0.2s", pointerEvents: "auto",
                }}>
                  {showFilters ? <X size={18} color="white" /> : <SlidersHorizontal size={18} color="#08122D" />}
                </button>
              )}
            </div>

            {/* Filter pills */}
            <AnimatePresence>
              {role === "admin" && showFilters && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0.85 }} animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0.85 }} transition={{ duration: 0.18 }}
                  style={{ pointerEvents: "auto", marginTop: 8 }}
                >
                  <div style={{
                    background: "rgba(255,255,255,0.98)", borderRadius: 18, padding: "12px",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.18)", backdropFilter: "blur(14px)",
                    display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7,
                    maxWidth: "100%",
                  }}>
                    {STATUS_FILTERS.map(f => {
                      const isActive = activeFilter === f;
                      return (
                        <button key={f} onClick={() => setActiveFilter(f)} style={{
                          padding: "8px 6px", borderRadius: 14, border: "none", cursor: "pointer",
                          background: isActive ? "#0B5CFF" : "#F3F4F6",
                          color: isActive ? "white" : "#374151",
                          fontFamily: "Inter, sans-serif", fontWeight: 750, fontSize: 10.5,
                          boxShadow: isActive ? "0 2px 8px rgba(11,92,255,0.4)" : "none",
                          transition: "all 0.15s",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {f === "all" ? "All" : STATUS_LABELS[f as IssueStatus]}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Google Maps-style search panel ── */}
      <AnimatePresence>
        {searchActive && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ position: "absolute", inset: 0, zIndex: 500, pointerEvents: "none" }}
          >
            {/* Dimmed backdrop */}
            <div
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", pointerEvents: "auto" }}
              onClick={closeSearch}
            />

            {/* Search panel */}
            <motion.div
              initial={{ y: -20 }} animate={{ y: 0 }}
              exit={{ y: -20 }} transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "absolute", top: 0, left: 0, right: 0,
                background: "white", pointerEvents: "auto",
                borderRadius: "0 0 24px 24px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                paddingTop: "var(--cg-map-top)",
                overflow: "hidden",
              }}
            >
              {/* Input row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px 12px" }}>
                <button onClick={closeSearch} style={{
                  width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                  background: "#F3F4F6", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ArrowLeft size={18} color="#08122D" />
                </button>

                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 8,
                  background: "#F3F4F6", borderRadius: 14, padding: "0 12px", height: 44,
                }}>
                  {searchLoading
                    ? <Loader size={14} color="#0B5CFF" style={{ flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
                    : <Search size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  }
                  <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1, border: "none", outline: "none", background: "transparent",
                      fontFamily: "Inter, sans-serif", fontSize: 14, color: "#08122D",
                    }}
                    placeholder="Search Narimanov district…"
                  />
                  {searchQuery.length > 0 && (
                    <button onClick={() => { setSearchQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <X size={14} color="#9CA3AF" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results list */}
              {suggestions.length > 0 && (
                <div style={{ maxHeight: 380, overflowY: "auto", scrollbarWidth: "none" }}>
                  {/* Issues */}
                  {issueSuggestions.length > 0 && (
                    <>
                      <div style={{ padding: "4px 18px 4px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#0B5CFF", letterSpacing: "0.7px", textTransform: "uppercase" }}>Issues nearby</span>
                        <div style={{ flex: 1, height: 1, background: "#EEF3FF" }} />
                      </div>
                      {issueSuggestions.map((s, i) => (
                        <button key={`iss-${i}`} onClick={() => handleSelectSuggestion(s)} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 18px", border: "none", background: "white", cursor: "pointer",
                          borderBottom: "1px solid #F8F9FB",
                        }}>
                          <div style={{ width: 38, height: 38, borderRadius: 12, background: "#EEF3FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                            {s.icon}
                          </div>
                          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: "#08122D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</div>
                          </div>
                          {s.issue && (
                            <span style={{ fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "white", background: STATUS_COLORS[s.issue.status], padding: "3px 8px", borderRadius: 10, flexShrink: 0 }}>
                              {STATUS_LABELS[s.issue.status]}
                            </span>
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Places */}
                  {placeSuggestions.length > 0 && (
                    <>
                      <div style={{ padding: "8px 18px 4px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#6B7280", letterSpacing: "0.7px", textTransform: "uppercase" }}>Places</span>
                        <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
                      </div>
                      {placeSuggestions.map((s, i) => (
                        <button key={`plc-${i}`} onClick={() => handleSelectSuggestion(s)} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 18px", border: "none", background: "white", cursor: "pointer",
                          borderBottom: i < placeSuggestions.length - 1 ? "1px solid #F8F9FB" : "none",
                        }}>
                          <div style={{ width: 38, height: 38, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <MapPin size={16} color="#6B7280" />
                          </div>
                          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: "#08122D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub || "Baku, Azerbaijan"}</div>
                          </div>
                          <Navigation size={13} color="#C4CDDC" style={{ flexShrink: 0 }} />
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Empty state while loading */}
              {searchQuery.length >= 2 && searchLoading && suggestions.length === 0 && (
                <div style={{ padding: "24px 18px", display: "flex", alignItems: "center", gap: 10, color: "#9CA3AF" }}>
                  <Loader size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13 }}>Searching…</span>
                </div>
              )}

              {/* No results */}
              {searchQuery.length >= 2 && !searchLoading && suggestions.length === 0 && (
                <div style={{ padding: "24px 18px", textAlign: "center", color: "#9CA3AF" }}>
                  <MapPin size={28} color="#D1D5DB" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600 }}>No results found</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, marginTop: 3 }}>Try a street name or landmark</div>
                </div>
              )}

              {/* Bottom padding */}
              <div style={{ height: 12 }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ZOOM ── */}
      <div style={{
        position: "absolute", right: 14, top: "42%", transform: "translateY(-50%)", zIndex: 400,
        background: "white", borderRadius: 16, boxShadow: "0 4px 18px rgba(0,0,0,0.2)",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        <button onClick={() => mapRef.current?.zoomIn()} style={{ width: 44, height: 44, border: "none", cursor: "pointer", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 300, color: "#08122D", fontFamily: "Inter, sans-serif" }}>+</button>
        <div style={{ height: 1, background: "#F0F2F5", margin: "0 10px" }} />
        <button onClick={() => mapRef.current?.zoomOut()} style={{ width: 44, height: 44, border: "none", cursor: "pointer", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 300, color: "#08122D", fontFamily: "Inter, sans-serif" }}>−</button>
      </div>

      {/* ── LEGEND (admin) ── */}
      {role === "admin" && !selectedIssue && !searchActive && (
        <div style={{ position: "absolute", bottom: "calc(var(--cg-bottom-gap) + 62px)", left: 14, zIndex: 400 }}>
          <div style={{ background: "rgba(8,18,45,0.82)", backdropFilter: "blur(16px)", borderRadius: 16, padding: "10px 14px 11px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.9px", marginBottom: 9, textTransform: "uppercase" }}>Legend</p>
            {LEGEND_ITEMS.map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BOTTOM BAR ── */}
      {!searchActive && (
        <div style={{ position: "absolute", bottom: "var(--cg-bottom-gap)", left: 14, right: 14, zIndex: 400, display: "flex", alignItems: "center", gap: 8 }}>
          <motion.button
            onClick={handleNavigate}
            animate={navigating ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.4 }}
            style={{
              width: 46, height: 46, borderRadius: 15, border: "none", cursor: "pointer",
              background: navigating ? "linear-gradient(135deg,#0B5CFF,#1a3a8f)" : "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: navigating ? "0 4px 16px rgba(11,92,255,0.5)" : "0 4px 16px rgba(0,0,0,0.18)",
              transition: "background 0.3s, box-shadow 0.3s", flexShrink: 0,
            }}
          >
            <Navigation size={19} color={navigating ? "white" : "#0B5CFF"} />
          </motion.button>

          {role === "user" ? (
            <button onClick={() => onNavigate("report_issue")} style={{
              flex: 1, height: 46, borderRadius: 15, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#0B5CFF,#1a3a8f)",
              color: "white", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(11,92,255,0.4)",
            }}>
              <Plus size={18} /> Report Issue
            </button>
          ) : (
            <div style={{ flex: 1, height: 46, borderRadius: 15, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", boxShadow: "0 4px 16px rgba(0,0,0,0.16)", display: "flex", alignItems: "stretch", overflow: "hidden" }}>
              {[
                { count: activeCount, label: "Active", color: "#0B5CFF" },
                { count: aiCount, label: "AI", color: "#7C3AED" },
                { count: overdueCount, label: "Overdue", color: "#E53935" },
              ].map(({ count, label, color }, i) => (
                <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: i < 2 ? "1px solid #F0F2F5" : "none" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 16, color, lineHeight: 1 }}>{count}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 9, color: "#9CA3AF", marginTop: 2 }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => onNavigate("ai_chat")} style={{
            width: 46, height: 46, borderRadius: 15, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#7C3AED,#5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(124,58,237,0.4)", flexShrink: 0,
          }}>
            <Bot size={19} color="white" />
          </button>
        </div>
      )}

      {/* Issue bottom sheet */}
      <AnimatePresence>
        {selectedIssue && (
          <div style={{ zIndex: 500, position: "absolute", inset: 0 }}>
            <IssueBottomSheet
              issue={selectedIssue} role={role}
              onClose={() => setSelectedIssue(null)}
              onViewDetails={issue => { setSelectedIssue(null); onViewIssueDetails(issue); }}
              onAssign={issue => { setSelectedIssue(null); onViewIssueDetails(issue); }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Hamburger menu */}
      <AnimatePresence>
        {showMenu && (
          <div style={{ zIndex: 600, position: "absolute", inset: 0 }}>
            <HamburgerMenu
              role={role} currentScreen={currentScreen} onNavigate={onNavigate}
              onClose={() => setShowMenu(false)} onLogout={onLogout} userName={userName}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
