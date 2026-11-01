import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import SkeletonList from '../../components/ui/Skeleton';

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/admin/stats').then((r) => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <SkeletonList />;
  return (
    <div>
      <Card className="mb-6 bg-gradient-to-br from-[#245C45] to-[#173F32] text-white border-0">
        <h2 className="text-2xl font-extrabold">Welcome, {user?.name} 👋</h2>
        <p className="text-white/80 mt-1 text-sm">Here's your platform overview.</p>
      </Card>
      <h2 className="text-xl font-bold mb-4">Admin Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats && Object.entries(stats).map(([k, v]) => (
          <Card key={k}><p className="text-sm text-gray-500">{k}</p><p className="text-2xl font-bold text-[#245C45]">{v}</p></Card>
        ))}
      </div>
    </div>
  );
}
