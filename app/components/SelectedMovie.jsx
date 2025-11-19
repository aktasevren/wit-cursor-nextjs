'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

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

// Icon'u client-side'da kullanmak için dinamik import
const getLeafletIcon = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    return L.Icon;
  }
  return null;
};

export function SelectedMovie() {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const [movieInfos, poster] = useSelector((state) => [
    state.MovieReducer.movieInfos,
    state.MovieReducer.poster,
  ]);

  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    async function makeRequest() {
      await delay(2000);
      setCoordinates(movieInfos);
      console.log(coordinates);
    }
    makeRequest();
  }, [movieInfos, coordinates]);

  const defaultCenter =
    coordinates.length > 0 && coordinates[0].Ycoor && coordinates[0].Xcoor
      ? [coordinates[0].Ycoor, coordinates[0].Xcoor]
      : [55, 60];

  return (
    <div>
      {coordinates.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <iframe
            src="https://giphy.com/embed/VI2UC13hwWin1MIfmi"
            width="480"
            height="322"
            style={{ border: 'none' }}
            frameBorder="0"
            allowFullScreen
            title="Loading Animation"
          ></iframe>
          <p>
            <a
              href="https://giphy.com/gifs/VI2UC13hwWin1MIfmi"
              target="_blank"
              rel="noopener noreferrer"
            >
              via GIPHY
            </a>
          </p>
        </div>
      ) : (
        <MapContainer
          center={defaultCenter}
          zoom={3}
          minZoom={0}
          maxZoom={12}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          />
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
                          iconSize: [37.5, 37.5],
                          iconAnchor: [12, 41],
                        });
                      }
                      return null;
                    })()
                  }
                >
                  <Popup className="leaflet-popup">
                    <b>{movieInfos[index].place}</b>
                    <br />
                    {movieInfos[index].desc === undefined ? null : (
                      <div>
                        <span style={{ color: 'red' }}>Description:</span>
                        {' ' + movieInfos[index].desc}
                      </div>
                    )}
                  </Popup>
                </Marker>
              )
          )}
        </MapContainer>
      )}
    </div>
  );
}

export default SelectedMovie;

