import { GameMap, TileType, Point } from '../types';

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

/** A* pathfinding on the tile grid */
export function findPath(map: GameMap, start: Point, end: Point): Point[] {
  if (!isWalkable(map, end.x, end.y)) return [];
  if (start.x === end.x && start.y === end.y) return [];

  const open: PathNode[] = [];
  const closed = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;

  const startNode: PathNode = {
    x: start.x, y: start.y,
    g: 0, h: heuristic(start, end), f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  open.push(startNode);

  const dirs = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
  ];

  let iterations = 0;
  const maxIterations = 2000;

  while (open.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find lowest f
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i;
    }
    const current = open.splice(bestIdx, 1)[0];

    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(current);
    }

    closed.add(key(current.x, current.y));

    for (const dir of dirs) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (!isWalkable(map, nx, ny)) continue;
      if (closed.has(key(nx, ny))) continue;

      const g = current.g + 1;
      const h = heuristic({ x: nx, y: ny }, end);
      const f = g + h;

      const existing = open.find(n => n.x === nx && n.y === ny);
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
        continue;
      }

      open.push({ x: nx, y: ny, g, h, f, parent: current });
    }
  }

  return []; // No path found
}

function isWalkable(map: GameMap, x: number, y: number): boolean {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) return false;
  const type = map.tiles[y][x].type;
  return type === TileType.FLOOR || type === TileType.CORRIDOR || type === TileType.DOOR;
}

function heuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(node: PathNode): Point[] {
  const path: Point[] = [];
  let current: PathNode | null = node;
  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  // Remove the starting position
  path.shift();
  return path;
}
