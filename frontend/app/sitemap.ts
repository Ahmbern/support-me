import type { MetadataRoute } from 'next';

// A fixed lastmod for static pages keeps the sitemap stable across requests
// instead of changing on every render. Kept in sync with the backend sitemap's
// STATIC_LASTMOD (#368 / #451).
const STATIC_LAST_MODIFIED = new Date('2026-09-01T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://support-mee.vercel.app';

  return [
    {
      url: `${baseUrl}/`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
