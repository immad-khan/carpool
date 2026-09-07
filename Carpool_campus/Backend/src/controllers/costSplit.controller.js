const { success } = require('../utils/apiResponse');
const { trips } = require('../mock/store');

async function get(req, res) {
  const trip = trips.get(req.params.tripId);
  const seats = trip?.seats || 3;
  const distanceKm = 12;
  const fuelPricePerLiter = 285.5;
  const efficiency = 5;
  const total = (distanceKm / efficiency) * fuelPricePerLiter;
  const perRider = total / seats;
  return success(res, { data: { tripId: req.params.tripId, totalFuelCost: total.toFixed(2), costPerRider: perRider.toFixed(2), seats, distanceKm } });
}

async function recalculate(req, res) {
  const { fuelPricePerLiter = 285.5 } = req.body;
  const distanceKm = 12;
  const efficiency = 5;
  const total = (distanceKm / efficiency) * fuelPricePerLiter;
  const perRider = (total / 3).toFixed(2);
  return success(res, { data: { totalFuelCost: total.toFixed(2), costPerRider: perRider } });
}

module.exports = { getCostSplit: get, recalculate };