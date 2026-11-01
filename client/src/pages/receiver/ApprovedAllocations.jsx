import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function ApprovedAllocations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [addQty, setAddQty] = useState('');
  const [addReason, setAddReason] = useState('');
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [collected, setCollected] = useState('');
  const load = () => { setLoading(true); api.get('/allocations/receiver').then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const cancel = async (a) => {
    const reason = prompt('Cancellation reason?');
    try { await api.post(`/allocations/${a._id}/cancel-ngo`, { reason }); toast.success('Cancelled'); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const submitAdditional = async () => {
    try { await api.post(`/additional-quantity/${active._id}`, { additionalQuantity: Number(addQty), reason: addReason }); toast.success('Requested'); setAddOpen(false); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const verify = async () => {
    try { await api.post(`/pickups/${active._id}/verify`, { otp, actualCollected: Number(collected), collectorName: 'ngo staff' }); toast.success('Verified'); setVerifyOpen(false); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No approved allocations" />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Approved Allocations</h2>
      <div className="space-y-3">
        {items.map((a) => (
          <Card key={a._id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{a.listing?.title}</p>
                <p className="text-sm text-gray-500">Donor: {a.donor?.orgName} • Allocated: {a.allocatedQuantity} • Collected: {a.collectedQuantity}</p>
                <p className="text-xs text-gray-500">Pickup: {a.listing?.pickupAddress} • Deadline: {a.listing?.pickupDeadline ? new Date(a.listing.pickupDeadline).toLocaleString() : ''}</p>
              </div>
              <Badge status={a.status}>{a.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['reserved','ready_for_pickup','partially_collected'].includes(a.status) && (
                <>
                  <Button variant="secondary" onClick={() => { setActive(a); setVerifyOpen(true); setOtp(''); setCollected(String(a.allocatedQuantity - a.collectedQuantity)); }}>Verify Pickup</Button>
                  <Button variant="outline" onClick={() => { setActive(a); setAddOpen(true); setAddQty(''); setAddReason(''); }}>Request Additional</Button>
                  <Button variant="danger" onClick={() => cancel(a)}>Cancel</Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Request Additional Quantity">
        <Input label="Additional Quantity" type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)} />
        <Input label="Reason" value={addReason} onChange={(e) => setAddReason(e.target.value)} />
        <Button onClick={submitAdditional} className="w-full">Submit</Button>
      </Modal>
      <Modal open={verifyOpen} onClose={() => setVerifyOpen(false)} title="Verify Pickup">
        <Input label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <Input label="Actual Collected" type="number" value={collected} onChange={(e) => setCollected(e.target.value)} />
        <Button onClick={verify} className="w-full">Verify</Button>
      </Modal>
    </div>
  );
}
