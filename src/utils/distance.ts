import * as turf from "@turf/turf";
import { GTFSShape } from "../types/gtfs";

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const from = turf.point([lon1, lat1]);
  const to = turf.point([lon2, lat2]);
  return turf.distance(from, to, { units: "meters" });
};

// Find the nearest point on a route shape and return progress percentage
export const findPositionOnRoute = (
  lat: number,
  lon: number,
  shapePoints: GTFSShape[]
): {
  nearestPoint: { lat: number; lng: number };
  progress: number;
  distanceFromRoute: number;
} | null => {
  if (!shapePoints || shapePoints.length < 2) {
    return null;
  }

  // Create line from shape points
  const lineCoords = shapePoints.map(p => [p.shapePtLon, p.shapePtLat]);
  const line = turf.lineString(lineCoords);
  const point = turf.point([lon, lat]);

  // Find nearest point on line
  const snapped = turf.nearestPointOnLine(line, point);

  // Calculate total line length
  const totalLength = turf.length(line, { units: "kilometers" });

  // Calculate distance from start to snapped point
  const distanceFromStart = snapped.properties.location || 0;

  // Progress as percentage (0-1)
  const progress = totalLength > 0 ? distanceFromStart / totalLength : 0;

  // Distance from actual position to route
  const distanceFromRoute = turf.distance(point, snapped, { units: "meters" });

  return {
    nearestPoint: {
      lat: snapped.geometry.coordinates[1],
      lng: snapped.geometry.coordinates[0],
    },
    progress: Math.min(1, Math.max(0, progress)),
    distanceFromRoute,
  };
};

// Interpolate position along route shape
export const interpolateAlongRoute = (
  shapePoints: GTFSShape[],
  progress: number, // 0-1
  additionalDistance: number = 0 // meters to add
): { lat: number; lng: number } | null => {
  if (!shapePoints || shapePoints.length < 2) {
    return null;
  }

  const lineCoords = shapePoints.map(p => [p.shapePtLon, p.shapePtLat]);
  const line = turf.lineString(lineCoords);
  const totalLength = turf.length(line, { units: "kilometers" });

  // Calculate new distance along route
  let distanceKm = progress * totalLength + additionalDistance / 1000;

  // Clamp to route bounds (allow looping for circular routes)
  if (distanceKm > totalLength) {
    // Check if route is circular (start and end are close)
    const startPoint = shapePoints[0];
    const endPoint = shapePoints[shapePoints.length - 1];
    const isCircular =
      calculateDistance(
        startPoint.shapePtLat,
        startPoint.shapePtLon,
        endPoint.shapePtLat,
        endPoint.shapePtLon
      ) < 100; // Within 100m

    if (isCircular) {
      distanceKm = distanceKm % totalLength;
    } else {
      distanceKm = totalLength;
    }
  }

  distanceKm = Math.max(0, distanceKm);

  // Get point along line
  const point = turf.along(line, distanceKm, { units: "kilometers" });

  return {
    lat: point.geometry.coordinates[1],
    lng: point.geometry.coordinates[0],
  };
};

// Simple interpolation without route (fallback)
export const interpolatePosition = (
  startLat: number,
  startLon: number,
  bearing: number,
  speed: number, // meters per second
  elapsedTime: number, // seconds
  shapePoints?: GTFSShape[]
): { lat: number; lng: number } => {
  const distanceTraveled = speed * elapsedTime;

  // If we have shape points, try to interpolate along the route
  if (shapePoints && shapePoints.length >= 2) {
    const positionInfo = findPositionOnRoute(startLat, startLon, shapePoints);

    if (positionInfo && positionInfo.distanceFromRoute < 500) {
      // Within 500m of route
      const newPosition = interpolateAlongRoute(
        shapePoints,
        positionInfo.progress,
        distanceTraveled
      );
      if (newPosition) {
        return newPosition;
      }
    }
  }

  // Fallback: Simple bearing-based interpolation
  if (distanceTraveled === 0) {
    return { lat: startLat, lng: startLon };
  }

  const destination = turf.destination(
    turf.point([startLon, startLat]),
    distanceTraveled / 1000,
    bearing,
    { units: "kilometers" }
  );

  return {
    lat: destination.geometry.coordinates[1],
    lng: destination.geometry.coordinates[0],
  };
};

// Calculate bearing between two points
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const point1 = turf.point([lon1, lat1]);
  const point2 = turf.point([lon2, lat2]);
  return turf.bearing(point1, point2);
};

// Get ETA calculation
export const getETA = (
  distance: number,
  speedMps: number,
  stopsRemaining: number = 0,
  avgStopTime: number = 30
): number => {
  if (speedMps === 0) return Infinity;
  const travelTime = distance / speedMps;
  const stopTime = stopsRemaining * avgStopTime;
  return travelTime + stopTime;
};

// Convert shape points to GeoJSON LineString coordinates
export const shapeToCoordinates = (
  shapePoints: GTFSShape[]
): [number, number][] => {
  return shapePoints
    .sort((a, b) => a.shapePtSequence - b.shapePtSequence)
    .map(p => [p.shapePtLon, p.shapePtLat]);
};
