import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://qanuni.middlemind.ai';
  const now = new Date().toISOString();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          'en': baseUrl,
          'ar': `${baseUrl}/ar`,
        },
      },
    },
  ];
}
