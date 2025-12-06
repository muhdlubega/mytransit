import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Vehicle, VehicleFilter } from "../types/vehicle";
import { GTFSStaticData, GTFSShape } from "../types/gtfs";
import { fetchGTFSRealtime, fetchGTFSStatic } from "../services/gtfsService";
import { interpolatePosition, findPositionOnRoute } from "../utils/distance";
import {
  GTFS_REFRESH_INTERVAL,
  INTERPOLATION_INTERVAL,
} from "../utils/constants";

interface TransitContextType {
  vehicles: Vehicle[];
  allVehicles: Vehicle[];
  staticData: GTFSStaticData | null;
  selectedVehicle: Vehicle | null;
  filters: VehicleFilter;
  selectedFeed: { type: string; category: string };
  isLoading: boolean;
  error: string | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setFilters: (filters: VehicleFilter) => void;
  setSelectedFeed: (feed: { type: string; category: string }) => void;
  refreshVehicles: () => Promise<void>;
  getShapeForVehicle: (vehicle: Vehicle) => GTFSShape[] | null;
}

const TransitContext = createContext<TransitContextType | undefined>(undefined);

export const useTransit = () => {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error("useTransit must be used within a TransitProvider");
  }
  return context;
};

interface TransitProviderProps {
  children: ReactNode;
}

