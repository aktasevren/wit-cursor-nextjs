import { NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'ed3d6526412667469a4e1a08a88488ef';

if (!process.env.TMDB_API_KEY) {
  console.warn('TMDB_API_KEY environment variable is not set, using fallback');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`
    );

    const filteredMovies = response.data.results.filter(
      (movie) => !movie.genre_ids.includes(16) // Animasyon filmleri filtrelendi
    );

    return NextResponse.json(filteredMovies);
  } catch (error) {
    console.error('Error fetching movie search results:', error);
    return NextResponse.json({ error: 'Failed to fetch movie search results' }, { status: 500 });
  }
}

