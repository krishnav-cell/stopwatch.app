import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Square, Eye, RotateCcw, Keyboard, ShieldAlert, CheckCircle2 } from 'lucide-react';

export type StopwatchStatus = 'READY' | 'RUNNING' | 'STOPPED';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface StopwatchSimulatorProps {
  onTriggerTestLog?: (testName: string, result: string, success: boolean) => void;
}

export const StopwatchSimulator: React.FC<StopwatchSimulatorProps> = ({ onTriggerTestLog }) => {
  // ---------------------------------------------------------------------------
  // Core Stopwatch State (Single Source of Truth)
  // ---------------------------------------------------------------------------
  const [status, setStatus] = useState<StopwatchStatus>('READY');
  const [displayTimeStr, setDisplayTimeStr] = useState<string>('00:00:00.000');
  const [lastRecordedTime, setLastRecordedTime] = useState<string>('00:00:00.000');
  const [toastMessage, setToastMessage] = useState<string>('System Initialized — Ready for Precision Timing');
  const [toastColor, setToastColor] = useState<string>('#92929D');

  // Internal high-precision timing refs (independent of React state cycle)
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const hasStartedOnceRef = useRef<boolean>(false);

  // Animation refs
  const arcAngleRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const toastTimeoutRef = useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // Time Formatting Helper (Microsecond-accurate HH:MM:SS.mmm)
  // ---------------------------------------------------------------------------
  const formatElapsedTime = useCallback((seconds: number): string => {
    if (seconds < 0) seconds = 0;
    const totalMilliseconds = Math.floor(seconds * 1000);
    const millis = totalMilliseconds % 1000;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const secs = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const mins = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    const pad = (num: number, digits: number) => String(num).padStart(digits, '0');
    return `${pad(hours, 2)}:${pad(mins, 2)}:${pad(secs, 2)}.${pad(millis, 3)}`;
  }, []);

  // ---------------------------------------------------------------------------
  // User Feedback Toast
  // ---------------------------------------------------------------------------
  const showToast = useCallback((message: string, color: string = '#FFFFFF') => {
    setToastMessage(message);
    setToastColor(color);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage('CHRONO BLACK Precision System Active');
      setToastColor('#92929D');
    }, 4500);
  }, []);

  // ---------------------------------------------------------------------------
  // Operation 1: START
  // ---------------------------------------------------------------------------
  const startStopwatch = useCallback(() => {
    // TEST 2: Press Start twice while running
    if (isRunningRef.current) {
      showToast('Warning: Stopwatch is already running.', '#FFB020');
      onTriggerTestLog?.('Double Start Check', 'Rejected second start attempt. Prior time preserved.', true);
      return;
    }

    // High-precision clock timestamp in milliseconds converted to seconds
    startTimeRef.current = performance.now() / 1000;
    isRunningRef.current = true;
    hasStartedOnceRef.current = true;

    setStatus('RUNNING');
    showToast('Stopwatch running — measuring elapsed time.', '#00FF88');
    onTriggerTestLog?.('Start Stopwatch', 'Started high-precision time measurement loop.', true);
  }, [showToast, onTriggerTestLog]);

  // ---------------------------------------------------------------------------
  // Operation 2: STOP
  // ---------------------------------------------------------------------------
  const stopStopwatch = useCallback(() => {
    // TEST 1: Press Stop before pressing Start
    if (!hasStartedOnceRef.current) {
      showToast('Warning: Start the stopwatch before stopping it.', '#FF4560');
      onTriggerTestLog?.('Stop Before Start Check', 'Properly rejected stop operation in pristine state.', true);
      return;
    }

    // TEST 3: Press Stop twice while stopped
    if (!isRunningRef.current) {
      showToast('Notice: Stopwatch is already stopped.', '#FFB020');
      onTriggerTestLog?.('Double Stop Check', 'Rejected redundant stop operation.', true);
      return;
    }

    const currentNow = performance.now() / 1000;
    elapsedTimeRef.current += (currentNow - startTimeRef.current);
    isRunningRef.current = false;

    const formatted = formatElapsedTime(elapsedTimeRef.current);
    setDisplayTimeStr(formatted);
    setLastRecordedTime(formatted);
    setStatus('STOPPED');
    showToast(`Stopwatch stopped at ${formatted}.`, '#FFB020');
    onTriggerTestLog?.('Stop Stopwatch', `Frozen at exact elapsed time: ${formatted}`, true);
  }, [formatElapsedTime, showToast, onTriggerTestLog]);

  // ---------------------------------------------------------------------------
  // Operation 3: DISPLAY
  // ---------------------------------------------------------------------------
  const displayTime = useCallback(() => {
    // TEST 4: Press Display before Start
    if (!hasStartedOnceRef.current && elapsedTimeRef.current === 0) {
      showToast('No time recorded. Press Start to begin.', '#92929D');
      onTriggerTestLog?.('Display Before Start Check', 'Informed user no time has been recorded yet.', true);
      return;
    }

    let currentSecs = elapsedTimeRef.current;
    if (isRunningRef.current) {
      const currentNow = performance.now() / 1000;
      currentSecs = elapsedTimeRef.current + (currentNow - startTimeRef.current);
    }

    const formatted = formatElapsedTime(currentSecs);
    setDisplayTimeStr(formatted);
    setLastRecordedTime(formatted);

    const stateDesc = isRunningRef.current ? 'Running' : 'Recorded';
    showToast(`${stateDesc} reading captured: ${formatted}`, '#00F5FF');
    onTriggerTestLog?.('Display Time', `Explicitly captured snapshot: ${formatted}`, true);
  }, [formatElapsedTime, showToast, onTriggerTestLog]);

  // ---------------------------------------------------------------------------
  // Operation 4: RESET
  // ---------------------------------------------------------------------------
  const resetStopwatch = useCallback(() => {
    isRunningRef.current = false;
    hasStartedOnceRef.current = false;
    startTimeRef.current = 0;
    elapsedTimeRef.current = 0;
    arcAngleRef.current = 0;

    setDisplayTimeStr('00:00:00.000');
    setStatus('READY');
    showToast('Stopwatch reset to 00:00:00.000. Ready for new run.', '#8B5CF6');
    onTriggerTestLog?.('Reset Stopwatch', 'Reset elapsed time to zero and restored initial ready state.', true);
  }, [showToast, onTriggerTestLog]);

  // ---------------------------------------------------------------------------
  // Keyboard Shortcuts (Space, D, R, Escape)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut interference if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunningRef.current) {
          stopStopwatch();
        } else {
          startStopwatch();
        }
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        displayTime();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetStopwatch();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        showToast('Escape detected — Session safe', '#92929D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startStopwatch, stopStopwatch, displayTime, resetStopwatch, showToast]);

  // ---------------------------------------------------------------------------
  // Canvas Rendering & Animation Loop (Ticks, Glow, Arc & Particles)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize 24 subtle background particles
    const width = canvas.width;
    const height = canvas.height;
    const particles: Particle[] = [];
    const colors = ['#003344', '#004855', '#0a2b38'];

    for (let i = 0; i < 24; i++) {
      particles.push({
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 1.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    particlesRef.current = particles;

    let lastDisplayUpdate = 0;

    const render = (timeMs: number) => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = 108;

      // 1. Draw floating ambient particles
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 15 || p.x >= width - 15) p.vx *= -1;
        if (p.y <= 15 || p.y >= height - 15) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Circular Track Background
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0B0B0F';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1C1C24';
      ctx.stroke();

      // 3. Radial Tick Marks (60 ticks like an analog stopwatch)
      for (let i = 0; i < 60; i++) {
        const angleRad = (i * 6 * Math.PI) / 180;
        const isMajor = i % 5 === 0;
        const innerR = radius - (isMajor ? 10 : 5);
        const outerR = radius - 3;

        const x1 = cx + innerR * Math.cos(angleRad);
        const y1 = cy + innerR * Math.sin(angleRad);
        const x2 = cx + outerR * Math.cos(angleRad);
        const y2 = cy + outerR * Math.sin(angleRad);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor ? '#005566' : '#1C1C24';
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();
      }

      // 4. Rotating Neon Cyan Running Arc
      if (isRunningRef.current) {
        arcAngleRef.current = (arcAngleRef.current + 3.8) % 360;
      }
      const arcInset = 6;
      const arcR = radius - arcInset;
      const startRad = (arcAngleRef.current * Math.PI) / 180;
      const endRad = startRad + (Math.PI / 2); // 90 degree sweep

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, startRad, endRad);
      ctx.strokeStyle = isRunningRef.current ? '#00F5FF' : '#005566';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      if (isRunningRef.current) {
        ctx.shadowColor = '#00F5FF';
        ctx.shadowBlur = 10;
      }
      ctx.stroke();
      ctx.restore();

      // 5. Update high-frequency display string (~15ms)
      if (isRunningRef.current) {
        const currentNow = performance.now() / 1000;
        const totalElapsed = elapsedTimeRef.current + (currentNow - startTimeRef.current);
        if (timeMs - lastDisplayUpdate > 15) {
          setDisplayTimeStr(formatElapsedTime(totalElapsed));
          lastDisplayUpdate = timeMs;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [formatElapsedTime]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Determine status color badge
  const getStatusColor = () => {
    switch (status) {
      case 'RUNNING':
        return '#00FF88';
      case 'STOPPED':
        return '#FFB020';
      default:
        return '#92929D';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4">
      {/* 850 x 650 Centered Window Container */}
      <div className="w-full max-w-[850px] min-h-[620px] bg-[#050505] rounded-xl border border-[#1C1C24] shadow-2xl flex flex-col justify-between overflow-hidden relative">
        {/* Subtle Window Title Bar Decor */}
        <div className="w-full bg-[#0B0B0F] border-b border-[#1C1C24] px-4 py-2 flex items-center justify-between text-xs text-[#92929D]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4560]/70 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB020]/70 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88]/70 inline-block"></span>
            <span className="ml-2 font-mono text-[11px] text-[#92929D] font-medium tracking-wide">
              CHRONO BLACK | Stopwatch
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Tkinter 8.6 Engine</span>
            <span>·</span>
            <span>time.perf_counter()</span>
          </div>
        </div>

        {/* Inner Content Area (850x600 active) */}
        <div className="flex-1 flex flex-col items-center justify-between px-6 py-5">
          {/* Header */}
          <div className="w-full text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white">
              CHRONO BLACK
            </h1>
            <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#92929D] uppercase mt-0.5 mb-2">
              PRECISION TIMEKEEPING SYSTEM
            </p>
            <div className="h-[2px] w-48 sm:w-64 mx-auto bg-[#00F5FF] shadow-[0_0_8px_#00F5FF]"></div>
          </div>

          {/* Toast / Warning Notification Banner */}
          <div className="h-6 w-full max-w-lg mx-auto flex items-center justify-center text-center mt-2 px-3">
            <p
              className="text-xs font-medium transition-colors duration-200 truncate"
              style={{ color: toastColor }}
            >
              {toastMessage}
            </p>
          </div>

          {/* Central Stage: Canvas Circular Timer & Monospaced Digital Readout */}
          <div className="relative my-1 flex items-center justify-center">
            {/* Background HTML5 Canvas for rotating arc, tick marks, and ambient particles */}
            <canvas
              ref={canvasRef}
              width={460}
              height={260}
              className="block max-w-full"
            />

            {/* Centered Large Monospaced Digital Timer with Glowing Neon Shadow */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <div
                className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white transition-all duration-300 ${
                  status === 'RUNNING'
                    ? 'drop-shadow-[0_0_14px_rgba(0,245,255,0.85)]'
                    : 'drop-shadow-[0_0_5px_rgba(0,85,102,0.4)]'
                }`}
                style={{
                  fontFamily: 'Consolas, "JetBrains Mono", monospace',
                }}
              >
                {displayTimeStr}
              </div>
              <span className="text-[9px] font-mono tracking-widest text-[#92929D] font-bold mt-2 uppercase">
                {status === 'RUNNING' ? 'RECORDING ELAPSED' : 'ELAPSED TIME'}
              </span>
            </div>
          </div>

          {/* Status & Telemetry Card */}
          <div className="bg-[#101014] border border-[#1C1C24] rounded-lg px-6 py-2.5 flex items-center gap-6 shadow-md">
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  status === 'RUNNING' ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: getStatusColor() }}
              />
              <span className="text-xs font-semibold text-[#92929D]">STATUS:</span>
              <span
                className="text-xs font-bold tracking-wider"
                style={{ color: getStatusColor() }}
              >
                {status}
              </span>
            </div>

            <div className="w-px h-4 bg-[#1C1C24]" />

            {/* Last Recorded Time */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#92929D]">LAST RECORDED TIME:</span>
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                {lastRecordedTime}
              </span>
            </div>
          </div>

          {/* Four Main Operations: START | STOP | DISPLAY | RESET */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-2 flex-wrap">
            {/* START */}
            <button
              onClick={startStopwatch}
              disabled={status === 'RUNNING'}
              className={`min-w-[105px] px-4 py-2.5 rounded text-xs font-bold tracking-wider border transition-all duration-150 flex items-center justify-center gap-1.5 ${
                status === 'RUNNING'
                  ? 'bg-[#101014] text-[#555562] border-[#1C1C24] cursor-not-allowed opacity-60'
                  : 'bg-[#101014] text-[#00FF88] border-[#00FF88]/40 hover:bg-[#00FF88]/10 hover:border-[#00FF88] hover:shadow-[0_0_12px_rgba(0,255,136,0.3)] active:scale-95'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              START
            </button>

            {/* STOP */}
            <button
              onClick={stopStopwatch}
              disabled={status !== 'RUNNING'}
              className={`min-w-[105px] px-4 py-2.5 rounded text-xs font-bold tracking-wider border transition-all duration-150 flex items-center justify-center gap-1.5 ${
                status !== 'RUNNING'
                  ? 'bg-[#101014] text-[#555562] border-[#1C1C24] cursor-not-allowed opacity-60'
                  : 'bg-[#101014] text-[#FF4560] border-[#FF4560]/40 hover:bg-[#FF4560]/10 hover:border-[#FF4560] hover:shadow-[0_0_12px_rgba(255,69,96,0.3)] active:scale-95'
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              STOP
            </button>

            {/* DISPLAY */}
            <button
              onClick={displayTime}
              className="min-w-[105px] px-4 py-2.5 rounded text-xs font-bold tracking-wider border bg-[#101014] text-[#00F5FF] border-[#00F5FF]/40 hover:bg-[#00F5FF]/10 hover:border-[#00F5FF] hover:shadow-[0_0_12px_rgba(0,245,255,0.3)] active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              DISPLAY
            </button>

            {/* RESET */}
            <button
              onClick={resetStopwatch}
              className="min-w-[105px] px-4 py-2.5 rounded text-xs font-bold tracking-wider border bg-[#101014] text-[#8B5CF6] border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6] hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>
          </div>

          {/* Keyboard Shortcuts Hint Bar */}
          <div className="w-full text-center text-[11px] text-[#555562] pt-1 border-t border-[#1C1C24]/60">
            <span className="font-semibold text-[#737380]">HOTKEYS:</span>{' '}
            <kbd className="px-1.5 py-0.5 bg-[#101014] border border-[#1C1C24] rounded text-[10px] text-[#92929D] font-mono">
              Space
            </kbd>{' '}
            Start / Stop &nbsp;·&nbsp;{' '}
            <kbd className="px-1.5 py-0.5 bg-[#101014] border border-[#1C1C24] rounded text-[10px] text-[#92929D] font-mono">
              D
            </kbd>{' '}
            Display &nbsp;·&nbsp;{' '}
            <kbd className="px-1.5 py-0.5 bg-[#101014] border border-[#1C1C24] rounded text-[10px] text-[#92929D] font-mono">
              R
            </kbd>{' '}
            Reset &nbsp;·&nbsp;{' '}
            <kbd className="px-1.5 py-0.5 bg-[#101014] border border-[#1C1C24] rounded text-[10px] text-[#92929D] font-mono">
              Esc
            </kbd>{' '}
            Exit
          </div>
        </div>
      </div>
    </div>
  );
};
