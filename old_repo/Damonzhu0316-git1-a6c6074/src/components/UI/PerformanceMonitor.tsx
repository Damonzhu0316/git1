import { useEffect, useRef } from 'react';

export default function PerformanceMonitor() {
  const fpsRef = useRef(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastTime.current;

      if (elapsed >= 1000) {
        fpsRef.current = Math.round((frameCount.current * 1000) / elapsed);
        frameCount.current = 0;
        lastTime.current = now;

        if (displayRef.current) {
          displayRef.current.textContent = `${fpsRef.current} FPS`;
          const color =
            fpsRef.current >= 55 ? '#44ff88' : fpsRef.current >= 30 ? '#f0c060' : '#ff4444';
          displayRef.current.style.color = color;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Only show in dev mode or with ?debug=1
  const isDev = import.meta.env.DEV;
  const isDebug = new URLSearchParams(window.location.search).has('debug');
  if (!isDev && !isDebug) return null;

  return (
    <div className="fixed top-2 right-2 z-[190] pointer-events-none">
      <div
        ref={displayRef}
        className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm"
        style={{ color: '#44ff88' }}
      >
        -- FPS
      </div>
    </div>
  );
}