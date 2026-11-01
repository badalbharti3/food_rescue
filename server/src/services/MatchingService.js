const Organization = require('../models/Organization');

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// [0,0] is the schema default → treat as "no location set"
function hasValidCoords(coords) {
  return Array.isArray(coords) && coords.length === 2
    && Number.isFinite(coords[0]) && Number.isFinite(coords[1])
    && !(coords[0] === 0 && coords[1] === 0);
}

class MatchingService {
  async findEligibleNgos(listing, donorOrg) {
    const listingCoords = listing.location && listing.location.coordinates ? listing.location.coordinates : null;
    const orgCoords = donorOrg.location && donorOrg.location.coordinates ? donorOrg.location.coordinates : null;
    const donorValid = hasValidCoords(listingCoords) ? listingCoords : (hasValidCoords(orgCoords) ? orgCoords : null);
    const [dLng, dLat] = donorValid || [0, 0];
    const maxDist = listing.maxMatchDistanceKm || 25;
    const ngos = await Organization.find({
      accountType: 'receiver',
      verificationStatus: 'verified'
    });
    // isActive not on org; check user? skip for now
    const eligible = [];
    for (const ngo of ngos) {
      const ngoCoords = ngo.location && ngo.location.coordinates;
      // no real coordinates → cannot compute distance → excluded (never blast unlocated NGOs)
      if (!hasValidCoords(ngoCoords)) continue;
      const [nLng, nLat] = ngoCoords;
      // donor has no coordinates: fall back to same-city only so we never notify everyone
      const dist = donorValid ? haversineKm(dLat, dLng, nLat, nLng) : null;
      if (donorValid) {
        if (dist > maxDist) continue;
        if (ngo.serviceRadiusKm && dist > ngo.serviceRadiusKm) continue;
      } else {
        const sameCity = ngo.city && listing.city && ngo.city.trim().toLowerCase() === listing.city.trim().toLowerCase();
        if (!sameCity) continue;
      }
      // food preference check
      if (ngo.foodPreferences && ngo.foodPreferences.length && !ngo.foodPreferences.includes(listing.category) && !ngo.foodPreferences.includes('any')) continue;
      // capacity remaining: simple check using totalReceivedKg vs dailyReceiveKg; if dailyReceiveKg 0 treat as unlimited-ish
      if (ngo.capacity && ngo.capacity.dailyReceiveKg > 0) {
        // crude: if totalReceived in last day? skip exact; allow
      }
      // food must be collectable before deadline: distance-based travel time estimate (avg 30km/h)
      if (donorValid) {
        const travelHours = dist / 30;
        const deadline = new Date(listing.pickupDeadline);
        if (Date.now() + travelHours * 3600000 > deadline.getTime()) continue;
      }
      const score = this.calculateScore(listing, ngo, donorValid ? dist : 10);
      eligible.push({ ngo, distanceKm: dist != null ? Math.round(dist * 10) / 10 : null, score });
    }
    // sort by score desc, then rotation tie-break by lastAllocationAt asc
    eligible.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const la = a.ngo.lastAllocationAt ? a.ngo.lastAllocationAt.getTime() : 0;
      const lb = b.ngo.lastAllocationAt ? b.ngo.lastAllocationAt.getTime() : 0;
      return la - lb;
    });
    return eligible;
  }

  calculateScore(listing, ngo, dist) {
    // weights: need 30, distance 25, capacity fit 20, fairness 15, reliability 10
    // need/urgency: based on declared? use capacity utilization (more need if less received) -> simple
    const need = ngo.capacity && ngo.capacity.dailyReceiveKg > 0 ? Math.min(1, (ngo.capacity.dailyReceiveKg - (ngo.totalReceivedKg || 0) % (ngo.capacity.dailyReceiveKg || 1)) / (ngo.capacity.dailyReceiveKg || 1)) : 0.7;
    const distanceScore = Math.max(0, 1 - dist / 25);
    const capacityFit = 0.7; // placeholder fit
    // fairness: lower if recently received substantial
    const fairness = ngo.lastAllocationAt ? Math.min(1, (Date.now() - ngo.lastAllocationAt.getTime()) / (7 * 86400000)) : 1;
    // new NGO boost: if no history, fairness high
    const newBoost = (ngo.completedPickups === 0 && ngo.totalReceivedKg === 0) ? 0.2 : 0;
    const reliability = ngo.completedPickups + ngo.missedPickups > 0 ? ngo.completedPickups / (ngo.completedPickups + ngo.missedPickups) : 0.8;
    const score = need * 0.30 + distanceScore * 0.25 + capacityFit * 0.20 + (fairness + newBoost) * 0.15 + reliability * 0.10;
    return Math.round(score * 1000) / 1000;
  }
}

module.exports = new MatchingService();
module.exports.haversineKm = haversineKm;
module.exports.hasValidCoords = hasValidCoords;
