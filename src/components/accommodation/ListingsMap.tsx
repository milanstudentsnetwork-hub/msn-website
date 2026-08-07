import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Circle as LeafletCircle, LayerGroup, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

const MILAN_CENTER: [number, number] = [45.4642, 9.19];

export type LatLng = { lat: number; lng: number };

type MapListing = {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
};

export function ListingsMap({
  listings,
  center,
  radiusKm,
  onCenterChange,
}: {
  listings: MapListing[];
  center: LatLng | null;
  radiusKm: number;
  onCenterChange: (center: LatLng) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const listingLayerRef = useRef<LayerGroup | null>(null);
  const centerMarkerRef = useRef<LeafletMarker | null>(null);
  const radiusCircleRef = useRef<LeafletCircle | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const onCenterChangeRef = useRef(onCenterChange);
  onCenterChangeRef.current = onCenterChange;

  useEffect(() => setMounted(true), []);

  // Initialize the map once, client-side only.
  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current).setView(MILAN_CENTER, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      listingLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        onCenterChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapRef.current = map;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Plot one marker per listing that has coordinates.
  useEffect(() => {
    const L = leafletRef.current;
    const layer = listingLayerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();
    const roomIcon = L.divIcon({
      html: '<div style="font-size:22px;line-height:1;transform:translate(-50%,-90%)">🏠</div>',
      className: "",
      iconSize: [0, 0],
    });
    for (const listing of listings) {
      if (listing.latitude == null || listing.longitude == null) continue;
      L.marker([listing.latitude, listing.longitude], { icon: roomIcon })
        .bindPopup(listing.title)
        .addTo(layer);
    }
  }, [listings, mapReady]);

  // Keep the draggable center pin + radius circle in sync with `center`/`radiusKm`.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (!center) {
      centerMarkerRef.current?.remove();
      centerMarkerRef.current = null;
      radiusCircleRef.current?.remove();
      radiusCircleRef.current = null;
      return;
    }

    const pos: [number, number] = [center.lat, center.lng];

    if (!centerMarkerRef.current) {
      const pinIcon = L.divIcon({
        html: '<div style="font-size:28px;line-height:1;transform:translate(-50%,-90%)">📍</div>',
        className: "",
        iconSize: [0, 0],
      });
      const marker = L.marker(pos, { draggable: true, icon: pinIcon }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onCenterChangeRef.current({ lat: p.lat, lng: p.lng });
      });
      centerMarkerRef.current = marker;
    } else {
      centerMarkerRef.current.setLatLng(pos);
    }

    const radiusMeters = radiusKm * 1000;
    if (!radiusCircleRef.current) {
      radiusCircleRef.current = L.circle(pos, {
        radius: radiusMeters,
        color: "var(--coral, #ff6b5f)",
        fillOpacity: 0.1,
      }).addTo(map);
    } else {
      radiusCircleRef.current.setLatLng(pos);
      radiusCircleRef.current.setRadius(radiusMeters);
    }

    map.fitBounds(radiusCircleRef.current.getBounds(), { maxZoom: 15 });
  }, [center, radiusKm, mapReady]);

  return <div ref={containerRef} className="h-80 w-full overflow-hidden rounded-2xl border border-border" />;
}
