import React, { useEffect } from 'react';
import { CustomerOrder, DonutItem, ScoreDetail } from '../types';
import { sound } from '../audio/soundEffects';
import confetti from 'canvas-confetti';
import { Star, CheckCircle, ArrowRight, DollarSign, Award, ThumbsUp, AlertCircle } from 'lucide-react';

interface CustomerServiceModalProps {
  order: CustomerOrder;
  donut: DonutItem;
  onProceed: (earnedMoney: number) => void;
}

const getCustomerIcon = (role: string) => {
  if (role.includes('Ojol')) return '🛵';
  if (role.includes('SD')) return '🎒';
  if (role.includes('Daster')) return '🌺';
  if (role.includes('RT')) return '🕌';
  return '💼';
};

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  order,
  donut,
  onProceed,
}) => {
  // Calculate Papa's style scores
  const calculateScores = (): ScoreDetail => {
    // 1. Dough Score (Bentuk sesuai pesanan?)
    let doughScore = 100;
    if (donut.shape !== order.shape) {
      doughScore = 50; // Wrong shape penalty
    }

    // 2. Fry Score (Sisi A & B ideal di 50-65)
    let fryScore = 100;
    if (donut.isBurnt) {
      fryScore = 20;
    } else {
      const diffA = Math.abs(donut.frySideA - 55);
      const diffB = Math.abs(donut.frySideB - 55);
      const penalty = (diffA + diffB) * 1.2;
      fryScore = Math.max(10, Math.round(100 - penalty));
    }

    // 3. Topping Score (Glaze & Topping yang diminta cocok?)
    let toppingScore = 100;

    const glazeMatches = donut.glaze === order.glaze;
    if (!glazeMatches) {
      if (donut.glaze === 'none') {
        toppingScore -= 25;
      } else {
        toppingScore -= 30;
      }
    }

    const matchingTopping = donut.toppings.find((t) => t.type === order.topping);
    if (!matchingTopping) {
      // Jika glaze gula merah sudah pas untuk pesanan gula merah, penalti lebih ringan
      if (order.glaze === 'gula_merah' && donut.glaze === 'gula_merah') {
        toppingScore -= 15;
      } else {
        toppingScore -= 35;
      }
    } else {
      if (matchingTopping.coverage < 25) {
        toppingScore -= 10;
      }
    }

    // Check if unwanted toppings were added
    const unwanted = donut.toppings.filter((t) => t.type !== order.topping);
    if (unwanted.length > 0) {
      toppingScore -= 15 * unwanted.length;
    }
    toppingScore = Math.max(15, Math.min(100, toppingScore));

    // Weighted Overall
    const totalScore = Math.round(doughScore * 0.2 + fryScore * 0.4 + toppingScore * 0.4);

    // Stars
    let stars = 1;
    if (totalScore >= 90) stars = 5;
    else if (totalScore >= 75) stars = 4;
    else if (totalScore >= 60) stars = 3;
    else if (totalScore >= 40) stars = 2;

    // Money in IDR
    const basePrice = 10000;
    const tip = Math.round((totalScore / 100) * 8000 + (stars === 5 ? 5000 : 0));
    const moneyEarned = basePrice + tip;

    // Feedback text
    let feedbackText = 'Donatnya enak banget, pas empuknya!';
    if (totalScore >= 85) {
      if (order.topping === 'gula_merah_bubuk') {
        feedbackText = order.customerRole.includes('Daster')
          ? 'Joss tenan Mas! Gula merah arennya wangi legit, empuk menul-menul buat suguhan arisan!'
          : order.customerRole.includes('RT')
          ? 'Alhamdulillah, mantap sekali donat gula arennya Mas, manis legitnya pas dan gurih!'
          : 'Luar biasa nikmat legit gula merah arennya Mas, khas donat kampung nusantara!';
      } else if (order.topping === 'seres_warnawarni') {
        feedbackText = order.customerRole.includes('SD')
          ? 'Horeee! Donat seres pelangi warna warni kesukaan Adit, makasih banyak Om!'
          : 'Gemes dan enak banget! Seres warna warninya rapi dan manisnya pas!';
      } else {
        feedbackText = order.customerRole.includes('Ojol')
          ? 'Wah gila mantap Mas! Coklat kacangnya renyah gurih, pas banget buat tenaga ngojek!'
          : 'Enak bangeeet! Topping coklat kacangnya premium dan renyah!';
      }
    } else if (totalScore >= 60) {
      if (donut.glaze !== order.glaze || !donut.toppings.some((t) => t.type === order.topping)) {
        feedbackText = `Lumayan enak Mas, tapi tadi saya pesen ${order.toppingNotes}, agak beda glaze/toppingnya ya.`;
      } else {
        feedbackText = 'Lumayan enak Mas, tapi kematangan atau kerapian taburannya bisa ditingkatkan lagi ya.';
      }
    } else {
      if (donut.isBurnt) {
        feedbackText = 'Aduh Mas, donatnya rada gosong/pahit nih... Lain kali hati-hati ya.';
      } else if (donut.glaze !== order.glaze || !donut.toppings.some((t) => t.type === order.topping)) {
        feedbackText = `Lho Mas, saya kan pesen ${order.toppingNotes}, kok dikasih topping yang lain sih?`;
      } else {
        feedbackText = 'Rasanya kurang pas dan belum matang sempurna.';
      }
    }

    return {
      doughScore,
      fryScore,
      toppingScore,
      totalScore,
      stars,
      moneyEarned: basePrice,
      tipEarned: tip,
      feedbackText,
    };
  };

  const scores = calculateScores();

  useEffect(() => {
    if (scores.totalScore >= 75) {
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
      });
    } else {
      sound.playCash();
    }
  }, [scores.totalScore]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        id="scoring-card"
        className="w-full max-w-lg bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl shadow-2xl border-4 border-amber-500 overflow-hidden text-slate-800"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 text-center relative shadow-md">
          <h2 className="text-xl font-extrabold tracking-wide uppercase font-sans flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-yellow-300" /> Penilaian Pembeli
          </h2>
          <p className="text-xs text-amber-100 mt-0.5">
            Gerobak Donat Kentang Kampung - Ulasan Pelanggan
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer Dialogue Quote Bubble */}
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-xs border border-amber-200">
            <div className={`w-12 h-12 rounded-full ${order.customerAvatar} flex items-center justify-center text-white font-black text-2xl shrink-0 shadow border border-amber-300`}>
              {getCustomerIcon(order.customerRole)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-950 text-sm">{order.customerName}</h4>
                <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                  {order.customerRole}
                </span>
              </div>
              <p className="text-xs text-amber-900/90 italic mt-1 font-serif">
                "{scores.feedbackText}"
              </p>
            </div>
          </div>

          {/* Papa's Donuteria Style Score Bars */}
          <div className="space-y-2.5 bg-amber-100/60 p-4 rounded-xl border border-amber-200">
            {/* Dough Score */}
            <div>
              <div className="flex justify-between text-xs font-bold text-amber-950 mb-1">
                <span>Bentuk Adonan (Dough)</span>
                <span className="font-mono text-amber-800">{scores.doughScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.doughScore}%` }}
                />
              </div>
            </div>

            {/* Fry Score */}
            <div>
              <div className="flex justify-between text-xs font-bold text-amber-950 mb-1">
                <span>Kematangan Goreng (Fry)</span>
                <span className="font-mono text-orange-700">{scores.fryScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    scores.fryScore >= 70 ? 'bg-orange-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${scores.fryScore}%` }}
                />
              </div>
            </div>

            {/* Topping Score */}
            <div>
              <div className="flex justify-between text-xs font-bold text-amber-950 mb-1">
                <span>Ketepatan & Kerapian Topping</span>
                <span className="font-mono text-emerald-700">{scores.toppingScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.toppingScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stars & Overall Result */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200 shadow-xs">
            <div>
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Total Nilai</div>
              <div className="text-2xl font-black text-amber-950 font-mono">{scores.totalScore}%</div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${
                    s <= scores.stars ? 'text-amber-400 fill-amber-400 drop-shadow' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-100/80 p-3 rounded-xl border border-amber-200 text-center">
              <span className="text-[11px] font-semibold text-amber-800">Harga Donat</span>
              <p className="text-sm font-extrabold text-amber-950 font-mono">
                Rp {scores.moneyEarned.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-emerald-100/80 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-[11px] font-semibold text-emerald-800">Uang Tip Rupiah</span>
              <p className="text-sm font-extrabold text-emerald-700 font-mono">
                + Rp {scores.tipEarned.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={() => {
              sound.playCash();
              onProceed(scores.moneyEarned + scores.tipEarned);
            }}
            id="collect-earnings-btn"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl shadow-lg border-2 border-emerald-300 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer text-sm"
          >
            <DollarSign className="w-5 h-5 text-yellow-300" />
            <span>Terima Pembayaran & Lanjut Pelanggan Berikutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
