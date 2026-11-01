import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import FilterBar from '../../components/ui/FilterBar';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Reserved', value: 'reserved' },
  { label: 'Ready for pickup', value: 'ready_for_pickup' },
  { label: 'Partially collected', value: 'partially_collected' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Expired', value: 'expired' },
  { label: 'Disputed', value: 'disputed' },
];

export default function AdminAllocations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  useEffect(() => {
    setLoading(true);
    api.get(`/admin/allocations${status ? `?status=${status}` : ''}`).then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, [status]);
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Allocation Management</h2>
      <FilterBar options={STATUS_OPTIONS} value={status} onChange={setStatus} className="mb-4" />
      {loading ? <SkeletonList /> : items.length === 0 ? <EmptyState title="No allocations found" /> : (
        <div className="space-y-2">
          {items.map((a) => (
            <Card key={a._id} className="flex justify-between items-center">
              <div><p className="font-semibold">{a.listing?.title}</p><p className="text-sm text-gray-500">Donor: {a.donor?.orgName} • NGO: {a.ngo?.orgName} • {a.allocatedQuantity}</p></div>
              <Badge status={a.status}>{a.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
