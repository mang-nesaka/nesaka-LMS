export const DEFAULT_SCHOOL_LOCATION = {
  lat: -6.346129,
  lng: 108.099104,
};

const LEGACY_SCHOOL_LOCATION = {
  lat: -6.9175,
  lng: 107.6191,
};

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusMeters = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusMeters * c);
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
    Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

export function isWithinAttendanceRadius(
  lat: number,
  lng: number,
  schoolLat: number,
  schoolLng: number,
  radiusMeters: number,
): boolean {
  if (
    !isValidCoordinate(lat, lng) ||
    !isValidCoordinate(schoolLat, schoolLng) ||
    !Number.isFinite(radiusMeters) ||
    radiusMeters < 0
  ) {
    return false;
  }

  return calculateDistanceMeters(lat, lng, schoolLat, schoolLng) <= radiusMeters;
}

export function isLegacySchoolLocation(lat: number, lng: number): boolean {
  return lat === LEGACY_SCHOOL_LOCATION.lat && lng === LEGACY_SCHOOL_LOCATION.lng;
}

export function canUpdateSchoolLocation(role: string): boolean {
  return role === 'ADMIN';
}

export function getSchoolCoordinatesForUpdate(
  role: string,
  submitted: { lat: number; lng: number },
  current: { lat: number; lng: number },
): { lat: number; lng: number } {
  return canUpdateSchoolLocation(role) ? submitted : current;
}
