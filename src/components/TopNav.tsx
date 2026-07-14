import { Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { POI } from '../types';

interface TopNavProps {
  pois: POI[];
  onSelectPOI: (id: string) => void;
}

export function TopNav({ pois, onSelectPOI }: TopNavProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return pois.filter(
      poi => 
        (poi.title && poi.title.toLowerCase().includes(query)) ||
        (poi.name && poi.name.toLowerCase().includes(query)) ||
        (poi.category && poi.category.toLowerCase().includes(query))
    );
  }, [searchQuery, pois]);

  const handleSelect = (id: string) => {
    onSelectPOI(id);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <nav 
      className="fixed top-4 left-0 right-0 z-40 flex justify-between items-center px-4 md:px-8 pointer-events-none"
    >
      <div className={`items-center gap-3 min-w-0 pointer-events-auto transition-all duration-300 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0">
          <span className="text-black font-black text-sm">S</span>
        </div>
        <div className="flex flex-col drop-shadow-md overflow-hidden pr-2">
          <span className="font-black text-sm md:text-base text-white truncate leading-none">
            Sugihmukti Tourism GIS
          </span>
          <span className="text-[9px] text-gray-200 mt-1 truncate">Explore. Experience. Preserve.</span>
        </div>
      </div>

      <div className="relative flex items-center gap-4 flex-shrink-0 pointer-events-auto">
        {isSearchOpen ? (
          <div className="flex flex-col w-64 md:w-80">
            <div className="flex items-center bg-black/80 backdrop-blur-lg border border-white/20 rounded-full px-3 py-1.5 w-full">
              <Search size={14} className="text-gray-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Cari destinasi atau vila..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500"
              />
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }} 
                className="ml-2 text-gray-400 hover:text-white cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50">
                {suggestions.map((poi) => {
                  const title = poi.title || poi.name || "Tempat";
                  return (
                    <button
                      key={poi.id}
                      onClick={() => handleSelect(poi.id)}
                      className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-white/10 border-b border-white/5 last:border-0 transition-colors flex flex-col cursor-pointer"
                    >
                      <span className="font-bold text-white">{title}</span>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">{poi.category}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all shrink-0 cursor-pointer bg-black/40 backdrop-blur-md"
          >
            <Search size={16} />
          </button>
        )}
      </div>
    </nav>
  );
}