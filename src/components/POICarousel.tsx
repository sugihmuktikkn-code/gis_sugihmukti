import { useEffect, useRef, useState } from 'react';
import { POI } from '../types';

interface POICarouselProps {
  pois: POI[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function POICarousel({ pois, activeId, onSelect }: POICarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current && !isHovered) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 296, behavior: 'smooth' }); // min-width + gap
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      ref={carouselRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="flex gap-4 overflow-x-auto hide-scrollbar pb-6 pt-4 px-4 snap-x snap-mandatory scroll-smooth"
    >
      {pois.map((poi) => {
        const isActive = poi.id === activeId;
        const Icon = poi.icon;

        return (
          <div
            key={poi.id}
            onClick={() => onSelect(poi.id)}
            className={`min-w-[220px] md:min-w-[280px] h-[120px] snap-start flex flex-col justify-end p-4 relative overflow-hidden cursor-pointer transition-all duration-300 rounded-3xl ${
              isActive ? 'opacity-100 scale-100 ring-2 ring-amber-500 ring-offset-2 ring-offset-black' : 'opacity-70 hover:opacity-100 scale-95 hover:scale-100'
            }`}
            style={{
              boxShadow: isActive ? '0 10px 30px -10px rgba(245, 158, 11, 0.4)' : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Background Image */}
            {poi.image && (
              <img 
                src={poi.image} 
                alt={poi.title} 
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

            {/* Content */}
            <div className="flex items-center gap-3 relative z-20 w-full">
              <div 
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0 backdrop-blur-md"
                style={{
                  backgroundColor: isActive ? 'var(--color-app-accent)' : 'rgba(0, 0, 0, 0.5)',
                  color: isActive ? '#000' : '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Icon size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-[9px] uppercase tracking-widest font-bold text-amber-500 mb-0.5">
                  {poi.category}
                </p>
                <h3 className="text-sm font-extrabold leading-tight text-white truncate">
                  {poi.title}
                </h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}