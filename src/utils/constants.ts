export const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";
export const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

// Malaysia GTFS API Base URL
export const GTFS_API_BASE = "https://api.data.gov.my";

// Available GTFS feeds
export const GTFS_FEEDS = {
  prasarana: {
    name: "Prasarana",
    categories: [
      "rapid-bus-kl",
      "rapid-bus-mrtfeeder",
      "rapid-bus-kuantan",
      "rapid-bus-penang",
    ],
    realtimeUrl: (category: string) =>
      `${GTFS_API_BASE}/gtfs-realtime/vehicle-position/prasarana?category=${category}`,
    staticUrl: (category: string) =>
      `${GTFS_API_BASE}/gtfs-static/prasarana?category=${category}`,
  },
  ktmb: {
    name: "KTMB",
    realtimeUrl: () => `${GTFS_API_BASE}/gtfs-realtime/vehicle-position/ktmb`,
    staticUrl: () => `${GTFS_API_BASE}/gtfs-static/ktmb`,
  },
  mybasJohor: {
    name: "MyBas Johor",
    realtimeUrl: () =>
      `${GTFS_API_BASE}/gtfs-realtime/vehicle-position/mybas-johor`,
    staticUrl: () => `${GTFS_API_BASE}/gtfs-static/mybas-johor`,
  },
} as const;

export const MAP_INITIAL_CENTER: [number, number] = [101.6869, 3.139]; // Kuala Lumpur
export const MAP_INITIAL_ZOOM = 12;

export const GTFS_REFRESH_INTERVAL = 30000; // 30 seconds
export const INTERPOLATION_INTERVAL = 100; // 0.1 seconds

export const OPERATORS = [
  { value: "rapid-bus-mrtfeeder", label: "MRT Feeder Bus" },
  { value: "rapid-bus-kl", label: "RapidKL Bus" },
  { value: "rapid-bus-penang", label: "Rapid Penang" },
  { value: "rapid-bus-kuantan", label: "Rapid Kuantan" },
  { value: "ktmb", label: "KTMB Train" },
  { value: "mybas-johor", label: "MyBas Johor" },
];

export const VEHICLE_TYPES = [
  { value: "bus", label: "Bus", icon: "🚌" },
  { value: "train", label: "Train", icon: "🚆" },
  { value: "tram", label: "Tram", icon: "🚊" },
];

export const NAV_TABS = [
  { id: "routes", label: "Routes", icon: "MapPin" },
  { id: "favourites", label: "Favourites", icon: "Star" },
  { id: "schedules", label: "Schedules", icon: "Clock" },
  { id: "suggestions", label: "Suggestions", icon: "Lightbulb" },
] as const;

export type NavTabId = (typeof NAV_TABS)[number]["id"];
