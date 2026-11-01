import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import SkeletonList from '../../components/ui/Skeleton';

import { useAuth } from '../../context/AuthContext';

export default function DonorOverview() {
  const { user, org } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    api.get('/food-listings/mine').then((r) => setRecent(r.data.data.items || [])).catch(() => {});
    // compute from listings
  }, []);
  const total = recent.reduce((s, l) => s + (l.totalQuantity || 0), 0);
  const available = recent.reduce((s, l) => s + (l.availableQuantity || 0), 0);
  const reserved = recent.reduce((s, l) => s + (l.reservedQuantity || 0), 0);
  const collected = recent.reduce((s, l) => s + (l.collectedQuantity || 0), 0);
  return (
    <div>
      <Card className="mb-6 bg-gradient-to-br from-[#245C45] to-[#173F32] text-white border-0">
        <h2 className="text-2xl font-extrabold">Welcome, {org?.orgName || user?.name} 👋</h2>
        <p className="text-white/80 mt-1 text-sm">Here's what's happening with your food donations today.</p>
      </Card>
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-gray-500">Total Listed</p><p className="text-2xl font-bold text-[#245C45]">{total}</p></Card>
        <Card><p className="text-sm text-gray-500">Available</p><p className="text-2xl font-bold text-[#245C45]">{available}</p></Card>
        <Card><p className="text-sm text-gray-500">Reserved</p><p className="text-2xl font-bold text-[#245C45]">{reserved}</p></Card>
        <Card><p className="text-sm text-gray-500">Collected</p><p className="text-2xl font-bold text-[#245C45]">{collected}</p></Card>
      </div>
      <Card>
        <h3 className="font-semibold mb-3">Recent Listings</h3>
        {recent.length === 0 ? <p className="text-sm text-gray-500">No listings yet.</p> : (
          <ul className="divide-y">
            {recent.slice(0, 5).map((l) => (
              <li key={l._id} className="py-2 flex justify-between text-sm">
                <span>{l.title}</span>
                <span className="text-gray-500">{l.availableQuantity}/{l.totalQuantity} {l.unit} • {l.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
