import React, { useState, useEffect } from 'react';
import { Station, DonutItem, CustomerOrder, UpgradeItem } from './types';
import { AVAILABLE_UPGRADES, generateRandomOrder } from './data/gameData';
import { sound } from './audio/soundEffects';
import { BookOpen } from 'lucide-react';

// Components
import { ThreeCanvas } from './components/ThreeCanvas';
import { GameHUD } from './components/GameHUD';
import { OrderTicket } from './components/OrderTicket';
import { OrderStation } from './components/OrderStation';
import { DoughStation } from './components/DoughStation';
import { FryStation } from './components/FryStation';
import { ToppingStation } from './components/ToppingStation';
import { CustomerServiceModal } from './components/CustomerServiceModal';
import { GerobakShopModal } from './components/GerobakShopModal';
import { HowToPlayModal } from './components/HowToPlayModal';

export default function App() {
  // Navigation & Station State
  const [currentStation, setCurrentStation] = useState<Station>('order');

  // Customer & Orders State
  const [currentCustomer, setCurrentCustomer] = useState<CustomerOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<CustomerOrder | null>(null);
  const [orderQueue, setOrderQueue] = useState<CustomerOrder[]>([]);
  const [hasTakenOrder, setHasTakenOrder] = useState<boolean>(false);

  // Donuts State
  const [fryingDonuts, setFryingDonuts] = useState<DonutItem[]>([]);
  const [activeToppingDonut, setActiveToppingDonut] = useState<DonutItem | null>(null);

  // Modals & Serving State
  const [servingData, setServingData] = useState<{ order: CustomerOrder; donut: DonutItem } | null>(null);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  // Economy & Progression
  const [money, setMoney] = useState<number>(20000); // Start with Rp 20.000
  const [day, setDay] = useState<number>(1);
  const [ordersServedCount, setOrdersServedCount] = useState<number>(0);
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>(AVAILABLE_UPGRADES);

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Particle Trigger for 3D Topping
  const [toppingParticlesTrigger, setToppingParticlesTrigger] = useState<{ type: string; count: number } | undefined>();

  // Spawn initial customer when game starts
  useEffect(() => {
    const firstOrder = generateRandomOrder(1);
    setCurrentCustomer(firstOrder);
    sound.playBell();
  }, []);

  // Frying speed modifier from upgrades
  const frySpeedMultiplier = upgrades.find((u) => u.id === 'wajan_turbo' && u.purchased) ? 1.3 : 1.0;

  // Handler: Player takes customer order at order station
  const handleTakeOrder = () => {
    if (!currentCustomer) return;
    setHasTakenOrder(true);
    setActiveOrder(currentCustomer);
    setOrderQueue((prev) => {
      if (prev.some((o) => o.id === currentCustomer.id)) return prev;
      return [...prev, currentCustomer];
    });
  };

  // Handler: When dough is created at dough station
  const handleDoughCreated = (newDonut: DonutItem) => {
    setFryingDonuts((prev) => [...prev, newDonut]);
    setCurrentStation('fry');
  };

  // Handler: Update frying donut
  const handleUpdateFryingDonut = (updated: DonutItem) => {
    setFryingDonuts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    if (activeToppingDonut && activeToppingDonut.id === updated.id) {
      setActiveToppingDonut(updated);
    }
  };

  // Handler: Select donut from fry rack to move to topping station
  const handleSelectForTopping = (donut: DonutItem) => {
    setActiveToppingDonut(donut);
    setCurrentStation('topping');
  };

  // Handler: Update donut decoration at topping station
  const handleUpdateToppingDonut = (updated: DonutItem) => {
    setActiveToppingDonut(updated);
    setFryingDonuts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // Handler: Finished donut ready to be served to customer!
  const handleFinishDonut = (finishedDonut: DonutItem) => {
    if (!activeOrder) {
      alert('Pilih tiket pesanan terlebih dahulu!');
      return;
    }
    setServingData({
      order: activeOrder,
      donut: finishedDonut,
    });
  };

  // Handler: Customer reviewed, collect money & spawn next customer
  const handleCollectEarnings = (earnedTotal: number) => {
    setMoney((prev) => prev + earnedTotal);
    const newCount = ordersServedCount + 1;
    setOrdersServedCount(newCount);

    // Remove served donut and order
    if (servingData) {
      setFryingDonuts((prev) => prev.filter((d) => d.id !== servingData.donut.id));
      setOrderQueue((prev) => prev.filter((o) => o.id !== servingData.order.id));
    }
    setActiveToppingDonut(null);
    setServingData(null);

    // Progress day every 4 customers
    if (newCount % 4 === 0) {
      setDay((prev) => prev + 1);
    }

    // Spawn next customer
    setHasTakenOrder(false);
    const nextOrder = generateRandomOrder(day);
    setCurrentCustomer(nextOrder);
    setActiveOrder(nextOrder);
    setCurrentStation('order');
    if (nextOrder.customerRole.includes('Ojol')) {
      sound.playMotorHorn();
    } else {
      sound.playBell();
    }
  };

  // Handler: Spawn next customer manually
  const handleNextCustomerManual = () => {
    const nextOrder = generateRandomOrder(day);
    setCurrentCustomer(nextOrder);
    setActiveOrder(nextOrder);
    setHasTakenOrder(false);
    if (nextOrder.customerRole.includes('Ojol')) {
      sound.playMotorHorn();
    } else {
      sound.playBell();
    }
  };

  // Handler: Buy Upgrade
  const handleBuyUpgrade = (upgradeId: string) => {
    const item = upgrades.find((u) => u.id === upgradeId);
    if (!item || money < item.price) return;

    setMoney((prev) => prev - item.price);
    setUpgrades((prev) =>
      prev.map((u) => (u.id === upgradeId ? { ...u, purchased: true } : u))
    );

    // If bought radio, trigger background music
    if (upgradeId === 'radio_jadul') {
      sound.toggleMusic(true);
      setIsMusicPlaying(true);
    }
  };

  // Audio toggles
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.setMute(nextMute);
  };

  const handleToggleMusic = () => {
    sound.toggleMusic();
    setIsMusicPlaying(sound.isMusicPlaying);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-amber-950 font-sans text-slate-900 select-none overflow-x-hidden">
      {/* Game HUD Bar */}
      <GameHUD
        currentStation={currentStation}
        onChangeStation={setCurrentStation}
        day={day}
        money={money}
        ordersServedCount={ordersServedCount}
        isMuted={isMuted}
        isMusicPlaying={isMusicPlaying}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        hasFryingDonuts={fryingDonuts.some((d) => !d.isCooked)}
      />

      {/* Hanging Order Tickets Rack (Papa's Donuteria Signature Ticket Bar) */}
      <div className="bg-amber-900/90 border-b-2 border-amber-800 px-4 py-2 flex items-start gap-4 overflow-x-auto min-h-[56px] shadow-inner">
        <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wider self-center shrink-0 pr-2 border-r border-amber-700">
          Tiket Pesanan:
        </div>

        {orderQueue.length === 0 ? (
          <div className="text-xs text-amber-300 italic self-center">
            Belum ada tiket yang dicatat. Pergi ke Antrian Pembeli untuk mencatat pesanan.
          </div>
        ) : (
          <div className="flex items-start gap-3">
            {orderQueue.map((order) => (
              <OrderTicket
                key={order.id}
                order={order}
                isActive={activeOrder?.id === order.id}
                onSelect={() => setActiveOrder(order)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Step-by-Step Guidance Banner */}
      <div className="bg-amber-900/40 border-b border-amber-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-yellow-400 text-amber-950 font-black flex items-center justify-center text-[11px] shrink-0 shadow-xs">
            {currentStation === 'order' ? '1' : currentStation === 'dough' ? '2' : currentStation === 'fry' ? '3' : '4'}
          </span>
          <div className="text-amber-100 font-medium">
            {currentStation === 'order' && (
              <span>
                <strong className="text-yellow-300">Langkah 1:</strong> Klik <span className="text-amber-200 font-bold bg-amber-900/80 px-1.5 py-0.5 rounded">"Catat Pesanan"</span> untuk mengambil pesanan pembeli ke tiket atas.
              </span>
            )}
            {currentStation === 'dough' && (
              <span>
                <strong className="text-yellow-300">Langkah 2:</strong> Pilih cetakan adonan sesuai tiket, klik <span className="text-amber-200 font-bold bg-amber-900/80 px-1.5 py-0.5 rounded">"Potong Donat"</span> lalu kirim ke penggorengan.
              </span>
            )}
            {currentStation === 'fry' && (
              <span>
                <strong className="text-yellow-300">Langkah 3:</strong> Tunggu indikator kuning keemasan (50%-70%), klik <span className="text-amber-200 font-bold bg-amber-900/80 px-1.5 py-0.5 rounded">"Balik Donat"</span> dengan sumpit. Jika sudah matang, tiriskan!
              </span>
            )}
            {currentStation === 'topping' && (
              <span>
                <strong className="text-yellow-300">Langkah 4:</strong> Celup glaze & tabur topping sesuai tiket, lalu klik <span className="text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded">"Sajikan Donat"</span>!
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsHowToPlayOpen(true)}
          className="inline-flex items-center gap-1.5 text-yellow-300 hover:text-yellow-200 underline font-bold cursor-pointer text-xs ml-auto"
        >
          <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
          <span>Buku Panduan Cara Main Lengkap</span>
        </button>
      </div>

      {/* Main Game Arena (Vertically scrollable on smaller displays) */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pb-8">
        {/* Left / Center 3D Interactive Viewport (Three.js Canvas) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[360px] sm:h-[440px] lg:h-[560px] relative rounded-2xl overflow-hidden border-2 border-amber-800 shadow-2xl bg-amber-950">
          <ThreeCanvas
            currentStation={currentStation}
            activeDonut={activeToppingDonut}
            activeOrder={activeOrder}
            fryingDonuts={fryingDonuts}
            toppingParticlesTrigger={toppingParticlesTrigger}
          />

          {/* Quick 3D Station Guidance Overlay Tag */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-amber-200 px-3 py-1.5 rounded-xl text-xs border border-amber-500/40 pointer-events-none shadow-md">
            {currentStation === 'order' && 'Tampilan 3D: Gerobak Pinggir Jalan & Pembeli'}
            {currentStation === 'dough' && 'Tampilan 3D: Meja Cetak Adonan Kentang'}
            {currentStation === 'fry' && 'Tampilan 3D: Wajan Kuali Minyak Panas Mendidih'}
            {currentStation === 'topping' && 'Tampilan 3D: Meja Hias Topping Donat Interaktif'}
          </div>
        </div>

        {/* Right Station Interactive Controls Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3">
          {currentStation === 'order' && (
            <OrderStation
              currentCustomer={currentCustomer}
              onTakeOrder={handleTakeOrder}
              onGoToDough={() => setCurrentStation('dough')}
              hasTakenOrder={hasTakenOrder}
              onNextCustomer={handleNextCustomerManual}
            />
          )}

          {currentStation === 'dough' && (
            <DoughStation
              onDoughCreated={handleDoughCreated}
              targetShape={activeOrder?.shape}
            />
          )}

          {currentStation === 'fry' && (
            <FryStation
              fryingDonuts={fryingDonuts}
              onUpdateDonut={handleUpdateFryingDonut}
              onSelectForTopping={handleSelectForTopping}
              frySpeedMultiplier={frySpeedMultiplier}
            />
          )}

          {currentStation === 'topping' && (
            <>
              {activeToppingDonut ? (
                <ToppingStation
                  donut={activeToppingDonut}
                  activeOrder={activeOrder}
                  onUpdateDonut={handleUpdateToppingDonut}
                  onFinishDonut={handleFinishDonut}
                  onTriggerParticles={(type) => setToppingParticlesTrigger({ type, count: Date.now() })}
                />
              ) : (
                <div className="bg-amber-950/90 text-amber-100 p-6 rounded-xl border-2 border-amber-800 text-center shadow-xl space-y-3">
                  <p className="text-sm font-bold text-amber-300">Belum ada donat matang di meja topping</p>
                  <p className="text-xs text-amber-200">
                    Goreng dan tiriskan donat kentang terlebih dahulu di Stasiun Penggorengan.
                  </p>
                  <button
                    onClick={() => setCurrentStation('fry')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Ke Stasiun Penggorengan
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Serving & Scoring Modal */}
      {servingData && (
        <CustomerServiceModal
          order={servingData.order}
          donut={servingData.donut}
          onProceed={handleCollectEarnings}
        />
      )}

      {/* Gerobak Upgrades Shop Modal */}
      {isShopOpen && (
        <GerobakShopModal
          money={money}
          upgrades={upgrades}
          onBuyUpgrade={handleBuyUpgrade}
          onClose={() => setIsShopOpen(false)}
        />
      )}

      {/* Buku Panduan Cara Bermain Modal */}
      {isHowToPlayOpen && (
        <HowToPlayModal
          onClose={() => setIsHowToPlayOpen(false)}
        />
      )}
    </div>
  );
}
