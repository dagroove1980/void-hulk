'use client';

import dynamic from 'next/dynamic';
import HUD from './HUD';
import CombatPanel from './CombatPanel';
import Inventory from './Inventory';
import ShopPanel from './ShopPanel';
import Minimap from './Minimap';
import GameOverScreen from './GameOverScreen';
import PerkSelectPanel from './PerkSelectPanel';
import EventPanel from './EventPanel';

const GameCanvas = dynamic(() => import('./GameCanvas'), { ssr: false });

export default function GameWrapper() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <GameCanvas />
      <HUD />
      <CombatPanel />
      <Inventory />
      <ShopPanel />
      <Minimap />
      <GameOverScreen />
      <PerkSelectPanel />
      <EventPanel />

      {/* Controls hint */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 text-[10px] text-gray-600 pointer-events-none select-none">
        Click to move | Scroll to zoom | Right-drag to pan
      </div>
    </div>
  );
}
