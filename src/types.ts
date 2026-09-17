export type Station = 'order' | 'dough' | 'fry' | 'topping' | 'serve';

export type DonutShape = 'klasik' | 'bolong' | 'hati' | 'twist';

export type GlazeType = 'none' | 'gula_merah' | 'coklat' | 'mentega';

export type ToppingType = 'seres_warnawarni' | 'coklat_kacang' | 'gula_merah_bubuk';

export interface DonutItem {
  id: string;
  shape: DonutShape;
  // Dough
  doughDone: boolean;
  // Frying
  frySideA: number; // 0 to 100 (50 is perfect)
  frySideB: number; // 0 to 100
  currentSide: 'A' | 'B';
  isFrying: boolean;
  isBurnt: boolean;
  isCooked: boolean;
  // Glaze & Toppings
  glaze: GlazeType;
  toppings: {
    type: ToppingType;
    coverage: number; // 0 to 100%
    positions: { x: number; y: number; z: number; color?: string }[];
  }[];
  served: boolean;
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  customerRole: string; // e.g., 'Mas Ojol', 'Bocil SD', 'Ibu Dasteran', 'Pak RT'
  dialog: string;
  shape: DonutShape;
  glaze: GlazeType;
  topping: ToppingType;
  toppingNotes: string;
  orderTime: number;
}

export interface ScoreDetail {
  doughScore: number; // 0 - 100
  fryScore: number;   // 0 - 100
  toppingScore: number; // 0 - 100
  totalScore: number;  // 0 - 100
  stars: number; // 1 - 5
  moneyEarned: number; // in IDR (Rp)
  tipEarned: number;   // in IDR (Rp)
  feedbackText: string;
}

export interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  purchased: boolean;
  effect: 'faster_fry' | 'extra_tips' | 'aesthetic' | 'radio';
}

export interface DayStats {
  day: number;
  customersServed: number;
  moneyEarned: number;
  reputation: number;
}
