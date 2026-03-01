import { Weapon, Armor, Accessory, Consumable, ItemType, Rarity, ConsumableEffect, Item } from '../types';

let nextItemId = 1;
function id(): string { return `item_${nextItemId++}`; }

// ── Weapons ─────────────────────────────────────────────

export const WEAPONS: Omit<Weapon, 'id'>[] = [
  { name: 'Combat Knife', description: 'Standard issue blade. Better than nothing.', type: ItemType.WEAPON, rarity: Rarity.COMMON, value: 10, attackBonus: 1 },
  { name: 'Pulse Pistol', description: 'Semi-auto energy sidearm.', type: ItemType.WEAPON, rarity: Rarity.COMMON, value: 20, attackBonus: 1 },
  { name: 'Shotgun', description: 'Devastating at close range.', type: ItemType.WEAPON, rarity: Rarity.UNCOMMON, value: 35, attackBonus: 2 },
  { name: 'Plasma Rifle', description: 'Military-grade plasma weapon.', type: ItemType.WEAPON, rarity: Rarity.UNCOMMON, value: 50, attackBonus: 2 },
  { name: 'Arc Caster', description: 'Chains lightning between targets.', type: ItemType.WEAPON, rarity: Rarity.RARE, value: 75, attackBonus: 3 },
  { name: 'Flamer', description: 'Purge the xenos with fire.', type: ItemType.WEAPON, rarity: Rarity.RARE, value: 90, attackBonus: 3 },
  { name: 'Void Reaper', description: 'A weapon forged from alien alloy. Cuts through anything.', type: ItemType.WEAPON, rarity: Rarity.LEGENDARY, value: 150, attackBonus: 4 },
];

// ── Armor ───────────────────────────────────────────────

export const ARMORS: Omit<Armor, 'id'>[] = [
  { name: 'Flak Vest', description: 'Basic protection against projectiles.', type: ItemType.ARMOR, rarity: Rarity.COMMON, value: 15, defenseBonus: 1, maxHpBonus: 0 },
  { name: 'Carapace Armor', description: 'Layered composite plating.', type: ItemType.ARMOR, rarity: Rarity.UNCOMMON, value: 40, defenseBonus: 1, maxHpBonus: 2 },
  { name: 'Void Suit', description: 'Sealed environment suit with armored plates.', type: ItemType.ARMOR, rarity: Rarity.UNCOMMON, value: 55, defenseBonus: 2, maxHpBonus: 2 },
  { name: 'Power Armor', description: 'Heavy powered exoskeleton. Nearly impenetrable.', type: ItemType.ARMOR, rarity: Rarity.RARE, value: 100, defenseBonus: 3, maxHpBonus: 5 },
  { name: 'Xenoplate', description: 'Armor grown from alien chitin. Adapts to threats.', type: ItemType.ARMOR, rarity: Rarity.LEGENDARY, value: 160, defenseBonus: 4, maxHpBonus: 8 },
];

// ── Accessories ─────────────────────────────────────────

export const ACCESSORIES: Omit<Accessory, 'id'>[] = [
  { name: 'Targeting Module', description: 'Adds +1 attack die.', type: ItemType.ACCESSORY, rarity: Rarity.UNCOMMON, value: 30, effect: 'attackDice', effectValue: 1 },
  { name: 'Shield Generator', description: 'Adds +1 defense die.', type: ItemType.ACCESSORY, rarity: Rarity.UNCOMMON, value: 30, effect: 'defenseDice', effectValue: 1 },
  { name: 'Medic Implant', description: 'Regenerate 1 HP after each combat.', type: ItemType.ACCESSORY, rarity: Rarity.RARE, value: 60, effect: 'regen', effectValue: 1 },
  { name: 'Scrap Magnet', description: 'Find 50% more scrap.', type: ItemType.ACCESSORY, rarity: Rarity.UNCOMMON, value: 40, effect: 'scrapBonus', effectValue: 50 },
];

