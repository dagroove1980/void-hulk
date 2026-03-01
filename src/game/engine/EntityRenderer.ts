import { Graphics } from 'pixi.js';
import { Enemy, EnemyType, Player } from '../types';
import { COLORS } from '../utils/colors';

// ═══════════════════════════════════════════════════════════
//  PLAYER - Heavy Void Operative (Warhammer Space Marine style)
// ═══════════════════════════════════════════════════════════

export function drawPlayer(g: Graphics, _player: Player, time: number): void {
  g.clear();
  const bob = Math.sin(time * 1.8) * 1.2;
  const breathe = Math.sin(time * 2.5) * 0.5;

  // ── Ground shadow ──
  g.ellipse(0, 6, 14, 6);
  g.fill({ color: 0x000000, alpha: 0.5 });

  // ── Boots ──
  g.roundRect(-10, -2 + bob, 7, 5, 1);
  g.fill(0x2a2a3a);
  g.roundRect(3, -2 + bob, 7, 5, 1);
  g.fill(0x2a2a3a);
  // Boot trim
  g.roundRect(-10, -2 + bob, 7, 2, 1);
  g.fill(0x3a3a4a);

  // ── Legs ──
  g.roundRect(-8, -10 + bob, 6, 10, 1);
  g.fill(0x333344);
  g.roundRect(2, -10 + bob, 6, 10, 1);
  g.fill(0x333344);
  // Knee plates
  g.roundRect(-7, -7 + bob, 4, 3, 1);
  g.fill(0x444466);
  g.roundRect(3, -7 + bob, 4, 3, 1);
  g.fill(0x444466);

  // ── Torso (bulky power armor) ──
  g.roundRect(-11, -26 + bob + breathe, 22, 18, 3);
  g.fill(0x3a3a50);
  // Chest plate
  g.roundRect(-9, -24 + bob + breathe, 18, 12, 2);
  g.fill(0x444466);
  // Center chest ridge
  g.roundRect(-1, -24 + bob + breathe, 2, 12, 1);
  g.fill(0x555577);
  // Aquila / skull emblem on chest
  g.circle(0, -18 + bob + breathe, 3);
  g.fill(0x998866);
  g.circle(0, -18 + bob + breathe, 2);
  g.fill(0xbbaa88);
  // Skull eye sockets
  g.circle(-1, -19 + bob + breathe, 0.5);
  g.fill(0x222222);
  g.circle(1, -19 + bob + breathe, 0.5);
  g.fill(0x222222);

  // ── Belt / waist ──
  g.roundRect(-10, -11 + bob, 20, 3, 1);
  g.fill(0x554433);
  // Belt buckle (skull)
  g.circle(0, -10 + bob, 2);
  g.fill(0x998866);

  // ── Backpack / power unit ──
  g.roundRect(-7, -28 + bob + breathe, 14, 10, 2);
  g.fill(0x2a2a3a);
  g.roundRect(-6, -27 + bob + breathe, 12, 8, 1);
  g.fill(0x333344);
  // Exhaust vents
  g.roundRect(-5, -29 + bob + breathe, 3, 3, 1);
  g.fill(0x222233);
  g.roundRect(2, -29 + bob + breathe, 3, 3, 1);
  g.fill(0x222233);
  // Vent glow
  g.circle(-3.5, -27.5 + bob + breathe, 1);
  g.fill({ color: 0x4488ff, alpha: 0.4 + Math.sin(time * 4) * 0.2 });
  g.circle(3.5, -27.5 + bob + breathe, 1);
  g.fill({ color: 0x4488ff, alpha: 0.4 + Math.sin(time * 4 + 1) * 0.2 });

  // ── Oversized pauldrons (iconic) ──
  // Left pauldron
  g.roundRect(-16, -26 + bob + breathe, 8, 10, 3);
  g.fill(0x3355aa);
  g.roundRect(-16, -26 + bob + breathe, 8, 10, 3);
  g.stroke({ width: 1, color: 0x4466bb });
  // Pauldron trim
  g.roundRect(-16, -26 + bob + breathe, 8, 2, 1);
  g.fill(0x998866);
  // Chapter marking (stripe)
  g.roundRect(-13, -23 + bob + breathe, 2, 6, 0);
  g.fill(0xdddddd);

  // Right pauldron
  g.roundRect(8, -26 + bob + breathe, 8, 10, 3);
  g.fill(0x3355aa);
  g.roundRect(8, -26 + bob + breathe, 8, 10, 3);
  g.stroke({ width: 1, color: 0x4466bb });
  // Pauldron trim
  g.roundRect(8, -26 + bob + breathe, 8, 2, 1);
  g.fill(0x998866);
  // Skull icon on right pauldron
  g.circle(12, -20 + bob + breathe, 2);
  g.fill(0xccccaa);
  g.circle(11.5, -20.5 + bob + breathe, 0.5);
  g.fill(0x333333);
  g.circle(12.5, -20.5 + bob + breathe, 0.5);
  g.fill(0x333333);

  // ── Arms ──
  g.roundRect(-14, -16 + bob + breathe, 5, 10, 2);
  g.fill(0x3a3a50);
  g.roundRect(9, -16 + bob + breathe, 5, 10, 2);
  g.fill(0x3a3a50);
  // Gauntlets
  g.roundRect(-14, -8 + bob, 5, 4, 1);
  g.fill(0x444466);
  g.roundRect(9, -8 + bob, 5, 4, 1);
  g.fill(0x444466);

  // ── Weapon (bolter held at right side) ──
  const weaponSway = Math.sin(time * 1.5) * 0.5;
  g.roundRect(13, -14 + bob + weaponSway, 3, 16, 1);
  g.fill(0x222233);
  // Muzzle
  g.roundRect(13, -16 + bob + weaponSway, 3, 3, 0);
  g.fill(0x1a1a2a);
  // Muzzle flash glow (subtle)
  g.circle(14.5, -16 + bob + weaponSway, 2);
  g.fill({ color: 0xff6600, alpha: Math.max(0, Math.sin(time * 8) * 0.15) });

  // ── Helmet ──
  // Neck
  g.roundRect(-4, -30 + bob + breathe, 8, 4, 1);
  g.fill(0x2a2a3a);
  // Helmet base
  g.roundRect(-8, -40 + bob, 16, 12, 4);
  g.fill(0x3355aa);
  g.roundRect(-8, -40 + bob, 16, 12, 4);
  g.stroke({ width: 1, color: 0x4466bb });
  // Face plate
  g.roundRect(-6, -38 + bob, 12, 8, 2);
  g.fill(0x2a2a3a);
  // Visor slit (glowing)
  g.roundRect(-5, -36 + bob, 10, 3, 1);
  g.fill(0x44ccff);
  // Visor glow effect
  g.ellipse(0, -34.5 + bob, 8, 3);
  g.fill({ color: 0x44ccff, alpha: 0.2 + Math.sin(time * 3) * 0.1 });
  // Helmet crest / mohawk ridge
  g.roundRect(-1.5, -43 + bob, 3, 6, 1);
  g.fill(0xcc2222);
  // Breather grille
  g.roundRect(-4, -33 + bob, 8, 3, 1);
  g.fill(0x1a1a2a);
  for (let i = 0; i < 4; i++) {
    g.roundRect(-3 + i * 2, -33 + bob, 1, 3, 0);
    g.fill(0x333344);
  }

  // ── Outline for pop ──
  g.roundRect(-16, -26 + bob + breathe, 32, 30, 3);
  g.stroke({ width: 0.5, color: 0x000000, alpha: 0.3 });
}

