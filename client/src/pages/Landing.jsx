import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Truck, Users, Leaf, ShieldCheck, MapPin, Package, Clock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useEffect, useState } from 'react';

const DONOR_CATS = [
  { name: 'Restaurants', desc: 'Daily surplus meals' },
  { name: 'Hotels', desc: 'Event & buffet surplus' },
  { name: 'Dharamshalas', desc: 'Community kitchens' },
  { name: 'Banquet & Party Halls', desc: 'Event food recovery' },
  { name: 'Wedding Venues', desc: 'Large-scale surplus' },
  { name: 'Catering Services', desc: 'Prepared food surplus' },
  { name: 'Cloud Kitchens', desc: 'Packaged meal surplus' },
  { name: 'Corporate Cafeterias', desc: 'Workplace food' },
  { name: 'College Canteens', desc: 'Campus surplus' },
  { name: 'Bakeries & Supermarkets', desc: 'Fresh baked goods' },
  { name: 'Event Organizers', desc: 'Event catering surplus' },
];
const RECEIVER_CATS = ['NGOs', 'Orphanages', 'Old-age Homes', 'Community Kitchens', 'Food Banks', 'Charitable Shelters'];

export default function Landing() {
  const [impact, setImpact] = useState(null);
  useEffect(() => {
    api.get('/analytics/public-impact').then((r) => setImpact(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-[#F7F5EF] text-[#1a2e24]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#78A77B]/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#78A77B]/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#DCE9DC] text-[#245C45] mb-5">Sustainable Food Redistribution</span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Good Food Deserves a <span className="text-[#245C45]">Second Chance.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-xl">
              Connecting restaurants, hotels, event venues, and food donors with verified NGOs to transform surplus food into meaningful community support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register?role=donor"><Button>Donate Surplus Food</Button></Link>
              <Link to="/register?role=receiver"><Button variant="outline">Find Food Donations</Button></Link>
            </div>
            <p className="mt-6 text-sm text-gray-500 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#245C45]" />
              Connecting food donors with organizations that make every meal count.
            </p>
          </div>
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#245C45]/15">
              <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80" alt="Food donation" width="900" height="420" loading="eager" fetchpriority="high" className="w-full h-[420px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#173F32]/40 to-transparent" />
            </div>
            {/* Floating glass cards */}
            <div className="absolute -top-6 -left-6 glass rounded-2xl p-4 w-44 shadow-lg hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#DCE9DC] flex items-center justify-center"><Package size={18} className="text-[#245C45]" /></div>
                <div>
                  <p className="text-xs text-gray-500">Available Now</p>
                  <p className="font-bold text-[#245C45]">50 Meals</p>
                </div>
              </div>
            </div>
            <div className="absolute top-1/3 -right-8 glass rounded-2xl p-4 w-44 shadow-lg hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#DCE9DC]/60 flex items-center justify-center"><CheckCircle2 size={18} className="text-[#245C45]" /></div>
                <div>
                  <p className="text-xs text-gray-500">Verified NGO</p>
                  <p className="font-bold text-[#245C45]">Pickup Confirmed</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-8 glass rounded-2xl p-4 w-44 shadow-lg hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#78A77B]/30 flex items-center justify-center"><Leaf size={18} className="text-[#78A77B]" /></div>
                <div>
                  <p className="text-xs text-gray-500">Zero Waste</p>
                  <p className="font-bold text-[#78A77B]">Every meal counts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact strip */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="glass rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Food Listings', impact?.totalListings ?? '—'],
            ['Units Collected', impact?.totalCollected ?? '—'],
            ['Successful Pickups', impact?.completedPickups ?? '—'],
            ['Verified Organizations', impact?.verifiedOrgs ?? '—'],
          ].map(([label, val]) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-[#245C45]">{val}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold">Too Much Food Is Wasted. Too Many People Need It.</h2>
          <p className="mt-4 text-gray-600">Every day, restaurants, hotels, wedding venues, party halls, and other organizations generate surplus food. At the same time, communities and charitable organizations need food support. FreshRoute connects these two sides through a reliable digital platform.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" alt="Surplus food" width="800" height="192" loading="lazy" className="w-full h-48 object-cover rounded-xl mb-4" />
            <h3 className="font-bold text-xl text-[#245C45]">Surplus Food</h3>
            <p className="text-sm text-gray-600 mt-2">Restaurants, hotels, events, and food businesses often have perfectly usable surplus food that can serve communities in need.</p>
          </Card>
          <Card className="overflow-hidden">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80" alt="Community support" width="800" height="192" loading="lazy" className="w-full h-48 object-cover rounded-xl mb-4" />
            <h3 className="font-bold text-xl text-[#245C45]">Food Insecurity</h3>
            <p className="text-sm text-gray-600 mt-2">NGOs, shelters, orphanages, and charitable organizations need reliable food support to serve their communities.</p>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card glass>
            <h3 className="font-bold text-xl text-[#245C45] mb-4">For Donors</h3>
            <ol className="space-y-3">
              {['Register your organization.', 'List surplus food.', 'Get matched with nearby NGOs.', 'Review and approve requests.', 'Verify pickup.', 'Track your impact.'].map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#245C45] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-700 pt-1">{s}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card glass>
            <h3 className="font-bold text-xl text-[#245C45] mb-4">For NGOs</h3>
            <ol className="space-y-3">
              {['Register your organization.', 'Complete verification.', 'Discover nearby food donations.', 'Request the required quantity.', 'Collect food using OTP verification.', 'Track donation history.'].map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#245C45] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-700 pt-1">{s}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>

      {/* Donors */}
      <section id="donors" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Who Can Donate?</h2>
            <p className="text-gray-600 mt-2">Any organization with surplus food can join FreshRoute.</p>
          </div>
          <Link to="/register?role=donor"><Button>Register as a Donor</Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {DONOR_CATS.map((c) => (
            <Card key={c.name} className="p-4 hover:scale-[1.02] transition-transform cursor-default">
              <h3 className="font-semibold text-[#245C45]">{c.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Receivers */}
      <section id="ngos" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Who Can Receive Food?</h2>
            <p className="text-gray-600 mt-2">Verified charitable organizations serving communities.</p>
          </div>
          <Link to="/register?role=receiver"><Button variant="secondary">Register as an NGO</Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {RECEIVER_CATS.map((c) => (
            <Card key={c} clay className="text-center py-8">
              <h3 className="font-semibold text-[#245C45]">{c}</h3>
            </Card>
          ))}
        </div>
      </section>

      {/* Smart matching */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">Smart Matching</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">FreshRoute automatically identifies eligible NGOs based on location, capacity, food preferences, operating hours, and fairness — so the right food reaches the right organization.</p>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: MapPin, title: 'Location-based Discovery', desc: 'Nearby NGOs within donor-set range' },
            { icon: Package, title: 'Capacity-aware Matching', desc: 'Respects NGO storage & daily limits' },
            { icon: Users, title: 'Fair Allocation', desc: 'Rotation protects smaller NGOs' },
            { icon: Clock, title: 'Expiry Management', desc: 'Strict pickup deadlines & safety' },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} glass className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#245C45]/10 flex items-center justify-center mb-3">
                <Icon size={22} className="text-[#245C45]" />
              </div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* In action */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">Food Redistribution in Action</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80',
            'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=700&q=80',
            'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=700&q=80',
          ].map((src, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-lg group">
              <img src={src} alt="Food redistribution" width="700" height="256" loading="lazy" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['Who can register as a donor?', 'Restaurants, hotels, dharamshalas, banquet halls, caterers, cafeterias, bakeries, supermarkets, and other food businesses.'],
            ['Who can receive food?', 'Verified NGOs, orphanages, old-age homes, community kitchens, food banks, and charitable shelters.'],
            ['How does NGO verification work?', 'NGOs register and submit details; admins review and approve before they can receive food.'],
            ['Can a restaurant donate to multiple NGOs?', 'Yes — single, multiple, manual, or auto allocation modes are supported.'],
            ['Can an NGO request additional food?', 'Yes, via additional quantity requests linked to an approved allocation.'],
            ['What happens if an NGO does not arrive?', 'Reminders, grace period, no-show marking, safe stock release, and reliability tracking.'],
            ['How is food expiry handled?', 'Preparation/expiry tracking, strict pickup deadlines, and automatic expiry jobs.'],
            ['How is pickup verified?', 'Unique OTP verification at handover, with partial collection support.'],
          ].map(([q, a]) => (
            <details key={q} className="glass rounded-2xl p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                {q}
                <span className="text-[#245C45] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-gray-600 mt-3">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#78A77B]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#78A77B]/20 rounded-full blur-3xl" />
          <h2 className="text-3xl md:text-5xl font-extrabold relative">Make Every Surplus Meal Count.</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto relative">Join a growing community working toward a future where good food reaches people instead of going to waste.</p>
          <div className="mt-8 flex justify-center gap-3 relative">
            <Link to="/register?role=donor"><Button>Start Donating</Button></Link>
            <Link to="/register?role=receiver"><Button variant="outline">Join as an NGO</Button></Link>
          </div>
        </div>
      </section>

    </div>
  );
}
