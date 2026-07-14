import { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer, MapRef, GeolocateControl, NavigationControl } from 'react-map-gl';
import { ChevronDown, ChevronUp, Layers, Box } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from './components/MapPin';
import { InfoPanel } from './components/InfoPanel';
import { POICarousel } from './components/POICarousel';
import { FilterPills } from './components/FilterPills';
import { TopNav } from './components/TopNav';
import { MetricsWidget } from './components/MetricsWidget';
import { poiData } from './data';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function App() {
  const [activePOIId, setActivePOIId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('wisata');
  const [showCarousel, setShowCarousel] = useState<boolean>(true);
  const [is3D, setIs3D] = useState<boolean>(false);
  const [navigationRoute, setNavigationRoute] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    setNavigationRoute(null);
    
    // Auto-pan/FitBounds kamera saat POI dipilih
    if (activePOIId) {
      const poi = poiData.find(p => p.id === activePOIId);
      const kantorDesa = poiData.find(p => p.id === 'kantor-desa');
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
      });
    } else {
      alert("Browser Anda tidak mendukung Geolocation.");
    }
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
    return poiData.filter(poi => poi.type === activeFilter);
  }, [activeFilter]);

  const activePOI = poiData.find(p => p.id === activePOIId) || null;

  const handleFilterChange = (newFilter: string) => {
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
    const kantorDesa = poiData.find(p => p.id === 'kantor-desa');
    
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
        mapStyle="mapbox://styles/alwancodet66/cmrfky2up002w01qr9ecv6ode"
        mapboxAccessToken={MAPBOX_TOKEN}
        terrain={is3D ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
        maxBounds={[
          [107.1900, -7.2500],
          [107.6500, -7.0300]
        ]}
        minZoom={12.5}
        maxZoom={18}
        onClick={() => setActivePOIId(null)}
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
        <div className="absolute top-[235px] right-[12px] z-40 pointer-events-auto">
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
      </Map>

      {/* GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />

      <TopNav />

      {/* FILTER PILLS - MOVED TO TOP (BELOW TOPNAV) */}
      <div className="absolute top-20 left-0 right-0 z-30 pointer-events-none">
        <FilterPills 
          activeFilter={activeFilter} 
          onChange={handleFilterChange} 
        />
      </div>

      {/* WIDGET KANAN (RUTE TERPILIH) */}
      <MetricsWidget 
        activePOI={activePOI} 
        onStartNavigation={handleStartNavigation}
        isNavigating={isNavigating}
        onClose={() => setActivePOIId(null)}
      />

      {/* PANEL INFORMASI KIRI / BOTTOM SHEET */}
      <InfoPanel 
        poi={activePOI} 
        onClose={() => setActivePOIId(null)} 
        onStartNavigation={handleStartNavigation}
        isNavigating={isNavigating}
      />

      {/* MENU BAWAH & CAROUSEL (HIDDEN ON MOBILE) */}
      {!activePOI && (
        <div className="hidden md:flex fixed bottom-6 left-0 right-0 z-30 px-4 md:px-8 pb-2 transition-all flex-col items-center pointer-events-none">
          
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
      
    </div>
  );
}