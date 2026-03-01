'use client';

import { useGameStore } from '@/store/gameStore';
import { GamePhase, PerkCategory } from '@/game/types';

export default function PerkSelectPanel() {
  const phase = useGameStore((s) => s.phase);
  const perkChoices = useGameStore((s) => s.perkChoices);
  const selectPerk = useGameStore((s) => s.selectPerk);
  const player = useGameStore((s) => s.player);

  if (phase !== GamePhase.PERK_SELECT || perkChoices.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
            Level Up!
          </h2>
          <p className="text-gray-400 text-sm">
            Level {player.level} — Choose a perk
          </p>
        </div>

        {/* Perk Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {perkChoices.map((perk) => (
            <button
              key={perk.id}
              onClick={() => selectPerk(perk.id)}
              className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-left hover:border-yellow-500 hover:bg-gray-900 transition-all group"
            >
              {/* Category Badge */}
              <div className="mb-2">
                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${getCategoryStyle(perk.category)}`}>
                  {perk.category}
                </span>
              </div>

              {/* Name */}
              <h3 className="text-sm font-bold text-gray-200 group-hover:text-yellow-300 transition-colors mb-1">
                {perk.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed">
                {perk.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getCategoryStyle(category: PerkCategory): string {
  switch (category) {
    case 'offense': return 'bg-red-900/60 text-red-300';
    case 'defense': return 'bg-blue-900/60 text-blue-300';
    case 'utility': return 'bg-green-900/60 text-green-300';
  }
}
