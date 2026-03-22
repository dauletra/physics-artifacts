import { writeFileSync } from 'fs';

const PROJECT_ID = 'physics-artifacts';
const BASE_URL = 'https://physics-artifacts.web.app';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/artifact_groups`;

async function fetchPublicArtifacts() {
  const ids = [];
  let pageToken = null;

  do {
    const url = new URL(FIRESTORE_URL);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString());
    const data = await res.json();

    for (const doc of data.documents || []) {
      const isPublic = doc.fields?.isPublic?.booleanValue;
      if (isPublic) {
        const id = doc.name.split('/').pop();
        ids.push(id);
      }
    }

    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return ids;
}

async function generateSitemap() {
  const ids = await fetchPublicArtifacts();
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `  <url><loc>${BASE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    ...ids.map(id =>
      `  <url><loc>${BASE_URL}/artifacts/${id}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  writeFileSync('public/sitemap.xml', xml, 'utf-8');
  console.log(`✓ sitemap.xml generated with ${ids.length} artifacts`);
}

generateSitemap().catch(e => { console.error(e); process.exit(1); });
