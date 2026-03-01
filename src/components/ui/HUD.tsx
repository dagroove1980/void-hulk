'use client';

import { useGameStore } from '@/store/gameStore';
import { GamePhase } from '@/game/types';
import { PERKS } from '@/game/data/perks';

export default function HUD() {
  const player = useGameStore((s) => s.player);
  const phase = useGameStore((s) => s.phase);
  const seed = useGameStore((s) => s.seed);
  const floor = useGameStore((s) => s.floor);

  if (phase === GamePhase.MENU) return null;

  const hpPct = (player.hp / player.maxHp) * 100;
  const xpPct = (player.xp / player.xpToNext) * 100;
  const hpColor = hpPct > 50 ? '#44cc66' : hpPct > 25 ? '#ccaa33' : '#cc3333';

  return (
    <div className="fixed top-4 left-4 z-20 pointer-events-none select-none">
      <div className="bg-black/80 border border-gray-700 rounded-lg p-3 min-w-[220px] backdrop-blur-sm">
        {/* Player Name, Level, Floor */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-blue-400 tracking-wide uppercase">Operative</span>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>F{floor}</span>
            <span>Lv.{player.level}</span>
          </div>
        </div>

        {/* HP Bar */}
        <div className="mb-1.5">
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-gray-400">HP</span>
            <span style={{ color: hpColor }}>{player.hp}/{player.maxHp}</span>
          </div>
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${hpPct}%`, backgroundColor: hpColor }}
            />
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="text-gray-400">XP</span>
            <span className="text-blue-400">{player.xp}/{player.xpToNext}</span>
          </div>
          <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-4 text-xs">
          <div className="text-gray-400">
            ATK: <span className="text-red-400">{player.attackDice + (player.weapon?.attackBonus ?? 0)}d6</span>
          </div>
          <div className="text-gray-400">
            DEF: <span className="text-blue-400">{player.defenseDice + (player.armor?.defenseBonus ?? 0)}d6</span>
          </div>
          <div className="text-gray-400">
            Scrap: <span className="text-orange-400">{player.scrap}</span>
          </div>
          <div className="text-gray-400">
            Seed: <span className="text-gray-500">{seed}</span>
          </div>
        </div>

        {/* Equipment */}
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs space-y-0.5">
          <div className="text-gray-500">
            W: <span className="text-gray-300">
              {player.weapon ? `${player.weapon.name} (+${player.weapon.attackBonus} ATK)` : 'Fists'}
            </span>
          </div>
          <div className="text-gray-500">
            A: <span className="text-gray-300">
              {player.armor ? `${player.armor.name} (+${player.armor.defenseBonus} DEF)` : 'None'}
            </span>
          </div>
          <div className="text-gray-500">
            Acc: <span className="text-gray-300">{player.accessory?.name || 'None'}</span>
          </div>
        </div>

        {/* Perks */}
        {player.perks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Perks</div>
            <div className="flex flex-wrap gap-1">
              {player.perks.map((perkId) => {
                const perk = PERKS[perkId];
                return (
                  <span
                    key={perkId}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-300 border border-yellow-800/50"
                    title={perk.description}
                  >
                    {perk.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
