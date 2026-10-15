/**
 * Main Game Engine for Prehistorik 1991 MS-DOS Clone.
 * Implements 60FPS game loop, 320x200 pixel-art rendering pipeline,
 * tile collisions, food mechanics, cognitive evaluation, and level transitions.
 */

import {
  GameState,
  LevelDefinition,
  FoodItem,
  SecretWall,
  Particle,
  FloatingText,
  CognitiveStats,
  Rect,
  PlayerActionState,
  FoodType
} from '../types.ts';
import { Player } from './Player.ts';
import { Enemy } from './Enemy.ts';
import { LEVELS } from './LevelData.ts';
import { SpriteEngine } from '../engine/Sprites.ts';
import { soundSystem } from '../engine/SoundSystem.ts';
import { inputManager } from '../engine/InputManager.ts';
import { CloudStorage } from './CloudStorage.ts';

export class GameEngine {
  public internalWidth: number = 320;
  public internalHeight: number = 200;

  // Offscreen rendering canvas (crisp 320x200)
  public offscreenCanvas: HTMLCanvasElement;
  public offscreenCtx: CanvasRenderingContext2D;

  // State
  public state: GameState = GameState.TITLE;
  public currentLevelIndex: number = 0;
  public currentLevel: LevelDefinition;
  public score: number = 0;
  public highScore: number = 5000;
  public foodCollected: number = 0;
  public timeRemaining: number = 120;
  private timeTickTimer: number = 0;

  // Warning for missing food at exit
  public showNeedFoodWarning: boolean = false;
  private foodWarningTimer: number = 0;

