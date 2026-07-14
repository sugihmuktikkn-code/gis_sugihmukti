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
    <div className="w-full overflow-x-auto hide-scrollbar pl-4 md:pl-8 pr-4 py-2 pointer-events-auto">
      <div className="flex gap-2 w-max">
        {filters.map(({ id, label, Icon }) => {
          const isActive = activeFilter === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`
                cursor-pointer flex items-center gap-1.5 md:gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-all duration-300 whitespace-nowrap border
                ${isActive 
                  ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                  : 'bg-black/60 backdrop-blur-md text-gray-300 border-white/10 hover:text-white hover:bg-white/10' 
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