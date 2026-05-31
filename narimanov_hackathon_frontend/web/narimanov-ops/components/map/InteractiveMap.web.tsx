import { colors } from '@/constants/theme';
import type { Issue, IssueStatus } from '@/types/domain';
import { useEffect, useMemo, useRef, useState } from 'react';

type InteractiveMapProps = {
  issues: Issue[];
  selectedId?: string;
  statusColors: Record<IssueStatus, string>;
  onSelectIssue: (id: string) => void;
};

const satelliteTiles =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const labelTiles =
  'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

type LeafletModule = typeof import('leaflet');
type LeafletMap = import('leaflet').Map;
type LeafletMarker = import('leaflet').Marker;

const defaultPoint: [number, number] = [40.4099, 49.8677];

function getIssuePoint(issue: Issue): [number, number] | null {
  const latitude = Number(issue.latitude);
  const longitude = Number(issue.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  return [latitude, longitude];
}

function ensureLeafletCss() {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  if (document.getElementById('leaflet-polish')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'leaflet-polish';
  style.textContent = `
    .leaflet-control-attribution { display: none !important; }
    .leaflet-control-scale { display: none !important; }
    .leaflet-container { background: #EAF2FF; font-family: inherit; }
  `;
  document.head.appendChild(style);
}

function markerIcon(L: LeafletModule, color: string, active: boolean) {
  const size = active ? 44 : 38;
  const border = active ? colors.gold : '#FFFFFF';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        align-items:center;
        background:${color};
        border:${active ? 4 : 3}px solid ${border};
        border-radius:999px;
        box-shadow:0 12px 28px rgba(15, 23, 42, 0.32);
        color:#fff;
        display:flex;
        font-size:${active ? 21 : 18}px;
        font-weight:900;
        height:${size}px;
        justify-content:center;
        line-height:1;
        width:${size}px;
      ">!</div>
    `,
    iconAnchor: [size / 2, size],
    iconSize: [size, size],
  });
}

function isVisibleMapContainer(element: HTMLDivElement | null) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 20 && rect.height > 20;
}

function getSafeZoom(mapInstance: LeafletMap, minimum: number) {
  const currentZoom = Number(mapInstance.getZoom());
  return Number.isFinite(currentZoom) ? Math.max(currentZoom, minimum) : minimum;
}

export function InteractiveMap({
  issues,
  selectedId,
  statusColors,
  onSelectIssue,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const leaflet = useRef<LeafletModule | null>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<LeafletMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedId),
    [issues, selectedId],
  );
  const validIssues = useMemo(
    () => issues.filter((issue) => Boolean(getIssuePoint(issue))),
    [issues],
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      return;
    }

    let cancelled = false;

    async function initMap() {
      ensureLeafletCss();
      const L = await import('leaflet');

      if (cancelled || !mapContainer.current) {
        return;
      }

      leaflet.current = L;
      map.current = L.map(mapContainer.current, {
        center: defaultPoint,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        touchZoom: true,
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer(satelliteTiles, {
        attribution: '',
        maxZoom: 19,
      }).addTo(map.current);

      L.tileLayer(labelTiles, {
        attribution: '',
        maxZoom: 19,
        pane: 'overlayPane',
      }).addTo(map.current);

      L.control.zoom({ position: 'bottomright' }).addTo(map.current);
      setMapReady(true);

      window.setTimeout(() => {
        map.current?.invalidateSize();
      }, 120);
    }

    void initMap();

    return () => {
      cancelled = true;
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.current?.remove();
      map.current = null;
      leaflet.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !map.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      map.current?.invalidateSize();
    });

    observer.observe(mapContainer.current);
    return () => observer.disconnect();
  }, [mapReady]);

  useEffect(() => {
    if (!map.current || !leaflet.current || !mapReady) {
      return;
    }

    const L = leaflet.current;
    markers.current.forEach((marker) => marker.remove());
    markers.current = validIssues.flatMap((issue) => {
      const point = getIssuePoint(issue);
      if (!point) return [];

      const active = selectedId === issue.id;
      const marker = L.marker(point, {
        icon: markerIcon(L, statusColors[issue.status], active),
        title: issue.title,
      })
        .addTo(map.current!)
        .on('click', () => {
          onSelectIssue(issue.id);
          if (map.current && isVisibleMapContainer(mapContainer.current)) {
            map.current.flyTo(point, getSafeZoom(map.current, 15), {
              duration: 0.45,
            });
          }
        });

      return marker;
    });
  }, [validIssues, mapReady, onSelectIssue, selectedId, statusColors]);

  useEffect(() => {
    if (!map.current || !selectedIssue || !isVisibleMapContainer(mapContainer.current)) {
      return;
    }

    const point = getIssuePoint(selectedIssue);
    if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
      return;
    }

    map.current.flyTo(
      point,
      getSafeZoom(map.current, 14),
      { duration: 0.45 },
    );
  }, [selectedIssue]);

  return <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />;
}
