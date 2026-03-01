import { Application, Container, Graphics } from 'pixi.js';
import { GameMap, TileType, Visibility, Room, Player, Enemy } from '../types';
import { gridToWorld } from '../utils/math';
import { Camera } from './Camera';
import { drawTile } from './TileSprites';
import { drawPlayer, drawEnemy, drawChest, drawShopTerminal } from './EntityRenderer';
import { COLORS } from '../utils/colors';

interface EntitySprite {
  container: Container;
  graphics: Graphics;
  gridX: number;
  gridY: number;
  type: 'player' | 'enemy' | 'chest' | 'shop';
  data?: unknown;
}

export class IsometricRenderer {
  private app: Application;
  private camera: Camera;
  private worldContainer: Container;
  private tileGraphics: Map<string, Graphics> = new Map();
  private entitySprites: Map<string, EntitySprite> = new Map();
  private time = 0;
  private lastMap: GameMap | null = null;
  private particleContainer: Container;
  private particles: Particle[] = [];
  private screenShake = 0;

  constructor(app: Application, camera: Camera) {
    this.app = app;
    this.camera = camera;
    this.worldContainer = new Container();
    this.particleContainer = new Container();
    this.app.stage.addChild(this.worldContainer);
    this.app.stage.addChild(this.particleContainer);
  }

  /** Full rebuild of the tile map */
  buildMap(map: GameMap): void {
    this.lastMap = map;
    // Clear existing
    for (const g of this.tileGraphics.values()) {
      g.destroy();
    }
    this.tileGraphics.clear();
    this.worldContainer.removeChildren();

    // Create tiles in painter's algorithm order (back to front)
    for (let gy = 0; gy < map.height; gy++) {
      for (let gx = 0; gx < map.width; gx++) {
        const tile = map.tiles[gy][gx];
        if (tile.type === TileType.EMPTY && tile.visibility === Visibility.HIDDEN) continue;

        const g = new Graphics();
        const { wx, wy } = gridToWorld(gx, gy);
        g.x = wx;
        g.y = wy;

        const room = tile.roomId !== null ? map.rooms[tile.roomId] : null;
        drawTile(g, tile.type, tile.visibility, room?.type);

        this.worldContainer.addChild(g);
        this.tileGraphics.set(`${gx},${gy}`, g);
      }
    }
  }

  /** Update a single tile (for fog reveals) */
  updateTile(map: GameMap, gx: number, gy: number): void {
    const key = `${gx},${gy}`;
    const tile = map.tiles[gy][gx];

    let g = this.tileGraphics.get(key);
    if (!g) {
      if (tile.type === TileType.EMPTY && tile.visibility === Visibility.HIDDEN) return;
      g = new Graphics();
      const { wx, wy } = gridToWorld(gx, gy);
      g.x = wx;
      g.y = wy;
      this.worldContainer.addChild(g);
      this.tileGraphics.set(key, g);
    }

    const room = tile.roomId !== null ? map.rooms[tile.roomId] : null;
    drawTile(g, tile.type, tile.visibility, room?.type);
  }

  /** Reveal all tiles in a room */
  revealRoom(map: GameMap, room: Room): void {
    for (let ry = room.y - 1; ry <= room.y + room.height; ry++) {
      for (let rx = room.x - 1; rx <= room.x + room.width; rx++) {
        if (ry >= 0 && ry < map.height && rx >= 0 && rx < map.width) {
          this.updateTile(map, rx, ry);
        }
      }
    }
  }

  // ── Entity Management ──────────────────────────────────

  addPlayerSprite(player: Player): void {
    const container = new Container();
    const graphics = new Graphics();
    container.addChild(graphics);
    this.worldContainer.addChild(container);

    this.entitySprites.set('player', {
      container,
      graphics,
      gridX: player.gridX,
      gridY: player.gridY,
      type: 'player',
      data: player,
    });
  }

  addEnemySprite(enemy: Enemy): void {
    const container = new Container();
    const graphics = new Graphics();
    container.addChild(graphics);
    this.worldContainer.addChild(container);

    this.entitySprites.set(enemy.id, {
      container,
      graphics,
      gridX: enemy.gridX,
      gridY: enemy.gridY,
      type: 'enemy',
      data: enemy,
    });
  }

