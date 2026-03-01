'use client';

import { useGameStore } from '@/store/gameStore';
import { GamePhase, Item, ItemType, Rarity, Weapon, Armor } from '@/game/types';
import { useState } from 'react';

export default function Inventory() {
  const player = useGameStore((s) => s.player);
  const phase = useGameStore((s) => s.phase);
  const equipItem = useGameStore((s) => s.equipItem);
  const dropItem = useGameStore((s) => s.dropItem);
  const sellItem = useGameStore((s) => s.sellItem);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);

  if (phase === GamePhase.MENU || phase === GamePhase.GAME_OVER || phase === GamePhase.VICTORY) return null;

  const canSell = phase !== GamePhase.COMBAT;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-30 bg-black/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all backdrop-blur-sm"
      >
        BAG ({player.inventory.length}/{player.inventorySize})
      </button>

      {/* Inventory Panel */}
      {isOpen && (
        <div className="fixed top-14 right-4 z-30 w-[300px] bg-black/90 border border-gray-700 rounded-lg backdrop-blur-sm">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Inventory</h3>
          </div>

          {/* Equipment Slots */}
          <div className="p-2 border-b border-gray-700 space-y-1">
            <EquipSlot label="Weapon" item={player.weapon} />
            <EquipSlot label="Armor" item={player.armor} />
            <EquipSlot label="Accessory" item={player.accessory} />
          </div>

          {/* Inventory Grid */}
          <div className="p-2 max-h-[300px] overflow-y-auto">
            {player.inventory.length === 0 ? (
              <div className="text-xs text-gray-600 text-center py-4">Empty</div>
            ) : (
              <div className="space-y-1">
                {player.inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-900/50 rounded p-1.5 hover:bg-gray-800/50 group"
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${getRarityColor(item.rarity)} truncate`}>
                        {getItemDisplayName(item)}
                      </div>
                      <div className="text-[10px] text-gray-500">{getItemTypeLabel(item.type)}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => equipItem(item.id)}
                        className="px-1.5 py-0.5 text-[10px] bg-blue-900/60 text-blue-300 rounded hover:bg-blue-800"
                      >
                        {item.type === ItemType.CONSUMABLE ? 'USE' : 'EQUIP'}
                      </button>
                      {canSell && (
                        <button
                          onClick={() => sellItem(item.id)}
                          className="px-1.5 py-0.5 text-[10px] bg-orange-900/60 text-orange-300 rounded hover:bg-orange-800"
                        >
                          SELL
                        </button>
                      )}
                      <button
                        onClick={() => dropItem(item.id)}
                        className="px-1.5 py-0.5 text-[10px] bg-red-900/60 text-red-300 rounded hover:bg-red-800"
                      >
                        DROP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tooltip with comparison */}
          {hoveredItem && (
            <div className="p-2 border-t border-gray-700">
              <div className={`text-xs font-bold ${getRarityColor(hoveredItem.rarity)}`}>
                {hoveredItem.name}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{hoveredItem.description}</div>
              {hoveredItem.type === ItemType.WEAPON && (
                <>
                  <div className="text-[10px] text-red-400 mt-0.5">+{(hoveredItem as Weapon).attackBonus} Attack Dice</div>
                  {player.weapon && (
                    <ComparisonLine
                      label="ATK"
                      current={player.weapon.attackBonus}
                      incoming={(hoveredItem as Weapon).attackBonus}
                    />
                  )}
                </>
              )}
              {hoveredItem.type === ItemType.ARMOR && (
                <>
                  <div className="text-[10px] text-blue-400 mt-0.5">
                    +{(hoveredItem as Armor).defenseBonus} Defense Dice
                    {(hoveredItem as Armor).maxHpBonus > 0 && `, +${(hoveredItem as Armor).maxHpBonus} Max HP`}
                  </div>
                  {player.armor && (
                    <>
                      <ComparisonLine
                        label="DEF"
                        current={player.armor.defenseBonus}
                        incoming={(hoveredItem as Armor).defenseBonus}
                      />
                      <ComparisonLine
                        label="HP"
                        current={player.armor.maxHpBonus}
                        incoming={(hoveredItem as Armor).maxHpBonus}
                      />
                    </>
                  )}
                </>
              )}
              <div className="text-[10px] text-orange-400 mt-0.5">
                Value: {hoveredItem.value} scrap (sell: {Math.floor(hoveredItem.value * 0.5)})
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ComparisonLine({ label, current, incoming }: { label: string; current: number; incoming: number }) {
  const diff = incoming - current;
  if (diff === 0) return null;
  return (
    <div className={`text-[10px] mt-0.5 ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
      vs equipped: {diff > 0 ? '+' : ''}{diff} {label}
    </div>
  );
}

function EquipSlot({ label, item }: { label: string; item: Item | null }) {
  return (
    <div className="flex items-center text-xs">
      <span className="text-gray-500 w-16">{label}:</span>
      {item ? (
        <span className={getRarityColor(item.rarity)}>{getItemDisplayName(item)}</span>
      ) : (
        <span className="text-gray-600">Empty</span>
      )}
    </div>
  );
}

function getItemDisplayName(item: Item): string {
  switch (item.type) {
    case ItemType.WEAPON:
      return `${item.name} (+${item.attackBonus} ATK)`;
    case ItemType.ARMOR:
      return `${item.name} (+${item.defenseBonus} DEF)`;
    default:
      return item.name;
  }
}

function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case Rarity.COMMON: return 'text-gray-300';
    case Rarity.UNCOMMON: return 'text-green-400';
    case Rarity.RARE: return 'text-blue-400';
    case Rarity.LEGENDARY: return 'text-yellow-400';
  }
}

function getItemTypeLabel(type: ItemType): string {
  switch (type) {
    case ItemType.WEAPON: return 'Weapon';
    case ItemType.ARMOR: return 'Armor';
    case ItemType.ACCESSORY: return 'Accessory';
    case ItemType.CONSUMABLE: return 'Consumable';
  }
}
