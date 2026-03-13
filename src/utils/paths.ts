/** Returns the normalised base path without a trailing slash (e.g. "/cloudadministrator-blog" or ""). */
export function basePath() {
  return import.meta.env.BASE_URL.replace(/\/+$/, "");
}

/** Prepends the base path to a relative path, returning an absolute URL path. */
export function withBase(path = "") {
  const normalizedPath = path.replace(/^\/+/, "");
  return normalizedPath ? `${basePath()}/${normalizedPath}` : `${basePath()}/`;
}

