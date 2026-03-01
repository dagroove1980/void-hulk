/** Seeded pseudo-random number generator (mulberry32) */
export class SeededRNG {
  private state: number;

  constructor(seed: string) {
    this.state = this.hashSeed(seed);
  }

  private hashSeed(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Random integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Random float in [min, max) */
  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Pick a random element from an array */
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** Shuffle array in place */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Roll a d6 */
  d6(): number {
    return this.int(1, 6);
  }

  /** Roll multiple d6s, return results */
  rollDice(count: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.d6());
    }
    return results;
  }

  /** Returns true with given probability (0-1) */
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

/** Generate a random seed string */
export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