  // Entities
  public player: Player;
  public enemies: Enemy[] = [];
  public foodItems: FoodItem[] = [];
  public secretWalls: SecretWall[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Camera
  public cameraX: number = 0;
  public cameraY: number = 0;

  // Cognitive Tracking System (Hand-Eye Coordination & Reaction Timing)
  public cognitiveStats: CognitiveStats = {
    totalSwings: 0,
    successfulHits: 0,
    reactionTimesMs: [],
    averageReactionMs: 250,
    accuracyPercentage: 100,
    damageTakenCount: 0,
    secretCavesFound: 0,
    totalSecretCaves: 1,
    foodCollectedCount: 0,
    cognitiveScore: 850,
    grade: 'A'
  };

  private bossAttackCueTimestamp: number = 0;
  private waitingForReaction: boolean = false;

  // Loop control
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly step: number = 1000 / 60; // 60 FPS
  private isRunning: boolean = false;
  private animFrameId: number | null = null;

  // Callbacks for UI updates
  public onStateChange?: (state: GameState) => void;
  public onHUDUpdate?: () => void;

  constructor() {
    SpriteEngine.init();

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.internalWidth;
    this.offscreenCanvas.height = this.internalHeight;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    this.offscreenCtx.imageSmoothingEnabled = false;

    this.currentLevel = LEVELS[0];
    this.player = new Player(this.currentLevel.playerStartX, this.currentLevel.playerStartY);

    // Load saved high score or progress
    const saved = CloudStorage.loadProgress();
    if (saved) {
      this.highScore = Math.max(this.highScore, saved.highScore);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundSystem.stopMusic();
  }

  public startNewGame() {
    this.score = 0;
    this.currentLevelIndex = 0;
    this.player.lives = 3;
    this.resetCognitiveStats();
    this.loadLevel(0);
    this.state = GameState.PLAYING;
    this.notifyState();
  }

  public continueGame() {
    const saved = CloudStorage.loadProgress();
    if (saved) {
      this.currentLevelIndex = Math.min(saved.levelNumber - 1, LEVELS.length - 1);
      this.score = saved.score;
      this.player.lives = Math.max(1, saved.lives);
      this.loadLevel(this.currentLevelIndex);
      this.state = GameState.PLAYING;
      this.notifyState();
    } else {
      this.startNewGame();
    }
  }

  public resetCognitiveStats() {
    this.cognitiveStats = {
      totalSwings: 0,
      successfulHits: 0,
      reactionTimesMs: [],
      averageReactionMs: 250,
      accuracyPercentage: 100,
      damageTakenCount: 0,
      secretCavesFound: 0,
      totalSecretCaves: 1,
      foodCollectedCount: 0,
      cognitiveScore: 850,
      grade: 'A'
    };
  }

  public loadLevel(index: number) {
    this.currentLevelIndex = index;
    this.currentLevel = LEVELS[index];
    this.foodCollected = 0;
    this.timeRemaining = this.currentLevel.timeLimitSeconds;
    this.showNeedFoodWarning = false;
    this.particles = [];
    this.floatingTexts = [];

    // Reset Player
    this.player.reset(this.currentLevel.playerStartX, this.currentLevel.playerStartY);

    // Spawn Food
    this.foodItems = this.currentLevel.foodSpawns.map((f, i) => {
      let foodPts = 15;
      let scoreVal = 200;
      switch (f.type) {
        case FoodType.APPLE:
          foodPts = 10;
          scoreVal = 100;
          break;
        case FoodType.BANANA:
          foodPts = 15;
          scoreVal = 150;
          break;
        case FoodType.WATERMELON:
          foodPts = 25;
          scoreVal = 250;
          break;
        case FoodType.BURGER:
          foodPts = 35;
          scoreVal = 400;
          break;
        case FoodType.CAKE:
          foodPts = 40;
          scoreVal = 500;
          break;
        case FoodType.DRUMSTICK:
          foodPts = 30;
          scoreVal = 300;
          break;
        case FoodType.STEAK:
          foodPts = 45;
          scoreVal = 450;
          break;
      }
      return {
        id: `food_${i}`,
        x: f.x,
        y: f.y,
        width: 16,
        height: 16,
        type: f.type,
        foodPoints: foodPts,
        scoreValue: scoreVal,
        collected: false
      };
    });

    // Spawn Enemies & Boss
    this.enemies = [];
    if (this.currentLevel.isBossLevel && this.currentLevel.bossConfig && this.currentLevel.bossType) {
      const cfg = this.currentLevel.bossConfig;
      const boss = new Enemy('boss_main', this.currentLevel.bossType, cfg.x, cfg.y, 80);
      boss.health = cfg.maxHealth;
      boss.maxHealth = cfg.maxHealth;
      this.enemies.push(boss);
    } else {
      this.enemies = this.currentLevel.enemySpawns.map((e, i) => {
        return new Enemy(`enemy_${i}`, e.type, e.x, e.y, e.patrolDistance || 50);
      });
    }

    // Secret Walls
    this.secretWalls = this.currentLevel.secretWalls.map((sw, i) => {
      return {
        id: `secret_${i}`,
        tileX: sw.tileX,
        tileY: sw.tileY,
        width: 16,
        height: 16,
        hitsLeft: sw.hits,
        destroyed: false,
        revealsRoomId: sw.revealsSecret
      };
    });
    this.cognitiveStats.totalSecretCaves = Math.max(1, this.secretWalls.length);

    // Play Theme Music
    if (this.currentLevel.isBossLevel) {
      soundSystem.startMusic('boss');
    } else if (this.currentLevel.theme === 'cave') {
      soundSystem.startMusic('cave');
    } else {
      soundSystem.startMusic('level');
    }

    // Auto-save game to cloud/local
    this.saveCurrentProgress();
  }

  public saveCurrentProgress() {
    CloudStorage.saveProgress({
      levelNumber: this.currentLevelIndex + 1,
      score: this.score,
      lives: this.player.lives,
      highScore: Math.max(this.score, this.highScore),
      timestamp: Date.now(),
      cognitiveBenchmark: {
        avgReactionMs: Math.round(this.cognitiveStats.averageReactionMs),
        accuracy: Math.round(this.cognitiveStats.accuracyPercentage),
        grade: this.cognitiveStats.grade
      }
    });
  }

  // --- Main 60 FPS Fixed-Step Game Loop ---
  private gameLoop(time: number) {
    if (!this.isRunning) return;

    const delta = time - this.lastTime;
    this.lastTime = time;
    this.accumulator += Math.min(delta, 100); // Guard against tab freeze

    while (this.accumulator >= this.step) {
      this.update();
      this.accumulator -= this.step;
    }

    this.render();
    this.animFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  // --- Core Game Update Step ---
  public update() {
    // Handle Pause
    if (inputManager.wasPauseJustPressed()) {
      if (this.state === GameState.PLAYING) {
        this.state = GameState.PAUSED;
        this.notifyState();
      } else if (this.state === GameState.PAUSED) {
        this.state = GameState.PLAYING;
        this.notifyState();
      }
    }

    if (this.state !== GameState.PLAYING) {
      if (this.state === GameState.TITLE && inputManager.wasStartJustPressed()) {
        this.startNewGame();
        this.notifyState();
      }
      inputManager.update();
      return;
    }

    // Timer Countdown
    this.timeTickTimer++;
    if (this.timeTickTimer >= 60) {
      this.timeTickTimer = 0;
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        // Time over - Sam dies!
        this.player.triggerDeath();
      }
      if (this.onHUDUpdate) this.onHUDUpdate();
    }

    // Food warning dismiss
    if (this.showNeedFoodWarning) {
      this.foodWarningTimer--;
      if (this.foodWarningTimer <= 0) {
        this.showNeedFoodWarning = false;
      }
    }

    // Input collection
    const left = inputManager.isLeft();
    const right = inputManager.isRight();
    const jump = inputManager.wasJumpJustPressed();
    const attack = inputManager.wasAttackJustPressed();

    // Track swing for Cognitive Accuracy
    if (attack) {
      this.cognitiveStats.totalSwings++;

      // Check if this was a response to an active boss cue
      if (this.waitingForReaction) {
        const reactionTime = performance.now() - this.bossAttackCueTimestamp;
        if (reactionTime > 50 && reactionTime < 1000) {
          this.cognitiveStats.reactionTimesMs.push(reactionTime);
          this.recalculateCognitiveStats();
        }
        this.waitingForReaction = false;
      }
    }

    // 1. Update Player Inputs & Animation
    this.player.update(left, right, jump, attack);

    // Check Player Death Transition
    if (this.player.isDeadFinished) {
      if (this.player.lives <= 0) {
        this.state = GameState.GAME_OVER;
        soundSystem.stopMusic();
        this.saveCurrentProgress();
        this.notifyState();
      } else {
        // Respawn in same level
        this.player.reset(this.currentLevel.playerStartX, this.currentLevel.playerStartY);
      }
    }

    // 2. Perform Separated 2D Collision Resolution (X then Y)
    this.player.moveAndCollide(
      this.currentLevel.mapGrid,
      this.currentLevel.width,
      this.currentLevel.height,
      () => {
        this.cognitiveStats.damageTakenCount++;
        this.spawnHitParticles(this.player.x + 10, this.player.y + 10, '#e63946');
        this.recalculateCognitiveStats();
      }
    );

    // 3. Club Attack Check against Enemies & Secret Walls
    this.checkClubHit();

    // 4. Update Enemies & Boss
    this.updateEnemies();

    // 5. Update Food Items & Pickup
    this.updateFoodItems();

    // 6. Check Level Exit Reached
    this.checkLevelExit();

    // 7. Update Particles & Floating Text
    this.updateParticles();

    // 8. Update Camera to Follow Player
    this.updateCamera();

    // Reset just-pressed input flags
    inputManager.update();
  }

  // --- Club Smash Hit Detection ---
  private checkClubHit() {
    const clubBox = this.player.getClubHitbox();
    if (!clubBox) return;

    let hitRegistered = false;

    // 1. Hit Enemies
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      if (this.checkOverlap(clubBox, enemy.getBounds())) {
        hitRegistered = true;
        const result = enemy.takeHit(1);

        this.spawnHitParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ffea00');
        this.addFloatingText(enemy.x, enemy.y - 10, `+${enemy.scoreValue}`, '#ffd166');

        if (result.defeated) {
          this.score += enemy.scoreValue;

          // Drop Food item from defeated enemy!
          if (result.dropsFood) {
            this.foodItems.push({
              id: `dropped_food_${Date.now()}_${Math.random()}`,
              x: enemy.x + 4,
              y: enemy.y,
              width: 16,
              height: 16,
              type: enemy.dropsFoodType,
              foodPoints: 25,
              scoreValue: 200,
              collected: false
            });
            this.spawnHitParticles(enemy.x + 8, enemy.y + 8, '#f77f00');
          }

          // If this was a Boss, victory fanfare!
          if (enemy.isBoss) {
            soundSystem.playVictory();
            this.addFloatingText(enemy.x - 20, enemy.y - 25, '¡JEFE DERROTADO!', '#06d6a0');
          }
        }
      }
    }

    // 2. Hit Secret Walls
    for (const sw of this.secretWalls) {
      if (sw.destroyed) continue;

      const wallBox: Rect = {
        x: sw.tileX * 16,
        y: sw.tileY * 16,
        width: sw.width,
        height: sw.height
      };

      if (this.checkOverlap(clubBox, wallBox)) {
        hitRegistered = true;
        sw.hitsLeft--;
        soundSystem.playSecretWallSmash();
        this.spawnHitParticles(wallBox.x + 8, wallBox.y + 8, '#8d99ae');

        if (sw.hitsLeft <= 0) {
          sw.destroyed = true;
          // Clear wall tile from map grid
          if (this.currentLevel.mapGrid[sw.tileY]) {
            this.currentLevel.mapGrid[sw.tileY][sw.tileX] = 0;
          }
          // Clear any vertically stacked secret wall tiles in this column so the entire 32px doorway opens!
          for (let dy = -2; dy <= 2; dy++) {
            const checkY = sw.tileY + dy;
            if (this.currentLevel.mapGrid[checkY] && this.currentLevel.mapGrid[checkY][sw.tileX] === 5) {
              this.currentLevel.mapGrid[checkY][sw.tileX] = 0;
              this.spawnHitParticles(sw.tileX * 16 + 8, checkY * 16 + 8, '#8d99ae');
            }
          }
          this.cognitiveStats.secretCavesFound++;
          this.score += 500;
          this.addFloatingText(wallBox.x - 30, wallBox.y - 15, sw.revealsRoomId || '¡SECRETO!', '#ffb703');
          this.recalculateCognitiveStats();
        }
      }
    }

    // 3. Fallback check for any breakable secret wall tiles (5) directly hit in mapGrid
    const startTx = Math.max(0, Math.floor(clubBox.x / 16));
    const endTx = Math.min(this.currentLevel.width - 1, Math.floor((clubBox.x + clubBox.width) / 16));
    const startTy = Math.max(0, Math.floor(clubBox.y / 16));
    const endTy = Math.min(this.currentLevel.height - 1, Math.floor((clubBox.y + clubBox.height) / 16));

    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        if (this.currentLevel.mapGrid[ty] && this.currentLevel.mapGrid[ty][tx] === 5) {
          const registered = this.secretWalls.find(s => s.tileX === tx && s.tileY === ty && !s.destroyed);
          if (!registered) {
            hitRegistered = true;
            this.currentLevel.mapGrid[ty][tx] = 0;
            for (let dy = -2; dy <= 2; dy++) {
              const cy = ty + dy;
              if (this.currentLevel.mapGrid[cy] && this.currentLevel.mapGrid[cy][tx] === 5) {
                this.currentLevel.mapGrid[cy][tx] = 0;
              }
            }
            soundSystem.playSecretWallSmash();
            this.spawnHitParticles(tx * 16 + 8, ty * 16 + 8, '#8d99ae');
            this.addFloatingText(tx * 16 - 20, ty * 16 - 15, '¡SECRETO!', '#ffb703');
            this.score += 500;
            this.cognitiveStats.secretCavesFound++;
            this.recalculateCognitiveStats();
          }
        }
      }
    }