// ═══════════════════════════════════════════════════════════
//  ENEMIES
// ═══════════════════════════════════════════════════════════

export function drawEnemy(g: Graphics, enemy: Enemy, time: number): void {
  g.clear();
  const bob = Math.sin(time * 3 + enemy.gridX) * 1;

  switch (enemy.type) {
    case EnemyType.VOID_LURKER:
      drawVoidLurker(g, bob, time);
      break;
    case EnemyType.CORRUPTED_DRONE:
      drawCorruptedDrone(g, bob, time);
      break;
    case EnemyType.ACID_SPITTER:
      drawAcidSpitter(g, bob, time);
      break;
    case EnemyType.HULL_BREAKER:
      drawHullBreaker(g, bob, time);
      break;
    case EnemyType.PHASE_STALKER:
      drawPhaseStalker(g, bob, time);
      break;
    case EnemyType.BROOD_QUEEN:
      drawBroodQueen(g, bob, time);
      break;
  }
}

// ── Void Lurker: Genestealer-like skulking predator ─────

function drawVoidLurker(g: Graphics, bob: number, time: number) {
  // Shadow
  g.ellipse(0, 6, 10, 5);
  g.fill({ color: 0x000000, alpha: 0.4 });

  // Tail
  const tailSway = Math.sin(time * 4) * 3;
  g.moveTo(-8, -2 + bob).lineTo(-14 + tailSway, -6 + bob).lineTo(-16 + tailSway, -4 + bob);
  g.stroke({ width: 2, color: 0x1a3322 });
  // Tail barb
  g.circle(-16 + tailSway, -5 + bob, 1.5);
  g.fill(0x44cc66);

  // Hind legs (crouched)
  g.roundRect(-8, -2 + bob, 4, 6, 1);
  g.fill(0x1a3322);
  g.roundRect(4, -2 + bob, 4, 6, 1);
  g.fill(0x1a3322);

  // Body (hunched, elongated)
  g.ellipse(0, -8 + bob, 9, 7);
  g.fill(0x1a3322);
  // Chitin ridges along spine
  for (let i = -3; i <= 3; i++) {
    g.roundRect(i * 2.2 - 1, -14 + bob + Math.abs(i) * 0.8, 2, 3, 1);
    g.fill(0x245535);
  }

  // Front claws (extended)
  const clawR = Math.sin(time * 5) * 2;
  g.moveTo(-6, -6 + bob).lineTo(-12, -12 + bob + clawR).lineTo(-10, -14 + bob + clawR);
  g.stroke({ width: 2, color: 0x1a3322 });
  g.moveTo(6, -6 + bob).lineTo(12, -12 + bob - clawR).lineTo(10, -14 + bob - clawR);
  g.stroke({ width: 2, color: 0x1a3322 });
  // Claw tips
  g.circle(-11, -13 + bob + clawR, 1);
  g.fill(0x88ddaa);
  g.circle(11, -13 + bob - clawR, 1);
  g.fill(0x88ddaa);

  // Head (elongated alien skull)
  g.ellipse(0, -16 + bob, 5, 4);
  g.fill(0x224433);
  // Jaw
  g.moveTo(-3, -14 + bob).lineTo(0, -11 + bob).lineTo(3, -14 + bob);
  g.fill(0x1a3322);
  // Teeth
  for (let i = -2; i <= 2; i++) {
    g.moveTo(i * 1.2, -14 + bob).lineTo(i * 1.2, -12 + bob);
    g.stroke({ width: 0.8, color: 0xccddbb });
  }

  // Eyes (four, glowing)
  const eyePulse = 0.7 + Math.sin(time * 6) * 0.3;
  g.circle(-3, -17 + bob, 1.5);
  g.fill({ color: 0x44ff66, alpha: eyePulse });
  g.circle(3, -17 + bob, 1.5);
  g.fill({ color: 0x44ff66, alpha: eyePulse });
  g.circle(-1.5, -15.5 + bob, 1);
  g.fill({ color: 0x44ff66, alpha: eyePulse * 0.7 });
  g.circle(1.5, -15.5 + bob, 1);
  g.fill({ color: 0x44ff66, alpha: eyePulse * 0.7 });
  // Eye glow
  g.ellipse(0, -16 + bob, 6, 3);
  g.fill({ color: 0x44ff66, alpha: 0.1 });

  // Outline
  g.ellipse(0, -8 + bob, 10, 8);
  g.stroke({ width: 0.8, color: 0x000000, alpha: 0.4 });
}

