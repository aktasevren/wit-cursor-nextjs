'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import NavbarComponent from '@/app/components/NavbarComponent';
import Searchbar from '@/app/components/Searchbar';
import SelectedMovie from '@/app/components/SelectedMovie';
import Footer from '@/app/components/Footer';
import { getLocations, getPoster } from '@/lib/redux/actions/MovieActions';

export default function MoviePage() {
  const params = useParams();
  const dispatch = useDispatch();
  const movieId = params.id;

  useEffect(() => {
    if (movieId) {
      dispatch(getLocations(movieId));
    }
  }, [movieId, dispatch]);

  return (
    <div className="App">
      <NavbarComponent />
      <Searchbar />
      <SelectedMovie />
      <Footer />
    </div>
  );
}

