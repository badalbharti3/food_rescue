import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, Inbox, Truck, History, Building2, Bell, BarChart3, User, Map, Package, AlertTriangle, ShieldCheck, Repeat, Award, MapPin } from 'lucide-react';

export const navItems = {
  donor: [
    { to: '/donor', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/donor/create', icon: PlusCircle, label: 'Create Listing' },
    { to: '/donor/recurring', icon: Repeat, label: 'Recurring Donations' },
    { to: '/donor/listings', icon: List, label: 'My Listings' },
    { to: '/donor/requests', icon: Inbox, label: 'NGO Requests' },
    { to: '/donor/allocations', icon: Package, label: 'Active Allocations' },
    { to: '/donor/pickups', icon: Truck, label: 'Pickup Schedule' },
    { to: '/donor/history', icon: History, label: 'Donation History' },
    { to: '/donor/branches', icon: Building2, label: 'Branch Management' },
    { to: '/donor/notifications', icon: Bell, label: 'Notifications' },
    { to: '/donor/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/donor/certificate', icon: Award, label: 'Impact Certificate' },
    { to: '/donor/profile', icon: User, label: 'Organization Profile' }
  ],
  receiver: [
    { to: '/receiver', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/receiver/nearby', icon: List, label: 'Nearby Food' },
    { to: '/receiver/map', icon: Map, label: 'Map View' },
    { to: '/receiver/requests', icon: Inbox, label: 'My Requests' },
    { to: '/receiver/allocations', icon: Package, label: 'Approved Allocations' },
    { to: '/receiver/additional', icon: PlusCircle, label: 'Additional Quantity' },
    { to: '/receiver/pickups', icon: Truck, label: 'Pickup Schedule' },
    { to: '/receiver/history', icon: History, label: 'Collection History' },
    { to: '/receiver/notifications', icon: Bell, label: 'Notifications' },
    { to: '/receiver/capacity', icon: Building2, label: 'Capacity' },
    { to: '/receiver/certificate', icon: Award, label: 'Impact Certificate' },
    { to: '/receiver/profile', icon: User, label: 'Profile & Verification' }
  ],
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/verifications', icon: ShieldCheck, label: 'Verifications' },
    { to: '/admin/donors', icon: Building2, label: 'Donor Management' },
    { to: '/admin/ngos', icon: Building2, label: 'NGO Management' },
    { to: '/admin/listings', icon: List, label: 'Listings' },
    { to: '/admin/allocations', icon: Package, label: 'Allocations' },
    { to: '/admin/ops-map', icon: MapPin, label: 'Ops Map' },
    { to: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
    { to: '/admin/audit', icon: History, label: 'Audit Logs' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' }
  ]
};

export default function Sidebar({ role, mobile = false, onClose }) {
  const items = navItems[role] || navItems.admin;
  const roleLabel = role === 'donor' ? 'Donor Portal' : role === 'receiver' ? 'NGO Portal' : 'Admin Console';
  const base = mobile
    ? 'w-72 glass rounded-2xl h-full p-4 flex flex-col overflow-y-auto'
    : 'w-64 m-3 mr-0 glass rounded-2xl min-h-[calc(100vh-1.5rem)] p-4 hidden md:flex flex-col';
  return (
    <aside className={base}>
      <Link to="/" className="flex items-center gap-2 mb-6 px-2 hover:opacity-80 transition">
        <div className="w-9 h-9 rounded-xl bg-[#245C45] text-white flex items-center justify-center font-bold shadow-md">F</div>
        <div>
          <p className="font-bold text-gray-900 leading-tight">FreshRoute</p>
          <p className="text-[11px] text-gray-500">{roleLabel}</p>
        </div>
      </Link>
      <nav className="space-y-1 flex-1">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} onClick={onClose}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? 'bg-[#245C45] text-white shadow-md shadow-[#245C45]/20 font-medium' : 'text-gray-700 hover:bg-white/70 hover:text-[#245C45]'}`}>
            <it.icon size={18} /> {it.label}
          </NavLink>
        ))}
      </nav>
      <div className="text-[11px] text-gray-400 px-2 mt-4">v1.0 • FreshRoute</div>
    </aside>
  );
}
