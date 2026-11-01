import NearbyFood from './NearbyFood';
export default function MapView() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Map View</h2>
      <p className="text-sm text-gray-500 mb-4">Map provider not configured; showing list view. Configure Google Maps API key to enable map.</p>
      <NearbyFood />
    </div>
  );
}
