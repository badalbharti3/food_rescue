const ImpactRecord = require('../models/ImpactRecord');
const Organization = require('../models/Organization');

// estimation factors (publicly cited food-waste averages)
const KG_PER_PACKET = 0.3;   // approx kg per dry/packet unit
const MEALS_PER_KG = 2.4;    // avg meals from 1 kg rescued food
const CO2_PER_KG = 2.5;      // kg CO2e avoided per kg food
const WATER_PER_KG = 1000;   // liters saved per kg food

class ImpactService {
  async monthlyCertificate(orgId, accountType, month) { // month = 'YYYY-MM'
    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    const match = { completedAt: { $gte: start, $lt: end } };
    if (accountType === 'donor') match.donor = orgId; else match.ngo = orgId;

    const org = await Organization.findById(orgId).select('orgName orgType city verificationStatus');
    if (!org) throw Object.assign(new Error('Organization not found'), { status: 404 });

    const records = await ImpactRecord.find(match).populate('donor ngo', 'orgName').sort({ completedAt: 1 });
    let kg = 0, packets = 0;
    const partnerMap = new Map();
    for (const r of records) {
      const qty = r.actualCollectedQuantity || 0;
      if (r.unit === 'kg') kg += qty;
      else if (r.unit === 'packets') packets += qty;
      else kg += 0; // other units ignored for kg math
      const partner = accountType === 'donor' ? r.ngo?.orgName : r.donor?.orgName;
      if (partner) partnerMap.set(partner, (partnerMap.get(partner) || 0) + qty);
    }
    const kgTotal = Math.round((kg + packets * KG_PER_PACKET) * 10) / 10;
    const meals = Math.round(kgTotal * MEALS_PER_KG);
    const partners = [...partnerMap.entries()].sort((a, b) => b[1] - a[1]);

    return {
      org: org,
      role: accountType,
      month,
      pickups: records.length,
      kg: kgTotal,
      packets: Math.round(packets),
      meals,
      co2Kg: Math.round(kgTotal * CO2_PER_KG),
      waterL: Math.round(kgTotal * WATER_PER_KG),
      partners,
      generatedAt: new Date(),
      note: 'Based on OTP-verified pickups only.'
    };
  }
}

module.exports = new ImpactService();
