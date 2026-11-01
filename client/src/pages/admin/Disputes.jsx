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
  { label: 'Open', value: 'open' },
  { label: 'Investigating', value: 'investigating' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export default function AdminDisputes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const load = () => { setLoading(true); api.get('/admin/disputes').then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);
  const filtered = status ? items.filter((d) => d.status === status) : items;
  const resolve = async (id) => {
    const resolution = prompt('Resolution?');
    if (!resolution) return;
    const reopen = confirm('Reopen listing if paused?');
    try { await api.post(`/admin/disputes/${id}/resolve`, { resolution, reopen }); toast.success('Resolved'); load(); } catch (e) { toast.error('Failed'); }
  };
  if (loading) return <SkeletonList />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Complaints & Disputes</h2>
      <FilterBar options={STATUS_OPTIONS} value={status} onChange={setStatus} className="mb-4" />
      {items.length === 0 ? <EmptyState title="No disputes" /> : filtered.length === 0 ? <EmptyState title={`No ${status} disputes`} /> : (
      <div className="space-y-2">
        {filtered.map((d) => (
          <Card key={d._id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{d.incidentType}</p>
                <p className="text-sm text-gray-500">{d.description}</p>
                <p className="text-xs text-gray-400">Reporter: {d.reporter?.name} • {new Date(d.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={d.status}>{d.status}</Badge>
                {d.status === 'open' && <Button onClick={() => resolve(d._id)}>Resolve</Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
