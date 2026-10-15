/**
 * High-Fidelity Procedural Pixel-Art Sprite Engine for Prehistorik 1991 MS-DOS.
 * Renders rich 1991 VGA 256-color palette retro sprites with authentic shading,
 * expressive animations, and detailed prehistoric character designs.
 */

export class SpriteEngine {
  private static spriteCache: Map<string, HTMLCanvasElement> = new Map();
  private static initialized: boolean = false;

  public static init() {
    if (this.initialized) return;

    this.createSamSprites();
    this.createEnemySprites();
    this.createBossSprites();
    this.createFoodSprites();
    this.createTileSprites();
    this.createEffectSprites();

    this.initialized = true;
  }

  public static get(name: string): HTMLCanvasElement | null {
    if (!this.initialized) this.init();
    return this.spriteCache.get(name) || null;
  }

  private static makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // --- 1. SAM THE CAVEMAN SPRITES (High Detail 28x30 pixel art) ---
  private static createSamSprites() {
    // Helper to draw Sam's face, hair, and torso with high fidelity
    const drawCavemanBase = (
      ctx: CanvasRenderingContext2D,
      headX: number,
      headY: number,
      eyeState: 'normal' | 'blink' | 'angry' | 'dizzy' | 'wide',
      mouthState: 'smile' | 'open' | 'grimace' | 'dizzy'
    ) => {
      // 1. Shaggy Wild Neanderthal Hair (Multi-tone dark brown & black)
      ctx.fillStyle = '#100b08'; // Deep shadow
      ctx.fillRect(headX - 3, headY - 1, 16, 12);
      ctx.fillRect(headX - 5, headY + 3, 5, 8); // Back mullet hair

      ctx.fillStyle = '#2b1b10'; // Midtone hair
      ctx.fillRect(headX - 2, headY, 14, 10);
      ctx.fillRect(headX, headY - 3, 4, 3); // Spiky wild tuft 1
      ctx.fillRect(headX + 5, headY - 4, 4, 4); // Spiky wild tuft 2
      ctx.fillRect(headX + 9, headY - 2, 3, 3); // Spiky tuft 3

      ctx.fillStyle = '#482d1c'; // Hair highlights
      ctx.fillRect(headX + 1, headY - 2, 2, 2);
      ctx.fillRect(headX + 6, headY - 3, 2, 2);

      // 2. Head & Skin (3-tone tanned caveman skin)
      ctx.fillStyle = '#b5673d'; // Shadow skin
      ctx.fillRect(headX + 1, headY + 5, 12, 11);

      ctx.fillStyle = '#e59363'; // Midtone skin
      ctx.fillRect(headX + 3, headY + 5, 10, 10);
      ctx.fillRect(headX + 7, headY + 8, 5, 4); // Bulbous caveman nose

      ctx.fillStyle = '#f8b488'; // Skin highlight
      ctx.fillRect(headX + 4, headY + 6, 4, 3);
      ctx.fillRect(headX + 9, headY + 9, 2, 2); // Nose highlight

      // Heavy Brow Ridge
      ctx.fillStyle = '#8f4625';
      ctx.fillRect(headX + 4, headY + 5, 8, 2);

      // Eyes
      if (eyeState === 'normal') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX + 5, headY + 7, 4, 3);
        ctx.fillStyle = '#111111';
        ctx.fillRect(headX + 7, headY + 8, 2, 2); // Iris looking forward
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX + 7, headY + 8, 1, 1); // Eye twinkle
      } else if (eyeState === 'angry') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX + 5, headY + 7, 4, 2);
        ctx.fillStyle = '#800000';
        ctx.fillRect(headX + 7, headY + 7, 2, 2);
      } else if (eyeState === 'wide') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX + 4, headY + 6, 6, 5);
        ctx.fillStyle = '#000000';
        ctx.fillRect(headX + 7, headY + 8, 2, 2);
      } else if (eyeState === 'dizzy') {
        // Swirly spiral eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX + 4, headY + 6, 5, 5);
        ctx.fillStyle = '#000000';
        ctx.fillRect(headX + 5, headY + 7, 3, 1);
        ctx.fillRect(headX + 7, headY + 8, 1, 2);
        ctx.fillRect(headX + 5, headY + 9, 2, 1);
      } else {
        // Blink line
        ctx.fillStyle = '#3a1a0c';
        ctx.fillRect(headX + 5, headY + 8, 4, 1);
      }

      // Mouth & Neanderthal Teeth
      if (mouthState === 'smile') {
        ctx.fillStyle = '#4a0c0c';
        ctx.fillRect(headX + 5, headY + 12, 6, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX + 6, headY + 12, 2, 2); // Underbite white tooth
        ctx.fillRect(headX + 9, headY + 13, 1, 1);
      } else if (mouthState === 'grimace') {
        ctx.fillStyle = '#300808';
        ctx.fillRect(headX + 5, headY + 13, 7, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(headX + 6, headY + 13, 5, 1); // Gritted teeth
      } else if (mouthState === 'open') {
        ctx.fillStyle = '#300505';
        ctx.fillRect(headX + 5, headY + 12, 6, 4);
        ctx.fillStyle = '#e63946';
        ctx.fillRect(headX + 6, headY + 14, 3, 2); // Red tongue
      } else {
        // Dizzy wavy mouth
        ctx.fillStyle = '#400808';
        ctx.fillRect(headX + 4, headY + 13, 2, 2);
        ctx.fillRect(headX + 6, headY + 14, 3, 1);
        ctx.fillRect(headX + 9, headY + 13, 2, 2);
      }

      // 3. Animal Fur Tunic (Leopard/Tiger pelt)
      ctx.fillStyle = '#b84a0c'; // Fur shadow
      ctx.fillRect(headX - 1, headY + 15, 13, 9);

      ctx.fillStyle = '#ea6a1b'; // Golden orange fur
      ctx.fillRect(headX, headY + 15, 11, 8);

      ctx.fillStyle = '#ffd166'; // Fur highlight
      ctx.fillRect(headX + 2, headY + 16, 7, 2);

      // Leopard Spots
      ctx.fillStyle = '#222222';
      ctx.fillRect(headX + 1, headY + 17, 2, 2);
      ctx.fillRect(headX + 6, headY + 18, 2, 2);
      ctx.fillRect(headX + 3, headY + 21, 2, 2);
      ctx.fillRect(headX + 8, headY + 20, 2, 2);

      // Jagged ripped fur hem
      ctx.clearRect(headX, headY + 23, 2, 1);
      ctx.clearRect(headX + 4, headY + 23, 2, 1);
      ctx.clearRect(headX + 8, headY + 23, 2, 1);
    };

    // Helper to draw big gnarled wooden club
    const drawClub = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: 'up' | 'forward' | 'smash' | 'back') => {
      if (angle === 'up') {
        // Club resting upright
        ctx.fillStyle = '#42240c'; // Club dark wood
        ctx.fillRect(x + 1, y, 7, 14);
        ctx.fillRect(x, y - 2, 9, 6); // Big heavy club head

        ctx.fillStyle = '#7a4419'; // Midtone wood
        ctx.fillRect(x + 2, y - 1, 6, 13);
        ctx.fillStyle = '#a6622d'; // Wood highlight
        ctx.fillRect(x + 3, y - 1, 3, 10);

        // Rope binding
        ctx.fillStyle = '#e9c46a';
        ctx.fillRect(x + 2, y + 5, 5, 2);
      } else if (angle === 'back') {
        // Pulled back ready to swing
        ctx.fillStyle = '#42240c';
        ctx.fillRect(x, y, 10, 8);
        ctx.fillRect(x - 4, y - 2, 9, 8);

        ctx.fillStyle = '#7a4419';
        ctx.fillRect(x - 3, y - 1, 7, 6);
        ctx.fillStyle = '#e9c46a';
        ctx.fillRect(x + 3, y + 2, 2, 4);
      } else if (angle === 'forward') {
        // Mid-swing horizontal
        ctx.fillStyle = '#42240c';
        ctx.fillRect(x, y, 14, 7);
        ctx.fillRect(x + 8, y - 2, 9, 10); // Heavy knob end

        ctx.fillStyle = '#7a4419';
        ctx.fillRect(x + 1, y + 1, 13, 5);
        ctx.fillRect(x + 9, y - 1, 7, 8);

        ctx.fillStyle = '#a6622d';
        ctx.fillRect(x + 10, y, 4, 5);

        // Rope tie
        ctx.fillStyle = '#e9c46a';
        ctx.fillRect(x + 4, y + 1, 2, 5);
      } else if (angle === 'smash') {
        // Smashed down to ground
        ctx.fillStyle = '#42240c';
        ctx.fillRect(x, y + 4, 15, 8);
        ctx.fillRect(x + 10, y + 2, 10, 11);

        ctx.fillStyle = '#7a4419';
        ctx.fillRect(x + 1, y + 5, 14, 6);
        ctx.fillRect(x + 11, y + 3, 8, 9);

        ctx.fillStyle = '#a6622d';
        ctx.fillRect(x + 12, y + 4, 5, 6);
      }
    };

    // 1. Sam Idle (28x30)
    {
      const { canvas, ctx } = this.makeCanvas(28, 30);
      drawClub(ctx, 4, 4, 'up');
      drawCavemanBase(ctx, 8, 3, 'normal', 'smile');

      // Muscular legs & feet
      ctx.fillStyle = '#e59363';
      ctx.fillRect(9, 23, 4, 6); // Left leg
      ctx.fillRect(15, 23, 4, 6); // Right leg
      // Feet & toes
      ctx.fillStyle = '#b5673d';
      ctx.fillRect(9, 28, 6, 2);
      ctx.fillRect(15, 28, 6, 2);
      this.spriteCache.set('sam_idle', canvas);
    }

    // 2. Sam Walk 0 (Contact frame)
    {
      const { canvas, ctx } = this.makeCanvas(28, 30);
      drawClub(ctx, 3, 5, 'up');
      drawCavemanBase(ctx, 8, 3, 'normal', 'smile');

      // Stride legs
      ctx.fillStyle = '#b5673d';
      ctx.fillRect(5, 23, 5, 6); // Back leg
      ctx.fillStyle = '#e59363';
      ctx.fillRect(16, 22, 5, 6); // Forward leg
      ctx.fillRect(17, 27, 6, 2); // Forward foot
      this.spriteCache.set('sam_walk_0', canvas);
    }

    // 3. Sam Walk 1 (Passing frame)
    {
      const { canvas, ctx } = this.makeCanvas(28, 30);
      drawClub(ctx, 4, 3, 'up');
      drawCavemanBase(ctx, 8, 2, 'normal', 'smile');

      ctx.fillStyle = '#e59363';
      ctx.fillRect(10, 23, 4, 6);
      ctx.fillRect(14, 21, 5, 5); // Tucked leg
      this.spriteCache.set('sam_walk_1', canvas);
    }

    // 4. Sam Walk 2 (Opposite contact)
    {
      const { canvas, ctx } = this.makeCanvas(28, 30);
      drawClub(ctx, 3, 5, 'up');
      drawCavemanBase(ctx, 8, 3, 'normal', 'smile');

      ctx.fillStyle = '#b5673d';
      ctx.fillRect(17, 23, 5, 6);
      ctx.fillStyle = '#e59363';
      ctx.fillRect(6, 22, 5, 6);
      ctx.fillRect(5, 27, 6, 2);
      this.spriteCache.set('sam_walk_2', canvas);
    }

    // 5. Sam Walk 3 (Opposite passing)
    {
      const { canvas, ctx } = this.makeCanvas(28, 30);
      drawClub(ctx, 4, 3, 'up');
      drawCavemanBase(ctx, 8, 2, 'normal', 'smile');

      ctx.fillStyle = '#e59363';
      ctx.fillRect(13, 23, 4, 6);
      ctx.fillRect(8, 21, 5, 5);
      this.spriteCache.set('sam_walk_3', canvas);
    }

    // 6. Sam Jump
    {
      const { canvas, ctx } = this.makeCanvas(28, 30);
      drawClub(ctx, 2, 1, 'up');
      drawCavemanBase(ctx, 8, 2, 'angry', 'open');

      // Tucked dynamic jumping legs
      ctx.fillStyle = '#e59363';
      ctx.fillRect(7, 21, 6, 5);
      ctx.fillRect(15, 20, 6, 5);
      this.spriteCache.set('sam_jump', canvas);
    }

    // 7. Sam Fall (Arms flailing, hair blowing up)
    {
      const { canvas, ctx } = this.makeCanvas(28, 30);
      drawClub(ctx, 1, 3, 'up');
      drawCavemanBase(ctx, 8, 3, 'wide', 'open');

      // Dangling flailing legs
      ctx.fillStyle = '#e59363';
      ctx.fillRect(6, 23, 4, 6);
      ctx.fillRect(17, 22, 4, 7);
      this.spriteCache.set('sam_fall', canvas);
    }

    // 8. Sam Attack Windup (Club way back over head)
    {
      const { canvas, ctx } = this.makeCanvas(34, 30);
      drawClub(ctx, 1, 2, 'back');
      drawCavemanBase(ctx, 10, 3, 'angry', 'grimace');

      ctx.fillStyle = '#e59363';
      ctx.fillRect(10, 23, 4, 6);
      ctx.fillRect(18, 23, 5, 6);
      this.spriteCache.set('sam_attack_1', canvas);
    }

    // 9. Sam Attack SMASH (Giant forward smash with comic swoosh)
    {
      const { canvas, ctx } = this.makeCanvas(40, 30);
      drawCavemanBase(ctx, 6, 3, 'angry', 'grimace');
      drawClub(ctx, 16, 12, 'forward');

      // Speed lines & impact swoosh
      ctx.fillStyle = 'rgba(255, 234, 0, 0.8)';
      ctx.fillRect(20, 4, 10, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(24, 7, 10, 2);
      ctx.fillRect(28, 10, 6, 2);

      // Braced stance
      ctx.fillStyle = '#e59363';
      ctx.fillRect(4, 23, 5, 6);
      ctx.fillRect(15, 23, 6, 6);
      this.spriteCache.set('sam_attack_2', canvas);
    }

    // 10. Sam Dizzy (Falling stun: stars & tweety birds)
    {
      const { canvas, ctx } = this.makeCanvas(32, 32);
      // Orbiting yellow stars & blue tweety birds
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(6, 1, 4, 4);
      ctx.fillRect(22, 2, 3, 3);
      ctx.fillRect(14, 0, 3, 3);

      // Tweety bird
      ctx.fillStyle = '#48cae4';
      ctx.fillRect(3, 4, 4, 3);
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(1, 5, 2, 2); // beak

      drawCavemanBase(ctx, 9, 6, 'dizzy', 'dizzy');

      // Wobbly bowed knees
      ctx.fillStyle = '#e59363';
      ctx.fillRect(8, 26, 4, 5);
      ctx.fillRect(16, 26, 4, 5);
      this.spriteCache.set('sam_dizzy', canvas);
    }

    // 11. Sam Hurt (Flashing/recoiling)
    {
      const { canvas, ctx } = this.makeCanvas(28, 30);
      drawCavemanBase(ctx, 7, 3, 'wide', 'open');
      drawClub(ctx, 0, 8, 'up');

      ctx.fillStyle = '#e59363';
      ctx.fillRect(7, 23, 4, 6);
      ctx.fillRect(15, 23, 5, 6);
      this.spriteCache.set('sam_hurt', canvas);
    }

    // 12. Sam Dead (Cartoon ragdoll tumbling)
    {
      const { canvas, ctx } = this.makeCanvas(30, 30);
      ctx.save();
      ctx.translate(15, 15);
      ctx.rotate((Math.PI * 3) / 4);
      drawCavemanBase(ctx, -8, -8, 'dizzy', 'open');
      ctx.restore();
      this.spriteCache.set('sam_dead', canvas);
    }
  }

  // --- 2. ENEMY SPRITES (High Detail Raptors, Bears, Spiders, Pterodactyls) ---
  private static createEnemySprites() {
    // 1. Velociraptor (Emerald reptile, serrated jaws, sickle claw)
    {
      const { canvas, ctx } = this.makeCanvas(28, 24);
      // Scaly green head with red crest
      ctx.fillStyle = '#1b4332'; // Shadow scales
      ctx.fillRect(14, 2, 12, 8);
      ctx.fillStyle = '#2d6a4f'; // Midtone scales
      ctx.fillRect(15, 3, 10, 7);

      // Red feather crest
      ctx.fillStyle = '#e63946';
      ctx.fillRect(12, 1, 5, 3);
      ctx.fillRect(14, 0, 3, 2);

      // Fierce yellow eye with slit pupil
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(20, 4, 3, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(21, 4, 1, 3);

      // Open snapping jaw with sharp teeth
      ctx.fillStyle = '#40916c';
      ctx.fillRect(18, 7, 9, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 9, 2, 2); // Fang
      ctx.fillRect(24, 9, 2, 2);
      ctx.fillStyle = '#d90429';
      ctx.fillRect(19, 8, 3, 1); // Tongue

      // Body & Counterbalanced tail
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(7, 9, 13, 8);
      ctx.fillStyle = '#95d5b2'; // Pale underbelly
      ctx.fillRect(9, 13, 9, 4);

      // Curved agile tail
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(1, 8, 7, 4);
      ctx.fillRect(0, 6, 4, 3);

      // Articulated bipedal running legs with sickle claw
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(9, 17, 4, 6);
      ctx.fillRect(16, 17, 4, 6);
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(19, 21, 3, 2); // Sickle claw
      this.spriteCache.set('enemy_raptor_1', canvas);
    }
    {
      // Raptor frame 2 (running stride)
      const { canvas, ctx } = this.makeCanvas(28, 24);
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(14, 3, 12, 8);
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(15, 4, 10, 7);

      ctx.fillStyle = '#e63946';
      ctx.fillRect(12, 2, 5, 3);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(20, 5, 3, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(21, 5, 1, 3);

      ctx.fillStyle = '#40916c';
      ctx.fillRect(18, 8, 9, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(21, 10, 2, 2);

      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(7, 10, 13, 8);
      ctx.fillStyle = '#95d5b2';
      ctx.fillRect(9, 14, 9, 4);

      ctx.fillStyle = '#1b4332';
      ctx.fillRect(1, 10, 7, 4);

      // Running legs split
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(6, 17, 5, 6);
      ctx.fillRect(18, 15, 5, 5);
      this.spriteCache.set('enemy_raptor_2', canvas);
    }

    // 2. Cave Bear (Massive brown grizzly, glowing eyes, fangs)
    {
      const { canvas, ctx } = this.makeCanvas(32, 26);
      // Shaggy fur layers
      ctx.fillStyle = '#3a1f0a';
      ctx.fillRect(16, 3, 12, 11);
      ctx.fillStyle = '#603813';
      ctx.fillRect(17, 4, 10, 9);

      // Snout with bared fangs
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(23, 8, 8, 6);
      ctx.fillStyle = '#1a0d00';
      ctx.fillRect(29, 8, 2, 3); // Black nose
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(25, 12, 2, 3); // Sharp upper canine
      ctx.fillRect(28, 11, 2, 2);

      // Glowing predatory eye
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(21, 6, 3, 2);
      ctx.fillStyle = '#e63946';
      ctx.fillRect(22, 6, 1, 2);

      // Broad muscular back & hump
      ctx.fillStyle = '#3a1f0a';
      ctx.fillRect(5, 7, 18, 12);
      ctx.fillStyle = '#603813';
      ctx.fillRect(7, 8, 14, 10);
      ctx.fillStyle = '#8b5a2b'; // Fur highlights
      ctx.fillRect(9, 8, 8, 3);

      // Heavy clawed paws
      ctx.fillStyle = '#281507';
      ctx.fillRect(7, 19, 5, 6);
      ctx.fillRect(17, 19, 5, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 23, 3, 2); // Claws
      ctx.fillRect(20, 23, 3, 2);
      this.spriteCache.set('enemy_bear_1', canvas);
    }
    {
      // Bear frame 2 (lumbering walk)
      const { canvas, ctx } = this.makeCanvas(32, 26);
      ctx.fillStyle = '#3a1f0a';
      ctx.fillRect(16, 4, 12, 11);
      ctx.fillStyle = '#603813';
      ctx.fillRect(17, 5, 10, 9);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(23, 9, 8, 6);
      ctx.fillStyle = '#1a0d00';
      ctx.fillRect(29, 9, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(25, 13, 2, 3);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(21, 7, 3, 2);

      ctx.fillStyle = '#3a1f0a';
      ctx.fillRect(5, 7, 18, 12);
      ctx.fillStyle = '#603813';
      ctx.fillRect(7, 8, 14, 10);

      // Paws shifted
      ctx.fillStyle = '#281507';
      ctx.fillRect(9, 19, 5, 6);
      ctx.fillRect(15, 18, 5, 6);
      this.spriteCache.set('enemy_bear_2', canvas);
    }

    // 3. Ceiling Spider (Glossy black body, 8 red eyes, hairy legs)
    {
      const { canvas, ctx } = this.makeCanvas(22, 24);
      // Silk dangling thread
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(10, 0, 1, 9);

      // Bulbous spider abdomen
      ctx.fillStyle = '#190a28';
      ctx.fillRect(5, 9, 12, 10);
      ctx.fillStyle = '#3c096c';
      ctx.fillRect(7, 10, 8, 8);

      // Red hourglass / skull emblem on belly
      ctx.fillStyle = '#d90429';
      ctx.fillRect(9, 12, 4, 2);
      ctx.fillRect(10, 14, 2, 2);

      // Glowing red multi-eyes
      ctx.fillStyle = '#ff0054';
      ctx.fillRect(8, 17, 2, 2);
      ctx.fillRect(12, 17, 2, 2);
      ctx.fillRect(6, 18, 1, 1);
      ctx.fillRect(15, 18, 1, 1);

      // Jointed arachnid legs
      ctx.fillStyle = '#10002b';
      // Left legs
      ctx.fillRect(2, 9, 4, 2);
      ctx.fillRect(1, 11, 2, 5);
      ctx.fillRect(0, 15, 3, 2);

      ctx.fillRect(2, 14, 4, 2);
      ctx.fillRect(1, 16, 2, 5);

      // Right legs
      ctx.fillRect(16, 9, 4, 2);
      ctx.fillRect(19, 11, 2, 5);
      ctx.fillRect(19, 15, 3, 2);

      ctx.fillRect(16, 14, 4, 2);
      ctx.fillRect(19, 16, 2, 5);
      this.spriteCache.set('enemy_spider', canvas);
    }

    // 4. Pterodactyl (Flapping leathery wings, sharp beak, dropped rock)
    {
      const { canvas, ctx } = this.makeCanvas(30, 24);
      // Wings high (Frame 1)
      ctx.fillStyle = '#540b0e'; // Leathery wing shadow
      ctx.fillRect(2, 2, 26, 6);
      ctx.fillStyle = '#9e2a2b'; // Wing membrane
      ctx.fillRect(4, 4, 22, 5);

      // Reptile body & head
      ctx.fillStyle = '#6b0505';
      ctx.fillRect(16, 7, 8, 5);
      ctx.fillStyle = '#9e2a2b';
      ctx.fillRect(18, 6, 7, 4);

      // Sharp yellow beak & head crest
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(23, 8, 7, 2);
      ctx.fillStyle = '#e09f3e';
      ctx.fillRect(14, 5, 4, 3); // Head crest

      ctx.fillStyle = '#ffea00';
      ctx.fillRect(20, 7, 2, 2); // Eye

      // Talons
      ctx.fillStyle = '#330000';
      ctx.fillRect(15, 12, 3, 3);
      ctx.fillRect(19, 12, 3, 3);
      this.spriteCache.set('enemy_pterodactyl_1', canvas);
    }
    {
      // Wings down (Frame 2)
      const { canvas, ctx } = this.makeCanvas(30, 24);
      ctx.fillStyle = '#540b0e';
      ctx.fillRect(2, 10, 26, 7);
      ctx.fillStyle = '#9e2a2b';
      ctx.fillRect(4, 11, 22, 6);

      ctx.fillStyle = '#6b0505';
      ctx.fillRect(16, 5, 8, 5);
      ctx.fillStyle = '#9e2a2b';
      ctx.fillRect(18, 4, 7, 4);

      ctx.fillStyle = '#ffb703';
      ctx.fillRect(23, 6, 7, 2);
      ctx.fillStyle = '#e09f3e';
      ctx.fillRect(14, 3, 4, 3);

      ctx.fillStyle = '#ffea00';
      ctx.fillRect(20, 5, 2, 2);

      // Dropped stone boulder
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(17, 16, 5, 5);
      ctx.fillStyle = '#adb5bd';
      ctx.fillRect(18, 17, 2, 2);
      this.spriteCache.set('enemy_pterodactyl_2', canvas);
    }
  }

  // --- 3. GIANT BOSS SPRITES (High-Res 56x52 Pixel Art) ---
  private static createBossSprites() {
    // 1. Giant T-Rex Boss (60x52)
    {
      const { canvas, ctx } = this.makeCanvas(62, 54);
      // Scaly green massive head & jaw
      ctx.fillStyle = '#1b4332'; // Deep scaly shadows
      ctx.fillRect(20, 4, 38, 24);
      ctx.fillRect(18, 2, 28, 8); // Armored brow crest

      ctx.fillStyle = '#2d6a4f'; // Midtone scales
      ctx.fillRect(22, 5, 34, 20);
      ctx.fillStyle = '#52b788'; // Scale highlights
      ctx.fillRect(24, 7, 18, 5);
      ctx.fillRect(36, 12, 12, 3);

      // Terrifying gaping jaw
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(28, 20, 30, 12);
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(30, 22, 28, 9);

      // Rows of sharp white ivory teeth
      ctx.fillStyle = '#ffffff';
      for (let x = 32; x <= 56; x += 4) {
        ctx.fillRect(x, 18, 2, 4); // Upper teeth
        ctx.fillRect(x + 2, 22, 2, 4); // Lower teeth
      }

      // Red cavernous throat & tongue
      ctx.fillStyle = '#9b2226';
      ctx.fillRect(32, 21, 10, 4);

      // Fierce glowing reptilian eye
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(32, 9, 8, 6);
      ctx.fillStyle = '#d00000';
      ctx.fillRect(35, 9, 3, 6); // Slit pupil
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(34, 10, 1, 2); // Highlight

      // Heavy muscular torso & dorsal ridges
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(6, 18, 26, 22);
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(8, 20, 22, 18);

      // Dorsal armor spikes
      ctx.fillStyle = '#081c15';
      ctx.fillRect(4, 16, 4, 4);
      ctx.fillRect(10, 14, 4, 5);
      ctx.fillRect(16, 12, 4, 5);

      // Tiny clawed forelimb
      ctx.fillStyle = '#74c69d';
      ctx.fillRect(30, 32, 6, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(35, 33, 2, 2); // claws

      // Massive stomping pillar legs
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(10, 38, 12, 14);
      ctx.fillRect(24, 38, 12, 14);
      ctx.fillStyle = '#d8f3dc';
      ctx.fillRect(12, 50, 4, 3); // Giant talons
      ctx.fillRect(26, 50, 4, 3);
      this.spriteCache.set('boss_trex', canvas);
    }

    // 2. Giant Mammoth Boss (60x52)
    {
      const { canvas, ctx } = this.makeCanvas(62, 54);
      // Shaggy woolly fur texture (3 tones)
      ctx.fillStyle = '#2b1505'; // Deep shadow
      ctx.fillRect(12, 6, 40, 32);

      ctx.fillStyle = '#582f0e'; // Midtone wool
      ctx.fillRect(14, 8, 36, 28);
      ctx.fillStyle = '#7f4f24'; // Shaggy highlights
      ctx.fillRect(16, 10, 30, 8);
      ctx.fillRect(18, 20, 24, 6);

      // Mammoth head with cranial hump
      ctx.fillStyle = '#3d1e08';
      ctx.fillRect(32, 4, 24, 26);
      ctx.fillStyle = '#7f4f24';
      ctx.fillRect(36, 4, 14, 6); // Cranial top hump

      // Fierce golden eye
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(40, 12, 4, 4);
      ctx.fillStyle = '#d00000';
      ctx.fillRect(41, 13, 2, 2);

      // Long curled muscular trunk
      ctx.fillStyle = '#3d1e08';
      ctx.fillRect(48, 18, 8, 20);
      ctx.fillRect(44, 34, 12, 8);
      ctx.fillStyle = '#7f4f24';
      ctx.fillRect(46, 36, 6, 4); // Trunk tip

      // Giant curved ivory tusks (Gleaming white & cream)
      ctx.fillStyle = '#fefae0';
      ctx.fillRect(42, 24, 16, 5);
      ctx.fillRect(54, 16, 5, 12);
      ctx.fillRect(56, 10, 4, 8); // Sharp curved tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(57, 10, 2, 4); // Gleam highlight

      // Heavy pillar legs
      ctx.fillStyle = '#2b1505';
      ctx.fillRect(14, 36, 12, 16);
      ctx.fillRect(30, 36, 12, 16);
      ctx.fillStyle = '#582f0e';
      ctx.fillRect(16, 38, 8, 12);
      ctx.fillRect(32, 38, 8, 12);
      this.spriteCache.set('boss_mammoth', canvas);
    }

    // 3. Giant Fire Dragon Boss (62x54)
    {
      const { canvas, ctx } = this.makeCanvas(64, 56);
      // Giant bat-like dragon wings
      ctx.fillStyle = '#370617';
      ctx.fillRect(4, 2, 34, 18);
      ctx.fillRect(0, 8, 24, 20);
      ctx.fillStyle = '#6a040f';
      ctx.fillRect(6, 4, 30, 14);

      // Wing finger bones
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(16, 2, 2, 16);
      ctx.fillRect(28, 2, 2, 16);

      // Scaly crimson torso
      ctx.fillStyle = '#6a040f';
      ctx.fillRect(14, 16, 26, 24);
      ctx.fillStyle = '#9d0208';
      ctx.fillRect(16, 18, 22, 20);

      // Golden armored underbelly scales
      ctx.fillStyle = '#e85d04';
      ctx.fillRect(18, 26, 14, 12);
      ctx.fillStyle = '#ffba08';
      ctx.fillRect(20, 28, 10, 8);

      // Horned dragon skull
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(34, 6, 8, 6); // Giant curved horns
      ctx.fillRect(40, 2, 4, 6);

      ctx.fillStyle = '#9d0208';
      ctx.fillRect(36, 10, 24, 16);
      ctx.fillStyle = '#d00000';
      ctx.fillRect(38, 12, 20, 12);

      // Glowing fire eye
      ctx.fillStyle = '#fff3b0';
      ctx.fillRect(44, 13, 5, 4);
      ctx.fillStyle = '#d90429';
      ctx.fillRect(46, 14, 2, 3);

      // Fire breathing furnace maw
      ctx.fillStyle = '#ff5400';
      ctx.fillRect(52, 18, 10, 6);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(54, 19, 8, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(53, 16, 2, 3); // Fangs
      ctx.fillRect(57, 16, 2, 3);

      // Claws
      ctx.fillStyle = '#370617';
      ctx.fillRect(16, 40, 10, 12);
      ctx.fillRect(28, 40, 10, 12);
      this.spriteCache.set('boss_dragon', canvas);
    }
  }

  // --- 4. PREHISTORIC FOOD SPRITES (Rich 16x16 Pixel Art) ---
  private static createFoodSprites() {
    // 1. Roasted Meat Drumstick
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#fefae0'; // White bone
      ctx.fillRect(1, 10, 4, 3);
      ctx.fillRect(0, 11, 2, 3);
      ctx.fillStyle = '#6f1d1b'; // Crispy skin
      ctx.fillRect(4, 3, 10, 9);
      ctx.fillStyle = '#99582a'; // Roasted meat
      ctx.fillRect(5, 4, 8, 7);
      ctx.fillStyle = '#ffe6a7'; // Juicy highlight
      ctx.fillRect(6, 5, 4, 3);
      this.spriteCache.set('food_meat', canvas);
    }

    // 2. Red Jungle Apple
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#588157'; // Green leaf
      ctx.fillRect(8, 1, 3, 2);
      ctx.fillStyle = '#3a5a40';
      ctx.fillRect(7, 2, 2, 3); // Stem
      ctx.fillStyle = '#d90429'; // Red apple
      ctx.fillRect(3, 4, 10, 10);
      ctx.fillStyle = '#ef233c';
      ctx.fillRect(4, 5, 8, 8);
      ctx.fillStyle = '#ffffff'; // Shine
      ctx.fillRect(5, 6, 2, 2);
      this.spriteCache.set('food_apple', canvas);
    }

    // 3. Golden Banana Bunch
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#7f4f24';
      ctx.fillRect(2, 2, 3, 2); // Stem
      ctx.fillStyle = '#ffb703'; // Ripe banana
      ctx.fillRect(2, 4, 11, 8);
      ctx.fillRect(4, 11, 9, 3);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(3, 5, 8, 5);
      this.spriteCache.set('food_banana', canvas);
    }

    // 4. Juicy Watermelon Slice
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#2d6a4f'; // Green rind
      ctx.fillRect(1, 10, 14, 4);
      ctx.fillStyle = '#ffffff'; // White rind
      ctx.fillRect(2, 9, 12, 2);
      ctx.fillStyle = '#d90429'; // Red melon
      ctx.fillRect(3, 4, 10, 6);
      ctx.fillStyle = '#000000'; // Black seeds
      ctx.fillRect(5, 6, 1, 2);
      ctx.fillRect(9, 7, 1, 2);
      this.spriteCache.set('food_watermelon', canvas);
    }

    // 5. Prehistoric Mammoth Burger
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#dda15e'; // Top bun
      ctx.fillRect(2, 2, 12, 4);
      ctx.fillStyle = '#fefae0'; // Sesame seeds
      ctx.fillRect(5, 3, 1, 1);
      ctx.fillRect(9, 3, 1, 1);
      ctx.fillStyle = '#55a630'; // Lettuce
      ctx.fillRect(1, 6, 14, 2);
      ctx.fillStyle = '#4a2810'; // Juicy beef patty
      ctx.fillRect(1, 8, 14, 4);
      ctx.fillStyle = '#dda15e'; // Bottom bun
      ctx.fillRect(2, 12, 12, 3);
      this.spriteCache.set('food_burger', canvas);
    }

    // 6. Prehistoric Berry Cake
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#e63946'; // Cherry on top
      ctx.fillRect(7, 1, 3, 3);
      ctx.fillStyle = '#f8f9fa'; // White frosting
      ctx.fillRect(2, 4, 12, 4);
      ctx.fillStyle = '#ffb703'; // Sponge cake
      ctx.fillRect(2, 8, 12, 6);
      ctx.fillStyle = '#d90429'; // Strawberry jam layer
      ctx.fillRect(2, 10, 12, 2);
      this.spriteCache.set('food_cake', canvas);
    }
  }

  // --- 5. TILEMAP SPRITES (16x16 pixels) ---
  private static createTileSprites() {
    // -------------------------------------------------------------
    // A. PLAINS THEME (Colinas Prehistóricas / Nido T-Rex)
    // -------------------------------------------------------------
    {
      // 1. Plains Ground Top (Lush Prehistoric Grass on Loamy Earth)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#582f0e';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#7f4f24';
      ctx.fillRect(2, 6, 5, 4);
      ctx.fillRect(9, 10, 5, 4);
      ctx.fillStyle = '#3d1e08';
      ctx.fillRect(0, 14, 16, 2);

      // Prehistoric grass fringe
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(0, 0, 16, 5);
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(0, 0, 16, 4);
      ctx.fillStyle = '#52b788';
      ctx.fillRect(0, 0, 16, 2);
      // Grass blade spikes
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(2, 4, 2, 2);
      ctx.fillRect(7, 4, 3, 2);
      ctx.fillRect(13, 4, 2, 2);
      ctx.fillStyle = '#74c69d';
      ctx.fillRect(1, 1, 2, 1);
      ctx.fillRect(8, 1, 2, 1);

      this.spriteCache.set('tile_ground_top', canvas);
      this.spriteCache.set('tile_ground_top_plains', canvas);
      this.spriteCache.set('tile_grass_block', canvas);
    }

    {
      // 2. Plains Ground Fill (Subterranean Strata & Pebbles)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#4a2508';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#582f0e';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#7f4f24';
      ctx.fillRect(2, 2, 6, 5);
      ctx.fillRect(9, 8, 5, 6);
      ctx.fillStyle = '#3d1e08';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      // Embedded ancient rock pebbles
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(4, 10, 3, 3);
      ctx.fillStyle = '#adb5bd';
      ctx.fillRect(4, 10, 2, 1);
      ctx.fillStyle = '#495057';
      ctx.fillRect(11, 3, 3, 2);

      this.spriteCache.set('tile_ground_fill', canvas);
      this.spriteCache.set('tile_ground_fill_plains', canvas);
    }

    {
      // 3. Plains Platform (Prehistoric Wooden Log Ledge with Moss)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      // Moss fringe on top
      ctx.fillStyle = '#52b788';
      ctx.fillRect(0, 0, 16, 2);
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(0, 2, 16, 2);

      // Carved wood trunk surface
      ctx.fillStyle = '#895737';
      ctx.fillRect(0, 4, 16, 6);
      ctx.fillStyle = '#b07d62';
      ctx.fillRect(0, 4, 16, 2); // Highlight
      ctx.fillStyle = '#582f0e';
      ctx.fillRect(0, 9, 16, 2); // Bark shadow
      ctx.fillStyle = '#3d1e08';
      ctx.fillRect(0, 10, 16, 2);

      // Hanging moss & prehistoric vines hanging down
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(2, 11, 2, 4);
      ctx.fillRect(3, 15, 1, 1);
      ctx.fillRect(8, 11, 2, 3);
      ctx.fillRect(13, 11, 2, 5);
      ctx.fillRect(14, 15, 1, 1);
      ctx.fillStyle = '#52b788';
      ctx.fillRect(2, 11, 1, 2);
      ctx.fillRect(13, 11, 1, 2);

      this.spriteCache.set('tile_platform', canvas);
      this.spriteCache.set('tile_platform_plains', canvas);
    }

    // -------------------------------------------------------------
    // B. CAVE THEME (Cavernas Ocultas)
    // -------------------------------------------------------------
    {
      // 1. Cave Ground Top (Dark Basalt with Mineral Crystals)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 0, 16, 6);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(1, 1, 14, 3);
      // Glowing cyan mineral crystal specks
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(3, 2, 2, 2);
      ctx.fillRect(10, 1, 2, 2);
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(3, 2, 1, 1);
      ctx.fillRect(10, 1, 1, 1);
      // Dark rock cracks
      ctx.fillStyle = '#0c0a09';
      ctx.fillRect(0, 6, 16, 2);
      ctx.fillRect(6, 6, 2, 6);

      this.spriteCache.set('tile_ground_top_cave', canvas);
    }

    {
      // 2. Cave Ground Fill (Dense Underground Cavern Bedrock)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#0c0a09';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#292524';
      ctx.fillRect(3, 3, 5, 4);
      ctx.fillRect(9, 7, 5, 5);
      // Faint subterranean mineral seams
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(5, 12, 3, 2);

      this.spriteCache.set('tile_ground_fill_cave', canvas);
    }

    {
      // 3. Cave Platform (Carved Natural Slate Ledge with Stalactite Droplets)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(0, 0, 16, 3); // Pale stone rim
      ctx.fillStyle = '#a8a29e';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(0, 3, 16, 6);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 8, 16, 3);
      // Small hanging stalactites
      ctx.fillStyle = '#44403c';
      ctx.fillRect(2, 11, 3, 3);
      ctx.fillRect(3, 14, 1, 2);
      ctx.fillRect(10, 11, 2, 4);
      ctx.fillRect(11, 15, 1, 1);
      // Mineral glint
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(6, 1, 2, 1);

      this.spriteCache.set('tile_platform_cave', canvas);
    }

    // -------------------------------------------------------------
    // C. ICE THEME (Paso Glacial del Mamut)
    // -------------------------------------------------------------
    {
      // 1. Ice Ground Top (Crisp Glacial Snow on Cyan Permafrost)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#48cae4';
      ctx.fillRect(0, 4, 16, 8);
      // Top fresh snow crust
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 16, 4);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 3, 16, 2);
      // Glacial ice fissure
      ctx.fillStyle = '#023e8a';
      ctx.fillRect(5, 6, 2, 7);
      ctx.fillRect(7, 10, 4, 2);

      this.spriteCache.set('tile_ground_top_ice', canvas);
    }

    {
      // 2. Ice Ground Fill (Deep Blue Solid Permafrost Ice)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#03045e';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#0096c7';
      ctx.fillRect(3, 3, 6, 5);
      ctx.fillRect(9, 8, 5, 5);
      ctx.fillStyle = '#48cae4';
      ctx.fillRect(4, 4, 3, 2);

      this.spriteCache.set('tile_ground_fill_ice', canvas);
    }

    {
      // 3. Ice Platform (Translucent Frost Ledge with Hanging Icicles)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 16, 3); // Glistening snow top
      ctx.fillStyle = '#90e0ef';
      ctx.fillRect(0, 3, 16, 5);
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(0, 7, 16, 3);
      // Sharp hanging icicles
      ctx.fillStyle = '#caf0f8';
      ctx.fillRect(1, 10, 2, 4);
      ctx.fillRect(2, 14, 1, 2);
      ctx.fillRect(6, 10, 3, 5);
      ctx.fillRect(7, 15, 1, 1);
      ctx.fillRect(12, 10, 2, 3);

      this.spriteCache.set('tile_platform_ice', canvas);
    }

    // -------------------------------------------------------------
    // D. VOLCANO THEME (Selva Volcánica / Cráter del Dragón)
    // -------------------------------------------------------------
    {
      // 1. Volcano Ground Top (Obsidian Crust with Glowing Lava Fissures)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 0, 16, 5);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(0, 0, 16, 2);
      // Glowing magma cracks
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(2, 5, 12, 2);
      ctx.fillRect(5, 7, 3, 4);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(3, 5, 8, 1);
      ctx.fillRect(6, 8, 2, 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(5, 5, 4, 1);

      this.spriteCache.set('tile_ground_top_volcano', canvas);
    }

    {
      // 2. Volcano Ground Fill (Dense Basalt and Molten Pockets)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#0c0a09';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#292524';
      ctx.fillRect(2, 2, 6, 6);
      ctx.fillRect(9, 8, 5, 5);
      // Glowing ember dot
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(4, 11, 2, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(4, 11, 1, 1);

      this.spriteCache.set('tile_ground_fill_volcano', canvas);
    }

    {
      // 3. Volcano Platform (Scorched Basalt Stone Slab with Glowing Ember Trim)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#57534e';
      ctx.fillRect(0, 0, 16, 2); // Ash top
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 2, 16, 6);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 7, 16, 3);
      // Glowing volcanic embers underneath
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 9, 16, 2);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(3, 10, 4, 2);
      ctx.fillRect(10, 10, 4, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(4, 10, 2, 1);
      ctx.fillRect(11, 10, 2, 1);

      this.spriteCache.set('tile_platform_volcano', canvas);
    }

    // -------------------------------------------------------------
    // E. FORTRESS THEME (Fortaleza del Gran Cacique)
    // -------------------------------------------------------------
    {
      // 1. Fortress Ground Top (Ancient Megalithic Masonry Block Top)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 16, 5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 16, 2);
      // Carved tribal stone notch
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(7, 0, 2, 5);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(2, 2, 2, 2); // Golden glyph inlay
      ctx.fillRect(12, 2, 2, 2);

      this.spriteCache.set('tile_ground_top_fortress', canvas);
    }

    {
      // 2. Fortress Ground Fill (Heavy Megalith Stone Bricks)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1, 1, 14, 6);
      ctx.fillRect(1, 8, 14, 7);
      // Mortar groove
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, 1, 14, 1);
      ctx.fillRect(1, 8, 14, 1);

      this.spriteCache.set('tile_ground_fill_fortress', canvas);
    }

    {
      // 3. Fortress Platform (Ancient Tribal Timber Scaffold Plank)
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, 16, 2); // Golden hardwood top
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 2, 16, 6);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 8, 16, 3);
      // Metal/bronze reinforcing rivets
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(2, 3, 2, 2);
      ctx.fillRect(12, 3, 2, 2);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, 11, 2, 4); // Timber support struts
      ctx.fillRect(10, 11, 2, 4);

      this.spriteCache.set('tile_platform_fortress', canvas);
    }

    // -------------------------------------------------------------
    // F. BRIDGES, SECRET WALLS & EXIT TOTEM
    // -------------------------------------------------------------
    // Prehistoric Wooden Bridge
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#7f4f24';
      ctx.fillRect(0, 2, 16, 6);
      ctx.fillStyle = '#582f0e';
      ctx.fillRect(1, 4, 14, 3);
      ctx.fillStyle = '#e9c46a'; // Rope bindings
      ctx.fillRect(0, 2, 2, 7);
      ctx.fillRect(14, 2, 2, 7);
      // Hanging rope sag
      ctx.fillStyle = '#c59b27';
      ctx.fillRect(4, 7, 8, 2);
      ctx.fillRect(6, 9, 4, 1);
      this.spriteCache.set('tile_bridge', canvas);
    }

    // Secret Breakable False Wall (All Themes)
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#495057';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#343a40';
      ctx.fillRect(2, 2, 12, 12);
      // Visible cracks hinting secret!
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(4, 4, 4, 1);
      ctx.fillRect(7, 5, 1, 4);
      ctx.fillRect(8, 8, 5, 1);
      ctx.fillRect(4, 12, 4, 1);
      this.spriteCache.set('tile_secret_wall', canvas);
      this.spriteCache.set('tile_secret_wall_plains', canvas);
      this.spriteCache.set('tile_secret_wall_cave', canvas);
      this.spriteCache.set('tile_secret_wall_ice', canvas);
      this.spriteCache.set('tile_secret_wall_volcano', canvas);
      this.spriteCache.set('tile_secret_wall_fortress', canvas);
    }

    // Prehistoric Exit Totem / Cave Door
    {
      const { canvas, ctx } = this.makeCanvas(24, 32);
      // Stone cave mouth arch
      ctx.fillStyle = '#1b1d24';
      ctx.fillRect(2, 4, 20, 28);
      // Glowing darkness inside
      ctx.fillStyle = '#050508';
      ctx.fillRect(5, 8, 14, 24);
      // Carved tribal stone totem header
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(0, 0, 24, 8);
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(4, 2, 4, 4); // Glowing totem eye 1
      ctx.fillRect(16, 2, 4, 4); // Glowing totem eye 2
      this.spriteCache.set('tile_exit_totem', canvas);
    }
  }

  // --- 6. PARTICLES & EFFECTS ---
  private static createEffectSprites() {
    // 1. Comic Hit Star Particle
    {
      const { canvas, ctx } = this.makeCanvas(16, 16);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(6, 0, 4, 16);
      ctx.fillRect(0, 6, 16, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 5, 6, 6);
      this.spriteCache.set('fx_hit_star', canvas);
    }

    // 2. Dust Cloud Puff
    {
      const { canvas, ctx } = this.makeCanvas(14, 10);
      ctx.fillStyle = '#ced4da';
      ctx.beginPath();
      ctx.arc(4, 6, 3, 0, Math.PI * 2);
      ctx.arc(8, 4, 4, 0, Math.PI * 2);
      ctx.arc(11, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      this.spriteCache.set('fx_dust', canvas);
    }
  }
}