// ── Corrupted Drone: Servitor / Machine Spirit corrupted ─

function drawCorruptedDrone(g: Graphics, bob: number, time: number) {
  g.ellipse(0, 6, 10, 5);
  g.fill({ color: 0x000000, alpha: 0.4 });

  const glitch = Math.random() > 0.95 ? (Math.random() - 0.5) * 3 : 0;

  // Hover jets (flickering)
  const jetFlicker = 0.4 + Math.sin(time * 12) * 0.3;
  g.ellipse(-4, 4 + bob, 2, 3);
  g.fill({ color: 0x8844cc, alpha: jetFlicker });
  g.ellipse(4, 4 + bob, 2, 3);
  g.fill({ color: 0x8844cc, alpha: jetFlicker });

  // Lower hull
  g.roundRect(-8, -6 + bob, 16, 10, 2);
  g.fill(0x3a4455);
  // Damaged plating
  g.roundRect(-7, -4 + bob, 6, 3, 1);
  g.fill(0x445566);
  g.roundRect(1, -4 + bob, 6, 3, 1);
  g.fill(0x445566);

  // Main body (boxy servitor)
  g.roundRect(-10, -18 + bob + glitch, 20, 14, 2);
  g.fill(0x445566);
  g.roundRect(-10, -18 + bob + glitch, 20, 14, 2);
  g.stroke({ width: 1, color: 0x556677 });

  // Corruption tendrils growing over hull
  for (let i = 0; i < 4; i++) {
    const tx = -6 + i * 4;
    const tendrilLen = 3 + Math.sin(time * 2 + i) * 1;
    g.moveTo(tx, -18 + bob).lineTo(tx + Math.sin(time + i) * 2, -18 - tendrilLen + bob);
    g.stroke({ width: 1.5, color: 0x6633aa, alpha: 0.7 });
  }

  // Corruption veins on hull
  g.moveTo(-8, -14 + bob).lineTo(-3, -10 + bob).lineTo(2, -15 + bob).lineTo(7, -11 + bob);
  g.stroke({ width: 0.8, color: 0x8844cc, alpha: 0.5 });

  // Mechanical arms (damaged)
  g.roundRect(-14, -14 + bob, 4, 8, 1);
  g.fill(0x3a4455);
  g.roundRect(10, -14 + bob, 4, 8, 1);
  g.fill(0x3a4455);
  // Claw/tool tips
  g.moveTo(-14, -6 + bob).lineTo(-16, -4 + bob).lineTo(-14, -2 + bob);
  g.stroke({ width: 1.5, color: 0x556677 });
  g.moveTo(14, -6 + bob).lineTo(16, -4 + bob).lineTo(14, -2 + bob);
  g.stroke({ width: 1.5, color: 0x556677 });

  // Sensor head
  g.roundRect(-6, -24 + bob + glitch, 12, 7, 2);
  g.fill(0x334455);
  g.roundRect(-6, -24 + bob + glitch, 12, 7, 2);
  g.stroke({ width: 0.5, color: 0x556677 });

  // Main eye (corrupted, red)
  const eyeGlow = 0.6 + Math.sin(time * 5) * 0.4;
  g.circle(0 + glitch, -20.5 + bob, 3);
  g.fill({ color: 0xff2222, alpha: eyeGlow });
  g.circle(0 + glitch, -20.5 + bob, 1.5);
  g.fill(0xff4444);
  // Eye glow
  g.ellipse(0 + glitch, -20.5 + bob, 6, 4);
  g.fill({ color: 0xff2222, alpha: 0.15 });

  // Corruption aura
  g.ellipse(0, -10 + bob, 12, 14);
  g.fill({ color: 0x8844cc, alpha: 0.05 + Math.sin(time * 3) * 0.03 });

  // Sparks (intermittent)
  if (Math.sin(time * 7) > 0.7) {
    const sx = (Math.sin(time * 13) * 8);
    const sy = -12 + bob + (Math.sin(time * 17) * 5);
    g.circle(sx, sy, 1);
    g.fill({ color: 0xffaa44, alpha: 0.8 });
  }
}

