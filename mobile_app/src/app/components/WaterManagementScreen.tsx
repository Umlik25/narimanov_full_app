import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CalendarDays, CloudRain, Layers3, Map, Menu, SlidersHorizontal, X } from "lucide-react";
import { motion } from "motion/react";
import { getApiBaseUrl } from "../api/backend";

type FloodProperties = {
  id: string;
  street?: string;
  risk: number;
  risk_band: string;
  activation_intensity_mm_h: number;
  flooded: boolean;
  stress: number;
  required_capacity_m3s: number;
  upstream_area_ha: number;
};

type FloodOverlay = {
  intensity_mm_h: number;
  flooded_count: number;
  features: GeoJSON.FeatureCollection<GeoJSON.Geometry, FloodProperties>;
  flow?: GeoJSON.FeatureCollection<GeoJSON.Geometry, Record<string, unknown>> | null;
  shapefile?: GeoJSON.FeatureCollection<GeoJSON.Geometry, Record<string, unknown>> | null;
};

type ForecastDay = {
  date: string;
  label: string;
  short: string;
  peak_intensity_mm_h: number;
  total_mm: number;
  peak_time: string;
  storm: boolean;
};

const NARIMANOV: [number, number] = [40.4093, 49.8671];
const API_BASE = getApiBaseUrl();

function stressColor(stress: number, risk: number) {
  if (stress >= 1.6) return "#991B1B";
  if (stress >= 1.2) return "#EF4444";
  if (stress >= 1) return "#F97316";
  if (stress >= 0.65) return "#FACC15";
  if (risk >= 70) return "#22C55E";
  return "#38BDF8";
}

function buildFallbackForecast(): ForecastDay[] {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const shortFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short" });
  const intensities = [4, 9, 18, 31, 14, 6, 2];

  return intensities.map((peak, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    return {
      date: iso,
      label: index === 0 ? "Today" : formatter.format(date),
      short: shortFormatter.format(date),
      peak_intensity_mm_h: peak,
      total_mm: Math.round(peak * (index === 3 ? 2.4 : 1.2) * 10) / 10,
      peak_time: index === 0 ? "18:00" : "14:00",
      storm: peak >= 20,
    };
  });
}

function forecastStatus(intensity: number) {
  if (intensity >= 30) return { label: "Heavy rain", color: "#DC2626", bg: "#FEF2F2" };
  if (intensity >= 20) return { label: "Storm watch", color: "#EA580C", bg: "#FFF7ED" };
  if (intensity >= 8) return { label: "Light rain", color: "#0B5CFF", bg: "#EEF4FF" };
  return { label: "Calm", color: "#16A34A", bg: "#ECFDF3" };
}

