import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import mapboxgl from "mapbox-gl";
import { MapViewport, UserLocation } from "../types/map";
import { MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM } from "../utils/constants";
import { PlaceDetails, DirectionRoute } from "../services/googleMapsService";

export type RouteDisplayMode = "none" | "directions" | "vehicle";

interface MapContextType {
  map: mapboxgl.Map | null;
  setMap: (map: mapboxgl.Map | null) => void;
  viewport: MapViewport;
  setViewport: (viewport: MapViewport) => void;
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
  isLocationEnabled: boolean;
  enableLocation: () => void;
  disableLocation: () => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  flyToBounds: (
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    },
    padding?: { left: number; right: number }
  ) => void;
  highlightedRouteId: string | null;
  setHighlightedRouteId: (routeId: string | null) => void;
  // Route planning state
  routeOrigin: PlaceDetails | null;
  setRouteOrigin: (place: PlaceDetails | null) => void;
  routeDestination: PlaceDetails | null;
  setRouteDestination: (place: PlaceDetails | null) => void;
  selectedDirection: DirectionRoute | null;
  setSelectedDirection: (route: DirectionRoute | null) => void;
  clearRoutePoints: () => void;
  // Route display mode - determines which route to show
  routeDisplayMode: RouteDisplayMode;
  setRouteDisplayMode: (mode: RouteDisplayMode) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};

interface MapProviderProps {
  children: ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [viewport, setViewport] = useState<MapViewport>({
    center: MAP_INITIAL_CENTER,
    zoom: MAP_INITIAL_ZOOM,
  });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [highlightedRouteId, setHighlightedRouteId] = useState<string | null>(
    null
  );
  const [routeOrigin, setRouteOrigin] = useState<PlaceDetails | null>(null);
  const [routeDestination, setRouteDestination] = useState<PlaceDetails | null>(
    null
  );
  const [selectedDirection, setSelectedDirection] =
    useState<DirectionRoute | null>(null);
  const [routeDisplayMode, setRouteDisplayMode] =
    useState<RouteDisplayMode>("none");

  const watchIdRef = useRef<number | null>(null);

  const enableLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        });
        setIsLocationEnabled(true);
      },
      error => {
        console.error("Geolocation error:", error);
        setIsLocationEnabled(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  };

  const disableLocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setUserLocation(null);
    setIsLocationEnabled(false);
  };

  const flyTo = useCallback(
    (lng: number, lat: number, zoom = 15) => {
      if (map) {
        map.flyTo({
          center: [lng, lat],
          zoom,
          duration: 1500,
        });
      }
    },
    [map]
  );

  const flyToBounds = useCallback(
    (
      bounds: {
        northeast: { lat: number; lng: number };
        southwest: { lat: number; lng: number };
      },
      padding?: { left: number; right: number }
    ) => {
      if (map) {
        map.fitBounds(
          [
            [bounds.southwest.lng, bounds.southwest.lat],
            [bounds.northeast.lng, bounds.northeast.lat],
          ],
          {
            padding: {
              top: 100,
              bottom: 150,
              left: padding?.left ?? 50,
              right: padding?.right ?? 50,
            },
            maxZoom: 16,
            duration: 1000,
          }
        );
      }
    },
    [map]
  );

  const clearRoutePoints = useCallback(() => {
    setRouteOrigin(null);
    setRouteDestination(null);
    setSelectedDirection(null);
    setRouteDisplayMode("none");
  }, []);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        viewport,
        setViewport,
        userLocation,
        setUserLocation,
        isLocationEnabled,
        enableLocation,
        disableLocation,
        flyTo,
        flyToBounds,
        highlightedRouteId,
        setHighlightedRouteId,
        routeOrigin,
        setRouteOrigin,
        routeDestination,
        setRouteDestination,
        selectedDirection,
        setSelectedDirection,
        clearRoutePoints,
        routeDisplayMode,
        setRouteDisplayMode,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
