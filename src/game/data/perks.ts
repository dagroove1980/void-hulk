import { Perk, PerkId } from '../types';

export const PERKS: Record<PerkId, Perk> = {
  // ── Offense ────────────────────────────────────────────
  sharp_shooter: {
    id: 'sharp_shooter',
    name: 'Sharp Shooter',
    description: '+1 Attack Die permanently.',
    category: 'offense',
  },
  critical_focus: {
    id: 'critical_focus',
    name: 'Critical Focus',
    description: 'Rolls of 5 also count as crits (bonus damage).',
    category: 'offense',
  },
  double_tap: {
    id: 'double_tap',
    name: 'Double Tap',
    description: 'Free bonus attack when you kill an enemy.',
    category: 'offense',
  },
  bleed_them: {
    id: 'bleed_them',
    name: 'Bleed Them',
    description: '20% chance to inflict BLEEDING on hit.',
    category: 'offense',
  },

  // ── Defense ────────────────────────────────────────────
  iron_skin: {
    id: 'iron_skin',
    name: 'Iron Skin',
    description: '+1 Defense Die permanently.',
    category: 'defense',
  },
  emergency_shield: {
    id: 'emergency_shield',
    name: 'Emergency Shield',
    description: '+3 Defense Dice when below 25% HP.',
    category: 'defense',
  },
  regenerator: {
    id: 'regenerator',
    name: 'Regenerator',
    description: 'Heal 2 HP after each combat victory.',
    category: 'defense',
  },
  evasion: {
    id: 'evasion',
    name: 'Evasion',
    description: 'FLEE always succeeds (no roll needed).',
    category: 'defense',
  },

  // ── Utility ────────────────────────────────────────────
  scavenger: {
    id: 'scavenger',
    name: 'Scavenger',
    description: '+50% scrap from all sources.',
    category: 'utility',
  },
  pack_rat: {
    id: 'pack_rat',
    name: 'Pack Rat',
    description: '+4 inventory slots.',
    category: 'utility',
  },
  field_medic: {
    id: 'field_medic',
    name: 'Field Medic',
    description: '+50% healing from all sources.',
    category: 'utility',
  },
  trap_sense: {
    id: 'trap_sense',
    name: 'Trap Sense',
    description: 'Immune to trap damage.',
    category: 'utility',
  },
};

/** Get 3 random perks the player doesn't already have */
export function getRandomPerks(
  owned: PerkId[],
  rng: { shuffle: <T>(arr: T[]) => T[] }
): Perk[] {
  const available = Object.values(PERKS).filter(p => !owned.includes(p.id));
  if (available.length === 0) return [];
  const shuffled = rng.shuffle([...available]);
  return shuffled.slice(0, Math.min(3, shuffled.length));
}
