'use client';

import React, { useEffect } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { getLocations, getPoster } from '@/lib/redux/actions/MovieActions';

export default function SearchedMovies() {
  const dispatch = useDispatch();
  const fMovies = useSelector((state) => state.MovieReducer.fMovies);

  useEffect(() => {}, [fMovies]);

  return (
    <Container>
      <Row>
        {fMovies.map((movie, index) => (
          <Col key={index} xl={3} lg={6} sm={12}>
            <Link
              href={`/movie/${movie.id}`}
              style={{ textDecoration: 'none' }}
              onClick={() => {
                dispatch(getLocations(movie.id));
                dispatch(getPoster(movie.poster_path));
              }}
            >
              <article className="card movie-card">
                <img
                  className="card__background"
                  src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                  alt={movie.overview.slice(0, 144) + '...'}
                />
                <div className="card__content | flow">
                  <div className="card__content--container | flow">
                    <h2 className="card__title">{movie.original_title}</h2>
                    <p className="card__description">
                      {movie.overview.slice(0, 144) + '...'}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

