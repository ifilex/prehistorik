/**
 * Sam the Caveman - Player Character
 * Faithfully implements the 1991 MS-DOS Prehistorik physics, animations, club attack, and dizzy mechanics.
 */

import { PlayerActionState, Direction, Rect } from '../types.ts';
import { soundSystem } from '../engine/SoundSystem.ts';
import { SpriteEngine } from '../engine/Sprites.ts';

export class Player {
  // Position & Dimensions
  public x: number = 32;
  public y: number = 100;
  public width: number = 20;
  public height: number = 26;

  // Velocities & Physics constants
  public vx: number = 0;
  public vy: number = 0;
  private readonly maxSpeed: number = 1.9;
  private readonly accel: number = 0.28;
  private readonly friction: number = 0.82;
  private readonly gravity: number = 0.38;
  private readonly jumpImpulse: number = -6.4;
  private readonly maxFallSpeed: number = 5.2;

  // Trajectory commitment (cannot radically switch direction mid-air)
  private airMomentumDirection: Direction = Direction.RIGHT;

  // Jump responsiveness helpers (coyote time & jump buffering)
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;

  // States
  public state: PlayerActionState = PlayerActionState.IDLE;
  public direction: Direction = Direction.RIGHT;
  public isGrounded: boolean = false;
  public lives: number = 3;
  public isInvulnerable: boolean = false;
  private invulnerableTimer: number = 0;

  // High Fall & Dizzy System (crucial 1991 Prehistorik mechanic!)
  private fallStartY: number = 0;
  private isTrackingFall: boolean = false;
  public dizzyTimer: number = 0;
  private readonly dizzyDurationFrames: number = 90; // ~1.5 seconds at 60 FPS
  private readonly fallDizzyThreshold: number = 140; // Fall distance to trigger dizzy

  // Attack / Club Smash System
  public attackTimer: number = 0;
  private readonly attackDuration: number = 18; // frames total
  private attackHitboxActive: boolean = false;

  // Animation system
  private animFrame: number = 0;
  private animTimer: number = 0;

  // Death physics
  public deathVy: number = -7;
  public isDeadFinished: boolean = false;

  constructor(startX: number = 32, startY: number = 100) {
    this.reset(startX, startY);
  }

  public reset(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.state = PlayerActionState.IDLE;
    this.direction = Direction.RIGHT;
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.dizzyTimer = 0;
    this.attackTimer = 0;
    this.attackHitboxActive = false;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.isDeadFinished = false;
    this.isTrackingFall = false;
    this.fallStartY = startY;
  }

