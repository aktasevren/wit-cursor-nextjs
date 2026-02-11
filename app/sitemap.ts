import { MetadataRoute } from 'next';
import { connect } from '@/lib/db/mongo';
import SearchRecord from '@/lib/db/SearchRecord';
import { encodeMovieId } from '@/lib/movieId';
import { getAllBlogPosts } from '@/app/blog/posts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wherewasfilmed.com';
const MAX_MOVIE_ENTRIES = 500;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  try {
    const conn = await connect();
    if (!conn) return base;

    const popular = await SearchRecord.aggregate([
      { $group: { _id: '$m', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: MAX_MOVIE_ENTRIES },
      { $project: { movieId: '$_id', _id: 0 } },
    ]);

    const movieEntries = (popular || []).map((item) => ({
      url: `${siteUrl}/movie/${encodeMovieId(String(item.movieId))}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const blogPosts = getAllBlogPosts();
    const blogEntries = blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...base, ...movieEntries, ...blogEntries];
  } catch {
    return base;
  }
}
