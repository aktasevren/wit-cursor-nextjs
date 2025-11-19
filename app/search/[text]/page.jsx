'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import NavbarComponent from '@/app/components/NavbarComponent';
import Searchbar from '@/app/components/Searchbar';
import SearchedMovies from '@/app/components/SearchedMovies';
import Footer from '@/app/components/Footer';
import { fetchMovies } from '@/lib/redux/actions/MovieActions';

export default function SearchPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const searchText = params.text;

  useEffect(() => {
    if (searchText) {
      dispatch(fetchMovies(searchText));
    }
  }, [searchText, dispatch]);

  return (
    <div className="App">
      <NavbarComponent />
      <main>
        <section aria-label="Search movies">
          <Searchbar />
        </section>
        <section aria-label={`Search results for: ${searchText}`}>
          <SearchedMovies />
        </section>
      </main>
      <Footer />
    </div>
  );
}