// ── Acid Spitter: Bloated Tyranid bio-weapon ────────────

function drawAcidSpitter(g: Graphics, bob: number, time: number) {
  g.ellipse(0, 7, 12, 6);
  g.fill({ color: 0x000000, alpha: 0.4 });

  // Acid pool dripping beneath
  g.ellipse(0, 5 + bob, 6, 2);
  g.fill({ color: 0xaacc22, alpha: 0.3 + Math.sin(time * 2) * 0.15 });

  // Stubby legs
  g.roundRect(-9, 0 + bob, 5, 5, 2);
  g.fill(0x224422);
  g.roundRect(4, 0 + bob, 5, 5, 2);
  g.fill(0x224422);
  g.roundRect(-6, 1 + bob, 4, 4, 2);
  g.fill(0x1a3322);
  g.roundRect(2, 1 + bob, 4, 4, 2);
  g.fill(0x1a3322);

  // Bloated body (organic, pulsating)
  const pulse = Math.sin(time * 2) * 1;
  g.ellipse(0, -10 + bob, 11 + pulse, 13 + pulse * 0.5);
  g.fill(0x224422);
  // Chitin plates on back
  g.ellipse(0, -16 + bob, 8, 5);
  g.fill(0x2a5533);
  g.ellipse(0, -13 + bob, 9, 4);
  g.fill(0x2a5533);

  // Visible acid sacs (translucent, glowing)
  g.ellipse(-4, -8 + bob + pulse * 0.5, 4, 5);
  g.fill({ color: 0xaacc22, alpha: 0.5 });
  g.ellipse(4, -8 + bob + pulse * 0.5, 4, 5);
  g.fill({ color: 0xaacc22, alpha: 0.5 });
  // Acid bubbling inside
  g.circle(-3, -7 + bob, 1);
  g.fill({ color: 0xddee44, alpha: 0.6 + Math.sin(time * 5) * 0.3 });
  g.circle(5, -9 + bob, 1);
  g.fill({ color: 0xddee44, alpha: 0.6 + Math.sin(time * 5 + 1) * 0.3 });

  // Spitter nozzle / mouth
  g.ellipse(0, -22 + bob, 4, 3);
  g.fill(0x1a3322);
  // Dripping acid
  const dripY = (time * 20) % 8;
  g.circle(0, -19 + bob + dripY, 1);
  g.fill({ color: 0xaacc22, alpha: Math.max(0, 1 - dripY / 8) });
  g.circle(-1, -19 + bob + (dripY + 3) % 8, 0.8);
  g.fill({ color: 0xaacc22, alpha: Math.max(0, 1 - ((dripY + 3) % 8) / 8) });

  // Head / sensory cluster
  g.ellipse(0, -24 + bob, 5, 3);
  g.fill(0x2a5533);

  // Multiple eyes (insectoid)
  g.circle(-3, -25 + bob, 1.5);
  g.fill(0xccdd44);
  g.circle(3, -25 + bob, 1.5);
  g.fill(0xccdd44);
  g.circle(-1, -26 + bob, 1);
  g.fill(0xccdd44);
  g.circle(1, -26 + bob, 1);
  g.fill(0xccdd44);
  g.circle(0, -24.5 + bob, 1);
  g.fill(0xccdd44);

  // Outline
  g.ellipse(0, -10 + bob, 12, 14);
  g.stroke({ width: 0.8, color: 0x000000, alpha: 0.3 });
}