  public update(
    inputLeft: boolean,
    inputRight: boolean,
    inputJump: boolean,
    inputAttack: boolean
  ) {
    // 1. If Dead, tumble off screen
    if (this.state === PlayerActionState.DEAD) {
      this.y += this.deathVy;
      this.deathVy += 0.35; // gravity
      if (this.deathVy > 8 && this.y > 280) {
        this.isDeadFinished = true;
      }
      return;
    }

    // 2. If Dizzy / Stunned (Sam fell from too high!)
    if (this.state === PlayerActionState.DIZZY) {
      this.vx = 0;
      this.dizzyTimer--;
      if (this.dizzyTimer % 24 === 0) {
        soundSystem.playDizzyTweet();
      }
      if (this.dizzyTimer <= 0) {
        this.state = PlayerActionState.IDLE;
      }
      return;
    }

    // 3. Invulnerability timer
    if (this.isInvulnerable) {
      this.invulnerableTimer--;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // 4. Attack Club Handling
    if (this.state === PlayerActionState.ATTACKING) {
      this.attackTimer++;
      this.vx *= 0.85;

      // Active hitbox window: frames 5 to 13
      this.attackHitboxActive = (this.attackTimer >= 5 && this.attackTimer <= 13);

      if (this.attackTimer >= this.attackDuration) {
        this.state = this.isGrounded ? PlayerActionState.IDLE : PlayerActionState.FALLING;
        this.attackHitboxActive = false;
        this.attackTimer = 0;
      }
    } else {
      this.attackHitboxActive = false;

      // Trigger Attack
      if (inputAttack) {
        this.state = PlayerActionState.ATTACKING;
        this.attackTimer = 0;
        soundSystem.playSwing();
      }
    }

    // 5. Coyote Time & Jump Buffering
    if (this.isGrounded) {
      this.coyoteTimer = 6;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer--;
    }

    if (inputJump) {
      this.jumpBufferTimer = 6;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer--;
    }

    // 6. Horizontal Movement (Smooth grounded running & responsive air control)
    if (this.state !== PlayerActionState.ATTACKING) {
      if (this.isGrounded) {
        if (inputLeft) {
          this.vx = Math.max(this.vx - this.accel, -this.maxSpeed);
          this.direction = Direction.LEFT;
        } else if (inputRight) {
          this.vx = Math.min(this.vx + this.accel, this.maxSpeed);
          this.direction = Direction.RIGHT;
        } else {
          this.vx *= this.friction;
          if (Math.abs(this.vx) < 0.08) this.vx = 0;
        }
      } else {
        // Air steering
        if (inputLeft) {
          this.vx = Math.max(this.vx - this.accel * 0.75, -this.maxSpeed);
          this.direction = Direction.LEFT;
        } else if (inputRight) {
          this.vx = Math.min(this.vx + this.accel * 0.75, this.maxSpeed);
          this.direction = Direction.RIGHT;
        } else {
          this.vx *= 0.96;
        }
      }

      // Jump execution
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        this.vy = this.jumpImpulse;
        this.isGrounded = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.state = PlayerActionState.JUMPING;
        this.fallStartY = this.y;
        this.isTrackingFall = true;
        soundSystem.playJump();
      }
    }

    // 7. Gravity & Vertical State
    if (!this.isGrounded) {
      this.vy = Math.min(this.vy + this.gravity, this.maxFallSpeed);

      // Track highest point of trajectory for fall distance calculation
      if (this.y < this.fallStartY) {
        this.fallStartY = this.y;
      }

      if (this.state !== PlayerActionState.ATTACKING) {
        if (this.vy < 0) {
          this.state = PlayerActionState.JUMPING;
        } else {
          this.state = PlayerActionState.FALLING;
        }
      }
    } else {
      if (this.state !== PlayerActionState.ATTACKING) {
        if (Math.abs(this.vx) > 0.2) {
          this.state = PlayerActionState.WALKING;
        } else {
          this.state = PlayerActionState.IDLE;
        }
      }
    }

    // 8. Update Animation Frame Counter
    this.animTimer++;
    if (this.animTimer > 5) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  /**
   * Separated Horizontal and Vertical Collision Solver:
   * Completely eliminates "invisible walls" on flat ground and "mid-air floating/suspension".
   */
  public moveAndCollide(
    grid: number[][],
    mapWidth: number,
    mapHeight: number,
    onHazardDamage: () => void
  ) {
    if (this.state === PlayerActionState.DEAD) {
      return;
    }

    const tileSize = 16;
    const boundsOffsetX = 3;
    const boundsWidth = this.width - 6; // 14px wide
    const boundsHeight = this.height;   // 26px tall

    // -----------------------------------------------------------------
    // 1. HORIZONTAL MOVEMENT & WALL COLLISION
    // -----------------------------------------------------------------
    this.x += this.vx;

    // Constrain to left / right boundaries
    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }
    const maxMapX = mapWidth * tileSize - this.width;
    if (this.x > maxMapX) {
      this.x = maxMapX;
      this.vx = 0;
    }

    const currentBoundsLeft = this.x + boundsOffsetX;
    const currentBoundsRight = currentBoundsLeft + boundsWidth;
    const currentBoundsTop = this.y;
    // Crucial: check up to 3 pixels ABOVE feet so the floor underneath is NEVER treated as a wall!
    const wallCheckBottom = this.y + boundsHeight - 3;

    const startTyWall = Math.max(0, Math.floor(currentBoundsTop / tileSize));
    const endTyWall = Math.max(0, Math.floor(wallCheckBottom / tileSize));

    if (this.vx > 0) {
      // Moving right -> check tile column where right bounds edge lands
      const rightCol = Math.floor((currentBoundsRight - 0.05) / tileSize);
      if (rightCol >= 0 && rightCol < mapWidth) {
        for (let ty = startTyWall; ty <= endTyWall; ty++) {
          const tile = grid[ty] ? grid[ty][rightCol] : 0;
          if (tile === 1 || tile === 5) {
            // Hit wall or secret wall to the right
            this.x = rightCol * tileSize - (boundsOffsetX + boundsWidth);
            this.vx = 0;
            break;
          }
        }
      }
    } else if (this.vx < 0) {
      // Moving left -> check tile column where left bounds edge lands
      const leftCol = Math.floor(currentBoundsLeft / tileSize);
      if (leftCol >= 0 && leftCol < mapWidth) {
        for (let ty = startTyWall; ty <= endTyWall; ty++) {
          const tile = grid[ty] ? grid[ty][leftCol] : 0;
          if (tile === 1 || tile === 5) {
            // Hit wall or secret wall to the left
            this.x = (leftCol + 1) * tileSize - boundsOffsetX;
            this.vx = 0;
            break;
          }
        }
      }
    }

    // -----------------------------------------------------------------
    // 2. VERTICAL MOVEMENT & CEILING / FLOOR COLLISION
    // -----------------------------------------------------------------
    const prevBottom = this.y + boundsHeight;
    this.y += this.vy;
    const newBottom = this.y + boundsHeight;

    // Horizontal foot span for landing checks
    const footLeft = this.x + boundsOffsetX + 1;
    const footRight = this.x + boundsOffsetX + boundsWidth - 1;
    const startTxFoot = Math.max(0, Math.floor(footLeft / tileSize));
    const endTxFoot = Math.min(mapWidth - 1, Math.floor(footRight / tileSize));

    let landed = false;

    if (this.vy >= 0) {
      // Moving Downwards or stationary -> test for landing on solid ground (1, 5) or platforms (2, 3)
      const startTy = Math.max(0, Math.floor((prevBottom - 1) / tileSize));
      const endTy = Math.min(mapHeight - 1, Math.floor(newBottom / tileSize));

      for (let ty = startTy; ty <= endTy; ty++) {
        const tileTopY = ty * tileSize;

        for (let tx = startTxFoot; tx <= endTxFoot; tx++) {
          const tile = grid[ty] ? grid[ty][tx] : 0;

          // Solid ground (1) or secret wall (5)
          if (tile === 1 || tile === 5) {
            if (prevBottom <= tileTopY + 1.5 && newBottom >= tileTopY) {
              this.landOnGround(tileTopY);
              landed = true;
              break;
            }
          }
          // One-way platforms (2) or bridges (3)
          else if (tile === 2 || tile === 3) {
            // Must have been at or above platform top previously, and now crossing downward onto it
            if (prevBottom <= tileTopY + 1.5 && newBottom >= tileTopY) {
              this.landOnGround(tileTopY);
              landed = true;
              break;
            }
          }
        }
        if (landed) break;
      }
    } else {
      // Moving Upwards -> test for ceiling bonk against solid tiles (1, 5) only
      // Platforms (2, 3) are completely ignored so Sam jumps smoothly through them!
      const headY = this.y;
      const headTy = Math.floor(headY / tileSize);

      if (headTy >= 0 && headTy < mapHeight) {
        for (let tx = startTxFoot; tx <= endTxFoot; tx++) {
          const tile = grid[headTy] ? grid[headTy][tx] : 0;
          if (tile === 1 || tile === 5) {
            const tileBottomY = (headTy + 1) * tileSize;
            this.y = tileBottomY;
            this.vy = 0;
            break;
          }
        }
      }
    }

    // -----------------------------------------------------------------
    // 3. GROUND CONTINUITY CHECK
    // -----------------------------------------------------------------
    // If player was grounded and did not land this frame, verify floor still exists 1px below feet
    if (this.isGrounded && !landed) {
      const checkGroundY = this.y + boundsHeight + 1;
      const checkTy = Math.floor(checkGroundY / tileSize);

      let solidBelow = false;
      if (checkTy >= 0 && checkTy < mapHeight) {
        for (let tx = startTxFoot; tx <= endTxFoot; tx++) {
          const tile = grid[checkTy] ? grid[checkTy][tx] : 0;
          if (tile === 1 || tile === 2 || tile === 3 || tile === 5) {
            solidBelow = true;
            break;
          }
        }
      }

      if (!solidBelow) {
        // Walked off a ledge into air!
        this.isGrounded = false;
        if (this.state !== PlayerActionState.ATTACKING) {
          this.state = PlayerActionState.FALLING;
        }
        this.fallStartY = this.y;
        this.isTrackingFall = true;
      }
    }

    // -----------------------------------------------------------------
    // 4. HAZARDS COLLISION (Spikes = 4)
    // -----------------------------------------------------------------
    const bounds = this.getBounds();
    const hazardStartTx = Math.max(0, Math.floor(bounds.x / tileSize));
    const hazardEndTx = Math.min(mapWidth - 1, Math.floor((bounds.x + bounds.width) / tileSize));
    const hazardStartTy = Math.max(0, Math.floor(bounds.y / tileSize));
    const hazardEndTy = Math.min(mapHeight - 1, Math.floor((bounds.y + bounds.height) / tileSize));

    for (let ty = hazardStartTy; ty <= hazardEndTy; ty++) {
      for (let tx = hazardStartTx; tx <= hazardEndTx; tx++) {
        if (grid[ty] && grid[ty][tx] === 4) {
          if (this.takeDamage()) {
            onHazardDamage();
          }
          return;
        }
      }
    }
  }

