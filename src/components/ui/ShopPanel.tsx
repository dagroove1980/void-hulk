'use client';

import { useGameStore } from '@/store/gameStore';
import { GamePhase, ItemType, Rarity } from '@/game/types';

export default function ShopPanel() {
  const phase = useGameStore((s) => s.phase);
  const player = useGameStore((s) => s.player);
  const shopItems = useGameStore((s) => s.shopItems);
  const buyItem = useGameStore((s) => s.buyItem);
  const leaveShop = useGameStore((s) => s.leaveShop);

  if (phase !== GamePhase.SHOP) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-950 border border-green-900/50 rounded-xl w-[400px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-green-950/30">
          <h2 className="text-lg font-bold text-green-400 uppercase tracking-wider">Salvage Terminal</h2>
          <p className="text-xs text-gray-400 mt-1">
            Scrap available: <span className="text-orange-400 font-bold">{player.scrap}</span>
          </p>
        </div>

        {/* Items */}
        <div className="p-3 space-y-2 max-h-[50vh] overflow-y-auto">
          {shopItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">Sold out.</div>
          ) : (
            shopItems.map((item) => {
              const canBuy = player.scrap >= item.value && player.inventory.length < player.inventorySize;
              return (
                <div key={item.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">{item.type}</div>
                      <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                      {item.type === ItemType.WEAPON && (
                        <div className="text-xs text-red-400 mt-0.5">+{item.attackBonus} Attack Dice</div>
                      )}
                      {item.type === ItemType.ARMOR && (
                        <div className="text-xs text-blue-400 mt-0.5">
                          +{item.defenseBonus} DEF{item.maxHpBonus > 0 ? `, +${item.maxHpBonus} HP` : ''}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => buyItem(item.id)}
                      disabled={!canBuy}
                      className={`ml-3 px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0
                        ${canBuy
                          ? 'bg-green-900/60 text-green-300 hover:bg-green-800 border border-green-700'
                          : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                        }`}
                    >
                      {item.value} SCRAP
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Leave */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={leaveShop}
            className="w-full py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold uppercase tracking-wider transition"
          >
            Leave Terminal
          </button>
        </div>
      </div>
    </div>
  );
}

function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case Rarity.COMMON: return 'text-gray-300';
    case Rarity.UNCOMMON: return 'text-green-400';
    case Rarity.RARE: return 'text-blue-400';
    case Rarity.LEGENDARY: return 'text-yellow-400';
  }
}
