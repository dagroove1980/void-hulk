// ── Core Types ──────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface WorldPoint {
  wx: number;
  wy: number;
}

export interface ScreenPoint {
  sx: number;
  sy: number;
}

// ── Tile & Map ──────────────────────────────────────────

export enum TileType {
  EMPTY = 0,
  FLOOR = 1,
  WALL = 2,
  DOOR = 3,
  CORRIDOR = 4,
}

export enum Visibility {
  HIDDEN = 0,
  EXPLORED = 1,
  VISIBLE = 2,
}

export interface Tile {
  type: TileType;
  visibility: Visibility;
  roomId: number | null;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[][];
  rooms: Room[];
  corridors: Point[][];
}

// ── Rooms ───────────────────────────────────────────────

export enum RoomType {
  START = 'START',
  ENEMY = 'ENEMY',
  LOOT = 'LOOT',
  TRAP = 'TRAP',
  SHOP = 'SHOP',
  EVENT = 'EVENT',
  BOSS = 'BOSS',
  STAIRS = 'STAIRS',
}

export interface Room {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
  explored: boolean;
  cleared: boolean;
  enemies: Enemy[];
  loot: Item[];
  connections: number[];
}

// ── Entities ────────────────────────────────────────────

export interface Entity {
  id: string;
  gridX: number;
  gridY: number;
  worldX: number;
  worldY: number;
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  attackDice: number;
  defenseDice: number;
  level: number;
  xp: number;
  xpToNext: number;
  scrap: number;
  weapon: Weapon | null;
  armor: Armor | null;
  accessory: Accessory | null;
  inventory: Item[];
  inventorySize: number;
  perks: PerkId[];
  totalScrapEarned: number;
}

export enum EnemyTier {
  COMMON = 1,
  UNCOMMON = 2,
  RARE = 3,
  BOSS = 4,
}

export interface Enemy extends Entity {
  name: string;
  type: EnemyType;
  tier: EnemyTier;
  hp: number;
  maxHp: number;
  attackDice: number;
  defenseDice: number;
  xpReward: number;
  scrapReward: number;
  description: string;
  statusEffects: StatusEffect[];
}

export enum EnemyType {
  VOID_LURKER = 'VOID_LURKER',
  CORRUPTED_DRONE = 'CORRUPTED_DRONE',
  ACID_SPITTER = 'ACID_SPITTER',
  HULL_BREAKER = 'HULL_BREAKER',
  PHASE_STALKER = 'PHASE_STALKER',
  BROOD_QUEEN = 'BROOD_QUEEN',
}

// ── Status Effects ─────────────────────────────────────

export enum StatusEffectType {
  POISON = 'POISON',
  BLEEDING = 'BLEEDING',
  WEAKENED = 'WEAKENED',
  STUNNED = 'STUNNED',
  FORTIFIED = 'FORTIFIED',
}

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // turns remaining
}

// ── Items ───────────────────────────────────────────────

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  ACCESSORY = 'ACCESSORY',
  CONSUMABLE = 'CONSUMABLE',
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  LEGENDARY = 'LEGENDARY',
}

export interface ItemBase {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: Rarity;
  value: number;
}

export interface Weapon extends ItemBase {
  type: ItemType.WEAPON;
  attackBonus: number;
}

export interface Armor extends ItemBase {
  type: ItemType.ARMOR;
  defenseBonus: number;
  maxHpBonus: number;
}

export interface Accessory extends ItemBase {
  type: ItemType.ACCESSORY;
  effect: string;
  effectValue: number;
}

export interface Consumable extends ItemBase {
  type: ItemType.CONSUMABLE;
  effect: ConsumableEffect;
  effectValue: number;
}

export enum ConsumableEffect {
  HEAL = 'HEAL',
  BOOST_ATTACK = 'BOOST_ATTACK',
  BOOST_DEFENSE = 'BOOST_DEFENSE',
  DAMAGE_ALL = 'DAMAGE_ALL',
}

export type Item = Weapon | Armor | Accessory | Consumable;

// ── Combat ──────────────────────────────────────────────

