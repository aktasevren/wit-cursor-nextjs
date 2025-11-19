// Helper function to generate metadata for movie pages
export async function generateMovieMetadata(movieId) {
  try {
    // Fetch movie details from API
    // Use absolute URL for server-side fetch
    let baseUrl = 'http://localhost:3000';
    
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }
    
    const response = await fetch(`${baseUrl}/api/movie/${movieId}`, {
      next: { revalidate: 86400 }, // Revalidate once per day
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return getDefaultMetadata(movieId);
    }

    const movie = await response.json();
    
    if (!movie || !movie.title) {
      return getDefaultMetadata(movieId);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://where-is-this.vercel.app';
    const imageUrl = movie.poster_path 
      ? `${siteUrl}/api/image?path=${encodeURIComponent(movie.poster_path)}&size=w500`
      : `${siteUrl}/assets/film.png`;

    const description = movie.overview 
      ? `${movie.overview.substring(0, 145)}... Find all filming locations of ${movie.title} on an interactive map.`
      : `Discover where ${movie.title} was filmed! Find all filming locations on an interactive map. Explore the exact locations where this ${movie.genres?.[0]?.name || 'movie'} was shot.`;

    const keywords = [
      `${movie.title} filming locations`,
      `${movie.title} movie locations`,
      `where was ${movie.title} filmed`,
      `${movie.title} shooting locations`,
      `${movie.title} locations`,
      movie.title,
      ...(movie.genres?.map(g => `${g.name.toLowerCase()} movie locations`) || []),
      "movie filming locations",
      "film locations",
      "movie location finder"
    ];

    return {
      title: `${movie.title} (${movie.release_date?.substring(0, 4) || ''}) - Filming Locations`,
      description: description,
      keywords: keywords,
      openGraph: {
        title: `${movie.title} - Filming Locations | Where is this?`,
        description: description,
        url: `${siteUrl}/movie/${movieId}`,
        siteName: "Where is this?",
        images: [
          {
            url: imageUrl,
            width: 500,
            height: 750,
            alt: `${movie.title} movie poster`,
          },
        ],
        type: "website",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: `${movie.title} - Filming Locations`,
        description: description.substring(0, 200),
        images: [imageUrl],
      },
      alternates: {
        canonical: `${siteUrl}/movie/${movieId}`,
      },
      other: {
        'movie:release_date': movie.release_date || '',
        'movie:genre': movie.genres?.map(g => g.name).join(', ') || '',
      },
    };
  } catch (error) {
    console.error('Error generating movie metadata:', error);
    return getDefaultMetadata(movieId);
  }
}

function getDefaultMetadata(movieId = '') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://where-is-this.vercel.app';
  return {
    title: "Movie Filming Locations",
    description: "Discover where your favorite movies were filmed! Find exact filming locations on an interactive map.",
    alternates: {
      canonical: movieId ? `${siteUrl}/movie/${movieId}` : siteUrl,
    },
  };
}

