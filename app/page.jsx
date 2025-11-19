'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import NavbarComponent from './components/NavbarComponent';
import Searchbar from './components/Searchbar';
import Movies from './components/Movies';
import Footer from './components/Footer';
import { getPopularMovies } from '@/lib/redux/actions/MovieActions';

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPopularMovies());
  }, [dispatch]);

  return (
    <div className="App">
      <NavbarComponent />
      <main>
        <section aria-label="Search movies">
          <Searchbar />
        </section>
        <section aria-label="Popular movies">
          <Movies />
        </section>
      </main>
      <Footer />
    </div>
  );
}

