export interface Coordinates {
  lat: number;
  lng: number;
}

export const EVENT_CENTER: Coordinates & { name: string } = {
  lat: 19.0760,
  lng: 72.8777,
  name: "Sentinel Metropolitan Security Zone",
};

export const PRESET_LOCATIONS: { name: string; lat: number; lng: number; category: string }[] = [
  { name: "North Entry Gate 1", lat: 19.0788, lng: 72.8762, category: "ENTRY" },
  { name: "South Exit Gate B", lat: 19.0732, lng: 72.8795, category: "EXIT" },
  { name: "Main Stage Arena", lat: 19.0762, lng: 72.8772, category: "STAGE" },
  { name: "North Parking Lot C", lat: 19.0810, lng: 72.8748, category: "PARKING" },
  { name: "Central Police Help Desk", lat: 19.0754, lng: 72.8782, category: "HELP_DESK" },
  { name: "East Medical Emergency Station", lat: 19.0772, lng: 72.8808, category: "MEDICAL" },
  { name: "VIP Perimeter & Control Tower", lat: 19.0740, lng: 72.8752, category: "RESTRICTED" },
];

/**
 * Calculates great-circle distance between two points in meters (Haversine formula).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Finds the closest response team matching the required team type.
 */
export function findNearestSuitableTeam<T extends { currentLatitude: number; currentLongitude: number; type: string; status: string }>(
  teams: T[],
  targetLat: number,
  targetLng: number,
  preferredType?: string
): { team: T; distanceMeters: number } | null {
  const availableTeams = teams.filter((t) => t.status === "AVAILABLE");
  if (availableTeams.length === 0) return null;

  // Prefer matching team type first
  const matchingType = preferredType
    ? availableTeams.filter((t) => t.type === preferredType)
    : availableTeams;

  const candidatePool = matchingType.length > 0 ? matchingType : availableTeams;

  let bestTeam: T | null = null;
  let minDistance = Infinity;

  for (const team of candidatePool) {
    const dist = calculateDistanceMeters(targetLat, targetLng, team.currentLatitude, team.currentLongitude);
    if (dist < minDistance) {
      minDistance = dist;
      bestTeam = team;
    }
  }

  return bestTeam ? { team: bestTeam, distanceMeters: minDistance } : null;
}
