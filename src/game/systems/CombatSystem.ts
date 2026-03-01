import {
  CombatPhase, CombatState, CombatLogEntry, DiceResult,
  Enemy, Player, EnemyType, StatusEffect, StatusEffectType,
  PerkId, CombatAction,
} from '../types';
import { SeededRNG } from '../utils/rng';
import { EventBus } from '../engine/EventBus';
import { ENEMY_TEMPLATES, EnemyTemplate } from '../data/enemies';

let logId = 0;
function nextLogId(): string { return `log_${logId++}`; }

export class CombatSystem {
  state: CombatState;
  private rng: SeededRNG;
  private events: EventBus;
  private tempAttackBonus = 0;
  private tempDefenseBonus = 0;
  private floor = 1;

  constructor(rng: SeededRNG, events: EventBus) {
    this.rng = rng;
    this.events = events;
    this.state = this.createEmptyState();
  }

  setFloor(floor: number): void {
    this.floor = floor;
  }

  private createEmptyState(): CombatState {
    return {
      active: false,
      phase: CombatPhase.IDLE,
      enemies: [],
      currentEnemyIndex: 0,
      playerRoll: null,
      enemyRoll: null,
      log: [],
      playerStatusEffects: [],
      turnCount: 0,
    };
  }

  startCombat(enemyTypes: EnemyType[], roomX: number, roomY: number): void {
    const enemies: Enemy[] = enemyTypes.map((type, i) => {
      const template = ENEMY_TEMPLATES[type];
      return this.createEnemy(template, roomX + i, roomY);
    });

    this.state = {
      active: true,
      phase: CombatPhase.PLAYER_TURN,
      enemies,
      currentEnemyIndex: 0,
      playerRoll: null,
      enemyRoll: null,
      log: [],
      playerStatusEffects: [],
      turnCount: 0,
    };

    this.addLog(`Combat begins! ${enemies.length} ${enemies.length === 1 ? 'enemy' : 'enemies'} detected.`, 'system');
    for (const enemy of enemies) {
      this.addLog(`${enemy.name} (HP: ${enemy.hp}, ATK: ${enemy.attackDice}, DEF: ${enemy.defenseDice})`, 'enemy');
    }

    this.events.emit('COMBAT_START', { enemies });
  }

