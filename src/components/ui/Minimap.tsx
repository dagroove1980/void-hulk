'use client';

import { useGameStore } from '@/store/gameStore';
import { GamePhase, TileType, Visibility, RoomType } from '@/game/types';
import { useRef, useEffect } from 'react';

const MINIMAP_SIZE = 160;
const PIXEL_SIZE = 3;

export default function Minimap() {
  const map = useGameStore((s) => s.map);
  const player = useGameStore((s) => s.player);
  const phase = useGameStore((s) => s.phase);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map.tiles.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Center on player
    const offsetX = Math.floor(MINIMAP_SIZE / 2) - player.gridX * PIXEL_SIZE;
    const offsetY = Math.floor(MINIMAP_SIZE / 2) - player.gridY * PIXEL_SIZE;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y]?.[x];
        if (!tile || tile.visibility === Visibility.HIDDEN) continue;

        const px = x * PIXEL_SIZE + offsetX;
        const py = y * PIXEL_SIZE + offsetY;

        if (px < -PIXEL_SIZE || px > MINIMAP_SIZE || py < -PIXEL_SIZE || py > MINIMAP_SIZE) continue;

        if (tile.type === TileType.WALL) {
          ctx.fillStyle = tile.visibility === Visibility.VISIBLE ? '#334466' : '#1a2233';
        } else if (tile.type === TileType.FLOOR) {
          if (tile.roomId !== null) {
            const room = map.rooms[tile.roomId];
            ctx.fillStyle = getRoomMinimapColor(room.type, tile.visibility === Visibility.VISIBLE);
          } else {
            ctx.fillStyle = tile.visibility === Visibility.VISIBLE ? '#2e3452' : '#181d2e';
          }
        } else if (tile.type === TileType.CORRIDOR) {
          ctx.fillStyle = tile.visibility === Visibility.VISIBLE ? '#1e2336' : '#121620';
        } else if (tile.type === TileType.DOOR) {
          ctx.fillStyle = '#6688cc';
        } else {
          continue;
        }

        ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
      }
    }

    // Player dot
    const ppx = player.gridX * PIXEL_SIZE + offsetX;
    const ppy = player.gridY * PIXEL_SIZE + offsetY;
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(ppx - 1, ppy - 1, PIXEL_SIZE + 2, PIXEL_SIZE + 2);
    ctx.fillStyle = '#88ccff';
    ctx.fillRect(ppx, ppy, PIXEL_SIZE, PIXEL_SIZE);
  }, [map, player.gridX, player.gridY]);

  if (phase === GamePhase.MENU) return null;

  return (
    <div className="fixed bottom-4 left-4 z-20 pointer-events-none">
      <div className="bg-black/80 border border-gray-700 rounded-lg p-1 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          width={MINIMAP_SIZE}
          height={MINIMAP_SIZE}
          className="rounded"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
}

function getRoomMinimapColor(type: RoomType, visible: boolean): string {
  const alpha = visible ? 'ff' : '88';
  switch (type) {
    case RoomType.START: return `#336699${alpha}`;
    case RoomType.ENEMY: return `#993333${alpha}`;
    case RoomType.LOOT: return `#cc8833${alpha}`;
    case RoomType.TRAP: return `#996633${alpha}`;
    case RoomType.SHOP: return `#339966${alpha}`;
    case RoomType.EVENT: return `#666699${alpha}`;
    case RoomType.BOSS: return `#993366${alpha}`;
    default: return `#2e3452${alpha}`;
  }
}
