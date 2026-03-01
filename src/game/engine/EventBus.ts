import { GameEvent, GameEventType } from '../types';

type EventHandler = (event: GameEvent) => void;

export class EventBus {
  private handlers: Map<GameEventType, EventHandler[]> = new Map();

  on(type: GameEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);

    return () => {
      const list = this.handlers.get(type);
      if (list) {
        const idx = list.indexOf(handler);
        if (idx >= 0) list.splice(idx, 1);
      }
    };
  }

  emit(type: GameEventType, data: Record<string, unknown> = {}): void {
    const event: GameEvent = { type, data };
    const handlers = this.handlers.get(type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
