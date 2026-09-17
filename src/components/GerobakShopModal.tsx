import React from 'react';
import { UpgradeItem } from '../types';
import { sound } from '../audio/soundEffects';
import { ShoppingBag, X, Flame, Sparkles, Store, Radio, Check } from 'lucide-react';

interface GerobakShopModalProps {
  money: number;
  upgrades: UpgradeItem[];
  onBuyUpgrade: (upgradeId: string) => void;
  onClose: () => void;
}

export const GerobakShopModal: React.FC<GerobakShopModalProps> = ({
  money,
  upgrades,
  onBuyUpgrade,
  onClose,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-500" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-yellow-400" />;
      case 'Store':
        return <Store className="w-6 h-6 text-emerald-400" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-sky-400" />;
      default:
        return <ShoppingBag className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        id="shop-modal"
        className="w-full max-w-xl bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl shadow-2xl border-4 border-amber-600 overflow-hidden text-slate-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-white p-4 flex items-center justify-between border-b-2 border-amber-600">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-extrabold text-base tracking-wide uppercase font-sans">
                Toko Perlengkapan Gerobak Donat
              </h3>
              <p className="text-xs text-amber-200">Upgrade peralatan gerobak untuk mempercepat kerja & tambah tip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-amber-600 text-amber-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance bar */}
        <div className="bg-amber-100/90 px-5 py-2.5 flex items-center justify-between border-b border-amber-200 text-xs">
          <span className="text-amber-900 font-semibold">Uang Kas Gerobak Tersedia:</span>
          <span className="font-mono font-black text-emerald-800 text-sm">
            Rp {money.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Upgrade Items List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {upgrades.map((item) => {
            const canAfford = money >= item.price;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  item.purchased
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : 'bg-white border-amber-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300 shadow-inner">
                    {getIcon(item.icon)}
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm leading-tight">{item.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                    <span className="font-mono font-bold text-xs text-amber-800 mt-1 inline-block">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div>
                  {item.purchased ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300">
                      <Check className="w-4 h-4 text-emerald-600" /> Terpasang
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          sound.playCash();
                          onBuyUpgrade(item.id);
                        }
                      }}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow active:scale-95'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Beli Upgrade
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-amber-100/50 p-3 border-t border-amber-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-800 hover:bg-amber-700 text-amber-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup Toko
          </button>
        </div>
      </div>
    </div>
  );
};
