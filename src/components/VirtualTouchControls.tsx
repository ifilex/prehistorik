/**
 * Adaptive Virtual Touch Controls for Mobile & Tablet Devices:
 * Features an authentic semi-transparent floating analog Joystick on the left
 * and large arcade touch buttons (GOLPE, SALTO) on the right.
 * Auto-detects touch screens and mobile/tablet viewport widths (<= 1024px).
 */

import React, { useRef, useState, useEffect } from 'react';
import { inputManager } from '../engine/InputManager.ts';

interface VirtualTouchControlsProps {
  forceVisible?: boolean;
}

export const VirtualTouchControls: React.FC<VirtualTouchControlsProps> = ({ forceVisible }) => {
  const [stickActive, setStickActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [attackActive, setAttackActive] = useState(false);
  const [jumpActive, setJumpActive] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => {
    return (
      forceVisible ||
      inputManager.showTouchControls ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (window.innerWidth <= 1024)
    );
  });

  const stickBaseRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);

  // Monitor resize / tablet orientation changes
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = (
        forceVisible ||
        inputManager.showTouchControls ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (window.innerWidth <= 1024)
      );
      setIsMobileOrTablet(isMobile);
    };

    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    checkDevice();

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, [forceVisible]);

  // If not mobile/tablet and not force-enabled, do not render
  if (!isMobileOrTablet) {
    return null;
  }

  // --- Pointer Handlers for Virtual Joystick ---
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setStickActive(true);
    updateStickPosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stickActive || activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateStickPosition(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    activePointerIdRef.current = null;
    setStickActive(false);
    setStickPos({ x: 0, y: 0 });
    inputManager.setTouchStick(0, 0);
  };

  const updateStickPosition = (clientX: number, clientY: number) => {
    if (!stickBaseRef.current) return;
    const rect = stickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = (rect.width / 2) - 8;
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * distance;
    const clampedY = Math.sin(angle) * distance;

    setStickPos({ x: clampedX, y: clampedY });

    // Normalize to -1 to 1 for game engine
    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;
    inputManager.setTouchStick(normX, normY);
  };

  return (
    <div
      id="virtual-touch-controls-layer"
      className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-3 sm:p-5 pb-5 select-none"
    >
      {/* Left: Glowing Retro Virtual Joystick */}
      <div className="pointer-events-auto flex flex-col items-center">
        <div
          ref={stickBaseRef}
          id="touch-joystick-base"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-32 h-32 rounded-full border-2 backdrop-blur-xs relative flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors touch-none ${
            stickActive
              ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
              : 'bg-black/35 border-white/30'
          }`}
        >
          {/* Directional arrow cues */}
          <div className="absolute top-2 text-amber-300/60 font-bold text-xs">▲</div>
          <div className="absolute bottom-2 text-amber-300/60 font-bold text-xs">▼</div>
          <div className="absolute left-2.5 text-amber-300/60 font-bold text-xs">◀</div>
          <div className="absolute right-2.5 text-amber-300/60 font-bold text-xs">▶</div>

          {/* Center deadzone ring */}
          <div className="w-10 h-10 rounded-full border border-white/20 pointer-events-none" />

          {/* Floating Thumb Stick Knob */}
          <div
            id="touch-joystick-knob"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`
            }}
            className={`w-14 h-14 rounded-full border-2 shadow-lg flex items-center justify-center pointer-events-none transition-transform duration-75 ${
              stickActive
                ? 'bg-amber-500 border-amber-200 shadow-[0_0_15px_#fbbf24]'
                : 'bg-amber-600/70 border-amber-300/80'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-amber-200/90 shadow-inner" />
          </div>
        </div>
        <span className="text-[10px] text-amber-300/80 mt-1 font-mono font-bold tracking-wider drop-shadow">
          JOYSTICK
        </span>
      </div>

      {/* Right: Arcade Action Buttons (GOLPE y SALTO) */}
      <div className="pointer-events-auto flex items-center gap-3 sm:gap-5 mr-1 mb-1">
        {/* ATTACK / GOLPE BUTTON */}
        <div className="flex flex-col items-center">
          <button
            id="btn-touch-attack"
            onPointerDown={(e) => {
              e.preventDefault();
              setAttackActive(true);
              inputManager.setTouchAttack(true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setAttackActive(false);
              inputManager.setTouchAttack(false);
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              setAttackActive(false);
              inputManager.setTouchAttack(false);
            }}
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 backdrop-blur-xs flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-95 touch-none ${
              attackActive
                ? 'bg-rose-500 border-white shadow-[0_0_25px_#f43f5e] scale-95'
                : 'bg-rose-600/75 border-rose-300 shadow-[0_0_12px_rgba(225,29,72,0.4)]'
            }`}
          >
            <span className="font-extrabold text-white text-xs sm:text-sm tracking-wider drop-shadow">
              GOLPE
            </span>
            <span className="text-[9px] text-rose-200/80 font-mono mt-0.5">GARROTE</span>
          </button>
        </div>

        {/* JUMP / SALTO BUTTON */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <button
            id="btn-touch-jump"
            onPointerDown={(e) => {
              e.preventDefault();
              setJumpActive(true);
              inputManager.setTouchJump(true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setJumpActive(false);
              inputManager.setTouchJump(false);
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              setJumpActive(false);
              inputManager.setTouchJump(false);
            }}
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 backdrop-blur-xs flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-95 touch-none ${
              jumpActive
                ? 'bg-emerald-500 border-white shadow-[0_0_25px_#10b981] scale-95'
                : 'bg-emerald-600/75 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
            }`}
          >
            <span className="font-extrabold text-white text-xs sm:text-sm tracking-wider drop-shadow">
              SALTO
            </span>
            <span className="text-[9px] text-emerald-200/80 font-mono mt-0.5">ARRIBA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
