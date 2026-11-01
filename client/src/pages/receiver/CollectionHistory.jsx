import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import RatingModal from '../../components/ui/RatingModal';
import SkeletonList from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Spinner';

export default function CollectionHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [ratedMap, setRatedMap] = useState({});
  useEffect(() => { api.get('/allocations/receiver?status=completed').then((r) => setItems(r.data.data.items || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    for (const a of items) {
      api.get(`/ratings/allocation/${a._id}`).then((r) => {
        if (r.data.data.mine) setRatedMap((m) => ({ ...m, [a._id]: r.data.data.mine }));
      }).catch(() => {});
    }
  }, [items]);
  if (loading) return <SkeletonList />;
  if (items.length === 0) return <EmptyState title="No collection history" />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Collection History</h2>
      <div className="space-y-3">
        {items.map((a) => (
          <Card key={a._id}>
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{a.listing?.title}</p>
                <p className="text-sm text-gray-500">Donor: {a.donor?.orgName} • Collected: {a.collectedQuantity}/{a.allocatedQuantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => { setRatingTarget(a); setRatingOpen(true); }}>
                  {ratedMap[a._id] ? `★ ${ratedMap[a._id].stars}/5 ✓` : 'Rate Donor'}
                </Button>
                <Badge status={a.status}>{a.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <RatingModal
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        allocationId={ratingTarget?._id}
        rated={ratingTarget ? ratedMap[ratingTarget._id] : null}
        orgLabel={ratingTarget?.donor?.orgName}
        directionLabel="How was your collection experience with the donor"
        onDone={() => api.get('/allocations/receiver?status=completed').then((r) => setItems(r.data.data.items || [])).catch(() => {})}
      />
    </div>
  );
}
