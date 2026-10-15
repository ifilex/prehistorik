/**
 * Authentic Prehistorik 1991 MS-DOS HUD (Heads-Up Display).
 * Displays Lives, Score, Food Meter (crucial level progression gauge),
 * Countdown Timer, Cognitive Rating, and Sound/CRT toggles.
 */

import React from 'react';
import { GameEngine } from '../game/GameEngine.ts';
import { Volume2, VolumeX, Monitor, Brain, RefreshCw } from 'lucide-react';
import { soundSystem } from '../engine/SoundSystem.ts';

interface HUDProps {
  engine: GameEngine;
  crtEnabled: boolean;
  onToggleCRT: () => void;
  onOpenCognitiveModal: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
  onRestartLevel: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  crtEnabled,
  onToggleCRT,
  onOpenCognitiveModal,
  onToggleSound,
  isMuted,
  onRestartLevel
}) => {
  const currentLevel = engine.currentLevel;
  const foodPercent = Math.min(100, Math.round((engine.foodCollected / (currentLevel?.targetFood || 100)) * 100));
  const isFoodFull = foodPercent >= 100;

  return (
    <header className="w-full bg-[#181a20] border-b-2 border-[#3a3f50] text-[#e0e6ed] px-2 py-1.5 flex flex-wrap items-center justify-between text-xs select-none shadow-md z-30">
      {/* Left: Lives & Score */}
      <div className="flex items-center gap-4">
        {/* Lives */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#ffb703] font-bold tracking-wider">VIDAS:</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.max(0, engine.player.lives) }).map((_, i) => (
              <span
                key={i}
                className="inline-block w-4 h-4 bg-[#d9681e] border border-[#ffea00] rounded-sm text-center leading-3 font-bold text-[10px] text-white"
                title="Sam Life"
              >
                S
              </span>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1">
          <span className="text-[#a8dadc]">PTS:</span>
          <span className="font-mono font-bold text-[#f1faee] tracking-widest text-[13px]">
            {String(engine.score).padStart(6, '0')}
          </span>
        </div>

        {/* Current Level */}
        <div className="hidden sm:flex items-center gap-1 text-[#ced4da]">
          <span className="text-[#e63946] font-bold">NVL {engine.currentLevelIndex + 1}:</span>
          <span className="truncate max-w-[140px] text-[11px]">{currentLevel?.name}</span>
        </div>
      </div>

      {/* Center: FOOD METER (Crucial Prehistorik Mechanic!) */}
      <div className="flex items-center gap-2 my-1 sm:my-0">
        <span className={`font-bold tracking-wider text-[11px] ${isFoodFull ? 'text-[#38b000]' : 'text-[#ffb703]'}`}>
          COMIDA:
        </span>
        <div className="w-32 sm:w-44 h-4 bg-[#0d0f12] border border-[#555b6e] rounded-none relative overflow-hidden flex items-center">
          <div
            className={`h-full transition-all duration-200 ${
              isFoodFull
                ? 'bg-[#38b000] shadow-[0_0_8px_#38b000]'
                : foodPercent > 60
                ? 'bg-[#f77f00]'
                : 'bg-[#d90429]'
            }`}
            style={{ width: `${foodPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[9px] text-[#ffffff] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
            {isFoodFull ? '¡100% LLENO! (LISTO)' : `${foodPercent}% / 100%`}
          </span>
        </div>
      </div>

      {/* Right: Timer, Cognitive Indicator & Controls */}
      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="flex items-center gap-1">
          <span className="text-[#a8dadc]">TIEMPO:</span>
          <span
            className={`font-mono font-bold text-[13px] ${
              engine.timeRemaining < 30 ? 'text-[#d90429] animate-pulse' : 'text-[#f1faee]'
            }`}
          >
            {engine.timeRemaining}s
          </span>
        </div>

        {/* Cognitive Reaction Quick Badge */}
        <button
          id="btn-cognitive-report"
          onClick={onOpenCognitiveModal}
          className="px-1.5 py-1 bg-[#264653] hover:bg-[#2a9d8f] text-[#f1faee] rounded flex items-center gap-1 text-[10px] transition-colors border border-[#457b9d]"
          title="Ver Evaluación Cognitiva Mano/Ojo"
        >
          <Brain className="w-3.5 h-3.5 text-[#ffb703]" />
          <span className="hidden md:inline font-bold">RATING: {engine.cognitiveStats.grade}</span>
        </button>

        {/* Restart level */}
        <button
          id="btn-restart-level"
          onClick={onRestartLevel}
          className="p-1 bg-[#2b2d42] hover:bg-[#3d405b] text-[#f1faee] rounded border border-[#4a4e69]"
          title="Reiniciar Nivel"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* CRT Toggle */}
        <button
          id="btn-toggle-crt"
          onClick={onToggleCRT}
          className={`p-1 rounded border transition-colors ${
            crtEnabled
              ? 'bg-[#2a9d8f] text-white border-[#e76f51]'
              : 'bg-[#2b2d42] text-[#8d99ae] border-[#4a4e69]'
          }`}
          title={crtEnabled ? 'Desactivar Filtro CRT' : 'Activar Filtro CRT 1991'}
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>

        {/* Sound Toggle */}
        <button
          id="btn-toggle-sound"
          onClick={onToggleSound}
          className="p-1 bg-[#2b2d42] hover:bg-[#3d405b] text-[#f1faee] rounded border border-[#4a4e69]"
          title={isMuted ? 'Activar Sonido Retro' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
        </button>
      </div>
    </header>
  );
};
