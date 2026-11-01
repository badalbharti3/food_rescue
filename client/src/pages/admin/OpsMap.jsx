import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Countdown from '../../components/ui/Countdown';
import FilterBar from '../../components/ui/FilterBar';
import Spinner from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';

// interactive coordinate-scatter map (no external map API needed)
export default function AdminOpsMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [layer, setLayer] = useState('both'); // both | listings | ngos
  const [selected, setSelected] = useState(null);

  useEffect(() => { api.get('/admin/ops-map').then((r) => setData(r.data.data)).catch(() => setData({ listings: [], ngos: [] })).finally(() => setLoading(false)); }, []);

  const { projects, bounds } = useMemo(() => {
    if (!data) return { projects: [], bounds: null };
    const all = [...data.listings, ...data.ngos].filter((p) => {
      const [lng, lat] = p.coordinates || [];
      return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
    });
    if (all.length === 0) return { projects: [], bounds: null };
    const lats = all.map((p) => p.coordinates[1]);
    const lngs = all.map((p) => p.coordinates[0]);
    let minLat = Math.min(...lats), maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const padLat = Math.max((maxLat - minLat) * 0.15, 0.01);
    const padLng = Math.max((maxLng - minLng) * 0.15, 0.01);
    minLat -= padLat; maxLat += padLat; minLng -= padLng; maxLng += padLng;
    const project = (p) => ({
      ...p,
      x: ((p.coordinates[0] - minLng) / (maxLng - minLng)) * 100,
      y: 100 - ((p.coordinates[1] - minLat) / (maxLat - minLat)) * 100
    });
    const projects = [...data.listings.map((l) => ({ ...project(l), kind: 'listing' })), ...data.ngos.map((n) => ({ ...project(n), kind: 'ngo' }))];
    return { projects, bounds: true };
  }, [data]);

  if (loading) return <Spinner />;
  if (!bounds) return <EmptyState title="No geo-coordinates on the map yet" description="Active listings and verified NGOs with location data will appear here." />;

  const visible = projects.filter((p) => layer === 'both' || (layer === 'listings' ? p.kind === 'listing' : p.kind === 'ngo'));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold">Ops Map</h2>
          <p className="text-sm text-gray-500">Live operational picture: active food listings and NGO pickup capacity.</p>
        </div>
        <FilterBar
          options={[{ label: 'Both', value: 'both' }, { label: 'Listings', value: 'listings' }, { label: 'NGOs', value: 'ngos' }]}
          value={layer}
          onChange={setLayer}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative w-full bg-[#F7F5EF] dark:bg-[#14201a]" style={{ paddingBottom: '70%' }}>
              {/* lat/lng grid backdrop */}
              <div className="absolute inset-0 opacity-60" style={{
                backgroundImage: 'linear-gradient(rgba(36,92,69,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(36,92,69,0.07) 1px, transparent 1px)',
                backgroundSize: '12.5% 12.5%'
              }} />
              {visible.map((p) => (
                <button
                  key={`${p.kind}-${p._id}`}
                  onClick={() => setSelected(p)}
                  title={`${p.kind === 'listing' ? 'Listing' : 'NGO'}: ${p.kind === 'listing' ? p.title : p.orgName}`}
                  aria-label={p.kind === 'listing' ? `Listing ${p.title}` : `NGO ${p.orgName}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md transition-transform hover:scale-125 focus-visible:outline-offset-4 ${
                    p.kind === 'listing'
                      ? 'w-4 h-4 bg-[#245C45] ring-2 ring-white'
                      : 'w-5 h-5 bg-[#78A77B] ring-2 ring-white'
                  }`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
              ))}
              <div className="absolute bottom-2 left-2 flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#245C45] inline-block" /> Active listings</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#78A77B] inline-block" /> Verified NGOs</span>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card>
            {selected ? (
              <div>
                <Badge status={selected.kind === 'listing' ? 'active' : 'verified'}>{selected.kind === 'listing' ? 'Listing' : 'NGO'}</Badge>
                {selected.kind === 'listing' ? (
                  <>
                    <p className="font-semibold mt-2">{selected.title}</p>
                    <p className="text-sm text-gray-500">{selected.donor} • {selected.city}</p>
                    <p className="text-sm mt-2">{selected.availableQuantity} {selected.unit} available</p>
                    <div className="mt-2"><Countdown date={selected.pickupDeadline} label="Pickup" /></div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold mt-2">{selected.orgName}</p>
                    <p className="text-sm text-gray-500">{selected.city}</p>
                    <div className="mt-3 space-y-1.5 text-sm">
                      <p>📖 Capacity: <strong>{selected.dailyReceiveKg} kg/day</strong></p>
                      <p>Total received: <strong style={{ color: 'inherit' }}>{relatedKg(selected, data)} kg</strong></p>
                      <p>Completed pickups: <strong>{selected.completedPickups}</strong> • Missed: <strong>{selected.missedPickups}</strong></p>
                      <p>Service radius: <strong>{selected.serviceRadiusKm || 0} km</strong></p>
                    </div>
                  </>
                )}
                <p className="text-xs text-gray-400 mt-3">📍 {(selected.coordinates?.[1])?.toFixed(4)}, {(selected.coordinates?.[0])?.toFixed(4)}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Click any pin on the map to see details.<br /><span className="text-xs text-gray-400">{projects.filter((p) => p.kind === 'listing').length} listings • {projects.filter((p) => p.kind === 'ngo').length} NGOs plotted</span></p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function relatedKg(selected, data) {
  return selected.totalReceivedKg ?? 0;
}
