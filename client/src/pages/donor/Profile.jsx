import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SkeletonList from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function DonorProfile() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const load = () => {
    setLoading(true);
    api.get('/organizations/me').then((r) => { setOrg(r.data.data); setForm(r.data.data || {}); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);
  const doSave = async () => {
    setConfirmSave(false);
    try { await api.put('/organizations/me', form); toast.success('Saved'); setEditing(false); load(); } catch (e) { toast.error('Failed'); }
  };
  const onSaveClick = (e) => { e.preventDefault(); setConfirmSave(true); };
  if (loading) return <SkeletonList />;
  const fields = [
    ['Organization Name', org?.orgName],
    ['Business Category', org?.orgType],
    ['Contact Person', org?.contactPerson],
    ['Phone', org?.phone],
    ['Email', org?.email],
    ['Address', org?.address],
    ['City', org?.city],
    ['PIN Code', org?.pincode],
    ['Operating Hours', org?.operatingHours],
    ['Food Categories Donated', (org?.foodCategoriesDonated || []).join(', ')],
    ['Preferred Pickup Arrangements', org?.preferredPickupArrangements],
    ['GPS', org?.location?.coordinates ? `${org.location.coordinates[1]}, ${org.location.coordinates[0]}` : '—'],
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Organization Profile</h2>
        {!editing && <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-gray-100 text-[#245C45]" title="Edit"><Pencil size={18} /></button>}
      </div>
      <Card>
        <div className="mb-4">Verification: <Badge status={org?.verificationStatus}>{org?.verificationStatus}</Badge></div>
        {!editing ? (
          <div className="grid md:grid-cols-2 gap-3">
            {fields.map(([label, value]) => (
              <div key={label} className="border-b border-gray-100 pb-2">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={onSaveClick} className="grid md:grid-cols-2 gap-3">
            <Input label="Organization Name" value={form.orgName || ''} onChange={(e) => setForm({ ...form, orgName: e.target.value })} />
            <Input label="Contact Person" value={form.contactPerson || ''} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            <Input label="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="City" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <div className="md:col-span-2 flex items-center gap-2">
              <Button type="button" variant="outline" onClick={async () => {
                try {
                  const { getCurrentPosition, reverseGeocode } = await import('../../utils/geo');
                  const { lat, lng } = await getCurrentPosition();
                  const geo = await reverseGeocode(lat, lng);
                  if (geo) setForm({ ...form, address: geo.address, city: geo.city, pincode: geo.pincode, location: { lng, lat } });
                  toast.success('Location fetched');
                } catch { toast.error('Could not fetch location'); }
              }}>Use My Location</Button>
            </div>
            <Input label="Address" className="md:col-span-2" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input label="PIN Code" value={form.pincode || ''} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            <Input label="Operating Hours" value={form.operatingHours || ''} onChange={(e) => setForm({ ...form, operatingHours: e.target.value })} />
            <Input label="Food Categories (comma)" className="md:col-span-2" value={(form.foodCategoriesDonated || []).join(', ')} onChange={(e) => setForm({ ...form, foodCategoriesDonated: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
            <Input label="Preferred Pickup Arrangements" className="md:col-span-2" value={form.preferredPickupArrangements || ''} onChange={(e) => setForm({ ...form, preferredPickupArrangements: e.target.value })} />
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="ghost" onClick={() => { setEditing(false); setForm(org || {}); }}>Cancel</Button>
            </div>
          </form>
        )}
      </Card>
      <ConfirmModal open={confirmSave} title="Save changes?" message="Are you sure you want to update your profile details?" onConfirm={doSave} onCancel={() => setConfirmSave(false)} />
    </div>
  );
}
