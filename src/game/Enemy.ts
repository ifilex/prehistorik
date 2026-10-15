/**
 * Enemies and Bosses for Prehistorik 1991.
 * Features classic patrol AI, multi-hit durability, death launch with food drops,
 * and multi-phase Boss arenas with cognitive reaction timing tracking.
 */

import { EnemyType, Direction, Rect, FoodType } from '../types.ts';
import { SpriteEngine } from '../engine/Sprites.ts';
import { soundSystem } from '../engine/SoundSystem.ts';

export class Enemy {
  public id: string;
  public type: EnemyType;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public vx: number = 0;
  public vy: number = 0;
  public direction: Direction = Direction.LEFT;
  public health: number = 1;
  public maxHealth: number = 1;
  public isDead: boolean = false;
  public deathVy: number = 0;
  public isRemoved: boolean = false;
  public patrolLeft: number = 0;
  public patrolRight: number = 0;
  public scoreValue: number = 100;
  public dropsFoodType: FoodType = FoodType.DRUMSTICK;

  // Boss specific properties
  public isBoss: boolean = false;
  public bossState: 'idle' | 'charging' | 'roaring' | 'vulnerable' | 'jumping' = 'idle';
  public bossTimer: number = 0;
  public bossAttackCueTime: number = 0; // For cognitive reaction tracking

  // Animation
  private animTimer: number = 0;
  private animFrame: number = 0;
  private hurtFlickerTimer: number = 0;

  // Spider specific
  public spiderStartY: number = 0;
  public spiderRange: number = 50;

  constructor(
    id: string,
    type: EnemyType,
    x: number,
    y: number,
    patrolDistance: number = 70
  ) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.patrolLeft = x - patrolDistance;
    this.patrolRight = x + patrolDistance;

