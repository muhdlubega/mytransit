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
  lastDataUpdate: number;
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
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
  const [lastDataUpdate, setLastDataUpdate] = useState<number>(0);

  const lastUpdateRef = useRef<number>(Date.now());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const interpolationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const staticDataRef = useRef<GTFSStaticData | null>(null);
  const vehiclesRef = useRef<Vehicle[]>([]);

  // Keep refs in sync
  useEffect(() => {
    staticDataRef.current = staticData;
  }, [staticData]);

  useEffect(() => {
    vehiclesRef.current = allVehicles;
  }, [allVehicles]);

  // Get shape for a vehicle
  const getShapeForVehicle = useCallback(
    (vehicle: Vehicle): GTFSShape[] | null => {
      if (!staticDataRef.current) return null;

      if (vehicle.tripId) {
        const trip = staticDataRef.current.trips.find(
          t => t.tripId === vehicle.tripId
        );
        if (trip?.shapeId) {
          const shape = staticDataRef.current.shapes.get(trip.shapeId);
          if (shape) return shape;
        }
      }

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

  // Get selected vehicle from current vehicles list by ID
  const selectedVehicle = selectedVehicleId
    ? allVehicles.find(v => v.id === selectedVehicleId) || null
    : null;

  // Set selected vehicle - store only the ID to preserve selection across updates
  const setSelectedVehicle = useCallback((vehicle: Vehicle | null) => {
    console.log("Setting selected vehicle:", vehicle?.id, vehicle?.label);
    setSelectedVehicleId(vehicle?.id || null);
  }, []);

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

      // Update vehicles without affecting selection
      setAllVehicles(enrichedVehicles);
      vehiclesRef.current = enrichedVehicles;
      lastUpdateRef.current = Date.now();
      setLastDataUpdate(Date.now());
      setIsLoading(false);

      // Note: selectedVehicleId is preserved, selectedVehicle will automatically
      // reference the updated vehicle data through the computed value
    } catch (err) {
      console.error("Error refreshing vehicles:", err);
      setError("Failed to fetch vehicle data");
      setIsLoading(false);
    }
  }, [selectedFeed, enrichVehiclesWithShapes]);

  // Initial load and periodic refresh
  useEffect(() => {
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

  // Interpolation loop
  useEffect(() => {
    const interpolate = () => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdateRef.current) / 1000;

      if (elapsedSeconds > 60) return;

      setAllVehicles(prevVehicles =>
        prevVehicles.map(vehicle => {
          if (!vehicle.speed || vehicle.speed <= 0) {
            return {
              ...vehicle,
              interpolatedLat: vehicle.latitude,
              interpolatedLng: vehicle.longitude,
            };
          }

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
        lastDataUpdate,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};
