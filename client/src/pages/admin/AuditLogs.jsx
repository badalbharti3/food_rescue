import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';

export default function AdminAudit() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { api.get('/admin/audit-logs').then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  const filtered = search.trim()
    ? items.filter((a) =>
        [a.action, a.entityType, a.reason, a.actor?.name, a.actor?.email, a.actor?.role]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(search.trim().toLowerCase())))
    : items;
  if (loading) return <SkeletonList />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by action, entity, actor..."
        className="glass rounded-xl px-3 py-2 text-sm w-full md:w-72 mb-4 outline-none focus:ring-2 focus:ring-[#245C45]/40"
      />
      {items.length === 0 ? <EmptyState title="No audit logs" /> : filtered.length === 0 ? <EmptyState title="No matching logs" /> : (
      <div className="space-y-2">
        {filtered.map((a) => (
          <Card key={a._id}>
            <p className="font-semibold text-sm">{a.action} <span className="text-gray-400">({a.entityType})</span></p>
            <p className="text-xs text-gray-500">Actor: {a.actor?.name || a.actor?.email || 'system'} • {new Date(a.createdAt).toLocaleString()}</p>
            {a.reason && <p className="text-xs text-gray-400">Reason: {a.reason}</p>}
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
