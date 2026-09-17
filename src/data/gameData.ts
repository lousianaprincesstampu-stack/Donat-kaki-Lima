import { CustomerOrder, UpgradeItem, DonutShape, GlazeType, ToppingType } from '../types';

export interface CustomerPersona {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  clothingColor: string;
  hatType?: 'peci' | 'helm_ojol' | 'topi_sd' | 'hijab' | 'none';
  orders: {
    glaze: GlazeType;
    topping: ToppingType;
    toppingNotes: string;
    greeting: string;
    happyFeedback: string;
  }[];
  neutralLines: string[];
  angryLines: string[];
}

export const CUSTOMER_PERSONAS: CustomerPersona[] = [
  {
    id: 'ibu_daster',
    name: 'Bu Tejo',
    role: 'Ibu Dasteran Gaul',
    avatarBg: 'bg-amber-600',
    clothingColor: '#d97706',
    hatType: 'hijab',
    orders: [
      {
        glaze: 'gula_merah',
        topping: 'gula_merah_bubuk',
        toppingNotes: 'Varian Gula Merah Aren Tradisional (Kinca & Taburan Aren)',
        greeting: 'Mas! Pesen donat kampung gula merah aren ya! Kinca arennya yang legit wangi, jangan pelit gula ya!',
        happyFeedback: 'Ya ampun joss tenan Mas! Gula merah arennya mantap legit, empuk menul-menul buat arisan!'
      },
      {
        glaze: 'gula_merah',
        topping: 'gula_merah_bubuk',
        toppingNotes: 'Varian Gula Merah Aren Tradisional (Kinca & Taburan Aren)',
        greeting: 'Mas e, donat gula merah arennya masih anget kan? Bungkus satu ya buat suguhan tamu!',
        happyFeedback: 'Wah ini baru donat gula aren asli nusantara! Wangi kelapa arennya harum banget!'
      }
    ],
    neutralLines: [
      'Hmm lumayan Mas, tapi gula arennya kurang medok sedikit.',
      'Bolehlah Mas buat cemilan sore.'
    ],
    angryLines: [
      'Aduh Mas! Saya pesen gula merah aren kok rasanya hambar/gosong begini!',
      'Keliru ini Mas, donatnya keras dan toppingnya nggak sesuai!'
    ]
  },
  {
    id: 'pak_rt',
    name: 'Pak RT Joko',
    role: 'Ketua RT Teladan',
    avatarBg: 'bg-slate-700',
    clothingColor: '#334155',
    hatType: 'peci',
    orders: [
      {
        glaze: 'gula_merah',
        topping: 'gula_merah_bubuk',
        toppingNotes: 'Varian Gula Merah Aren Tradisional (Kinca & Taburan Aren)',
        greeting: 'Assalamualaikum Mas. Mau donat kampung gula merah aren satu ya, buat nemenin kopi di pos ronda.',
        happyFeedback: 'Alhamdulillah, mantap sekali donat gula arennya Mas, manis legitnya pas dan gurih!'
      },
      {
        glaze: 'gula_merah',
        topping: 'gula_merah_bubuk',
        toppingNotes: 'Varian Gula Merah Aren Tradisional (Kinca & Taburan Aren)',
        greeting: 'Sore Mas, buatkan donat gula aren tradisional yang empuk ya untuk rapat warga RT nanti malam.',
        happyFeedback: 'Joss gandos Mas! Donat gula merahnya bener-bener khas selera warga kampung!'
      }
    ],
    neutralLines: [
      'Cukup lumayan Mas, terus tingkatkan racikan gula arennya ya.',
      'Bisa dinikmati dengan kopi hitam pos ronda.'
    ],
    angryLines: [
      'Waduh Mas, ini terlalu keras/gosong, gigi tua saya nggak kuat ini.',
      'Lho Mas, ini bukan donat gula aren pesanan saya.'
    ]
  },
  {
    id: 'bocil_adit',
    name: 'Adit',
    role: 'Bocil SD Merah Putih',
    avatarBg: 'bg-rose-600',
    clothingColor: '#e11d48',
    hatType: 'topi_sd',
    orders: [
      {
        glaze: 'mentega',
        topping: 'seres_warnawarni',
        toppingNotes: 'Varian Seres Pelangi (Krim Mentega & Seres Warna-Warni)',
        greeting: 'Om om! Beli donat kentang pake meses seres pelangi warna-warni yang buaaanyaaakk!',
        happyFeedback: 'Horeee! Seres warna-warninya banyak dan manis! Besok Adit jajan ke sini lagi!'
      },
      {
        glaze: 'mentega',
        topping: 'seres_warnawarni',
        toppingNotes: 'Varian Seres Pelangi (Krim Mentega & Seres Warna-Warni)',
        greeting: 'Om, pulang sekolah mau jajan donat meses pelangi warna warni dong!',
        happyFeedback: 'Enak bangeeett Om! Donat seres pelangi terbaik sekolahan!'
      }
    ],
    neutralLines: [
      'Hmm seresnya kurang banyak Om, tapi tetep enak sih hehe.',
      'Lumayan Om rasanya.'
    ],
    angryLines: [
      'Yaaah Om donatnya pahit gosong... Adit sedih nih!',
      'Om, kok nggak ada meses pelangi warna-warninya? Bukan pesenan Adit ini!'
    ]
  },
  {
    id: 'ojol_budi',
    name: 'Bang Budi',
    role: 'Driver Ojol',
    avatarBg: 'bg-emerald-600',
    clothingColor: '#059669',
    hatType: 'helm_ojol',
    orders: [
      {
        glaze: 'coklat',
        topping: 'coklat_kacang',
        toppingNotes: 'Varian Coklat Kacang Gurih (Coklat Leleh & Kacang Sangrai)',
        greeting: 'Halo Mas! Habis antar orderan laper nih, mau pesen donat coklat kacang satu ya!',
        happyFeedback: 'Wah gila mantap Mas! Kacangnya renyah gurih, coklatnya berasa pas buat ganjel perut ngojek!'
      },
      {
        glaze: 'coklat',
        topping: 'coklat_kacang',
        toppingNotes: 'Varian Coklat Kacang Gurih (Coklat Leleh & Kacang Sangrai)',
        greeting: 'Bang, minta donat yang hangat ya, coklat kacangnya yang mantap buat tenaga jalan!',
        happyFeedback: 'Bintang lima nih! Kacang sangrainya wangi banget, makasih ya Mas!'
      }
    ],
    neutralLines: [
      'Mayan lah Mas, masih bisa dimakan selagi hangat di atas motor.',
      'Cukup oke, tapi lain kali toppingnya lebih rapi ya!'
    ],
    angryLines: [
      'Waduh Mas, donatnya kok gosong/kurang matang gini? Sayang banget nih.',
      'Waduh Mas, pesen coklat kacang tapi jadinya malah lain.'
    ]
  },
  {
    id: 'mbak_kantoran',
    name: 'Mbak Siti',
    role: 'Karyawati Modis',
    avatarBg: 'bg-purple-600',
    clothingColor: '#9333ea',
    hatType: 'hijab',
    orders: [
      {
        glaze: 'gula_merah',
        topping: 'gula_merah_bubuk',
        toppingNotes: 'Varian Gula Merah Aren Tradisional (Kinca & Taburan Aren)',
        greeting: 'Halo Mas! Mau pesan donat kampung gula merah aren ya, kangen rasa manis legit tradisional!',
        happyFeedback: 'Wah juara donat gula arennya! Legitnya alami, nggak bikin enek, pas banget rasanya!'
      },
      {
        glaze: 'coklat',
        topping: 'coklat_kacang',
        toppingNotes: 'Varian Coklat Kacang Gurih (Coklat Leleh & Kacang Sangrai)',
        greeting: 'Mas, mau take away donat coklat kacang satu ya buat mood booster lembur di kantor!',
        happyFeedback: 'Enak bangeeet! Topping coklat kacangnya premium dan renyah!'
      },
      {
        glaze: 'mentega',
        topping: 'seres_warnawarni',
        toppingNotes: 'Varian Seres Pelangi (Krim Mentega & Seres Warna-Warni)',
        greeting: 'Mas, pesan donat seres pelangi warna warni satu ya, lucu banget liat displaynya!',
        happyFeedback: 'Gemesss dan enak banget! Seres warna warninya rapi dan manisnya pas!'
      }
    ],
    neutralLines: [
      'Rasanya oke kok Mas, cuma rada minyakan dikit.',
      'Not bad Mas, lumayan buat ngemil.'
    ],
    angryLines: [
      'Hmm maaf Mas, kayaknya salah topping atau bentuknya kurang rapi ya.',
      'Duh agak gosong dan toppingnya tertukar Mas.'
    ]
  }
];

