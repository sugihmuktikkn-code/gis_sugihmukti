import React, { useState, useEffect, useRef } from 'react';

interface InfoPanelProps {
  poi: any | null;
  onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ poi, onClose }) => {
  const [displayPoi, setDisplayPoi] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(65); 
  const [isDragging, setIsDragging] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (poi) {
      setDisplayPoi(poi); 
      setHeight(65);
      
      // Reset posisi scroll ke kiri (0) secara instan setiap kali tempat baru diklik
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 0;
      }

      setTimeout(() => setIsOpen(true), 10);
    } else {
      setIsOpen(false); 
    }
  }, [poi]);

  // Efek untuk auto-scroll (geser otomatis) gambar/video
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isOpen && scrollContainerRef.current) {
      intervalId = setInterval(() => {
        const container = scrollContainerRef.current;
        if (container) {
          const maxScroll = container.scrollWidth - container.clientWidth;
          const currentScroll = container.scrollLeft;
          
          if (currentScroll >= maxScroll - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
          }
        }
      }, 3000); // Geser setiap 3 detik
    }
    return () => clearInterval(intervalId);
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId); 
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const windowHeight = window.innerHeight;
    const newHeightVh = ((windowHeight - e.clientY) / windowHeight) * 100;
    if (newHeightVh >= 25 && newHeightVh <= 90) {
      setHeight(newHeightVh);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!displayPoi) return null;

  const namaTempat = displayPoi.title || displayPoi.name || "Nama Tempat";
  const kategori = displayPoi.category || "WISATA";
  const harga = displayPoi.price || "Segera diinformasikan";
  const jarak = displayPoi.distance || "3.0 km";
  // Tarik data jam buka, default jika kosong
  const jamBuka = displayPoi.hours || "Buka Setiap Hari"; 

  // MENYUSUN MEDIA
  const mediaItems = [];
  
  if (displayPoi.video) {
    mediaItems.push({ type: 'video', url: displayPoi.video });
  }
  if (displayPoi.image) {
    mediaItems.push({ type: 'image', url: displayPoi.image });
  }
  
  mediaItems.push(
    { type: 'image', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&q=80' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80' }
  );

  return (
    <div 
      className={`
        fixed left-0 top-20 bottom-24 z-50 flex items-center pl-4 md:pl-8 pointer-events-none 
        transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'} 
      `}
    >
      <div 
        className={`
          w-[90vw] md:w-96 h-full max-h-[80vh] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl 
          flex flex-col pointer-events-auto font-sans text-white
          transition-all duration-300
        `}
      >
        {/* Hilangkan handle drag karena panel sekarang di samping */}
        <div className="w-full flex justify-end pt-4 pr-4 z-20">
          <button 
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors border border-white/10 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 custom-scrollbar flex-1 relative">
          
          <div className="flex justify-between items-start mb-4">
            <span className="text-amber-500 text-xs font-bold tracking-widest uppercase py-1">
              {kategori}
            </span>
          </div>

          {/* AREA SCROLL HORIZONTAL */}
          <div className="w-full mb-8">
            <div 
              ref={scrollContainerRef} 
              className="flex gap-4 overflow-x-auto custom-scrollbar pb-3 snap-x snap-mandatory"
            >
              {mediaItems.map((item, index) => (
                <div 
                  key={index} 
                  className="w-[90%] sm:min-w-full h-48 md:h-64 flex-shrink-0 snap-center rounded-2xl overflow-hidden border border-gray-800 bg-black"
                >
                  {item.type === 'video' ? (
                    <iframe 
                      className="w-full h-full" 
                      src={item.url} 
                      title={`Video Preview ${index}`}
                      allowFullScreen 
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={`Gallery ${index}`} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-3">{namaTempat}</h2>
            <p className="text-gray-400 leading-relaxed text-sm">{displayPoi.description}</p>
          </div>

          {/* AREA INFORMASI: Harga, Jam Buka & Jarak */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-5 flex items-center gap-3">
              <span className="text-gray-400 text-sm">Harga</span>
              <span className="text-white font-extrabold text-base">{harga}</span>
            </div>
            
            {/* TAMBAHAN KOTAK INFORMASI JAM BUKA */}
            <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-5 flex items-center gap-3">
              <span className="text-gray-400 text-sm">Jam</span>
              <span className="text-white font-extrabold text-base">{jamBuka}</span>
            </div>

            <div className="flex items-center gap-2 px-2">
              <span className="text-gray-400 text-base font-medium">{jarak}</span>
            </div>
          </div>

          {(displayPoi.type === 'vila' || displayPoi.type === 'homestay') && displayPoi.contact && (
            <a 
              href={`https://wa.me/${displayPoi.contact}?text=${encodeURIComponent(`Halo, saya ingin menanyakan ketersediaan tempat di ${namaTempat}.

Berikut rincian pesanan saya:
- Nama: 
- Tanggal Check-in: 
- Durasi Menginap: 
- Jumlah Orang: 

Mohon informasi lebih lanjut. Terima kasih!`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full mb-8 bg-[#25D366] hover:bg-[#1ebd5d] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(37,211,102,0.3)] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Cek Ketersediaan Tempat
            </a>
          )}
        </div>
      </div>
    </div>
  );
};  