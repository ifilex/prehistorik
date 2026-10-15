/**
 * The 7 Complete Levels for Prehistorik 1991 MS-DOS Clone:
 * Alternates between Platform/Cave Exploration (1, 3, 5, 7) with Secret Breakable Caverns
 * and Giant Boss Arenas (2, 4, 6).
 */

import { LevelDefinition, EnemyType, FoodType } from '../types.ts';

// Helper to create grid map with ground and platforms
function generateLevelMap(
  width: number,
  height: number,
  groundLevel: number = 10,
  platforms: Array<{ x: number; y: number; w: number; type?: number }> = [],
  secretWalls: Array<{ x: number; y: number }> = [],
  spikes: Array<{ x: number; y: number; w: number }> = []
): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      // Solid bottom boundaries
      if (y === height - 1) {
        row.push(1); // Bedrock
      } else if (y >= groundLevel) {
        row.push(y === groundLevel ? 1 : 1);
      } else if (x === 0 || x === width - 1) {
        row.push(1); // Side walls
      } else {
        row.push(0); // Sky / Empty
      }
    }
    grid.push(row);
  }

  // Insert platforms
  for (const plat of platforms) {
    const tileType = plat.type || 2; // 2: platform, 3: bridge
    for (let px = 0; px < plat.w; px++) {
      if (plat.y < height && plat.x + px < width) {
        grid[plat.y][plat.x + px] = tileType;
      }
    }
  }

  // Insert secret breakable walls
  for (const sw of secretWalls) {
    if (sw.y < height && sw.x < width) {
      grid[sw.y][sw.x] = 5; // 5: Secret Wall
    }
  }

  // Insert spikes
  for (const sp of spikes) {
    for (let sx = 0; sx < sp.w; sx++) {
      if (sp.y < height && sp.x + sx < width) {
        grid[sp.y][sp.x + sx] = 4; // 4: Spikes
      }
    }
  }

  return grid;
}

