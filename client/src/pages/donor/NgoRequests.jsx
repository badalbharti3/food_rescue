import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function NgoRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); api.get('/requests/donor').then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const approve = async (id) => {
    const qty = prompt('Approve quantity? (leave blank for requested)');
    try { await api.post(`/requests/${id}/approve`, { allocatedQuantity: qty ? Number(qty) : undefined }); toast.success('Approved'); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const reject = async (id) => {
    const reason = prompt('Rejection reason?');
    try { await api.post(`/requests/${id}/reject`, { reason }); toast.success('Rejected'); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No requests" description="NGO requests will appear here." />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">NGO Requests</h2>
      <div className="space-y-3">
        {items.map((r) => (
          <Card key={r._id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{r.listing?.title}</p>
                <p className="text-sm text-gray-500">NGO: {r.ngo?.orgName} • Requested: {r.requestedQuantity} {r.listing?.unit}</p>
              </div>
              <Badge status={r.status}>{r.status}</Badge>
            </div>
            {r.status === 'pending' && (
              <div className="mt-3 flex gap-2">
                <Button onClick={() => approve(r._id)}>Approve</Button>
                <Button variant="danger" onClick={() => reject(r._id)}>Reject</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