// ── Consumables ─────────────────────────────────────────

export const CONSUMABLES: Omit<Consumable, 'id'>[] = [
  { name: 'Medikit', description: 'Restores 5 HP.', type: ItemType.CONSUMABLE, rarity: Rarity.COMMON, value: 10, effect: ConsumableEffect.HEAL, effectValue: 5 },
  { name: 'Large Medikit', description: 'Restores 10 HP.', type: ItemType.CONSUMABLE, rarity: Rarity.UNCOMMON, value: 25, effect: ConsumableEffect.HEAL, effectValue: 10 },
  { name: 'Combat Stim', description: '+2 attack dice for next combat.', type: ItemType.CONSUMABLE, rarity: Rarity.UNCOMMON, value: 20, effect: ConsumableEffect.BOOST_ATTACK, effectValue: 2 },
  { name: 'Barrier Charge', description: '+2 defense dice for next combat.', type: ItemType.CONSUMABLE, rarity: Rarity.UNCOMMON, value: 20, effect: ConsumableEffect.BOOST_DEFENSE, effectValue: 2 },
  { name: 'Frag Grenade', description: 'Deals 3 damage to all enemies.', type: ItemType.CONSUMABLE, rarity: Rarity.UNCOMMON, value: 25, effect: ConsumableEffect.DAMAGE_ALL, effectValue: 3 },
  { name: 'Plasma Grenade', description: 'Deals 6 damage to all enemies.', type: ItemType.CONSUMABLE, rarity: Rarity.RARE, value: 45, effect: ConsumableEffect.DAMAGE_ALL, effectValue: 6 },
];

/** Create an item instance with a unique ID */
export function createItem<T extends Omit<Item, 'id'>>(template: T): T & { id: string } {
  return { ...template, id: id() };
}

/** Get loot drops for a room based on difficulty */
export function generateLoot(
  tier: number,
  rng: { next: () => number; int: (a: number, b: number) => number; pick: <T>(a: T[]) => T; chance: (p: number) => boolean }
): Item[] {
  const items: Item[] = [];
  const count = rng.int(1, 2);

  for (let i = 0; i < count; i++) {
    const roll = rng.next();
    if (roll < 0.35) {
      // Consumable
      const filtered = CONSUMABLES.filter(c => rarityTier(c.rarity) <= tier + 1);
      if (filtered.length > 0) items.push(createItem(rng.pick(filtered)));
    } else if (roll < 0.6) {
      // Weapon
      const filtered = WEAPONS.filter(w => rarityTier(w.rarity) <= tier);
      if (filtered.length > 0) items.push(createItem(rng.pick(filtered)));
    } else if (roll < 0.85) {
      // Armor
      const filtered = ARMORS.filter(a => rarityTier(a.rarity) <= tier);
      if (filtered.length > 0) items.push(createItem(rng.pick(filtered)));
    } else {
      // Accessory
      const filtered = ACCESSORIES.filter(a => rarityTier(a.rarity) <= tier);
      if (filtered.length > 0) items.push(createItem(rng.pick(filtered)));
    }
  }

  return items;
}

function rarityTier(rarity: Rarity): number {
  switch (rarity) {
    case Rarity.COMMON: return 1;
    case Rarity.UNCOMMON: return 2;
    case Rarity.RARE: return 3;
    case Rarity.LEGENDARY: return 4;
  }
}

/** Get shop items */
export function generateShopItems(
  rng: { int: (a: number, b: number) => number; pick: <T>(a: T[]) => T }
): Item[] {
  const items: Item[] = [];
  // 3-4 items in shop
  const count = rng.int(3, 4);
  const allItems = [...WEAPONS, ...ARMORS, ...ACCESSORIES, ...CONSUMABLES];

  for (let i = 0; i < count; i++) {
    items.push(createItem(rng.pick(allItems)));
  }

  return items;
}
