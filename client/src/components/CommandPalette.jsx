import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Ctrl+C/K command palette — quick nav to dashboards pages (feature 18)
export default function CommandPalette({ open, onClose, items }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.label.toLowerCase().includes(q) || it.keywords?.toLowerCase().includes(q));
  }, [query, items]);

  useEffect(() => {
    if (open) { setQuery(''); setIndex(0); setTimeout(() => inputRef.current?.focus(), 10); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[index]) { onClose(); navigate(results[index].to); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, index, onClose, navigate]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 p-4 pt-24" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-[#121c16] dark:border dark:border-[#223027] shadow-2xl dark:shadow-black/60" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
          placeholder="Jump to page..."
          aria-label="Search pages"
          className="w-full border-b border-gray-200 dark:border-[#223027] px-4 py-3 text-sm outline-none"
        />
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-gray-400">No matches</p>}
          {results.map((it, i) => (
            <button
              key={it.to}
              onClick={() => { onClose(); navigate(it.to); }}
              onMouseEnter={() => setIndex(i)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${i === index ? 'bg-[#245C45] text-white' : 'text-gray-700 hover:bg-[#245C45]/5'}`}
            >
              <span>{results[i].icon || '›'}</span> {it.label}
              {it.hint && <span className={`ml-auto text-xs ${i === index ? 'text-white/70' : 'text-gray-400'}`}>{it.hint}</span>}
            </button>
          ))}
        </div>
        <div className="hidden border-t border-gray-200 dark:border-[#223027] px-4 py-2 text-[11px] text-gray-400 gap-2 sm:flex">
          <kbd className="rounded border px-1.5">↑↓</kbd> navigate <kbd className="ml-2 rounded border px-1.5">↵</kbd> open <kbd className="ml-2 rounded border px-1.5">Esc</kbd> close
        </div>
      </div>
    </div>
  );
}
