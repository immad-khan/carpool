const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

function proximityScore(distanceKm, maxDistanceKm) {
  if (maxDistanceKm <= 0) return 0;
  return Math.max(0, 1 - distanceKm / maxDistanceKm);
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function timeProximityScore(timeA, timeB, maxDiffMinutes) {
  const diff = Math.abs(timeToMinutes(timeA) - timeToMinutes(timeB));
  if (maxDiffMinutes <= 0) return 0;
  return Math.max(0, 1 - diff / maxDiffMinutes);
}

function dayOverlapScore(daysA, daysB) {
  const setA = new Set(daysA);
  const setB = new Set(daysB);
  const intersection = [...setA].filter((d) => setB.has(d));
  const smaller = Math.min(setA.size, setB.size) || 1;
  return intersection.length / smaller;
}

function computeOverlapScore(routeA, routeB, options = {}) {
  const maxGeoKm = options.maxGeoDistanceKm ?? Number(process.env.MATCH_MAX_GEO_DISTANCE_KM) ?? 3;
  const maxTimeMin = options.maxTimeDiffMin ?? Number(process.env.MATCH_MAX_TIME_DIFF_MIN) ?? 60;

  const originDistKm = haversineKm(routeA.origin, routeB.origin);
  const destDistKm = haversineKm(routeA.destination, routeB.destination);

  const originScore = proximityScore(originDistKm, maxGeoKm);
  const destScore = proximityScore(destDistKm, maxGeoKm);
  const timeScore = timeProximityScore(routeA.departureTime, routeB.departureTime, maxTimeMin);
  const dayScore = dayOverlapScore(routeA.daysOfWeek, routeB.daysOfWeek);

  const overlapScore =
    0.35 * originScore + 0.25 * destScore + 0.25 * timeScore + 0.15 * dayScore;

  return {
    overlapScore: Math.round(overlapScore * 100) / 100,
    originDistKm: Math.round(originDistKm * 100) / 100,
    destDistKm: Math.round(destDistKm * 100) / 100,
  };
}

module.exports = { haversineKm, computeOverlapScore };