export const AVAILABLE_UPGRADES: UpgradeItem[] = [
  {
    id: 'wajan_turbo',
    name: 'Wajan Baja Penggoreng Turbo',
    description: 'Minyak panas lebih merata, donat matang 25% lebih cepat!',
    price: 50000,
    icon: 'Flame',
    purchased: false,
    effect: 'faster_fry'
  },
  {
    id: 'lampu_gerobak',
    name: 'Lampu LED & Spanduk Baru',
    description: 'Gerobak makin terang memikat, pelanggan kasih tips +30%!',
    price: 75000,
    icon: 'Sparkles',
    purchased: false,
    effect: 'extra_tips'
  },
  {
    id: 'toples_kaca',
    name: 'Etalase Kaca & Toples Kerupuk',
    description: 'Pajangan donat lebih higienis & estetik khas jajanan lokal.',
    price: 60000,
    icon: 'Store',
    purchased: false,
    effect: 'aesthetic'
  },
  {
    id: 'radio_jadul',
    name: 'Radio Jadul Akustik',
    description: 'Memutar musik santai warung, waktu tunggu pembeli lebih sabar.',
    price: 40000,
    icon: 'Radio',
    purchased: false,
    effect: 'radio'
  }
];

export function generateRandomOrder(day: number): CustomerOrder {
  // Give high probability to Bu Tejo & Pak RT who love Gula Merah Aren!
  const persona = CUSTOMER_PERSONAS[Math.floor(Math.random() * CUSTOMER_PERSONAS.length)];
  
  // Choose shape
  const shapes: DonutShape[] = ['klasik', 'bolong', 'hati'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];

  // Choose order config tied directly to the persona's explicit desire
  const orderConfig = persona.orders[Math.floor(Math.random() * persona.orders.length)];

  return {
    id: 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    customerId: persona.id,
    customerName: persona.name,
    customerAvatar: persona.avatarBg,
    customerRole: persona.role,
    dialog: orderConfig.greeting,
    shape,
    glaze: orderConfig.glaze,
    topping: orderConfig.topping,
    toppingNotes: orderConfig.toppingNotes,
    orderTime: Date.now()
  };
}
