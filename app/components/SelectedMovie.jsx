'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import {
  IconLocationOn,
  IconRefresh,
  IconMovieFilter,
} from '@/app/components/Icons';

import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});
const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-cluster').then((mod) => mod.default),
  { ssr: false }
);

// Fit map bounds to all markers (runs on mount and when coordinates change)
const FitBounds = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      function FitBounds({ coordinates }) {
        const map = mod.useMap();

        useEffect(() => {
          if (!coordinates || coordinates.length === 0) return;

          const validCoordinates = coordinates.filter(
            (coord) => coord != null && coord.Ycoor != null && coord.Xcoor != null
          );

          if (validCoordinates.length === 0) return;

          try {
            const bounds = L.latLngBounds(
              validCoordinates.map((coord) => [coord.Ycoor, coord.Xcoor])
            );

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

// Reset map view (fit bounds again) — used when user clicks "Reset Map"
const MapResetControl = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      function MapResetControl({ coordinates, resetTrigger }) {
        const map = mod.useMap();

        useEffect(() => {
          if (!coordinates?.length || resetTrigger == null) return;

          const valid = coordinates.filter(
            (c) => c != null && c.Ycoor != null && c.Xcoor != null
          );
          if (valid.length === 0) return;

          try {
            const bounds = L.latLngBounds(
              valid.map((c) => [c.Ycoor, c.Xcoor])
            );
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
          } catch (e) {}
        }, [resetTrigger]);

        return null;
      }
      return MapResetControl;
    }),
  { ssr: false }
);

// Lokasyon kartına tıklanınca haritada o noktaya uçar
const MapFlyToLocation = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      function MapFlyToLocation({ coordinates, flyToIndex }) {
        const map = mod.useMap();

        useEffect(() => {
          if (flyToIndex == null || !coordinates?.length) return;
          const c = coordinates[flyToIndex];
          if (c?.Ycoor == null || c?.Xcoor == null) return;
          try {
            map.flyTo([c.Ycoor, c.Xcoor], 12, { duration: 0.8 });
          } catch (e) {}
        }, [map, coordinates, flyToIndex]);

        return null;
      }
      return MapFlyToLocation;
    }),
  { ssr: false }
);

// Harita container boyutu değişince Leaflet'in invalidateSize ile güncellemesi (mobil dahil)
// Viewport'a girdiğinde invalidateSize (mobilde aşağıda kalan harita siyah kalmasın)
const MapResize = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      function MapResize() {
        const map = mod.useMap();

        useEffect(() => {
          const run = () => {
            try {
              map.invalidateSize();
            } catch (e) {}
          };
          // İlk çalıştırma: layout tamamlansın diye RAF + kısa gecikmeler (mobil siyah ekran fix)
          const raf = typeof requestAnimationFrame !== 'undefined'
            ? requestAnimationFrame(() => run())
            : null;
          const t1 = setTimeout(run, 50);
          const t2 = setTimeout(run, 200);
          const t3 = setTimeout(run, 500);
          const t4 = setTimeout(run, 1000);

          const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
          const timeouts = [t1, t2, t3, t4];
          if (isMobile) {
            timeouts.push(setTimeout(run, 1500));
            timeouts.push(setTimeout(run, 2500));
          }

          const container = map.getContainer();
          if (container && typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => run());
            ro.observe(container);
            if (typeof IntersectionObserver !== 'undefined') {
              // Mobilde harita viewport'a girer girmez invalidateSize (threshold düşük)
              const io = new IntersectionObserver(
                (entries) => {
                  if (entries[0]?.isIntersecting) {
                    run();
                    if (isMobile) setTimeout(run, 100);
                  }
                },
                { root: null, rootMargin: '20px', threshold: 0.01 }
              );
              io.observe(container);
              return () => {
                if (raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf);
                timeouts.forEach(clearTimeout);
                ro.disconnect();
                io.disconnect();
              };
            }
            return () => {
              if (raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf);
              timeouts.forEach(clearTimeout);
              ro.disconnect();
            };
          }
          return () => {
            if (raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf);
            timeouts.forEach(clearTimeout);
          };
        }, [map]);

        return null;
      }
      return MapResize;
    }),
  { ssr: false }
);

