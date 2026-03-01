import { create } from 'zustand';
import {
  GamePhase, GameState, Player, GameMap, CombatState,
  CombatPhase, Item, Perk, PerkId, NarrativeEvent, FloorBriefing,
} from '../game/types';
import { GameEngine } from '../game/engine/GameEngine';

interface GameStore extends GameState {
  engine: GameEngine | null;
  shopItems: Item[];
  perkChoices: Perk[];
  pendingEvent: NarrativeEvent | null;
  floorBriefing: FloorBriefing | null;
  newUnlocks: string[];
  setEngine: (engine: GameEngine) => void;
  updateState: (state: Partial<GameState> & {
    shopItems?: Item[];
    perkChoices?: Perk[];
    pendingEvent?: NarrativeEvent | null;
    floorBriefing?: FloorBriefing | null;
    newUnlocks?: string[];
  }) => void;
  doPlayerAttack: () => void;
  doPlayerDefend: () => void;
  doPlayerFlee: () => void;
  useItemInCombat: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  dropItem: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  buyItem: (itemId: string) => void;
  leaveShop: () => void;
  selectPerk: (perkId: PerkId) => void;
  resolveEventChoice: (choiceIndex: number) => void;
  dismissBriefing: () => void;
  descendFloor: () => void;
  restart: () => void;
}

const defaultPlayer: Player = {
  id: 'player',
  gridX: 0, gridY: 0,
  worldX: 0, worldY: 0,
  hp: 15, maxHp: 15,
  attackDice: 3, defenseDice: 2,
  level: 1, xp: 0, xpToNext: 30,
  scrap: 0,
  weapon: null, armor: null, accessory: null,
  inventory: [], inventorySize: 8,
  perks: [],
  totalScrapEarned: 0,
};

const defaultCombat: CombatState = {
  active: false,
  phase: CombatPhase.IDLE,
  enemies: [],
  currentEnemyIndex: 0,
  playerRoll: null,
  enemyRoll: null,
  log: [],
  playerStatusEffects: [],
  turnCount: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  engine: null,
  phase: GamePhase.MENU,
  player: defaultPlayer,
  map: { width: 50, height: 50, tiles: [], rooms: [], corridors: [] },
  combat: defaultCombat,
  seed: '',
  turn: 0,
  floor: 1,
  shopItems: [],
  perkChoices: [],
  pendingEvent: null,
  floorBriefing: null,
  newUnlocks: [],

  setEngine: (engine) => set({ engine }),

  updateState: (state) => set((prev) => ({
    ...prev,
    ...state,
    player: state.player ? { ...state.player } : prev.player,
    combat: state.combat ? { ...state.combat } : prev.combat,
  })),

  doPlayerAttack: () => {
    const { engine } = get();
    if (engine) engine.doPlayerAttack();
  },

  doPlayerDefend: () => {
    const { engine } = get();
    if (engine) engine.doPlayerDefend();
  },

  doPlayerFlee: () => {
    const { engine } = get();
    if (engine) engine.doPlayerFlee();
  },

  useItemInCombat: (itemId: string) => {
    const { engine } = get();
    if (engine) engine.useItemInCombat(itemId);
  },

  equipItem: (itemId: string) => {
    const { engine } = get();
    if (engine) engine.equipItem(itemId);
  },

  dropItem: (itemId: string) => {
    const { engine } = get();
    if (engine) engine.dropItem(itemId);
  },

  sellItem: (itemId: string) => {
    const { engine } = get();
    if (engine) engine.sellItem(itemId);
  },

  buyItem: (itemId: string) => {
    const { engine } = get();
    if (engine) engine.buyItem(itemId);
  },

  leaveShop: () => {
    const { engine } = get();
    if (engine) engine.leaveShop();
  },

  selectPerk: (perkId: PerkId) => {
    const { engine } = get();
    if (engine) engine.selectPerk(perkId);
  },

  resolveEventChoice: (choiceIndex: number) => {
    const { engine, pendingEvent } = get();
    if (engine && pendingEvent) engine.resolveEventChoice(choiceIndex, pendingEvent);
  },

  dismissBriefing: () => {
    const { engine } = get();
    if (engine) engine.dismissBriefing();
  },

  descendFloor: () => {
    const { engine } = get();
    if (engine) engine.descendFloor();
  },

  restart: () => {
    const { engine } = get();
    if (engine) engine.restart();
  },
}));
