import { Application } from 'pixi.js';
import {
  GamePhase, GameState, Player, Room, RoomType, TileType,
  Visibility, CombatPhase, Point, Item, ItemType,
  ConsumableEffect, Consumable, EnemyType, Perk, PerkId,
  NarrativeEvent, EventChoice, FloorBriefing, RunRecord,
  StatusEffectType,
} from '../types';
import { IsometricRenderer } from './IsometricRenderer';
import { Camera } from './Camera';
import { EventBus } from './EventBus';
import { DungeonGenerator } from '../systems/DungeonGenerator';
import { CombatSystem } from '../systems/CombatSystem';
import { findPath } from '../systems/Pathfinder';
import { SeededRNG, generateSeed } from '../utils/rng';
import { gridToWorld, screenToGrid, lerp } from '../utils/math';
import { getEnemiesForRoom, ENEMY_TEMPLATES } from '../data/enemies';
import { generateLoot, generateShopItems, createItem, WEAPONS, ARMORS, ACCESSORIES, CONSUMABLES } from '../data/items';
import { COLORS } from '../utils/colors';
import { getRandomPerks, PERKS } from '../data/perks';
import { getRandomEvent, FLOOR_BRIEFINGS } from '../data/events';
import { applyMetaBonuses, saveRun, getRuns, getNewUnlocks } from '../data/meta';
import { Rarity } from '../types';

export type StoreUpdater = (state: Partial<GameState> & {
  shopItems?: Item[];
  perkChoices?: Perk[];
  pendingEvent?: NarrativeEvent | null;
  floorBriefing?: FloorBriefing | null;
  newUnlocks?: string[];
}) => void;

export class GameEngine {
  private app: Application;
  private renderer!: IsometricRenderer;
  private camera: Camera;
  private events: EventBus;
  private rng!: SeededRNG;
  private combat!: CombatSystem;
  private dungeon!: DungeonGenerator;
  private storeUpdate: StoreUpdater;

  private state!: GameState;
  private movePath: Point[] = [];
  private moveProgress = 0;
  private moveSpeed = 6;
  private isMoving = false;
  private moveFrom: Point = { x: 0, y: 0 };
  private moveTo: Point = { x: 0, y: 0 };

  private shopItems: Item[] = [];
  private chestCounter = 0;
  private pendingPerkSelect = false;
  private previousPhase: GamePhase = GamePhase.EXPLORING;

  constructor(app: Application, storeUpdate: StoreUpdater) {
    this.app = app;
    this.camera = new Camera();
    this.events = new EventBus();
    this.storeUpdate = storeUpdate;
  }

  async init(): Promise<void> {
    this.renderer = new IsometricRenderer(this.app, this.camera);
    this.camera.setScreenSize(this.app.screen.width, this.app.screen.height);

    // Input handlers
    this.app.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.app.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.app.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
    this.app.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    // Resize handler
    const resize = () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      this.camera.setScreenSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    // Ticker
    this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
  }

  newGame(seed?: string): void {
    const gameSeed = seed || generateSeed();
    this.rng = new SeededRNG(gameSeed);
    this.combat = new CombatSystem(this.rng, this.events);
    this.combat.setFloor(1);
    this.chestCounter = 0;

    // Generate dungeon for floor 1
    this.dungeon = new DungeonGenerator(gameSeed, 1);
    const map = this.dungeon.generate();

    // Find start room center
    const startRoom = map.rooms.find(r => r.type === RoomType.START)!;
    const startX = Math.floor(startRoom.x + startRoom.width / 2);
    const startY = Math.floor(startRoom.y + startRoom.height / 2);

    // Apply meta-progression bonuses
    const metaBonus = applyMetaBonuses();

    // Create player
    const player: Player = {
      id: 'player',
      gridX: startX,
      gridY: startY,
      worldX: 0,
      worldY: 0,
      hp: 15 + metaBonus.hp,
      maxHp: 15 + metaBonus.hp,
      attackDice: 3,
      defenseDice: 2,
      level: 1,
      xp: 0,
      xpToNext: 30,
      scrap: metaBonus.scrap,
      weapon: null,
      armor: null,
      accessory: null,
      inventory: [],
      inventorySize: 8 + metaBonus.inventorySize,
      perks: [],
      totalScrapEarned: 0,
    };

    // Starter item from meta bonus
    if (metaBonus.starterItem) {
      const uncommons = [...WEAPONS, ...ARMORS, ...ACCESSORIES, ...CONSUMABLES]
        .filter(i => i.rarity === Rarity.UNCOMMON);
      if (uncommons.length > 0) {
        player.inventory.push(createItem(this.rng.pick(uncommons)));
      }
    }

    const { wx, wy } = gridToWorld(startX, startY);
    player.worldX = wx;
    player.worldY = wy;

    this.state = {
      phase: GamePhase.FLOOR_BRIEFING,
      player,
      map,
      combat: this.combat.state,
      seed: gameSeed,
      turn: 0,
      floor: 1,
    };

    // Build visual map
    this.renderer.buildMap(map);
    this.renderer.addPlayerSprite(player);

    // Center camera on start
    this.camera.snapTo(wx, wy);

    // Place entities in rooms
    this.populateRooms();

    // Show floor briefing
    this.storeUpdate({ floorBriefing: FLOOR_BRIEFINGS[0] });
    this.pushState();
  }

