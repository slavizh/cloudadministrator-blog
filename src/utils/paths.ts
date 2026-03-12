export function withBase(path = "") {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`.replace(/\/{2,}/g, "/");
}

