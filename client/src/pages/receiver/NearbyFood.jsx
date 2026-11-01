import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Countdown from '../../components/ui/Countdown';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function NearbyFood() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reqOpen, setReqOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => { setLoading(true); api.get('/food-listings/for-ngo').then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const request = async () => {
    try {
      await api.post('/requests', { listingId: active._id, requestedQuantity: Number(qty), message: msg });
      toast.success('Request submitted');
      setReqOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No nearby food" />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Nearby Food</h2>
      <div className="grid gap-4">
        {items.map((l) => (
          <Card key={l._id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{l.title}</h3>
                <p className="text-sm text-gray-500">{l.category} • {l.donor?.orgName} • {l.city}</p>
                <p className="text-sm mt-1">Available: {l.availableQuantity} {l.unit}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Countdown date={l.pickupDeadline} label="Pickup" />
                </div>
              </div>
              <Badge status={l.status}>{l.status}</Badge>
            </div>
            <div className="mt-3">
              <Button onClick={() => { setActive(l); setQty(String(l.availableQuantity)); setMsg(''); setReqOpen(true); }}>Request Food</Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={reqOpen} onClose={() => setReqOpen(false)} title="Request Food">
        <p className="text-sm mb-2">{active?.title} — available {active?.availableQuantity} {active?.unit}</p>
        <Input label="Requested Quantity" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Input label="Message" value={msg} onChange={(e) => setMsg(e.target.value)} />
        <Button onClick={request} className="w-full">Submit Request</Button>
      </Modal>
    </div>
  );
}
