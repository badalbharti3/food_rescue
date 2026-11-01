import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function initTheme() {
  const saved = localStorage.getItem('fr_theme') || 'light';
  document.documentElement.classList.toggle('dark', saved === 'dark');
  return () => {};
}

export default function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(() => localStorage.getItem('fr_theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('fr_theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`p-2 rounded-full hover:bg-[#245C45]/10 transition-colors ${className}`}
    >
      {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-600" />}
    </button>
  );
}
