const DATED_POST_PATH_PATTERN = /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/;
const MALFORMED_HOST_PATH_PATTERN =
  /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/.*)?)$/i;
const BARE_HOST_PATTERN = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/|$)/i;

export function normalizeReferenceUrl(reference, pageUrl) {
  const trimmed = reference.trim();

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (BARE_HOST_PATTERN.test(trimmed) && !/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return new URL(trimmed, pageUrl).toString();
}

function fixMalformedImportedLink(urlString, siteUrl) {
  const parsedUrl = new URL(urlString);
  const siteOrigin = new URL(siteUrl).origin;

  if (parsedUrl.origin !== siteOrigin) {
    return urlString;
  }

  const malformedMatch = parsedUrl.pathname.match(MALFORMED_HOST_PATH_PATTERN);
  if (!malformedMatch) {
    return urlString;
  }

  return `https://${malformedMatch[1]}${parsedUrl.search}${parsedUrl.hash}`;
}

function toLocalPostLink(urlString, siteUrl) {
  const parsedUrl = new URL(urlString);
  const siteOrigin = new URL(siteUrl).origin;

  if (parsedUrl.origin !== siteOrigin || !DATED_POST_PATH_PATTERN.test(parsedUrl.pathname)) {
    return urlString;
  }

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export function rewriteImportedMarkdownLinks(content, siteUrl) {
  return content.replace(
    /\]\((https?:\/\/[^)\s]+)\)/gi,
    (_, urlString) => `](${toLocalPostLink(fixMalformedImportedLink(urlString, siteUrl), siteUrl)})`
  );
}
