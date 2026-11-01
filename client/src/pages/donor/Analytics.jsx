import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import SkeletonList from '../../components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DonorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/analytics/overview').then((r) => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <SkeletonList />;
  const byCity = (data?.byCity || []).map((c) => ({ name: c._id || 'Unknown', value: c.total }));
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-gray-500">Donors</p><p className="text-2xl font-bold text-[#245C45]">{data?.stats?.donors}</p></Card>
        <Card><p className="text-sm text-gray-500">Verified NGOs</p><p className="text-2xl font-bold text-[#245C45]">{data?.stats?.receivers}</p></Card>
        <Card><p className="text-sm text-gray-500">Active Listings</p><p className="text-2xl font-bold text-[#245C45]">{data?.stats?.activeListings}</p></Card>
        <Card><p className="text-sm text-gray-500">Completed Pickups</p><p className="text-2xl font-bold text-[#245C45]">{data?.stats?.completed}</p></Card>
      </div>
      <Card>
        <h3 className="font-semibold mb-3">Food Redistributed by City</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={byCity}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#245C45" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
