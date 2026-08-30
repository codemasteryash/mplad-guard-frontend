import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, GeoJSON, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronRight, MapPin, Layers, Search, Maximize2, X } from "lucide-react";
import indiaStatesGeo from "../data/indiaStates.geo.json";
import { STATES, getStateRiskSummary, getProjectsByDistrictCode, getSummaryStats } from "../data/mockData";
import Button from "../components/common/Button";
import { RiskBadge } from "../components/common/Badge";
import { classNames } from "../utils/format";

// Vivid, high-contrast risk palette (brighter than the rest of the app's
// subtler badge colors, on purpose — this is the map's whole visual story).
const RISK_FILL = { Low: "#16D971", Medium: "#FFA512", High: "#FF3B4E" };
const RISK_FILL_DIM = { Low: "#8FE8B8", Medium: "#FFD599", High: "#FFAEB5" };

// Real bounding box of India (derived from the same boundary data used for
// the choropleth) — keeps the map framed on India only, no world backdrop,
// and no panning off into empty ocean.
const INDIA_BOUNDS = [
  [6.0, 67.5],
  [37.6, 98.2],
];

function districtRiskList(stateName) {
  const state = STATES.find((s) => s.name === stateName);
  if (!state) return [];
  return state.districts.map((d) => {
    const projects = getProjectsByDistrictCode(d.code);
    const stats = getSummaryStats(projects);
    return { ...d, avgRisk: stats.avgRisk, count: stats.total };
  });
}

