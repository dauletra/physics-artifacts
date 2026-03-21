const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const GITHUB_PAGES_RE = /^https?:\/\/[^/]+\.github\.io\//i;

export type ArtifactUrlType = 'claude' | 'github-pages';

export function detectUrlType(urlOrId: string): ArtifactUrlType {
  if (GITHUB_PAGES_RE.test(urlOrId.trim())) return 'github-pages';
  return 'claude';
}

export function extractArtifactId(url: string): string | null {
  const match = url.match(UUID_RE);
  return match ? match[0] : null;
}

export function getEmbedUrl(urlOrId: string): string {
  if (detectUrlType(urlOrId) === 'github-pages') return urlOrId.trim();
  const id = extractArtifactId(urlOrId) ?? urlOrId.trim();
  return `https://claude.site/public/artifacts/${id}/embed`;
}

export function getViewUrl(urlOrId: string): string {
  if (detectUrlType(urlOrId) === 'github-pages') return urlOrId.trim();
  const id = extractArtifactId(urlOrId) ?? urlOrId.trim();
  return `https://claude.ai/public/artifacts/${id}`;
}

export function normalizeArtifactUrl(url: string): string {
  if (detectUrlType(url) === 'github-pages') return url.trim();
  return extractArtifactId(url) ?? url.trim();
}

export function isValidArtifactUrl(url: string): boolean {
  if (detectUrlType(url) === 'github-pages') return true;
  return UUID_RE.test(url);
}
