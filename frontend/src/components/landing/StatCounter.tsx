"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  label: string;
  base: number;      // starting display value (shown immediately)
  target: number;    // count-up target on scroll-in
  suffix: string;
  liveIncrement: number; // how much to tick up every interval after count-up
  liveIntervalMs: number;
}

const STATS: StatItem[] = [
  { label: "Balls Recorded", base: 9840,  target: 10247, suffix: "+", liveIncrement: 1, liveIntervalMs: 1800 },
  { label: "Matches Played", base: 487,   target: 512,   suffix: "+", liveIncrement: 1, liveIntervalMs: 8000 },
  { label: "Teams Active",   base: 193,   target: 208,   suffix: "+", liveIncrement: 1, liveIntervalMs: 12000 },
  { label: "Uptime",         base: 98,    target: 99,    suffix: "%", liveIncrement: 0, liveIntervalMs: 0 },
];

function StatCard({ item, active }: { item: StatItem; active: boolean }) {
  const [count, setCount] = useState(item.base);
  const countRef = useRef(item.base);
  const liveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Count-up animation on scroll-in
  useEffect(() => {
    if (!active) return;

    const start = item.base;
    const end = item.target;
    const duration = 1600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);
      countRef.current = current;
      setCount(current);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, item.base, item.target]);

  // Live-increment ticks after count-up settles
  useEffect(() => {
    if (!active || item.liveIncrement === 0) return;

    // Start live ticking after the count-up finishes
    const delay = setTimeout(() => {
      liveRef.current = setInterval(() => {
        countRef.current += item.liveIncrement;
        setCount(countRef.current);
      }, item.liveIntervalMs);
    }, 1800);

    return () => {
      clearTimeout(delay);
      if (liveRef.current) clearInterval(liveRef.current);
    };
  }, [active, item.liveIncrement, item.liveIntervalMs]);

  return (
    <div className="flex flex-col items-center text-center px-6 py-6 relative group">
      {/* Live pulse dot for actively incrementing stats */}
      {item.liveIncrement > 0 && active && (
        <span className="absolute top-3 right-4 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-semibold">live</span>
        </span>
      )}
      <p className="text-4xl sm:text-5xl font-black tabular-nums bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent transition-all duration-150">
        {count.toLocaleString()}
        {item.suffix}
      </p>
      <p className="text-sm text-slate-500 font-medium mt-1.5">{item.label}</p>
    </div>
  );
}

export function StatCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border border-slate-100 rounded-3xl bg-white shadow-sm overflow-hidden"
    >
      {STATS.map((item) => (
        <StatCard key={item.label} item={item} active={active} />
      ))}
    </div>
  );
}
