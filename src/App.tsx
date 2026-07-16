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
import { poiData, getIconForCategory } from './data';
import { POI, TouristPackage } from './types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function App() {
  const [poiList, setPoiList] = useState<POI[]>(() => {
    const saved = localStorage.getItem('poiData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          icon: getIconForCategory(item.category)
        }));
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

  const [activePOIId, setActivePOIId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('wisata');
  const [showCarousel, setShowCarousel] = useState<boolean>(true);
  const [is3D, setIs3D] = useState<boolean>(false);
  const [navigationRoute, setNavigationRoute] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
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
    return poiList.filter(poi => poi.type === activeFilter);
  }, [activeFilter, poiList]);

  const activePOI = poiList.find(p => p.id === activePOIId) || null;

  const etaTime = useMemo(() => {
    if (!activePOI || !activePOI.time) return '';
    const match = activePOI.time.match(/(\d+)/);
    if (!match) return '';
    const minutes = parseInt(match[1], 10);
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }, [activePOI]);

  const handleCancelNavigation = () => {
    setNavigationRoute(null);
  };

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
        mapStyle="mapbox://styles/alwancodet66/cmrfky2up002w01qr9ecv6ode"
        mapboxAccessToken={MAPBOX_TOKEN}
        terrain={is3D ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
        maxBounds={[
          [107.1900, -7.2500],
          [107.6500, -7.0300]
        ]}
        minZoom={12.5}
        maxZoom={18}
        onClick={(e: any) => {
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
      </Map>

      {/* ADMIN ACTIVE INDICATOR BANNER */}
      {isAdmin && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-amber-500 text-black font-extrabold text-xs px-4 py-2 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 border border-black/10 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
            MODE ADMIN AKTIF — KLIK PETA UNTUK MENAMBAH LOKASI BARU
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

      {/* WIDGET KANAN (RUTE TERPILIH) */}
      <MetricsWidget 
        activePOI={activePOI} 
        onStartNavigation={handleStartNavigation}
        isNavigating={isNavigating}
        onClose={() => setActivePOIId(null)}
      />

      {/* PANEL INFORMASI KIRI / BOTTOM SHEET */}
      {!navigationRoute && (
        <InfoPanel 
          poi={activePOI} 
          onClose={() => setActivePOIId(null)} 
          onStartNavigation={handleStartNavigation}
          isNavigating={isNavigating}
          forceMinimize={!!navigationRoute}
          isAdmin={isAdmin}
          onDeletePoi={(id) => {
            setPoiList(prev => prev.filter(p => p.id !== id));
            setActivePOIId(null);
            alert("Lokasi berhasil dihapus!");
          }}
        />
      )}

      {/* GOOGLE MAPS NAVIGATION PANEL */}
      {navigationRoute && activePOI && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-white animate-in slide-in-from-bottom-8">
          <div className="flex flex-col">
            <span className="text-emerald-400 text-xl font-black tracking-tight flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="animate-pulse"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
              {activePOI.time}
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
        <AddPoiModal 
          coords={clickedCoords}
          onClose={() => {
            setShowAddPoiModal(false);
            setClickedCoords(null);
          }}
          onSave={(newPoi) => {
            setPoiList(prev => [...prev, newPoi]);
            setShowAddPoiModal(false);
            setClickedCoords(null);
            alert("Lokasi baru berhasil ditambahkan!");
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
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-500 transition-colors"
              placeholder="Masukkan password..."
              required
            />
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
// COMPONENT: ADD POI MODAL
// ==========================================
interface AddPoiModalProps {
  coords: { lng: number; lat: number };
  onClose: () => void;
  onSave: (poi: POI) => void;
}
function AddPoiModal({ coords, onClose, onSave }: AddPoiModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('wisata');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('Gratis');
  const [hours, setHours] = useState('24 Jam');
  const [contact, setContact] = useState('');
  const [image, setImage] = useState('');
  
  // Package states
  const [packages, setPackages] = useState<TouristPackage[]>([]);
  const [tempPkgName, setTempPkgName] = useState('');
  const [tempPkgPrice, setTempPkgPrice] = useState('');
  const [tempPkgFeatures, setTempPkgFeatures] = useState('');

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

    const defaultImg = type === 'vila' 
      ? 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800'
      : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800';

    const newPoi: POI = {
      id: `poi-${Date.now()}`,
      type,
      title: title.trim(),
      category: category.trim(),
      icon: getIconForCategory(category),
      x: 50,
      y: 50,
      latitude: coords.lat,
      longitude: coords.lng,
      distance: '1 km',
      time: '10 min',
      description: description.trim(),
      price: price.trim(),
      hours: hours.trim(),
      contact: contact.trim() || undefined,
      image: image.trim() || defaultImg,
      video: 'https://www.youtube.com/embed/QuUpPZ0w_eY',
      images: image.trim() ? [image.trim()] : [defaultImg],
      packages: packages.length > 0 ? packages : undefined
    };

    onSave(newPoi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black">Tambah Lokasi Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-gray-400">
            <div>
              <span className="font-bold block text-white mb-0.5">Latitude</span>
              {coords.lat.toFixed(6)}
            </div>
            <div>
              <span className="font-bold block text-white mb-0.5">Longitude</span>
              {coords.lng.toFixed(6)}
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
                <option value="vila">Vila / Homestay</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kategori *</label>
              <input 
                type="text" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Camping Ground, Air Terjun"
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
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Link Gambar (Cloudinary/Unsplash)</label>
              <input 
                type="text" 
                value={image} 
                onChange={e => setImage(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

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
                  className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-500"
                />
                <input 
                  type="text" 
                  value={tempPkgPrice}
                  onChange={e => setTempPkgPrice(e.target.value)}
                  placeholder="Harga (e.g. Rp 500.000 / malam)"
                  className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-500"
                />
              </div>
              <textarea 
                value={tempPkgFeatures}
                onChange={e => setTempPkgFeatures(e.target.value)}
                placeholder="Fasilitas paket (satu baris per fasilitas)..."
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-500 h-16 resize-none"
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