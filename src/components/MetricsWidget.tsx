import { POI } from '../types';

interface MetricsWidgetProps {
  activePOI: POI | null;
  onStartNavigation: () => void;
  isNavigating: boolean;
}

export function MetricsWidget({ activePOI, onStartNavigation, isNavigating }: MetricsWidgetProps) {
  if (!activePOI) return null;

  return (
    <div className="fixed top-40 right-4 md:right-8 z-30 flex flex-col w-[280px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 transition-all duration-500 animate-in fade-in slide-in-from-right-8">
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h3 className="font-bold text-white tracking-wide">Rute Terpilih</h3>
        <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400">Jarak / Distance</span>
          <span className="font-bold text-amber-500">{activePOI.distance}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400">Waktu Est.</span>
          <span className="font-bold text-amber-500">{activePOI.time}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400">Elevasi Gain</span>
          <span className="font-bold text-green-400">120 m</span>
        </div>
      </div>
      
      <button 
        onClick={onStartNavigation}
        disabled={isNavigating}
        className="w-full py-3.5 rounded-xl text-sm font-extrabold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
        style={{
          backgroundColor: 'var(--color-app-accent)',
          color: '#000',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
        {isNavigating ? 'Memuat Rute...' : 'Mulai Navigasi'}
      </button>
    </div>
  );
}
