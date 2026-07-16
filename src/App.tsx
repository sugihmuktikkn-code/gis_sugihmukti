import { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer, MapRef, GeolocateControl, NavigationControl } from 'react-map-gl';
import { ChevronDown, ChevronUp, Layers, Box, Eye, EyeOff, Ruler, Navigation, Square, Play, Copy, Check, Trash2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from './components/MapPin';
import { InfoPanel } from './components/InfoPanel';
import { POICarousel } from './components/POICarousel';
import { FilterPills } from './components/FilterPills';
import { TopNav } from './components/TopNav';
import { poiData, getIconForCategory } from './data';
import { POI, TouristPackage } from './types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function App() {
  const [poiList, setPoiList] = useState<POI[]>(() => {
    const saved = localStorage.getItem('poiData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => {
          const defaultPoi = poiData.find(d => d.id === item.id);
          return {
            ...item,
            packages: defaultPoi ? defaultPoi.packages : item.packages,
            icon: getIconForCategory(item.category)
          };
        });
      } catch (e) {
        console.error(e);
      }
    }
    return poiData;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showAddPoiModal, setShowAddPoiModal] = useState<boolean>(false);
  const [clickedCoords, setClickedCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [poiToEdit, setPoiToEdit] = useState<POI | null>(null);

  const [activePOIId, setActivePOIId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('wisata');
  const [showCarousel, setShowCarousel] = useState<boolean>(true);
  const [is3D, setIs3D] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<string>('mapbox://styles/alwancodet66/cmrfky2up002w01qr9ecv6ode');
  const [showStyleSwitcher, setShowStyleSwitcher] = useState<boolean>(false);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<{ lng: number; lat: number }[]>([]);
  const [navigationRoute, setNavigationRoute] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [travelMode, setTravelMode] = useState<'car' | 'motor' | 'walk'>('motor');

  // Live GPS Trail Recorder states
  const [isRecordingGPS, setIsRecordingGPS] = useState<boolean>(false);
  const [recordedCoordinates, setRecordedCoordinates] = useState<[number, number][]>([]);
  const watchId = useRef<number | null>(null);
  const [recordedDistance, setRecordedDistance] = useState<number>(0);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [localTrails, setLocalTrails] = useState<[number, number][][]>(() => {
    const saved = localStorage.getItem('localTrails');
    return saved ? JSON.parse(saved) : [];
  });

  // Haversine distance calculator
  const calculateDistance = (coords: { lng: number; lat: number }[]) => {
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const R = 6371e3; // meters
      const φ1 = p1.lat * Math.PI / 180;
      const φ2 = p2.lat * Math.PI / 180;
      const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
      const Δλ = (p2.lng - p1.lng) * Math.PI / 180;
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total;
  };
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    localStorage.setItem('poiData', JSON.stringify(
      poiList.map(item => {
        const { icon, ...rest } = item;
        return rest; // save to localStorage without icon function
      })
    ));
  }, [poiList]);

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAdmin]);

  useEffect(() => {
    setNavigationRoute(null);
    
    // Auto-pan/FitBounds kamera saat POI dipilih
    if (activePOIId) {
      const poi = poiList.find(p => p.id === activePOIId);
      const kantorDesa = poiList.find(p => p.id === 'kantor-desa');
      if (poi && mapRef.current) {
        if (kantorDesa && poi.id !== 'kantor-desa') {
          // Hitung batas (bounds) rute dari Kantor Desa ke POI
          const minLng = Math.min(kantorDesa.longitude, poi.longitude);
          const minLat = Math.min(kantorDesa.latitude, poi.latitude);
          const maxLng = Math.max(kantorDesa.longitude, poi.longitude);
          const maxLat = Math.max(kantorDesa.latitude, poi.latitude);
          
          mapRef.current.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            {
              padding: { top: 150, bottom: 340, left: 60, right: 60 },
              duration: 1500,
              essential: true
            }
          );
        } else {
          // Jika memilih Kantor Desa, langsung zoom-in ke kantor desa
          mapRef.current.flyTo({
            center: [poi.longitude, poi.latitude],
            zoom: 16.5,
            duration: 1500,
            essential: true
          });
        }
      }
    }
  }, [activePOIId]);

  const handleStartNavigation = () => {
    if (!activePOI) return;
    
    if (navigator.geolocation) {
      setIsNavigating(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${longitude},${latitude};${activePOI.longitude},${activePOI.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
        
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            setNavigationRoute(data.routes[0].geometry);
            
            // FOKUS KE NAVIGASI: Fit Bounds dari seluruh koordinat rute navigasi aktif
            const coordinates = data.routes[0].geometry.coordinates;
            if (coordinates && coordinates.length > 0 && mapRef.current) {
              const lats = coordinates.map((c: any) => c[1]);
              const lngs = coordinates.map((c: any) => c[0]);
              const minLng = Math.min(...lngs);
              const minLat = Math.min(...lats);
              const maxLng = Math.max(...lngs);
              const maxLat = Math.max(...lats);
              
              mapRef.current.fitBounds(
                [[minLng, minLat], [maxLng, maxLat]],
                {
                  padding: { top: 80, bottom: 120, left: 60, right: 60 },
                  duration: 1500,
                  essential: true
                }
              );
            }
          } else {
            alert("Rute tidak ditemukan.");
          }
        } catch (err) {
          console.error("Error fetching route:", err);
          alert("Gagal mengambil rute dari Mapbox.");
        } finally {
          setIsNavigating(false);
        }
      }, (error) => {
        alert("Gagal mendapatkan lokasi Anda. Pastikan GPS/Location aktif di browser.");
        setIsNavigating(false);
      }, {
        enableHighAccuracy: false, // Menghindari waktu tunggu satelit GPS hardware yang lama
        maximumAge: 60000,         // Menggunakan cache koordinat jika kurang dari 1 menit
        timeout: 6000              // Batasi waktu pencarian maksimal 6 detik
      });
    } else {
      alert("Browser Anda tidak mendukung Geolocation.");
    }
  };

  // Save local trails to localStorage
  useEffect(() => {
    localStorage.setItem('localTrails', JSON.stringify(localTrails));
  }, [localTrails]);

  const startGPSTracking = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation.");
      return;
    }
    setRecordedCoordinates([]);
    setRecordedDistance(0);
    setCopiedExport(false);
    setIsRecordingGPS(true);

    const getDistanceFromPoints = (lon1: number, lat1: number, lon2: number, lat2: number) => {
      const R = 6371e3; // meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    watchId.current = navigator.geolocation.watchPosition((position) => {
      const { longitude, latitude } = position.coords;
      
      setRecordedCoordinates(prev => {
        if (prev.length === 0) {
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 17,
            pitch: 45,
            duration: 1500
          });
          return [[longitude, latitude]];
        }
        
        const lastPoint = prev[prev.length - 1];
        const dist = getDistanceFromPoints(lastPoint[0], lastPoint[1], longitude, latitude);
        
        // Filter noise: JIKA bergerak minimal 3 meter, baru masukkan koordinat baru
        if (dist >= 3) {
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 17,
            pitch: 45,
            duration: 1000
          });
          setRecordedDistance(prevDist => prevDist + dist);
          return [...prev, [longitude, latitude]];
        }
        return prev;
      });
    }, (error) => {
      console.error("GPS Tracking Error:", error);
      alert("GPS Satelit gagal mengunci posisi Anda secara akurat.");
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  };

  const stopGPSTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsRecordingGPS(false);
    setShowExportModal(true);
  };

  const toggleViewMode = () => {
    const nextIs3D = !is3D;
    setIs3D(nextIs3D);
    mapRef.current?.flyTo({
      pitch: nextIs3D ? 60 : 0,
      bearing: nextIs3D ? -15.6 : 0,
      duration: 1200
    });
  };

  const filteredPOIs = useMemo(() => {
    return poiList.filter(poi => poi.type === activeFilter);
  }, [activeFilter, poiList]);

  const activePOI = poiList.find(p => p.id === activePOIId) || null;

  const etaTime = useMemo(() => {
    if (!activePOI) return '';
    const distanceNum = parseFloat(activePOI.distance) || 0;
    let mins = 0;
    if (travelMode === 'car') {
      mins = Math.round(distanceNum * 2.5);
    } else if (travelMode === 'motor') {
      mins = Math.round(distanceNum * 1.8);
    } else {
      mins = Math.round(distanceNum * 12);
    }
    if (mins < 1) mins = 1;
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }, [activePOI, travelMode]);

  const handleCancelNavigation = () => {
    setNavigationRoute(null);
  };

  const handleFilterChange = (newFilter: string) => {
    if (navigationRoute) return;
    setActiveFilter(newFilter);
    setActivePOIId(null);
  };

  // GeoJSON untuk Visual Masking (Inverted Polygon)
  const maskSugihmuktiGeoJSON = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              // Ring Luar (Batas regional luas)
              [
                [106.0, -8.0],
                [109.0, -8.0],
                [109.0, -6.0],
                [106.0, -6.0],
                [106.0, -8.0]
              ],
              // Ring Dalam (Lubang area fokus Sugihmukti)
              [
                [107.3850, -7.1800],
                [107.4600, -7.1800],
                [107.4600, -7.1050],
                [107.3850, -7.1050],
                [107.3850, -7.1800]
              ]
            ]
          }
        }
      ]
    };
  }, []);

  // GeoJSON untuk garis rute dari Kantor Desa ke POI aktif
  const routeGeoJSON = useMemo(() => {
    const kantorDesa = poiList.find(p => p.id === 'kantor-desa');
    
    if (!activePOI || !kantorDesa) {
      return {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      };
    }

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [kantorDesa.longitude, kantorDesa.latitude],
          [activePOI.longitude, activePOI.latitude]
        ]
      }
    };
  }, [activePOI]);

  return (
    <div className="h-dvh w-screen overflow-hidden relative font-sans bg-black">
      
      {/* PETA MAPBOX 3D */}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 107.420000,
          latitude: -7.140000,
          zoom: 12.7,
          pitch: 0,
          bearing: 0
        }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        terrain={is3D ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
        maxBounds={[
          [107.1900, -7.2500],
          [107.6500, -7.0300]
        ]}
        minZoom={12.5}
        maxZoom={18}
        onClick={(e: any) => {
          if (navigationRoute) {
            // Lock map clicks during active navigation mode
            return;
          }
          if (isMeasuring && e.lngLat) {
            setMeasurePoints(prev => [...prev, { lng: e.lngLat.lng, lat: e.lngLat.lat }]);
            return;
          }
          setActivePOIId(null);
          if (isAdmin && e.lngLat) {
            setClickedCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
            setShowAddPoiModal(true);
          }
        }}
        interactiveLayerIds={[]}
      >
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {/* VISUAL MASKING (Area luar gelap) */}
        <Source id="mask-source" type="geojson" data={maskSugihmuktiGeoJSON as any}>
          <Layer 
            id="mask-layer" 
            type="fill" 
            paint={{
              'fill-color': '#030712',
              'fill-opacity': 0.78
            }}
          />
        </Source>

        {/* GARIS RUTE KESELURUHAN */}
        <Source id="route" type="geojson" data={routeGeoJSON as any}>
          <Layer 
            id="route-line"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round'
            }}
            paint={{
              'line-color': '#f59e0b',
              'line-width': 3,
              'line-dasharray': [2, 2]
            }}
          />
        </Source>

        {/* GARIS RUTE NAVIGASI AKTIF DARI USER */}
        {navigationRoute && (
          <Source id="active-nav-route" type="geojson" data={{ type: 'Feature', properties: {}, geometry: navigationRoute }}>
            <Layer 
              id="active-nav-route-line"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#0ea5e9', // Biru terang untuk rute navigasi
                'line-width': 5,
              }}
            />
          </Source>
        )}

        {/* MARKER POI */}
        {filteredPOIs.map((poi, index) => (
          <Marker 
            key={poi.id}
            longitude={poi.longitude} 
            latitude={poi.latitude}
            anchor="bottom"
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              setActivePOIId(poi.id);
            }}
            style={{ zIndex: activePOIId === poi.id ? 50 : 10 }}
          >
            <MapPin 
              poi={poi}
              isActive={activePOIId === poi.id}
              onClick={() => {}}
              index={index}
            />
          </Marker>
        ))}

        {/* GEOLOCATE CONTROL & NAVIGATION */}
        <GeolocateControl 
          ref={(ref) => {
            // Auto trigger geolocation on mount
            if (ref) {
              setTimeout(() => ref.trigger(), 1000);
            }
          }}
          position="top-right" 
          trackUserLocation={true} 
          showUserLocation={true} 
          showAccuracyCircle={false}
        />
        <NavigationControl position="top-right" showCompass={true} showZoom={false} />

        {/* TOGGLE 2D/3D BUTTON */}
        <div className="absolute top-[235px] right-[22px] z-40 pointer-events-auto">
          <button
            onClick={toggleViewMode}
            className="flex items-center justify-center w-[30px] h-[30px] bg-black/60 backdrop-blur-md border border-white/15 rounded-lg text-white shadow-lg cursor-pointer hover:bg-white/10 transition-colors"
            title={is3D ? "Switch to 2D" : "Switch to 3D"}
          >
            {is3D ? (
              <Layers size={14} className="text-sky-400" />
            ) : (
              <Box size={14} className="text-amber-500" />
            )}
          </button>
        </div>

        {/* MAP STYLE SWITCHER WIDGET */}
        <div className="absolute top-[275px] right-[22px] z-40 pointer-events-auto flex flex-col items-end gap-2">
          {/* Main Toggle Button */}
          <button
            onClick={() => setShowStyleSwitcher(!showStyleSwitcher)}
            className={`
              flex items-center justify-center w-[30px] h-[30px] backdrop-blur-md border rounded-lg shadow-lg cursor-pointer transition-all duration-300
              ${showStyleSwitcher 
                ? 'bg-amber-500 text-black border-amber-500 shadow-amber-500/20' 
                : 'bg-black/60 text-white border-white/15 hover:bg-white/10'
              }
            `}
            title="Pilih Style Peta"
          >
            <Layers size={14} className={showStyleSwitcher ? "text-black" : "text-amber-400"} />
          </button>

          {/* Style Options Popover (Opens to the left) */}
          {showStyleSwitcher && (
            <div className="absolute right-10 top-0 bg-slate-950/85 backdrop-blur-lg border border-white/10 p-2.5 rounded-xl shadow-2xl flex gap-2 animate-in fade-in slide-in-from-right-3 duration-200">
              {[
                {
                  id: 'satellite',
                  name: 'Satelit',
                  styleUrl: 'mapbox://styles/alwancodet66/cmrfky2up002w01qr9ecv6ode',
                  imgUrl: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/107.44,-7.12,11.5,0/120x120?access_token=${MAPBOX_TOKEN}`
                },
                {
                  id: 'streets',
                  name: 'Jalan',
                  styleUrl: 'mapbox://styles/mapbox/streets-v12',
                  imgUrl: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/107.44,-7.12,11.5,0/120x120?access_token=${MAPBOX_TOKEN}`
                },
                {
                  id: 'terrain',
                  name: 'Medan',
                  styleUrl: 'mapbox://styles/mapbox/outdoors-v12',
                  imgUrl: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/107.44,-7.12,11.5,0/120x120?access_token=${MAPBOX_TOKEN}`
                }
              ].map((style) => {
                const isActive = mapStyle === style.styleUrl;
                return (
                  <button
                    key={style.id}
                    onClick={() => {
                      setMapStyle(style.styleUrl);
                      setShowStyleSwitcher(false);
                    }}
                    className={`
                      w-14 h-14 rounded-lg flex flex-col justify-end p-1 relative overflow-hidden border transition-all duration-300 cursor-pointer snap-start shrink-0 bg-slate-900
                      ${isActive 
                        ? 'border-amber-500 ring-1 ring-amber-500/40 opacity-100 scale-100 font-bold' 
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-105'
                      }
                    `}
                  >
                    {/* Background Preview Image */}
                    <img 
                      src={style.imgUrl} 
                      alt={style.name} 
                      className="absolute inset-0 w-full h-full object-cover z-0" 
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                    <span className="text-[8px] font-black text-white tracking-wide text-center w-full block relative z-20 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {style.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {/* Distance Measurement Source and Layers */}
          {isMeasuring && measurePoints.length > 0 && (
            <Source
              id="measure-source"
              type="geojson"
              data={{
                type: 'FeatureCollection',
                features: [
                  // The line connecting all points
                  {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: measurePoints.map(p => [p.lng, p.lat])
                    }
                  },
                  // The points themselves
                  ...measurePoints.map((p, idx) => ({
                    type: 'Feature',
                    properties: { index: idx },
                    geometry: {
                      type: 'Point',
                      coordinates: [p.lng, p.lat]
                    }
                  }))
                ]
              }}
            >
              {/* Line Layer */}
              <Layer
                id="measure-line"
                type="line"
                paint={{
                  'line-color': '#f59e0b',
                  'line-width': 3,
                  'line-dasharray': [2, 1]
                }}
              />
              {/* Points Layer */}
              <Layer
                id="measure-points"
                type="circle"
                filter={['has', 'index']}
                paint={{
                  'circle-radius': 6,
                  'circle-color': '#000000',
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#f59e0b'
                }}
              />
            </Source>
          )}

          {/* Live GPS Trail Source and Layer */}
          {recordedCoordinates.length > 0 && (
            <Source
              id="live-gps-source"
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: recordedCoordinates
                }
              }}
            >
              <Layer
                id="live-gps-layer"
                type="line"
                paint={{
                  'line-color': '#22c55e',
                  'line-width': 5,
                  'line-dasharray': [2, 1]
                }}
              />
            </Source>
          )}

          {/* Local Saved Trails Layer */}
          {localTrails.map((trail, index) => (
            <Source
              key={`local-trail-${index}`}
              id={`local-trail-source-${index}`}
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: trail
                }
              }}
            >
              <Layer
                id={`local-trail-layer-${index}`}
                type="line"
                paint={{
                  'line-color': '#10b981',
                  'line-width': 4
                }}
              />
            </Source>
          ))}
        </div>

        {/* MAP RULER (MEASUREMENT) TOGGLE BUTTON */}
        <div className="absolute top-[315px] right-[22px] z-40 pointer-events-auto">
          <button
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              setMeasurePoints([]);
            }}
            className={`
              flex items-center justify-center w-[30px] h-[30px] backdrop-blur-md border rounded-lg shadow-lg cursor-pointer transition-all duration-300
              ${isMeasuring 
                ? 'bg-amber-500 text-black border-amber-500 shadow-amber-500/20' 
                : 'bg-black/60 text-white border-white/15 hover:bg-white/10'
              }
            `}
            title={isMeasuring ? "Matikan Pengukur Jarak" : "Aktifkan Pengukur Jarak"}
          >
            <Ruler size={14} className={isMeasuring ? "text-black" : "text-amber-400"} />
          </button>
        </div>

        {/* GPS TRAIL RECORDING TOGGLE BUTTON (ADMIN ONLY) */}
        {isAdmin && (
          <div className="absolute top-[355px] right-[22px] z-40 pointer-events-auto">
            <button
              onClick={() => {
                if (isRecordingGPS) {
                  stopGPSTracking();
                } else {
                  startGPSTracking();
                }
              }}
              className={`
                flex items-center justify-center w-[30px] h-[30px] backdrop-blur-md border rounded-lg shadow-lg cursor-pointer transition-all duration-300
                ${isRecordingGPS 
                  ? 'bg-red-600 text-white border-red-600 shadow-red-600/20' 
                  : 'bg-black/60 text-white border-white/15 hover:bg-white/10'
                }
              `}
              title={isRecordingGPS ? "Hentikan Rekam Jalur" : "Mulai Rekam Jalur"}
            >
              <Navigation size={14} className={`transform rotate-45 ${isRecordingGPS ? "text-white animate-pulse" : "text-emerald-400"}`} />
            </button>
          </div>
        )}
      </Map>

      {/* ADMIN ACTIVE INDICATOR BANNER */}
      {isAdmin && (
        <div className="absolute top-[155px] md:top-[135px] left-1/2 -translate-x-1/2 z-30 pointer-events-none w-max max-w-[90%]">
          <div className="bg-amber-500/75 backdrop-blur-md text-black font-extrabold text-[10px] md:text-xs px-4 py-2 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 border border-amber-500/20 animate-bounce text-center justify-center">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse shrink-0"></span>
            MODE ADMIN AKTIF — KLIK PETA UNTUK MENAMBAH LOKASI
          </div>
        </div>
      )}

      {/* FLOATING MEASUREMENT TOOLBAR */}
      {isMeasuring && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-950/85 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-4 text-white pointer-events-auto w-max max-w-[90%] animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Alat Ukur Jarak (Ruler)</span>
            <span className="text-xs font-black mt-0.5 whitespace-nowrap">
              {measurePoints.length < 2 ? (
                <span className="text-gray-400 text-[10px] font-normal">Klik peta untuk mengukur...</span>
              ) : (
                `${(calculateDistance(measurePoints) / 1000).toFixed(2)} km (${calculateDistance(measurePoints).toLocaleString('id-ID', { maximumFractionDigits: 0 })} m)`
              )}
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setMeasurePoints([])}
              disabled={measurePoints.length === 0}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-all border border-white/5 cursor-pointer disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setIsMeasuring(false);
                setMeasurePoints([]);
              }}
              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <TopNav 
        pois={poiList} 
        onSelectPOI={setActivePOIId} 
        isAdmin={isAdmin}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={() => {
          setIsAdmin(false);
          alert("Admin berhasil logout!");
        }}
      />

      {/* FILTER PILLS - MOVED TO TOP (BELOW TOPNAV) */}
      <div className="absolute top-20 left-0 right-0 z-30 pointer-events-none">
        <FilterPills 
          activeFilter={activeFilter} 
          onChange={handleFilterChange} 
        />
      </div>

      {/* PANEL INFORMASI KIRI / BOTTOM SHEET */}
      {!navigationRoute && (
        <InfoPanel 
          poi={activePOI} 
          onClose={() => setActivePOIId(null)} 
          onStartNavigation={handleStartNavigation}
          isNavigating={isNavigating}
          forceMinimize={!!navigationRoute}
          isAdmin={isAdmin}
          hasActiveRoute={!!navigationRoute}
          onCancelNavigation={handleCancelNavigation}
          onDeletePoi={(id) => {
            setPoiList(prev => prev.filter(p => p.id !== id));
            setActivePOIId(null);
            alert("Lokasi berhasil dihapus!");
          }}
          onEditPoi={(poi) => {
            setPoiToEdit(poi);
            setClickedCoords({ lng: poi.longitude, lat: poi.latitude });
            setShowAddPoiModal(true);
          }}
          travelMode={travelMode}
          onTravelModeChange={setTravelMode}
        />
      )}

      {/* GOOGLE MAPS NAVIGATION PANEL */}
      {navigationRoute && activePOI && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-white animate-in slide-in-from-bottom-8">
          <div className="flex flex-col">
            <span className="text-emerald-400 text-xl font-black tracking-tight flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="animate-pulse"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
              {(() => {
                const distanceNum = parseFloat(activePOI.distance) || 0;
                let mins = 0;
                if (travelMode === 'car') {
                  mins = Math.round(distanceNum * 2.5);
                } else if (travelMode === 'motor') {
                  mins = Math.round(distanceNum * 1.8);
                } else {
                  mins = Math.round(distanceNum * 12);
                }
                if (mins < 1) mins = 1;
                return `${mins} mnt`;
              })()}
            </span>
            <span className="text-xs text-slate-300 font-semibold mt-0.5">
              {activePOI.distance} • Est. Tiba pukul {etaTime}
            </span>
          </div>
          
          <button 
            onClick={handleCancelNavigation}
            className="flex items-center justify-center w-10 h-10 bg-rose-600 hover:bg-rose-500 rounded-full text-white shadow-lg transition-colors cursor-pointer shrink-0"
            title="Keluar Navigasi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}

      {/* LIVE GPS TRAIL RECORDER STATUS CARD */}
      {isRecordingGPS && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-950/85 backdrop-blur-md border border-red-500/20 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-4 text-white pointer-events-auto w-max max-w-[90%] animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              Merekam Jalur GPS
            </span>
            <span className="text-xs font-black mt-0.5 whitespace-nowrap">
              {recordedCoordinates.length} Titik ({recordedDistance < 1000 ? `${Math.round(recordedDistance)} m` : `${(recordedDistance / 1000).toFixed(2)} km`})
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={stopGPSTracking}
              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-md"
            >
              Simpan
            </button>
            <button
              onClick={() => {
                if (confirm("Batalkan perekaman jalur? Data yang belum disimpan akan hilang.")) {
                  if (watchId.current !== null) {
                    navigator.geolocation.clearWatch(watchId.current);
                    watchId.current = null;
                  }
                  setIsRecordingGPS(false);
                  setRecordedCoordinates([]);
                  setRecordedDistance(0);
                }
              }}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-all border border-white/5 cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* GPS TRAIL EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/10 p-6 rounded-3xl shadow-2xl max-w-md w-full flex flex-col gap-4 text-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-black text-emerald-500 uppercase tracking-wider">Hasil Rekaman Jalur GPS</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Jalur berhasil direkam dengan akurat.</p>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
            
            <div className="bg-slate-900 border border-white/5 p-3 rounded-xl flex flex-col gap-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Total Titik Koordinat:</span>
                <span className="font-bold text-white">{recordedCoordinates.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Panjang Jalur:</span>
                <span className="font-bold text-white">{(recordedDistance / 1000).toFixed(2)} km ({Math.round(recordedDistance)} m)</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Data Koordinat (GeoJSON Format)</span>
              <textarea
                readOnly
                value={JSON.stringify(recordedCoordinates)}
                className="w-full h-24 bg-slate-900 border border-white/5 rounded-xl p-2.5 text-[8px] font-mono text-emerald-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(recordedCoordinates));
                  setCopiedExport(true);
                  setTimeout(() => setCopiedExport(false), 2000);
                }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedExport ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedExport ? 'Tersalin!' : 'Salin Koordinat'}
              </button>
              
              <button
                onClick={() => {
                  if (recordedCoordinates.length > 0) {
                    setLocalTrails(prev => [...prev, recordedCoordinates]);
                    setShowExportModal(false);
                    alert("Jalur berhasil disimpan ke peta lokal!");
                  }
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Check size={12} />
                Simpan ke Peta
              </button>
            </div>
            
            {localTrails.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Hapus semua jalur lokal yang telah disimpan di browser ini?")) {
                    setLocalTrails([]);
                    localStorage.removeItem('localTrails');
                  }
                }}
                className="w-full py-2 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/30 text-rose-400 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Trash2 size={10} />
                Reset Semua Jalur Lokal ({localTrails.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* WATERMARK KKN TEXT ONLY */}
      <div className="fixed bottom-2 right-4 z-40 pointer-events-none text-right drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
        <span className="text-[9px] font-black text-amber-500 tracking-wider block">KKN SUGIHMUKTI 2026</span>
        <span className="text-[8px] font-extrabold text-white/90 leading-tight uppercase block">UNIVERSITAS MA'SOEM</span>
      </div>

      {/* MENU BAWAH & CAROUSEL (ALWAYS SHOWN, SMALLER ON MOBILE) */}
      {!activePOI && (
        <div className="flex fixed bottom-2 md:bottom-3 left-0 right-0 z-30 px-4 md:px-8 pb-1 transition-all flex-col items-center pointer-events-none">
          
          {/* TOMBOL TOGGLE CAROUSEL */}
          <div className="w-full max-w-5xl flex justify-center mb-2 pointer-events-auto">
            <button 
              onClick={() => setShowCarousel(!showCarousel)}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              {showCarousel ? (
                <>Tutup <ChevronDown size={14} /></>
              ) : (
                <>Rekomendasi <ChevronUp size={14} /></>
              )}
            </button>
          </div>

          {/* CAROUSEL REKOMENDASI */}
          {showCarousel && (
            <div className="w-full pointer-events-auto mb-2 animate-in slide-in-from-bottom-5 fade-in duration-300">
              <POICarousel pois={filteredPOIs} activeId={activePOIId} onSelect={setActivePOIId} />
            </div>
          )}
          
        </div>
      )}

      {/* MODAL LOGIN ADMIN */}
      {showLoginModal && (
        <AdminLoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={() => {
            setIsAdmin(true);
            setShowLoginModal(false);
            alert("Login Admin Sukses!");
          }} 
        />
      )}

      {/* MODAL TAMBAH POI */}
      {showAddPoiModal && clickedCoords && (
        <AddEditPoiModal 
          coords={clickedCoords}
          poiToEdit={poiToEdit}
          onClose={() => {
            setShowAddPoiModal(false);
            setClickedCoords(null);
            setPoiToEdit(null);
          }}
          onSave={(newPoi) => {
            if (poiToEdit) {
              setPoiList(prev => prev.map(p => p.id === poiToEdit.id ? newPoi : p));
              if (activePOIId === poiToEdit.id) {
                setActivePOIId(null);
                setTimeout(() => setActivePOIId(newPoi.id), 100);
              }
            } else {
              setPoiList(prev => [...prev, newPoi]);
            }
            setShowAddPoiModal(false);
            setClickedCoords(null);
            setPoiToEdit(null);
          }}
        />
      )}
      
    </div>
  );
}

// ==========================================
// COMPONENT: ADMIN LOGIN MODAL
// ==========================================
interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}
function AdminLoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ADMIN' && password === 'SugihMkti01') {
      onSuccess();
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
      <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black">Login Admin</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-500 transition-colors"
              placeholder="Masukkan username..."
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl pl-3 pr-10 py-2.5 text-sm outline-none focus:border-amber-500 transition-colors"
                placeholder="Masukkan password..."
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <span className="text-rose-500 text-xs font-semibold">{error}</span>}

          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm tracking-wide mt-2 shadow-lg shadow-amber-500/10 transition-colors cursor-pointer"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT: ADD / EDIT POI MODAL
// ==========================================
interface AddEditPoiModalProps {
  coords: { lng: number; lat: number };
  poiToEdit?: POI | null;
  onClose: () => void;
  onSave: (poi: POI) => void;
}
function AddEditPoiModal({ coords, poiToEdit, onClose, onSave }: AddEditPoiModalProps) {
  const [title, setTitle] = useState(poiToEdit ? poiToEdit.title : '');
  const [type, setType] = useState(poiToEdit ? poiToEdit.type : 'wisata');
  const [category, setCategory] = useState(poiToEdit ? poiToEdit.category : '');
  const [description, setDescription] = useState(poiToEdit ? poiToEdit.description : '');
  const [price, setPrice] = useState(poiToEdit ? poiToEdit.price : 'Gratis');
  const [hours, setHours] = useState(poiToEdit ? poiToEdit.hours : '24 Jam');
  const [contact, setContact] = useState(poiToEdit ? poiToEdit.contact || '' : '');
  const [lat, setLat] = useState(poiToEdit ? poiToEdit.latitude : coords.lat);
  const [lng, setLng] = useState(poiToEdit ? poiToEdit.longitude : coords.lng);
  
  // Image list state (direct from Cloudinary)
  const [images, setImages] = useState<string[]>(poiToEdit ? poiToEdit.images || [poiToEdit.image] : []);
  const [uploading, setUploading] = useState(false);
  
  // Package states
  const [packages, setPackages] = useState<TouristPackage[]>(poiToEdit ? poiToEdit.packages || [] : []);
  const [tempPkgName, setTempPkgName] = useState('');
  const [tempPkgPrice, setTempPkgPrice] = useState('');
  const [tempPkgFeatures, setTempPkgFeatures] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'gis_kkn');
        
        const res = await fetch('https://api.cloudinary.com/v1_1/dkckkpear/image/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || `HTTP ${res.status}`);
        }
        if (data.secure_url) {
          newUrls.push(data.secure_url);
        }
      }
      setImages(prev => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error("Error uploading to Cloudinary:", err);
      alert(`Gagal upload: ${err.message || err}.`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddPackage = () => {
    if (!tempPkgName.trim() || !tempPkgPrice.trim()) {
      alert("Nama paket & harga paket wajib diisi!");
      return;
    }
    const newPkg: TouristPackage = {
      name: tempPkgName.trim(),
      price: tempPkgPrice.trim(),
      features: tempPkgFeatures
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0)
    };
    setPackages(prev => [...prev, newPkg]);
    setTempPkgName('');
    setTempPkgPrice('');
    setTempPkgFeatures('');
  };

  const handleRemovePackage = (index: number) => {
    setPackages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim()) {
      alert("Nama Lokasi & Kategori wajib diisi!");
      return;
    }

    const defaultImg = 'https://res.cloudinary.com/dkckkpear/image/upload/v1784211246/Desain_tanpa_judul_16_jz9p4i.png';
    const finalImages = images.length > 0 ? images : [defaultImg];

    const savedPoi: POI = {
      id: poiToEdit ? poiToEdit.id : `poi-${Date.now()}`,
      type,
      title: title.trim(),
      category: category.trim(),
      icon: getIconForCategory(category),
      x: 50,
      y: 50,
      latitude: Number(lat),
      longitude: Number(lng),
      distance: poiToEdit ? poiToEdit.distance : '1 km',
      time: poiToEdit ? poiToEdit.time : '10 min',
      description: description.trim(),
      price: price.trim(),
      hours: hours.trim(),
      contact: contact.trim() || undefined,
      image: finalImages[0],
      video: poiToEdit ? poiToEdit.video : 'https://www.youtube.com/embed/QuUpPZ0w_eY',
      images: finalImages,
      packages: packages.length > 0 ? packages : undefined
    };

    onSave(savedPoi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black">{poiToEdit ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Koordinat Ter-edit */}
          <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Latitude Coords</label>
              <input 
                type="number" 
                step="any"
                value={lat} 
                onChange={e => setLat(Number(e.target.value))}
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Longitude Coords</label>
              <input 
                type="number" 
                step="any"
                value={lng} 
                onChange={e => setLng(Number(e.target.value))}
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nama Lokasi *</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. Curug Indah Sugihmukti"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tipe *</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors text-white"
              >
                <option value="wisata">Wisata / Alam</option>
                <option value="vila">Vila</option>
                <option value="homestay">Homestay</option>
                <option value="fasilitas">Fasilitas Umum</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kategori *</label>
              <input 
                type="text" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Puskesmas, Masjid, Market, Air Terjun"
                required 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deskripsi</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors h-20 resize-none"
              placeholder="Deskripsi lokasi..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Harga Tiket / Sewa</label>
              <input 
                type="text" 
                value={price} 
                onChange={e => setPrice(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Rp 15.000"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Jam Buka / Operasional</label>
              <input 
                type="text" 
                value={hours} 
                onChange={e => setHours(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. 08:00 - 17:00 WIB"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kontak WA (Opsional)</label>
              <input 
                type="text" 
                value={contact} 
                onChange={e => setContact(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. 62895320695308"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              {/* DIRECT IMAGE UPLOADER */}
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Upload Gambar (Bisa Banyak)</label>
              <div className="relative">
                <input 
                  type="file" 
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="cloudinary-uploader-input"
                />
                <label 
                  htmlFor="cloudinary-uploader-input"
                  className="w-full py-2 px-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-center gap-1.5 text-xs text-amber-500 font-bold transition-all text-center"
                >
                  {uploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      Pilih Foto Destinasi
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Uploaded Images List Thumbnail */}
          {images.length > 0 && (
            <div className="flex flex-col gap-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gambar Terpilih ({images.length})</span>
              <div className="flex gap-2 overflow-x-auto py-1 hide-scrollbar">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 group">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/75 hover:bg-rose-600 rounded-full p-1 text-white border border-white/10 cursor-pointer shrink-0 transition-colors"
                      title="Hapus gambar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD PACKAGE SECTION */}
          <div className="border-t border-white/10 pt-4 mt-2">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">Manajemen Paket Wisata / Vila (Opsional)</h3>
            
            {/* Added Packages List */}
            {packages.length > 0 && (
              <div className="flex flex-col gap-2 mb-3 max-h-36 overflow-y-auto custom-scrollbar">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs">
                    <div>
                      <span className="font-bold text-white block">{pkg.name} ({pkg.price})</span>
                      <span className="text-[10px] text-gray-400">{pkg.features.length} fasilitas</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemovePackage(idx)}
                      className="text-rose-400 hover:text-rose-500 cursor-pointer p-1"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Package Inputs */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={tempPkgName}
                  onChange={e => setTempPkgName(e.target.value)}
                  placeholder="Nama Paket (e.g. Paket Glamping)"
                  className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-500 text-white"
                />
                <input 
                  type="text" 
                  value={tempPkgPrice}
                  onChange={e => setTempPkgPrice(e.target.value)}
                  placeholder="Harga (e.g. Rp 500.000 / malam)"
                  className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-500 text-white"
                />
              </div>
              <textarea 
                value={tempPkgFeatures}
                onChange={e => setTempPkgFeatures(e.target.value)}
                placeholder="Fasilitas paket (satu baris per fasilitas)..."
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-500 text-white h-16 resize-none"
              />
              <button
                type="button"
                onClick={handleAddPackage}
                className="py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
              >
                + Tambah Paket Ke Daftar
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-4 border-t border-white/10 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-sm font-bold transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm transition-colors cursor-pointer shadow-lg shadow-amber-500/10 text-center"
            >
              Simpan Lokasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}