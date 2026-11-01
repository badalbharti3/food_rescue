import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SkeletonList from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function BranchManagement() {
  const [outlets, setOutlets] = useState([]);
  const [form, setForm] = useState({ branchName: '', address: '', city: '', lat: '', lng: '' });
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); api.get('/organizations/outlets').then((r) => setOutlets(r.data.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);
  const create = async (e) => {
    e.preventDefault();
    try { await api.post('/organizations/outlets', { ...form, location: { lng: Number(form.lng) || 0, lat: Number(form.lat) || 0 } }); toast.success('Branch added'); setForm({ branchName: '', address: '', city: '', lat: '', lng: '' }); load(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const remove = async (id) => {
    try { await api.delete(`/organizations/outlets/${id}`); toast.success('Removed'); load(); } catch (e) { toast.error('Failed'); }
  };
  if (loading) return <SkeletonList />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Branch Management</h2>
      <Card className="mb-4">
        <form onSubmit={create} className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-3 flex items-center gap-2">
            <Button type="button" variant="outline" onClick={async () => {
              try {
                const { getCurrentPosition, reverseGeocode } = await import('../../utils/geo');
                const { lat, lng } = await getCurrentPosition();
                const geo = await reverseGeocode(lat, lng);
                setForm((f) => ({ ...f, lat: String(lat), lng: String(lng), address: geo?.address || f.address, city: geo?.city || f.city }));
                toast.success('Location fetched');
              } catch { toast.error('Could not fetch location'); }
            }}>Use My Location</Button>
          </div>
          <Input label="Branch Name" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} required />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
          <Input label="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          <div className="flex items-end"><Button type="submit">Add Branch</Button></div>
        </form>
      </Card>
      <div className="space-y-2">
        {outlets.map((o) => (
          <Card key={o._id} className="flex justify-between items-center">
            <div><p className="font-semibold">{o.branchName}</p><p className="text-sm text-gray-500">{o.address} {o.city}</p></div>
            <Button variant="danger" onClick={() => remove(o._id)}>Remove</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
