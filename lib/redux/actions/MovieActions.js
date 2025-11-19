'use client';

import { GET_POPULAR_MOVIES, GET_LOCATIONS, GET_POSTER, FETCH_MOVIES } from './ActionTypes';
import axios from 'axios';

// alertifyjs'i dinamik olarak import et (SSR hatası önlemek için)
const getAlertify = () => {
  if (typeof window !== 'undefined') {
    return require('alertifyjs');
  }
  return null;
};

export const getPopularMovies = () => (dispatch) => {
  axios
    .get('/api/popular-movies')
    .then((response) => {
      dispatch({
        type: GET_POPULAR_MOVIES,
        payload: response.data,
      });
    })
    .catch((err) => console.log('Error fetching popular movies:', err));
};

export const getPoster = (poster_path) => (dispatch) => {
  dispatch({
    type: GET_POSTER,
    payload: poster_path
  });
};

export const getLocations = (id) => async (dispatch) => {
  const movieID = [];
  const movieInfo = [];
  let noMovie = false;

  try {
    const movieResponse = await axios.get(`/api/movie/${id}`);

    if (!movieResponse.data.imdb_id) {
      const alertify = getAlertify();
      if (alertify) alertify.error('Movie ID not found.');
      return;
    }

    const imdbid = { imdbid: movieResponse.data.imdb_id };
    movieID.push(imdbid);

    const locationsResponse = await axios.get(`/api/imdbid/${movieID[0].imdbid}`);

    if (
      !locationsResponse.data.locations ||
      locationsResponse.data.locations.length === 0 ||
      locationsResponse.data.locations === 'location not found'
    ) {
      const alertify = getAlertify();
      if (alertify) {
        alertify.set('notifier', 'position', 'top-right');
        alertify.error('No location found for this movie.');
      }
      noMovie = true;
    } else {
      locationsResponse.data.locations.map((res) => {
        movieInfo.push({
          place: res.node.location,
          desc:
            res.node?.displayableProperty?.qualifiersInMarkdownList?.[0]
              ?.markdown || 'No description available',
        });
      });

      await Promise.all(
        movieInfo.map(async (movie, index) => {
          const encodedPlace = encodeURIComponent(movie.place);
          try {
            // Client-side'da çalıştığı için NEXT_PUBLIC_ prefix'i gerekli
            const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'a97d941d259f4b42912a28ac3d623d46';
            const geoResponse = await axios.get(
              `https://api.geoapify.com/v1/geocode/search?text=${encodedPlace}&apiKey=${GEOAPIFY_API_KEY}`
            );

            movie.Xcoor = geoResponse?.data?.features?.[0]?.geometry?.coordinates?.[0];
            movie.Ycoor = geoResponse?.data?.features?.[0]?.geometry?.coordinates?.[1];
            movie.index = index;
          } catch (error) {
            console.log('Error fetching geolocation:', error);
          }
        })
      );
    }

    dispatch({
      type: GET_LOCATIONS,
      payload: {
        movieInfo,
        noMovie,
      },
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

export const fetchMovies = (movieValue) => async (dispatch) => {
  try {
    const response = await axios.get(`/api/search-movie?query=${movieValue}`);

    dispatch({
      type: FETCH_MOVIES,
      payload: response.data,
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
};

