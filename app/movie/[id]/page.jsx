'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import AppHeader from '@/app/components/AppHeader';
import Footer from '@/app/components/Footer';
import { getLocations } from '@/lib/redux/actions/MovieActions';

const SelectedMovie = dynamic(() => import('@/app/components/SelectedMovie'), { ssr: false });

export default function MoviePage() {
  const params = useParams();
  const dispatch = useDispatch();
  const movieId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const movieDetails = useSelector((state) => state.MovieReducer.movieDetails);
  const movieInfos = useSelector((state) => state.MovieReducer.movieInfos);
  const geocodeProgress = useSelector((state) => state.MovieReducer.geocodeProgress);

  useEffect(() => {
    if (movieId) {
      dispatch(getLocations(movieId));
    }
  }, [movieId, dispatch]);

  // Generate JSON-LD structured data for movie (SEO)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wherewasfilmed.com';
  const jsonLd = movieDetails ? {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movieDetails.title || movieDetails.original_title,
    description: movieDetails.overview || undefined,
    image: movieDetails.poster_url || `${siteUrl}/assets/film.png`,
    ...(movieDetails.wikidataMeta?.year && { datePublished: String(movieDetails.wikidataMeta.year) }),
    ...(movieInfos && movieInfos.length > 0 && {
      contentLocation: movieInfos
        .map((location) => ({
          '@type': 'Place',
          name: location.place,
          ...(location.Ycoor != null && location.Xcoor != null && {
            geo: { '@type': 'GeoCoordinates', latitude: location.Ycoor, longitude: location.Xcoor },
          }),
          ...(location.desc && location.desc !== 'No description available' && { description: location.desc }),
        }))
        .filter((loc) => loc.geo),
    }),
  } : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#080810] text-white">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AppHeader />
      {/* pt-24 (6rem) header için; main yüksekliği içeriğe göre (harita ~380vh) — flex:1 yok ki büyüsün */}
      <main className="pt-24 flex flex-col min-h-0 flex-shrink-0">
        <SelectedMovie onLoadingChange={setIsLoading} />
      </main>
      <Footer />
    </div>
  );
}

