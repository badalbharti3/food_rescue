import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input, { Select, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import api from '../services/api';

const DONOR_TYPES = ['Restaurant','Hotel','Dharamshala','Banquet Hall','Party Hall','Wedding Venue','Catering Service','Cloud Kitchen','Hostel','College or University Canteen','School Canteen','Corporate Cafeteria','Bakery','Grocery Store or Supermarket','Food Manufacturing Unit','Event Organizer','Religious or Community Institution','Individual Food Donor','Other Food Business'];

export default function RegisterDonor() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [form, setForm] = useState({
    orgName: '', ownerName: '', email: '', phone: '', password: '', orgType: sp.get('type') || 'Restaurant',
    address: '', city: '', pincode: '', lat: '', lng: '', registrationDetails: '', operatingHours: '', pickupArrangements: '',
    foodCategories: ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, foodCategories: form.foodCategories.split(',').map((s) => s.trim()).filter(Boolean), lat: Number(form.lat) || 0, lng: Number(form.lng) || 0 };
      await api.post('/auth/register/donor', payload);
      await login(form.email, form.password);
      toast.success('Registered. Pending verification.');
      navigate('/donor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#faf6ef] p-4">
      <Card className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Donor Registration</h2>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
          <Input label="Organization Name" value={form.orgName} onChange={(e) => set('orgName', e.target.value)} required />
          <Select label="Business Category" value={form.orgType} onChange={(e) => set('orgType', e.target.value)}>
            {DONOR_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Owner / Representative Name" value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required />
          <div className="md:col-span-2 flex items-center gap-2">
            <Button type="button" variant="outline" onClick={async () => {
              try {
                const { getCurrentPosition, reverseGeocode } = await import('../utils/geo');
                const { lat, lng } = await getCurrentPosition();
                set('lat', String(lat)); set('lng', String(lng));
                const geo = await reverseGeocode(lat, lng);
                if (geo) { set('address', geo.address); set('city', geo.city); set('pincode', geo.pincode); }
                toast.success('Location fetched');
              } catch { toast.error('Could not fetch location'); }
            }}>Use My Location</Button>
            <span className="text-xs text-gray-500">Auto-fill GPS & address</span>
          </div>
          <Input label="Complete Address" className="md:col-span-2" value={form.address} onChange={(e) => set('address', e.target.value)} required />
          <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} required />
          <Input label="PIN Code" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
          <Input label="Latitude" value={form.lat} onChange={(e) => set('lat', e.target.value)} />
          <Input label="Longitude" value={form.lng} onChange={(e) => set('lng', e.target.value)} />
          <Input label="Registration Details" value={form.registrationDetails} onChange={(e) => set('registrationDetails', e.target.value)} />
          <Input label="Operating Hours" value={form.operatingHours} onChange={(e) => set('operatingHours', e.target.value)} />
          <Input label="Food Categories (comma separated)" className="md:col-span-2" value={form.foodCategories} onChange={(e) => set('foodCategories', e.target.value)} />
          <Input label="Preferred Pickup Arrangements" className="md:col-span-2" value={form.pickupArrangements} onChange={(e) => set('pickupArrangements', e.target.value)} />
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register as Donor'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
