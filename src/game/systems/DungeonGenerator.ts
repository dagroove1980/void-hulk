import { GameMap, Room, RoomType, Tile, TileType, Visibility, Point } from '../types';
import { SeededRNG } from '../utils/rng';

const MAP_SIZE = 50;
const MIN_ROOM_SIZE = 5;
const MAX_ROOM_SIZE = 9;
const EXTRA_CONNECTIONS = 3;

// Room counts per floor: floor 1 → 10, floor 2 → 12, floor 3 → 14
function getRoomCount(floor: number): number {
  return 10 + (floor - 1) * 2;
}

export class DungeonGenerator {
  private rng: SeededRNG;
  private tiles: Tile[][] = [];
  private rooms: Room[] = [];
  private floor: number;

  constructor(seed: string, floor = 1) {
    // Append floor to seed so each floor is unique
    this.rng = new SeededRNG(`${seed}_f${floor}`);
    this.floor = floor;
  }

  generate(): GameMap {
    this.initTiles();
    this.placeRooms();
    this.connectRooms();
    this.assignRoomTypes();
    return {
      width: MAP_SIZE,
      height: MAP_SIZE,
      tiles: this.tiles,
      rooms: this.rooms,
      corridors: [],
    };
  }

  private initTiles(): void {
    this.tiles = [];
    for (let y = 0; y < MAP_SIZE; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < MAP_SIZE; x++) {
        this.tiles[y][x] = {
          type: TileType.EMPTY,
          visibility: Visibility.HIDDEN,
          roomId: null,
        };
      }
    }
  }

  private placeRooms(): void {
    let attempts = 0;
    const maxAttempts = 500;
    const numRooms = getRoomCount(this.floor);

    while (this.rooms.length < numRooms && attempts < maxAttempts) {
      attempts++;
      const w = this.rng.int(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
      const h = this.rng.int(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
      const x = this.rng.int(2, MAP_SIZE - w - 2);
      const y = this.rng.int(2, MAP_SIZE - h - 2);

      if (!this.overlapsAny(x, y, w, h)) {
        const room: Room = {
          id: this.rooms.length,
          x, y, width: w, height: h,
          type: RoomType.ENEMY,
          explored: false,
          cleared: false,
          enemies: [],
          loot: [],
          connections: [],
        };
        this.rooms.push(room);
        this.carveRoom(room);
      }
    }
  }

  private overlapsAny(x: number, y: number, w: number, h: number): boolean {
    const pad = 2; // minimum gap between rooms
    for (const room of this.rooms) {
      if (
        x - pad < room.x + room.width &&
        x + w + pad > room.x &&
        y - pad < room.y + room.height &&
        y + h + pad > room.y
      ) {
        return true;
      }
    }
    return false;
  }

  private carveRoom(room: Room): void {
    for (let ry = room.y; ry < room.y + room.height; ry++) {
      for (let rx = room.x; rx < room.x + room.width; rx++) {
        if (
          ry === room.y || ry === room.y + room.height - 1 ||
          rx === room.x || rx === room.x + room.width - 1
        ) {
          this.tiles[ry][rx] = { type: TileType.WALL, visibility: Visibility.HIDDEN, roomId: room.id };
        } else {
          this.tiles[ry][rx] = { type: TileType.FLOOR, visibility: Visibility.HIDDEN, roomId: room.id };
        }
      }
    }
  }

  /** Connect rooms using minimum spanning tree + extra loops */
  private connectRooms(): void {
    if (this.rooms.length < 2) return;

    // Build distance matrix using room centers
    const centers = this.rooms.map(r => ({
      x: Math.floor(r.x + r.width / 2),
      y: Math.floor(r.y + r.height / 2),
    }));

    // Prim's MST
    const inTree = new Set<number>([0]);
    const edges: [number, number][] = [];

    while (inTree.size < this.rooms.length) {
      let bestDist = Infinity;
      let bestA = -1;
      let bestB = -1;

      for (const a of inTree) {
        for (let b = 0; b < this.rooms.length; b++) {
          if (inTree.has(b)) continue;
          const dist = Math.abs(centers[a].x - centers[b].x) + Math.abs(centers[a].y - centers[b].y);
          if (dist < bestDist) {
            bestDist = dist;
            bestA = a;
            bestB = b;
          }
        }
      }

      if (bestB >= 0) {
        inTree.add(bestB);
        edges.push([bestA, bestB]);
        this.rooms[bestA].connections.push(bestB);
        this.rooms[bestB].connections.push(bestA);
      }
    }

    // Add extra connections for loops
    for (let i = 0; i < EXTRA_CONNECTIONS; i++) {
      const a = this.rng.int(0, this.rooms.length - 1);
      let b = this.rng.int(0, this.rooms.length - 1);
      if (a === b) b = (b + 1) % this.rooms.length;
      if (!this.rooms[a].connections.includes(b)) {
        edges.push([a, b]);
        this.rooms[a].connections.push(b);
        this.rooms[b].connections.push(a);
      }
    }

    // Carve corridors
    for (const [a, b] of edges) {
      this.carveCorridor(centers[a], centers[b]);
    }
  }

  private carveCorridor(from: Point, to: Point): void {
    let x = from.x;
    let y = from.y;

    // L-shaped corridor: first horizontal, then vertical (or vice versa)
    const horizontalFirst = this.rng.chance(0.5);

    if (horizontalFirst) {
      while (x !== to.x) {
        this.setCorridorTile(x, y);
        x += x < to.x ? 1 : -1;
      }
      while (y !== to.y) {
        this.setCorridorTile(x, y);
        y += y < to.y ? 1 : -1;
      }
    } else {
      while (y !== to.y) {
        this.setCorridorTile(x, y);
        y += y < to.y ? 1 : -1;
      }
      while (x !== to.x) {
        this.setCorridorTile(x, y);
        x += x < to.x ? 1 : -1;
      }
    }
    this.setCorridorTile(x, y);
  }

  private setCorridorTile(x: number, y: number): void {
    if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return;
    const tile = this.tiles[y][x];
    // Don't overwrite room floors/walls
    if (tile.type === TileType.FLOOR) return;
    if (tile.type === TileType.WALL) {
      // Turn wall into door if it borders a room
      if (tile.roomId !== null) {
        this.tiles[y][x] = { type: TileType.DOOR, visibility: Visibility.HIDDEN, roomId: tile.roomId };
        return;
      }
    }
    if (tile.type === TileType.EMPTY || tile.type === TileType.WALL) {
      this.tiles[y][x] = { type: TileType.CORRIDOR, visibility: Visibility.HIDDEN, roomId: null };
    }
  }

  private assignRoomTypes(): void {
    if (this.rooms.length === 0) return;

    // First room = START
    this.rooms[0].type = RoomType.START;
    this.rooms[0].explored = true;
    this.rooms[0].cleared = true;

    // Find farthest room from start
    let farthestIdx = 0;
    let farthestDist = 0;
    const startCenter = {
      x: this.rooms[0].x + this.rooms[0].width / 2,
      y: this.rooms[0].y + this.rooms[0].height / 2,
    };

    for (let i = 1; i < this.rooms.length; i++) {
      const center = {
        x: this.rooms[i].x + this.rooms[i].width / 2,
        y: this.rooms[i].y + this.rooms[i].height / 2,
      };
      const dist = Math.abs(center.x - startCenter.x) + Math.abs(center.y - startCenter.y);
      if (dist > farthestDist) {
        farthestDist = dist;
        farthestIdx = i;
      }
    }

    // Floor 3: farthest room = BOSS. Floors 1-2: farthest room = STAIRS
    if (this.floor >= 3) {
      this.rooms[farthestIdx].type = RoomType.BOSS;
    } else {
      this.rooms[farthestIdx].type = RoomType.STAIRS;
    }

    // Assign remaining rooms
    const numEnemyRooms = Math.max(3, Math.floor(this.rooms.length * 0.3));
    const types: RoomType[] = [];

    for (let i = 0; i < numEnemyRooms; i++) types.push(RoomType.ENEMY);
    types.push(RoomType.LOOT, RoomType.LOOT);
    types.push(RoomType.TRAP, RoomType.TRAP);
    types.push(RoomType.SHOP);
    types.push(RoomType.EVENT, RoomType.EVENT);

    this.rng.shuffle(types);

    let typeIdx = 0;
    for (let i = 1; i < this.rooms.length; i++) {
      if (i === farthestIdx) continue;
      this.rooms[i].type = types[typeIdx % types.length];
      typeIdx++;
    }

    // Reveal start room tiles
    this.revealRoom(this.rooms[0]);
  }

  revealRoom(room: Room): void {
    room.explored = true;
    for (let ry = room.y; ry < room.y + room.height; ry++) {
      for (let rx = room.x; rx < room.x + room.width; rx++) {
        if (ry >= 0 && ry < MAP_SIZE && rx >= 0 && rx < MAP_SIZE) {
          this.tiles[ry][rx].visibility = Visibility.VISIBLE;
        }
      }
    }
    // Also reveal adjacent corridor tiles
    for (let ry = room.y - 1; ry <= room.y + room.height; ry++) {
      for (let rx = room.x - 1; rx <= room.x + room.width; rx++) {
        if (ry >= 0 && ry < MAP_SIZE && rx >= 0 && rx < MAP_SIZE) {
          const tile = this.tiles[ry][rx];
          if (tile.type === TileType.CORRIDOR || tile.type === TileType.DOOR) {
            tile.visibility = Visibility.VISIBLE;
          }
        }
      }
    }
  }
}
