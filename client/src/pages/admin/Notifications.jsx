import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); api.get('/notifications').then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);
  const markRead = async (id) => { try { await api.post(`/notifications/${id}/read`); load(); } catch (e) {} };
  const markAll = async () => { try { await api.post('/notifications/read-all'); toast.success('All read'); load(); } catch (e) {} };
  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No notifications" />;
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <Button variant="ghost" onClick={markAll}>Mark all read</Button>
      </div>
      <div className="space-y-2">
        {items.map((n) => (
          <Card key={n._id} className={n.readAt ? 'opacity-60' : ''}>
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">{n.type}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.readAt && <Button variant="ghost" onClick={() => markRead(n._id)}>Mark read</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
