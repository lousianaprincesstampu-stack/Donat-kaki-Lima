import React from 'react';
import { CustomerOrder } from '../types';
import { sound } from '../audio/soundEffects';
import { ClipboardList, ArrowRight, UserCheck, Bell } from 'lucide-react';

interface OrderStationProps {
  currentCustomer: CustomerOrder | null;
  onTakeOrder: () => void;
  onGoToDough: () => void;
  hasTakenOrder: boolean;
  onNextCustomer: () => void;
}

const getCustomerIcon = (role: string) => {
  if (role.includes('Ojol')) return '🛵';
  if (role.includes('SD')) return '🎒';
  if (role.includes('Daster')) return '🌺';
  if (role.includes('RT')) return '🕌';
  return '💼';
};

export const OrderStation: React.FC<OrderStationProps> = ({
  currentCustomer,
  onTakeOrder,
  onGoToDough,
  hasTakenOrder,
  onNextCustomer,
}) => {
  if (!currentCustomer) {
    return (
      <div className="bg-amber-950/90 p-6 rounded-xl border-2 border-amber-800 text-center text-amber-100 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-amber-300">Belum ada pembeli di depan gerobak</h3>
        <p className="text-xs text-amber-200">
          Suasana pinggir jalan sedang ramai! Bunyikan lonceng atau klakson motor untuk memanggil pembeli berikutnya.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playBell();
              onNextCustomer();
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black rounded-xl shadow-lg border-2 border-yellow-200 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer text-xs"
          >
            <Bell className="w-4 h-4" />
            <span>Lonceng Gerobak (Ting!)</span>
          </button>
          <button
            onClick={() => {
              sound.playMotorHorn();
              onNextCustomer();
            }}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg border-2 border-emerald-400 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer text-xs"
          >
            <span>🛵 Klakson Ojol (Ti-tin!)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/90 p-4 rounded-xl border-2 border-amber-700 shadow-2xl text-amber-50 space-y-3">
      {/* Customer Intro Card */}
      <div className="flex items-start gap-3 bg-amber-900/50 p-3 rounded-xl border border-amber-800">
        <div className={`w-12 h-12 rounded-xl ${currentCustomer.customerAvatar} flex items-center justify-center text-white font-black text-2xl shrink-0 shadow border border-amber-300/40`}>
          {getCustomerIcon(currentCustomer.customerRole)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-amber-200 text-sm flex items-center gap-1.5">
              <span>{currentCustomer.customerName}</span>
              <span className="text-[10px] text-emerald-400 font-normal">● Sedang di Depan Gerobak</span>
            </h3>
            <span className="text-[11px] bg-amber-800/80 text-amber-200 px-2 py-0.5 rounded font-bold border border-amber-700">
              {currentCustomer.customerRole}
            </span>
          </div>
          <p className="text-xs text-amber-100 italic mt-1 bg-amber-950/60 p-2 rounded-lg border border-amber-900/80 font-sans">
            "{currentCustomer.dialog}"
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-amber-800/80">
        <div className="flex items-center gap-3">
          <div className="text-xs text-amber-300">
            Status: {hasTakenOrder ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 inline-flex">
                <UserCheck className="w-3.5 h-3.5" /> Pesanan telah dicatat di tiket!
              </span>
            ) : (
              <span className="text-yellow-300 font-semibold">Menunggu Anda mencatat pesanan...</span>
            )}
          </div>
          <button
            onClick={() => sound.playMotorHorn()}
            title="Bunyikan Klakson Jalanan"
            className="text-[11px] px-2 py-1 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-700 flex items-center gap-1 transition-all"
          >
            <span>🛵 Ti-tin!</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!hasTakenOrder ? (
            <button
              onClick={() => {
                sound.playBell();
                onTakeOrder();
              }}
              id="take-order-btn"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black rounded-xl shadow-lg border-2 border-yellow-200 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer text-xs"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Catat Pesanan (Take Order)</span>
            </button>
          ) : (
            <button
              onClick={onGoToDough}
              id="go-dough-btn"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl shadow-lg border-2 border-emerald-300 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer text-xs animate-pulse"
            >
              <span>Mulai Buat Donat (Stasiun Cetak)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
