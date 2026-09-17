import React, { useState } from 'react';
import { DonutItem, GlazeType, ToppingType, CustomerOrder } from '../types';
import { sound } from '../audio/soundEffects';
import { Sparkles, Utensils, RotateCcw, CheckCircle, ArrowRight } from 'lucide-react';

interface ToppingStationProps {
  donut: DonutItem;
  activeOrder: CustomerOrder | null;
  onUpdateDonut: (updated: DonutItem) => void;
  onFinishDonut: (donut: DonutItem) => void;
  onTriggerParticles?: (type: string) => void;
}

export const ToppingStation: React.FC<ToppingStationProps> = ({
  donut,
  activeOrder,
  onUpdateDonut,
  onFinishDonut,
  onTriggerParticles,
}) => {
  const [activeGlaze, setActiveGlaze] = useState<GlazeType>(donut.glaze || 'none');

  // Handle Glaze Application
  const handleApplyGlaze = (glaze: GlazeType) => {
    sound.playGlaze();
    setActiveGlaze(glaze);
    onUpdateDonut({
      ...donut,
      glaze,
    });
  };

  // Handle Topping Sprinkle Application
  const handleAddSprinkles = (type: ToppingType) => {
    sound.playSprinkle();
    if (onTriggerParticles) {
      onTriggerParticles(type);
    }

    // Generate ~20 pseudo-random positions across torus surface
    const newPositions: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.28;
      newPositions.push({
        x: Math.cos(angle) * radius,
        y: Math.random() * 0.1,
        z: Math.sin(angle) * radius,
      });
    }

    const existingTopping = donut.toppings.find((t) => t.type === type);
    let updatedToppings = [...donut.toppings];

    if (existingTopping) {
      updatedToppings = updatedToppings.map((t) => {
        if (t.type === type) {
          return {
            ...t,
            coverage: Math.min(100, t.coverage + 25),
            positions: [...t.positions, ...newPositions],
          };
        }
        return t;
      });
    } else {
      updatedToppings.push({
        type,
        coverage: 30,
        positions: newPositions,
      });
    }

    onUpdateDonut({
      ...donut,
      toppings: updatedToppings,
    });
  };

  const handleResetToppings = () => {
    onUpdateDonut({
      ...donut,
      glaze: 'none',
      toppings: [],
    });
    setActiveGlaze('none');
  };

  // Find coverage of specific topping
  const getToppingCoverage = (type: ToppingType) => {
    const t = donut.toppings.find((item) => item.type === type);
    return t ? t.coverage : 0;
  };

  return (
    <div className="bg-amber-950/95 text-amber-50 p-4 rounded-xl border-2 border-amber-700 shadow-2xl space-y-4">
      {/* Title & Target Order Guide */}
      <div className="flex items-center justify-between border-b border-amber-800 pb-2">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-amber-300">
            <Sparkles className="w-5 h-5 text-yellow-400" /> Stasiun Topping & Olesan Khas Pinggir Jalan
          </h3>
          <p className="text-xs text-amber-200">
            Celup glaze donat, lalu taburkan topping sesuai pesanan pembeli lokal
          </p>
        </div>
        {activeOrder && (
          <div className="bg-amber-900/80 px-3 py-1 rounded-lg text-xs border border-amber-700">
            <span className="text-amber-300">Pesanan {activeOrder.customerName}: </span>
            <strong className="text-white">{activeOrder.toppingNotes}</strong>
          </div>
        )}
      </div>

      {/* Grid: 1. Glazes, 2. Toppings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: Celupan Glaze Dasar */}
        <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-amber-400" /> 1. Celupan Dasar (Glaze)
            </span>
            <span className="text-[10px] text-amber-400">Pilih salah satu</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Gula Merah */}
            <button
              onClick={() => handleApplyGlaze('gula_merah')}
              id="glaze-gula-merah-btn"
              className={`p-2.5 rounded-lg border flex flex-col items-center text-center transition-all cursor-pointer ${
                donut.glaze === 'gula_merah'
                  ? 'bg-amber-900 border-yellow-400 shadow-lg ring-2 ring-yellow-400/60 scale-102'
                  : 'bg-amber-950/70 border-amber-800 hover:bg-amber-900/60'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-amber-950 border-2 border-amber-600 shadow mb-1 flex items-center justify-center text-xs">
                🍯
              </div>
              <span className="text-xs font-bold text-amber-100">Kinca Gula Merah</span>
              <span className="text-[9px] text-amber-300">Legit Aren Khas Pasar</span>
            </button>

            {/* Coklat */}
            <button
              onClick={() => handleApplyGlaze('coklat')}
              id="glaze-coklat-btn"
              className={`p-2.5 rounded-lg border flex flex-col items-center text-center transition-all cursor-pointer ${
                donut.glaze === 'coklat'
                  ? 'bg-stone-900 border-yellow-400 shadow-lg ring-2 ring-yellow-400/60 scale-102'
                  : 'bg-amber-950/70 border-amber-800 hover:bg-amber-900/60'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-stone-900 border-2 border-stone-600 shadow mb-1 flex items-center justify-center text-xs">
                🍫
              </div>
              <span className="text-xs font-bold text-amber-100">Coklat Leleh</span>
              <span className="text-[9px] text-amber-300">Pekat Manis</span>
            </button>

            {/* Mentega / Krim Manis */}
            <button
              onClick={() => handleApplyGlaze('mentega')}
              id="glaze-mentega-btn"
              className={`p-2.5 rounded-lg border flex flex-col items-center text-center transition-all cursor-pointer ${
                donut.glaze === 'mentega'
                  ? 'bg-amber-800 border-yellow-400 shadow-lg ring-2 ring-yellow-400/60 scale-102'
                  : 'bg-amber-950/70 border-amber-800 hover:bg-amber-900/60'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-amber-400 shadow mb-1 flex items-center justify-center text-xs">
                🧈
              </div>
              <span className="text-xs font-bold text-amber-100">Krim Mentega</span>
              <span className="text-[9px] text-amber-300">Dasar Seres Meises</span>
            </button>
          </div>
        </div>

        {/* Step 2: Taburan Topping (Sesuai Permintaan User) */}
        <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" /> 2. Taburan Khas Pinggir Jalan
            </span>
            <span className="text-[10px] text-amber-400">Klik berulang untuk meratakan</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* 1. Gula Merah Bubuk Aren */}
            <button
              onClick={() => handleAddSprinkles('gula_merah_bubuk')}
              id="topping-gula-merah-btn"
              className="p-2.5 rounded-lg border border-amber-800 bg-amber-950/80 hover:bg-amber-900 flex flex-col items-center text-center transition-all active:scale-95 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-900 border border-amber-600 shadow mb-1 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                🟤
              </div>
              <span className="text-xs font-bold text-amber-200">Gula Merah Aren</span>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all"
                  style={{ width: `${getToppingCoverage('gula_merah_bubuk')}%` }}
                />
              </div>
              <span className="text-[9px] text-amber-400 mt-0.5">{getToppingCoverage('gula_merah_bubuk')}%</span>
            </button>

            {/* 2. Seres Warna-Warni */}
            <button
              onClick={() => handleAddSprinkles('seres_warnawarni')}
              id="topping-seres-btn"
              className="p-2.5 rounded-lg border border-rose-800 bg-amber-950/80 hover:bg-amber-900 flex flex-col items-center text-center transition-all active:scale-95 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 via-yellow-400 to-sky-500 border border-white/50 shadow mb-1 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                🌈
              </div>
              <span className="text-xs font-bold text-pink-300">Seres Warna-Warni</span>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 via-yellow-400 to-sky-500 h-full transition-all"
                  style={{ width: `${getToppingCoverage('seres_warnawarni')}%` }}
                />
              </div>
              <span className="text-[9px] text-amber-400 mt-0.5">{getToppingCoverage('seres_warnawarni')}%</span>
            </button>

            {/* 3. Coklat Kacang */}
            <button
              onClick={() => handleAddSprinkles('coklat_kacang')}
              id="topping-kacang-btn"
              className="p-2.5 rounded-lg border border-amber-700 bg-amber-950/80 hover:bg-amber-900 flex flex-col items-center text-center transition-all active:scale-95 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-800 border border-amber-500 shadow mb-1 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                🥜
              </div>
              <span className="text-xs font-bold text-amber-200">Coklat Kacang</span>
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${getToppingCoverage('coklat_kacang')}%` }}
                />
              </div>
              <span className="text-[9px] text-amber-400 mt-0.5">{getToppingCoverage('coklat_kacang')}%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-amber-800">
        <button
          onClick={handleResetToppings}
          id="reset-topping-btn"
          className="px-3 py-2 bg-amber-900/60 hover:bg-amber-900 text-amber-300 rounded-xl text-xs flex items-center gap-1.5 border border-amber-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Hapus Semua Topping
        </button>

        <button
          onClick={() => onFinishDonut(donut)}
          id="serve-donut-btn"
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl shadow-xl border-2 border-emerald-300 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer text-sm animate-pulse"
        >
          <CheckCircle className="w-4.5 h-4.5" />
          <span>Sajikan Donat ke Pelanggan!</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