  private createEnemy(template: EnemyTemplate, gx: number, gy: number): Enemy {
    const hpScale = 1 + (this.floor - 1) * 0.3;
    const scaledHp = Math.round(template.hp * hpScale);
    return {
      id: `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      gridX: gx,
      gridY: gy,
      worldX: 0,
      worldY: 0,
      name: template.name,
      type: template.type,
      tier: template.tier,
      hp: scaledHp,
      maxHp: scaledHp,
      attackDice: template.attackDice,
      defenseDice: template.defenseDice,
      xpReward: template.xpReward,
      scrapReward: template.scrapReward,
      description: template.description,
      statusEffects: [],
    };
  }

  // ── Combat Actions ────────────────────────────────────

  /** Player attacks current enemy */
  playerAttack(player: Player): { damage: number; killed: boolean; doubleTap: boolean } {
    const currentEnemy = this.state.enemies[this.state.currentEnemyIndex];
    if (!currentEnemy || currentEnemy.hp <= 0) return { damage: 0, killed: false, doubleTap: false };

    // Check if player is stunned
    if (this.hasPlayerStatus(StatusEffectType.STUNNED)) {
      this.addLog('You are STUNNED and cannot attack!', 'system');
      this.removePlayerStatus(StatusEffectType.STUNNED);
      this.state.phase = CombatPhase.ENEMY_TURN;
      return { damage: 0, killed: false, doubleTap: false };
    }

    this.state.phase = CombatPhase.PLAYER_ROLLING;

    // Calculate dice
    let attackDice = player.attackDice + (player.weapon?.attackBonus ?? 0) + this.tempAttackBonus;
    if (player.perks.includes('sharp_shooter')) attackDice += 1;

    // Weakened penalty on enemy
    const enemyDefenseDice = this.getEffectiveDefense(currentEnemy);

    const attackRoll = this.rollDice(attackDice, player.perks.includes('critical_focus'));
    const defenseRoll = this.rollDice(enemyDefenseDice);

    this.state.playerRoll = attackRoll;
    this.state.enemyRoll = defenseRoll;

    const netHits = Math.max(0, attackRoll.successes - defenseRoll.successes);
    const critBonus = attackRoll.crits;
    const totalDamage = netHits + critBonus;

    this.addLog(`You attack ${currentEnemy.name}!`, 'player');
    this.addLog(`Attack: [${attackRoll.rolls.join(', ')}] → ${attackRoll.successes} hits${attackRoll.crits > 0 ? ` (${attackRoll.crits} crits!)` : ''}`, 'player');
    this.addLog(`Defense: [${defenseRoll.rolls.join(', ')}] → ${defenseRoll.successes} blocks`, 'enemy');

    this.events.emit('DICE_ROLLED', { attacker: 'player', attackRoll, defenseRoll });

    let killed = false;
    let doubleTap = false;
    if (totalDamage > 0) {
      currentEnemy.hp = Math.max(0, currentEnemy.hp - totalDamage);
      this.addLog(`${currentEnemy.name} takes ${totalDamage} damage! (HP: ${currentEnemy.hp}/${currentEnemy.maxHp})`, 'damage');
      this.events.emit('ENEMY_DAMAGED', { enemy: currentEnemy, damage: totalDamage });

      // Bleed Them perk: 20% chance to apply bleeding
      if (player.perks.includes('bleed_them') && this.rng.chance(0.2)) {
        this.applyEnemyStatus(currentEnemy, StatusEffectType.BLEEDING, 3);
        this.addLog(`${currentEnemy.name} is BLEEDING!`, 'damage');
      }

      if (currentEnemy.hp <= 0) {
        this.addLog(`${currentEnemy.name} destroyed!`, 'crit');
        this.events.emit('ENEMY_KILLED', { enemy: currentEnemy });
        killed = true;

        // Double Tap perk: free attack on kill
        if (player.perks.includes('double_tap') && this.state.enemies.some(e => e.hp > 0)) {
          doubleTap = true;
          this.addLog('Double Tap! Free bonus attack!', 'crit');
        }

        this.advanceToNextEnemy();
      }
    } else {
      this.addLog('Attack deflected!', 'info');
    }

    this.tempAttackBonus = 0;

    // Check if all enemies dead
    if (this.state.enemies.every(e => e.hp <= 0)) {
      this.state.phase = CombatPhase.VICTORY;
      this.state.active = false;
      this.addLog('All enemies eliminated!', 'system');
      this.events.emit('COMBAT_END', { result: 'victory' });
      return { damage: totalDamage, killed, doubleTap: false };
    }

    // Enemy turn (if not double tap)
    if (!killed && !doubleTap) {
      this.state.phase = CombatPhase.ENEMY_TURN;
    } else if (doubleTap) {
      this.state.phase = CombatPhase.PLAYER_TURN;
    }

    return { damage: totalDamage, killed, doubleTap };
  }

  /** Player defends: +2 defense dice this turn */
  playerDefend(player: Player): void {
    if (this.hasPlayerStatus(StatusEffectType.STUNNED)) {
      this.addLog('You are STUNNED and cannot defend!', 'system');
      this.removePlayerStatus(StatusEffectType.STUNNED);
      this.state.phase = CombatPhase.ENEMY_TURN;
      return;
    }

    this.state.phase = CombatPhase.PLAYER_ROLLING;
    this.tempDefenseBonus += 2;
    this.applyPlayerStatus(StatusEffectType.FORTIFIED, 1);
    this.addLog('You brace for impact! (+2 defense dice this turn)', 'player');
    this.state.phase = CombatPhase.ENEMY_TURN;
  }

  /** Player attempts to flee */
  playerFlee(player: Player): boolean {
    if (this.hasPlayerStatus(StatusEffectType.STUNNED)) {
      this.addLog('You are STUNNED and cannot flee!', 'system');
      this.removePlayerStatus(StatusEffectType.STUNNED);
      this.state.phase = CombatPhase.ENEMY_TURN;
      return false;
    }

    // Evasion perk: always succeeds
    if (player.perks.includes('evasion')) {
      this.addLog('You swiftly evade all enemies and escape!', 'player');
      this.state.phase = CombatPhase.FLED;
      this.state.active = false;
      this.events.emit('COMBAT_END', { result: 'fled' });
      return true;
    }

    // Need 2+ defense successes to escape
    const defenseDice = player.defenseDice + (player.armor?.defenseBonus ?? 0);
    const roll = this.rollDice(defenseDice);
    this.state.playerRoll = roll;

    this.addLog(`Attempting to flee... [${roll.rolls.join(', ')}] → ${roll.successes} successes`, 'player');

    if (roll.successes >= 2) {
      this.addLog('You escape successfully!', 'player');
      this.state.phase = CombatPhase.FLED;
      this.state.active = false;
      this.events.emit('COMBAT_END', { result: 'fled' });
      return true;
    } else {
      this.addLog('Failed to escape! The enemies close in...', 'enemy');
      this.state.phase = CombatPhase.ENEMY_TURN;
      return false;
    }
  }

  /** Enemy attacks player */
  enemyAttack(player: Player): { damage: number; killed: boolean } {
    const currentEnemy = this.state.enemies[this.state.currentEnemyIndex];
    if (!currentEnemy || currentEnemy.hp <= 0) {
      this.advanceToNextEnemy();
      return { damage: 0, killed: false };
    }

    // Check if enemy is stunned
    if (this.hasEnemyStatus(currentEnemy, StatusEffectType.STUNNED)) {
      this.addLog(`${currentEnemy.name} is STUNNED and skips its turn!`, 'system');
      this.removeEnemyStatus(currentEnemy, StatusEffectType.STUNNED);
      this.advanceToNextEnemy();
      return { damage: 0, killed: false };
    }

    this.state.phase = CombatPhase.ENEMY_ROLLING;

    // Calculate attack (weakened reduces dice)
    let attackDice = currentEnemy.attackDice;
    if (this.hasEnemyStatus(currentEnemy, StatusEffectType.WEAKENED)) {
      attackDice = Math.max(1, attackDice - 1);
    }

    let defenseDice = player.defenseDice + (player.armor?.defenseBonus ?? 0) + this.tempDefenseBonus;
    if (player.perks.includes('iron_skin')) defenseDice += 1;
    // Emergency Shield perk: +3 DEF below 25% HP
    if (player.perks.includes('emergency_shield') && player.hp / player.maxHp < 0.25) {
      defenseDice += 3;
      this.addLog('Emergency Shield activates!', 'player');
    }

    const attackRoll = this.rollDice(attackDice);
    const defenseRoll = this.rollDice(defenseDice);

    this.state.enemyRoll = attackRoll;
    this.state.playerRoll = defenseRoll;

    const netHits = Math.max(0, attackRoll.successes - defenseRoll.successes);
    const critBonus = attackRoll.crits;
    const totalDamage = netHits + critBonus;

    this.addLog(`${currentEnemy.name} attacks!`, 'enemy');
    this.addLog(`Attack: [${attackRoll.rolls.join(', ')}] → ${attackRoll.successes} hits${attackRoll.crits > 0 ? ` (${attackRoll.crits} crits!)` : ''}`, 'enemy');
    this.addLog(`Defense: [${defenseRoll.rolls.join(', ')}] → ${defenseRoll.successes} blocks`, 'player');

    this.events.emit('DICE_ROLLED', { attacker: 'enemy', attackRoll, defenseRoll });

    // Enemy special abilities
    this.applyEnemySpecialAbility(currentEnemy, player);

    let killed = false;
    if (totalDamage > 0) {
      player.hp = Math.max(0, player.hp - totalDamage);
      this.addLog(`You take ${totalDamage} damage! (HP: ${player.hp}/${player.maxHp})`, 'damage');
      this.events.emit('PLAYER_DAMAGED', { damage: totalDamage });

      if (player.hp <= 0) {
        this.state.phase = CombatPhase.DEFEAT;
        this.state.active = false;
        this.addLog('You have been defeated...', 'system');
        this.events.emit('PLAYER_DIED', {});
        killed = true;
      }
    } else {
      this.addLog('You deflect the attack!', 'info');
    }

    this.tempDefenseBonus = 0;

    if (!killed) {
      this.advanceToNextEnemy();
    }

    return { damage: totalDamage, killed };
  }

  // ── Status Effects ────────────────────────────────────

  /** Process start-of-turn status effects for all combatants */
  processStatusEffects(player: Player): void {
    this.state.turnCount++;

    // Player effects
    for (const effect of this.state.playerStatusEffects) {
      switch (effect.type) {
        case StatusEffectType.POISON:
          player.hp = Math.max(0, player.hp - 1);
          this.addLog('POISON deals 1 damage to you!', 'damage');
          break;
        case StatusEffectType.BLEEDING:
          player.hp = Math.max(0, player.hp - 2);
          this.addLog('BLEEDING deals 2 damage to you!', 'damage');
          break;
      }
      effect.duration--;
    }
    this.state.playerStatusEffects = this.state.playerStatusEffects.filter(e => e.duration > 0);

    // Enemy effects
    for (const enemy of this.state.enemies) {
      if (enemy.hp <= 0) continue;
      for (const effect of enemy.statusEffects) {
        switch (effect.type) {
          case StatusEffectType.POISON:
            enemy.hp = Math.max(0, enemy.hp - 1);
            this.addLog(`POISON deals 1 damage to ${enemy.name}!`, 'damage');
            if (enemy.hp <= 0) {
              this.addLog(`${enemy.name} destroyed by poison!`, 'crit');
              this.events.emit('ENEMY_KILLED', { enemy });
            }
            break;
          case StatusEffectType.BLEEDING:
            enemy.hp = Math.max(0, enemy.hp - 2);
            this.addLog(`BLEEDING deals 2 damage to ${enemy.name}!`, 'damage');
            if (enemy.hp <= 0) {
              this.addLog(`${enemy.name} bleeds out!`, 'crit');
              this.events.emit('ENEMY_KILLED', { enemy });
            }
            break;
        }
        effect.duration--;
      }
      enemy.statusEffects = enemy.statusEffects.filter(e => e.duration > 0);
    }

    // Check if all enemies dead from status effects
    if (this.state.enemies.every(e => e.hp <= 0)) {
      this.state.phase = CombatPhase.VICTORY;
      this.state.active = false;
      this.addLog('All enemies eliminated!', 'system');
      this.events.emit('COMBAT_END', { result: 'victory' });
    }

    if (player.hp <= 0) {
      this.state.phase = CombatPhase.DEFEAT;
      this.state.active = false;
      this.addLog('You succumb to your wounds...', 'system');
      this.events.emit('PLAYER_DIED', {});
    }
  }

  private applyEnemySpecialAbility(enemy: Enemy, player: Player): void {
    switch (enemy.type) {
      case EnemyType.ACID_SPITTER:
        if (this.rng.chance(0.3)) {
          this.applyPlayerStatus(StatusEffectType.POISON, 3);
          this.addLog('Acid Spitter poisons you!', 'enemy');
        }
        break;
      case EnemyType.PHASE_STALKER:
        if (this.rng.chance(0.25)) {
          this.applyPlayerStatus(StatusEffectType.STUNNED, 1);
          this.addLog('Phase Stalker stuns you with a dimensional shift!', 'enemy');
        }
        break;
      case EnemyType.HULL_BREAKER:
        if (this.rng.chance(0.25)) {
          this.applyPlayerStatus(StatusEffectType.WEAKENED, 2);
          this.addLog('Hull Breaker weakens you with a crushing blow!', 'enemy');
        }
        break;
      case EnemyType.BROOD_QUEEN:
        if (this.rng.chance(0.35)) {
          this.applyPlayerStatus(StatusEffectType.BLEEDING, 3);
          this.addLog('Brood Queen rakes you with her claws! You are BLEEDING!', 'enemy');
        }
        break;
    }
  }

  private applyPlayerStatus(type: StatusEffectType, duration: number): void {
    const existing = this.state.playerStatusEffects.find(e => e.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
    } else {
      this.state.playerStatusEffects.push({ type, duration });
    }
  }

  private removePlayerStatus(type: StatusEffectType): void {
    this.state.playerStatusEffects = this.state.playerStatusEffects.filter(e => e.type !== type);
  }

  private hasPlayerStatus(type: StatusEffectType): boolean {
    return this.state.playerStatusEffects.some(e => e.type === type);
  }

  private applyEnemyStatus(enemy: Enemy, type: StatusEffectType, duration: number): void {
    const existing = enemy.statusEffects.find(e => e.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
    } else {
      enemy.statusEffects.push({ type, duration });
    }
  }

  private removeEnemyStatus(enemy: Enemy, type: StatusEffectType): void {
    enemy.statusEffects = enemy.statusEffects.filter(e => e.type !== type);
  }

  private hasEnemyStatus(enemy: Enemy, type: StatusEffectType): boolean {
    return enemy.statusEffects.some(e => e.type === type);
  }

  private getEffectiveDefense(enemy: Enemy): number {
    let def = enemy.defenseDice;
    if (this.hasEnemyStatus(enemy, StatusEffectType.WEAKENED)) {
      def = Math.max(0, def - 1);
    }
    return def;
  }

  // ── Core Mechanics ────────────────────────────────────

  private advanceToNextEnemy(): void {
    for (let i = 0; i < this.state.enemies.length; i++) {
      const idx = (this.state.currentEnemyIndex + i + 1) % this.state.enemies.length;
      if (this.state.enemies[idx].hp > 0) {
        this.state.currentEnemyIndex = idx;
        this.state.phase = CombatPhase.PLAYER_TURN;
        return;
      }
    }
    // All dead
    this.state.phase = CombatPhase.VICTORY;
    this.state.active = false;
  }

  /** Roll dice and count successes (4+), crits (6, or 5+ with critical_focus) */
  rollDice(count: number, criticalFocus = false): DiceResult {
    const clamped = Math.max(1, count);
    const rolls = this.rng.rollDice(clamped);
    let successes = 0;
    let crits = 0;
    for (const r of rolls) {
      if (r >= 4) successes++;
      if (r === 6) crits++;
      else if (criticalFocus && r === 5) crits++;
    }
    return { rolls, successes, crits, total: successes };
  }

  /** Apply temporary combat bonuses from consumables */
  applyBoost(type: 'attack' | 'defense', value: number): void {
    if (type === 'attack') this.tempAttackBonus += value;
    else this.tempDefenseBonus += value;
  }

  /** Get combat rewards */
  getRewards(): { xp: number; scrap: number } {
    let xp = 0;
    let scrap = 0;
    for (const enemy of this.state.enemies) {
      xp += enemy.xpReward;
      scrap += enemy.scrapReward;
    }
    return { xp, scrap };
  }

  endCombat(): void {
    this.state = this.createEmptyState();
    this.tempAttackBonus = 0;
    this.tempDefenseBonus = 0;
  }

  addLog(text: string, type: CombatLogEntry['type']): void {
    this.state.log.push({
      id: nextLogId(),
      text,
      type,
      timestamp: Date.now(),
    });
  }
}
