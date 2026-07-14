import { Search, X } from 'lucide-react';
import { useState } from 'react';

export function TopNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

      <div className={`flex items-center gap-4 flex-shrink-0 pointer-events-auto ${isSearchOpen ? 'w-full md:w-auto md:ml-auto' : ''}`}>
        {isSearchOpen ? (
          <div className="flex items-center bg-black/60 backdrop-blur-lg border border-white/20 rounded-full px-3 py-1.5 animate-in fade-in slide-in-from-right-4 w-full md:w-auto">
            <Search size={14} className="text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Fitur pencarian belum aktif..." 
              disabled
              className="bg-transparent border-none outline-none text-white text-sm w-full md:w-40 placeholder:text-gray-500 opacity-50"
            />
            <button onClick={() => setIsSearchOpen(false)} className="ml-2 text-gray-400 hover:text-white cursor-pointer shrink-0">
              <X size={14} />
            </button>
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