export function WaterManagementScreen({ onBack, onMenu }: { onBack: () => void; onMenu: () => void }) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const floodLayerRef = useRef<L.GeoJSON | null>(null);
  const flowLayerRef = useRef<L.GeoJSON | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);

  const [forecastDays, setForecastDays] = useState<ForecastDay[]>(() => buildFallbackForecast());
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [overlay, setOverlay] = useState<FloodOverlay | null>(null);
  const [selectedArea, setSelectedArea] = useState<FloodProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallbackForecast, setUsingFallbackForecast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCatchments, setShowCatchments] = useState(true);
  const [showFloodedOnly, setShowFloodedOnly] = useState(false);
  const [showFlow, setShowFlow] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);

  const selectedDay = forecastDays[selectedDayIndex] || forecastDays[0];
  const intensity = selectedDay?.peak_intensity_mm_h ?? 0;
  const status = forecastStatus(intensity);

  const floodedCount = overlay?.flooded_count ?? 0;
  const territoryCount = overlay?.features.features.length ?? 0;
  const forecastSubtitle = useMemo(() => {
    if (!selectedDay) return "Forecast unavailable";
    const total = selectedDay.total_mm.toFixed(1);
    return `Peak ${intensity.toFixed(1)} mm/h at ${selectedDay.peak_time} · ${total} mm total`;
  }, [intensity, selectedDay]);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: NARIMANOV,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadForecast() {
      try {
        const response = await fetch(`${API_BASE}/water-management/forecast?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Forecast unavailable");
        const data = await response.json() as { days?: ForecastDay[] };
        const days = (data.days || []).filter(day => typeof day.peak_intensity_mm_h === "number").slice(0, 7);
        if (!cancelled && days.length) {
          const hasRainInForecast = days.some(day => day.peak_intensity_mm_h > 0 || day.total_mm > 0);
          setForecastDays(hasRainInForecast ? days : buildFallbackForecast());
          setSelectedDayIndex(0);
          setUsingFallbackForecast(!hasRainInForecast);
        }
      } catch {
        if (!cancelled) setUsingFallbackForecast(true);
      }
    }

    loadForecast();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOverlay() {
      setLoading(true);
      setSelectedArea(null);
      try {
        const response = await fetch(
          `${API_BASE}/water-management/flood-areas?intensity_mm_h=${intensity}&min_risk=0&include_flow_lines=true&include_shapefile=true&t=${Date.now()}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Water module is unavailable");
        const nextOverlay = await response.json() as FloodOverlay;
        if (!cancelled) setOverlay(nextOverlay);
      } catch {
        if (!cancelled) setOverlay(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOverlay();
    return () => {
      cancelled = true;
    };
  }, [intensity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !overlay) return;

    if (floodLayerRef.current) floodLayerRef.current.remove();
    floodLayerRef.current = showCatchments ? L.geoJSON(overlay.features, {
      filter: feature => {
        const props = feature.properties as FloodProperties | undefined;
        return showFloodedOnly ? Boolean(props?.flooded) : true;
      },
      style: feature => {
        const props = feature?.properties as FloodProperties | undefined;
        const stress = props?.stress || 0;
        const risk = props?.risk || 0;
        const isFlooded = Boolean(props?.flooded);
        const color = isFlooded ? "#0B5CFF" : stressColor(0, risk);
        return {
          color,
          fillColor: stressColor(stress, risk),
          fillOpacity: isFlooded ? Math.min(0.64, 0.22 + stress * 0.18) : 0.2,
          opacity: isFlooded ? 0.62 : 0.32,
          weight: isFlooded ? 1.5 : 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties as FloodProperties;
        layer.on("click", () => setSelectedArea(props));
      },
    }).addTo(map) : null;

    if (flowLayerRef.current) flowLayerRef.current.remove();
    flowLayerRef.current = showFlow && overlay.flow ? L.geoJSON(overlay.flow, {
      style: {
        color: "#0284C7",
        opacity: 0.64,
        weight: 2,
        dashArray: "6 6",
      },
      interactive: false,
    }).addTo(map) : null;

    if (boundaryLayerRef.current) boundaryLayerRef.current.remove();
    boundaryLayerRef.current = showBoundary && overlay.shapefile ? L.geoJSON(overlay.shapefile, {
      style: {
        color: "#08122D",
        fillOpacity: 0,
        opacity: 0.72,
        weight: 2.4,
      },
      interactive: false,
    }).addTo(map) : null;
  }, [overlay, showBoundary, showCatchments, showFloodedOnly, showFlow]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F4F8FF]">
      <div ref={mapDivRef} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,rgba(244,248,255,.72),rgba(244,248,255,.08) 36%,rgba(244,248,255,.58))" }} />

      <div className="absolute left-0 right-0 top-0 z-[420] px-4 pointer-events-none" style={{ paddingTop: "max(18px, calc(env(safe-area-inset-top) + 10px))" }}>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onMenu}
            className="h-[54px] w-[54px] rounded-[18px] bg-white text-[#08122D] shadow-lg flex items-center justify-center pointer-events-auto border border-[#E7EEFB]"
            aria-label="Open menu"
          >
            <Menu size={25} />
          </motion.button>

          <div className="flex-1 rounded-[16px] bg-white/92 p-1 backdrop-blur-md border border-[#E2EAF8] shadow-lg pointer-events-auto">
            <div className="grid grid-cols-2 gap-1">
              <button onClick={onBack} className="h-11 rounded-[12px] text-[#667085] text-sm flex items-center justify-center gap-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
                <Map size={16} /> City
              </button>
              <button className="h-11 rounded-[12px] bg-[#0B5CFF] text-white text-sm flex items-center justify-center gap-2 shadow-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>
                <CloudRain size={17} /> Rain
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedArea && (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute left-4 right-4 z-[430] rounded-[24px] bg-white/96 border border-[#E2EAF8] p-4 shadow-xl backdrop-blur-md"
          style={{ bottom: "calc(var(--cg-bottom-gap) + 190px)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-[#0B5CFF]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>Selected territory</p>
              <h2 className="truncate text-[#08122D] text-base mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 950 }}>
                {selectedArea.street || selectedArea.id}
              </h2>
            </div>
            <button onClick={() => setSelectedArea(null)} className="h-9 w-9 rounded-full bg-[#F3F6FB] flex items-center justify-center text-[#667085]">
              <X size={17} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              ["Risk", selectedArea.risk.toFixed(0)],
              ["Starts", `${selectedArea.activation_intensity_mm_h.toFixed(1)} mm/h`],
              ["Flow", `${selectedArea.required_capacity_m3s.toFixed(2)} m3/s`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#F6F8FC] px-3 py-2">
                <p className="text-[10px] text-[#7B8798]" style={{ fontFamily: "Inter, sans-serif" }}>{label}</p>
                <p className="text-sm text-[#08122D] mt-0.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="absolute left-0 right-0 z-[420] pointer-events-auto" style={{ bottom: "var(--cg-bottom-gap)" }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-4 rounded-[28px] bg-white/96 shadow-2xl border border-[#E7EEFB] overflow-hidden backdrop-blur-md"
        >
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#0B5CFF]" />
                  <p className="text-[11px] text-[#0B5CFF]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>Weather forecast</p>
                </div>
                <h1 className="text-[#08122D] text-xl mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 950 }}>
                  {selectedDay?.label || "Today"}
                </h1>
                <p className="text-[#667085] text-xs mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 650 }}>
                  {forecastSubtitle}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="flex items-center justify-end gap-2">
                  <span className="inline-flex rounded-full px-3 py-1 text-xs" style={{ background: status.bg, color: status.color, fontFamily: "Inter, sans-serif", fontWeight: 900 }}>
                    {status.label}
                  </span>
                  <button
                    aria-label="Rain map settings"
                    onClick={() => setShowSettings(value => !value)}
                    className="h-9 w-9 rounded-xl bg-[#EEF4FF] text-[#0B5CFF] flex items-center justify-center"
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                </div>
                <p className="text-[#08122D] text-lg mt-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 950 }}>
                  {intensity.toFixed(1)}
                  <span className="text-xs text-[#667085]"> mm/h</span>
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-[#667085]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 750 }}>
              <span>{loading ? "Updating map..." : `${territoryCount} territories · ${floodedCount} flooded`}</span>
              {usingFallbackForecast && <span className="rounded-full bg-[#FFF7ED] px-2 py-1 text-[#EA580C]">model forecast</span>}
            </div>

            {showSettings && (
              <div className="mt-3 rounded-2xl bg-[#F6F8FC] p-2">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Catchments", value: showCatchments, onClick: () => setShowCatchments(value => !value) },
                    { label: "Flooded only", value: showFloodedOnly, onClick: () => setShowFloodedOnly(value => !value) },
                    { label: "Water flow", value: showFlow, onClick: () => setShowFlow(value => !value) },
                    { label: "Boundary", value: showBoundary, onClick: () => setShowBoundary(value => !value) },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="rounded-xl px-3 py-2 text-left"
                      style={{
                        background: item.value ? "#0B5CFF" : "#FFFFFF",
                        color: item.value ? "#FFFFFF" : "#08122D",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        fontWeight: 850,
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Layers3 size={13} />
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#EEF2F8] px-3 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {forecastDays.map((day, index) => {
                const isActive = index === selectedDayIndex;
                return (
                  <motion.button
                    key={day.date}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedDayIndex(index)}
                    className="min-w-[74px] rounded-2xl px-3 py-2 text-left border"
                    style={{
                      background: isActive ? "#0B5CFF" : "#F6F8FC",
                      borderColor: isActive ? "#0B5CFF" : "#E7EEFB",
                      color: isActive ? "#FFFFFF" : "#08122D",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <p className="text-[11px]" style={{ fontWeight: 900 }}>{day.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ opacity: isActive ? 0.78 : 0.52, fontWeight: 700 }}>{day.short}</p>
                    <p className="text-sm mt-1" style={{ fontWeight: 950 }}>{day.peak_intensity_mm_h.toFixed(1)}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