// ── Hull Breaker: Massive Carnifex-like siege beast ─────

function drawHullBreaker(g: Graphics, bob: number, time: number) {
  g.ellipse(0, 8, 18, 8);
  g.fill({ color: 0x000000, alpha: 0.5 });

  const stomp = Math.abs(Math.sin(time * 2)) * 1;

  // Massive legs (four, thick)
  g.roundRect(-14, -2 + bob + stomp, 6, 10, 2);
  g.fill(0x443322);
  g.roundRect(8, -2 + bob + stomp, 6, 10, 2);
  g.fill(0x443322);
  g.roundRect(-10, 0 + bob + stomp, 5, 8, 2);
  g.fill(0x3a2a1a);
  g.roundRect(5, 0 + bob + stomp, 5, 8, 2);
  g.fill(0x3a2a1a);
  // Clawed feet
  for (const xOff of [-13, -9, 9, 13]) {
    g.moveTo(xOff, 7 + bob + stomp).lineTo(xOff - 1, 9 + bob).lineTo(xOff + 1, 9 + bob);
    g.fill(0x665544);
  }

  // Massive body
  g.ellipse(0, -12 + bob, 16, 14);
  g.fill(0x443322);

  // Heavy armor plates (carapace)
  g.ellipse(0, -20 + bob, 14, 7);
  g.fill(0x554433);
  g.ellipse(0, -20 + bob, 14, 7);
  g.stroke({ width: 1, color: 0x665544 });
  // Plate segments
  g.ellipse(0, -16 + bob, 12, 5);
  g.fill(0x554433);
  g.moveTo(-10, -20 + bob).lineTo(0, -18 + bob).lineTo(10, -20 + bob);
  g.stroke({ width: 0.8, color: 0x665544 });

  // Battle damage / scars
  g.moveTo(-8, -14 + bob).lineTo(-4, -10 + bob);
  g.stroke({ width: 1, color: 0x332211, alpha: 0.6 });
  g.moveTo(5, -18 + bob).lineTo(8, -13 + bob);
  g.stroke({ width: 1, color: 0x332211, alpha: 0.6 });

  // Crushing claws (massive, forward-facing)
  const clawOpen = Math.sin(time * 2) * 2;
  // Left claw
  g.roundRect(-20, -18 + bob, 7, 4, 1);
  g.fill(0x554433);
  g.moveTo(-20, -18 + bob).lineTo(-24, -20 + bob - clawOpen);
  g.stroke({ width: 3, color: 0x665544 });
  g.moveTo(-20, -14 + bob).lineTo(-24, -12 + bob + clawOpen);
  g.stroke({ width: 3, color: 0x665544 });
  // Right claw
  g.roundRect(13, -18 + bob, 7, 4, 1);
  g.fill(0x554433);
  g.moveTo(20, -18 + bob).lineTo(24, -20 + bob - clawOpen);
  g.stroke({ width: 3, color: 0x665544 });
  g.moveTo(20, -14 + bob).lineTo(24, -12 + bob + clawOpen);
  g.stroke({ width: 3, color: 0x665544 });

  // Head (small, armored, tusked)
  g.roundRect(-6, -28 + bob, 12, 8, 3);
  g.fill(0x554433);
  // Head crest
  g.roundRect(-4, -31 + bob, 8, 4, 2);
  g.fill(0x665544);
  // Tusks
  g.moveTo(-5, -22 + bob).lineTo(-8, -19 + bob);
  g.stroke({ width: 2, color: 0xccbbaa });
  g.moveTo(5, -22 + bob).lineTo(8, -19 + bob);
  g.stroke({ width: 2, color: 0xccbbaa });

  // Eyes (angry, glowing red)
  g.circle(-3, -26 + bob, 2);
  g.fill(0xff3311);
  g.circle(3, -26 + bob, 2);
  g.fill(0xff3311);
  g.circle(-3, -26 + bob, 1);
  g.fill(0xff6644);
  g.circle(3, -26 + bob, 1);
  g.fill(0xff6644);
  // Eye glow
  g.ellipse(0, -26 + bob, 8, 3);
  g.fill({ color: 0xff3311, alpha: 0.1 });

  // Spikes along back
  for (let i = -2; i <= 2; i++) {
    g.moveTo(i * 4, -24 + bob).lineTo(i * 4, -28 + bob - Math.abs(i));
    g.stroke({ width: 1.5, color: 0x665544 });
  }
}

// ── Phase Stalker: Warp entity / Lictor-like assassin ───

