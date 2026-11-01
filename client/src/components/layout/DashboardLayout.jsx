import Sidebar, { navItems } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, LogOut, Menu, X, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import ConfirmModal from '../ui/ConfirmModal';
import LoadingOverlay from '../ui/LoadingOverlay';
import ThemeToggle from '../ui/ThemeToggle';
import CommandPalette from '../CommandPalette';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Cmd/Ctrl+K quick navigation (feature 18)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const paletteItems = (navItems[user?.role] || navItems.admin).map((it) => ({ label: it.label, to: it.to, icon: it.label === 'Overview' ? '⌂' : it.label.includes('Notif') ? '🔔' : it.label.includes('Certificate') ? '🏅' : it.label.includes('Map') ? '🗺' : it.label.includes('Recurring') ? '🔁' : '›' }));

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setMobileNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count').then((r) => setUnread(r.data.data.count)).catch(() => {});
    }
  }, [user]);

  const roleLabel = user?.role === 'donor' ? 'Donor' : user?.role === 'receiver' ? 'NGO / Receiver' : 'Administrator';
  const dashBase = user?.role === 'donor' ? '/donor' : user?.role === 'receiver' ? '/receiver' : '/admin';

  return (
    <div className="flex min-h-screen dashboard-bg">
      <Sidebar role={user?.role} />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 glass m-3 mb-0 rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm">
          <button aria-label="Open menu" className="md:hidden p-2 rounded-lg hover:bg-white/60 transition mr-2" onClick={() => setMobileNavOpen(true)}>
            <Menu size={20} className="text-gray-700" />
          </button>
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-xl bg-[#245C45] text-white flex items-center justify-center font-bold text-sm shadow-md">F</div>
            <div>
              <h1 className="font-semibold text-gray-900 text-lg leading-tight">FreshRoute</h1>
              <p className="text-xs text-gray-500">{roleLabel} dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              aria-label="Quick navigation (Ctrl+K)"
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-xl border border-[#245C45]/20 bg-white/80 px-3 py-1.5 text-xs text-gray-500 hover:border-[#245C45]/40 hover:text-[#245C45] transition-colors"
            >
              <Search size={14} /> Search pages <kbd className="rounded border border-gray-200 px-1 text-[10px]">Ctrl K</kbd>
            </button>
            <ThemeToggle />
            <button aria-label="Notifications" className="relative p-2 rounded-lg hover:bg-white/60 transition" onClick={() => navigate(`${dashBase}/notifications`)}>
              <Bell size={20} className="text-gray-700" />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#245C45] text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">{unread}</span>}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#245C45]/15 text-[#245C45] flex items-center justify-center font-semibold text-sm">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <button aria-label="Log out" onClick={() => setConfirmLogout(true)} className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-white/60 transition"><LogOut size={18} /></button>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 flex-1 overflow-x-auto">{children}</main>
      </div>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 h-full w-72 p-3" onClick={(e) => e.stopPropagation()}>
            <Sidebar role={user?.role} mobile onClose={() => setMobileNavOpen(false)} />
            <button aria-label="Close menu" className="absolute top-4 right-4 p-2 rounded-lg bg-white/80" onClick={() => setMobileNavOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      <ConfirmModal open={confirmLogout} title="Log out?" message="Are you sure you want to log out?" danger onConfirm={() => { setConfirmLogout(false); setLoggingOut(true); setTimeout(() => { logout(); navigate('/', { replace: true }); }, 200); }} onCancel={() => setConfirmLogout(false)} />
      <LoadingOverlay show={loggingOut} message="Logging out..." />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
    </div>
  );
}
