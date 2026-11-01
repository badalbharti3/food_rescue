import { useEffect, useState } from 'react';

function diffParts(target) {
  const ms = target - Date.now();
  const expired = ms <= 0;
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  return { expired, h, m, past: `${h}h ${m}m`, future: `${h}h ${m}m` };
}

// urgency pill for a target date: green >24h, amber 6-24h, red <6h, gray expired
export default function Countdown({ date, label = 'Pickup', className = '' }) {
  const target = new Date(date).getTime();
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);
  if (!Number.isFinite(target)) return null;
  const { expired, h } = diffParts(target);
  const styles = expired
    ? 'bg-gray-200 text-gray-500 dark:bg-[#223027] dark:text-[#8a978f]'
    : h <= 6
      ? 'bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900/60'
      : h <= 24
        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/60'
        : 'bg-[#245C45]/10 text-[#245C45] dark:bg-[#1e3327] dark:text-[#9dd0a6]';
  const text = expired ? `${label} passed` : `${label} in ${h.toFixed ? Math.floor(h) : h}h ${diffParts(target).m}m`;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles} ${className}`}>
      {expired ? '⏰' : '⏳'} {text}
    </span>
  );
}
