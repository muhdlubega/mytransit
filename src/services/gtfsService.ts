import * as protobuf from "protobufjs";
import JSZip from "jszip";
import Papa from "papaparse";
import {
  GTFSStaticData,
  GTFSRoute,
  GTFSStop,
  GTFSTrip,
  GTFSStopTime,
  GTFSShape,
  GTFSShapeEntry,
} from "../types/gtfs";
import { Vehicle } from "../types/vehicle";
import { GTFS_API_BASE } from "../utils/constants";

// GTFS Realtime Proto Definition
const GTFS_REALTIME_PROTO = `
syntax = "proto2";
package transit_realtime;

message FeedMessage {
  required FeedHeader header = 1;
  repeated FeedEntity entity = 2;
}

message FeedHeader {
  required string gtfs_realtime_version = 1;
  optional uint64 timestamp = 3;
}

message FeedEntity {
  required string id = 1;
  optional VehiclePosition vehicle = 4;
}

message VehiclePosition {
  optional TripDescriptor trip = 1;
  optional VehicleDescriptor vehicle = 8;
  optional Position position = 2;
  optional uint32 current_stop_sequence = 3;
  optional string stop_id = 7;
  optional VehicleStopStatus current_status = 4;
  optional uint64 timestamp = 5;

  enum VehicleStopStatus {
    INCOMING_AT = 0;
    STOPPED_AT = 1;
    IN_TRANSIT_TO = 2;
  }
}

message TripDescriptor {
  optional string trip_id = 1;
  optional string route_id = 5;
  optional uint32 direction_id = 6;
  optional string start_time = 2;
  optional string start_date = 3;
}

message VehicleDescriptor {
  optional string id = 1;
  optional string label = 2;
  optional string license_plate = 3;
}

message Position {
  required float latitude = 1;
  required float longitude = 2;
  optional float bearing = 3;
  optional double odometer = 4;
  optional float speed = 5;
}
`;

let protoRoot: protobuf.Root | null = null;

const getProtoRoot = async (): Promise<protobuf.Root> => {
  if (!protoRoot) {
    protoRoot = protobuf.parse(GTFS_REALTIME_PROTO).root;
  }
  return protoRoot;
};

// Get route color based on operator
const getRouteColor = (operator: string): string => {
  const colors: Record<string, string> = {
    "MRT Feeder": "CF3476",
    RapidKL: "00A651",
    "Rapid Penang": "0077CC",
    "Rapid Kuantan": "F7941D",
    KTMB: "1E3A8A",
    MyBas: "8B5CF6",
  };
  return colors[operator] || "CF3476";
};