  /** Dismiss floor briefing and start exploring */
  dismissBriefing(): void {
    this.state.phase = GamePhase.EXPLORING;
    this.storeUpdate({ floorBriefing: null });
    this.pushState();
  }

  private populateRooms(): void {
    const { map } = this.state;
    const startRoom = map.rooms.find(r => r.type === RoomType.START)!;

    for (const room of map.rooms) {
      if (room.type === RoomType.START) continue;

      const cx = Math.floor(room.x + room.width / 2);
      const cy = Math.floor(room.y + room.height / 2);
      const dist = Math.abs(cx - (startRoom.x + startRoom.width / 2)) +
                   Math.abs(cy - (startRoom.y + startRoom.height / 2));
      const normalizedDist = Math.floor(dist / 10);

      if (room.type === RoomType.LOOT || room.type === RoomType.TRAP) {
        const chestId = `chest_${this.chestCounter++}`;
        this.renderer.addChestSprite(chestId, cx, cy);
        room.loot = generateLoot(normalizedDist + 1, this.rng);
      }

      if (room.type === RoomType.SHOP) {
        this.renderer.addShopSprite(`shop_${room.id}`, cx, cy);
      }
    }
  }

  // ── Input Handling ─────────────────────────────────────

  private clickStartPos: Point | null = null;

  private onPointerDown(e: PointerEvent): void {
    this.clickStartPos = { x: e.clientX, y: e.clientY };

    if (e.button === 1 || e.button === 2) {
      this.camera.startPan(e.clientX, e.clientY);
    }
  }

  private onPointerMove(e: PointerEvent): void {
    if (this.camera.panning) {
      this.camera.movePan(e.clientX, e.clientY);
    }
  }

  private onPointerUp(e: PointerEvent): void {
    if (this.camera.panning) {
      this.camera.endPan();
      this.clickStartPos = null;
      return;
    }

    // Only handle click if pointer hasn't moved much (not a drag)
    if (this.clickStartPos) {
      const dx = Math.abs(e.clientX - this.clickStartPos.x);
      const dy = Math.abs(e.clientY - this.clickStartPos.y);
      if (dx < 5 && dy < 5) {
        this.handleClick(e.clientX, e.clientY);
      }
    }
    this.clickStartPos = null;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    this.camera.zoomBy(e.deltaY > 0 ? -0.1 : 0.1);
  }

  private handleClick(sx: number, sy: number): void {
    if (this.state.phase === GamePhase.COMBAT) return;
    if (this.state.phase !== GamePhase.EXPLORING) return;
    if (this.isMoving) return;

    const grid = screenToGrid(
      sx, sy,
      this.camera.x, this.camera.y,
      this.camera.zoom,
      this.camera.screenW, this.camera.screenH
    );

    const { map, player } = this.state;
    if (grid.x < 0 || grid.x >= map.width || grid.y < 0 || grid.y >= map.height) return;

    const tile = map.tiles[grid.y][grid.x];
    if (tile.type === TileType.EMPTY || tile.type === TileType.WALL) return;

    // Find path
    const path = findPath(map, { x: player.gridX, y: player.gridY }, grid);
    if (path.length === 0) return;

    this.movePath = path;
    this.startNextMove();
  }

  private startNextMove(): void {
    if (this.movePath.length === 0) {
      this.isMoving = false;
      return;
    }

    const next = this.movePath.shift()!;
    this.isMoving = true;
    this.moveProgress = 0;
    this.moveFrom = { x: this.state.player.gridX, y: this.state.player.gridY };
    this.moveTo = next;
  }

  // ── Update Loop ────────────────────────────────────────

