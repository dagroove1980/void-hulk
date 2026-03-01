import { Point, WorldPoint, ScreenPoint } from '../types';

// ── Isometric Constants ─────────────────────────────────
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const TILE_DEPTH = 16;

// ── Coordinate Conversions ──────────────────────────────

/** Grid (col, row) → isometric world pixel position */
export function gridToWorld(gx: number, gy: number): WorldPoint {
  return {
    wx: (gx - gy) * (TILE_WIDTH / 2),
    wy: (gx + gy) * (TILE_HEIGHT / 2),
  };
}

/** Isometric world → grid (col, row) */
export function worldToGrid(wx: number, wy: number): Point {
  const gx = (wx / (TILE_WIDTH / 2) + wy / (TILE_HEIGHT / 2)) / 2;
  const gy = (wy / (TILE_HEIGHT / 2) - wx / (TILE_WIDTH / 2)) / 2;
  return { x: Math.round(gx), y: Math.round(gy) };
}

/** World → screen (applying camera offset and zoom) */
export function worldToScreen(
  wx: number,
  wy: number,
  camX: number,
  camY: number,
  zoom: number,
  screenW: number,
  screenH: number
): ScreenPoint {
  return {
    sx: (wx - camX) * zoom + screenW / 2,
    sy: (wy - camY) * zoom + screenH / 2,
  };
}

/** Screen → world (inverse of worldToScreen) */
export function screenToWorld(
  sx: number,
  sy: number,
  camX: number,
  camY: number,
  zoom: number,
  screenW: number,
  screenH: number
): WorldPoint {
  return {
    wx: (sx - screenW / 2) / zoom + camX,
    wy: (sy - screenH / 2) / zoom + camY,
  };
}

/** Screen click → grid tile */
export function screenToGrid(
  sx: number,
  sy: number,
  camX: number,
  camY: number,
  zoom: number,
  screenW: number,
  screenH: number
): Point {
  const { wx, wy } = screenToWorld(sx, sy, camX, camY, zoom, screenW, screenH);
  return worldToGrid(wx, wy);
}

// ── Geometry Helpers ────────────────────────────────────

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