function drawPhaseStalker(g: Graphics, bob: number, time: number) {
  const phase = Math.sin(time * 3) * 0.15 + 0.75;
  const phaseShift = Math.sin(time * 7) * 1.5;
  g.alpha = phase;

  g.ellipse(0, 6, 10, 5);
  g.fill({ color: 0x6633aa, alpha: 0.2 });

  // Warp afterimage (offset ghost)
  g.ellipse(phaseShift, -14 + bob, 8, 14);
  g.fill({ color: 0x8844cc, alpha: 0.1 });

  // Elongated legs
  g.roundRect(-5, -2 + bob, 3, 8, 1);
  g.fill({ color: 0x553388, alpha: 0.8 });
  g.roundRect(2, -2 + bob, 3, 8, 1);
  g.fill({ color: 0x553388, alpha: 0.8 });

  // Thin, tall body
  g.roundRect(-6, -26 + bob, 12, 24, 4);
  g.fill(0x442277);

  // Warp energy crackling over body
  for (let i = 0; i < 3; i++) {
    const ex = Math.sin(time * 8 + i * 2) * 5;
    const ey = -20 + bob + i * 6 + Math.cos(time * 6 + i) * 2;
    g.circle(ex, ey, 1);
    g.fill({ color: 0xcc88ff, alpha: 0.5 + Math.sin(time * 10 + i) * 0.3 });
  }

  // Long scything talons
  const talonSwing = Math.sin(time * 4) * 3;
  g.moveTo(-6, -16 + bob).lineTo(-14, -22 + bob + talonSwing).lineTo(-16, -26 + bob + talonSwing);
  g.stroke({ width: 1.5, color: 0x7744aa });
  g.moveTo(6, -16 + bob).lineTo(14, -22 + bob - talonSwing).lineTo(16, -26 + bob - talonSwing);
  g.stroke({ width: 1.5, color: 0x7744aa });
  // Talon tips (glowing)
  g.circle(-16, -26 + bob + talonSwing, 1.5);
  g.fill({ color: 0xcc88ff, alpha: 0.7 });
  g.circle(16, -26 + bob - talonSwing, 1.5);
  g.fill({ color: 0xcc88ff, alpha: 0.7 });

  // Head (elongated, eyeless hunter)
  g.ellipse(0, -30 + bob, 4, 5);
  g.fill(0x553388);
  // Smooth skull
  g.ellipse(0, -32 + bob, 3, 3);
  g.fill(0x664499);

  // Single warp eye
  const eyePulse = 0.5 + Math.sin(time * 4) * 0.5;
  g.circle(0, -30 + bob, 2.5);
  g.fill({ color: 0xffffff, alpha: eyePulse });
  g.circle(0, -30 + bob, 1.5);
  g.fill({ color: 0xcc88ff, alpha: eyePulse });
  // Eye trail
  g.ellipse(0, -30 + bob, 5, 3);
  g.fill({ color: 0xcc88ff, alpha: 0.15 });

  // Warp distortion around entire figure
  g.ellipse(0 + phaseShift * 0.5, -14 + bob, 10, 18);
  g.stroke({ width: 0.5, color: 0xaa66ff, alpha: 0.2 + Math.sin(time * 5) * 0.1 });
}

// ═══════════════════════════════════════════════════════════
//  BROOD QUEEN - Hive Tyrant / Broodlord Matriarch (BOSS)
// ═══════════════════════════════════════════════════════════