function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    map.setMaxBounds(INDIA_BOUNDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const geoRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedState, setSelectedState] = useState(location.state?.presetState || "");
  const [hoveredState, setHoveredState] = useState(null);
  const [search, setSearch] = useState("");

  const riskSummary = useMemo(() => getStateRiskSummary(), []);

  const stateBuckets = useMemo(() => {
    const values = Object.values(riskSummary);
    const high = values.filter((v) => v.riskLevel === "High").length;
    const medium = values.filter((v) => v.riskLevel === "Medium").length;
    const low = values.filter((v) => v.riskLevel === "Low").length;
    return { high, medium, low, total: values.length };
  }, [riskSummary]);

  const donutData = [
    { name: "Low", value: stateBuckets.low },
    { name: "Medium", value: stateBuckets.medium },
    { name: "High", value: stateBuckets.high },
  ];

  const districtTotal = STATES.reduce((s, st) => s + st.districts.length, 0);

  const flyToState = (stateName) => {
    if (!geoRef.current || !mapRef.current) return;
    geoRef.current.eachLayer((layer) => {
      if (layer.feature?.properties?.st_nm === stateName) {
        mapRef.current.flyToBounds(layer.getBounds(), { padding: [50, 50], duration: 0.75 });
      }
    });
  };

  const resetView = () => {
    setSelectedState("");
    mapRef.current?.flyToBounds(INDIA_BOUNDS, { padding: [10, 10], duration: 0.6 });
  };

  const selectState = (stateName) => {
    setSelectedState(stateName);
    if (stateName) flyToState(stateName);
  };

  function styleFeature(feature) {
    const stName = feature.properties.st_nm;
    const bucket = riskSummary[stName];
    const isSelected = selectedState === stName;
    const isHovered = hoveredState === stName;
    const dimmed = selectedState && !isSelected && !isHovered;
    const palette = dimmed ? RISK_FILL_DIM : RISK_FILL;
    return {
      fillColor: bucket ? palette[bucket.riskLevel] : "#CBD5E1",
      fillOpacity: isSelected || isHovered ? 0.95 : dimmed ? 0.55 : 0.85,
      color: isSelected ? "#0A1833" : isHovered ? "#1B3A73" : "#ffffff",
      weight: isSelected ? 3 : isHovered ? 2.5 : 1.2,
    };
  }

  function onEachFeature(feature, layer) {
    const stName = feature.properties.st_nm;
    const bucket = riskSummary[stName];
    layer.bindTooltip(
      `<div class="state-tooltip">${stName}${bucket ? ` · Risk ${bucket.avgRisk}/100 · ${bucket.count} projects` : ""}</div>`,
      { sticky: true, className: "state-tooltip-wrapper" }
    );
    layer.on({
      mouseover: () => {
        setHoveredState(stName);
        layer.bringToFront();
      },
      mouseout: () => setHoveredState(null),
      click: () => selectState(stName),
    });
  }

  const districts = selectedState ? districtRiskList(selectedState) : [];
  const selectedBucket = selectedState ? riskSummary[selectedState] : null;

  const filteredStateOptions = useMemo(() => {
    if (!search) return STATES;
    const q = search.toLowerCase();
    return STATES.filter((s) => s.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">India Map — Risk Overview</h1>
            <p className="mt-1 text-sm text-ink-500">Click a state to zoom in and see its district-level risk breakdown.</p>
          </div>
        </div>

        <div className="relative h-[620px] overflow-hidden rounded-xl2 border border-ink-200 shadow-cardHover">
          <MapContainer
            center={[22.9, 82]}
            zoom={4.6}
            minZoom={4.2}
            maxZoom={7.5}
            zoomControl={false}
            maxBoundsViscosity={1.0}
            className="h-full w-full"
            style={{ background: "radial-gradient(ellipse at center, #EAF2FE 0%, #DCE9FB 60%, #CFDFF6 100%)" }}
          >
            <MapRefSetter mapRef={mapRef} />
            <GeoJSON ref={geoRef} data={indiaStatesGeo} style={styleFeature} onEachFeature={onEachFeature} />
            <ZoomControl position="bottomright" />
          </MapContainer>

          {/* Search / jump-to-state overlay */}
          <div className="absolute left-4 top-4 z-[400] w-64">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Jump to a state..."
                className="w-full rounded-lg border border-ink-200 bg-white/95 py-2.5 pl-9 pr-8 text-sm shadow-panel backdrop-blur focus:border-brand-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {search && (
              <div className="mt-1.5 max-h-56 overflow-y-auto rounded-lg border border-ink-200 bg-white/95 shadow-cardHover backdrop-blur">
                {filteredStateOptions.length === 0 ? (
                  <p className="px-3 py-2.5 text-xs text-ink-400">No matching state</p>
                ) : (
                  filteredStateOptions.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => {
                        selectState(s.name);
                        setSearch("");
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-brand-50"
                    >
                      {s.name}
                      <RiskBadge level={riskSummary[s.name]?.riskLevel || "Low"} size="sm" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={resetView}
            className="absolute right-4 top-4 z-[400] flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white/95 px-3 py-2 text-xs font-semibold text-ink-600 shadow-panel backdrop-blur hover:text-brand-600"
          >
            <Maximize2 size={13} /> Reset View
          </button>

          <div className="pointer-events-none absolute bottom-4 left-4 z-[400] rounded-xl border border-ink-200 bg-white/95 px-4 py-3 shadow-panel backdrop-blur">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Risk Legend</p>
            {["Low", "Medium", "High"].map((l) => (
              <div key={l} className="flex items-center gap-2 py-0.5 text-[12px] font-medium text-ink-700">
                <span className="h-3 w-3 rounded-full shadow-sm" style={{ background: RISK_FILL[l] }} />
                {l} Risk
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
          <h3 className="mb-1 font-display text-base font-bold text-ink-900">Risk Summary</h3>
          <p className="mb-3 text-xs text-ink-500">Across all {stateBuckets.total} states &amp; UTs</p>

          <div className="relative mx-auto h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none">
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={RISK_FILL[d.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} states`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-bold text-ink-900">{stateBuckets.total}</p>
              <p className="text-[10px] text-ink-500">States/UTs</p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {[
              { label: "Low Risk", count: stateBuckets.low, color: RISK_FILL.Low },
              { label: "Medium Risk", count: stateBuckets.medium, color: RISK_FILL.Medium },
              { label: "High Risk", count: stateBuckets.high, color: RISK_FILL.High },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} /> {r.label}
                </span>
                <span className="font-semibold text-ink-700">
                  {r.count} <span className="font-normal text-ink-400">({Math.round((r.count / stateBuckets.total) * 100)}%)</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-sm font-semibold text-ink-900">
            Total Districts (sample) <span>{districtTotal}</span>
          </div>
        </div>

        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink-900">
            <Layers size={16} /> Controls
          </h3>
          <label className="mb-1.5 block text-xs font-medium text-ink-500">State</label>
          <select
            value={selectedState}
            onChange={(e) => selectState(e.target.value)}
            className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500"
          >
            <option value="">All States</option>
            {STATES.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <Button
            className="mt-4 w-full"
            disabled={!selectedState}
            onClick={() => navigate("/dashboard", { state: { presetState: selectedState } })}
          >
            View Projects
          </Button>
        </div>

        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-ink-900">
              <MapPin size={15} /> {selectedState || "Select a state"}
            </h3>
            {selectedBucket && <RiskBadge level={selectedBucket.riskLevel} size="sm" />}
          </div>

          {!selectedState && (
            <p className="text-xs text-ink-500">Click any state on the map, search above, or use the dropdown to drill down into its districts.</p>
          )}

          {selectedState && (
            <div className="space-y-2">
              {districts.map((d) => {
                const level = d.avgRisk >= 65 ? "High" : d.avgRisk >= 35 ? "Medium" : "Low";
                return (
                  <button
                    key={d.code}
                    onClick={() => navigate("/dashboard", { state: { presetDistrictCode: d.code } })}
                    className="flex w-full flex-col gap-1.5 rounded-lg border border-ink-100 px-3 py-2.5 text-left text-sm transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-ink-900">{d.name}</p>
                      <div className="flex items-center gap-2">
                        <RiskBadge level={level} size="sm" />
                        <ChevronRight size={14} className="text-ink-300" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className={classNames("h-full rounded-full")}
                          style={{ width: `${d.avgRisk}%`, background: RISK_FILL[level] }}
                        />
                      </div>
                      <span className="text-[11px] text-ink-400">
                        {d.code} · {d.count} proj.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}