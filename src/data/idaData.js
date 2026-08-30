import { getProjectsByDistrictCode, getSummaryStats } from "./mockData";


export const IDA_AGENCY_OPTIONS = [
  "PWD",
  "Municipal Corporation",
  "District Development Authority",
  "Rural Development Department",
  "Education Department",
  "Health Department",
  "Other approved agency",
];

export function getDistrictSummary(districtCode) {
  const projects = getProjectsByDistrictCode(districtCode);
  const stats = getSummaryStats(projects);
  return {
    ...stats,
    sanctioned: projects.filter((p) => p.status === "Sanctioned").length,
    active: projects.filter((p) => p.status === "Work in Progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    pending: projects.filter((p) => p.status === "Recommended").length,
    delayed: projects.filter((p) => p.status === "Delayed").length,
  };
}

/** Projects that are sanctioned but still carry the generic/no dedicated IA — candidates for assignment. */
export function getUnassignedProjects(districtCode) {
  return getProjectsByDistrictCode(districtCode).filter(
    (p) => p.status === "Sanctioned" || p.status === "Recommended"
  );
}
