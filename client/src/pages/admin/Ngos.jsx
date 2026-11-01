import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import FilterBar from '../../components/ui/FilterBar';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' },
];

export default function AdminNgos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchItems = () => {
    const params = new URLSearchParams({ accountType: 'receiver' });
    if (status) params.set('status', status);
    if (search.trim()) params.set('search', search.trim());
    return api.get(`/admin/orgs?${params.toString()}`).then((r) => setItems(r.data.data.items || [])).catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => { fetchItems().finally(() => setLoading(false)); }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [status, search]);

  const reload = () => fetchItems();
  const suspend = async (id) => {
    const reason = prompt('Suspension reason?');
    if (!reason) return;
    try { await api.post(`/admin/orgs/${id}/suspend`, { reason }); toast.success('Suspended'); reload(); } catch (e) { toast.error('Failed'); }
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">NGO Management</h2>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <FilterBar options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search NGOs by name..."
          className="glass rounded-xl px-3 py-2 text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-[#245C45]/40"
        />
      </div>
      {loading ? <SkeletonList /> : items.length === 0 ? <EmptyState title="No NGOs found" /> : (
        <div className="space-y-2">
          {items.map((o) => (
            <Card key={o._id} className="flex justify-between items-center">
              <div><p className="font-semibold">{o.orgName}</p><p className="text-sm text-gray-500">{o.orgType} • {o.city} • {o.user?.email}</p></div>
              <div className="flex items-center gap-2">
                <Badge status={o.verificationStatus}>{o.verificationStatus}</Badge>
                {o.verificationStatus === 'verified' && <Button variant="danger" onClick={() => suspend(o._id)}>Suspend</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
