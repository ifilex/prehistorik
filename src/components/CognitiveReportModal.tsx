/**
 * Cognitive Hand-Eye Coordination & Reaction Timing Diagnostic Report.
 * Renders an authentic retro MS-DOS diagnostic screen analyzing the player's
 * motor reflex, precision, reaction latency, and overall cognitive score.
 */

import React from 'react';
import { CognitiveStats } from '../types.ts';
import { Brain, CheckCircle2, Award, Zap, Crosshair, Compass, X } from 'lucide-react';

interface CognitiveReportModalProps {
  stats: CognitiveStats;
  score: number;
  levelNumber: number;
  onClose: () => void;
  onContinue?: () => void;
  isLevelEnd?: boolean;
}

export const CognitiveReportModal: React.FC<CognitiveReportModalProps> = ({
  stats,
  score,
  levelNumber,
  onClose,
  onContinue,
  isLevelEnd = false
}) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'text-amber-400 border-amber-400 bg-amber-400/10';
      case 'A': return 'text-emerald-400 border-emerald-400 bg-emerald-400/10';
      case 'B': return 'text-cyan-400 border-cyan-400 bg-cyan-400/10';
      case 'C': return 'text-orange-400 border-orange-400 bg-orange-400/10';
      default: return 'text-rose-400 border-rose-400 bg-rose-400/10';
    }
  };

  const getReflexDiagnosis = (ms: number) => {
    if (ms < 220) return 'REFLEJO SOBREHUMANO: Tiempo de respuesta élite';
    if (ms < 270) return 'REFLEJO EXCELENTE: Coordinación visomotriz óptima';
    if (ms < 350) return 'REFLEJO BUENO: Capacidad de reacción promedio adecuada';
    return 'REFLEJO EN DESARROLLO: Recomendado practicar tiempos de esquiva';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-[#12141a] border-2 border-[#2a9d8f] shadow-[0_0_20px_rgba(42,157,143,0.35)] p-5 text-[#e0e6ed] relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#2a9d8f]/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#ffb703]" />
            <h2 className="text-sm font-bold tracking-wider text-[#ffb703]">
              EVALUACIÓN COGNITIVA V1.0 (MS-DOS)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8d99ae] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-[10px] text-[#8d99ae] mb-4 font-mono">
          ANÁLISIS NEUROMOTRIZ Y COORDINACIÓN OJO-MANO - NIVEL {levelNumber}
        </p>

        {/* Big Grade Badge & Score */}
        <div className="flex items-center justify-between bg-[#1b1e28] border border-[#333b4f] p-3 mb-4">
          <div>
            <span className="text-[10px] text-[#a8dadc] block">CALIFICACIÓN GLOBAL:</span>
            <span className="text-xs font-mono text-[#f1faee]">PUNTOS: {score}</span>
          </div>
          <div className={`px-4 py-1.5 border-2 font-mono font-bold text-2xl rounded-sm ${getGradeColor(stats.grade)}`}>
            {stats.grade}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[11px]">
          {/* Reaction Time */}
          <div className="bg-[#181b24] p-2.5 border border-[#2c3245]">
            <div className="flex items-center gap-1.5 text-[#e76f51] mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px]">TIEMPO REACCIÓN</span>
            </div>
            <div className="text-base font-bold text-white">
              {Math.round(stats.averageReactionMs)} ms
            </div>
            <span className="text-[9px] text-[#8d99ae]">Latencia visual/motora</span>
          </div>

          {/* Hit Accuracy */}
          <div className="bg-[#181b24] p-2.5 border border-[#2c3245]">
            <div className="flex items-center gap-1.5 text-[#2a9d8f] mb-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px]">PRECISIÓN GOLPE</span>
            </div>
            <div className="text-base font-bold text-white">
              {Math.round(stats.accuracyPercentage)}%
            </div>
            <span className="text-[9px] text-[#8d99ae]">
              {stats.successfulHits} de {stats.totalSwings} impactos
            </span>
          </div>

          {/* Secret Caves Discovered */}
          <div className="bg-[#181b24] p-2.5 border border-[#2c3245]">
            <div className="flex items-center gap-1.5 text-[#ffb703] mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px]">CUEVAS SECRETAS</span>
            </div>
            <div className="text-base font-bold text-white">
              {stats.secretCavesFound} / {stats.totalSecretCaves}
            </div>
            <span className="text-[9px] text-[#8d99ae]">Paredes falsas rotas</span>
          </div>

          {/* Overall Performance Index */}
          <div className="bg-[#181b24] p-2.5 border border-[#2c3245]">
            <div className="flex items-center gap-1.5 text-[#9b5de5] mb-1">
              <Award className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px]">ÍNDICE COGNITIVO</span>
            </div>
            <div className="text-base font-bold text-white">
              {stats.cognitiveScore} / 1000
            </div>
            <span className="text-[9px] text-[#8d99ae]">Agilidad prehistórica</span>
          </div>
        </div>

        {/* Diagnosis text */}
        <div className="bg-[#161a22] border-l-2 border-[#ffb703] p-2.5 mb-4 text-[10px] font-mono leading-relaxed text-[#ced4da]">
          {getReflexDiagnosis(stats.averageReactionMs)}
        </div>

        {/* Cloud Sync Stamp */}
        <div className="flex items-center gap-2 text-[10px] text-[#2a9d8f] mb-4 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2a9d8f]" />
          <span>PROGRESO Y MÉTRICAS GUARDADAS EN LA NUBE ✓</span>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          {isLevelEnd && onContinue ? (
            <button
              onClick={onContinue}
              className="w-full py-2.5 bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold text-xs tracking-wider border border-[#48cae4] transition-transform active:scale-98"
            >
              CONTINUAR AL SIGUIENTE NIVEL ▶
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 bg-[#2b2d42] hover:bg-[#3d405b] text-white font-bold text-xs tracking-wider border border-[#4a4e69]"
            >
              VOLVER A LA PARTIDA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
