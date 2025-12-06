import { GTFSVehiclePosition, GTFSShape } from "./gtfs";

export interface Vehicle extends GTFSVehiclePosition {
  interpolatedLat?: number;
  interpolatedLng?: number;
  operator?: string;
  vehicleType?: "bus" | "train" | "tram" | "ferry";
  nextStop?: string;
  estimatedArrival?: string;
  routeName?: string;
  routeColor?: string;
  distanceToUser?: number;
  etaToUser?: string;
  shapeId?: string;
  shapePoints?: GTFSShape[];
  progressAlongRoute?: number; // 0-1 percentage along route
}

export interface VehicleFilter {
  operator: string | null;
  vehicleType: string | null;
  routeId: string | null;
}

export type OperatorType = "MRT Feeder" | "RapidKL" | "GOKL" | "BRT" | "All";
