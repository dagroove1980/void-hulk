import { EnemyType, EnemyTier } from '../types';

export interface EnemyTemplate {
  name: string;
  type: EnemyType;
  tier: EnemyTier;
  hp: number;
  attackDice: number;
  defenseDice: number;
  xpReward: number;
  scrapReward: number;
  description: string;
}

export const ENEMY_TEMPLATES: Record<EnemyType, EnemyTemplate> = {
  [EnemyType.VOID_LURKER]: {
    name: 'Void Lurker',
    type: EnemyType.VOID_LURKER,
    tier: EnemyTier.COMMON,
    hp: 3,
    attackDice: 2,
    defenseDice: 1,
    xpReward: 10,
    scrapReward: 5,
    description: 'A small, skulking creature that lurks in the shadows.',
  },
  [EnemyType.CORRUPTED_DRONE]: {
    name: 'Corrupted Drone',
    type: EnemyType.CORRUPTED_DRONE,
    tier: EnemyTier.COMMON,
    hp: 4,
    attackDice: 2,
    defenseDice: 2,
    xpReward: 15,
    scrapReward: 10,
    description: 'A ship maintenance drone corrupted by alien influence.',
  },
  [EnemyType.ACID_SPITTER]: {
    name: 'Acid Spitter',
    type: EnemyType.ACID_SPITTER,
    tier: EnemyTier.UNCOMMON,
    hp: 5,
    attackDice: 3,
    defenseDice: 1,
    xpReward: 20,
    scrapReward: 12,
    description: 'Bloated organism that launches corrosive projectiles.',
  },
  [EnemyType.HULL_BREAKER]: {
    name: 'Hull Breaker',
    type: EnemyType.HULL_BREAKER,
    tier: EnemyTier.RARE,
    hp: 8,
    attackDice: 3,
    defenseDice: 3,
    xpReward: 35,
    scrapReward: 20,
    description: 'Massive armored beast that can tear through bulkheads.',
  },
  [EnemyType.PHASE_STALKER]: {
    name: 'Phase Stalker',
    type: EnemyType.PHASE_STALKER,
    tier: EnemyTier.RARE,
    hp: 6,
    attackDice: 4,
    defenseDice: 2,
    xpReward: 40,
    scrapReward: 25,
    description: 'Ethereal predator that shifts between dimensions.',
  },
  [EnemyType.BROOD_QUEEN]: {
    name: 'Brood Queen',
    type: EnemyType.BROOD_QUEEN,
    tier: EnemyTier.BOSS,
    hp: 20,
    attackDice: 5,
    defenseDice: 4,
    xpReward: 100,
    scrapReward: 50,
    description: 'The monstrous matriarch of the alien infestation.',
  },
};

/** Get enemies to spawn based on room distance from start and current floor */
export function getEnemiesForRoom(
  distance: number,
  floor: number,
  rng: { int: (a: number, b: number) => number; chance: (p: number) => boolean }
): EnemyType[] {
  const enemies: EnemyType[] = [];
  // Floor offset makes later floors harder
  const effectiveDist = distance + (floor - 1) * 3;

  if (effectiveDist <= 3) {
    // Early rooms: 1-2 commons
    const count = rng.int(1, 2);
    for (let i = 0; i < count; i++) {
      enemies.push(rng.chance(0.5) ? EnemyType.VOID_LURKER : EnemyType.CORRUPTED_DRONE);
    }
  } else if (effectiveDist <= 6) {
    // Mid rooms: 1-2 commons + maybe uncommon
    const count = rng.int(1, 2);
    for (let i = 0; i < count; i++) {
      enemies.push(rng.chance(0.5) ? EnemyType.VOID_LURKER : EnemyType.CORRUPTED_DRONE);
    }
    if (rng.chance(0.4 + floor * 0.1)) {
      enemies.push(EnemyType.ACID_SPITTER);
    }
  } else {
    // Late rooms: mix of all tiers
    const count = rng.int(1 + Math.floor(floor / 2), 3);
    for (let i = 0; i < count; i++) {
      if (rng.chance(0.3 + floor * 0.05)) {
        enemies.push(rng.chance(0.5) ? EnemyType.HULL_BREAKER : EnemyType.PHASE_STALKER);
      } else {
        enemies.push(rng.chance(0.5) ? EnemyType.ACID_SPITTER : EnemyType.CORRUPTED_DRONE);
      }
    }
  }

  return enemies;
}