  // Called when player lands on solid ground
  public landOnGround(groundY: number) {
    this.y = groundY - this.height;
    this.vy = 0;
    this.isGrounded = true;
    this.coyoteTimer = 6;

    // Check Fall Stun: If Sam fell from a massive ledge, he gets dizzy for 1.5 seconds!
    if (this.isTrackingFall) {
      const fallDistance = this.y - this.fallStartY;
      if (fallDistance > this.fallDizzyThreshold) {
        this.triggerDizzy();
      }
    }

    this.isTrackingFall = false;

    if (this.state !== PlayerActionState.DIZZY && this.state !== PlayerActionState.ATTACKING) {
      this.state = Math.abs(this.vx) > 0.2 ? PlayerActionState.WALKING : PlayerActionState.IDLE;
    }
  }

  public triggerDizzy() {
    this.state = PlayerActionState.DIZZY;
    this.dizzyTimer = this.dizzyDurationFrames;
    this.vx = 0;
    this.vy = 0;
    soundSystem.playDizzyTweet();
  }

  public takeDamage(): boolean {
    if (this.isInvulnerable || this.state === PlayerActionState.DEAD) {
      return false;
    }

    this.lives--;
    soundSystem.playHurt();

    if (this.lives <= 0) {
      this.triggerDeath();
      return true;
    }

    // Knockback and temporary invulnerability
    this.isInvulnerable = true;
    this.invulnerableTimer = 75; // 1.25 seconds
    this.vy = -3.2;
    this.vx = this.direction === Direction.RIGHT ? -1.8 : 1.8;
    this.isGrounded = false;
    return true;
  }

