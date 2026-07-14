import React from 'react';
import { Map, Home, Tent } from 'lucide-react';

interface FilterPillsProps {
  activeFilter: string;
  onChange: (filter: string) => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({ activeFilter, onChange }) => {
  const filters = [
    { id: 'wisata', label: 'WISATA', Icon: Map },
    { id: 'vila', label: 'VILA', Icon: Home },
    { id: 'homestay', label: 'HOMESTAY', Icon: Tent }
  ];

  return (
    <div className="flex justify-center w-full mt-4 md:mt-6 px-1">
      <div className="flex gap-2 md:gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
        {filters.map(({ id, label, Icon }) => {
          const isActive = activeFilter === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`
                cursor-pointer flex items-center gap-1.5 md:gap-2 px-3.5 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest transition-all duration-300 whitespace-nowrap
                ${isActive 
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                  : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5' 
                }
              `}
            >
              <Icon size={14} strokeWidth={2.5} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};