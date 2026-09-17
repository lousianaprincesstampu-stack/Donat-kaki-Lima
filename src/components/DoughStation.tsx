import React, { useState } from 'react';
import { DonutShape, DonutItem } from '../types';
import { sound } from '../audio/soundEffects';
import { Circle, Heart, Disc, Check, ArrowRight, Sparkles } from 'lucide-react';

interface DoughStationProps {
  onDoughCreated: (donut: DonutItem) => void;
  targetShape?: DonutShape;
}

export const DoughStation: React.FC<DoughStationProps> = ({ onDoughCreated, targetShape = 'klasik' }) => {
  const [selectedShape, setSelectedShape] = useState<DonutShape>(targetShape);
  const [isKneaded, setIsKneaded] = useState<boolean>(true);
  const [isCut, setIsCut] = useState<boolean>(false);

  const shapes: { id: DonutShape; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'klasik',
      name: 'Donat Bolong Klasik',
      desc: 'Bentuk donat kentang berlubang tengah khas gerobak',
      icon: <Disc className="w-6 h-6 text-amber-600" />,
    },
    {
      id: 'bolong',
      name: 'Donat Bulat Penuh',
      desc: 'Donat kentang montok lembut tanpa bolong tengah',
      icon: <Circle className="w-6 h-6 text-amber-600" />,
    },
    {
      id: 'hati',
      name: 'Donat Hati Cinta',
      desc: 'Bentuk hati unik yang disukai pembeli muda',
      icon: <Heart className="w-6 h-6 text-rose-500" />,
    },
  ];

  const handleCutDough = () => {
    sound.playStamp();
    setIsCut(true);
  };

  const handleSendToFry = () => {
    const newDonut: DonutItem = {
      id: 'donut_' + Date.now(),
      shape: selectedShape,
      doughDone: true,
      frySideA: 0,
      frySideB: 0,
      currentSide: 'A',
      isFrying: false,
      isBurnt: false,
      isCooked: false,
      glaze: 'none',
      toppings: [],
      served: false,
    };
    onDoughCreated(newDonut);
  };

  return (
    <div className="bg-amber-900/90 text-amber-50 p-4 rounded-xl border-2 border-amber-700 shadow-xl space-y-4">
      {/* Station Title */}
      <div className="flex items-center justify-between border-b border-amber-800 pb-2">
        <div>
          <h3 className="text-lg font-bold font-sans flex items-center gap-2 text-amber-300">
            <Sparkles className="w-5 h-5 text-yellow-400" /> Stasiun Cetak Adonan Kentang
          </h3>
          <p className="text-xs text-amber-200">
            Pilih cetakan dan tekan untuk memotong adonan donat kentang sebelum digoreng
          </p>
        </div>
        {targetShape && (
          <div className="bg-amber-800/80 px-3 py-1 rounded-lg text-xs border border-amber-600">
            <span className="text-amber-300">Pesanan:</span> <strong className="capitalize">{targetShape}</strong>
          </div>
        )}
      </div>

      {/* Dough Shape Selection */}
      <div className="grid grid-cols-3 gap-3">
        {shapes.map((item) => {
          const isSelected = selectedShape === item.id;
          const isTarget = targetShape === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedShape(item.id);
                setIsCut(false);
                sound.playStamp();
              }}
              id={`shape-btn-${item.id}`}
              className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-700 border-yellow-400 shadow-lg scale-102 ring-2 ring-yellow-400/50'
                  : 'bg-amber-950/60 border-amber-800 hover:bg-amber-800/50'
              }`}
            >
              <div className="p-2 bg-amber-100 rounded-full mb-1.5 shadow-inner">{item.icon}</div>
              <span className="font-bold text-xs text-amber-100">{item.name}</span>
              <span className="text-[10px] text-amber-300/80 mt-0.5 leading-tight">{item.desc}</span>
              {isTarget && (
                <span className="mt-2 text-[9px] bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded font-semibold">
                  Sesuai Pesanan
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-amber-800">
        <div className="text-xs text-amber-200">
          Status Adonan: {isCut ? (
            <span className="text-emerald-400 font-bold">Siap Digoreng di Kuali!</span>
          ) : (
            <span className="text-yellow-300 font-semibold">Belum dicetak</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isCut ? (
            <button
              onClick={handleCutDough}
              id="cut-dough-btn"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-extrabold rounded-xl shadow-lg border-2 border-yellow-200 transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Cetak Donat Sekarang
            </button>
          ) : (
            <button
              onClick={handleSendToFry}
              id="send-fry-btn"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl shadow-lg border-2 border-emerald-300 transition-transform active:scale-95 cursor-pointer flex items-center gap-2 animate-pulse"
            >
              <span>Masukkan ke Wajan Penggorengan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