// Tasarım birebir: Did you know kartı için sabit örnek (Star Wars / Tunisia)
const DID_YOU_KNOW_CARD = {
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCAcqOn4gFh0AjqWQPW_-k4mwcBb8uFIOrRbwNNnpbhz4sLQOU_CR30_PJtDvYl_AawNQVgj6xii2bSEM14SOH57m0g3KU0COgGsBZuLcBrJJ0Nehp72YYbOLZyTpZVj3W6nKQaHjoq6MHbSR7PcRrVqdJIqnkPvg9NZF0AJ0XNGHfW2GeGD0yWjKRm4V-q-5W43B_9CVLKc5WV70XZX3Skz4qkdM4hhHOqH1TIY8AJCQ-TUkIidTnrVW1obrpbgdihkgV4E60vYzX',
  title: 'The Tunisian Desert Origins',
  body: 'The desert scenes for Tatooine were filmed in Tunisia, where some sets still stand today. The local town of Matmata features underground "troglodyte" houses used for the Lars Homestead.',
  location: 'Tunisia, Africa',
  year: 'Filmed in 1976',
};

// Location Loading — kırmızı sinema perdesi açılır, yükleme çubuğu
const LocationLoading = ({
  title,
  noLocations,
  redirectCountdown,
  geocodeProgress,
}) => {
  const total = geocodeProgress?.total ?? 0;
  const processed = geocodeProgress?.processed ?? 0;
  const found = geocodeProgress?.found ?? 0;
  const hasProgress = total > 0;
  const progressPercent = hasProgress ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-0 bg-[#0c0c0f] overflow-hidden location-loading-screen" aria-busy="true" aria-label="Loading filming locations">
      {/* Kırmızı sinema perdeleri — ortadan açılır */}
      <div className="curtains fixed inset-0 z-30 flex pointer-events-none">
        <div className="curtain curtain-left" aria-hidden />
        <div className="curtain curtain-right" aria-hidden />
      </div>

      {/* Perde arkası: karanlık sahne + yükleme içeriği */}
      <div className="relative z-20 flex flex-col min-h-screen items-center justify-center px-6 py-24">
        <div className="curtain-content w-full max-w-md flex flex-col items-center gap-10 text-center">
          {noLocations ? (
            <>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">
                No filming locations found
              </h1>
              <p className="text-white/60 text-sm">
                Redirecting in {redirectCountdown ?? 5} second{(redirectCountdown ?? 5) === 1 ? '' : 's'}…
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-5 curtain-loading-text w-full max-w-sm">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
                  Loading filming locations
                </p>
                {title && (
                  <h1 className="text-xl sm:text-2xl font-semibold text-white leading-tight text-center line-clamp-3 px-1" title={title}>
                    {title}
                  </h1>
                )}
              </div>
              <div className="w-full space-y-1.5">
                <div className="curtain-progress-track">
                  <div
                    className={`curtain-progress-bar ${!hasProgress ? 'curtain-progress-bar--indeterminate' : ''}`}
                    style={hasProgress ? { width: `${progressPercent}%` } : undefined}
                  />
                </div>
                {hasProgress && (
                  <p className="text-[11px] text-white/40">
                    {found} location{found !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function SelectedMovie({ onLoadingChange }) {
  const router = useRouter();
  const movieInfos = useSelector((state) => state.MovieReducer.movieInfos);
  const movieDetails = useSelector((state) => state.MovieReducer.movieDetails);
  const noMovie = useSelector((state) => state.MovieReducer.noMovie);
  const geocodeProgress = useSelector((state) => state.MovieReducer.geocodeProgress);
  const locationsSource = useSelector((state) => state.MovieReducer.locationsSource);

  const [coordinates, setCoordinates] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [mapResetTrigger, setMapResetTrigger] = useState(0);
  const [flyToLocationIndex, setFlyToLocationIndex] = useState(null);
  const loadingStartTimeRef = useRef(0);
  const minLoadingTime = 10000; // Minimum 10 seconds
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const containerRef = useRef(null);
  useEffect(() => {
    if (!loadingStartTimeRef.current) loadingStartTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    async function processLocations() {
      // Wait minimum 5 seconds
      const elapsed = Date.now() - (loadingStartTimeRef.current || Date.now());
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
  }, [movieInfos, minLoadingTime]);

  const noLocations =
    Boolean(noMovie) || (geocodeProgress?.status === 'done' && (geocodeProgress?.found ?? 0) === 0);

  useEffect(() => {
    onLoadingChange?.(!showMap);
  }, [showMap, onLoadingChange]);

  useEffect(() => {
    if (!showMap) return;
    if (!noLocations) return;

    setTimeout(() => setRedirectCountdown(5), 0);
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev === null) return 4;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showMap, noLocations, router]);

  const defaultCenter =
    coordinates.length > 0 && coordinates[0].Ycoor && coordinates[0].Xcoor
      ? [coordinates[0].Ycoor, coordinates[0].Xcoor]
      : [55, 60];

  const markerIconUrl =
    movieDetails?.wikidataMeta?.logoIcon || movieDetails?.wikidataMeta?.logo || '/assets/film.png';

  const exactIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: markerIconUrl,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -30],
        className: 'exact-film-icon',
      }),
    [markerIconUrl]
  );

  const isMapView = showMap && coordinates.length > 0;

  return (
    <div
      ref={containerRef}
      className={`selected-movie-container${isMapView ? ' selected-movie-container--map' : ''}`}
      style={isMapView ? { flexShrink: 0 } : undefined}
    >
      {!showMap || coordinates.length === 0 ? (
        <LocationLoading
          title={movieDetails?.title || movieDetails?.original_title || 'Filming Locations'}
          noLocations={showMap && noLocations}
          redirectCountdown={redirectCountdown}
          geocodeProgress={geocodeProgress}
        />
      ) : (
        <>
          {/* Film bilgisi: topbar altında, harita alanının üstünde (akışta, harita içinde değil) */}
          <div className="map-screen-film-bar">
            <div className="map-screen-film-bar-inner">
              <div className="map-screen-film-bar-poster">
                {movieDetails?.poster_url ? (
                  <img src={movieDetails.poster_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="map-screen-film-bar-poster-placeholder">
                    <IconMovieFilter size={28} className="text-white/30" />
                    <span className="map-screen-film-bar-poster-placeholder-text">Film</span>
                  </div>
                )}
              </div>
              <div className="map-screen-film-bar-content">
                <p className="map-screen-film-bar-label">Now exploring</p>
                <h2 className="map-screen-film-bar-title">
                  {movieDetails?.title || movieDetails?.original_title || 'Filming Locations'}
                </h2>
                <p className="map-screen-film-bar-meta">
                  {[movieDetails?.wikidataMeta?.year, movieDetails?.wikidataMeta?.duration].filter(Boolean).join(' · ') || '—'}
                </p>
                <p className="map-screen-film-bar-desc">
                  {(movieDetails?.wikidataMeta?.description || movieDetails?.overview) || 'No description available.'}
                </p>
              </div>
            </div>
          </div>

          <div className="map-screen flex flex-1 min-h-0 w-full self-stretch">
          {/* Sidebar */}
          <aside className="map-screen-sidebar map-screen-sidebar--desktop flex flex-col w-full max-w-[380px] flex-shrink-0">
            <div className="map-screen-location-list flex flex-col flex-1 min-h-0">
              <div className="map-screen-location-list-header">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-primary/30">
                    <IconLocationOn size={22} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="map-screen-location-list-title">
                      Filming Locations
                    </h2>
                    <p className="map-screen-location-list-subtitle">
                      {coordinates.length} location{coordinates.length !== 1 ? 's' : ''} · Tap to focus on map
                    </p>
                  </div>
                </div>
              </div>
              <div className="map-screen-location-list-inner">
                {coordinates.map((loc, index) => {
                  const address = (loc.formatted || loc.place || 'Location').trim() || 'Location';
                  const sceneRaw = loc.desc && loc.desc !== 'No description available' ? loc.desc.trim() : null;
                  const isActive = flyToLocationIndex === index;
                  const numStr = String(index + 1).padStart(2, '0');
                  const sameAsAddress = !sceneRaw || address === sceneRaw || sceneRaw === address || address.includes(sceneRaw) || sceneRaw.includes(address);
                  const showTwoLines = sceneRaw && !sameAsAddress;
                  return (
                    <button
                      type="button"
                      key={`${loc.place}-${index}`}
                      className={`map-screen-location-card ${isActive ? 'map-screen-location-card--active' : ''}`}
                      onClick={() => setFlyToLocationIndex(index)}
                    >
                      <span className="map-screen-location-num" aria-hidden>
                        {numStr}
                      </span>
                      <div className="map-screen-location-content">
                        {showTwoLines && (
                          <span className="map-screen-location-scene">{sceneRaw}</span>
                        )}
                        <span className="map-screen-location-address">{address}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Harita: mobilde tam ekran, masaüstünde sidebar yanında */}
          <section className="map-screen-map relative flex-1 min-w-0">
            <div className="map-screen-map-sticky relative z-0">
              <div className="map-screen-map-inner">
                <div className="map-screen-map-box">
                <MapContainer
                  center={defaultCenter}
                  zoom={5}
                  minZoom={0}
                  maxZoom={12}
                  scrollWheelZoom
                  className="map-screen-leaflet"
                  whenReady={(map) => {
                    setTimeout(() => { try { map.invalidateSize(); } catch (_) {} }, 100);
                    setTimeout(() => { try { map.invalidateSize(); } catch (_) {} }, 400);
                  }}
                >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResize />
                <FitBounds coordinates={coordinates} />
                <MapResetControl coordinates={coordinates} resetTrigger={mapResetTrigger} />
                <MapFlyToLocation coordinates={coordinates} flyToIndex={flyToLocationIndex} />
                <MarkerClusterGroup chunkedLoading>
                {coordinates.map((elem, index) => {
                  const hasPoint = elem != null && elem.Ycoor != null && elem.Xcoor != null;
                  if (!hasPoint) return null;

                  const hasBbox = Array.isArray(elem.bbox) && elem.bbox.length === 4;
                  const [minLon, minLat, maxLon, maxLat] = hasBbox ? elem.bbox : [];
                  const areaSize = hasBbox
                    ? Math.max(Math.abs(maxLat - minLat), Math.abs(maxLon - minLon))
                    : 0;
                  const isBroad =
                    hasBbox &&
                    (areaSize >= 2 ||
                      ['country', 'state', 'region'].includes(String(elem.placeType)));

                  const title = elem.formatted || elem.place;

                  if (isBroad) {
                    const radius = Math.min(18, Math.max(10, areaSize * 2));
                    return (
                      <CircleMarker
                        key={`broad-${index}`}
                        center={[elem.Ycoor, elem.Xcoor]}
                        radius={radius}
                        pathOptions={{
                          color: 'rgb(17, 17, 212)',
                          fillColor: '#1111d4',
                          fillOpacity: 0.45,
                          weight: 1,
                        }}
                      >
                        <Popup className="custom-popup" closeButton>
                          <div className="popup-content">
                            <div className="popup-header">
                              <h3 className="popup-title">{title}</h3>
                            </div>
                            <div className="popup-description">
                              <p className="popup-text">Broad area — zoom in for details.</p>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  }

                  return (
                    <Marker
                      key={`exact-${index}`}
                      position={[elem.Ycoor, elem.Xcoor]}
                      icon={exactIcon}
                    >
                      <Popup className="custom-popup" closeButton>
                        <div className="popup-content">
                          <div className="popup-header">
                            <h3 className="popup-title">{title}</h3>
                          </div>
                          {elem.desc && elem.desc !== 'No description available' && (
                            <div className="popup-description">
                              <p className="popup-text">{elem.desc}</p>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                </MarkerClusterGroup>
              </MapContainer>
                </div>

                {/* Overlay: sol tarafta gradient */}
                <div className="map-screen-overlays absolute inset-0 z-[1100] pointer-events-none hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/35 to-transparent" />
                </div>
                {/* Sağ üst: Reset Map + Database Status */}
                <div className="absolute top-6 right-6 z-[1101] hidden md:flex items-center gap-3">
                  <button
                    type="button"
                    className="glass-pill rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-primary transition-colors pointer-events-auto"
                    onClick={() => setMapResetTrigger((t) => t + 1)}
                  >
                    <IconRefresh size={18} />
                    Reset Map
                  </button>
                  {locationsSource && (
                    <div className="glass-pill px-3 py-2 rounded-full flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-tighter text-white/40">Source</span>
                      <span className="text-[10px] uppercase font-bold tracking-tighter text-primary">{locationsSource === 'db' ? 'DB' : 'Web'}</span>
                    </div>
                  )}
                </div>
                <div className="map-screen-legend absolute bottom-6 left-6 z-[1101] glass-pill px-4 py-4 rounded-xl flex flex-col gap-3 hidden md:flex">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary pin-glow" aria-hidden />
                    <span className="text-xs font-medium text-white/80">Filmed Here</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full border border-primary bg-primary/20" aria-hidden />
                    <span className="text-xs font-medium text-white/80">Region Highlight</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          </div>
        </>
      )}
    </div>
  );
}

export default SelectedMovie;

