import React, { useState, useEffect, useRef } from 'react';

interface InfoPanelProps {
  poi: any | null;
  onClose: () => void;
  onStartNavigation?: () => void;
  isNavigating?: boolean;
  forceMinimize?: boolean;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ poi, onClose, onStartNavigation, isNavigating, forceMinimize }) => {
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
        md:bottom-6 md:left-6 md:right-auto md:w-[400px] md:rounded-3xl md:border
        bg-slate-900/95 border-slate-700 shadow-2xl backdrop-blur-xl text-white
        flex flex-col
        ${isOpen 
          ? isMinimized 
            ? 'translate-y-[90%] md:translate-y-0' 
            : 'translate-y-0' 
          : 'translate-y-[120%]'
        } 
      `}
      style={{ maxHeight: '85vh' }}
    >
      {/* Grab Handle (Mobile Only) */}
      <div 
        className="w-full flex justify-center pt-3 pb-3 md:hidden cursor-pointer" 
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="w-12 h-1.5 bg-slate-600 rounded-full"></div>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer text-white border border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

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
          
          {/* Quick Info Badges */}
          <div className="flex gap-3 mb-4 overflow-x-auto hide-scrollbar pb-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
              <span className="text-[10px] font-black text-amber-500 mr-0.5">Rp</span>
              {displayPoi.price}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {displayPoi.hours}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shrink-0 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
              {displayPoi.distance}
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {deskripsi}
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Start Navigation CTA (Google Maps style) */}
            {onStartNavigation && displayPoi.id !== 'kantor-desa' && (
              <button 
                onClick={onStartNavigation}
                disabled={isNavigating}
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 disabled:opacity-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                {isNavigating ? 'Memuat Rute...' : 'Mulai Navigasi'}
              </button>
            )}

            {/* WA Chat CTA - Only show for Vilas/Homestays */}
            {wa && isVila && (
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
          </div>
        </div>
      </div>
    </div>
  );
};