    if (hitRegistered) {
      this.cognitiveStats.successfulHits++;
      this.recalculateCognitiveStats();
    }
  }

  // --- Enemy AI & Hurt ---
  private updateEnemies() {
    const pBounds = this.player.getBounds();

    for (const enemy of this.enemies) {
      const { attackCueActive } = enemy.update(this.player.x, this.player.y, this.step);

      // Cue timing tracking for Hand-Eye reaction
      if (attackCueActive && !this.waitingForReaction) {
        this.waitingForReaction = true;
        this.bossAttackCueTimestamp = performance.now();
      }

      if (enemy.isDead || enemy.isRemoved) continue;

      // Enemy touches player
      if (this.checkOverlap(pBounds, enemy.getBounds())) {
        if (this.player.takeDamage()) {
          this.cognitiveStats.damageTakenCount++;
          this.spawnHitParticles(this.player.x + 10, this.player.y + 10, '#d90429');
          this.recalculateCognitiveStats();
        }
      }
    }

    // Clean up removed enemies
    this.enemies = this.enemies.filter(e => !e.isRemoved);
  }

  // --- Food Items Collection ---
  private updateFoodItems() {
    const pBounds = this.player.getBounds();

    for (const food of this.foodItems) {
      if (food.collected) continue;

      const fBox: Rect = {
        x: food.x,
        y: food.y,
        width: food.width,
        height: food.height
      };

      if (this.checkOverlap(pBounds, fBox)) {
        food.collected = true;
        this.foodCollected += food.foodPoints;
        this.score += food.scoreValue;
        this.cognitiveStats.foodCollectedCount++;

        soundSystem.playFoodPickup();
        this.spawnHitParticles(food.x + 8, food.y + 8, '#ffea00');
        this.addFloatingText(food.x, food.y - 8, `+${food.foodPoints}% FOOD`, '#70e000');

        this.recalculateCognitiveStats();
        if (this.onHUDUpdate) this.onHUDUpdate();
      }
    }
  }

  // --- Level Exit & Food Bar Gate System ---
  private checkLevelExit() {
    const pBounds = this.player.getBounds();
    const exitBox: Rect = {
      x: this.currentLevel.exitX,
      y: this.currentLevel.exitY,
      width: 24,
      height: 32
    };

    if (this.checkOverlap(pBounds, exitBox)) {
      // Check Food Bar: Must be at least 100% of required food!
      const foodPercent = Math.min(100, Math.round((this.foodCollected / this.currentLevel.targetFood) * 100));

      if (foodPercent < 100) {
        // Crucial Prehistorik 1991 mechanic: Cannot exit without 100% food!
        if (!this.showNeedFoodWarning) {
          this.showNeedFoodWarning = true;
          this.foodWarningTimer = 140; // ~2.3 seconds display
          soundSystem.playDizzyTweet();
        }
      } else {
        // Level Complete!
        this.completeLevel();
      }
    }
  }

  private completeLevel() {
    soundSystem.playVictory();
    // Time bonus
    const timeBonus = this.timeRemaining * 10;
    this.score += timeBonus;
    this.saveCurrentProgress();

    if (this.currentLevelIndex >= LEVELS.length - 1) {
      // Game Won!
      this.state = GameState.VICTORY;
      this.notifyState();
    } else {
      this.state = GameState.LEVEL_COMPLETE;
      this.notifyState();
    }
  }

  public nextLevel() {
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.loadLevel(this.currentLevelIndex + 1);
      this.state = GameState.PLAYING;
      this.notifyState();
    }
  }

  // --- Cognitive Analytics Recalculation ---
  private recalculateCognitiveStats() {
    const stats = this.cognitiveStats;

    // Accuracy
    if (stats.totalSwings > 0) {
      stats.accuracyPercentage = Math.min(100, (stats.successfulHits / stats.totalSwings) * 100);
    }

    // Reaction Time
    if (stats.reactionTimesMs.length > 0) {
      const sum = stats.reactionTimesMs.reduce((a, b) => a + b, 0);
      stats.averageReactionMs = sum / stats.reactionTimesMs.length;
    }

    // Overall Cognitive Score (0 to 1000)
    let score = 500;
    score += stats.accuracyPercentage * 3; // up to +300
    score -= Math.max(0, (stats.averageReactionMs - 200) * 0.5); // faster reaction adds up to +100
    score += stats.secretCavesFound * 60;
    score -= stats.damageTakenCount * 25;
    stats.cognitiveScore = Math.max(100, Math.min(1000, Math.round(score)));

    // Grade
    if (stats.cognitiveScore >= 900) stats.grade = 'S';
    else if (stats.cognitiveScore >= 800) stats.grade = 'A';
    else if (stats.cognitiveScore >= 680) stats.grade = 'B';
    else if (stats.cognitiveScore >= 520) stats.grade = 'C';
    else stats.grade = 'D';
  }

  // --- Particles & Text ---
  private spawnHitParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 7; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 0,
        maxLife: 18 + Math.random() * 10,
        color,
        size: Math.random() > 0.5 ? 2 : 3,
        gravity: 0.15
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0,
      maxLife: 40
    });
  }

  private updateParticles() {
    // Particles
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.life++;
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife);

    // Floating text
    for (const ft of this.floatingTexts) {
      ft.y -= 0.4;
      ft.life++;
    }
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life < ft.maxLife);
  }

  // --- Camera Update ---
  private updateCamera() {
    const targetX = this.player.x - this.internalWidth / 2 + this.player.width / 2;
    const targetY = this.player.y - this.internalHeight / 2 + this.player.height / 2;

    const maxCamX = Math.max(0, this.currentLevel.width * 16 - this.internalWidth);
    const maxCamY = Math.max(0, this.currentLevel.height * 16 - this.internalHeight);

    // Smooth camera lag
    this.cameraX += (targetX - this.cameraX) * 0.12;
    this.cameraY += (targetY - this.cameraY) * 0.12;

    this.cameraX = Math.max(0, Math.min(this.cameraX, maxCamX));
    this.cameraY = Math.max(0, Math.min(this.cameraY, maxCamY));
  }

  // --- Overlap helper ---
  private checkOverlap(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
    if (this.onHUDUpdate) {
      this.onHUDUpdate();
    }
  }

  // --- 320x200 Pixel-Art Rendering Pipeline ---
  public render() {
    const ctx = this.offscreenCtx;
    const camX = Math.round(this.cameraX);
    const camY = Math.round(this.cameraY);

    // 1. Draw Background Sky / Cavern / Volcano
    this.drawBackground(ctx, camX, camY);

    // 2. Draw Level Tilemap
    this.drawTilemap(ctx, camX, camY);

    // 3. Draw Exit Totem
    this.drawExitTotem(ctx, camX, camY);

    // 4. Draw Food Items
    for (const food of this.foodItems) {
      if (!food.collected) {
        const sprite = SpriteEngine.get(`food_${food.type.toLowerCase()}`);
        if (sprite) {
          ctx.drawImage(sprite, Math.round(food.x - camX), Math.round(food.y - camY));
        }
      }
    }

    // 5. Draw Enemies & Boss
    for (const enemy of this.enemies) {
      enemy.draw(ctx, camX, camY);
    }

    // 6. Draw Player (Sam)
    this.player.draw(ctx, camX, camY);

    // 7. Draw Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.size, p.size);
    }

    // 8. Draw Floating Score / Text
    ctx.font = '7px monospace';
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x - camX), Math.round(ft.y - camY));
    }

    // 9. Draw Need More Food Warning Overlay if triggered
    if (this.showNeedFoodWarning) {
      this.drawFoodWarningSign(ctx);
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D, camX: number, _camY: number) {
    const theme = this.currentLevel.theme;

    if (theme === 'plains') {
      // 1991 MS-DOS Prehistorik Cyan Sky & Mountain backdrop
      ctx.fillStyle = '#4cc9f0';
      ctx.fillRect(0, 0, this.internalWidth, this.internalHeight);

      // Distant rolling prehistoric mountains with parallax
      ctx.fillStyle = '#2a9d8f';
      for (let i = -100; i < this.currentLevel.width * 16; i += 70) {
        const mx = i - camX * 0.25;
        ctx.beginPath();
        ctx.moveTo(mx, 140);
        ctx.lineTo(mx + 35, 75);
        ctx.lineTo(mx + 70, 140);
        ctx.fill();
      }

      // Prehistoric sun
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(280 - camX * 0.05, 35, 18, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'cave') {
      // Dark cave with rocky stalactites
      ctx.fillStyle = '#1b1b22';
      ctx.fillRect(0, 0, this.internalWidth, this.internalHeight);

      ctx.fillStyle = '#2b2b36';
      for (let i = 0; i < this.internalWidth; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 12, 28);
        ctx.lineTo(i + 24, 0);
        ctx.fill();
      }
    } else if (theme === 'ice') {
      // Cold icy blue cavern
      ctx.fillStyle = '#caf0f8';
      ctx.fillRect(0, 0, this.internalWidth, this.internalHeight);

      ctx.fillStyle = '#90e0ef';
      for (let i = -80; i < this.currentLevel.width * 16; i += 60) {
        const mx = i - camX * 0.25;
        ctx.beginPath();
        ctx.moveTo(mx, 150);
        ctx.lineTo(mx + 30, 80);
        ctx.lineTo(mx + 60, 150);
        ctx.fill();
      }
    } else if (theme === 'volcano') {
      // Smoky red volcanic sky
      ctx.fillStyle = '#540b0e';
      ctx.fillRect(0, 0, this.internalWidth, this.internalHeight);

      ctx.fillStyle = '#9e2a2b';
      for (let i = -80; i < this.currentLevel.width * 16; i += 80) {
        const mx = i - camX * 0.25;
        ctx.beginPath();
        ctx.moveTo(mx, 140);
        ctx.lineTo(mx + 40, 60);
        ctx.lineTo(mx + 80, 140);
        ctx.fill();
      }
    } else {
      // Fortress
      ctx.fillStyle = '#212529';
      ctx.fillRect(0, 0, this.internalWidth, this.internalHeight);
    }
  }

  private drawTilemap(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const grid = this.currentLevel.mapGrid;
    const tileSize = 16;
    const theme = this.currentLevel.theme || 'plains';

    const startX = Math.max(0, Math.floor(camX / tileSize));
    const endX = Math.min(this.currentLevel.width - 1, Math.floor((camX + this.internalWidth) / tileSize) + 1);
    const startY = Math.max(0, Math.floor(camY / tileSize));
    const endY = Math.min(this.currentLevel.height - 1, Math.floor((camY + this.internalHeight) / tileSize) + 1);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = grid[ty] ? grid[ty][tx] : 0;
        if (tile === 0) continue;

        const screenX = tx * tileSize - camX;
        const screenY = ty * tileSize - camY;

        let primaryName = 'tile_ground_top';
        let themedName = `tile_ground_top_${theme}`;

        switch (tile) {
          case 1: {
            const isTop = (ty === 0 || (grid[ty - 1] && grid[ty - 1][tx] === 0));
            primaryName = isTop ? 'tile_ground_top' : 'tile_ground_fill';
            themedName = isTop ? `tile_ground_top_${theme}` : `tile_ground_fill_${theme}`;
            break;
          }
          case 2:
            primaryName = 'tile_platform';
            themedName = `tile_platform_${theme}`;
            break;
          case 3:
            primaryName = 'tile_bridge';
            themedName = 'tile_bridge';
            break;
          case 4:
            // Spikes
            ctx.fillStyle = theme === 'volcano' ? '#f97316' : '#e63946';
            for (let sp = 0; sp < 16; sp += 4) {
              ctx.beginPath();
              ctx.moveTo(screenX + sp, screenY + 16);
              ctx.lineTo(screenX + sp + 2, screenY + 7);
              ctx.lineTo(screenX + sp + 4, screenY + 16);
              ctx.fill();
            }
            continue;
          case 5:
            primaryName = 'tile_secret_wall';
            themedName = `tile_secret_wall_${theme}`;
            break;
        }

        const sprite = SpriteEngine.get(themedName) || SpriteEngine.get(primaryName);
        if (sprite) {
          ctx.drawImage(sprite, screenX, screenY);
        } else {
          // Guaranteed visible fallback so no ground or platform can ever be invisible
          this.drawFallbackTile(ctx, tile, screenX, screenY, theme);
        }
      }
    }
  }

  private drawFallbackTile(
    ctx: CanvasRenderingContext2D,
    tile: number,
    x: number,
    y: number,
    theme: string
  ) {
    if (tile === 1) {
      // Solid Ground Fallback
      if (theme === 'ice') {
        ctx.fillStyle = '#0077b6';
        ctx.fillRect(x, y, 16, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, 16, 3);
      } else if (theme === 'cave') {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x, y, 16, 16);
        ctx.fillStyle = '#44403c';
        ctx.fillRect(x, y, 16, 3);
      } else if (theme === 'volcano') {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x, y, 16, 16);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x, y, 16, 2);
      } else {
        ctx.fillStyle = '#582f0e';
        ctx.fillRect(x, y, 16, 16);
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(x, y, 16, 4);
      }
    } else if (tile === 2) {
      // Platform Fallback
      if (theme === 'ice') {
        ctx.fillStyle = '#90e0ef';
        ctx.fillRect(x, y + 2, 16, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y + 2, 16, 2);
      } else if (theme === 'cave') {
        ctx.fillStyle = '#44403c';
        ctx.fillRect(x, y + 2, 16, 8);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(x, y + 2, 16, 2);
      } else if (theme === 'volcano') {
        ctx.fillStyle = '#292524';
        ctx.fillRect(x, y + 2, 16, 8);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x, y + 8, 16, 2);
      } else {
        ctx.fillStyle = '#895737';
        ctx.fillRect(x, y + 2, 16, 8);
        ctx.fillStyle = '#52b788';
        ctx.fillRect(x, y + 2, 16, 2);
      }
    } else if (tile === 5) {
      ctx.fillStyle = '#495057';
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(x + 4, y + 4, 8, 2);
    }
  }

  private drawExitTotem(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const sprite = SpriteEngine.get('tile_exit_totem');
    if (sprite) {
      ctx.drawImage(sprite, Math.round(this.currentLevel.exitX - camX), Math.round(this.currentLevel.exitY - camY));
    }
  }

  private drawFoodWarningSign(ctx: CanvasRenderingContext2D) {
    const boxW = 220;
    const boxH = 46;
    const bx = (this.internalWidth - boxW) / 2;
    const by = 40;

    // Classic MS-DOS retro dialogue card
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(bx - 2, by - 2, boxW + 4, boxH + 4);
    ctx.fillStyle = '#f1faee';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#d90429';
    ctx.font = '8px monospace';
    ctx.fillText('¡SAM TIENE HAMBRE! NO PUEDES SALIR', bx + 10, by + 16);

    const foodPercent = Math.min(100, Math.round((this.foodCollected / this.currentLevel.targetFood) * 100));
    ctx.fillStyle = '#1d3557';
    ctx.font = '7px monospace';
    ctx.fillText(`COMIDA ACTUAL: ${foodPercent}% / 100% EXIGIDO`, bx + 14, by + 28);
    ctx.fillStyle = '#e63946';
    ctx.fillText('¡VUELVE A CAZAR ANTES DE ESCAPAR!', bx + 14, by + 39);
  }
}