function drawBroodQueen(g: Graphics, bob: number, time: number) {
  // Massive shadow
  g.ellipse(0, 12, 24, 10);
  g.fill({ color: 0x000000, alpha: 0.6 });

  const breathe = Math.sin(time * 1.5) * 1;

  // Ichor pool
  g.ellipse(0, 10 + bob, 10, 3);
  g.fill({ color: 0x33cc55, alpha: 0.2 + Math.sin(time * 2) * 0.1 });

  // Egg sac (dragging behind)
  g.ellipse(0, 6 + bob + breathe, 14, 8);
  g.fill(0x1a3322);
  // Egg sac veins
  for (let i = -2; i <= 2; i++) {
    g.moveTo(i * 3, 2 + bob).lineTo(i * 4, 10 + bob);
    g.stroke({ width: 0.5, color: 0x44cc66, alpha: 0.4 });
  }

  // Massive legs (six)
  for (let side = -1; side <= 1; side += 2) {
    g.roundRect(side * 10 - 3, 0 + bob, 6, 10, 2);
    g.fill(0x1a3322);
    g.roundRect(side * 16 - 3, -4 + bob, 5, 8, 2);
    g.fill(0x1a3322);
    g.roundRect(side * 6 - 2, 2 + bob, 4, 8, 2);
    g.fill(0x224433);
    // Clawed feet
    g.moveTo(side * 10, 9 + bob).lineTo(side * 12, 11).lineTo(side * 8, 11);
    g.fill(0x44cc66);
  }

  // Massive thorax
  g.ellipse(0, -8 + bob + breathe, 20, 16);
  g.fill(0x1a3322);

  // Armored carapace (layered plates)
  g.ellipse(0, -18 + bob, 18, 8);
  g.fill(0x245535);
  g.ellipse(0, -18 + bob, 18, 8);
  g.stroke({ width: 1, color: 0x336644 });
  g.ellipse(0, -14 + bob, 16, 6);
  g.fill(0x245535);
  g.ellipse(0, -22 + bob, 14, 5);
  g.fill(0x2a6640);
  // Carapace ridge detail
  g.moveTo(-12, -18 + bob).lineTo(0, -24 + bob).lineTo(12, -18 + bob);
  g.stroke({ width: 1, color: 0x336644 });

  // Bio-weapon arms (two massive scything talons)
  for (let side = -1; side <= 1; side += 2) {
    const swing = Math.sin(time * 2.5 + side) * 4;
    // Upper arm
    g.roundRect(side * 14, -20 + bob, side * 6, 12, 2);
    g.fill(0x224433);
    // Forearm
    g.roundRect(side * 18, -24 + bob + swing, side * 4, 10, 2);
    g.fill(0x224433);
    // Scything talon blade
    g.moveTo(side * 20, -24 + bob + swing);
    g.lineTo(side * 26, -32 + bob + swing);
    g.lineTo(side * 24, -34 + bob + swing);
    g.lineTo(side * 18, -26 + bob + swing);
    g.closePath();
    g.fill(0x44cc66);
    g.moveTo(side * 20, -24 + bob + swing);
    g.lineTo(side * 26, -32 + bob + swing);
    g.stroke({ width: 1, color: 0x66ee88, alpha: 0.5 });
  }

  // Smaller manipulator arms
  for (let side = -1; side <= 1; side += 2) {
    g.roundRect(side * 10, -14 + bob, side * 8, 3, 1);
    g.fill(0x1a3322);
    // Gripper claws
    g.moveTo(side * 18, -14 + bob).lineTo(side * 20, -16 + bob);
    g.stroke({ width: 1, color: 0x336644 });
    g.moveTo(side * 18, -11 + bob).lineTo(side * 20, -9 + bob);
    g.stroke({ width: 1, color: 0x336644 });
  }

  // Head / crown
  g.ellipse(0, -30 + bob, 8, 6);
  g.fill(0x245535);
  g.ellipse(0, -30 + bob, 8, 6);
  g.stroke({ width: 0.5, color: 0x336644 });

  // Crown crest (tall, bony spines)
  for (let i = -3; i <= 3; i++) {
    const sway = Math.sin(time * 1.5 + i * 0.5) * 1.5;
    const height = 12 - Math.abs(i) * 2;
    g.moveTo(i * 3, -34 + bob).lineTo(i * 3 + sway, -34 - height + bob);
    g.stroke({ width: 2, color: 0x2a6640 });
    // Spine tip
    g.circle(i * 3 + sway, -34 - height + bob, 1);
    g.fill(0x44cc66);
  }

  // Jaw (massive, multi-hinged)
  g.moveTo(-6, -28 + bob).lineTo(0, -24 + bob + breathe).lineTo(6, -28 + bob);
  g.fill(0x1a3322);
  // Mandibles
  g.moveTo(-6, -27 + bob).lineTo(-9, -24 + bob);
  g.stroke({ width: 1.5, color: 0x44cc66 });
  g.moveTo(6, -27 + bob).lineTo(9, -24 + bob);
  g.stroke({ width: 1.5, color: 0x44cc66 });
  // Teeth (rows of razor teeth)
  for (let i = -3; i <= 3; i++) {
    g.moveTo(i * 1.5, -27 + bob).lineTo(i * 1.5, -24 + bob + breathe);
    g.stroke({ width: 0.8, color: 0xddeecc });
  }

  // Eyes (four, burning with psychic malice)
  const eyeFlare = 0.6 + Math.sin(time * 4) * 0.4;
  // Outer eyes
  g.circle(-5, -31 + bob, 2.5);
  g.fill({ color: 0xff2222, alpha: eyeFlare });
  g.circle(5, -31 + bob, 2.5);
  g.fill({ color: 0xff2222, alpha: eyeFlare });
  g.circle(-5, -31 + bob, 1.2);
  g.fill(0xff6644);
  g.circle(5, -31 + bob, 1.2);
  g.fill(0xff6644);
  // Inner eyes
  g.circle(-2, -29 + bob, 1.5);
  g.fill({ color: 0xff4422, alpha: eyeFlare });
  g.circle(2, -29 + bob, 1.5);
  g.fill({ color: 0xff4422, alpha: eyeFlare });
  // Psychic eye glow
  g.ellipse(0, -30 + bob, 10, 4);
  g.fill({ color: 0xff2222, alpha: 0.1 + Math.sin(time * 3) * 0.05 });

  // Ichor dripping from mouth
  for (let i = 0; i < 3; i++) {
    const dripPhase = (time * 15 + i * 3) % 12;
    const dripX = -2 + i * 2;
    g.circle(dripX, -24 + bob + dripPhase, 0.8);
    g.fill({ color: 0x44cc66, alpha: Math.max(0, 1 - dripPhase / 12) });
  }

  // Psychic aura
  g.ellipse(0, -16 + bob, 22, 28);
  g.stroke({ width: 0.5, color: 0x44cc66, alpha: 0.08 + Math.sin(time * 2) * 0.04 });
}

