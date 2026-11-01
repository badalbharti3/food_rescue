import { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

// Impact Certificate page — works for donor & receiver (feature 1)
export default function ImpactCertificate() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(defaultMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(`/impact/certificate?month=${month}`).then((r) => setData(r.data.data)).catch(() => { setData(null); }).finally(() => setLoading(false));
  };
  useEffect(load, [month]);

  const monthLabel = (m) => {
    const [y, mo] = m.split('-').map(Number);
    return new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  if (loading) return <Spinner />;
  if (!data) return <Card><p className="text-sm text-gray-500">No certificate available. Something went wrong.</p></Card>;

  const { org, meals, kg, pickups, partners, co2Kg, waterL } = data;
  const topPartner = partners[0]?.[0];
  const partnerLine = topPartner ? `${topPartner}` : 'our NGO partners';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Impact Certificate</h2>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            max={defaultMonth}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Select month"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#245C45]/40"
          />
          <Button onClick={() => window.print()}>Print / Save PDF</Button>
        </div>
      </div>

      <div className="print-area">
        <div className="relative overflow-hidden rounded-3xl border-4 border-[#245C45]/60 bg-[#FFFDF8] p-8 md:p-12 text-center shadow-xl">
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(600px 200px at 50% 0%, rgba(36,92,69,0.12), transparent)' }} />
          <p className="text-xs tracking-[0.3em] font-semibold text-[#245C45]">FRESHROUTE • FOOD RESCUE NETWORK</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#173F32] mt-3">Certificate of Impact</h1>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-[#78A77B]" />
          <p className="mt-8 text-sm text-gray-600">This certificate is proudly presented to</p>
          <p className="text-2xl md:text-3xl font-extrabold text-[#245C45] mt-2">{org?.orgName}</p>
          <p className="text-sm text-gray-500 mt-1">{org?.orgType} • {org?.city}</p>

          <p className="mt-8 max-w-xl mx-auto text-sm md:text-base text-gray-700 leading-relaxed">
            for the rescue of <strong className="text-[#173F32]">{kg.toLocaleString()} kg</strong> of surplus food — approximately{' '}
            <strong className="text-[#173F32]">{meals.toLocaleString()} meals</strong> — across{' '}
            <strong className="text-[#173F32]">{pickups.toLocaleString()} verified pickup{pickups === 1 ? '' : 's'}</strong> in{' '}
            <strong className="text-[#173F32]">{monthLabel(month)}</strong> with {partnerLine}.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-[#245C45]/5 p-3"><p className="text-xl font-extrabold text-[#245C45]">{meals.toLocaleString()}</p><p className="text-xs text-gray-500">Meals rescued</p></div>
            <div className="rounded-2xl bg-[#245C45]/5 p-3"><p className="text-xl font-extrabold text-[#245C45]">{kg.toLocaleString()} kg</p><p className="text-xs text-gray-500">Food saved</p></div>
            <div className="rounded-2xl bg-[#245C45]/5 p-3"><p className="text-xl font-extrabold text-[#245C45]">{co2Kg.toLocaleString()} kg</p><p className="text-xs text-gray-500">CO₂ avoided</p></div>
            <div className="rounded-2xl bg-[#245C45]/5 p-3"><p className="text-xl font-extrabold text-[#245C45]">{Math.round(waterL / 1000).toLocaleString()}K L</p><p className="text-xs text-gray-500">Water saved</p></div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 max-w-xl mx-auto text-xs text-gray-500">
            <div className="text-left">
              <p className="font-bold text-gray-700">FreshRoute</p>
              <p>Generated on {new Date(data.generatedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-700">— — —</p>
              <p>Authorized signatory</p>
            </div>
          </div>
          <p className="mt-6 text-[10px] text-gray-400">{data.note}</p>
        </div>
      </div>
    </div>
  );
}
