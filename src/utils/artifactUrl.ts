const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function extractArtifactId(url: string): string | null {
  const match = url.match(UUID_RE);
  return match ? match[0] : null;
}

export function getEmbedUrl(urlOrId: string): string {
  const id = extractArtifactId(urlOrId) ?? urlOrId.trim();
  return `https://claude.site/public/artifacts/${id}/embed`;
}

export function getViewUrl(urlOrId: string): string {
  const id = extractArtifactId(urlOrId) ?? urlOrId.trim();
  return `https://claude.ai/public/artifacts/${id}`;
}

export function normalizeArtifactUrl(url: string): string {
  return extractArtifactId(url) ?? url.trim();
}

export function isValidArtifactUrl(url: string): boolean {
  return UUID_RE.test(url);
}
