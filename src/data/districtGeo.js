

const modules = import.meta.glob("./districts/*.geo.json");

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function loadDistrictGeo(stateName) {
  const key = `./districts/${slugify(stateName)}.geo.json`;
  const loader = modules[key];
  if (!loader) return null;
  const mod = await loader();
  return mod.default || mod;
}
