import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import SkeletonList from '../../components/ui/Skeleton';

export default function ReceiverOverview() {
  const { user, org } = useAuth();
  const [allocs, setAllocs] = useState([]);
  const [listings, setListings] = useState([]);
  useEffect(() => {
    api.get('/allocations/receiver').then((r) => setAllocs(r.data.data.items || [])).catch(() => {});
    api.get('/food-listings/for-ngo').then((r) => setListings(r.data.data.items || [])).catch(() => {});
  }, []);
  const collected = allocs.reduce((s, a) => s + (a.collectedQuantity || 0), 0);
  return (
    <div>
      <Card className="mb-6 bg-gradient-to-br from-[#245C45] to-[#173F32] text-white border-0">
        <h2 className="text-2xl font-extrabold">Welcome, {org?.orgName || user?.name} 👋</h2>
        <p className="text-white/80 mt-1 text-sm">Here's what's happening with your food collections today.</p>
      </Card>
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-gray-500">Nearby Donations</p><p className="text-2xl font-bold text-[#245C45]">{listings.length}</p></Card>
        <Card><p className="text-sm text-gray-500">My Allocations</p><p className="text-2xl font-bold text-[#245C45]">{allocs.length}</p></Card>
        <Card><p className="text-sm text-gray-500">Total Collected</p><p className="text-2xl font-bold text-[#245C45]">{collected}</p></Card>
        <Card><p className="text-sm text-gray-500">Pending Pickups</p><p className="text-2xl font-bold text-[#245C45]">{allocs.filter((a) => ['reserved','ready_for_pickup'].includes(a.status)).length}</p></Card>
      </div>
    </div>
  );
}
