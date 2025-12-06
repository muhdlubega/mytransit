export interface GTFSVehiclePosition {
  id: string;
  vehicleId: string;
  tripId?: string;
  routeId?: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
  timestamp: number;
  stopSequence?: number;
  currentStatus?: "INCOMING_AT" | "STOPPED_AT" | "IN_TRANSIT_TO";
  label?: string;
  licensePlate?: string;
}

export interface GTFSRoute {
  routeId: string;
  agencyId?: string;
  routeShortName: string;
  routeLongName: string;
  routeDesc?: string;
  routeType: number;
  routeColor?: string;
  routeTextColor?: string;
}

export interface GTFSTrip {
  tripId: string;
  routeId: string;
  serviceId: string;
  tripHeadsign?: string;
  tripShortName?: string;
  directionId?: number;
  shapeId?: string;
}

export interface GTFSStop {
  stopId: string;
  stopCode?: string;
  stopName: string;
  stopDesc?: string;
  stopLat: number;
  stopLon: number;
  zoneId?: string;
  stopUrl?: string;
  locationType?: number;
  parentStation?: string;
}

export interface GTFSStopTime {
  tripId: string;
  arrivalTime: string;
  departureTime: string;
  stopId: string;
  stopSequence: number;
  stopHeadsign?: string;
  pickupType?: number;
  dropOffType?: number;
}

export interface GTFSShape {
  shapeId: string;
  shapePtLat: number;
  shapePtLon: number;
  shapePtSequence: number;
  shapeDistTraveled?: number;
}

export interface GTFSShapeEntry {
  key: string;
  value: GTFSShape[];
}

export interface GTFSStaticData {
  routes: GTFSRoute[];
  trips: GTFSTrip[];
  stops: GTFSStop[];
  stopTimes: GTFSStopTime[];
  shapes: Map<string, GTFSShape[]>;
}
