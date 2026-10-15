/**
 * Authentic 1991 MS-DOS Title Screen for Prehistorik.
 * Features retro title art, continue game from cloud save,
 * level select for all 7 levels, and platform controls guide.
 */

import React, { useState } from 'react';
import { Play, RotateCcw, HelpCircle, Trophy, Volume2, ShieldAlert } from 'lucide-react';
import { SavedGameProgress } from '../types.ts';
import { soundSystem } from '../engine/SoundSystem.ts';

interface TitleScreenProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onSelectLevel: (lvlIndex: number) => void;
  savedProgress: SavedGameProgress | null;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartNewGame,
  onContinueGame,
  onSelectLevel,
  savedProgress,
  highScore
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const levelNames = [
    '1: Colinas Prehistóricas',
    '2: Nido del T-Rex (Jefe 1)',
    '3: Cavernas Ocultas',
    '4: Paso Glacial del Mamut (Jefe 2)',
    '5: Selva Volcánica',
    '6: Cráter del Dragón (Jefe 3)',
    '7: La Fortaleza del Gran Cacique'
  ];

  const handleStart = () => {
    soundSystem.startMusic('level');
    onStartNewGame();
  };

  const handleContinue = () => {
    soundSystem.startMusic('level');
    onContinueGame();
  };

  // Keyboard shortcut listener on title screen
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['Enter', 'Space', 'ArrowRight', 'ArrowLeft', 'KeyZ', 'KeyX'].includes(e.code) ||
          ['enter', ' ', 'arrowright', 'arrowleft', 'z', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="absolute inset-0 bg-[#0b0c10] flex flex-col items-center justify-center p-4 z-40 text-[#e0e6ed] select-none overflow-y-auto">
      {/* MS-DOS Header bar */}
      <div className="text-[10px] font-mono text-[#8d99ae] mb-2 tracking-widest text-center">
        *** PREHISTORIX ARCADE ENGINE V2.0 ***
      </div>

      {/* Retro Title Graphic */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#ffb703] via-[#fb8500] to-[#d90429] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-1">
          PREHISTORIX
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#4cc9f0]">
            STONE AGE ARCADE
          </span>
          <span className="px-1.5 py-0.5 bg-[#d90429] text-white text-[9px] font-bold rounded-xs">
            MS-DOS 320x200
          </span>
        </div>
      </div>

      {/* High Score Banner */}
      <div className="flex items-center gap-2 bg-[#161a22] border border-[#2c3245] px-4 py-1.5 mb-6 text-xs font-mono text-[#ffb703]">
        <Trophy className="w-3.5 h-3.5 text-[#ffea00]" />
        <span>RÉCORD MUNDIAL: {String(highScore).padStart(6, '0')}</span>
      </div>

      {/* Main Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs mb-6">
        {/* Continue Button if save data exists */}
        {savedProgress && (
          <button
            id="btn-continue-game"
            onClick={handleContinue}
            className="w-full py-3 bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold text-xs tracking-wider border-2 border-[#52b788] shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CONTINUAR (NIVEL {savedProgress.levelNumber})</span>
          </button>
        )}

        {/* Start New Game */}
        <button
          id="btn-new-game"
          onClick={handleStart}
          className="w-full py-3 bg-[#e76f51] hover:bg-[#f4a261] text-white font-bold text-xs tracking-wider border-2 border-[#f4a261] shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>NUEVA PARTIDA</span>
        </button>

        {/* Level Select */}
        <button
          id="btn-level-select"
          onClick={() => setShowLevelSelect(!showLevelSelect)}
          className="w-full py-2 bg-[#2b2d42] hover:bg-[#3d405b] text-[#f1faee] font-bold text-xs tracking-wider border border-[#4a4e69] flex items-center justify-center gap-2"
        >
          <span>ELEGIR ENTRE LOS 7 NIVELES</span>
        </button>

        {/* Controls / Instructions */}
        <button
          id="btn-help-controls"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full py-2 bg-[#1b1e28] hover:bg-[#252a38] text-[#8d99ae] hover:text-white font-bold text-xs tracking-wider border border-[#333b4f] flex items-center justify-center gap-2"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>CONTROLES Y REGLAS</span>
        </button>
      </div>

      {/* Level Selection Submenu */}
      {showLevelSelect && (
        <div className="w-full max-w-sm bg-[#161a22] border border-[#ffb703] p-3 mb-4 text-xs font-mono">
          <div className="text-[11px] font-bold text-[#ffb703] mb-2 text-center">
            SELECCIONA CUALQUIER NIVEL:
          </div>
          <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
            {levelNames.map((name, i) => (
              <button
                key={i}
                onClick={() => {
                  soundSystem.startMusic(i % 2 === 1 ? 'boss' : 'level');
                  onSelectLevel(i);
                }}
                className="text-left px-2.5 py-1.5 bg-[#212529] hover:bg-[#2a9d8f] text-white text-[10px] rounded-xs transition-colors truncate"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls Guide Modal */}
      {showHelp && (
        <div className="w-full max-w-sm bg-[#161a22] border border-[#48cae4] p-4 mb-4 text-[10px] font-mono leading-relaxed">
          <div className="text-xs font-bold text-[#48cae4] mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>MECÁNICAS OFICIALES PREHISTORIX:</span>
          </div>

          <div className="mb-2">
            <span className="text-[#ffb703] font-bold">TECLADO:</span>
            <ul className="list-disc pl-4 text-[#ced4da] mt-1 space-y-0.5">
              <li><b className="text-white">Flechas / WASD:</b> Movimiento con inercia retro.</li>
              <li><b className="text-white">Barra Espaciadora:</b> Golpe de garrote frontal.</li>
              <li><b className="text-white">Z / Alt / Flecha Arriba:</b> Salto arcade fijo.</li>
              <li><b className="text-white">P / Escape:</b> Pausar partida.</li>
            </ul>
          </div>

          <div className="mb-2">
            <span className="text-[#ffb703] font-bold">MÓVIL / PANTALLA TÁCTIL:</span>
            <p className="text-[#ced4da] mt-0.5">
              Se activa automáticamente un joystick analógico translúcido en la izquierda y botones virtuales táctiles grandes en la derecha.
            </p>
          </div>

          <div className="border-t border-[#333b4f] pt-2 text-[#e76f51]">
            <b>IMPORTANTE (COMIDA):</b> No podrás cruzar la cueva final de un nivel si tu barra de comida no está al 100%. ¡Caza y come toda la comida!
          </div>
        </div>
      )}

      {/* Audio notice */}
      <div className="text-[9px] text-[#8d99ae] font-mono flex items-center gap-1.5 mt-2">
        <Volume2 className="w-3 h-3 text-[#2a9d8f]" />
        <span>Audio AdLib/8-bit procedural activado al iniciar</span>
      </div>
    </div>
  );
};
