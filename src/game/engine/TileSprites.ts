import { Graphics } from 'pixi.js';
import { TileType, Visibility, RoomType } from '../types';
import { TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH } from '../utils/math';
import { COLORS } from '../utils/colors';

/** Draw a single isometric tile at local origin (0,0). Caller positions the container. */
export function drawTile(
  g: Graphics,
  tileType: TileType,
  visibility: Visibility,
  roomType?: RoomType | null
): void {
  g.clear();

  if (visibility === Visibility.HIDDEN) {
    drawFogTile(g);
    return;
  }

  const alpha = visibility === Visibility.EXPLORED ? 0.4 : 1.0;
  g.alpha = alpha;

  switch (tileType) {
    case TileType.FLOOR:
      drawFloorTile(g, roomType);
      break;
    case TileType.WALL:
      drawWallTile(g, roomType);
      break;
    case TileType.DOOR:
      drawDoorTile(g);
      break;
    case TileType.CORRIDOR:
      drawCorridorTile(g);
      break;
    default:
      break;
  }
}

function drawFogTile(g: Graphics) {
  g.alpha = 1;
  drawDiamond(g, 0, 0);
  g.fill(0x040608);
}

function drawFloorTile(g: Graphics, roomType?: RoomType | null) {
  const color = getFloorColor(roomType);

  // Floor base
  drawDiamond(g, 0, 0);
  g.fill(color);

  // Grime / weathering layer
  drawSmallDiamond(g, 2, 1, 0.4);
  g.fill({ color: 0x0a0e18, alpha: 0.15 });

  // Grid panel lines
  drawDiamond(g, 0, 0);
  g.stroke({ width: 0.5, color: COLORS.WALL_HIGHLIGHT, alpha: 0.12 });

  // Center rivet
  g.circle(0, 0, 0.8);
  g.fill({ color: COLORS.WALL_HIGHLIGHT, alpha: 0.15 });
}

function drawWallTile(g: Graphics, roomType?: RoomType | null) {
  const hw = TILE_WIDTH / 2;
  const hh = TILE_HEIGHT / 2;
  const depth = TILE_DEPTH + 4; // Taller walls

  // Right face (darker)
  g.moveTo(0, hh).lineTo(hw, 0).lineTo(hw, -depth).lineTo(0, hh - depth).closePath();
  g.fill(COLORS.WALL_DARK);
  // Right face panel lines
  g.moveTo(hw * 0.5, hh * 0.5).lineTo(hw * 0.5, hh * 0.5 - depth);
  g.stroke({ width: 0.3, color: 0x1a2030, alpha: 0.5 });

  // Left face (mid)
  g.moveTo(0, hh).lineTo(-hw, 0).lineTo(-hw, -depth).lineTo(0, hh - depth).closePath();
  g.fill(COLORS.WALL_MID);
  // Left face panel lines
  g.moveTo(-hw * 0.5, hh * 0.5).lineTo(-hw * 0.5, hh * 0.5 - depth);
  g.stroke({ width: 0.3, color: 0x222838, alpha: 0.5 });

  // Top face
  const topColor = roomType ? getRoomAccent(roomType) : COLORS.WALL_TOP;
  drawDiamond(g, 0, -depth);
  g.fill(topColor);

  // Top edge highlight
  drawDiamond(g, 0, -depth);
  g.stroke({ width: 1, color: COLORS.WALL_HIGHLIGHT, alpha: 0.25 });

  // Wall damage / wear marks
  g.moveTo(-hw * 0.3, hh * 0.3 - depth * 0.3).lineTo(-hw * 0.2, hh * 0.3 - depth * 0.6);
  g.stroke({ width: 0.5, color: 0x0a0e18, alpha: 0.3 });
}

function drawDoorTile(g: Graphics) {
  // Floor
  drawDiamond(g, 0, 0);
  g.fill(COLORS.FLOOR_MID);

  // Door frame glow (pulsing)
  drawSmallDiamond(g, 0, 0, 0.7);
  g.fill({ color: COLORS.DOOR_GLOW, alpha: 0.2 });

  // Inner glow
  drawSmallDiamond(g, 0, 0, 0.4);
  g.fill({ color: COLORS.DOOR_GLOW, alpha: 0.35 });

  // Threshold lines
  drawSmallDiamond(g, 0, 0, 0.8);
  g.stroke({ width: 1, color: COLORS.DOOR_GLOW, alpha: 0.5 });

  // Warning chevrons
  drawSmallDiamond(g, 0, 0, 0.3);
  g.stroke({ width: 1.5, color: 0xccaa44, alpha: 0.4 });
}

function drawCorridorTile(g: Graphics) {
  drawDiamond(g, 0, 0);
  g.fill(COLORS.CORRIDOR);

  // Worn track marks (center path)
  drawSmallDiamond(g, 0, 0, 0.3);
  g.fill({ color: 0x161a28, alpha: 0.3 });

  // Grid lines
  drawDiamond(g, 0, 0);
  g.stroke({ width: 0.3, color: COLORS.WALL_HIGHLIGHT, alpha: 0.08 });
}

// ── Geometry Helpers ──────────────────────────────────

function drawDiamond(g: Graphics, cx: number, cy: number) {
  const hw = TILE_WIDTH / 2;
  const hh = TILE_HEIGHT / 2;
  g.moveTo(cx, cy - hh)
    .lineTo(cx + hw, cy)
    .lineTo(cx, cy + hh)
    .lineTo(cx - hw, cy)
    .closePath();
}

function drawSmallDiamond(g: Graphics, cx: number, cy: number, scale: number) {
  const hw = (TILE_WIDTH / 2) * scale;
  const hh = (TILE_HEIGHT / 2) * scale;
  g.moveTo(cx, cy - hh)
    .lineTo(cx + hw, cy)
    .lineTo(cx, cy + hh)
    .lineTo(cx - hw, cy)
    .closePath();
}

function getFloorColor(roomType?: RoomType | null): number {
  if (!roomType) return COLORS.FLOOR_MID;
  switch (roomType) {
    case RoomType.START: return 0x2a3048;
    case RoomType.ENEMY: return 0x2a2030;
    case RoomType.LOOT: return 0x2a2820;
    case RoomType.TRAP: return 0x2a2420;
    case RoomType.SHOP: return 0x1e2a28;
    case RoomType.EVENT: return 0x242838;
    case RoomType.BOSS: return 0x2a1a28;
    default: return COLORS.FLOOR_MID;
  }
}

function getRoomAccent(roomType: RoomType): number {
  switch (roomType) {
    case RoomType.START: return COLORS.ROOM_START;
    case RoomType.ENEMY: return COLORS.ROOM_ENEMY;
    case RoomType.LOOT: return COLORS.ROOM_LOOT;
    case RoomType.TRAP: return COLORS.ROOM_TRAP;
    case RoomType.SHOP: return COLORS.ROOM_SHOP;
    case RoomType.EVENT: return COLORS.ROOM_EVENT;
    case RoomType.BOSS: return COLORS.ROOM_BOSS;
    default: return COLORS.WALL_TOP;
  }
}
