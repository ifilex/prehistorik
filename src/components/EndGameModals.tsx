/**
 * Game Over & Victory Screens with Cognitive Evaluation Summary.
 */

import React from 'react';
import { RotateCcw, Trophy, Brain, Home } from 'lucide-react';
import { CognitiveStats } from '../types.ts';

interface GameOverModalProps {
  score: number;
  levelNumber: number;
  stats: CognitiveStats;
  onRetry: () => void;
  onOpenReport: () => void;
  onReturnToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  levelNumber,
  stats,
  onRetry,
  onOpenReport,
  onReturnToTitle
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 select-none">
      <div className="max-w-sm w-full bg-[#12141a] border-2 border-[#d90429] p-6 text-center text-[#e0e6ed] shadow-[0_0_25px_rgba(217,4,41,0.5)]">
        <h2 className="text-2xl font-extrabold text-[#d90429] tracking-widest mb-2 animate-pulse">
          GAME OVER
        </h2>
        <p className="text-xs font-mono text-[#ced4da] mb-4">
          SAM SE QUEDÓ SIN VIDAS EN EL NIVEL {levelNumber}
        </p>

        <div className="bg-[#1a1e29] border border-[#2d3345] p-3 mb-4 text-xs font-mono">
          <div className="text-[#a8dadc] mb-1">PUNTUACIÓN FINAL:</div>
          <div className="text-xl font-bold text-[#ffb703]">{score}</div>
          <div className="text-[10px] text-[#8d99ae] mt-2">
            RATING COGNITIVO: <b className="text-white">{stats.grade}</b> ({Math.round(stats.averageReactionMs)}ms)
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="w-full py-2.5 bg-[#d90429] hover:bg-[#ef233c] text-white font-bold text-xs tracking-wider border border-[#ff4d6d] shadow flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINTENTAR NIVEL</span>
          </button>

          <button
            onClick={onOpenReport}
            className="w-full py-2 bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold text-xs tracking-wider border border-[#48cae4] flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4" />
            <span>VER REPORTE COGNITIVO</span>
          </button>

          <button
            onClick={onReturnToTitle}
            className="w-full py-1.5 bg-[#2b2d42] hover:bg-[#3d405b] text-[#ced4da] text-[11px] font-mono flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  score: number;
  stats: CognitiveStats;
  onPlayAgain: () => void;
  onOpenReport: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  stats,
  onPlayAgain,
  onOpenReport
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-[#12141a] border-2 border-[#ffb703] p-6 text-center text-[#e0e6ed] shadow-[0_0_30px_rgba(255,183,3,0.5)]">
        <Trophy className="w-12 h-12 text-[#ffb703] mx-auto mb-2 animate-bounce" />

        <h2 className="text-xl sm:text-2xl font-extrabold text-[#ffb703] tracking-widest mb-1">
          ¡VICTORIA TOTAL!
        </h2>
        <p className="text-xs font-mono text-[#a8dadc] mb-4">
          ¡SAM COMPLETÓ LOS 7 NIVELES Y DERROTÓ AL GRAN CACIQUE!
        </p>

        <div className="bg-[#1a1e29] border border-[#ffb703]/50 p-3.5 mb-5 text-xs font-mono">
          <div className="text-xs text-[#a8dadc]">PUNTUACIÓN DE LEYENDA:</div>
          <div className="text-2xl font-bold text-[#ffea00] tracking-wider my-1">{score}</div>
          <div className="text-[11px] text-[#2a9d8f] font-bold">
            CALIFICACIÓN COGNITIVA FINAL: CLASE {stats.grade}
          </div>
          <div className="text-[10px] text-[#ced4da] mt-1">
            Precisión: {Math.round(stats.accuracyPercentage)}% | Reacción: {Math.round(stats.averageReactionMs)}ms
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onOpenReport}
            className="flex-1 py-2.5 bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold text-xs tracking-wider border border-[#52b788] flex items-center justify-center gap-1.5"
          >
            <Brain className="w-4 h-4" />
            <span>CERTIFICADO COGNITIVO</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 bg-[#e76f51] hover:bg-[#f4a261] text-white font-bold text-xs tracking-wider border border-[#f4a261] flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>JUGAR DE NUEVO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
