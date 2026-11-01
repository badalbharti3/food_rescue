import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';

export default function AdditionalQty() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/additional-quantity/mine/ngo').then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No additional quantity requests" />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Additional Quantity Requests</h2>
      <div className="space-y-3">
        {items.map((r) => (
          <Card key={r._id}>
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{r.listing?.title}</p>
                <p className="text-sm text-gray-500">Requested: {r.additionalQuantity} • Approved: {r.approvedQuantity}</p>
                {r.reason && <p className="text-xs text-gray-400">{r.reason}</p>}
              </div>
              <Badge status={r.status}>{r.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
