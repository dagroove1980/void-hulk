'use client';

import { useGameStore } from '@/store/gameStore';
import { GamePhase } from '@/game/types';

export default function EventPanel() {
  const phase = useGameStore((s) => s.phase);
  const pendingEvent = useGameStore((s) => s.pendingEvent);
  const floorBriefing = useGameStore((s) => s.floorBriefing);
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice);
  const dismissBriefing = useGameStore((s) => s.dismissBriefing);

  // Floor Briefing
  if (phase === GamePhase.FLOOR_BRIEFING && floorBriefing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
        <div className="max-w-lg w-full mx-4 text-center">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Floor {floorBriefing.floor}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 mb-4">
            {floorBriefing.title}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-8 px-4">
            {floorBriefing.description}
          </p>
          <button
            onClick={dismissBriefing}
            className="px-8 py-3 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 rounded-lg font-bold uppercase tracking-wider text-sm transition-all"
          >
            Proceed
          </button>
        </div>
      </div>
    );
  }

  // Narrative Event
  if (phase === GamePhase.EVENT_CHOICE && pendingEvent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
        <div className="max-w-lg w-full mx-4">
          {/* Event Title */}
          <h2 className="text-xl font-black uppercase tracking-wider text-purple-400 mb-2 text-center">
            {pendingEvent.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-300 leading-relaxed mb-6 text-center px-2">
            {pendingEvent.description}
          </p>

          {/* Choices */}
          <div className="space-y-2">
            {pendingEvent.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => resolveEventChoice(i)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-left hover:border-purple-500 hover:bg-gray-900 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold text-sm mt-0.5">
                    {i + 1}.
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-200 group-hover:text-purple-300 transition-colors">
                      {choice.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {choice.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
