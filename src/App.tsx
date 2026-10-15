/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine.ts';
import { GameState } from './types.ts';
import { HUD } from './components/HUD.tsx';
import { VirtualTouchControls } from './components/VirtualTouchControls.tsx';
import { TitleScreen } from './components/TitleScreen.tsx';
import { CognitiveReportModal } from './components/CognitiveReportModal.tsx';
import { GameOverModal, VictoryModal } from './components/EndGameModals.tsx';
import { CloudStorage } from './game/CloudStorage.ts';
import { soundSystem } from './engine/SoundSystem.ts';
import { inputManager } from './engine/InputManager.ts';
import { Pause, Play, Smartphone, Gamepad2 } from 'lucide-react';

export default function App() {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Engine ref to prevent re-instantiation
  const engineRef = useRef<GameEngine | null>(null);

  // React states for UI synchronization
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCognitiveModal, setShowCognitiveModal] = useState<boolean>(false);
  const [hudTick, setHudTick] = useState<number>(0);
  const [forceTouchControls, setForceTouchControls] = useState<boolean>(
    () => inputManager.showTouchControls || typeof window !== 'undefined' && window.innerWidth <= 1024
  );

  // Initialize engine once on mount
  useEffect(() => {
    // Focus window for immediate keyboard input capture
    window.focus();

    const checkMobileWidth = () => {
      if (window.innerWidth <= 1024 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
        setForceTouchControls(true);
        inputManager.setTouchControlsOverride(true);
      }
    };
    checkMobileWidth();
    window.addEventListener('resize', checkMobileWidth);

    const engine = new GameEngine();
    engineRef.current = engine;

    engine.onStateChange = (newState: GameState) => {
      setGameState(newState);
      if (newState === GameState.LEVEL_COMPLETE) {
        setShowCognitiveModal(true);
      }
    };

    engine.onHUDUpdate = () => {
      setHudTick(prev => prev + 1);
    };

    engine.start();

    // Blit from engine offscreen canvas (320x200) to display canvas at screen refresh
    let animId: number;
    const blitLoop = () => {
      const displayCanvas = displayCanvasRef.current;
      if (displayCanvas && engine.offscreenCanvas) {
        const ctx = displayCanvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            engine.offscreenCanvas,
            0,
            0,
            displayCanvas.width,
            displayCanvas.height
          );
        }
      }
      animId = requestAnimationFrame(blitLoop);
    };
    animId = requestAnimationFrame(blitLoop);

    return () => {
      cancelAnimationFrame(animId);
      engine.stop();
    };
  }, []);

  // Handle Canvas Click / Tap for Mouse attack or auto-start
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    window.focus();
    displayCanvasRef.current?.focus();
    if (gameState === GameState.PLAYING) {
      // Left click = Swing Club
      inputManager.setTouchAttack(true);
      setTimeout(() => inputManager.setTouchAttack(false), 80);
    } else if (gameState === GameState.TITLE) {
      handleStartNewGame();
    }
  };

  const handleStartNewGame = () => {
    if (!engineRef.current) return;
    engineRef.current.startNewGame();
    setGameState(GameState.PLAYING);
  };

  const handleContinueGame = () => {
    if (!engineRef.current) return;
    engineRef.current.continueGame();
    setGameState(GameState.PLAYING);
  };

  const handleSelectLevel = (levelIndex: number) => {
    if (!engineRef.current) return;
    engineRef.current.score = 0;
    engineRef.current.loadLevel(levelIndex);
    engineRef.current.state = GameState.PLAYING;
    setGameState(GameState.PLAYING);
  };

  const handleRestartLevel = () => {
    if (!engineRef.current) return;
    engineRef.current.loadLevel(engineRef.current.currentLevelIndex);
    engineRef.current.state = GameState.PLAYING;
    setGameState(GameState.PLAYING);
  };

  const handleResumeFromPause = () => {
    if (!engineRef.current) return;
    engineRef.current.state = GameState.PLAYING;
    setGameState(GameState.PLAYING);
  };

  const handleToggleSound = () => {
    const muted = soundSystem.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleTouchControls = () => {
    const newVal = !forceTouchControls;
    setForceTouchControls(newVal);
    inputManager.setTouchControlsOverride(newVal);
  };

  const savedProgress = CloudStorage.loadProgress();
  const engine = engineRef.current;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07080a] flex flex-col items-center justify-between select-none">
      {/* HUD Bar at Top */}
      {engine && (
        <HUD
          engine={engine}
          crtEnabled={crtEnabled}
          onToggleCRT={() => setCrtEnabled(!crtEnabled)}
          onOpenCognitiveModal={() => setShowCognitiveModal(true)}
          onToggleSound={handleToggleSound}
          isMuted={isMuted}
          onRestartLevel={handleRestartLevel}
        />
      )}

      {/* Main Game Stage (320x200 aspect ratio container) */}
      <main
        ref={containerRef}
        className="relative flex-1 w-full flex items-center justify-center p-1 sm:p-3 overflow-hidden"
      >
        {/* Aspect Ratio 320:200 Box (16:10 classic MS-DOS) */}
        <div className="relative w-full max-w-[1020px] max-h-full aspect-[16/10] bg-black shadow-2xl border-2 sm:border-4 border-[#24283b] flex items-center justify-center overflow-hidden">
          {/* Main Pixel Canvas */}
          <canvas
            ref={displayCanvasRef}
            id="prehistorix-main-canvas"
            width={320}
            height={200}
            onMouseDown={handleCanvasMouseDown}
            className="w-full h-full object-contain pixel-art cursor-crosshair block"
          />

          {/* CRT Scanlines & Vignette Layer (toggleable) */}
          {crtEnabled && (
            <div
              id="crt-layer"
              className="absolute inset-0 crt-overlay crt-vignette pointer-events-none z-10"
            />
          )}

          {/* Virtual Touch Joystick & Buttons (Adaptive for Mobile / Touch) */}
          {gameState === GameState.PLAYING && (
            <VirtualTouchControls forceVisible={forceTouchControls} />
          )}

          {/* Title Screen Overlay */}
          {gameState === GameState.TITLE && (
            <TitleScreen
              onStartNewGame={handleStartNewGame}
              onContinueGame={handleContinueGame}
              onSelectLevel={handleSelectLevel}
              savedProgress={savedProgress}
              highScore={engine?.highScore || 5000}
            />
          )}

          {/* Pause Screen Overlay */}
          {gameState === GameState.PAUSED && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center z-40 text-white select-none">
              <Pause className="w-12 h-12 text-[#ffb703] mb-3 animate-pulse" />
              <h2 className="text-xl font-bold tracking-widest text-[#ffb703] mb-2">
                JUEGO PAUSADO
              </h2>
              <p className="text-xs text-[#ced4da] font-mono mb-4">
                Presiona ESC / P o toca abajo para reanudar
              </p>
              <button
                id="btn-resume-game"
                onClick={handleResumeFromPause}
                className="px-6 py-2.5 bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold text-xs tracking-wider border border-[#52b788] flex items-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>REANUDAR PARTIDA</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Footer Info Bar with Controls quick toggle */}
      <footer className="w-full bg-[#12141a] border-t border-[#252a38] text-[10px] text-[#8d99ae] px-3 py-1 flex items-center justify-between font-mono z-30">
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-[#a8dadc]">TECLADO:</span>
          <span>◄► Moverse</span>
          <span>[ESPACIO] Garrote</span>
          <span>[Z/ALT] Salto</span>
          <span>[P] Pausa</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Touch Controls Toggle for Testing / Preference */}
          <button
            id="btn-toggle-touch-controls"
            onClick={handleToggleTouchControls}
            className={`px-2 py-0.5 rounded text-[9px] border flex items-center gap-1 transition-colors ${
              forceTouchControls
                ? 'bg-[#2a9d8f]/30 text-[#48cae4] border-[#2a9d8f]'
                : 'bg-[#1b1e28] text-[#8d99ae] border-[#333b4f]'
            }`}
            title="Alternar Controles Táctiles en Pantalla"
          >
            <Smartphone className="w-3 h-3" />
            <span>{forceTouchControls ? 'TÁCTIL: ON' : 'TÁCTIL: AUTO'}</span>
          </button>

          <span className="text-[9px] text-[#555b6e]">PREHISTORIX ARCADE ENGINE</span>
        </div>
      </footer>

      {/* Cognitive Report Modal */}
      {showCognitiveModal && engine && (
        <CognitiveReportModal
          stats={engine.cognitiveStats}
          score={engine.score}
          levelNumber={engine.currentLevelIndex + 1}
          onClose={() => {
            setShowCognitiveModal(false);
            if (gameState === GameState.LEVEL_COMPLETE) {
              engine.nextLevel();
            }
          }}
          onContinue={() => {
            setShowCognitiveModal(false);
            engine.nextLevel();
          }}
          isLevelEnd={gameState === GameState.LEVEL_COMPLETE}
        />
      )}

      {/* Game Over Modal */}
      {gameState === GameState.GAME_OVER && engine && (
        <GameOverModal
          score={engine.score}
          levelNumber={engine.currentLevelIndex + 1}
          stats={engine.cognitiveStats}
          onRetry={() => {
            engine.player.lives = 3;
            engine.loadLevel(engine.currentLevelIndex);
            engine.state = GameState.PLAYING;
            setGameState(GameState.PLAYING);
          }}
          onOpenReport={() => setShowCognitiveModal(true)}
          onReturnToTitle={() => {
            engine.state = GameState.TITLE;
            setGameState(GameState.TITLE);
          }}
        />
      )}

      {/* Victory Modal */}
      {gameState === GameState.VICTORY && engine && (
        <VictoryModal
          score={engine.score}
          stats={engine.cognitiveStats}
          onPlayAgain={() => {
            engine.startNewGame();
          }}
          onOpenReport={() => setShowCognitiveModal(true)}
        />
      )}
    </div>
  );
}
