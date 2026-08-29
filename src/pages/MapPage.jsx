import { useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronRight, MapPin, Layers } from "lucide-react";
import indiaStatesGeo from "../data/indiaStates.geo.json";
import { STATES, getStateRiskSummary, getProjectsByDistrictCode } from "../data/mockData";
import { getSummaryStats } from "../data/mockData";
import Button from "../components/common/Button";
import { RiskBadge } from "../components/common/Badge";

const RISK_FILL = { Low: "#22C55E", Medium: "#F5A524", High: "#EF4444" };

function districtRiskList(stateName) {
  const state = STATES.find((s) => s.name === stateName);
  if (!state) return [];
  return state.districts.map((d) => {
    const projects = getProjectsByDistrictCode(d.code);
    const stats = getSummaryStats(projects);
    return { ...d, avgRisk: stats.avgRisk, count: stats.total };
  });
}

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const geoRef = useRef(null);
  const [selectedState, setSelectedState] = useState(location.state?.presetState || "");
  const [hoveredState, setHoveredState] = useState(null);

  const riskSummary = useMemo(() => getStateRiskSummary(), []);

  const stateBuckets = useMemo(() => {
    const values = Object.values(riskSummary);
    const high = values.filter((v) => v.riskLevel === "High").length;
    const medium = values.filter((v) => v.riskLevel === "Medium").length;
    const low = values.filter((v) => v.riskLevel === "Low").length;
    return { high, medium, low, total: values.length };
  }, [riskSummary]);

  const districtTotal = STATES.reduce((s, st) => s + st.districts.length, 0);

  function styleFeature(feature) {
    const stName = feature.properties.st_nm;
    const bucket = riskSummary[stName];
    const isSelected = selectedState === stName;
    const isHovered = hoveredState === stName;
    return {
      fillColor: bucket ? RISK_FILL[bucket.riskLevel] : "#CBD5E1",
      fillOpacity: isSelected ? 0.85 : isHovered ? 0.75 : 0.6,
      color: isSelected ? "#0A1833" : "#ffffff",
      weight: isSelected ? 2.5 : 1,
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
      mouseover: () => setHoveredState(stName),
      mouseout: () => setHoveredState(null),
      click: () => setSelectedState(stName),
    });
  }

  const districts = selectedState ? districtRiskList(selectedState) : [];
  const selectedBucket = selectedState ? riskSummary[selectedState] : null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">India Map — Risk Overview</h1>
            <p className="mt-1 text-sm text-ink-500">Click a state to see its district-level risk breakdown.</p>
          </div>
        </div>

        <div className="relative h-[560px] overflow-hidden rounded-xl2 border border-ink-200 shadow-card">
          <MapContainer
            center={[22.9, 82]}
            zoom={4.4}
            minZoom={3.5}
            maxZoom={7}
            zoomControl={false}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            <GeoJSON ref={geoRef} data={indiaStatesGeo} style={styleFeature} onEachFeature={onEachFeature} />
            <ZoomControl position="bottomright" />
          </MapContainer>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-ink-200 bg-white/95 px-3.5 py-2.5 shadow-panel backdrop-blur">
            <p className="mb-1.5 text-[11px] font-semibold text-ink-600">Legend</p>
            {["Low", "Medium", "High"].map((l) => (
              <div key={l} className="flex items-center gap-2 text-[11px] text-ink-600">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: RISK_FILL[l] }} />
                {l} Risk
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-ink-900">Risk Summary</h3>
          <div className="space-y-3">
            {[
              { label: "Low Risk", count: stateBuckets.low, color: "#22C55E" },
              { label: "Medium Risk", count: stateBuckets.medium, color: "#F5A524" },
              { label: "High Risk", count: stateBuckets.high, color: "#EF4444" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} /> {r.label}
                </span>
                <span className="text-ink-500">
                  {r.count} States/UTs ({Math.round((r.count / stateBuckets.total) * 100)}%)
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
            onChange={(e) => setSelectedState(e.target.value)}
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
            <p className="text-xs text-ink-500">Click any state on the map or use the dropdown to drill down into its districts.</p>
          )}

          {selectedState && (
            <div className="space-y-2">
              {districts.map((d) => {
                const level = d.avgRisk >= 65 ? "High" : d.avgRisk >= 35 ? "Medium" : "Low";
                return (
                  <button
                    key={d.code}
                    onClick={() => navigate("/dashboard", { state: { presetDistrictCode: d.code } })}
                    className="flex w-full items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5 text-left text-sm transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <div>
                      <p className="font-medium text-ink-900">{d.name}</p>
                      <p className="text-[11px] text-ink-400">
                        {d.code} · {d.count} projects
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={level} size="sm" />
                      <ChevronRight size={14} className="text-ink-300" />
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