export enum CombatAction {
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  USE_ITEM = 'USE_ITEM',
  FLEE = 'FLEE',
}

export interface DiceResult {
  rolls: number[];
  successes: number;
  crits: number;
  total: number;
}

export enum CombatPhase {
  IDLE = 'IDLE',
  PLAYER_TURN = 'PLAYER_TURN',
  PLAYER_ROLLING = 'PLAYER_ROLLING',
  ENEMY_TURN = 'ENEMY_TURN',
  ENEMY_ROLLING = 'ENEMY_ROLLING',
  RESOLVING = 'RESOLVING',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
  FLED = 'FLED',
}

export interface CombatState {
  active: boolean;
  phase: CombatPhase;
  enemies: Enemy[];
  currentEnemyIndex: number;
  playerRoll: DiceResult | null;
  enemyRoll: DiceResult | null;
  log: CombatLogEntry[];
  playerStatusEffects: StatusEffect[];
  turnCount: number;
}

export interface CombatLogEntry {
  id: string;
  text: string;
  type: 'info' | 'player' | 'enemy' | 'damage' | 'crit' | 'loot' | 'system';
  timestamp: number;
}

// ── Perks ───────────────────────────────────────────────

export type PerkCategory = 'offense' | 'defense' | 'utility';

export type PerkId =
  | 'sharp_shooter' | 'critical_focus' | 'double_tap' | 'bleed_them'
  | 'iron_skin' | 'emergency_shield' | 'regenerator' | 'evasion'
  | 'scavenger' | 'pack_rat' | 'field_medic' | 'trap_sense';

export interface Perk {
  id: PerkId;
  name: string;
  description: string;
  category: PerkCategory;
}

// ── Narrative Events ────────────────────────────────────

export interface EventChoice {
  label: string;
  description: string;
  outcome: EventOutcome;
}

export interface EventOutcome {
  text: string;
  hpChange?: number;
  scrapChange?: number;
  xpChange?: number;
  item?: boolean; // grant random item
  statusEffect?: StatusEffectType; // apply to player
}

export interface NarrativeEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  minFloor?: number;
}

export interface FloorBriefing {
  floor: number;
  title: string;
  description: string;
}

// ── Meta-Progression ────────────────────────────────────

export interface RunRecord {
  floor: number;
  level: number;
  scrap: number;
  totalScrap: number;
  victory: boolean;
  perks: PerkId[];
  seed: string;
  timestamp: number;
}

export interface MetaUnlock {
  id: string;
  name: string;
  description: string;
  requirement: (runs: RunRecord[]) => boolean;
  applied: boolean;
}

// ── Game State ──────────────────────────────────────────

export enum GamePhase {
  MENU = 'MENU',
  EXPLORING = 'EXPLORING',
  COMBAT = 'COMBAT',
  SHOP = 'SHOP',
  EVENT = 'EVENT',
  PERK_SELECT = 'PERK_SELECT',
  EVENT_CHOICE = 'EVENT_CHOICE',
  FLOOR_BRIEFING = 'FLOOR_BRIEFING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export interface GameState {
  phase: GamePhase;
  player: Player;
  map: GameMap;
  combat: CombatState;
  seed: string;
  turn: number;
  floor: number;
}

// ── Events ──────────────────────────────────────────────

export type GameEventType =
  | 'ROOM_ENTERED'
  | 'ROOM_CLEARED'
  | 'COMBAT_START'
  | 'COMBAT_END'
  | 'PLAYER_ATTACK'
  | 'ENEMY_ATTACK'
  | 'PLAYER_DAMAGED'
  | 'ENEMY_DAMAGED'
  | 'ENEMY_KILLED'
  | 'ITEM_PICKED'
  | 'ITEM_EQUIPPED'
  | 'ITEM_USED'
  | 'PLAYER_LEVEL_UP'
  | 'PLAYER_MOVED'
  | 'PLAYER_DIED'
  | 'BOSS_DEFEATED'
  | 'DICE_ROLLED'
  | 'FLOOR_DESCENDED'
  | 'PERK_SELECTED';

export interface GameEvent {
  type: GameEventType;
  data: Record<string, unknown>;
}
