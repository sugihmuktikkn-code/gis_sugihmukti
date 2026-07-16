import React from 'react';

interface MapPinProps {
  poi: any;
  isActive: boolean;
  onClick: () => void;
  index: number;
  pinColor?: 'amber' | 'sky' | 'emerald' | 'white';
}

export const MapPin: React.FC<MapPinProps> = ({ poi, isActive, onClick, pinColor = 'white' }) => {
  const namaTempat = poi.name || poi.title || "Nama Tidak Ditemukan";
  const imageUrl = poi.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100&q=80';

  const getBorderClass = () => {
    if (isActive) return 'border-amber-500 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.6)] z-20';
    if (pinColor === 'sky') return 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]';
    if (pinColor === 'emerald') return 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    return 'border-white shadow-xl hover:scale-110 active:scale-95';
  };

  const getTriangleClass = () => {
    if (isActive) return 'border-t-amber-500';
    if (pinColor === 'sky') return 'border-t-sky-500';
    if (pinColor === 'emerald') return 'border-t-emerald-500';
    return 'border-t-white';
  };

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
        ${getBorderClass()}
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
          ${getTriangleClass()}
        `} />
      </div>

      {/* LABEL NAMA TEMPAT */}
      <div className={`
        absolute top-full mt-2
        px-3 py-1 rounded-full
        bg-black/70 backdrop-blur-md border
        text-[10px] md:text-xs font-bold whitespace-nowrap pointer-events-none
        transition-all duration-300
        ${isActive 
          ? 'opacity-100 translate-y-0 text-amber-400 border-amber-500/50 shadow-lg' 
          : pinColor === 'sky' 
            ? 'opacity-100 translate-y-0 text-sky-400 border-sky-500/50 shadow-md'
            : pinColor === 'emerald'
              ? 'opacity-100 translate-y-0 text-emerald-400 border-emerald-500/50 shadow-md'
              : 'opacity-0 -translate-y-2 text-white border-white/10 group-hover:opacity-100 group-hover:translate-y-0'
        }
      `}>
        {namaTempat}
      </div>
    </div>
  );
};