    switch (type) {
      case EnemyType.RAPTOR:
        this.width = 24;
        this.height = 20;
        this.vx = -0.75;
        this.health = 1;
        this.maxHealth = 1;
        this.scoreValue = 200;
        this.dropsFoodType = FoodType.DRUMSTICK;
        break;
      case EnemyType.BEAR:
        this.width = 28;
        this.height = 22;
        this.vx = -0.55;
        this.health = 2; // Needs 2 club hits
        this.maxHealth = 2;
        this.scoreValue = 400;
        this.dropsFoodType = FoodType.STEAK;
        break;
      case EnemyType.SPIDER:
        this.width = 16;
        this.height = 18;
        this.spiderStartY = y;
        this.vy = 0.6;
        this.health = 1;
        this.scoreValue = 150;
        this.dropsFoodType = FoodType.APPLE;
        break;
      case EnemyType.PTERODACTYL:
        this.width = 24;
        this.height = 16;
        this.vx = -1.2;
        this.health = 1;
        this.scoreValue = 250;
        this.dropsFoodType = FoodType.BANANA;
        break;

      // Bosses
      case EnemyType.BOSS_TREX:
        this.isBoss = true;
        this.width = 48;
        this.height = 44;
        this.health = 6;
        this.maxHealth = 6;
        this.scoreValue = 2500;
        this.dropsFoodType = FoodType.BURGER;
        break;
      case EnemyType.BOSS_MAMMOTH:
        this.isBoss = true;
        this.width = 48;
        this.height = 44;
        this.health = 8;
        this.maxHealth = 8;
        this.scoreValue = 3500;
        this.dropsFoodType = FoodType.CAKE;
        break;
      case EnemyType.BOSS_DRAGON:
      case EnemyType.BOSS_CHIEFTAIN:
        this.isBoss = true;
        this.width = 52;
        this.height = 46;
        this.health = 10;
        this.maxHealth = 10;
        this.scoreValue = 5000;
        this.dropsFoodType = FoodType.WATERMELON;
        break;
    }
  }

  public update(playerX: number, playerY: number, _deltaTime: number): { attackCueActive: boolean } {
    let attackCueActive = false;

    // Death animation: Launched into air, spinning off screen
    if (this.isDead) {
      this.y += this.deathVy;
      this.deathVy += 0.35;
      if (this.deathVy > 8 && this.y > 280) {
        this.isRemoved = true;
      }
      return { attackCueActive: false };
    }

    if (this.hurtFlickerTimer > 0) {
      this.hurtFlickerTimer--;
    }

    this.animTimer++;
    if (this.animTimer > 8) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    // Boss Logic
    if (this.isBoss) {
      return this.updateBoss(playerX, playerY);
    }

    // Standard Enemy Behaviors
    switch (this.type) {
      case EnemyType.RAPTOR:
      case EnemyType.BEAR:
        this.x += this.vx;
        if (this.x <= this.patrolLeft) {
          this.vx = Math.abs(this.vx);
          this.direction = Direction.RIGHT;
        } else if (this.x >= this.patrolRight) {
          this.vx = -Math.abs(this.vx);
          this.direction = Direction.LEFT;
        }
        break;

      case EnemyType.SPIDER:
        this.y += this.vy;
        if (this.y >= this.spiderStartY + this.spiderRange) {
          this.vy = -0.6;
        } else if (this.y <= this.spiderStartY) {
          this.vy = 0.6;
        }
        break;

      case EnemyType.PTERODACTYL:
        this.x += this.vx;
        // Swoop sinusoidally
        this.y += Math.sin(this.animTimer * 0.15) * 0.4;
        if (this.x <= this.patrolLeft) {
          this.vx = Math.abs(this.vx);
          this.direction = Direction.RIGHT;
        } else if (this.x >= this.patrolRight) {
          this.vx = -Math.abs(this.vx);
          this.direction = Direction.LEFT;
        }
        break;
    }

    return { attackCueActive };
  }

  private updateBoss(playerX: number, _playerY: number): { attackCueActive: boolean } {
    let attackCueActive = false;
    this.bossTimer++;

    // Boss state machine
    switch (this.bossState) {
      case 'idle':
        this.direction = playerX < this.x ? Direction.LEFT : Direction.RIGHT;
        if (this.bossTimer > 60) {
          this.bossTimer = 0;
          // Telegraph attack / Roar
          this.bossState = 'roaring';
          soundSystem.playBossRoar();
        }
        break;

      case 'roaring':
        // Boss roars and exposes weak spot for 45 frames
        attackCueActive = true;
        if (this.bossTimer > 45) {
          this.bossTimer = 0;
          this.bossState = 'charging';
        }
        break;

      case 'charging':
        const chargeSpeed = this.direction === Direction.LEFT ? -2.2 : 2.2;
        this.x += chargeSpeed;
        if (this.bossTimer > 55) {
          this.bossTimer = 0;
          this.bossState = 'vulnerable';
        }
        break;

      case 'vulnerable':
        // Tired recovery state - Player can counter-attack!
        attackCueActive = true;
        if (this.bossTimer > 50) {
          this.bossTimer = 0;
          this.bossState = 'idle';
        }
        break;
    }

    return { attackCueActive };
  }

  public takeHit(damage: number = 1): { defeated: boolean; dropsFood: boolean } {
    if (this.isDead) return { defeated: false, dropsFood: false };

    this.health -= damage;
    this.hurtFlickerTimer = 20;
    soundSystem.playHit();

    if (this.health <= 0) {
      this.isDead = true;
      this.deathVy = -5.5; // Jump up and fall down
      return { defeated: true, dropsFood: true };
    }

    return { defeated: false, dropsFood: false };
  }

  public getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (this.isRemoved) return;

    if (this.hurtFlickerTimer > 0 && Math.floor(this.hurtFlickerTimer / 3) % 2 === 0) {
      return;
    }

    const screenX = Math.round(this.x - cameraX);
    const screenY = Math.round(this.y - cameraY);

    let spriteName = 'enemy_raptor_1';

    if (this.isBoss) {
      if (this.type === EnemyType.BOSS_TREX) spriteName = 'boss_trex';
      else if (this.type === EnemyType.BOSS_MAMMOTH) spriteName = 'boss_mammoth';
      else spriteName = 'boss_dragon';
    } else {
      switch (this.type) {
        case EnemyType.RAPTOR:
          spriteName = this.animFrame === 0 ? 'enemy_raptor_1' : 'enemy_raptor_2';
          break;
        case EnemyType.BEAR:
          spriteName = this.animFrame === 0 ? 'enemy_bear_1' : 'enemy_bear_2';
          break;
        case EnemyType.SPIDER:
          spriteName = 'enemy_spider';
          // Draw silk thread up to ceiling
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(screenX + 8, screenY);
          ctx.lineTo(screenX + 8, Math.max(0, screenY - 30));
          ctx.stroke();
          break;
        case EnemyType.PTERODACTYL:
          spriteName = this.animFrame === 0 ? 'enemy_pterodactyl_1' : 'enemy_pterodactyl_2';
          break;
      }
    }

    const sprite = SpriteEngine.get(spriteName);
    if (!sprite) return;

    ctx.save();
    if (this.direction === Direction.RIGHT && !this.isBoss) {
      // Flip facing right
      ctx.translate(screenX + this.width, screenY);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, 0);
    } else {
      ctx.drawImage(sprite, screenX, screenY);
    }

    // If Boss, draw health bar over boss head
    if (this.isBoss && !this.isDead) {
      const barWidth = 44;
      const barHeight = 4;
      const barX = screenX + (this.width - barWidth) / 2;
      const barY = screenY - 8;

      ctx.fillStyle = '#000000';
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
      ctx.fillStyle = '#b00020';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = '#ffea00';
      const healthPct = Math.max(0, this.health / this.maxHealth);
      ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);

      // If vulnerable / roar cue, show exclamation badge
      if (this.bossState === 'roaring' || this.bossState === 'vulnerable') {
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(screenX + this.width / 2 - 10, screenY - 18, 20, 9);
        ctx.fillStyle = '#ffffff';
        ctx.font = '7px monospace';
        ctx.fillText('HIT!', screenX + this.width / 2 - 8, screenY - 11);
      }
    }

    ctx.restore();
  }
}
