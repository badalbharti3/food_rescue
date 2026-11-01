export async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    return {
      address: data.display_name || '',
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.state || '',
      pincode: data.address?.postcode || ''
    };
  } catch {
    return null;
  }
}
