'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { getImageUrl } from '@/lib/utils/imageUrl';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

// Dynamic import for client-side Leaflet icon usage
const getLeafletIcon = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    return L.Icon;
  }
  return null;
};

// Component to fit map bounds to all markers
// This must be used inside MapContainer to access useMap hook
const FitBounds = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      function FitBounds({ coordinates }) {
        const map = mod.useMap();
        const L = require('leaflet');

        useEffect(() => {
          if (!coordinates || coordinates.length === 0) return;

          const validCoordinates = coordinates.filter(
            (coord) => coord.Ycoor !== undefined && coord.Xcoor !== undefined
          );

          if (validCoordinates.length === 0) return;

          try {
            const bounds = L.latLngBounds(
              validCoordinates.map((coord) => [coord.Ycoor, coord.Xcoor])
            );

            // Add padding to bounds for better visibility
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 12,
            });
          } catch (error) {
            console.error('Error fitting bounds:', error);
          }
        }, [map, coordinates]);

        return null;
      }
      return FitBounds;
    }),
  { ssr: false }
);

// Location Loading Component
const LocationLoading = ({ movieImages = [], poster = null }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use poster as fallback if no images available
  const displayImages = movieImages.length > 0 
    ? movieImages 
    : poster 
      ? [poster] 
      : [];

  useEffect(() => {
    if (displayImages.length > 0) {
      const imageInterval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
      }, 2500); // Change image every 2.5 seconds

      return () => clearInterval(imageInterval);
    }
  }, [displayImages.length]);

  const getPrevIndex = (current, total) => {
    return current === 0 ? total - 1 : current - 1;
  };

  const getNextIndex = (current, total) => {
    return current === total - 1 ? 0 : current + 1;
  };

  // If no images and no poster, show nothing
  if (displayImages.length === 0) {
    return <div className="location-loading-container"></div>;
  }

  const prevIndex = getPrevIndex(currentImageIndex, displayImages.length);
  const nextIndex = getNextIndex(currentImageIndex, displayImages.length);

  return (
    <div className="location-loading-container">
      <div className="movie-images-carousel">
        {/* Previous Image (Small) */}
        {displayImages.length > 1 && (
          <div className="carousel-image carousel-prev">
            <div
              className="carousel-image-inner"
              style={{
                backgroundImage: `url(/api/image?path=${encodeURIComponent(displayImages[prevIndex])}&size=w342)`,
              }}
            />
          </div>
        )}

        {/* Current Image (Large) */}
        <div className="carousel-image carousel-current">
          <div
            className="carousel-image-inner"
            style={{
              backgroundImage: `url(/api/image?path=${encodeURIComponent(displayImages[currentImageIndex])}&size=w780)`,
            }}
          />
        </div>

        {/* Next Image (Small) */}
        {displayImages.length > 1 && (
          <div className="carousel-image carousel-next">
            <div
              className="carousel-image-inner"
              style={{
                backgroundImage: `url(/api/image?path=${encodeURIComponent(displayImages[nextIndex])}&size=w342)`,
              }}
            />
          </div>
        )}
      </div>
      <div className="loading-message-text">
        <p>Locations are being loaded, please wait...</p>
      </div>
    </div>
  );
};

// Movie Info Header Component
const MovieInfoHeader = ({ movieDetails, poster }) => {
  if (!movieDetails || !poster) return null;

  return (
    <div className="movie-info-header">
      <div className="movie-info-content">
        {poster && (
          <div className="movie-poster">
            <img 
              src={getImageUrl(poster, 'w342')} 
              alt={`${movieDetails.title || movieDetails.original_title || 'Movie'} poster - ${movieDetails.overview?.substring(0, 60) || 'Filming locations'}`}
              className="poster-image"
              loading="lazy"
              decoding="async"
              width={342}
              height={513}
              sizes="(max-width: 576px) 100px, (max-width: 768px) 120px, 150px"
            />
          </div>
        )}
        <div className="movie-info-text">
          <h2 className="movie-title">{movieDetails.title || 'Unknown Movie'}</h2>
          {movieDetails.overview && (
            <p className="movie-overview">{movieDetails.overview}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export function SelectedMovie() {
  const [movieInfos, poster, movieDetails, movieImages] = useSelector((state) => [
    state.MovieReducer.movieInfos,
    state.MovieReducer.poster,
    state.MovieReducer.movieDetails,
    state.MovieReducer.movieImages,
  ]);

  const [coordinates, setCoordinates] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [loadingStartTime] = useState(Date.now());
  const [minLoadingTime] = useState(10000); // Minimum 10 seconds

  useEffect(() => {
    async function processLocations() {
      // Wait minimum 5 seconds
      const elapsed = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
      
      // Set coordinates
      if (movieInfos && movieInfos.length > 0) {
        setCoordinates(movieInfos);
        setShowMap(true);
      } else {
        // Wait minimum time even if no locations found
        setShowMap(true);
      }
    }

    if (movieInfos) {
      processLocations();
    }
  }, [movieInfos, loadingStartTime, minLoadingTime]);

  const defaultCenter =
    coordinates.length > 0 && coordinates[0].Ycoor && coordinates[0].Xcoor
      ? [coordinates[0].Ycoor, coordinates[0].Xcoor]
      : [55, 60];

  return (
    <div className="selected-movie-container">
      {!showMap || coordinates.length === 0 ? (
        <LocationLoading movieImages={movieImages || []} poster={poster} />
      ) : (
        <div className="map-section">
          <MovieInfoHeader movieDetails={movieDetails} poster={poster} />
          <div className="map-wrapper">
            <MapContainer
            center={defaultCenter}
            zoom={3}
            minZoom={0}
            maxZoom={12}
            scrollWheelZoom={true}
            className="map-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
            />
            <FitBounds coordinates={coordinates} />
            {coordinates.map(
              (elem, index) =>
                elem.Ycoor !== undefined &&
                elem.Xcoor !== undefined && (
                  <Marker
                    key={index}
                    position={[elem.Ycoor, elem.Xcoor]}
                    icon={
                      (() => {
                        const Icon = getLeafletIcon();
                        if (Icon) {
                          return new Icon({
                            iconUrl: '/assets/film.png',
                            iconSize: [40, 40],
                            iconAnchor: [20, 40],
                            popupAnchor: [0, -40],
                            className: 'custom-marker-icon',
                          });
                        }
                        return null;
                      })()
                    }
                  >
                    <Popup className="custom-popup" closeButton={true}>
                      <div className="popup-content">
                        <div className="popup-header">
                          <div className="popup-icon">🎬</div>
                          <h3 className="popup-title">{movieInfos[index].place}</h3>
                        </div>
                        {movieInfos[index].desc && movieInfos[index].desc !== 'No description available' && (
                          <div className="popup-description">
                            <div className="popup-label">Scene</div>
                            <p className="popup-text">{movieInfos[index].desc}</p>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelectedMovie;

