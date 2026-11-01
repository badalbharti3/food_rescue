import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import LoadingOverlay from '../ui/LoadingOverlay';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dashPath = user ? (user.role === 'donor' ? '/donor' : user.role === 'receiver' ? '/receiver' : '/admin') : null;

  return (
    <>
      <header className="sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-[#245C45]">
            <span className="w-9 h-9 rounded-xl bg-[#245C45] text-white flex items-center justify-center shadow-md">F</span>
            FreshRoute
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="/#how" className="hover:text-[#245C45] transition">How It Works</a>
            <a href="/#donors" className="hover:text-[#245C45] transition">For Donors</a>
            <a href="/#ngos" className="hover:text-[#245C45] transition">For NGOs</a>
            <a href="/#impact" className="hover:text-[#245C45] transition">Our Impact</a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Button onClick={() => navigate(dashPath)} variant="outline" size="sm">Dashboard</Button>
                <Button onClick={() => setConfirmLogout(true)} variant="ghost" size="sm">Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#245C45]">Sign In</Link>
                <Link to="/register" className="px-4 py-2 text-sm bg-[#245C45] text-white rounded-xl shadow-md hover:bg-[#173F32] transition">Get Started</Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {open && (
          <div className="md:hidden max-w-7xl mx-auto mt-2 glass rounded-2xl p-4 flex flex-col gap-2">
            <a href="/#how" onClick={() => setOpen(false)}>How It Works</a>
            <Link to="/login" onClick={() => setOpen(false)}>Sign In</Link>
            <Link to="/register" onClick={() => setOpen(false)}>Get Started</Link>
          </div>
        )}
      </header>
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmLogout(false)}>
          <div className="glass rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Log out?</h3>
            <p className="text-sm text-gray-600 mt-2">Are you sure you want to log out?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setConfirmLogout(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-sm">Cancel</button>
              <button onClick={() => { setConfirmLogout(false); setLoggingOut(true); setTimeout(() => { logout(); navigate('/', { replace: true }); }, 200); }} className="px-4 py-2 rounded-xl bg-gray-700 text-white text-sm">Log out</button>
            </div>
          </div>
        </div>
      )}
      <LoadingOverlay show={loggingOut} message="Logging out..." />
    </>
  );
}
