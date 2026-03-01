'use client';

import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { GameEngine } from '@/game/engine/GameEngine';
import { useGameStore } from '@/store/gameStore';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const appRef = useRef<Application | null>(null);
  const setEngine = useGameStore((s) => s.setEngine);
  const updateState = useGameStore((s) => s.updateState);

  useEffect(() => {
    if (!canvasRef.current) return;

    let cancelled = false;

    const init = async () => {
      const app = new Application();
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x080c14,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // If cleanup ran while we were awaiting, destroy immediately
      if (cancelled) {
        app.destroy({}, { children: true });
        return;
      }

      canvasRef.current!.appendChild(app.canvas);
      app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

      appRef.current = app;

      const engine = new GameEngine(app, updateState);
      await engine.init();

      if (cancelled) {
        engine.destroy();
        app.destroy({}, { children: true });
        return;
      }

      engine.newGame();
      engineRef.current = engine;
      setEngine(engine);
    };

    init();

    return () => {
      cancelled = true;
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      if (appRef.current) {
        try {
          appRef.current.destroy({}, { children: true });
        } catch {
          // PixiJS cleanup can throw if app wasn't fully initialized
        }
        appRef.current = null;
      }
    };
  }, [setEngine, updateState]);

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
