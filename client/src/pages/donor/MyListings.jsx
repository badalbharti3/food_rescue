import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Countdown from '../../components/ui/Countdown';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    api.get('/food-listings/mine').then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);
  const cancel = async (id) => {
    const reason = prompt('Cancellation reason?');
    try { await api.post(`/food-listings/${id}/cancel`, { reason }); toast.success('Cancelled'); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No listings yet" description="Create your first food listing." />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Food Listings</h2>
      <div className="grid gap-4">
        {items.map((l) => (
          <Card key={l._id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{l.title}</h3>
                <p className="text-sm text-gray-500">{l.category} • {l.city}</p>
              </div>
              <Badge status={l.status}>{l.status}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
              <div><span className="text-gray-500">Total</span><p className="font-medium">{l.totalQuantity}</p></div>
              <div><span className="text-gray-500">Available</span><p className="font-medium">{l.availableQuantity}</p></div>
              <div><span className="text-gray-500">Reserved</span><p className="font-medium">{l.reservedQuantity}</p></div>
              <div><span className="text-gray-500">Collected</span><p className="font-medium">{l.collectedQuantity}</p></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
              <Countdown date={l.expiryDate} label="Expires" />
              <Countdown date={l.pickupDeadline} label="Pickup" />
            </div>
            <div className="mt-3 flex gap-2">
              {l.status === 'active' && <Button variant="danger" onClick={() => cancel(l._id)}>Cancel Listing</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