  public triggerDeath() {
    this.state = PlayerActionState.DEAD;
    this.deathVy = -6.5;
    soundSystem.playHurt();
  }

  // Bounding box for player body
  public getBounds(): Rect {
    return {
      x: this.x + 2,
      y: this.y,
      width: this.width - 4,
      height: this.height
    };
  }

  // Hitbox for the Wooden Club when actively swinging
  public getClubHitbox(): Rect | null {
    if (this.state !== PlayerActionState.ATTACKING || !this.attackHitboxActive) {
      return null;
    }

    const clubReach = 18;
    const clubHeight = 16;
    const clubY = this.y + 4;

    if (this.direction === Direction.RIGHT) {
      return {
        x: this.x + this.width - 2,
        y: clubY,
        width: clubReach,
        height: clubHeight
      };
    } else {
      return {
        x: this.x - clubReach + 2,
        y: clubY,
        width: clubReach,
        height: clubHeight
      };
    }
  }

  // Render Sam the Caveman onto 320x200 canvas
  public draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    // Flickering during invulnerability
    if (this.isInvulnerable && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
      return;
    }

    const screenX = Math.round(this.x - cameraX);
    const screenY = Math.round(this.y - cameraY);

    let spriteName = 'sam_idle';

    switch (this.state) {
      case PlayerActionState.IDLE:
        spriteName = 'sam_idle';
        break;
      case PlayerActionState.WALKING:
        spriteName = (this.animFrame % 2 === 0) ? 'sam_walk_1' : 'sam_walk_2';
        break;
      case PlayerActionState.JUMPING:
        spriteName = 'sam_jump';
        break;
      case PlayerActionState.FALLING:
        spriteName = 'sam_fall';
        break;
      case PlayerActionState.ATTACKING:
        if (this.attackTimer < 5) {
          spriteName = 'sam_attack_1';
        } else {
          spriteName = 'sam_attack_2';
        }
        break;
      case PlayerActionState.DIZZY:
        spriteName = 'sam_dizzy';
        break;
      case PlayerActionState.DEAD:
        spriteName = 'sam_dead';
        break;
      default:
        spriteName = 'sam_idle';
    }

    const sprite = SpriteEngine.get(spriteName);
    if (!sprite) return;

    ctx.save();
    if (this.direction === Direction.LEFT) {
      // Flip horizontally for facing left
      ctx.translate(screenX + this.width, screenY);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, 0);
    } else {
      ctx.drawImage(sprite, screenX, screenY);
    }

    // Additional visual indicator for dizzy stars orbiting Sam's head
    if (this.state === PlayerActionState.DIZZY) {
      const angle = (this.dizzyTimer * 0.15);
      const starX = screenX + this.width / 2 + Math.cos(angle) * 12;
      const starY = screenY - 6 + Math.sin(angle) * 4;
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(starX, starY, 3, 3);

      const starX2 = screenX + this.width / 2 + Math.cos(angle + Math.PI) * 12;
      const starY2 = screenY - 6 + Math.sin(angle + Math.PI) * 4;
      ctx.fillStyle = '#00f5d4';
      ctx.fillRect(starX2, starY2, 3, 3);
    }

    ctx.restore();
  }
}
