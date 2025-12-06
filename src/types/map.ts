export interface MapViewport {
  center: [number, number];
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export interface RouteDirection {
  origin: string;
  destination: string;
  mode: "transit" | "driving" | "walking" | "bicycling";
  routes?: DirectionRoute[];
}

export interface DirectionRoute {
  summary: string;
  duration: string;
  distance: string;
  steps: DirectionStep[];
  polyline: string;
}

export interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
  travelMode: string;
}
