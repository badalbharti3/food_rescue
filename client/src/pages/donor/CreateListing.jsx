import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'cooked', totalQuantity: '', unit: 'packets', servingSize: '',
    prepTime: '', availableFrom: '', expiryDate: '', pickupDeadline: '', pickupAddress: '', lat: '', lng: '',
    city: '', storageRequirements: '', temperatureRequirements: '', packagingCondition: '', ingredients: '', allergens: '',
    allocationMode: 'review', minQtyPerNgo: '1', maxNgos: '5', partialAllowed: true, maxMatchDistanceKm: '25',
    allowAdditionalRequests: true, pickupSlots: '', specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        totalQuantity: Number(form.totalQuantity),
        lat: Number(form.lat) || 0, lng: Number(form.lng) || 0,
        minQtyPerNgo: Number(form.minQtyPerNgo) || 1,
        maxNgos: Number(form.maxNgos) || 5,
        maxMatchDistanceKm: Number(form.maxMatchDistanceKm) || 25,
        pickupSlots: form.pickupSlots.split(',').map((s) => s.trim()).filter(Boolean),
        partialAllowed: form.partialAllowed,
        allowAdditionalRequests: form.allowAdditionalRequests
      };
      await api.post('/food-listings', payload);
      toast.success('Listing created');
      navigate('/donor/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Create Food Listing</h2>
      <Card>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
          <Input label="Food Title" value={form.title} onChange={(e) => set('title', e.target.value)} required className="md:col-span-2" />
          <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} className="md:col-span-2" />
          <Select label="Category" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {['cooked','raw','packaged','bakery','dairy','produce','beverages','other'].map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input label="Quantity" type="number" value={form.totalQuantity} onChange={(e) => set('totalQuantity', e.target.value)} required />
          <Input label="Unit" value={form.unit} onChange={(e) => set('unit', e.target.value)} />
          <Input label="Serving Size" value={form.servingSize} onChange={(e) => set('servingSize', e.target.value)} />
          <Input label="Prep Time" type="datetime-local" value={form.prepTime} onChange={(e) => set('prepTime', e.target.value)} />
          <Input label="Available From" type="datetime-local" value={form.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} />
          <Input label="Expiry / Best Before" type="datetime-local" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} required />
          <Input label="Pickup Deadline" type="datetime-local" value={form.pickupDeadline} onChange={(e) => set('pickupDeadline', e.target.value)} required />
          <div className="md:col-span-2 flex items-center gap-2">
            <Button type="button" variant="outline" onClick={async () => {
              try {
                const { getCurrentPosition, reverseGeocode } = await import('../../utils/geo');
                const { lat, lng } = await getCurrentPosition();
                set('lat', String(lat)); set('lng', String(lng));
                const geo = await reverseGeocode(lat, lng);
                if (geo) { set('pickupAddress', geo.address); set('city', geo.city); }
                toast.success('Location fetched');
              } catch { toast.error('Could not fetch location'); }
            }}>Use My Location</Button>
            <span className="text-xs text-gray-500">Auto-fill pickup GPS & address</span>
          </div>
          <Input label="Pickup Address" value={form.pickupAddress} onChange={(e) => set('pickupAddress', e.target.value)} className="md:col-span-2" />
          <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
          <Input label="Latitude" value={form.lat} onChange={(e) => set('lat', e.target.value)} />
          <Input label="Longitude" value={form.lng} onChange={(e) => set('lng', e.target.value)} />
          <Input label="Storage Requirements" value={form.storageRequirements} onChange={(e) => set('storageRequirements', e.target.value)} />
          <Input label="Temperature Requirements" value={form.temperatureRequirements} onChange={(e) => set('temperatureRequirements', e.target.value)} />
          <Input label="Packaging Condition" value={form.packagingCondition} onChange={(e) => set('packagingCondition', e.target.value)} />
          <Input label="Ingredients" value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} />
          <Input label="Allergens" value={form.allergens} onChange={(e) => set('allergens', e.target.value)} />

          <h3 className="md:col-span-2 font-semibold mt-2">Allocation Preferences</h3>
          <Select label="Allocation Mode" value={form.allocationMode} onChange={(e) => set('allocationMode', e.target.value)}>
            <option value="single">Single NGO</option>
            <option value="multiple">Multiple NGO</option>
            <option value="review">Donor Review</option>
            <option value="auto">Pre-authorized Auto</option>
          </Select>
          <Input label="Min Qty per NGO" type="number" value={form.minQtyPerNgo} onChange={(e) => set('minQtyPerNgo', e.target.value)} />
          <Input label="Max NGOs" type="number" value={form.maxNgos} onChange={(e) => set('maxNgos', e.target.value)} />
          <Input label="Max Match Distance (km)" type="number" value={form.maxMatchDistanceKm} onChange={(e) => set('maxMatchDistanceKm', e.target.value)} />
          <Input label="Pickup Slots (comma)" value={form.pickupSlots} onChange={(e) => set('pickupSlots', e.target.value)} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.partialAllowed} onChange={(e) => set('partialAllowed', e.target.checked)} /> Partial allocation allowed</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allowAdditionalRequests} onChange={(e) => set('allowAdditionalRequests', e.target.checked)} /> Allow additional quantity requests</label>
          <Textarea label="Special Instructions" value={form.specialInstructions} onChange={(e) => set('specialInstructions', e.target.value)} className="md:col-span-2" />

          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Listing'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
