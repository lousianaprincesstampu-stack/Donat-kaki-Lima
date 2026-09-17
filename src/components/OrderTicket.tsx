import React from 'react';
import { CustomerOrder } from '../types';
import { Sparkles, Flame, CheckCircle, Clock } from 'lucide-react';

interface OrderTicketProps {
  order: CustomerOrder;
  isActive: boolean;
  onSelect: () => void;
}

export const OrderTicket: React.FC<OrderTicketProps> = ({ order, isActive, onSelect }) => {
  const getGlazeBadge = (glaze: string) => {
    switch (glaze) {
      case 'gula_merah':
        return { label: 'Kinca Gula Merah', color: 'bg-amber-900 text-amber-100 border-amber-800' };
      case 'coklat':
        return { label: 'Coklat Leleh', color: 'bg-stone-800 text-amber-50 border-stone-700' };
      case 'mentega':
        return { label: 'Krim Mentega', color: 'bg-amber-200 text-amber-900 border-amber-300' };
      default:
        return { label: 'Polos', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const getToppingBadge = (topping: string) => {
    switch (topping) {
      case 'seres_warnawarni':
        return {
          label: 'Seres Warna-Warni',
          color: 'bg-gradient-to-r from-rose-500 via-yellow-500 to-sky-500 text-white font-bold',
        };
      case 'coklat_kacang':
        return {
          label: 'Coklat Kacang Sangrai',
          color: 'bg-amber-800 text-amber-100 border-amber-700 font-bold',
        };
      case 'gula_merah_bubuk':
        return {
          label: 'Gula Merah Aren Asli',
          color: 'bg-amber-950 text-amber-200 border-amber-800 font-bold',
        };
      default:
        return { label: 'Tanpa Topping', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const glazeInfo = getGlazeBadge(order.glaze);
  const toppingInfo = getToppingBadge(order.topping);

  return (
    <div
      onClick={onSelect}
      id={`order-ticket-${order.id}`}
      className={`relative cursor-pointer transition-all duration-200 transform ${
        isActive
          ? 'scale-105 shadow-2xl -translate-y-1 ring-4 ring-amber-400'
          : 'hover:scale-102 opacity-90 hover:opacity-100 shadow-md'
      } w-56 bg-amber-50 rounded-b-xl border-t-8 border-t-amber-600 border-x border-b border-amber-200 p-3 text-xs font-sans select-none`}
    >
      {/* Clip pin / Gantungan tiket khas Papa's Donuteria */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-300 shadow flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
      </div>

      {/* Header Customer Info */}
      <div className="flex items-center gap-2 border-b border-dashed border-amber-300 pb-2 mb-2">
        <div className={`w-8 h-8 rounded-full ${order.customerAvatar} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
          {order.customerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-amber-950 truncate text-sm leading-tight">{order.customerName}</p>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-medium">
            {order.customerRole}
          </span>
        </div>
      </div>

      {/* Order Specification List */}
      <div className="space-y-2">
        {/* Shape */}
        <div className="flex items-center justify-between text-[11px] text-amber-900 bg-white/70 p-1.5 rounded border border-amber-100">
          <span className="font-semibold text-amber-800">Bentuk:</span>
          <span className="capitalize font-bold text-amber-950 flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-amber-600"></span>
            Donat {order.shape}
          </span>
        </div>

        {/* Frying Requirement */}
        <div className="flex items-center justify-between text-[11px] text-amber-900 bg-white/70 p-1.5 rounded border border-amber-100">
          <span className="font-semibold flex items-center gap-1 text-amber-800">
            <Flame className="w-3 h-3 text-orange-500" /> Goreng:
          </span>
          <span className="font-bold text-orange-700">Kuning Keemasan</span>
        </div>

        {/* Glaze */}
        <div className="flex items-center justify-between text-[11px] text-amber-900 bg-white/70 p-1.5 rounded border border-amber-100">
          <span className="font-semibold text-amber-800">Olesan:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${glazeInfo.color}`}>
            {glazeInfo.label}
          </span>
        </div>

        {/* Topping */}
        <div className="text-[11px] bg-white/80 p-2 rounded border border-amber-200">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Taburan:
            </span>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] text-center shadow-xs border ${toppingInfo.color}`}>
            {toppingInfo.label}
          </div>
        </div>
      </div>

      {/* Perforated bottom ticket edge */}
      <div className="mt-3 pt-2 border-t border-dashed border-amber-300 flex justify-between items-center text-[10px] text-amber-700 font-mono">
        <span>Tiket #{order.id.slice(-4)}</span>
        {isActive ? (
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle className="w-3 h-3" /> Aktif
          </span>
        ) : (
          <span className="text-amber-600">Klik untuk pilih</span>
        )}
      </div>
    </div>
  );
};
