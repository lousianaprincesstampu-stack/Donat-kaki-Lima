import React from 'react';
import { Station, CustomerOrder, UpgradeItem } from '../types';
import { sound } from '../audio/soundEffects';
import {
  Users,
  Disc,
  Flame,
  Sparkles,
  ShoppingBag,
  Volume2,
  VolumeX,
  Music,
  Calendar,
  DollarSign,
  Coffee,
  BookOpen,
} from 'lucide-react';

interface GameHUDProps {
  currentStation: Station;
  onChangeStation: (station: Station) => void;
  day: number;
  money: number;
  ordersServedCount: number;
  isMuted: boolean;
  isMusicPlaying: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenShop: () => void;
  onOpenHowToPlay: () => void;
  hasFryingDonuts: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentStation,
  onChangeStation,
  day,
  money,
  ordersServedCount,
  isMuted,
  isMusicPlaying,
  onToggleMute,
  onToggleMusic,
  onOpenShop,
  onOpenHowToPlay,
  hasFryingDonuts,
}) => {
  const stations: { id: Station; label: string; sub: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'order',
      label: '1. Antrian Pembeli',
      sub: 'Depan Gerobak',
      icon: <Users className="w-4 h-4" />,
      color: 'from-amber-600 to-amber-700',
    },
    {
      id: 'dough',
      label: '2. Cetak Adonan',
      sub: 'Potong Donat',
      icon: <Disc className="w-4 h-4" />,
      color: 'from-yellow-600 to-amber-600',
    },
    {
      id: 'fry',
      label: '3. Penggorengan',
      sub: 'Wajan Kuali',
      icon: <Flame className="w-4 h-4" />,
      color: 'from-orange-600 to-amber-700',
    },
    {
      id: 'topping',
      label: '4. Hias & Topping',
      sub: 'Gula/Seres/Kacang',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'from-emerald-700 to-teal-700',
    },
  ];

  return (
    <header className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-b-4 border-amber-600 shadow-xl px-4 py-2.5 text-amber-50 select-none">
      {/* Top row: Brand & Status Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-amber-800/80">
        {/* Stall Brand Banner */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-amber-200 flex items-center justify-center text-amber-950 shadow-md">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-yellow-400 font-sans flex items-center gap-1.5">
              DONUTERIA KAMPUNG
              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                3D Asli
              </span>
            </h1>
            <p className="text-[11px] text-amber-200 font-medium">
              Donat Kentang Kaki Lima Indonesia • Gula Merah, Seres, & Coklat Kacang
            </p>
          </div>
        </div>

        {/* Counters & Controls */}
        <div className="flex items-center gap-3">
          {/* Day */}
          <div className="bg-amber-900/80 px-3 py-1.5 rounded-xl border border-amber-700/80 flex items-center gap-1.5 text-xs shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-amber-200">Hari ke-</span>
            <strong className="text-yellow-300 font-bold">{day}</strong>
          </div>

          {/* Money in Rupiah */}
          <div className="bg-emerald-950/90 px-3 py-1.5 rounded-xl border border-emerald-600/80 flex items-center gap-1.5 text-xs shadow-inner">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-200">Kas:</span>
            <strong className="font-mono text-emerald-300 font-black text-sm">
              Rp {money.toLocaleString('id-ID')}
            </strong>
          </div>

          {/* Upgrades Shop Button */}
          <button
            onClick={onOpenShop}
            id="open-shop-btn"
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow border border-yellow-300 transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Toko Gerobak</span>
          </button>

          {/* Panduan Cara Main Button */}
          <button
            onClick={onOpenHowToPlay}
            id="open-how-to-play-btn"
            className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow border border-sky-300 transition-transform active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Panduan Main</span>
          </button>

          {/* Audio Controls */}
          <div className="flex items-center gap-1 bg-amber-900/60 p-1 rounded-xl border border-amber-800">
            <button
              onClick={onToggleMusic}
              title={isMusicPlaying ? 'Matikan Musik Lo-Fi Warung' : 'Putar Musik Lo-Fi Warung'}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isMusicPlaying ? 'bg-amber-600 text-yellow-200' : 'text-amber-400 hover:bg-amber-800'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
              className="p-1.5 rounded-lg text-xs text-amber-300 hover:bg-amber-800 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Station Navigation Tabs (Papa's Donuteria Stasiun Bar) */}
      <div className="pt-2 flex items-center gap-2 overflow-x-auto">
        {stations.map((st) => {
          const isActive = currentStation === st.id;
          const showFryPulse = st.id === 'fry' && hasFryingDonuts;

          return (
            <button
              key={st.id}
              onClick={() => {
                sound.playStamp();
                onChangeStation(st.id);
              }}
              id={`tab-station-${st.id}`}
              className={`flex-1 min-w-[130px] px-3 py-2 rounded-xl flex items-center justify-between border-2 transition-all cursor-pointer relative ${
                isActive
                  ? `bg-gradient-to-r ${st.color} border-yellow-400 shadow-lg ring-2 ring-yellow-400/40 -translate-y-0.5`
                  : 'bg-amber-950/70 border-amber-800/80 hover:bg-amber-900/60 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-black/25 text-yellow-300' : 'bg-amber-900/50 text-amber-300'}`}>
                  {st.icon}
                </div>
                <div className="text-left">
                  <div className="text-xs font-black tracking-wide leading-tight">{st.label}</div>
                  <div className="text-[10px] text-amber-200/80 leading-tight">{st.sub}</div>
                </div>
              </div>

              {showFryPulse && (
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping absolute -top-1 -right-1" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
