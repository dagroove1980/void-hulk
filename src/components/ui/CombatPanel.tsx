'use client';

import { useGameStore } from '@/store/gameStore';
import { GamePhase, CombatPhase, StatusEffectType, ItemType, RoomType } from '@/game/types';
import { useEffect, useRef, useState } from 'react';

export default function CombatPanel() {
  const phase = useGameStore((s) => s.phase);
  const combat = useGameStore((s) => s.combat);
  const player = useGameStore((s) => s.player);
  const map = useGameStore((s) => s.map);
  const doPlayerAttack = useGameStore((s) => s.doPlayerAttack);
  const doPlayerDefend = useGameStore((s) => s.doPlayerDefend);
  const doPlayerFlee = useGameStore((s) => s.doPlayerFlee);
  const useItemInCombat = useGameStore((s) => s.useItemInCombat);
  const descendFloor = useGameStore((s) => s.descendFloor);
  const logRef = useRef<HTMLDivElement>(null);
  const [diceAnim, setDiceAnim] = useState<number[]>([]);
  const [showItems, setShowItems] = useState(false);

  // Auto-scroll combat log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [combat.log]);

  // Dice animation
  useEffect(() => {
    if (combat.phase === CombatPhase.PLAYER_ROLLING || combat.phase === CombatPhase.ENEMY_ROLLING) {
      const interval = setInterval(() => {
        setDiceAnim(Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1));
      }, 80);
      setTimeout(() => clearInterval(interval), 400);
      return () => clearInterval(interval);
    }
  }, [combat.phase]);

  // Check if player is standing on stairs
  const isOnStairs = phase === GamePhase.EXPLORING && map.rooms.some(
    r => r.type === RoomType.STAIRS && r.explored && r.cleared &&
    player.gridX >= r.x && player.gridX < r.x + r.width &&
    player.gridY >= r.y && player.gridY < r.y + r.height
  );

  if (phase !== GamePhase.COMBAT && combat.log.length === 0 && !isOnStairs) return null;

  const currentEnemy = combat.enemies[combat.currentEnemyIndex];
  const canAct = combat.phase === CombatPhase.PLAYER_TURN;
  const consumables = player.inventory.filter(i => i.type === ItemType.CONSUMABLE);

  return (
    <div className="fixed bottom-4 right-4 z-20 w-[340px]">
      {/* Enemy Info */}
      {phase === GamePhase.COMBAT && currentEnemy && currentEnemy.hp > 0 && (
        <div className="bg-black/80 border border-red-900/50 rounded-lg p-3 mb-2 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-red-400">{currentEnemy.name}</span>
            <span className="text-xs text-gray-400">
              {combat.enemies.filter(e => e.hp > 0).length} remaining
            </span>
          </div>
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>HP: {currentEnemy.hp}/{currentEnemy.maxHp}</span>
            <span>ATK: {currentEnemy.attackDice}d6 | DEF: {currentEnemy.defenseDice}d6</span>
          </div>

          {/* Enemy Status Effects */}
          {currentEnemy.statusEffects && currentEnemy.statusEffects.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {currentEnemy.statusEffects.map((e, i) => (
                <span key={i} className={`text-[10px] px-1 py-0.5 rounded ${getStatusStyle(e.type)}`}>
                  {e.type} ({e.duration})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Player Status Effects */}
      {phase === GamePhase.COMBAT && combat.playerStatusEffects.length > 0 && (
        <div className="bg-black/80 border border-gray-700 rounded-lg p-2 mb-2 backdrop-blur-sm">
          <div className="text-[10px] text-gray-500 mb-1">STATUS</div>
          <div className="flex gap-1 flex-wrap">
            {combat.playerStatusEffects.map((e, i) => (
              <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusStyle(e.type)}`}>
                {e.type} ({e.duration})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dice Display */}
      {combat.playerRoll && phase === GamePhase.COMBAT && (
        <div className="bg-black/80 border border-gray-700 rounded-lg p-2 mb-2 backdrop-blur-sm">
          <div className="flex gap-1.5 justify-center">
            {(combat.playerRoll.rolls.length > 0 ? combat.playerRoll.rolls : diceAnim).map((val, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold border
                  ${val >= 4
                    ? val === 6
                      ? 'bg-yellow-900/60 border-yellow-500 text-yellow-300'
                      : 'bg-green-900/60 border-green-500 text-green-300'
                    : 'bg-gray-800 border-gray-600 text-gray-400'
                  }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combat Log */}
      <div className="bg-black/80 border border-gray-700 rounded-lg backdrop-blur-sm">
        <div
          ref={logRef}
          className="h-[180px] overflow-y-auto p-2 text-xs space-y-0.5 scrollbar-thin"
        >
          {combat.log.map((entry) => (
            <div
              key={entry.id}
              className={`${getLogColor(entry.type)} leading-relaxed`}
            >
              {entry.text}
            </div>
          ))}
          {combat.log.length === 0 && (
            <div className="text-gray-600 italic">Explore the derelict ship...</div>
          )}
        </div>

        {/* Action Buttons */}
        {phase === GamePhase.COMBAT && (
          <div className="p-2 border-t border-gray-700 space-y-1.5">
            {/* Main actions row */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={doPlayerAttack}
                disabled={!canAct}
                className={`py-2 rounded text-xs font-bold uppercase tracking-wider transition-all
                  ${canAct
                    ? 'bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700'
                    : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                  }`}
              >
                ATTACK
              </button>
              <button
                onClick={doPlayerDefend}
                disabled={!canAct}
                className={`py-2 rounded text-xs font-bold uppercase tracking-wider transition-all
                  ${canAct
                    ? 'bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700'
                    : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                  }`}
              >
                DEFEND
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setShowItems(!showItems)}
                disabled={!canAct || consumables.length === 0}
                className={`py-2 rounded text-xs font-bold uppercase tracking-wider transition-all
                  ${canAct && consumables.length > 0
                    ? 'bg-green-900/80 hover:bg-green-800 text-green-200 border border-green-700'
                    : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                  }`}
              >
                USE ITEM ({consumables.length})
              </button>
              <button
                onClick={doPlayerFlee}
                disabled={!canAct}
                className={`py-2 rounded text-xs font-bold uppercase tracking-wider transition-all
                  ${canAct
                    ? 'bg-yellow-900/80 hover:bg-yellow-800 text-yellow-200 border border-yellow-700'
                    : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                  }`}
              >
                FLEE
              </button>
            </div>

            {/* Item selection dropdown */}
            {showItems && canAct && consumables.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded p-1.5 space-y-1">
                {consumables.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { useItemInCombat(item.id); setShowItems(false); }}
                    className="w-full text-left px-2 py-1 rounded text-xs text-green-300 hover:bg-green-900/40 transition-colors"
                  >
                    {item.name} — {item.description}
                  </button>
                ))}
              </div>
            )}

            {/* Turn indicator */}
            {!canAct && combat.active && (
              <div className="text-center text-xs text-gray-500">
                {combat.phase === CombatPhase.ENEMY_TURN ? 'Enemy Turn...' : 'Resolving...'}
              </div>
            )}
          </div>
        )}

        {/* Stairs descend button */}
        {isOnStairs && (
          <div className="p-2 border-t border-gray-700">
            <button
              onClick={descendFloor}
              className="w-full py-2 rounded text-sm font-bold uppercase tracking-wider bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 transition-all"
            >
              DESCEND TO NEXT FLOOR
            </button>
          </div>
        )}

        {/* Victory message */}
        {combat.phase === CombatPhase.VICTORY && (
          <div className="p-2 border-t border-gray-700 text-center text-green-400 text-sm font-bold">
            VICTORY
          </div>
        )}
      </div>
    </div>
  );
}

function getLogColor(type: string): string {
  switch (type) {
    case 'player': return 'text-blue-400';
    case 'enemy': return 'text-red-400';
    case 'damage': return 'text-orange-400';
    case 'crit': return 'text-yellow-300 font-bold';
    case 'loot': return 'text-green-400';
    case 'system': return 'text-purple-400';
    default: return 'text-gray-400';
  }
}

function getStatusStyle(type: StatusEffectType): string {
  switch (type) {
    case StatusEffectType.POISON: return 'bg-green-900/60 text-green-300';
    case StatusEffectType.BLEEDING: return 'bg-red-900/60 text-red-300';
    case StatusEffectType.WEAKENED: return 'bg-orange-900/60 text-orange-300';
    case StatusEffectType.STUNNED: return 'bg-yellow-900/60 text-yellow-300';
    case StatusEffectType.FORTIFIED: return 'bg-blue-900/60 text-blue-300';
  }
}
