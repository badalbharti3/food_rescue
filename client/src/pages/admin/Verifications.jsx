import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import FilterBar from '../../components/ui/FilterBar';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Donors', value: 'donor' },
  { label: 'NGOs', value: 'receiver' },
];

export default function Verifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState('');
  const load = () => { setLoading(true); api.get('/admin/verifications/pending').then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);
  const filtered = accountType ? items.filter((o) => o.accountType === accountType) : items;
  const verify = async (id) => {
    const reason = prompt('Reason (optional)?') || 'Verified by admin';
    try { await api.post(`/admin/verifications/${id}/verify`, { reason }); toast.success('Verified'); load(); } catch (e) { toast.error('Failed'); }
  };
  const reject = async (id) => {
    const reason = prompt('Rejection reason?');
    if (!reason) return;
    try { await api.post(`/admin/verifications/${id}/reject`, { reason }); toast.success('Rejected'); load(); } catch (e) { toast.error('Failed'); }
  };
  if (loading) return <SkeletonList />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pending Verifications</h2>
      <FilterBar options={TYPE_OPTIONS} value={accountType} onChange={setAccountType} className="mb-4" />
      {items.length === 0 ? <EmptyState title="No pending verifications" /> : filtered.length === 0 ? <EmptyState title="No pending verifications found" /> : (
      <div className="space-y-3">
        {filtered.map((o) => (
          <Card key={o._id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{o.orgName}</p>
                <p className="text-sm text-gray-500">{o.accountType} • {o.orgType} • {o.city}</p>
                <p className="text-xs text-gray-400">{o.user?.email}</p>
              </div>
              <Badge status={o.verificationStatus}>{o.verificationStatus}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => verify(o._id)}>Verify</Button>
              <Button variant="danger" onClick={() => reject(o._id)}>Reject</Button>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
