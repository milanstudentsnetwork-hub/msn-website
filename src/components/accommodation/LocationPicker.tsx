import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { Map as MapIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MILAN_CENTER: [number, number] = [45.4642, 9.19];

type GeocodeResult = { display_name: string; lat: string; lon: string };

export function LocationPicker({
  query,
  latitude,
  longitude,
  onChange,
}: {
  query: string;
  latitude: number | null;
  longitude: number | null;
  onChange: (value: { query: string; latitude: number | null; longitude: number | null }) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);

  useEffect(() => setMounted(true), []);

  // Initialize the map only once it's actually shown, client-side only.
  useEffect(() => {
    if (!mounted || !showMap || !containerRef.current || mapRef.current) return;

    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const start: [number, number] =
        latitude != null && longitude != null ? [latitude, longitude] : MILAN_CENTER;

      const map = L.map(containerRef.current).setView(start, latitude != null ? 15 : 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        html: '<div style="font-size:28px;line-height:1;transform:translate(-50%,-90%)">📍</div>',
        className: "",
        iconSize: [0, 0],
      });

      const marker = L.marker(start, { draggable: true, icon: pinIcon }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current({
          query: searchInputRef.current,
          latitude: pos.lat,
          longitude: pos.lng,
        });
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current({
          query: searchInputRef.current,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      });

      mapRef.current = map;
      markerRef.current = marker;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, showMap]);

  // Keep latest onChange/searchInput available inside Leaflet's event handlers
  // without re-binding them on every render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const searchInputRef = useRef(searchInput);
  searchInputRef.current = searchInput;

  async function handleSearch() {
    if (!searchInput.trim()) return;
    setSearching(true);
    setNoResultsFound(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=it&q=${encodeURIComponent(
          `${searchInput}, Milano, Italia`,
        )}`,
      );
      const data = (await res.json()) as GeocodeResult[];
      setResults(data);
      // The typed address is already saved either way (via onBlur) — this just
      // reassures the user that an unmatched address isn't a dead end.
      setNoResultsFound(data.length === 0);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectResult(result: GeocodeResult) {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setSearchInput(result.display_name);
    setResults([]);
    mapRef.current?.setView([lat, lng], 16);
    markerRef.current?.setLatLng([lat, lng]);
    onChange({ query: result.display_name, latitude: lat, longitude: lng });
  }

  return (
    <div>
      <Label htmlFor="location-search">Address / area search</Label>
      <div className="relative mt-1 flex gap-2">
        <Input
          id="location-search"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setNoResultsFound(false);
          }}
          onBlur={() => onChange({ query: searchInput, latitude, longitude })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="e.g. Navigli, Città Studi, via Padova…"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="press grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"
          aria-label="Search location"
        >
          <Search className="size-4" />
        </button>
      </div>

      {noResultsFound && (
        <p className="mt-1 text-xs text-muted-foreground">
          No matches found — no problem, we'll save the address exactly as you typed it. Click "Show
          map" below and drag the pin to the exact spot if you know it.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-1 max-h-40 overflow-y-auto rounded-md border border-border bg-card text-sm shadow-soft">
          {results.map((r) => (
            <li key={`${r.lat}-${r.lon}`}>
              <button
                type="button"
                onClick={() => selectResult(r)}
                className="block w-full px-3 py-2 text-left hover:bg-muted"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setShowMap((v) => !v)}
        className="press mt-2 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <MapIcon className="size-4" /> {showMap ? "Hide map" : "Show map"}
      </button>

      {showMap && (
        <>
          <p className="mt-2 text-xs text-muted-foreground">
            If the pin doesn't land on the right spot, drag it — or click anywhere on the map — to
            set the exact location.
          </p>
          <div
            ref={containerRef}
            className="relative z-0 mt-2 h-64 w-full overflow-hidden rounded-xl border border-border"
          />
        </>
      )}
    </div>
  );
}
