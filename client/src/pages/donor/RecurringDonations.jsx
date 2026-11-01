import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CATEGORIES = ['Cooked Meals', 'Bakery', 'Fruits & Vegetables', 'Dairy', 'Packaged Food', 'Beverages'];

function fmtLocal(n) { // hours→"06:00" style
  return `${String(n).padStart(2, '0')}:00`;
}

export default function RecurringDonations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORIES[0], totalQuantity: '', unit: 'packets', pickupAddress: '', city: '', expiryHours: 12, dayOfWeek: 5, hour: 18 });
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); api.get('/recurring/mine').then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: '', description: '', category: CATEGORIES[0], totalQuantity: '', unit: 'packets', pickupAddress: '', city: '', expiryHours: 12, dayOfWeek: new Date().getDay(), hour: 18 });
    setModalOpen(true);
  };
  const openEdit = (r) => {
    setEditTarget(r);
    setForm({
      title: r.title, description: r.description || '', category: r.category, totalQuantity: String(r.totalQuantity), unit: r.unit,
      pickupAddress: r.pickupAddress || '', city: r.city || '', expiryHours: r.expiryHours, dayOfWeek: r.dayOfWeek, hour: r.hour
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.totalQuantity || Number(form.totalQuantity) <= 0) { toast.error('Enter quantity'); return; }
    setSaving(true);
    try {
      const payload = { ...form, totalQuantity: Number(form.totalQuantity), expiryHours: Number(form.expiryHours) || 12, dayOfWeek: Number(form.dayOfWeek), hour: Number(form.hour) };
      if (editTarget) {
        await api.put(`/recurring/${editTarget._id}`, payload);
        toast.success('Schedule updated');
      } else {
        await api.post('/recurring', payload);
        toast.success('Recurring donation scheduled');
      }
      setModalOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (r) => {
    try { await api.put(`/recurring/${r._id}`, { active: !r.active }); toast.success(r.active ? 'Paused' : 'Resumed'); load(); } catch (e) { toast.error('Failed'); }
  };
  const remove = async (r) => {
    if (!confirm(`Delete recurring donation "${r.title}"?`)) return;
    try { await api.delete(`/recurring/${r._id}`); toast.success('Deleted'); load(); } catch (e) { toast.error('Failed'); }
  };

  if (loading) return <SkeletonList />;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold">Recurring Donations</h2>
          <p className="text-sm text-gray-500">Auto-list your predictable weekly surplus — FreshRoute creates the listing for you.</p>
        </div>
        <Button onClick={openCreate}>+ New Recurring Donation</Button>
      </div>
      {items.length === 0 ? <EmptyState title="No recurring donations yet" description="Create one and we'll list your surplus automatically each week." /> : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r._id} className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{r.title}</p>
                  <Badge status={r.active ? 'active' : 'paused'}>{r.active ? 'active' : 'paused'}</Badge>
                </div>
                <p className="text-sm text-gray-500">🔁 Every <strong>{DAYS[r.dayOfWeek]}</strong> at <strong>{fmtLocal(r.hour)}</strong> • {r.totalQuantity} {r.unit} • stays fresh {r.expiryHours}h • {r.category}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {r.createdCount} listing{r.createdCount === 1 ? '' : 's'} generated{r.lastRunAt ? ` • last run ${new Date(r.lastRunAt).toLocaleString()}` : ' • never run yet'}
                  {r.city ? ` • ${r.city}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => toggleActive(r)}>{r.active ? 'Pause' : 'Resume'}</Button>
                <Button variant="secondary" onClick={() => openEdit(r)}>Edit</Button>
                <Button variant="danger" onClick={() => remove(r)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Recurring Donation' : 'New Recurring Donation'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#245C45]/40">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Quantity" type="number" min="1" value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#245C45]/40">
              {['packets', 'kg', 'trays', 'plates'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Repeats every</label>
            <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#245C45]/40">
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Listing time (hour)</label>
            <select value={form.hour} onChange={(e) => setForm({ ...form, hour: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#245C45]/40">
              {Array.from({ length: 24 }).map((_, h) => <option key={h} value={h}>{fmtLocal(h)}</option>)}
            </select>
          </div>
          <Input label="Stays fresh for (hours)" type="number" min="1" max="72" value={form.expiryHours} onChange={(e) => setForm({ ...form, expiryHours: e.target.value })} />
          <Input label="Pickup Address (optional)" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} />
          <Input label="City (optional)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#245C45]/40" />
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="w-full mt-4">{saving ? 'Saving...' : editTarget ? 'Update schedule' : 'Schedule'}</Button>
      </Modal>
    </div>
  );
}