  private update(dt: number): void {
    // Handle movement animation
    if (this.isMoving) {
      this.moveProgress += dt * 0.016 * this.moveSpeed;

      if (this.moveProgress >= 1) {
        // Arrived at tile
        this.state.player.gridX = this.moveTo.x;
        this.state.player.gridY = this.moveTo.y;
        const { wx, wy } = gridToWorld(this.moveTo.x, this.moveTo.y);
        this.state.player.worldX = wx;
        this.state.player.worldY = wy;
        this.renderer.updateEntityPosition('player', this.moveTo.x, this.moveTo.y);

        // Reveal fog around player
        this.revealAroundPlayer();

        // Check room entry
        const tile = this.state.map.tiles[this.moveTo.y][this.moveTo.x];
        if (tile.roomId !== null) {
          const room = this.state.map.rooms[tile.roomId];
          if (!room.explored) {
            this.enterRoom(room);
            this.movePath = []; // Stop moving when entering a new room
            this.isMoving = false;
            this.pushState();
            return;
          }
        }

        // Continue path
        if (this.movePath.length > 0 && this.state.phase === GamePhase.EXPLORING) {
          this.startNextMove();
        } else {
          this.isMoving = false;
        }

        this.pushState();
      } else {
        // Interpolate position
        const fromWorld = gridToWorld(this.moveFrom.x, this.moveFrom.y);
        const toWorld = gridToWorld(this.moveTo.x, this.moveTo.y);
        this.state.player.worldX = lerp(fromWorld.wx, toWorld.wx, this.moveProgress);
        this.state.player.worldY = lerp(fromWorld.wy, toWorld.wy, this.moveProgress);

        // Update sprite position via interpolated grid position
        const interpGx = lerp(this.moveFrom.x, this.moveTo.x, this.moveProgress);
        const interpGy = lerp(this.moveFrom.y, this.moveTo.y, this.moveProgress);
        this.renderer.updateEntityPosition('player', interpGx, interpGy);
      }

      // Camera follows player
      this.camera.centerOn(this.state.player.worldX, this.state.player.worldY);
    }

    // Update renderer
    this.renderer.update(dt);
    this.state.combat = this.combat.state;
  }