export const TransitProvider: React.FC<TransitProviderProps> = ({
  children,
}) => {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [staticData, setStaticData] = useState<GTFSStaticData | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedFeed, setSelectedFeed] = useState({
    type: "prasarana",
    category: "rapid-bus-mrtfeeder",
  });
  const [filters, setFilters] = useState<VehicleFilter>({
    operator: null,
    vehicleType: null,
    routeId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const interpolationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const staticDataRef = useRef<GTFSStaticData | null>(null);

  // Keep staticDataRef in sync
  useEffect(() => {
    staticDataRef.current = staticData;
  }, [staticData]);

  // Get shape for a vehicle
  const getShapeForVehicle = useCallback(
    (vehicle: Vehicle): GTFSShape[] | null => {
      if (!staticDataRef.current) return null;

      // First try to get shape from tripId
      if (vehicle.tripId) {
        const trip = staticDataRef.current.trips.find(
          t => t.tripId === vehicle.tripId
        );
        if (trip?.shapeId) {
          const shape = staticDataRef.current.shapes.get(trip.shapeId);
          if (shape) return shape;
        }
      }

      // Try to find shape by routeId
      if (vehicle.routeId) {
        const trip = staticDataRef.current.trips.find(
          t => t.routeId === vehicle.routeId
        );
        if (trip?.shapeId) {
          const shape = staticDataRef.current.shapes.get(trip.shapeId);
          if (shape) return shape;
        }
      }

      return null;
    },
    []
  );

  // Load static data when feed changes
  useEffect(() => {
    const loadStaticData = async () => {
      console.log("Loading static data for:", selectedFeed);
      setIsLoading(true);
      const data = await fetchGTFSStatic(
        selectedFeed.type,
        selectedFeed.category
      );
      if (data) {
        setStaticData(data);
        staticDataRef.current = data;
        console.log("Static data loaded:", {
          routes: data.routes.length,
          trips: data.trips.length,
          shapes: data.shapes.size,
        });
      }
      setIsLoading(false);
    };
    loadStaticData();
  }, [selectedFeed.type, selectedFeed.category]);

  // Enrich vehicles with shape data
  const enrichVehiclesWithShapes = useCallback(
    (vehicles: Vehicle[]): Vehicle[] => {
      if (!staticDataRef.current) return vehicles;

      return vehicles.map(vehicle => {
        const shapePoints = getShapeForVehicle(vehicle);
        const route = staticDataRef.current?.routes.find(
          r => r.routeId === vehicle.routeId
        );
        const trip = staticDataRef.current?.trips.find(
          t => t.tripId === vehicle.tripId
        );

        // Find progress along route
        let progressAlongRoute = 0;
        if (shapePoints && shapePoints.length >= 2) {
          const posInfo = findPositionOnRoute(
            vehicle.latitude,
            vehicle.longitude,
            shapePoints
          );
          if (posInfo) {
            progressAlongRoute = posInfo.progress;
          }
        }

        return {
          ...vehicle,
          shapeId: trip?.shapeId,
          shapePoints: shapePoints ?? undefined,
          progressAlongRoute,
          routeName:
            route?.routeLongName ||
            route?.routeShortName ||
            trip?.tripHeadsign ||
            vehicle.routeName,
          routeColor: route?.routeColor || vehicle.routeColor,
        };
      });
    },
    [getShapeForVehicle]
  );

  // Fetch realtime vehicles
  const refreshVehicles = useCallback(async () => {
    try {
      setError(null);
      console.log("Refreshing vehicles for:", selectedFeed);

      const rawVehicles = await fetchGTFSRealtime(
        selectedFeed.type,
        selectedFeed.category
      );

      if (rawVehicles.length === 0) {
        console.warn("No vehicles returned from API");
        setError("No vehicles currently active for this feed");
      }

      // Enrich with shape data
      const enrichedVehicles = enrichVehiclesWithShapes(rawVehicles);

      setAllVehicles(enrichedVehicles);
      lastUpdateRef.current = Date.now();
      setIsLoading(false);
    } catch (err) {
      console.error("Error refreshing vehicles:", err);
      setError("Failed to fetch vehicle data");
      setIsLoading(false);
    }
  }, [selectedFeed, enrichVehiclesWithShapes]);

  // Initial load and periodic refresh
  useEffect(() => {
    // Wait for static data before fetching vehicles
    if (!staticData) return;

    refreshVehicles();

    refreshIntervalRef.current = setInterval(
      refreshVehicles,
      GTFS_REFRESH_INTERVAL
    );

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshVehicles, staticData]);

  // Interpolation loop - vehicles follow their route shapes
  useEffect(() => {
    const interpolate = () => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdateRef.current) / 1000;

      if (elapsedSeconds > 60) return; // Skip if too stale

      setAllVehicles(prevVehicles =>
        prevVehicles.map(vehicle => {
          if (!vehicle.speed || vehicle.speed <= 0) {
            return {
              ...vehicle,
              interpolatedLat: vehicle.latitude,
              interpolatedLng: vehicle.longitude,
            };
          }

          // Interpolate along route shape if available
          const interpolated = interpolatePosition(
            vehicle.latitude,
            vehicle.longitude,
            vehicle.bearing || 0,
            vehicle.speed,
            Math.min(elapsedSeconds, 30),
            vehicle.shapePoints
          );

          return {
            ...vehicle,
            interpolatedLat: interpolated.lat,
            interpolatedLng: interpolated.lng,
          };
        })
      );
    };

    interpolationIntervalRef.current = setInterval(
      interpolate,
      INTERPOLATION_INTERVAL
    );

    return () => {
      if (interpolationIntervalRef.current) {
        clearInterval(interpolationIntervalRef.current);
      }
    };
  }, []);

  // Update selected vehicle when vehicles refresh
  useEffect(() => {
    if (selectedVehicle) {
      const updated = allVehicles.find(v => v.id === selectedVehicle.id);
      if (updated) {
        setSelectedVehicle(updated);
      }
    }
  }, [allVehicles, selectedVehicle?.id]);

  // Filter vehicles
  const filteredVehicles = allVehicles.filter(vehicle => {
    if (filters.operator && vehicle.operator !== filters.operator) {
      return false;
    }
    if (filters.vehicleType && vehicle.vehicleType !== filters.vehicleType) {
      return false;
    }
    if (filters.routeId && vehicle.routeId !== filters.routeId) {
      return false;
    }
    return true;
  });

  return (
    <TransitContext.Provider
      value={{
        vehicles: filteredVehicles,
        allVehicles,
        staticData,
        selectedVehicle,
        filters,
        selectedFeed,
        isLoading,
        error,
        setSelectedVehicle,
        setFilters,
        setSelectedFeed,
        refreshVehicles,
        getShapeForVehicle,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};
