'use client';

import React, { useEffect, useRef } from 'react';
import { SoundEngine } from './gameAudio';

export interface RoulettePocket {
  num: number;
  color: 'red' | 'black' | 'green';
}

export const EUROPEAN_WHEEL_NUMBERS: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export const RED_NUMBERS: number[] = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

interface RouletteWheelCanvasProps {
  isSpinning: boolean;
  winningNumber: number | null;
  onSpinComplete: () => void;
  soundEnabled?: boolean;
}

export default function RouletteWheelCanvas({
  isSpinning,
  winningNumber,
  onSpinComplete,
  soundEnabled = true,
}: RouletteWheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Wheel physics state
  const wheelAngleRef = useRef<number>(0);
  const ballAngleRef = useRef<number>(0);
  const ballRadiusRef = useRef<number>(125);
  const isAnimatingRef = useRef<boolean>(false);
  const spinStartTimeRef = useRef<number>(0);
  const targetPocketAngleRef = useRef<number>(0);

  const numPockets = EUROPEAN_WHEEL_NUMBERS.length; // 37
  const sliceAngle = (2 * Math.PI) / numPockets;

  // Draw the entire wheel and ball on canvas
  const drawWheel = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    wheelAngle: number,
    ballAngle: number,
    ballRadius: number,
    hasBall: boolean
  ) => {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 8;

    // 1. Mahogany Wood Outer Bezel
    const woodGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.82,
      centerX,
      centerY,
      radius
    );
    woodGrad.addColorStop(0, '#2e1005');
    woodGrad.addColorStop(0.5, '#451a03');
    woodGrad.addColorStop(0.9, '#1c0a00');
    woodGrad.addColorStop(1, '#0f0500');

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = woodGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.restore();

    // Outer Brass Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.98, 0, Math.PI * 2);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. Ball Track Ring (Dark Metallic)
    const trackGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.78,
      centerX,
      centerY,
      radius * 0.93
    );
    trackGrad.addColorStop(0, '#1c1917');
    trackGrad.addColorStop(0.5, '#292524');
    trackGrad.addColorStop(1, '#0c0a09');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.93, 0, Math.PI * 2);
    ctx.fillStyle = trackGrad;
    ctx.fill();

    // Brass Track inner lip
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.81, 0, Math.PI * 2);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Rotating Wheel Head (Pocket Ring + Bowl)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(wheelAngle);

    const pocketOuterR = radius * 0.8;
    const pocketInnerR = radius * 0.54;

    // Draw 37 numbered pocket sectors
    for (let i = 0; i < numPockets; i++) {
      const num = EUROPEAN_WHEEL_NUMBERS[i];
      const startAngle = i * sliceAngle - sliceAngle / 2;
      const endAngle = startAngle + sliceAngle;

      let pocketColor = '#18181b'; // Black
      if (num === 0) pocketColor = '#059669'; // Emerald Green
      else if (RED_NUMBERS.includes(num)) pocketColor = '#dc2626'; // Red

      // Fill Sector
      ctx.beginPath();
      ctx.arc(0, 0, pocketOuterR, startAngle, endAngle);
      ctx.arc(0, 0, pocketInnerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = pocketColor;
      ctx.fill();

      // Brass / Silver Divider Fret
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(startAngle) * pocketInnerR,
        Math.sin(startAngle) * pocketInnerR
      );
      ctx.lineTo(
        Math.cos(startAngle) * pocketOuterR,
        Math.sin(startAngle) * pocketOuterR
      );
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Number Label (Rotated outward)
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);
      ctx.translate(pocketInnerR + (pocketOuterR - pocketInnerR) * 0.52, 0);
      ctx.rotate(Math.PI / 2); // Text readable radially

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 2;
      ctx.fillText(`${num}`, 0, 0);
      ctx.restore();
    }

    // Inner Cone Bowl
    const bowlR = pocketInnerR;
    const bowlGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bowlR);
    bowlGrad.addColorStop(0, '#fef08a');
    bowlGrad.addColorStop(0.3, '#ca8a04');
    bowlGrad.addColorStop(0.7, '#854d0e');
    bowlGrad.addColorStop(1, '#451a03');

    ctx.beginPath();
    ctx.arc(0, 0, bowlR, 0, Math.PI * 2);
    ctx.fillStyle = bowlGrad;
    ctx.fill();

    // 8 Diamond Ball Deflectors on inner lip
    for (let d = 0; d < 8; d++) {
      const dAngle = (d * Math.PI) / 4;
      const dR = bowlR * 0.88;
      ctx.save();
      ctx.rotate(dAngle);
      ctx.translate(dR, 0);
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, 3);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.fill();
      ctx.restore();
    }

    // Center Chrome Turret & 4-prong spinner cross
    const turretR = bowlR * 0.42;
    const turretGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, turretR);
    turretGrad.addColorStop(0, '#ffffff');
    turretGrad.addColorStop(0.4, '#cbd5e1');
    turretGrad.addColorStop(0.8, '#64748b');
    turretGrad.addColorStop(1, '#334155');

    ctx.beginPath();
    ctx.arc(0, 0, turretR, 0, Math.PI * 2);
    ctx.fillStyle = turretGrad;
    ctx.fill();

    // 4 Chrome Handles / Prongs
    for (let h = 0; h < 4; h++) {
      const hAngle = (h * Math.PI) / 2;
      ctx.save();
      ctx.rotate(hAngle);
      ctx.beginPath();
      ctx.rect(0, -2.5, turretR * 1.5, 5);
      ctx.fillStyle = '#f1f5f9';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.fill();

      // Ball knob at end of handle
      ctx.beginPath();
      ctx.arc(turretR * 1.5, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.restore();
    }

    // Center Cap
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    ctx.restore(); // Restore rotating wheel

    // 4. White Ball (Rendered in stationary world coords)
    if (hasBall) {
      const ballX = centerX + Math.cos(ballAngle) * ballRadius;
      const ballY = centerY + Math.sin(ballAngle) * ballRadius;

      // Ball Shadow
      ctx.beginPath();
      ctx.arc(ballX + 2, ballY + 2, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fill();

      // Ball Ivory Surface
      const ballGrad = ctx.createRadialGradient(
        ballX - 1.5,
        ballY - 1.5,
        1,
        ballX,
        ballY,
        5
      );
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.7, '#f8fafc');
      ballGrad.addColorStop(1, '#cbd5e1');

      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fillStyle = ballGrad;
      ctx.fill();
    }
  };

  // Initial render when idle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2 - 8;

    // Default ball resting position
    const pocketR = radius * 0.67;
    drawWheel(
      ctx,
      width,
      height,
      wheelAngleRef.current,
      ballAngleRef.current,
      pocketR,
      true
    );
  }, []);

  // Animation Loop when spinning
  useEffect(() => {
    if (!isSpinning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isAnimatingRef.current = true;
    spinStartTimeRef.current = performance.now();

    const duration = 2800; // 2.8s realistic deceleration spin
    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2 - 8;
    const outerTrackR = radius * 0.88;
    const innerPocketR = radius * 0.67;

    // Calculate target angle on wheel for the winning number
    const winNum = winningNumber !== null ? winningNumber : 0;
    const pocketIndex = EUROPEAN_WHEEL_NUMBERS.indexOf(winNum);
    const targetSectorAngle = pocketIndex >= 0 ? pocketIndex * sliceAngle : 0;

    // Initial velocities
    const startWheelAngle = wheelAngleRef.current;
    const totalWheelRotations = Math.PI * 4; // Wheel rotates ~2 full turns
    const totalBallRotations = -Math.PI * 14; // Ball orbits ~7 times opposite direction

    let lastTickTime = 0;
    let animId: number;

    const animate = (time: number) => {
      if (!isAnimatingRef.current) return;
      const elapsed = time - spinStartTimeRef.current;
      const progress = Math.min(1, elapsed / duration);

      // Deceleration easing curve (cubic-bezier out)
      const easeOut = 1 - Math.pow(1 - progress, 3.2);

      // Current wheel rotation
      const currentWheelAngle = startWheelAngle + totalWheelRotations * easeOut;
      wheelAngleRef.current = currentWheelAngle;

      // Ball Angle and Radius (spiraling inward)
      let currentBallRadius = outerTrackR;
      let currentBallAngle = 0;

      if (progress < 0.65) {
        // Outer track fast orbit
        const trackProgress = progress / 0.65;
        const ballEase = 1 - Math.pow(1 - trackProgress, 2.4);
        currentBallAngle = totalBallRotations * ballEase;
        currentBallRadius = outerTrackR;
      } else {
        // Dropping into pocket ring
        const dropProgress = (progress - 0.65) / 0.35;
        const dropEase = 1 - Math.pow(1 - dropProgress, 2);
        currentBallRadius =
          outerTrackR - (outerTrackR - innerPocketR) * dropEase;

        // Align ball to target sector on wheel
        const targetWorldAngle = currentWheelAngle + targetSectorAngle;
        currentBallAngle =
          totalBallRotations * 0.85 + (targetWorldAngle - totalBallRotations * 0.85) * dropEase;
      }

      ballAngleRef.current = currentBallAngle;
      ballRadiusRef.current = currentBallRadius;

      // Peg / Ball Tick audio
      if (progress < 0.85 && time - lastTickTime > 80 + progress * 160) {
        SoundEngine.playWheelTick(soundEnabled);
        lastTickTime = time;
      }

      drawWheel(
        ctx,
        width,
        height,
        currentWheelAngle,
        currentBallAngle,
        currentBallRadius,
        true
      );

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        // Finished
        isAnimatingRef.current = false;
        SoundEngine.playBallDrop(soundEnabled);
        // Lock ball into exact pocket position
        const finalWorldAngle = currentWheelAngle + targetSectorAngle;
        drawWheel(
          ctx,
          width,
          height,
          currentWheelAngle,
          finalWorldAngle,
          innerPocketR,
          true
        );
        onSpinComplete();
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      isAnimatingRef.current = false;
      cancelAnimationFrame(animId);
    };
  }, [isSpinning, winningNumber]);

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        width={310}
        height={310}
        className="w-[270px] h-[270px] sm:w-[310px] sm:h-[310px] rounded-full shadow-2xl filter drop-shadow-xl"
      />
    </div>
  );
}
