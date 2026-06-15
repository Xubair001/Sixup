"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
}

const STATS: StatItem[] = [
  { label: "Balls Recorded", value: 10000, suffix: "+", prefix: "" },
  { label: "Matches Played", value: 500, suffix: "+", prefix: "" },
  { label: "Teams Active", value: 200, suffix: "+", prefix: "" },
  { label: "Uptime", value: 98, suffix: "%", prefix: "" },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);

  return count;
}

function StatCard({ item, active }: { item: StatItem; active: boolean }) {
  const count = useCountUp(item.value, 1800, active);

  return (
    <div className="flex flex-col items-center text-center px-6 py-5">
      <p className="text-4xl sm:text-5xl font-black tabular-nums bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        {item.prefix}
        {count.toLocaleString()}
        {item.suffix}
      </p>
      <p className="text-sm text-slate-500 font-medium mt-1">{item.label}</p>
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
      { threshold: 0.3 }
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
