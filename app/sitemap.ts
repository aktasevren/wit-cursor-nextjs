import { MetadataRoute } from 'next';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://where-is-this.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Dynamic movie pages - fetch popular movies
  let moviePages: MetadataRoute.Sitemap = [];
  
  try {
    if (TMDB_API_KEY) {
      // Fetch popular movies from TMDB
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
        {
          timeout: 10000,
        }
      );

      const movies = response.data?.results || [];
      
      // Limit to first 100 movies to avoid sitemap being too large
      moviePages = movies.slice(0, 100).map((movie: any) => ({
        url: `${baseUrl}/movie/${movie.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching movies for sitemap:', error);
    // Continue with static pages only if API fails
  }

  return [...staticPages, ...moviePages];
}

