import { NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(request, { params }) {
  try {
    if (!TMDB_API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ TMDB_API_KEY environment variable is not set!');
      }
      return NextResponse.json(
        { 
          error: 'Movie service unavailable',
          message: 'TMDB_API_KEY environment variable is not configured'
        },
        { status: 503 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}/images?api_key=${TMDB_API_KEY}`,
      {
        timeout: 10000,
      }
    );

    // Get backdrops (set görselleri)
    const backdrops = response.data?.backdrops || [];
    const posters = response.data?.posters || [];
    
    // Combine backdrops and posters, prioritize backdrops
    let allImages = [...backdrops.map(img => img.file_path)];
    
    // If no backdrops, use posters
    if (allImages.length === 0 && posters.length > 0) {
      allImages = posters.map(img => img.file_path);
    } else if (allImages.length < 10 && posters.length > 0) {
      // Add some posters if we don't have enough backdrops
      const additionalPosters = posters.slice(0, 10 - allImages.length).map(img => img.file_path);
      allImages = [...allImages, ...additionalPosters];
    }
    
    // Limit to 10 images total
    const limitedImages = allImages.slice(0, 10);

    return NextResponse.json({
      images: limitedImages,
      total: allImages.length,
    });
  } catch (error) {
    console.error('Error fetching movie images:', error.message || error);
    
    if (error.response) {
      return NextResponse.json(
        { error: 'Failed to fetch movie images', details: error.response.data },
        { status: error.response.status || 500 }
      );
    } else if (error.request) {
      return NextResponse.json(
        { error: 'No response from movie service' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch movie images', details: error.message },
      { status: 500 }
    );
  }
}

