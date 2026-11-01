import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import api from '../services/api';

const RECEIVER_TYPES = ['Registered NGO','Charitable Organization','Orphanage','Old-age Home','Homeless Shelter','Community Kitchen','Food Bank','Religious Charitable Institution','Authorized Community Welfare Organization','Other Eligible Food Redistribution Organization'];

export default function RegisterReceiver() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orgName: '', representativeName: '', email: '', phone: '', password: '', orgType: 'Registered NGO',
    registrationNumber: '', address: '', city: '', pincode: '', lat: '', lng: '',
    storageCapacity: '', dailyCapacity: '', maxPickupDistance: '10', foodPreferences: '', operatingHours: '',
    vehicleAvailable: false, staffAvailability: ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        lat: Number(form.lat) || 0, lng: Number(form.lng) || 0,
        storageCapacity: Number(form.storageCapacity) || 0,
        dailyCapacity: Number(form.dailyCapacity) || 0,
        maxPickupDistance: Number(form.maxPickupDistance) || 10,
        foodPreferences: form.foodPreferences.split(',').map((s) => s.trim()).filter(Boolean),
        vehicleAvailable: form.vehicleAvailable
      };
      await api.post('/auth/register/receiver', payload);
      await login(form.email, form.password);
      toast.success('Registered. Pending verification.');
      navigate('/receiver');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#faf6ef] p-4">
      <Card className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">NGO / Receiver Registration</h2>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
          <Input label="Organization Name" value={form.orgName} onChange={(e) => set('orgName', e.target.value)} required />
          <Select label="Organization Type" value={form.orgType} onChange={(e) => set('orgType', e.target.value)}>
            {RECEIVER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Authorized Representative" value={form.representativeName} onChange={(e) => set('representativeName', e.target.value)} required />
          <Input label="Registration Number" value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} />
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
          <Input label="Address" className="md:col-span-2" value={form.address} onChange={(e) => set('address', e.target.value)} required />
          <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} required />
          <Input label="PIN Code" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
          <Input label="Latitude" value={form.lat} onChange={(e) => set('lat', e.target.value)} />
          <Input label="Longitude" value={form.lng} onChange={(e) => set('lng', e.target.value)} />
          <Input label="Storage Capacity (kg)" value={form.storageCapacity} onChange={(e) => set('storageCapacity', e.target.value)} />
          <Input label="Daily Receive Capacity (kg)" value={form.dailyCapacity} onChange={(e) => set('dailyCapacity', e.target.value)} />
          <Input label="Max Pickup Distance (km)" value={form.maxPickupDistance} onChange={(e) => set('maxPickupDistance', e.target.value)} />
          <Input label="Food Preferences (comma separated)" value={form.foodPreferences} onChange={(e) => set('foodPreferences', e.target.value)} />
          <Input label="Operating Hours" value={form.operatingHours} onChange={(e) => set('operatingHours', e.target.value)} />
          <Input label="Staff Availability" value={form.staffAvailability} onChange={(e) => set('staffAvailability', e.target.value)} />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.vehicleAvailable} onChange={(e) => set('vehicleAvailable', e.target.checked)} />
            Vehicle available for pickup
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Organization'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
