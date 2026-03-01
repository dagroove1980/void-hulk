import { RunRecord, PerkId } from '../types';

const STORAGE_KEY = 'void_hulk_runs';

export function saveRun(record: RunRecord): void {
  const runs = getRuns();
  runs.push(record);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  }
}

export function getRuns(): RunRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getBestRun(): RunRecord | null {
  const runs = getRuns();
  if (runs.length === 0) return null;
  return runs.reduce((best, run) => {
    const score = run.floor * 100 + run.level * 50 + run.totalScrap + (run.victory ? 1000 : 0);
    const bestScore = best.floor * 100 + best.level * 50 + best.totalScrap + (best.victory ? 1000 : 0);
    return score > bestScore ? run : best;
  });
}

export interface MetaBonus {
  id: string;
  name: string;
  description: string;
  check: (runs: RunRecord[]) => boolean;
  apply: (stats: { hp: number; scrap: number; inventorySize: number; starterItem: boolean }) => void;
}

export const META_BONUSES: MetaBonus[] = [
  {
    id: 'veteran_hp',
    name: 'Veteran Constitution',
    description: '+3 starting HP after 3 runs.',
    check: (runs) => runs.length >= 3,
    apply: (stats) => { stats.hp += 3; },
  },
  {
    id: 'victory_scrap',
    name: 'Victory Fund',
    description: '+15 starting scrap after first victory.',
    check: (runs) => runs.some(r => r.victory),
    apply: (stats) => { stats.scrap += 15; },
  },
  {
    id: 'experienced_gear',
    name: 'Experienced Operative',
    description: 'Start with an uncommon item after 5 runs.',
    check: (runs) => runs.length >= 5,
    apply: (stats) => { stats.starterItem = true; },
  },
  {
    id: 'hoarder_slots',
    name: 'Hoarder\'s Instinct',
    description: '+2 inventory slots after earning 500 total scrap.',
    check: (runs) => runs.reduce((sum, r) => sum + r.totalScrap, 0) >= 500,
    apply: (stats) => { stats.inventorySize += 2; },
  },
];

/** Get all unlocked bonuses for the current player */
export function getUnlockedBonuses(): MetaBonus[] {
  const runs = getRuns();
  return META_BONUSES.filter(b => b.check(runs));
}

/** Get newly unlocked bonuses after adding a run */
export function getNewUnlocks(previousRuns: RunRecord[], newRun: RunRecord): MetaBonus[] {
  const allRuns = [...previousRuns, newRun];
  return META_BONUSES.filter(b => b.check(allRuns) && !b.check(previousRuns));
}

/** Apply all unlocked meta bonuses and return modified starting stats */
export function applyMetaBonuses(): { hp: number; scrap: number; inventorySize: number; starterItem: boolean } {
  const stats = { hp: 0, scrap: 0, inventorySize: 0, starterItem: false };
  const unlocked = getUnlockedBonuses();
  for (const bonus of unlocked) {
    bonus.apply(stats);
  }
  return stats;
}
