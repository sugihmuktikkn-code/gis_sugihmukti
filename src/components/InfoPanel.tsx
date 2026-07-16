import React, { useState, useEffect, useRef } from 'react';
import { Car, Bike, Footprints } from 'lucide-react';

interface InfoPanelProps {
  poi: any | null;
  onClose: () => void;
  onStartNavigation?: () => void;
  isNavigating?: boolean;
  forceMinimize?: boolean;
  isAdmin?: boolean;
  onDeletePoi?: (id: string) => void;
  onEditPoi?: (poi: any) => void;
  travelMode: 'car' | 'motor' | 'walk';
  onTravelModeChange: (mode: 'car' | 'motor' | 'walk') => void;
  hasActiveRoute?: boolean;
  onCancelNavigation?: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ 
  poi, 
  onClose, 
  onStartNavigation, 
  isNavigating, 
  forceMinimize, 
  isAdmin, 
  onDeletePoi, 
  onEditPoi, 
  travelMode, 
  onTravelModeChange,
  hasActiveRoute,
  onCancelNavigation
}) => {
  const [displayPoi, setDisplayPoi] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bannerScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (poi) {
      setDisplayPoi(poi);
      setIsMinimized(false); // Reset minimize state on new selection
      setActiveImageIdx(0);  // Reset image index
      setTimeout(() => setIsOpen(true), 10);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 0;
      }
      if (bannerScrollRef.current) {
        bannerScrollRef.current.scrollLeft = 0;
      }
    } else {
      setIsOpen(false);
    }
  }, [poi]);

  useEffect(() => {
    if (forceMinimize) {
      setIsMinimized(true);
    }
  }, [forceMinimize]);

  // Efek scroll otomatis untuk gambar banner
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isOpen && displayPoi && displayPoi.images && displayPoi.images.length > 1) {
      intervalId = setInterval(() => {
        const container = bannerScrollRef.current;
        if (container) {
          const nextIdx = (activeImageIdx + 1) % displayPoi.images.length;
          const targetScroll = nextIdx * container.clientWidth;
          container.scrollTo({ left: targetScroll, behavior: 'smooth' });
          setActiveImageIdx(nextIdx);
        }
      }, 3000); // Ganti gambar tiap 3 detik
    }
    return () => clearInterval(intervalId);
  }, [isOpen, displayPoi, activeImageIdx]);

  // Efek scroll otomatis untuk Quick Info Badges (geser otomatis bolak-balik)
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let direction = 1; // 1 = kanan, -1 = kiri
    if (isOpen && displayPoi) {
      intervalId = setInterval(() => {
        const container = scrollContainerRef.current;
        if (container) {
          const maxScrollLeft = container.scrollWidth - container.clientWidth;
          if (maxScrollLeft <= 0) return;
          
          let nextScrollLeft = container.scrollLeft + (direction * 50); // geser 50px
          if (nextScrollLeft >= maxScrollLeft) {
            nextScrollLeft = maxScrollLeft;
            direction = -1;
          } else if (nextScrollLeft <= 0) {
            nextScrollLeft = 0;
            direction = 1;
          }
          
          container.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
        }
      }, 2500); // geser tiap 2.5 detik
    }
    return () => clearInterval(intervalId);
  }, [isOpen, displayPoi]);

  const handleBannerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPos = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const currentIdx = Math.round(scrollPos / width);
      if (currentIdx !== activeImageIdx) {
        setActiveImageIdx(currentIdx);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientY;
    const diff = currentTouch - touchStart;

    // Swipe down to minimize
    if (diff > 50) {
      setIsMinimized(true);
      setTouchStart(null);
    }
    // Swipe up to maximize
    else if (diff < -50) {
      setIsMinimized(false);
      setTouchStart(null);
    }
  };

  if (!displayPoi) return null;

  const namaTempat = displayPoi.title || displayPoi.name || "Nama Tempat";
  const kategori = displayPoi.category || "WISATA";
  const deskripsi = displayPoi.description || "";
  const imageUrl = displayPoi.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&q=80';
  const wa = displayPoi.contact;
  const isVila = displayPoi.type === 'vila' || displayPoi.type === 'homestay';

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className={`
        fixed z-50 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        /* Mobile: Bottom Sheet */
        bottom-0 left-0 right-0 rounded-t-3xl border-t
        /* Desktop: Floating Card */
        md:bottom-8 md:left-6 md:right-auto md:w-[400px] md:rounded-3xl md:border
        bg-slate-900/60 border-white/10 shadow-2xl backdrop-blur-xl text-white
        flex flex-col
        max-h-[85vh] md:max-h-[calc(100vh-180px)]
        ${isOpen 
          ? isMinimized 
            ? 'translate-y-[90%] md:translate-y-0' 
            : 'translate-y-0' 
          : 'translate-y-[120%]'
        } 
      `}
    >
      {/* Grab Handle (Mobile Only) */}
      <div 
        className="w-full flex justify-center pt-3 pb-3 md:hidden cursor-pointer" 
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="w-12 h-1.5 bg-slate-600 rounded-full"></div>
      </div>

      {/* Close Button */}
      {!hasActiveRoute && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer text-white border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      <div className="overflow-y-auto custom-scrollbar flex-1 pb-6 md:pb-4 rounded-t-3xl md:rounded-3xl">
        {/* Banner Image (Carousel if multiple images exist) */}
        <div className="relative w-full h-48 md:h-56 flex-shrink-0 overflow-hidden rounded-t-3xl md:rounded-t-3xl">
          {displayPoi.images && displayPoi.images.length > 0 ? (
            <div 
              ref={bannerScrollRef}
              onScroll={handleBannerScroll}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
            >
              {displayPoi.images.map((img: string, idx: number) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`${namaTempat} ${idx + 1}`} 
                  className="w-full h-full object-cover snap-center shrink-0" 
                />
              ))}
            </div>
          ) : (
            <img src={imageUrl} alt={namaTempat} className="w-full h-full object-cover rounded-t-3xl md:rounded-t-3xl" />
          )}
          
          <div className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg z-10">
            <span className="text-black text-[10px] font-bold tracking-widest uppercase">{kategori}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 pointer-events-none z-10"></div>
          
          {/* Dot indicators for carousel */}
          {displayPoi.images && displayPoi.images.length > 1 && (
            <div className="absolute bottom-3 right-4 flex gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full z-20">
              {displayPoi.images.map((_: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIdx ? 'bg-amber-500 scale-125' : 'bg-white/60'}`} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="px-5 pt-3">
          <h2 className="text-2xl font-black text-white mb-2 leading-tight drop-shadow-sm">{namaTempat}</h2>
          
          {/* MODE SELECTOR (Google Maps Style) */}
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-4 justify-between max-w-sm">
            {[
              { id: 'car', Icon: Car, label: 'Mobil' },
              { id: 'motor', Icon: Bike, label: 'Motor' },
              { id: 'walk', Icon: Footprints, label: 'Jalan' }
            ].map(({ id, Icon, label }) => {
              const isSelected = travelMode === id;
              return (
                <button
                  key={id}
                  onClick={() => onTravelModeChange(id as any)}
                  className={`flex-1 py-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer text-[10px] ${
                    isSelected 
                      ? 'bg-amber-500 text-black font-black shadow-md' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 font-semibold'
                  }`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Info Badges */}
          <div ref={scrollContainerRef} className="flex gap-3 mb-4 overflow-x-auto hide-scrollbar pb-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
              <span className="text-[10px] font-black text-amber-500 mr-0.5">Rp</span>
              {displayPoi.price}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {displayPoi.hours}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
              {displayPoi.distance}
            </div>
            {/* Dynamic ETA Badge */}
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shrink-0 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {(() => {
                const distanceNum = parseFloat(displayPoi.distance) || 0;
                let estimatedMinutes = 0;
                if (travelMode === 'car') {
                  estimatedMinutes = Math.round(distanceNum * 2.5);
                } else if (travelMode === 'motor') {
                  estimatedMinutes = Math.round(distanceNum * 1.8);
                } else {
                  estimatedMinutes = Math.round(distanceNum * 12);
                }
                if (estimatedMinutes < 1) estimatedMinutes = 1;
                return `${estimatedMinutes} mnt`;
              })()}
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {deskripsi}
          </p>

          {/* Detail Paket Section */}
          {displayPoi.packages && displayPoi.packages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-3">Detail Paket Wisata / Vila</h3>
              <div className="flex flex-col gap-3">
                {displayPoi.packages.map((pkg: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="font-bold text-white text-sm md:text-base leading-snug">{pkg.name}</span>
                      <span className="text-amber-400 text-xs md:text-sm font-black whitespace-nowrap">{pkg.price}</span>
                    </div>
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="text-xs text-gray-400 space-y-1 mt-1 pl-1 list-none">
                        {pkg.features.map((feat: string, fIdx: number) => (
                          <li key={fIdx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                            {feat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {/* Start Navigation CTA (Google Maps style) */}
            {onStartNavigation && displayPoi.id !== 'kantor-desa' && (
              hasActiveRoute ? (
                <button 
                  onClick={onCancelNavigation}
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Batal Navigasi
                </button>
              ) : (
                <button 
                  onClick={onStartNavigation}
                  disabled={isNavigating}
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 disabled:opacity-75"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                  {isNavigating ? 'Memuat Rute...' : 'Mulai Navigasi'}
                </button>
              )
            )}

            {/* WA Chat CTA - Package booking for Kantor Desa */}
            {displayPoi.id === 'kantor-desa' && (
              <a 
                href={`https://wa.me/62895320695308?text=${encodeURIComponent(`Halo Admin Wisata Sugihmukti,\n\nSaya tertarik untuk memesan paket wisata. Berikut data rencana kunjungan saya:\n\nNama Pemesan (Penanggung Jawab): [Isi Nama Anda]\nPaket Wisata: Eksplore Sugihmukti (2 Hari 1 Malam)\nRencana Tanggal Kunjungan: [Contoh: 15-16 Oktober 2024]\nJumlah Peserta: [Min. 20 Orang, Contoh: 22 Orang]\nNomor HP/WA Aktif: [Isi Nomor Anda]\n\nMohon informasi ketersediaan dan langkah pembayaran selanjutnya. Terima kasih.`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-[#25D366] hover:bg-[#1ebd5d] text-white shadow-[#25D366]/20 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Pesan Paket Lewat WhatsApp
              </a>
            )}

            {/* WA Chat CTA - Only show for Vilas/Homestays */}
            {wa && isVila && displayPoi.id !== 'kantor-desa' && (
              <a 
                href={`https://wa.me/${wa}?text=${encodeURIComponent(`Halo, saya ingin info lebih lanjut mengenai ${namaTempat}.`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-[#25D366] hover:bg-[#1ebd5d] text-white shadow-[#25D366]/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Cek Ketersediaan Kamar
              </a>
            )}

            {/* Edit / Delete Location CTA - Admin Only */}
            {isAdmin && onEditPoi && (
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => onEditPoi(displayPoi)}
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  Edit Lokasi
                </button>
                {onDeletePoi && (
                  <button 
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus lokasi "${namaTempat}"?`)) {
                        onDeletePoi(displayPoi.id);
                      }
                    }}
                    className="py-3 px-4 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/40"
                    title="Hapus Lokasi"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};