export enum GameState {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  LEVEL_TRANSITION = 'LEVEL_TRANSITION',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  NEED_FOOD_WARNING = 'NEED_FOOD_WARNING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  PAUSED = 'PAUSED',
  COGNITIVE_REPORT = 'COGNITIVE_REPORT'
}

export enum PlayerActionState {
  IDLE = 'IDLE',
  WALKING = 'WALKING',
  JUMPING = 'JUMPING',
  FALLING = 'FALLING',
  ATTACKING = 'ATTACKING',
  DIZZY = 'DIZZY',
  HURT = 'HURT',
  DEAD = 'DEAD'
}

export enum Direction {
  LEFT = -1,
  RIGHT = 1
}

export enum EnemyType {
  RAPTOR = 'RAPTOR',
  BEAR = 'BEAR',
  SPIDER = 'SPIDER',
  PTERODACTYL = 'PTERODACTYL',
  BOSS_TREX = 'BOSS_TREX',
  BOSS_MAMMOTH = 'BOSS_MAMMOTH',
  BOSS_DRAGON = 'BOSS_DRAGON',
  BOSS_CHIEFTAIN = 'BOSS_CHIEFTAIN'
}

export enum FoodType {
  APPLE = 'APPLE',
  BANANA = 'BANANA',
  WATERMELON = 'WATERMELON',
  BURGER = 'BURGER',
  CAKE = 'CAKE',
  DRUMSTICK = 'DRUMSTICK',
  STEAK = 'STEAK'
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FoodItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: FoodType;
  foodPoints: number;
  scoreValue: number;
  collected: boolean;
  bounceOffset?: number;
}

export interface SecretWall {
  id: string;
  tileX: number;
  tileY: number;
  width: number;
  height: number;
  hitsLeft: number;
  destroyed: boolean;
  revealsRoomId?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity?: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface CognitiveStats {
  totalSwings: number;
  successfulHits: number;
  reactionTimesMs: number[];
  averageReactionMs: number;
  accuracyPercentage: number;
  damageTakenCount: number;
  secretCavesFound: number;
  totalSecretCaves: number;
  foodCollectedCount: number;
  cognitiveScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface SavedGameProgress {
  levelNumber: number;
  score: number;
  lives: number;
  highScore: number;
  timestamp: number;
  cognitiveBenchmark: {
    avgReactionMs: number;
    accuracy: number;
    grade: string;
  };
}

export interface LevelDefinition {
  levelNumber: number;
  name: string;
  subtitle: string;
  isBossLevel: boolean;
  bossType?: EnemyType;
  theme: 'plains' | 'cave' | 'ice' | 'volcano' | 'fortress';
  width: number; // in tiles
  height: number; // in tiles
  targetFood: number; // total food needed to reach 100%
  timeLimitSeconds: number;
  playerStartX: number;
  playerStartY: number;
  exitX: number;
  exitY: number;
  mapGrid: number[][]; // 0: empty, 1: solid ground, 2: platform, 3: bridge, 4: spike, 5: secret wall, 6: exit totem, 7: dark cave entrance
  foodSpawns: Array<{ x: number; y: number; type: FoodType }>;
  enemySpawns: Array<{ x: number; y: number; type: EnemyType; patrolDistance?: number }>;
  secretWalls: Array<{ tileX: number; tileY: number; hits: number; revealsSecret: string }>;
  bossConfig?: {
    name: string;
    maxHealth: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
