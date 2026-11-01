import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';

export default function DonationHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/allocations/donor?status=completed').then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No completed donations" />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Donation History</h2>
      <div className="space-y-3">
        {items.map((a) => (
          <Card key={a._id}>
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{a.listing?.title}</p>
                <p className="text-sm text-gray-500">NGO: {a.ngo?.orgName} • Collected: {a.collectedQuantity}/{a.allocatedQuantity}</p>
              </div>
              <Badge status={a.status}>{a.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