  removeEnemySprite(enemyId: string): void {
    const sprite = this.entitySprites.get(enemyId);
    if (sprite) {
      sprite.container.destroy();
      this.entitySprites.delete(enemyId);
    }
  }

  addChestSprite(id: string, gx: number, gy: number): void {
    const container = new Container();
    const graphics = new Graphics();
    container.addChild(graphics);
    this.worldContainer.addChild(container);

    this.entitySprites.set(id, {
      container, graphics, gridX: gx, gridY: gy,
      type: 'chest', data: { opened: false },
    });
  }

  addShopSprite(id: string, gx: number, gy: number): void {
    const container = new Container();
    const graphics = new Graphics();
    container.addChild(graphics);
    this.worldContainer.addChild(container);

    this.entitySprites.set(id, {
      container, graphics, gridX: gx, gridY: gy,
      type: 'shop',
    });
  }

  setChestOpened(id: string): void {
    const sprite = this.entitySprites.get(id);
    if (sprite && sprite.type === 'chest') {
      (sprite.data as { opened: boolean }).opened = true;
    }
  }

  updateEntityPosition(id: string, gx: number, gy: number): void {
    const sprite = this.entitySprites.get(id);
    if (sprite) {
      sprite.gridX = gx;
      sprite.gridY = gy;
    }
  }

  // ── Particles ──────────────────────────────────────────

  spawnParticles(gx: number, gy: number, color: number, count: number): void {
    const { wx, wy } = gridToWorld(gx, gy);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: wx,
        y: wy - 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        color,
        size: 1 + Math.random() * 2,
        graphics: new Graphics(),
      });
      this.particleContainer.addChild(this.particles[this.particles.length - 1].graphics);
    }
  }

  triggerScreenShake(intensity: number): void {
    this.screenShake = intensity;
  }

  // ── Update Loop ────────────────────────────────────────

  update(dt: number): void {
    this.time += dt * 0.016; // Normalize to ~seconds
    this.camera.update();

    const { screenW, screenH } = this.camera;

    // Screen shake
    let shakeX = 0, shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake * 4;
      shakeY = (Math.random() - 0.5) * this.screenShake * 4;
      this.screenShake *= 0.9;
      if (this.screenShake < 0.1) this.screenShake = 0;
    }

    // Position world container based on camera
    this.worldContainer.x = -this.camera.x * this.camera.zoom + screenW / 2 + shakeX;
    this.worldContainer.y = -this.camera.y * this.camera.zoom + screenH / 2 + shakeY;
    this.worldContainer.scale.set(this.camera.zoom);

    // Update entity sprites
    for (const [id, sprite] of this.entitySprites) {
      const { wx, wy } = gridToWorld(sprite.gridX, sprite.gridY);
      sprite.container.x = wx;
      sprite.container.y = wy;

      switch (sprite.type) {
        case 'player':
          drawPlayer(sprite.graphics, sprite.data as Player, this.time);
          break;
        case 'enemy':
          drawEnemy(sprite.graphics, sprite.data as Enemy, this.time);
          break;
        case 'chest':
          drawChest(sprite.graphics, (sprite.data as { opened: boolean }).opened, this.time);
          break;
        case 'shop':
          drawShopTerminal(sprite.graphics, this.time);
          break;
      }
    }

    // Sort world container children by y for painter's algorithm
    this.worldContainer.children.sort((a, b) => a.y - b.y);

    // Update particles
    this.particleContainer.x = this.worldContainer.x;
    this.particleContainer.y = this.worldContainer.y;
    this.particleContainer.scale.set(this.camera.zoom);
    this.updateParticles();
  }

  private updateParticles(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life -= p.decay;

      if (p.life <= 0) {
        p.graphics.destroy();
        this.particles.splice(i, 1);
        continue;
      }

      p.graphics.clear();
      p.graphics.circle(p.x, p.y, p.size * p.life);
      p.graphics.fill({ color: p.color, alpha: p.life });
    }
  }

  destroy(): void {
    try {
      this.worldContainer.destroy({ children: true });
      this.particleContainer.destroy({ children: true });
    } catch {
      // May already be destroyed by parent
    }
    this.tileGraphics.clear();
    this.entitySprites.clear();
    this.particles = [];
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: number;
  size: number;
  graphics: Graphics;
}
