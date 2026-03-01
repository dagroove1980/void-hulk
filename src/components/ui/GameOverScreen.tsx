'use client';

import { useGameStore } from '@/store/gameStore';
import { GamePhase } from '@/game/types';
import { getBestRun, getRuns } from '@/game/data/meta';
import { PERKS } from '@/game/data/perks';

export default function GameOverScreen() {
  const phase = useGameStore((s) => s.phase);
  const player = useGameStore((s) => s.player);
  const floor = useGameStore((s) => s.floor);
  const seed = useGameStore((s) => s.seed);
  const newUnlocks = useGameStore((s) => s.newUnlocks);
  const restart = useGameStore((s) => s.restart);

  if (phase !== GamePhase.GAME_OVER && phase !== GamePhase.VICTORY) return null;

  const isVictory = phase === GamePhase.VICTORY;
  const bestRun = getBestRun();
  const totalRuns = getRuns().length;
  const roomsExplored = useGameStore.getState().map.rooms.filter(r => r.explored).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="text-center max-w-md mx-auto px-8">
        {/* Title */}
        <h1
          className={`text-4xl font-black uppercase tracking-widest mb-4
            ${isVictory ? 'text-green-400' : 'text-red-500'}`}
        >
          {isVictory ? 'VICTORY' : 'MISSION FAILED'}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 mb-6 text-sm">
          {isVictory
            ? 'The Brood Queen has been eliminated. The hulk is purged.'
            : 'The darkness claims another operative...'}
        </p>

        {/* Run Stats */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 mb-4 space-y-2">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Run Stats</div>
          <StatRow label="Floor Reached" value={`${floor}/3`} />
          <StatRow label="Level" value={player.level.toString()} />
          <StatRow label="Scrap Earned" value={player.totalScrapEarned.toString()} />
          <StatRow label="Rooms Explored" value={roomsExplored.toString()} />
          <StatRow label="Seed" value={seed} />
          {player.perks.length > 0 && (
            <div className="pt-2 border-t border-gray-800">
              <div className="text-xs text-gray-500 mb-1">Perks</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {player.perks.map((perkId) => (
                  <span key={perkId} className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-300">
                    {PERKS[perkId].name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Best Run */}
        {bestRun && (
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 mb-4">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Best Run</div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Floor {bestRun.floor} | Lv.{bestRun.level} | {bestRun.totalScrap} scrap</span>
              <span className={bestRun.victory ? 'text-green-400' : 'text-red-400'}>
                {bestRun.victory ? 'Victory' : 'Defeated'}
              </span>
            </div>
            <div className="text-[10px] text-gray-600 mt-1">Total runs: {totalRuns}</div>
          </div>
        )}

        {/* New Unlocks */}
        {newUnlocks.length > 0 && (
          <div className="bg-yellow-950/50 border border-yellow-800 rounded-lg p-3 mb-4">
            <div className="text-xs uppercase tracking-wider text-yellow-400 mb-2">New Unlocks!</div>
            {newUnlocks.map((name, i) => (
              <div key={i} className="text-sm text-yellow-300 font-medium">{name}</div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={restart}
            className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all
              ${isVictory
                ? 'bg-green-900/60 hover:bg-green-800 text-green-200 border border-green-700'
                : 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700'
              }`}
          >
            New Mission
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
  );
}
