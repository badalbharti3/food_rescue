import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import RatingModal from '../../components/ui/RatingModal';
import toast from 'react-hot-toast';

export default function ActiveAllocations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [otp, setOtp] = useState('');
  const [collected, setCollected] = useState('');
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [ratedMap, setRatedMap] = useState({}); // allocationId -> my rating
  const load = () => { setLoading(true); api.get('/allocations/donor').then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  // prefetch my rating for completed allocations (feature 9)
  useEffect(() => {
    const completed = items.filter((a) => a.status === 'completed');
    for (const a of completed) {
      api.get(`/ratings/allocation/${a._id}`).then((r) => {
        if (r.data.data.mine) setRatedMap((m) => ({ ...m, [a._id]: r.data.data.mine }));
      }).catch(() => {});
    }
  }, [items]);

  const issueOtp = async (a) => {
    try { const r = await api.post(`/pickups/${a._id}/issue`, {}); toast.success(`OTP issued: ${r.data.data.otp}`); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const cancel = async (a) => {
    const reason = prompt('Cancellation reason?');
    try { await api.post(`/allocations/${a._id}/cancel-donor`, { reason }); toast.success('Cancelled'); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const verify = async () => {
    try { await api.post(`/pickups/${active._id}/verify`, { otp, actualCollected: Number(collected), collectorName: 'staff' }); toast.success('Verified'); setVerifyOpen(false); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const release = async (a) => {
    try { await api.post(`/pickups/${a._id}/release`, { reason: 'release remaining' }); toast.success('Released'); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No allocations" />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Active Allocations</h2>
      <div className="space-y-3">
        {items.map((a) => (
          <Card key={a._id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{a.listing?.title}</p>
                <p className="text-sm text-gray-500">NGO: {a.ngo?.orgName} • Allocated: {a.allocatedQuantity} • Collected: {a.collectedQuantity}</p>
              </div>
              <Badge status={a.status}>{a.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {a.status === 'reserved' && <Button onClick={() => issueOtp(a)}>Issue OTP</Button>}
              {['reserved','ready_for_pickup','partially_collected'].includes(a.status) && (
                <>
                  <Button variant="secondary" onClick={() => { setActive(a); setVerifyOpen(true); }}>Verify Pickup</Button>
                  <Button variant="danger" onClick={() => cancel(a)}>Cancel</Button>
                </>
              )}
              {a.status === 'partially_collected' && <Button variant="outline" onClick={() => release(a)}>Release Remaining</Button>}
              {a.status === 'completed' && (
                <Button variant="outline" onClick={() => { setRatingTarget(a); setRatingOpen(true); }}>
                  {ratedMap[a._id] ? `★ ${ratedMap[a._id].stars}/5 ✓` : 'Rate NGO'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={verifyOpen} onClose={() => setVerifyOpen(false)} title="Verify Pickup">
        <Input label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <Input label="Actual Collected Quantity" type="number" value={collected} onChange={(e) => setCollected(e.target.value)} />
        <Button onClick={verify} className="w-full">Verify</Button>
      </Modal>
      <RatingModal
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        allocationId={ratingTarget?._id}
        rated={ratingTarget ? ratedMap[ratingTarget._id] : null}
        orgLabel={ratingTarget?.ngo?.orgName}
        directionLabel="How was the pickup with the NGO"
        onDone={load}
      />
    </div>
  );
}