export const LEVELS: LevelDefinition[] = [
  // ==========================================
  // LEVEL 1: COLINAS VERDES PREHISTÓRICAS
  // ==========================================
  {
    levelNumber: 1,
    name: 'Colinas Prehistóricas',
    subtitle: 'Valle de los Primeros Cazadores',
    isBossLevel: false,
    theme: 'plains',
    width: 38,
    height: 12,
    targetFood: 120,
    timeLimitSeconds: 120,
    playerStartX: 24,
    playerStartY: 120,
    exitX: 35 * 16,
    exitY: 8 * 16,
    mapGrid: generateLevelMap(
      38, 12, 10,
      [
        { x: 5, y: 8, w: 4, type: 2 },
        { x: 11, y: 7, w: 5, type: 3 }, // Bridge
        { x: 18, y: 6, w: 5, type: 2 },
        { x: 25, y: 8, w: 4, type: 2 },
        { x: 30, y: 7, w: 3, type: 2 }
      ],
      [
        { x: 23, y: 9 }, // Secret wall at ground leading to hollow cache
        { x: 23, y: 8 }
      ]
    ),
    foodSpawns: [
      { x: 6 * 16, y: 6 * 16, type: FoodType.APPLE },
      { x: 8 * 16, y: 9 * 16, type: FoodType.BANANA },
      { x: 13 * 16, y: 5 * 16, type: FoodType.DRUMSTICK },
      { x: 15 * 16, y: 9 * 16, type: FoodType.WATERMELON },
      { x: 20 * 16, y: 4 * 16, type: FoodType.BURGER },
      { x: 24 * 16, y: 9 * 16, type: FoodType.CAKE }, // In secret room behind wall!
      { x: 27 * 16, y: 6 * 16, type: FoodType.STEAK },
      { x: 31 * 16, y: 5 * 16, type: FoodType.DRUMSTICK }
    ],
    enemySpawns: [
      { x: 9 * 16, y: 9 * 16, type: EnemyType.RAPTOR, patrolDistance: 30 },
      { x: 19 * 16, y: 5 * 16, type: EnemyType.RAPTOR, patrolDistance: 25 },
      { x: 28 * 16, y: 9 * 16, type: EnemyType.RAPTOR, patrolDistance: 35 }
    ],
    secretWalls: [
      { tileX: 23, tileY: 9, hits: 2, revealsSecret: '¡CUEVA SECRETA ENCONTRADA!' }
    ]
  },

  // ==========================================
  // LEVEL 2: EL NIDO DEL T-REX (BOSS 1)
  // ==========================================
  {
    levelNumber: 2,
    name: 'El Nido del T-Rex',
    subtitle: '¡Enfréntate al Gigante Tirannosaurio!',
    isBossLevel: true,
    bossType: EnemyType.BOSS_TREX,
    theme: 'plains',
    width: 24,
    height: 12,
    targetFood: 60,
    timeLimitSeconds: 90,
    playerStartX: 24,
    playerStartY: 120,
    exitX: 21 * 16,
    exitY: 8 * 16,
    mapGrid: generateLevelMap(
      24, 12, 10,
      [
        { x: 4, y: 7, w: 3, type: 2 },
        { x: 17, y: 7, w: 3, type: 2 }
      ]
    ),
    foodSpawns: [
      { x: 5 * 16, y: 5 * 16, type: FoodType.BURGER },
      { x: 18 * 16, y: 5 * 16, type: FoodType.STEAK }
    ],
    enemySpawns: [],
    secretWalls: [],
    bossConfig: {
      name: 'T-Rex Rexor',
      maxHealth: 6,
      x: 15 * 16,
      y: 7 * 16,
      width: 48,
      height: 44
    }
  },

  // ==========================================
  // LEVEL 3: CAVERNAS OCULTAS
  // ==========================================
  {
    levelNumber: 3,
    name: 'Cavernas Ocultas',
    subtitle: 'Peligros Subterráneos y Paredes Falsas',
    isBossLevel: false,
    theme: 'cave',
    width: 42,
    height: 14,
    targetFood: 160,
    timeLimitSeconds: 150,
    playerStartX: 24,
    playerStartY: 140,
    exitX: 38 * 16,
    exitY: 10 * 16,
    mapGrid: generateLevelMap(
      42, 14, 12,
      [
        { x: 5, y: 10, w: 4, type: 2 },
        { x: 11, y: 8, w: 5, type: 2 },
        { x: 18, y: 6, w: 6, type: 3 }, // Bridge over deep cavern
        { x: 26, y: 9, w: 4, type: 2 },
        { x: 32, y: 7, w: 4, type: 2 }
      ],
      [
        { x: 16, y: 11 }, // Secret breakable cavern wall
        { x: 16, y: 10 }
      ],
      [
        { x: 19, y: 11, w: 3 } // Cave Spikes
      ]
    ),
    foodSpawns: [
      { x: 6 * 16, y: 8 * 16, type: FoodType.WATERMELON },
      { x: 12 * 16, y: 6 * 16, type: FoodType.CAKE },
      { x: 14 * 16, y: 11 * 16, type: FoodType.BURGER }, // Hidden secret cache
      { x: 15 * 16, y: 11 * 16, type: FoodType.STEAK },
      { x: 20 * 16, y: 4 * 16, type: FoodType.DRUMSTICK },
      { x: 27 * 16, y: 7 * 16, type: FoodType.APPLE },
      { x: 33 * 16, y: 5 * 16, type: FoodType.BANANA },
      { x: 35 * 16, y: 10 * 16, type: FoodType.DRUMSTICK }
    ],
    enemySpawns: [
      { x: 8 * 16, y: 11 * 16, type: EnemyType.BEAR, patrolDistance: 25 },
      { x: 13 * 16, y: 2 * 16, type: EnemyType.SPIDER },
      { x: 22 * 16, y: 2 * 16, type: EnemyType.SPIDER },
      { x: 28 * 16, y: 11 * 16, type: EnemyType.BEAR, patrolDistance: 30 }
    ],
    secretWalls: [
      { tileX: 16, tileY: 11, hits: 3, revealsSecret: '¡CUEVA DEL TESORO DESCUBIERTA!' }
    ]
  },

  // ==========================================
  // LEVEL 4: PASO GLACIAL DEL MAMUT (BOSS 2)
  // ==========================================
  {
    levelNumber: 4,
    name: 'Paso Glacial del Mamut',
    subtitle: 'El Coloso Lanudo de la Edad de Hielo',
    isBossLevel: true,
    bossType: EnemyType.BOSS_MAMMOTH,
    theme: 'ice',
    width: 24,
    height: 12,
    targetFood: 80,
    timeLimitSeconds: 100,
    playerStartX: 24,
    playerStartY: 120,
    exitX: 21 * 16,
    exitY: 8 * 16,
    mapGrid: generateLevelMap(
      24, 12, 10,
      [
        { x: 5, y: 6, w: 4, type: 2 },
        { x: 16, y: 6, w: 4, type: 2 }
      ]
    ),
    foodSpawns: [
      { x: 6 * 16, y: 4 * 16, type: FoodType.CAKE },
      { x: 17 * 16, y: 4 * 16, type: FoodType.BURGER }
    ],
    enemySpawns: [],
    secretWalls: [],
    bossConfig: {
      name: 'Mammoth Colossus',
      maxHealth: 8,
      x: 14 * 16,
      y: 7 * 16,
      width: 48,
      height: 44
    }
  },

  // ==========================================
  // LEVEL 5: SELVA VOLCÁNICA Y LAVA
  // ==========================================
  {
    levelNumber: 5,
    name: 'Selva Volcánica',
    subtitle: 'Fosas de Magma y Pterodáctilos Aéreos',
    isBossLevel: false,
    theme: 'volcano',
    width: 44,
    height: 13,
    targetFood: 180,
    timeLimitSeconds: 160,
    playerStartX: 24,
    playerStartY: 120,
    exitX: 40 * 16,
    exitY: 9 * 16,
    mapGrid: generateLevelMap(
      44, 13, 11,
      [
        { x: 6, y: 9, w: 4, type: 2 },
        { x: 13, y: 7, w: 5, type: 3 }, // Long bridge
        { x: 21, y: 8, w: 4, type: 2 },
        { x: 28, y: 6, w: 5, type: 2 },
        { x: 35, y: 8, w: 4, type: 2 }
      ],
      [
        { x: 26, y: 10 },
        { x: 26, y: 9 }
      ],
      [
        { x: 14, y: 10, w: 4 }, // Magma Pit
        { x: 23, y: 10, w: 3 }
      ]
    ),
    foodSpawns: [
      { x: 7 * 16, y: 7 * 16, type: FoodType.STEAK },
      { x: 15 * 16, y: 5 * 16, type: FoodType.DRUMSTICK },
      { x: 22 * 16, y: 6 * 16, type: FoodType.BURGER },
      { x: 27 * 16, y: 10 * 16, type: FoodType.CAKE }, // Inside secret lava vault
      { x: 30 * 16, y: 4 * 16, type: FoodType.WATERMELON },
      { x: 36 * 16, y: 6 * 16, type: FoodType.STEAK },
      { x: 38 * 16, y: 9 * 16, type: FoodType.DRUMSTICK }
    ],
    enemySpawns: [
      { x: 10 * 16, y: 4 * 16, type: EnemyType.PTERODACTYL, patrolDistance: 45 },
      { x: 18 * 16, y: 10 * 16, type: EnemyType.RAPTOR, patrolDistance: 25 },
      { x: 25 * 16, y: 4 * 16, type: EnemyType.PTERODACTYL, patrolDistance: 50 },
      { x: 32 * 16, y: 10 * 16, type: EnemyType.BEAR, patrolDistance: 25 }
    ],
    secretWalls: [
      { tileX: 26, tileY: 10, hits: 3, revealsSecret: '¡CÁMARA DE FUEGO SECRETA!' }
    ]
  },

  // ==========================================
  // LEVEL 6: CRÁTER DEL DRAGÓN DE FUEGO (BOSS 3)
  // ==========================================
  {
    levelNumber: 6,
    name: 'Cráter del Dragón',
    subtitle: 'El Señor de los Cielos Prehistóricos',
    isBossLevel: true,
    bossType: EnemyType.BOSS_DRAGON,
    theme: 'volcano',
    width: 26,
    height: 12,
    targetFood: 90,
    timeLimitSeconds: 110,
    playerStartX: 24,
    playerStartY: 120,
    exitX: 23 * 16,
    exitY: 8 * 16,
    mapGrid: generateLevelMap(
      26, 12, 10,
      [
        { x: 4, y: 7, w: 4, type: 2 },
        { x: 18, y: 7, w: 4, type: 2 }
      ]
    ),
    foodSpawns: [
      { x: 5 * 16, y: 5 * 16, type: FoodType.STEAK },
      { x: 19 * 16, y: 5 * 16, type: FoodType.BURGER }
    ],
    enemySpawns: [],
    secretWalls: [],
    bossConfig: {
      name: 'Ptero-Drake Ignis',
      maxHealth: 10,
      x: 16 * 16,
      y: 6 * 16,
      width: 52,
      height: 46
    }
  },

  // ==========================================
  // LEVEL 7: LA FORTALEZA DEL GRAN CACIQUE
  // ==========================================
  {
    levelNumber: 7,
    name: 'Fortaleza del Gran Cacique',
    subtitle: 'El Desafío Final de la Era de Piedra',
    isBossLevel: false,
    theme: 'fortress',
    width: 48,
    height: 14,
    targetFood: 220,
    timeLimitSeconds: 180,
    playerStartX: 24,
    playerStartY: 140,
    exitX: 44 * 16,
    exitY: 10 * 16,
    mapGrid: generateLevelMap(
      48, 14, 12,
      [
        { x: 5, y: 10, w: 4, type: 2 },
        { x: 11, y: 8, w: 5, type: 3 },
        { x: 18, y: 6, w: 4, type: 2 },
        { x: 24, y: 8, w: 5, type: 2 },
        { x: 32, y: 6, w: 4, type: 3 },
        { x: 39, y: 9, w: 4, type: 2 }
      ],
      [
        { x: 30, y: 11 },
        { x: 30, y: 10 }
      ],
      [
        { x: 16, y: 11, w: 3 },
        { x: 28, y: 11, w: 2 }
      ]
    ),
    foodSpawns: [
      { x: 6 * 16, y: 8 * 16, type: FoodType.BURGER },
      { x: 13 * 16, y: 6 * 16, type: FoodType.CAKE },
      { x: 19 * 16, y: 4 * 16, type: FoodType.STEAK },
      { x: 25 * 16, y: 6 * 16, type: FoodType.DRUMSTICK },
      { x: 31 * 16, y: 11 * 16, type: FoodType.WATERMELON }, // Inside master vault
      { x: 32 * 16, y: 11 * 16, type: FoodType.BURGER },
      { x: 34 * 16, y: 4 * 16, type: FoodType.CAKE },
      { x: 40 * 16, y: 7 * 16, type: FoodType.STEAK },
      { x: 42 * 16, y: 11 * 16, type: FoodType.DRUMSTICK }
    ],
    enemySpawns: [
      { x: 8 * 16, y: 11 * 16, type: EnemyType.RAPTOR, patrolDistance: 35 },
      { x: 14 * 16, y: 3 * 16, type: EnemyType.SPIDER },
      { x: 20 * 16, y: 3 * 16, type: EnemyType.PTERODACTYL, patrolDistance: 40 },
      { x: 26 * 16, y: 11 * 16, type: EnemyType.BEAR, patrolDistance: 30 },
      { x: 36 * 16, y: 11 * 16, type: EnemyType.RAPTOR, patrolDistance: 30 }
    ],
    secretWalls: [
      { tileX: 30, tileY: 11, hits: 3, revealsSecret: '¡CÁMARA DEL TESORO REAL!' }
    ]
  }
];
