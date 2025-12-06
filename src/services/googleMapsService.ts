import { GOOGLE_MAPS_API_KEY } from "../utils/constants";

// Types
export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface DirectionRoute {
  summary: string;
  duration: string;
  durationValue: number;
  distance: string;
  distanceValue: number;
  steps: DirectionStep[];
  polyline: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
  travelMode: string;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  polyline: string;
  transitDetails?: {
    lineName: string;
    lineShortName: string;
    vehicleType: string;
    departureStop: string;
    arrivalStop: string;
    numStops: number;
  };
}

export interface DirectionsResult {
  routes: DirectionRoute[];
  status: string;
}

// ============================================
// Places API (New) - Autocomplete
// ============================================
export const getPlaceAutocomplete = async (
  input: string
): Promise<PlacePrediction[]> => {
  if (!input || input.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        },
        body: JSON.stringify({
          input,
          includedRegionCodes: ["my"], // Malaysia
          languageCode: "en",
        }),
      }
    );

    if (!response.ok) {
      console.error("Places Autocomplete error:", await response.text());
      return [];
    }

    const data = await response.json();

    if (!data.suggestions) {
      return [];
    }

    return data.suggestions
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        placeId: s.placePrediction.placeId,
        description: s.placePrediction.text?.text || "",
        mainText:
          s.placePrediction.structuredFormat?.mainText?.text ||
          s.placePrediction.text?.text ||
          "",
        secondaryText:
          s.placePrediction.structuredFormat?.secondaryText?.text || "",
      }));
  } catch (error) {
    console.error("Error fetching place autocomplete:", error);
    return [];
  }
};

// ============================================
// Places API (New) - Get Place Details
// ============================================
export const getPlaceDetails = async (
  placeId: string
): Promise<PlaceDetails | null> => {
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
        },
      }
    );

    if (!response.ok) {
      console.error("Place Details error:", await response.text());
      return null;
    }

    const data = await response.json();

    return {
      placeId: data.id || placeId,
      name: data.displayName?.text || "",
      address: data.formattedAddress || "",
      lat: data.location?.latitude || 0,
      lng: data.location?.longitude || 0,
    };
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
};

// ============================================
// Routes API - Compute Routes
// ============================================
type TravelMode = "TRANSIT" | "DRIVE" | "WALK" | "BICYCLE";

const mapTravelMode = (mode: string): TravelMode => {
  const modeMap: Record<string, TravelMode> = {
    TRANSIT: "TRANSIT",
    DRIVING: "DRIVE",
    WALKING: "WALK",
    BICYCLING: "BICYCLE",
  };
  return modeMap[mode] || "DRIVE";
};

