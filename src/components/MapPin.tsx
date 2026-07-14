import React from 'react';

interface MapPinProps {
  poi: any;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

export const MapPin: React.FC<MapPinProps> = ({ poi, isActive, onClick }) => {
  const namaTempat = poi.name || poi.title || "Nama Tidak Ditemukan";

  return (
    <div
      className="flex flex-col items-center cursor-pointer group"
      style={{
        zIndex: isActive ? 50 : 10,
      }}
      onClick={onClick}
    >
      
      {/* ICON POINTER */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`
          w-10 h-10 origin-bottom
          ${isActive 
            /* Marker Aktif: Warna Amber (amber-500) */
            ? 'fill-amber-500 animate-marker-pop drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]' 
            /* Marker Tidak Aktif: Warna Amber redup atau putih */
            : 'fill-amber-600/80 drop-shadow-md transition-transform duration-300 hover:scale-110'
          }
        `}
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>

      {/* LABEL NAMA TEMPAT (TANPA BACKGROUND) */}
      <div className={`
        absolute top-11 mt-1 text-xs font-black whitespace-nowrap transition-all duration-300 pointer-events-none 
        /* Bayangan pada teks agar tetap terbaca meski tanpa background */
        drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]
        ${isActive 
          ? 'opacity-100 translate-y-0 text-amber-400' 
          : 'opacity-0 -translate-y-2 text-white group-hover:opacity-100 group-hover:translate-y-0'
        }
      `}>
        {namaTempat}
      </div>

    </div>
  );
};  