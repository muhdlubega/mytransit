import { GOOGLE_MAPS_API_KEY } from "../utils/constants";
import { DirectionRoute } from "../types/map";

interface DirectionsResult {
  routes: DirectionRoute[];
  status: string;
}

export const getDirections = async (
  origin: string,
  destination: string,
  mode: "transit" | "driving" | "walking" | "bicycling" = "transit"
): Promise<DirectionsResult> => {
  try {
    // Note: Direct Google Maps API calls from frontend have CORS restrictions
    // In production, you should use a backend proxy or the Maps JavaScript API

    // For demo purposes, return mock data
    return {
      status: "OK",
      routes: [
        {
          summary: `Via ${mode === "transit" ? "Public Transport" : mode}`,
          duration: "25 mins",
          distance: "8.5 km",
          polyline: "",
          steps: [
            {
              instruction: `Start from ${origin}`,
              distance: "0 m",
              duration: "0 min",
              travelMode: "WALKING",
            },
            {
              instruction: "Head north on Jalan Sultan",
              distance: "500 m",
              duration: "6 min",
              travelMode: "WALKING",
            },
            {
              instruction: "Take MRT to destination",
              distance: "7 km",
              duration: "15 min",
              travelMode: "TRANSIT",
            },
            {
              instruction: `Arrive at ${destination}`,
              distance: "1 km",
              duration: "4 min",
              travelMode: "WALKING",
            },
          ],
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching directions:", error);
    return { routes: [], status: "ERROR" };
  }
};

export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  try {
    // Mock geocoding
    return { lat: 3.139, lng: 101.6869 };
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};
