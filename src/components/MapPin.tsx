import React from 'react';

interface MapPinProps {
  poi: any;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

export const MapPin: React.FC<MapPinProps> = ({ poi, isActive, onClick }) => {
  const namaTempat = poi.name || poi.title || "Nama Tidak Ditemukan";
  const imageUrl = poi.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100&q=80';

  return (
    <div
      className="flex flex-col items-center cursor-pointer group"
      style={{ zIndex: isActive ? 50 : 10 }}
      onClick={onClick}
    >
      <div className={`
        relative flex items-center justify-center
        w-10 h-10 md:w-12 md:h-12 rounded-full 
        border-2 box-content
        ${isActive ? 'border-amber-500 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.6)] z-20' : 'border-white shadow-xl hover:scale-110 active:scale-95'}
        transition-all duration-300
        bg-black
      `}>
        <img 
          src={imageUrl} 
          alt={namaTempat} 
          className="w-full h-full object-cover rounded-full pointer-events-none"
        />
        
        {/* Ekor Pointer (Segitiga Bawah) */}
        <div className={`
          absolute -bottom-[6px] left-1/2 -translate-x-1/2
          w-0 h-0
          border-l-[6px] border-l-transparent
          border-r-[6px] border-r-transparent
          border-t-[8px] 
          ${isActive ? 'border-t-amber-500' : 'border-t-white'}
        `} />
      </div>

      {/* LABEL NAMA TEMPAT */}
      <div className={`
        absolute top-full mt-2
        px-3 py-1 rounded-full
        bg-black/70 backdrop-blur-md border border-white/10
        text-[10px] md:text-xs font-bold whitespace-nowrap pointer-events-none
        transition-all duration-300
        ${isActive 
          ? 'opacity-100 translate-y-0 text-amber-400 border-amber-500/50 shadow-lg' 
          : 'opacity-0 -translate-y-2 text-white group-hover:opacity-100 group-hover:translate-y-0'
        }
      `}>
        {namaTempat}
      </div>
    </div>
  );
};