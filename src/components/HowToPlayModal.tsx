import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Users,
  Disc,
  Flame,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Lightbulb,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const steps = [
    {
      id: 'step1',
      title: '1. Antrian Pembeli (Depan Gerobak)',
      short: 'Catat Pesanan',
      icon: <Users className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-600 to-amber-800',
      badge: 'Langkah Awal',
      summary: 'Sambut pelanggan gerobak dan catat tiket pesanannya.',
      details: [
        'Pembeli lokal (seperti Bang Budi Ojol, Bu Tejo dasteran, Adit bocil SD, Pak RT, dan Mbak Siti) akan antre di depan gerobak.',
        'Klik tombol emas "Catat Pesanan (Take Order)" untuk mendengarkan pesanan mereka.',
        'Tiket pesanan otomatis tergantung di rak atas yang memuat bentuk donat, jenis celupan glaze, dan taburan topping.',
      ],
      proTip: 'Anda selalu bisa mengklik tiket di rak gantung atas kapan saja jika lupa pesanan pembeli!',
    },
    {
      id: 'step2',
      title: '2. Stasiun Cetak Adonan (Dough Station)',
      short: 'Cetak Bentuk',
      icon: <Disc className="w-5 h-5 text-yellow-400" />,
      color: 'from-yellow-600 to-amber-700',
      badge: 'Langkah Kedua',
      summary: 'Pilih cetakan dan potong adonan donat kentang khas.',
      details: [
        'Cek bentuk yang diminta di tiket pesanan:',
        '• Donat Bolong Klasik (lubang tengah khas)',
        '• Donat Bulat Penuh (montok tanpa lubang)',
        '• Donat Hati Cinta (bentuk hati manis)',
        'Klik tombol cetakan yang sesuai, lalu tekan tombol "Potong Donat (Cetakan)".',
        'Tekan "Kirim ke Wajan Penggorengan" untuk memasukkan donat ke kuali minyak panas.',
      ],
      proTip: 'Bentuk adonan yang pas dengan pesanan akan memberikan nilai Bentuk 100% sempurna!',
    },
    {
      id: 'step3',
      title: '3. Wajan Penggorengan (Fry Station)',
      short: 'Goreng di Kuali',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      color: 'from-orange-600 to-red-800',
      badge: 'Langkah Ketiga',
      summary: 'Goreng kedua sisi hingga kuning keemasan menggunakan sumpit.',
      details: [
        'Donat dimasukkan ke kuali minyak panas mendidih.',
        'Perhatikan bilah kematangan Sisi A dan Sisi B:',
        '• 0% - 30%: Masih mentah',
        '• 30% - 49%: Mulai mengembang',
        '• 50% - 70%: KUNING KEEMASAN (Zona Sempurna!)',
        '• 71% - 84%: Terlalu coklat / gosong dikit',
        '• >85%: HANGUS GOSONG!',
        'Saat Sisi A mencapai zona hijau (50%-70%), klik "Balik Donat (Sumpit)" untuk membalik ke Sisi B.',
        'Saat Sisi B juga sudah matang, segera tekan "Tiriskan ke Rak", lalu "Bawa ke Meja Topping".',
      ],
      proTip: 'Jangan tinggalkan donat terlalu lama di minyak panas agar tidak gosong!',
    },
    {
      id: 'step4',
      title: '4. Stasiun Hias & Topping (Topping Station)',
      short: 'Glaze & Taburan',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-600 to-teal-800',
      badge: 'Langkah Keempat',
      summary: 'Celupkan ke glaze kinca/krim/coklat dan taburkan meises/kacang.',
      details: [
        'Donat matang ditaruh di atas meja putar 3D interaktif.',
        'PILIH GLAZE (Celupan Dasar):',
        '• Kinca Gula Merah (aren manis legit)',
        '• Krim Putih Manis',
        '• Coklat Leleh Pekat Kaki Lima',
        'TABUR TOPPING (Tekan beberapa kali untuk taburan merata):',
        '• Gula Aren Bubuk',
        '• Seres Warna-Warni Pelangi',
        '• Kacang Tanah Sangrai Cincang',
        'Anda bisa memutar donat di kanvas 3D untuk melihat tampilannya dari segala sudut.',
        'Jika sudah selesai dan cocok dengan tiket pesanan, tekan tombol hijau "Sajikan Donat ke Pembeli"!',
      ],
      proTip: 'Kombinasi rasa yang tepat sesuai selera pembeli akan menghasilkan skor topping sempurna!',
    },
    {
      id: 'step5',
      title: '5. Penilaian, Uang Tip Rupiah, & Toko Gerobak',
      short: 'Uang & Upgrade',
      icon: <Award className="w-5 h-5 text-yellow-300" />,
      color: 'from-amber-600 to-yellow-600',
      badge: 'Hasil & Belanja',
      summary: 'Dapatkan skor bintang, uang kas, dan upgrade gerobak donat.',
      details: [
        'Pembeli akan mengevaluasi 3 aspek secara transparan: Bentuk Adonan, Tingkat Kematangan, dan Topping.',
        'Skor tinggi (bintang 4-5) memberikan UANG TIP RUPIAH ekstra yang berlimpah!',
        'Buka "Toko Gerobak" di pojok kanan atas untuk membeli upgrade:',
        '• Wajan Turbo: Menggoreng 30% lebih cepat',
        '• Lampu LED Terang: Suasana gerobak makin hidup',
        '• Etalase Kaca Display: Memikat pembeli memberi tip lebih banyak',
        '• Radio Jadul: Memutar musik lo-fi gamelan santai saat berjualan',
      ],
      proTip: 'Kumpulkan kas sebanyak-banyaknya untuk menjadi juragan donat terlaris di kampung!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-amber-900 via-amber-950 to-amber-950 border-3 border-amber-600 rounded-3xl max-w-2xl w-full text-amber-50 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 p-4 sm:p-5 border-b-2 border-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-yellow-300 tracking-tight flex items-center gap-2">
                PANDUAN CARA BERMAIN
                <span className="text-[10px] font-bold bg-amber-600/80 text-white px-2 py-0.5 rounded-full border border-yellow-300/40">
                  Donuteria Kampung
                </span>
              </h2>
              <p className="text-xs text-amber-200">
                Langkah mudah menjadi juragan gerobak donat kentang terlaris!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-950/70 hover:bg-rose-900/80 text-amber-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-amber-700"
            title="Tutup Panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Step Tabs */}
        <div className="bg-amber-950/90 border-b border-amber-800/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
          {steps.map((s, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md border border-yellow-200'
                    : 'bg-amber-900/50 text-amber-300 hover:bg-amber-800/60 border border-amber-800'
                }`}
              >
                <span>{s.short}</span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Active Step Banner */}
          <div className={`p-4 rounded-2xl bg-gradient-to-r ${steps[activeTab].color} border border-yellow-400/40 shadow-lg text-white`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-md">
                {steps[activeTab].badge}
              </span>
              <div className="p-1 rounded-lg bg-black/20">{steps[activeTab].icon}</div>
            </div>
            <h3 className="text-base sm:text-lg font-black">{steps[activeTab].title}</h3>
            <p className="text-xs text-amber-100/90 mt-1">{steps[activeTab].summary}</p>
          </div>

          {/* Detailed Instructions List */}
          <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/70 space-y-2.5">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
              Instruksi Langkah Demi Langkah:
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-amber-100">
              {steps[activeTab].details.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">▸</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tip Box */}
          <div className="bg-amber-950/80 border border-yellow-500/40 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-yellow-200">
            <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-yellow-300 font-bold">Tips Rahasia Juragan: </strong>
              <span>{steps[activeTab].proTip}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-amber-950 p-4 border-t-2 border-amber-800 flex items-center justify-between gap-3">
          <button
            onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
            disabled={activeTab === 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 0
                ? 'opacity-40 cursor-not-allowed text-amber-500'
                : 'bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="text-xs text-amber-400 font-medium">
            Langkah {activeTab + 1} dari {steps.length}
          </div>

          {activeTab < steps.length - 1 ? (
            <button
              onClick={() => setActiveTab((prev) => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow border border-yellow-200 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Lanjut</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg border-2 border-emerald-300 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Siap Main! Tutup Panduan</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