// Fetch GTFS Realtime data
export const fetchGTFSRealtime = async (
  feedType: string = "prasarana",
  category: string = "rapid-bus-mrtfeeder"
): Promise<Vehicle[]> => {
  try {
    let url: string;

    if (feedType === "prasarana") {
      url = `${GTFS_API_BASE}/gtfs-realtime/vehicle-position/prasarana?category=${category}`;
    } else if (feedType === "ktmb") {
      url = `${GTFS_API_BASE}/gtfs-realtime/vehicle-position/ktmb`;
    } else {
      url = `${GTFS_API_BASE}/gtfs-realtime/vehicle-position/${feedType}`;
    }

    console.log("Fetching GTFS Realtime from:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const root = await getProtoRoot();
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

    const message = FeedMessage.decode(new Uint8Array(arrayBuffer));
    const feed = FeedMessage.toObject(message, {
      longs: Number,
      enums: String,
      bytes: String,
    }) as any;

    console.log("GTFS Feed received, entities:", feed.entity?.length || 0);

    if (!feed.entity || feed.entity.length === 0) {
      return [];
    }

    // Determine operator based on category
    let operator = "Unknown";
    let vehicleType: "bus" | "train" = "bus";

    if (feedType === "ktmb") {
      operator = "KTMB";
      vehicleType = "train";
    } else if (feedType === "prasarana") {
      if (category === "rapid-bus-mrtfeeder") {
        operator = "MRT Feeder";
      } else if (category === "rapid-bus-kl") {
        operator = "RapidKL";
      } else if (category === "rapid-bus-penang") {
        operator = "Rapid Penang";
      } else if (category === "rapid-bus-kuantan") {
        operator = "Rapid Kuantan";
      }
    } else if (feedType.startsWith("mybas")) {
      operator = "MyBas";
    }

    const vehicles: Vehicle[] = feed.entity
      .filter((entity: any) => entity.vehicle && entity.vehicle.position)
      .map((entity: any, index: number) => {
        const v = entity.vehicle;
        const pos = v.position;
        const trip = v.trip || {};
        const veh = v.vehicle || {};

        return {
          id: entity.id || `vehicle-${index}`,
          vehicleId: veh.id || veh.label || entity.id || `V${index}`,
          tripId: trip.tripId || trip.trip_id,
          routeId: trip.routeId || trip.route_id,
          latitude: pos.latitude,
          longitude: pos.longitude,
          bearing: pos.bearing || 0,
          speed: pos.speed || 0,
          timestamp: v.timestamp || Date.now() / 1000,
          stopSequence: v.currentStopSequence || v.current_stop_sequence,
          currentStatus: v.currentStatus || v.current_status,
          label: veh.label || veh.id || `Vehicle ${index + 1}`,
          licensePlate: veh.licensePlate || veh.license_plate,
          operator,
          vehicleType,
          routeColor: getRouteColor(operator),
          interpolatedLat: pos.latitude,
          interpolatedLng: pos.longitude,
        };
      });

    console.log("Parsed vehicles:", vehicles.length);
    return vehicles;
  } catch (error) {
    console.error("Error fetching GTFS Realtime:", error);
    return [];
  }
};

// Fetch GTFS Static data
export const fetchGTFSStatic = async (
  feedType: string = "prasarana",
  category: string = "rapid-bus-mrtfeeder"
): Promise<GTFSStaticData | null> => {
  try {
    let url: string;

    if (feedType === "prasarana") {
      url = `${GTFS_API_BASE}/gtfs-static/prasarana?category=${category}`;
    } else if (feedType === "ktmb") {
      url = `${GTFS_API_BASE}/gtfs-static/ktmb`;
    } else {
      url = `${GTFS_API_BASE}/gtfs-static/${feedType}`;
    }

    console.log("Fetching GTFS Static from:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Parse each file
    const routes = await parseCSVFile<GTFSRoute>(zip, "routes.txt", mapRoute);
    const stops = await parseCSVFile<GTFSStop>(zip, "stops.txt", mapStop);
    const trips = await parseCSVFile<GTFSTrip>(zip, "trips.txt", mapTrip);
    const stopTimes = await parseCSVFile<GTFSStopTime>(
      zip,
      "stop_times.txt",
      mapStopTime
    );

    // Parse shapes
    let shapes = new Map<string, GTFSShape[]>();
    try {
      const shapesRaw = await parseCSVFile<any>(zip, "shapes.txt", row => row);
      shapes = groupShapesFromCSV(shapesRaw);
    } catch (e) {
      console.log("No shapes.txt found or error parsing:", e);
    }

    console.log("GTFS Static loaded:", {
      routes: routes.length,
      stops: stops.length,
      trips: trips.length,
      stopTimes: stopTimes.length,
      shapes: shapes.size,
    });

    return { routes, stops, trips, stopTimes, shapes };
  } catch (error) {
    console.error("Error fetching GTFS Static:", error);
    return null;
  }
};

// Parse CSV file from ZIP
const parseCSVFile = async <T>(
  zip: JSZip,
  filename: string,
  mapper: (row: any) => T
): Promise<T[]> => {
  const file = zip.file(filename);
  if (!file) {
    console.warn(`File ${filename} not found in ZIP`);
    return [];
  }

  const content = await file.async("string");

  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const mapped = results.data.map(mapper).filter(Boolean) as T[];
        resolve(mapped);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};

// Map route from CSV row
const mapRoute = (row: any): GTFSRoute => ({
  routeId: row.route_id || "",
  agencyId: row.agency_id || "",
  routeShortName: row.route_short_name || "",
  routeLongName: row.route_long_name || "",
  routeDesc: row.route_desc,
  routeType: parseInt(row.route_type) || 3,
  routeColor: row.route_color || "CF3476",
  routeTextColor: row.route_text_color,
});

// Map stop from CSV row
const mapStop = (row: any): GTFSStop => ({
  stopId: row.stop_id || "",
  stopCode: row.stop_code,
  stopName: row.stop_name || "",
  stopDesc: row.stop_desc,
  stopLat: parseFloat(row.stop_lat) || 0,
  stopLon: parseFloat(row.stop_lon) || 0,
  zoneId: row.zone_id,
  stopUrl: row.stop_url,
  locationType: parseInt(row.location_type) || 0,
  parentStation: row.parent_station,
});

// Map trip from CSV row
const mapTrip = (row: any): GTFSTrip => ({
  tripId: row.trip_id || "",
  routeId: row.route_id || "",
  serviceId: row.service_id || "",
  tripHeadsign: row.trip_headsign,
  tripShortName: row.trip_short_name,
  directionId: parseInt(row.direction_id) || 0,
  shapeId: row.shape_id,
});

// Map stop time from CSV row
const mapStopTime = (row: any): GTFSStopTime => ({
  tripId: row.trip_id || "",
  arrivalTime: row.arrival_time || "",
  departureTime: row.departure_time || "",
  stopId: row.stop_id || "",
  stopSequence: parseInt(row.stop_sequence) || 0,
  stopHeadsign: row.stop_headsign,
  pickupType: parseInt(row.pickup_type) || 0,
  dropOffType: parseInt(row.drop_off_type) || 0,
});

// Group shapes from CSV data
const groupShapesFromCSV = (rows: any[]): Map<string, GTFSShape[]> => {
  const map = new Map<string, GTFSShape[]>();

  rows.forEach(row => {
    const shapeId = row.shape_id;
    if (!shapeId) return;

    const shape: GTFSShape = {
      shapeId,
      shapePtLat: parseFloat(row.shape_pt_lat) || 0,
      shapePtLon: parseFloat(row.shape_pt_lon) || 0,
      shapePtSequence: parseInt(row.shape_pt_sequence) || 0,
      shapeDistTraveled: row.shape_dist_traveled
        ? parseFloat(row.shape_dist_traveled)
        : undefined,
    };

    const existing = map.get(shapeId) || [];
    existing.push(shape);
    map.set(shapeId, existing);
  });

  // Sort each shape's points by sequence
  map.forEach((points, shapeId) => {
    points.sort((a, b) => a.shapePtSequence - b.shapePtSequence);
    map.set(shapeId, points);
  });

  return map;
};

// Helper to process shapes from API response format (key-value pairs)
export const processShapesFromAPI = (
  shapesData: GTFSShapeEntry[]
): Map<string, GTFSShape[]> => {
  const map = new Map<string, GTFSShape[]>();

  shapesData.forEach(entry => {
    if (entry.key && entry.value && Array.isArray(entry.value)) {
      // Sort by sequence
      const sortedPoints = [...entry.value].sort(
        (a, b) => a.shapePtSequence - b.shapePtSequence
      );
      map.set(entry.key, sortedPoints);
    }
  });

  return map;
};