  private revealAroundPlayer(): void {
    const { player, map } = this.state;
    const radius = 2;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const tx = player.gridX + dx;
        const ty = player.gridY + dy;
        if (tx >= 0 && tx < map.width && ty >= 0 && ty < map.height) {
          const tile = map.tiles[ty][tx];
          if (tile.visibility === Visibility.HIDDEN && tile.type !== TileType.EMPTY) {
            tile.visibility = Visibility.EXPLORED;
            this.renderer.updateTile(map, tx, ty);
          }
        }
      }
    }
  }

  private enterRoom(room: Room): void {
    room.explored = true;

    // Reveal room tiles
    for (let ry = room.y; ry < room.y + room.height; ry++) {
      for (let rx = room.x; rx < room.x + room.width; rx++) {
        if (ry >= 0 && ry < this.state.map.height && rx >= 0 && rx < this.state.map.width) {
          this.state.map.tiles[ry][rx].visibility = Visibility.VISIBLE;
        }
      }
    }
    // Also reveal adjacent corridors
    for (let ry = room.y - 1; ry <= room.y + room.height; ry++) {
      for (let rx = room.x - 1; rx <= room.x + room.width; rx++) {
        if (ry >= 0 && ry < this.state.map.height && rx >= 0 && rx < this.state.map.width) {
          const tile = this.state.map.tiles[ry][rx];
          if (tile.type === TileType.CORRIDOR || tile.type === TileType.DOOR) {
            tile.visibility = Visibility.VISIBLE;
          }
        }
      }
    }

    this.renderer.revealRoom(this.state.map, room);
    this.events.emit('ROOM_ENTERED', { room });

    // Handle room type
    switch (room.type) {
      case RoomType.ENEMY:
        this.handleEnemyRoom(room);
        break;
      case RoomType.LOOT:
        this.handleLootRoom(room);
        break;
      case RoomType.TRAP:
        this.handleTrapRoom(room);
        break;
      case RoomType.SHOP:
        this.handleShopRoom(room);
        break;
      case RoomType.EVENT:
        this.handleEventRoom(room);
        break;
      case RoomType.BOSS:
        this.handleBossRoom(room);
        break;
      case RoomType.STAIRS:
        this.handleStairsRoom(room);
        break;
    }
  }

  private handleEnemyRoom(room: Room): void {
    const startRoom = this.state.map.rooms.find(r => r.type === RoomType.START)!;
    const dist = Math.abs(room.x - startRoom.x) + Math.abs(room.y - startRoom.y);
    const normalizedDist = Math.floor(dist / 8) + 1;

    const enemyTypes = getEnemiesForRoom(normalizedDist, this.state.floor, this.rng);

    // Place enemies visually
    const cx = Math.floor(room.x + room.width / 2);
    const cy = Math.floor(room.y + room.height / 2);

    for (let i = 0; i < enemyTypes.length; i++) {
      const ex = cx + (i % 2 === 0 ? -1 : 1) * Math.ceil(i / 2);
      const ey = cy - 1;
      const template = ENEMY_TEMPLATES[enemyTypes[i]];
      const hpScale = 1 + (this.state.floor - 1) * 0.3;
      const scaledHp = Math.round(template.hp * hpScale);
      const enemy = {
        id: `enemy_${Date.now()}_${i}`,
        gridX: ex, gridY: ey,
        worldX: 0, worldY: 0,
        name: template.name,
        type: enemyTypes[i],
        tier: template.tier,
        hp: scaledHp,
        maxHp: scaledHp,
        attackDice: template.attackDice,
        defenseDice: template.defenseDice,
        xpReward: template.xpReward,
        scrapReward: template.scrapReward,
        description: template.description,
        statusEffects: [],
      };
      room.enemies.push(enemy);
      this.renderer.addEnemySprite(enemy);
    }

    this.state.phase = GamePhase.COMBAT;
    this.combat.startCombat(enemyTypes, cx, cy);
    this.renderer.triggerScreenShake(3);
  }

  private handleBossRoom(room: Room): void {
    const cx = Math.floor(room.x + room.width / 2);
    const cy = Math.floor(room.y + room.height / 2);

    const template = ENEMY_TEMPLATES[EnemyType.BROOD_QUEEN];
    const hpScale = 1 + (this.state.floor - 1) * 0.3;
    const scaledHp = Math.round(template.hp * hpScale);
    const boss = {
      id: `boss_${Date.now()}`,
      gridX: cx, gridY: cy - 1,
      worldX: 0, worldY: 0,
      name: template.name,
      type: EnemyType.BROOD_QUEEN,
      tier: template.tier,
      hp: scaledHp,
      maxHp: scaledHp,
      attackDice: template.attackDice,
      defenseDice: template.defenseDice,
      xpReward: template.xpReward,
      scrapReward: template.scrapReward,
      description: template.description,
      statusEffects: [],
    };
    room.enemies.push(boss);
    this.renderer.addEnemySprite(boss);

    this.state.phase = GamePhase.COMBAT;
    this.combat.startCombat([EnemyType.BROOD_QUEEN], cx, cy);
    this.combat.addLog('THE BROOD QUEEN AWAKENS!', 'system');
    this.renderer.triggerScreenShake(8);
  }

  private handleLootRoom(room: Room): void {
    if (room.loot.length > 0) {
      this.combat.addLog('You found a supply cache!', 'loot');
      for (const item of room.loot) {
        if (this.state.player.inventory.length < this.state.player.inventorySize) {
          this.state.player.inventory.push(item);
          this.combat.addLog(`Found: ${item.name}`, 'loot');
        } else {
          this.combat.addLog(`Inventory full! ${item.name} left behind.`, 'info');
        }
      }
      room.loot = [];
      room.cleared = true;
      this.renderer.spawnParticles(
        Math.floor(room.x + room.width / 2),
        Math.floor(room.y + room.height / 2),
        COLORS.SCRAP_ORANGE, 15
      );
    }
  }

  private handleTrapRoom(room: Room): void {
    if (!room.cleared) {
      // Trap Sense perk: immune to traps
      if (this.state.player.perks.includes('trap_sense')) {
        this.combat.addLog('Your Trap Sense lets you avoid the trap!', 'player');
        room.cleared = true;
      } else {
        const damage = this.rng.int(2, 5);
        this.state.player.hp = Math.max(0, this.state.player.hp - damage);
        this.combat.addLog(`TRAP! You take ${damage} damage!`, 'damage');
        room.cleared = true;
        this.renderer.triggerScreenShake(5);
        this.renderer.spawnParticles(
          this.state.player.gridX, this.state.player.gridY,
          COLORS.SPARK_ORANGE, 20
        );
      }

      // Also may have loot
      if (room.loot.length > 0) {
        for (const item of room.loot) {
          if (this.state.player.inventory.length < this.state.player.inventorySize) {
            this.state.player.inventory.push(item);
            this.combat.addLog(`Found: ${item.name}`, 'loot');
          }
        }
        room.loot = [];
      }

      if (this.state.player.hp <= 0) {
        this.state.phase = GamePhase.GAME_OVER;
        this.endRun(false);
      }
    }
  }

  private handleShopRoom(room: Room): void {
    this.shopItems = generateShopItems(this.rng);
    this.state.phase = GamePhase.SHOP;
    this.combat.addLog('You found a salvage terminal.', 'system');
    room.cleared = true;
    this.pushState();
    this.storeUpdate({ shopItems: this.shopItems });
  }

  private handleEventRoom(room: Room): void {
    if (!room.cleared) {
      const event = getRandomEvent(this.state.floor, this.rng);
      this.state.phase = GamePhase.EVENT_CHOICE;
      this.storeUpdate({ pendingEvent: event });
      room.cleared = true;
    }
  }

  /** Handle player's choice in a narrative event */
  resolveEventChoice(choiceIndex: number, event: NarrativeEvent): void {
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    const outcome = choice.outcome;
    const { player } = this.state;

    // Apply outcome
    if (outcome.hpChange) {
      const change = outcome.hpChange;
      if (change > 0) {
        // Heal - apply field medic bonus
        const healAmount = player.perks.includes('field_medic')
          ? Math.floor(change * 1.5) : change;
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        this.combat.addLog(`Restored ${healAmount} HP.`, 'loot');
      } else {
        player.hp = Math.max(0, player.hp + change);
        this.combat.addLog(`Lost ${Math.abs(change)} HP.`, 'damage');
      }
    }

    if (outcome.scrapChange) {
      const scrap = player.perks.includes('scavenger')
        ? Math.floor(outcome.scrapChange * 1.5) : outcome.scrapChange;
      player.scrap += scrap;
      player.totalScrapEarned += scrap;
      this.combat.addLog(`${scrap > 0 ? '+' : ''}${scrap} scrap.`, 'loot');
    }

    if (outcome.xpChange) {
      this.grantXP(outcome.xpChange);
      this.combat.addLog(`+${outcome.xpChange} XP.`, 'info');
    }

    if (outcome.item) {
      const loot = generateLoot(this.state.floor + 1, this.rng);
      if (loot.length > 0 && player.inventory.length < player.inventorySize) {
        player.inventory.push(loot[0]);
        this.combat.addLog(`Found: ${loot[0].name}`, 'loot');
      }
    }

    this.combat.addLog(outcome.text, 'system');

    if (player.hp <= 0) {
      this.state.phase = GamePhase.GAME_OVER;
      this.endRun(false);
    } else {
      this.state.phase = GamePhase.EXPLORING;
    }

    this.storeUpdate({ pendingEvent: null });
    this.pushState();
  }

  private handleStairsRoom(room: Room): void {
    room.cleared = true;
    this.combat.addLog('You found the stairs to the next deck!', 'system');
    this.combat.addLog('Click DESCEND when ready.', 'info');
    // The UI will show a "DESCEND" button; the player calls descendFloor()
  }

  /** Descend to next floor */
  descendFloor(): void {
    const nextFloor = this.state.floor + 1;
    if (nextFloor > 3) return;

    // Keep player state, destroy current map
    this.renderer.destroy();
    this.renderer = new IsometricRenderer(this.app, this.camera);

    this.state.floor = nextFloor;
    this.combat.setFloor(nextFloor);

    // Generate new dungeon
    this.dungeon = new DungeonGenerator(this.state.seed, nextFloor);
    const map = this.dungeon.generate();
    this.state.map = map;

    // Find new start room
    const startRoom = map.rooms.find(r => r.type === RoomType.START)!;
    const startX = Math.floor(startRoom.x + startRoom.width / 2);
    const startY = Math.floor(startRoom.y + startRoom.height / 2);

    // Move player to new start
    this.state.player.gridX = startX;
    this.state.player.gridY = startY;
    const { wx, wy } = gridToWorld(startX, startY);
    this.state.player.worldX = wx;
    this.state.player.worldY = wy;

    // Build new visual map
    this.renderer.buildMap(map);
    this.renderer.addPlayerSprite(this.state.player);
    this.camera.snapTo(wx, wy);

    this.populateRooms();

    // Show floor briefing
    const briefing = FLOOR_BRIEFINGS.find(b => b.floor === nextFloor);
    this.state.phase = GamePhase.FLOOR_BRIEFING;
    this.storeUpdate({ floorBriefing: briefing || null });

    this.combat.endCombat();
    this.events.emit('FLOOR_DESCENDED', { floor: nextFloor });
    this.pushState();
  }

  // ── Public API for React UI ────────────────────────────

  /** Player attacks in combat */
  doPlayerAttack(): void {
    if (this.state.phase !== GamePhase.COMBAT) return;
    if (this.combat.state.phase !== CombatPhase.PLAYER_TURN) return;

    // Process start-of-turn status effects
    this.combat.processStatusEffects(this.state.player);
    const phaseAfterEffects = this.combat.state.phase as CombatPhase;
    if (!this.combat.state.active) {
      if (phaseAfterEffects === CombatPhase.VICTORY) {
        this.handleCombatVictory();
      } else if (phaseAfterEffects === CombatPhase.DEFEAT) {
        this.state.phase = GamePhase.GAME_OVER;
        this.endRun(false);
      }
      this.pushState();
      return;
    }

    const result = this.combat.playerAttack(this.state.player);

    if (result.killed) {
      this.renderer.spawnParticles(
        this.state.player.gridX, this.state.player.gridY,
        COLORS.ICHOR_GREEN, 20
      );
    }

    if (result.damage > 0) {
      this.renderer.triggerScreenShake(2);
    }

    // Re-read phase after mutation
    const postPhase = this.combat.state.phase as CombatPhase;

    // Double Tap: player gets another turn
    if (result.doubleTap && this.combat.state.active) {
      this.pushState();
      return;
    }

    // If combat not over and it's enemy turn, auto-attack after delay
    if (this.combat.state.active && postPhase === CombatPhase.ENEMY_TURN) {
      setTimeout(() => this.doEnemyAttack(), 800);
    }

    // Check victory
    if (postPhase === CombatPhase.VICTORY) {
      this.handleCombatVictory();
    }

    this.pushState();
  }

  /** Player defends in combat */
  doPlayerDefend(): void {
    if (this.state.phase !== GamePhase.COMBAT) return;
    if (this.combat.state.phase !== CombatPhase.PLAYER_TURN) return;

    this.combat.playerDefend(this.state.player);
    setTimeout(() => this.doEnemyAttack(), 800);
    this.pushState();
  }

  /** Player flees combat */
  doPlayerFlee(): void {
    if (this.state.phase !== GamePhase.COMBAT) return;
    if (this.combat.state.phase !== CombatPhase.PLAYER_TURN) return;

    const escaped = this.combat.playerFlee(this.state.player);

    if (escaped) {
      // Remove enemy sprites
      for (const enemy of this.combat.state.enemies) {
        this.renderer.removeEnemySprite(enemy.id);
      }
      // Mark room as cleared (so re-entering doesn't trigger combat again)
      const tile = this.state.map.tiles[this.state.player.gridY][this.state.player.gridX];
      if (tile.roomId !== null) {
        this.state.map.rooms[tile.roomId].cleared = true;
      }
      setTimeout(() => {
        this.combat.endCombat();
        this.state.phase = GamePhase.EXPLORING;
        this.pushState();
      }, 1000);
    } else {
      // Failed flee → enemy turn
      setTimeout(() => this.doEnemyAttack(), 800);
    }

    this.pushState();
  }

  /** Use item mid-combat */
  useItemInCombat(itemId: string): void {
    if (this.state.phase !== GamePhase.COMBAT) return;
    if (this.combat.state.phase !== CombatPhase.PLAYER_TURN) return;

    const { player } = this.state;
    const idx = player.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return;

    const item = player.inventory[idx];
    if (item.type !== ItemType.CONSUMABLE) return;

    this.useConsumable(item as Consumable, idx);

    // Using an item consumes the turn
    this.combat.state.phase = CombatPhase.ENEMY_TURN;
    setTimeout(() => this.doEnemyAttack(), 800);
    this.pushState();
  }

  private doEnemyAttack(): void {
    if (!this.combat.state.active) return;

    const result = this.combat.enemyAttack(this.state.player);

    if (result.damage > 0) {
      this.renderer.triggerScreenShake(3);
      this.renderer.spawnParticles(
        this.state.player.gridX, this.state.player.gridY,
        COLORS.SPARK_ORANGE, 10
      );
    }

    if (this.combat.state.phase === CombatPhase.DEFEAT) {
      this.state.phase = GamePhase.GAME_OVER;
      this.endRun(false);
    }

    if (this.combat.state.phase === CombatPhase.VICTORY) {
      this.handleCombatVictory();
    }

    this.pushState();
  }

  private handleCombatVictory(): void {
    const rewards = this.combat.getRewards();
    let scrap = rewards.scrap;

    // Scavenger perk: +50% scrap
    if (this.state.player.perks.includes('scavenger')) {
      scrap = Math.floor(scrap * 1.5);
    }

    this.state.player.scrap += scrap;
    this.state.player.totalScrapEarned += scrap;
    this.grantXP(rewards.xp);

    this.combat.addLog(`Victory! +${rewards.xp} XP, +${scrap} scrap`, 'loot');

    // Regenerator perk: heal 2 after combat
    if (this.state.player.perks.includes('regenerator')) {
      const regen = 2;
      this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + regen);
      this.combat.addLog(`Regenerator restores ${regen} HP.`, 'loot');
    }

    // Regen from accessory
    if (this.state.player.accessory?.effect === 'regen') {
      const regen = this.state.player.accessory.effectValue;
      this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + regen);
      this.combat.addLog(`Medic Implant restores ${regen} HP.`, 'loot');
    }

    // Remove enemy sprites
    for (const enemy of this.combat.state.enemies) {
      this.renderer.removeEnemySprite(enemy.id);
    }

    // Check boss
    const isBoss = this.combat.state.enemies.some(e => e.type === EnemyType.BROOD_QUEEN);
    if (isBoss) {
      this.state.phase = GamePhase.VICTORY;
      this.events.emit('BOSS_DEFEATED', {});
      this.endRun(true);
    } else {
      // Mark room cleared
      const tile = this.state.map.tiles[this.state.player.gridY][this.state.player.gridX];
      if (tile.roomId !== null) {
        this.state.map.rooms[tile.roomId].cleared = true;
      }

      setTimeout(() => {
        this.combat.endCombat();
        // Check if pending perk select
        if (this.pendingPerkSelect) {
          this.pendingPerkSelect = false;
          this.triggerPerkSelect();
        } else {
          this.state.phase = GamePhase.EXPLORING;
        }
        this.pushState();
      }, 1500);
    }
  }

  // ── Perk System ────────────────────────────────────────

  private triggerPerkSelect(): void {
    const choices = getRandomPerks(this.state.player.perks, this.rng);
    if (choices.length === 0) {
      this.state.phase = GamePhase.EXPLORING;
      return;
    }
    this.state.phase = GamePhase.PERK_SELECT;
    this.storeUpdate({ perkChoices: choices });
  }

  /** Player selects a perk */
  selectPerk(perkId: PerkId): void {
    const perk = PERKS[perkId];
    if (!perk) return;

    this.state.player.perks.push(perkId);

    // Apply immediate stat perks
    if (perkId === 'sharp_shooter') {
      // Handled in combat system
    }
    if (perkId === 'iron_skin') {
      // Handled in combat system
    }
    if (perkId === 'pack_rat') {
      this.state.player.inventorySize += 4;
    }

    this.combat.addLog(`Perk acquired: ${perk.name}!`, 'crit');
    this.events.emit('PERK_SELECTED', { perk: perkId });

    this.state.phase = GamePhase.EXPLORING;
    this.storeUpdate({ perkChoices: [] });
    this.pushState();
  }

  private grantXP(amount: number): void {
    this.state.player.xp += amount;
    while (this.state.player.xp >= this.state.player.xpToNext) {
      this.state.player.xp -= this.state.player.xpToNext;
      this.state.player.level++;
      this.state.player.maxHp += 3;
      this.state.player.hp = this.state.player.maxHp;
      this.state.player.attackDice += (this.state.player.level % 2 === 0 ? 1 : 0);
      this.state.player.defenseDice += (this.state.player.level % 2 === 1 ? 1 : 0);
      this.state.player.xpToNext = Math.floor(this.state.player.xpToNext * 1.5);

      this.combat.addLog(`LEVEL UP! You are now level ${this.state.player.level}!`, 'crit');
      this.renderer.spawnParticles(this.state.player.gridX, this.state.player.gridY, COLORS.PLAYER_VISOR, 25);
      this.events.emit('PLAYER_LEVEL_UP', { level: this.state.player.level });

      // Queue perk selection
      this.pendingPerkSelect = true;
    }
  }

  // ── Item Management ────────────────────────────────────

  /** Equip an item from inventory */
  equipItem(itemId: string): void {
    const { player } = this.state;
    const idx = player.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return;

    const item = player.inventory[idx];

    switch (item.type) {
      case ItemType.WEAPON: {
        if (player.weapon) player.inventory.push(player.weapon);
        player.weapon = item;
        player.inventory.splice(idx, 1);
        break;
      }
      case ItemType.ARMOR: {
        if (player.armor) {
          player.maxHp -= player.armor.maxHpBonus;
          player.inventory.push(player.armor);
        }
        player.armor = item;
        player.maxHp += item.maxHpBonus;
        player.hp = Math.min(player.hp, player.maxHp);
        player.inventory.splice(idx, 1);
        break;
      }
      case ItemType.ACCESSORY: {
        if (player.accessory) player.inventory.push(player.accessory);
        player.accessory = item;
        player.inventory.splice(idx, 1);
        break;
      }
      case ItemType.CONSUMABLE: {
        this.useConsumable(item as Consumable, idx);
        break;
      }
    }

    this.pushState();
  }

  private useConsumable(item: Consumable, invIdx: number): void {
    const { player } = this.state;

    switch (item.effect) {
      case ConsumableEffect.HEAL: {
        let healAmount = item.effectValue;
        if (player.perks.includes('field_medic')) {
          healAmount = Math.floor(healAmount * 1.5);
        }
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        this.combat.addLog(`Used ${item.name}. Restored ${healAmount} HP.`, 'loot');
        break;
      }
      case ConsumableEffect.BOOST_ATTACK:
        this.combat.applyBoost('attack', item.effectValue);
        this.combat.addLog(`Used ${item.name}. +${item.effectValue} attack dice next combat.`, 'loot');
        break;
      case ConsumableEffect.BOOST_DEFENSE:
        this.combat.applyBoost('defense', item.effectValue);
        this.combat.addLog(`Used ${item.name}. +${item.effectValue} defense dice next combat.`, 'loot');
        break;
      case ConsumableEffect.DAMAGE_ALL:
        if (this.combat.state.active) {
          for (const enemy of this.combat.state.enemies) {
            if (enemy.hp > 0) {
              enemy.hp = Math.max(0, enemy.hp - item.effectValue);
              this.combat.addLog(`${item.name} deals ${item.effectValue} damage to ${enemy.name}!`, 'damage');
            }
          }
        }
        break;
    }

    player.inventory.splice(invIdx, 1);
  }

  /** Drop an item from inventory */
  dropItem(itemId: string): void {
    const idx = this.state.player.inventory.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      this.state.player.inventory.splice(idx, 1);
      this.pushState();
    }
  }

  /** Sell an item for 50% value */
  sellItem(itemId: string): void {
    if (this.state.phase === GamePhase.COMBAT) return;
    const idx = this.state.player.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return;

    const item = this.state.player.inventory[idx];
    const sellPrice = Math.floor(item.value * 0.5);
    this.state.player.scrap += sellPrice;
    this.state.player.totalScrapEarned += sellPrice;
    this.state.player.inventory.splice(idx, 1);
    this.combat.addLog(`Sold ${item.name} for ${sellPrice} scrap.`, 'loot');
    this.pushState();
  }

  /** Buy an item from shop */
  buyItem(itemId: string): void {
    const idx = this.shopItems.findIndex(i => i.id === itemId);
    if (idx === -1) return;

    const item = this.shopItems[idx];
    if (this.state.player.scrap < item.value) return;
    if (this.state.player.inventory.length >= this.state.player.inventorySize) return;

    this.state.player.scrap -= item.value;
    this.state.player.inventory.push(item);
    this.shopItems.splice(idx, 1);
    this.combat.addLog(`Purchased ${item.name} for ${item.value} scrap.`, 'loot');
    this.pushState();
    this.storeUpdate({ shopItems: this.shopItems });
  }

  /** Leave the shop */
  leaveShop(): void {
    this.state.phase = GamePhase.EXPLORING;
    this.shopItems = [];
    this.pushState();
    this.storeUpdate({ shopItems: [] });
  }

  // ── Meta-Progression ───────────────────────────────────

  private endRun(victory: boolean): void {
    const previousRuns = getRuns();
    const record: RunRecord = {
      floor: this.state.floor,
      level: this.state.player.level,
      scrap: this.state.player.scrap,
      totalScrap: this.state.player.totalScrapEarned,
      victory,
      perks: [...this.state.player.perks],
      seed: this.state.seed,
      timestamp: Date.now(),
    };
    saveRun(record);

    // Check for new unlocks
    const newUnlocks = getNewUnlocks(previousRuns, record);
    if (newUnlocks.length > 0) {
      this.storeUpdate({ newUnlocks: newUnlocks.map(u => u.name) });
    }
  }

  /** Restart game */
  restart(): void {
    this.renderer.destroy();
    this.renderer = new IsometricRenderer(this.app, this.camera);
    this.events.clear();
    this.combat.endCombat();
    this.pendingPerkSelect = false;
    this.storeUpdate({
      perkChoices: [],
      pendingEvent: null,
      floorBriefing: null,
      newUnlocks: [],
    });
    this.newGame();
  }

  /** Push state to Zustand store */
  private pushState(): void {
    this.storeUpdate({
      phase: this.state.phase,
      player: { ...this.state.player },
      map: this.state.map,
      combat: { ...this.combat.state },
      seed: this.state.seed,
      turn: this.state.turn,
      floor: this.state.floor,
    });
  }

  getState(): GameState {
    return this.state;
  }

  getCamera(): Camera {
    return this.camera;
  }

  getMap() {
    return this.state?.map;
  }

  destroy(): void {
    this.renderer.destroy();
    this.events.clear();
  }
}
