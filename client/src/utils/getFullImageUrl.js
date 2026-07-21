export default function getFullImageUrl(path) {
  if (!path) return "";
  // If already absolute URL, return as-is
  if (/^https?:\/\//i.test(path) || /^\/\//.test(path)) return path;
  const api = import.meta.env.VITE_API_URL || "/api";
  const base = api.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const clean = String(path).replace(/^\/+/, "");
  return `${base}/${clean}`;
}
