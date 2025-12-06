import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from "react";
import mapboxgl from "mapbox-gl";
import { MapViewport, UserLocation } from "../types/map";
import { MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM } from "../utils/constants";

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
  highlightedRouteId: string | null;
  setHighlightedRouteId: (routeId: string | null) => void;
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

  const flyTo = (lng: number, lat: number, zoom = 15) => {
    if (map) {
      map.flyTo({
        center: [lng, lat],
        zoom,
        duration: 1500,
      });
    }
  };

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
        highlightedRouteId,
        setHighlightedRouteId,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
