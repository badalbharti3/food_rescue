import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Countdown from '../../components/ui/Countdown';
import FilterBar from '../../components/ui/FilterBar';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Expired', value: 'expired' },
  { label: 'Closed', value: 'closed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Draft', value: 'draft' },
];

export default function AdminListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  useEffect(() => {
    setLoading(true);
    api.get(`/admin/listings${status ? `?status=${status}` : ''}`).then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, [status]);
  const load = () => api.get(`/admin/listings${status ? `?status=${status}` : ''}`).then((r) => setItems(r.data.data.items || [])).catch(() => {});
  const cancel = async (id) => {
    const reason = prompt('Reason?');
    if (!reason) return;
    try { await api.post(`/admin/listings/${id}/cancel`, { reason }); toast.success('Cancelled'); load(); } catch (e) { toast.error('Failed'); }
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Food Listing Monitoring</h2>
      <FilterBar options={STATUS_OPTIONS} value={status} onChange={setStatus} className="mb-4" />
      {loading ? <SkeletonList /> : items.length === 0 ? <EmptyState title="No listings found" /> : (
        <div className="space-y-2">
          {items.map((l) => (
            <Card key={l._id} className="flex justify-between items-center">
              <div><p className="font-semibold">{l.title}</p><p className="text-sm text-gray-500">{l.donor?.orgName} • {l.availableQuantity}/{l.totalQuantity} {l.unit}</p></div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {l.status === 'active' && <Countdown date={l.expiryDate} label="Expires" />}
                <Badge status={l.status}>{l.status}</Badge>
                {l.status === 'active' && <Button variant="danger" onClick={() => cancel(l._id)}>Cancel</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