// ═══════════════════════════════════════════════════════════
//  OBJECTS
// ═══════════════════════════════════════════════════════════

/** Draw a loot chest (Imperial supply crate) */
export function drawChest(g: Graphics, opened: boolean, time: number): void {
  g.clear();
  const glow = Math.sin(time * 3) * 0.2 + 0.5;

  g.ellipse(0, 6, 10, 5);
  g.fill({ color: 0x000000, alpha: 0.3 });

  if (opened) {
    // Open crate
    g.roundRect(-10, -4, 20, 10, 2);
    g.fill(0x554433);
    g.roundRect(-10, -4, 20, 10, 2);
    g.stroke({ width: 0.5, color: 0x665544 });
    // Lid (tilted back)
    g.moveTo(-10, -4).lineTo(-11, -12).lineTo(9, -12).lineTo(10, -4);
    g.fill(0x665544);
    g.moveTo(-10, -4).lineTo(-11, -12).lineTo(9, -12).lineTo(10, -4);
    g.stroke({ width: 0.5, color: 0x776655 });
    // Contents glow
    g.ellipse(0, -1, 6, 3);
    g.fill({ color: 0xffaa44, alpha: 0.3 });
  } else {
    // Glow aura
    g.ellipse(0, -2, 14, 10);
    g.fill({ color: 0xcc8833, alpha: glow * 0.15 });

    // Crate body
    g.roundRect(-10, -10, 20, 14, 2);
    g.fill(0x554433);
    g.roundRect(-10, -10, 20, 14, 2);
    g.stroke({ width: 0.5, color: 0x665544 });

    // Metal bands
    g.roundRect(-10, -8, 20, 2, 0);
    g.fill(0x665544);
    g.roundRect(-10, -2, 20, 2, 0);
    g.fill(0x665544);

    // Imperial skull lock
    g.circle(0, -4, 3);
    g.fill(0x998866);
    g.circle(0, -4, 2);
    g.fill(0xbbaa88);
    g.circle(-0.7, -4.5, 0.5);
    g.fill(0x333322);
    g.circle(0.7, -4.5, 0.5);
    g.fill(0x333322);

    // Lock glow
    g.circle(0, -4, 4);
    g.fill({ color: 0xffaa44, alpha: glow * 0.2 });
  }
}

/** Draw a shop terminal (Mechanicus data-shrine) */
export function drawShopTerminal(g: Graphics, time: number): void {
  g.clear();
  const pulse = Math.sin(time * 2) * 0.15 + 0.85;

  g.ellipse(0, 7, 12, 6);
  g.fill({ color: 0x000000, alpha: 0.3 });

  // Base pedestal
  g.roundRect(-8, -2, 16, 8, 1);
  g.fill(0x2a3344);

  // Terminal body
  g.roundRect(-10, -22, 20, 22, 2);
  g.fill(0x334455);
  g.roundRect(-10, -22, 20, 22, 2);
  g.stroke({ width: 0.5, color: 0x445566 });

  // Screen
  g.roundRect(-7, -20, 14, 10, 1);
  g.fill({ color: 0x115533, alpha: pulse });
  // Screen content (scrolling text lines)
  for (let i = 0; i < 4; i++) {
    const w = 6 + Math.sin(time + i) * 3;
    g.roundRect(-5, -18 + i * 2.5, w, 1, 0);
    g.fill({ color: 0x33aa66, alpha: pulse * 0.7 });
  }
  // Screen glow
  g.ellipse(0, -15, 10, 8);
  g.fill({ color: 0x339966, alpha: 0.1 });

  // Cog Mechanicus symbol
  g.circle(0, -5, 3);
  g.fill(0x445566);
  g.circle(0, -5, 2);
  g.fill(0x556677);
  // Cog teeth
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time * 0.5;
    const cx = Math.cos(angle) * 3.5;
    const cy = -5 + Math.sin(angle) * 3.5;
    g.circle(cx, cy, 0.8);
    g.fill(0x445566);
  }

  // Antenna array
  g.moveTo(-3, -22).lineTo(-3, -28);
  g.stroke({ width: 1, color: 0x556677 });
  g.moveTo(3, -22).lineTo(3, -26);
  g.stroke({ width: 1, color: 0x556677 });
  g.circle(-3, -28, 1.5);
  g.fill({ color: 0x339966, alpha: pulse });
  g.circle(3, -26, 1);
  g.fill({ color: 0xff4444, alpha: Math.sin(time * 4) > 0 ? 0.8 : 0.2 });
}
