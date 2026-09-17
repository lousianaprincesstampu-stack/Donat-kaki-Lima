import React, { useEffect, useState } from 'react';
import { DonutItem } from '../types';
import { sound } from '../audio/soundEffects';
import { Flame, RefreshCw, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

interface FryStationProps {
  fryingDonuts: DonutItem[];
  onUpdateDonut: (updated: DonutItem) => void;
  onSelectForTopping: (donut: DonutItem) => void;
  frySpeedMultiplier?: number;
}

export const FryStation: React.FC<FryStationProps> = ({
  fryingDonuts,
  onUpdateDonut,
  onSelectForTopping,
  frySpeedMultiplier = 1,
}) => {
  const [selectedDonutId, setSelectedDonutId] = useState<string>(
    fryingDonuts[0]?.id || ''
  );

  // Auto-select first donut if none selected
  useEffect(() => {
    if ((!selectedDonutId || !fryingDonuts.some((d) => d.id === selectedDonutId)) && fryingDonuts.length > 0) {
      setSelectedDonutId(fryingDonuts[0].id);
    }
  }, [fryingDonuts, selectedDonutId]);

  // Frying timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      fryingDonuts.forEach((donut) => {
        if (donut.isCooked || donut.isBurnt) return;

        // Frying increment
        const increment = 1.2 * frySpeedMultiplier;
        let sideA = donut.frySideA;
        let sideB = donut.frySideB;

        if (donut.currentSide === 'A') {
          sideA = Math.min(100, sideA + increment);
        } else {
          sideB = Math.min(100, sideB + increment);
        }

        const isBurnt = sideA > 85 || sideB > 85;

        onUpdateDonut({
          ...donut,
          frySideA: sideA,
          frySideB: sideB,
          isBurnt,
        });
      });
    }, 250);

    return () => clearInterval(interval);
  }, [fryingDonuts, frySpeedMultiplier, onUpdateDonut]);

  const activeDonut = fryingDonuts.find((d) => d.id === selectedDonutId);

  const handleFlip = () => {
    if (!activeDonut || activeDonut.isCooked) return;
    sound.playFlip();
    onUpdateDonut({
      ...activeDonut,
      currentSide: activeDonut.currentSide === 'A' ? 'B' : 'A',
    });
  };

  const handleDrain = () => {
    if (!activeDonut) return;
    sound.playSizzle();
    onUpdateDonut({
      ...activeDonut,
      isCooked: true,
      isFrying: false,
    });
  };

  // Helper for progress status text and color
  const getCookStatus = (sideVal: number) => {
    if (sideVal < 30) return { label: 'Adonan Masih Mentah', color: 'text-amber-200' };
    if (sideVal < 45) return { label: 'Mulai Mengembang', color: 'text-yellow-300' };
    if (sideVal <= 70) return { label: 'Kuning Keemasan (SEMPURNA)', color: 'text-emerald-400 font-bold' };
    if (sideVal <= 85) return { label: 'Terlalu Coklat', color: 'text-orange-400' };
    return { label: 'GOSONG / HANGUS!', color: 'text-rose-400 font-extrabold' };
  };

  return (
    <div className="bg-amber-950/95 text-amber-50 p-4 rounded-xl border-2 border-orange-700 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-800/80 pb-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-orange-400">
            <Flame className="w-5 h-5 text-orange-500 animate-bounce" /> Wajan Penggorengan Minyak Kaki Lima
          </h3>
          <p className="text-xs text-amber-300">
            Perhatikan kematangan kedua sisi donat. Balik saat kuning keemasan, jangan sampai gosong!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-300">Donat di wajan:</span>
          <span className="bg-orange-900 px-2 py-0.5 rounded text-xs font-bold border border-orange-600">
            {fryingDonuts.length}
          </span>
        </div>
      </div>

      {/* Donuts list tabs if multiple */}
      {fryingDonuts.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {fryingDonuts.map((d, idx) => {
            const isSel = d.id === selectedDonutId;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDonutId(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSel ? 'bg-orange-600 text-white shadow-md border border-yellow-300' : 'bg-amber-900/60 text-amber-300 hover:bg-amber-800'
                }`}
              >
                <span>Donat #{idx + 1} ({d.shape})</span>
                {d.isCooked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {d.isBurnt && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Donut Control Panel */}
      {activeDonut ? (
        <div className="bg-amber-900/50 p-3.5 rounded-xl border border-orange-800/60 space-y-3">
          {/* Status Banner */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-200">Sedang Digoreng Sisi:</span>
              <span className="px-2 py-0.5 rounded font-extrabold bg-orange-700 text-white border border-yellow-400">
                Sisi {activeDonut.currentSide}
              </span>
            </div>
            <div>
              {activeDonut.isBurnt ? (
                <span className="text-rose-400 font-extrabold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Donat Hangus Terbakar!
                </span>
              ) : activeDonut.isCooked ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Donat Sudah Ditiriskan
                </span>
              ) : (
                <span className="text-yellow-300 animate-pulse font-semibold">
                  Minyak mendidih berdesis...
                </span>
              )}
            </div>
          </div>

          {/* Progress Bars for Both Sides */}
          <div className="grid grid-cols-2 gap-4">
            {/* Side A */}
            <div className={`p-2.5 rounded-lg border ${activeDonut.currentSide === 'A' ? 'bg-orange-950/80 border-yellow-500' : 'bg-amber-950/40 border-amber-800'}`}>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-amber-200">Sisi A:</span>
                <span className="font-mono font-bold text-yellow-400">{Math.round(activeDonut.frySideA)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden border border-amber-900 relative">
                {/* Target Perfect Zone indicator */}
                <div className="absolute left-[45%] w-[25%] h-full bg-emerald-500/30 pointer-events-none" />
                <div
                  className={`h-full transition-all duration-200 ${
                    activeDonut.frySideA > 85
                      ? 'bg-rose-600'
                      : activeDonut.frySideA >= 45
                      ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                      : 'bg-yellow-400'
                  }`}
                  style={{ width: `${Math.min(100, activeDonut.frySideA)}%` }}
                />
              </div>
              <p className="text-[10px] mt-1 text-right">{getCookStatus(activeDonut.frySideA).label}</p>
            </div>

            {/* Side B */}
            <div className={`p-2.5 rounded-lg border ${activeDonut.currentSide === 'B' ? 'bg-orange-950/80 border-yellow-500' : 'bg-amber-950/40 border-amber-800'}`}>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-amber-200">Sisi B:</span>
                <span className="font-mono font-bold text-yellow-400">{Math.round(activeDonut.frySideB)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden border border-amber-900 relative">
                {/* Target Perfect Zone indicator */}
                <div className="absolute left-[45%] w-[25%] h-full bg-emerald-500/30 pointer-events-none" />
                <div
                  className={`h-full transition-all duration-200 ${
                    activeDonut.frySideB > 85
                      ? 'bg-rose-600'
                      : activeDonut.frySideB >= 45
                      ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                      : 'bg-yellow-400'
                  }`}
                  style={{ width: `${Math.min(100, activeDonut.frySideB)}%` }}
                />
              </div>
              <p className="text-[10px] mt-1 text-right">{getCookStatus(activeDonut.frySideB).label}</p>
            </div>
          </div>

          {/* Sumpit Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-orange-800/80">
            <div className="text-[11px] text-amber-300">
              *Tingkat matang ideal berada di zona hijau (50% - 65%)
            </div>

            <div className="flex items-center gap-2">
              {!activeDonut.isCooked && (
                <>
                  <button
                    onClick={handleFlip}
                    id="flip-donut-btn"
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow border border-yellow-300/40 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer text-xs"
                  >
                    <RefreshCw className="w-4 h-4" /> Balik Donat (Sumpit)
                  </button>

                  <button
                    onClick={handleDrain}
                    id="drain-donut-btn"
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-amber-950 font-extrabold rounded-xl shadow border border-yellow-200 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Tiriskan ke Rak
                  </button>
                </>
              )}

              {activeDonut.isCooked && (
                <button
                  onClick={() => onSelectForTopping(activeDonut)}
                  id="go-topping-btn"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl shadow-lg border-2 border-emerald-300 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer text-xs animate-pulse"
                >
                  <span>Bawa ke Meja Topping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-amber-300 bg-amber-900/30 rounded-xl border border-dashed border-amber-800">
          <p className="text-sm font-semibold">Wajan penggorengan sedang kosong!</p>
          <p className="text-xs text-amber-400 mt-1">Cetak adonan donat kentang terlebih dahulu di Stasiun Cetak.</p>
        </div>
      )}
    </div>
  );
};
