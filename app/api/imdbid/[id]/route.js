import { NextResponse } from 'next/server';
import axios from 'axios';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';

const version = '24.2';

export async function GET(request, { params }) {
  const start = performance.now();
  const { id: imdbid } = await params;
  console.log(`Request received for IMDB ID: ${imdbid}`);

  try {
    await connectDB();

    let existingMovie = await Movie.findOne({ imdbid });
    if (existingMovie) {
      return NextResponse.json({
        imdbid: existingMovie.imdbid,
        locations: existingMovie.locations,
        runtime: existingMovie.runtime,
        source: 'mongodb',
      });
    }

    const response = await axios.get(
      `https://caching.graphql.imdb.com/?operationName=TitleFilmingLocationsPaginated&variables=%7B%22after%22%3A%22bGMwMjkwODcz%22%2C%22const%22%3A%22${imdbid}%22%2C%22first%22%3A50%2C%22isAutoTranslationEnabled%22%3Afalse%2C%22locale%22%3A%22en-US%22%2C%22originalTitleText%22%3Afalse%7D&extensions=%7B%22persistedQuery%22%3A%7B%22sha256Hash%22%3A%229f2ac963d99baf72b7a108de141901f4caa8c03af2e1a08dfade64db843eff7b%22%2C%22version%22%3A1%7D%7D`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.data.data || !response.data.data.title.filmingLocations) {
      return NextResponse.json({
        version,
        imdbid,
        locations: 'location not found',
        source: 'api',
      });
    }

    const locs = response.data.data.title.filmingLocations.edges;
    const end = performance.now();
    const runtime = end - start;

    existingMovie = new Movie({ imdbid, locations: locs, runtime });
    await existingMovie.save();

    return NextResponse.json({
      imdbid,
      locations: locs,
      runtime,
      source: 'api',
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

