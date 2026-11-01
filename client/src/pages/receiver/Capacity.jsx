import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SkeletonList from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function Capacity() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [confirmSave, setConfirmSave] = useState(false);
  useEffect(() => { api.get('/organizations/me').then((r) => { setOrg(r.data.data); setForm(r.data.data || {}); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  const doSave = async () => {
    setConfirmSave(false);
    try { await api.put('/organizations/me', form); toast.success('Saved'); } catch (e) { toast.error('Failed'); }
  };
  const onSaveClick = (e) => { e.preventDefault(); setConfirmSave(true); };
  if (loading) return <SkeletonList />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Organization Capacity</h2>
      <Card>
        <form onSubmit={onSaveClick} className="grid md:grid-cols-2 gap-3">
          <Input label="Storage Capacity (kg)" type="number" value={form.capacity?.storageKg || ''} onChange={(e) => setForm({ ...form, capacity: { ...(form.capacity || {}), storageKg: Number(e.target.value) } })} />
          <Input label="Daily Receive Capacity (kg)" type="number" value={form.capacity?.dailyReceiveKg || ''} onChange={(e) => setForm({ ...form, capacity: { ...(form.capacity || {}), dailyReceiveKg: Number(e.target.value) } })} />
          <Input label="Max Pickup Distance (km)" type="number" value={form.serviceRadiusKm || ''} onChange={(e) => setForm({ ...form, serviceRadiusKm: Number(e.target.value) })} />
          <div className="md:col-span-2"><Button type="submit">Save</Button></div>
        </form>
      </Card>
      <ConfirmModal open={confirmSave} title="Save changes?" message="Are you sure you want to update capacity details?" onConfirm={doSave} onCancel={() => setConfirmSave(false)} />
    </div>
  );
}