export const getDirections = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: "TRANSIT" | "DRIVING" | "WALKING" | "BICYCLING" = "DRIVING"
): Promise<DirectionsResult> => {
  try {
    const travelMode = mapTravelMode(mode);

    const requestBody: any = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode,
      computeAlternativeRoutes: true,
      languageCode: "en",
      units: "METRIC",
    };

    // Add transit preferences for transit mode
    if (travelMode === "TRANSIT") {
      requestBody.transitPreferences = {
        routingPreference: "LESS_WALKING",
        allowedTravelModes: ["BUS", "RAIL", "SUBWAY", "LIGHT_RAIL"],
      };
    }

    // Add routing preference for driving
    if (travelMode === "DRIVE") {
      requestBody.routingPreference = "TRAFFIC_AWARE";
    }

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline,routes.legs,routes.description,routes.viewport",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Routes API error:", errorText);
      return { routes: [], status: "ERROR" };
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return { routes: [], status: "ZERO_RESULTS" };
    }

    const routes: DirectionRoute[] = data.routes.map(
      (route: any, index: number) => {
        const leg = route.legs?.[0] || {};
        const durationSeconds = parseInt(
          route.duration?.replace("s", "") || "0"
        );
        const distanceMeters = route.distanceMeters || 0;

        // Extract steps from leg
        const steps: DirectionStep[] = (leg.steps || []).map((step: any) => {
          const stepDuration = parseInt(
            step.staticDuration?.replace("s", "") || "0"
          );

          return {
            instruction:
              step.navigationInstruction?.instructions ||
              getStepInstruction(step, travelMode),
            distance: formatDistance(step.distanceMeters || 0),
            duration: formatDuration(stepDuration),
            travelMode: step.travelMode || travelMode,
            startLocation: {
              lat: step.startLocation?.latLng?.latitude || 0,
              lng: step.startLocation?.latLng?.longitude || 0,
            },
            endLocation: {
              lat: step.endLocation?.latLng?.latitude || 0,
              lng: step.endLocation?.latLng?.longitude || 0,
            },
            polyline: step.polyline?.encodedPolyline || "",
            transitDetails: step.transitDetails
              ? {
                  lineName: step.transitDetails.transitLine?.name || "",
                  lineShortName:
                    step.transitDetails.transitLine?.nameShort || "",
                  vehicleType:
                    step.transitDetails.transitLine?.vehicle?.type || "",
                  departureStop:
                    step.transitDetails.stopDetails?.departureStop?.name || "",
                  arrivalStop:
                    step.transitDetails.stopDetails?.arrivalStop?.name || "",
                  numStops: step.transitDetails.stopCount || 0,
                }
              : undefined,
          };
        });

        return {
          summary: route.description || `Route ${index + 1}`,
          duration: formatDuration(durationSeconds),
          durationValue: durationSeconds,
          distance: formatDistance(distanceMeters),
          distanceValue: distanceMeters,
          polyline: route.polyline?.encodedPolyline || "",
          bounds: {
            northeast: {
              lat: route.viewport?.high?.latitude || destination.lat,
              lng: route.viewport?.high?.longitude || destination.lng,
            },
            southwest: {
              lat: route.viewport?.low?.latitude || origin.lat,
              lng: route.viewport?.low?.longitude || origin.lng,
            },
          },
          steps,
        };
      }
    );

    return { routes, status: "OK" };
  } catch (error) {
    console.error("Error fetching directions:", error);
    return { routes: [], status: "ERROR" };
  }
};

// Helper to generate step instruction
const getStepInstruction = (step: any, travelMode: TravelMode): string => {
  if (step.transitDetails) {
    const line = step.transitDetails.transitLine;
    const departure =
      step.transitDetails.stopDetails?.departureStop?.name || "";
    const arrival = step.transitDetails.stopDetails?.arrivalStop?.name || "";
    return `Take ${
      line?.nameShort || line?.name || "transit"
    } from ${departure} to ${arrival}`;
  }

  if (travelMode === "WALK") {
    return "Walk to destination";
  }

  if (travelMode === "DRIVE") {
    return "Drive to destination";
  }

  return "Continue to destination";
};

// ============================================
// Get Driving Time from Vehicle to User
// ============================================
export const getDrivingTimeToUser = async (
  vehicleLat: number,
  vehicleLng: number,
  userLat: number,
  userLng: number
): Promise<{ duration: string; durationValue: number } | null> => {
  try {
    const result = await getDirections(
      { lat: vehicleLat, lng: vehicleLng },
      { lat: userLat, lng: userLng },
      "DRIVING"
    );

    if (result.status === "OK" && result.routes.length > 0) {
      return {
        duration: result.routes[0].duration,
        durationValue: result.routes[0].durationValue,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting driving time:", error);
    return null;
  }
};

// ============================================
// Utility Functions
// ============================================

// Format duration from seconds
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
};

// Format distance from meters
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

// Decode polyline to coordinates
export const decodePolyline = (encoded: string): [number, number][] => {
  if (!encoded) return [];

  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    // Routes API returns coordinates in 1e5 format
    points.push([lng / 1e5, lat / 1e5]);
  }

  return points;
};

// Encode coordinates to polyline (if needed)
export const encodePolyline = (coordinates: [number, number][]): string => {
  let encoded = "";
  let prevLat = 0;
  let prevLng = 0;

  for (const [lng, lat] of coordinates) {
    const latE5 = Math.round(lat * 1e5);
    const lngE5 = Math.round(lng * 1e5);

    encoded += encodeNumber(latE5 - prevLat);
    encoded += encodeNumber(lngE5 - prevLng);

    prevLat = latE5;
    prevLng = lngE5;
  }

  return encoded;
};

const encodeNumber = (num: number): string => {
  let encoded = "";
  let value = num < 0 ? ~(num << 1) : num << 1;

  while (value >= 0x20) {
    encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
    value >>= 5;
  }

  encoded += String.fromCharCode(value + 63);
  return encoded;
};
