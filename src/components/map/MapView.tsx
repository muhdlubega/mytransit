import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "../../contexts/MapContext";
import { useTransit } from "../../contexts/TransitContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  MAPBOX_TOKEN,
  MAP_INITIAL_CENTER,
  MAP_INITIAL_ZOOM,
} from "../../utils/constants";
import VehicleMarkers from "./VehicleMarkers";
import RouteOverlay from "./RouteOverlay";
import DirectionsOverlay from "./DirectionsOverlay";

mapboxgl.accessToken = MAPBOX_TOKEN;

const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";
const LIGHT_STYLE = "mapbox://styles/mapbox/streets-v12";

// Custom color configurations
const darkModeColors = {
  // Background and land - dark magenta tints
  background: "#1a0a14",
  land: "#1f0f1a",
  landAlt: "#2a1422",

  // Water - deep magenta-blue
  water: "#1a0f2e",
  waterShadow: "#140a24",

  // Parks and green areas - dark teal with magenta
  park: "#0f1a1a",
  grass: "#121a18",

  // Roads - magenta tints
  roadHighway: "#4a1f3d",
  roadHighwayCase: "#2d1226",
  roadMajor: "#3d1a33",
  roadMajorCase: "#26101f",
  roadMinor: "#2d1426",
  roadMinorCase: "#1f0f1a",
  roadStreet: "#261220",

  // Buildings
  building: "#2a1422",
  buildingOutline: "#3d1a33",

  // Labels
  labelPrimary: "#e8d0e0",
  labelSecondary: "#a87090",
  labelTertiary: "#704060",

  // Boundaries
  boundary: "#4a1f3d",
  boundaryCase: "#2d1226",
};

const lightModeColors = {
  // Background and land - warm cream with slight green tint
  background: "#f5f8f5",
  land: "#f0f5f0",
  landAlt: "#e8f0e8",

  // Water - vibrant blue-teal
  water: "#4fb3d9",
  waterShadow: "#3a9bc4",

  // Parks and green areas - vibrant greens
  park: "#a8e6a3",
  grass: "#b8f0b0",
  vegetation: "#8ed488",

  // Roads - blue-gray with teal hints
  roadHighway: "#7eb8c9",
  roadHighwayCase: "#5a9eb5",
  roadMajor: "#9ec8d8",
  roadMajorCase: "#7eb8c9",
  roadMinor: "#d0e8ef",
  roadMinorCase: "#b8d8e4",
  roadStreet: "#e0f0f5",

  // Buildings - light blue-gray
  building: "#d8e8ee",
  buildingOutline: "#b8d0da",

  // Labels
  labelPrimary: "#1a3040",
  labelSecondary: "#3a5a70",
  labelTertiary: "#5a7a90",

  // Boundaries
  boundary: "#8ab8c8",
  boundaryCase: "#6a98a8",

  // POI and amenities
  poi: "#4a8fa0",
};

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const initializingRef = useRef(false);
  const { setMap, userLocation, isLocationEnabled } = useMap();
  const { vehicles } = useTransit();
  const { isDark } = useTheme();
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const currentStyleRef = useRef<string>(isDark ? DARK_STYLE : LIGHT_STYLE);

  // Apply custom colors to the map
  const applyCustomColors = useCallback(
    (map: mapboxgl.Map, isDarkMode: boolean) => {
      const colors = isDarkMode ? darkModeColors : lightModeColors;

      try {
        // Background
        if (map.getLayer("background")) {
          map.setPaintProperty(
            "background",
            "background-color",
            colors.background
          );
        }

        // Land and landuse
        const landLayers = ["land", "landcover", "landuse"];
        landLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.setPaintProperty(layer, "fill-color", colors.land);
          }
        });

        // Water
        const waterLayers = ["water", "water-shadow"];
        waterLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.setPaintProperty(
              layer,
              "fill-color",
              layer.includes("shadow") ? colors.waterShadow : colors.water
            );
          }
        });

        // Parks and green spaces
        const parkLayers = ["landuse", "park", "national-park"];
        parkLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            try {
              map.setPaintProperty(layer, "fill-color", [
                "match",
                ["get", "class"],
                ["park", "pitch", "grass", "cemetery"],
                colors.park,
                ["scrub", "wood", "forest"],
                colors.grass,
                colors.land,
              ]);
            } catch {
              map.setPaintProperty(layer, "fill-color", colors.park);
            }
          }
        });

        // Roads - highways
        if (map.getLayer("road-highway")) {
          map.setPaintProperty(
            "road-highway",
            "line-color",
            colors.roadHighway
          );
        }
        if (map.getLayer("road-highway-case")) {
          map.setPaintProperty(
            "road-highway-case",
            "line-color",
            colors.roadHighwayCase
          );
        }

        // Roads - major
        const majorRoadLayers = [
          "road-major-link",
          "road-primary",
          "road-secondary",
          "road-tertiary",
        ];
        majorRoadLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.setPaintProperty(layer, "line-color", colors.roadMajor);
          }
          if (map.getLayer(`${layer}-case`)) {
            map.setPaintProperty(
              `${layer}-case`,
              "line-color",
              colors.roadMajorCase
            );
          }
        });

        // Roads - minor and streets
        const minorRoadLayers = [
          "road-minor",
          "road-street",
          "road-minor-low",
          "road-street-low",
        ];
        minorRoadLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.setPaintProperty(layer, "line-color", colors.roadMinor);
          }
          if (map.getLayer(`${layer}-case`)) {
            map.setPaintProperty(
              `${layer}-case`,
              "line-color",
              colors.roadMinorCase
            );
          }
        });

        // Buildings
        if (map.getLayer("building")) {
          map.setPaintProperty("building", "fill-color", colors.building);
          map.setPaintProperty(
            "building",
            "fill-outline-color",
            colors.buildingOutline
          );
        }
        if (map.getLayer("building-outline")) {
          map.setPaintProperty(
            "building-outline",
            "line-color",
            colors.buildingOutline
          );
        }

        // 3D Buildings
        if (map.getLayer("3d-buildings")) {
          map.setPaintProperty(
            "3d-buildings",
            "fill-extrusion-color",
            colors.building
          );
        }

        // Labels
        const primaryLabelLayers = [
          "place-city-label",
          "place-town-label",
          "country-label",
          "state-label",
          "settlement-major-label",
          "settlement-minor-label",
        ];
        primaryLabelLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.setPaintProperty(layer, "text-color", colors.labelPrimary);
          }
        });

        const secondaryLabelLayers = [
          "place-neighborhood-label",
          "place-suburb-label",
          "poi-label",
          "road-label",
          "natural-point-label",
        ];
        secondaryLabelLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.setPaintProperty(layer, "text-color", colors.labelSecondary);
          }
        });

        // Boundaries
        const boundaryLayers = [
          "admin-0-boundary",
          "admin-1-boundary",
          "admin-0-boundary-bg",
        ];
        boundaryLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.setPaintProperty(
              layer,
              "line-color",
              layer.includes("bg") ? colors.boundaryCase : colors.boundary
            );
          }
        });

        // Transit and rail
        const transitLayers = [
          "road-rail",
          "road-rail-tracks",
          "transit-label",
        ];
        transitLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            try {
              if (layer.includes("label")) {
                map.setPaintProperty(
                  layer,
                  "text-color",
                  colors.labelSecondary
                );
              } else {
                map.setPaintProperty(
                  layer,
                  "line-color",
                  isDarkMode ? colors.roadHighway : colors.roadMajor
                );
              }
            } catch (e) {
              // Some layers may not support certain properties
            }
          }
        });

        console.log(
          "Applied custom colors for",
          isDarkMode ? "dark" : "light",
          "mode"
        );
      } catch (error) {
        console.warn("Error applying custom colors:", error);
      }
    },
    []
  );

  // Initialize map only once
  useEffect(() => {
    if (
      initializingRef.current ||
      mapInstanceRef.current ||
      !mapContainer.current
    ) {
      return;
    }

    initializingRef.current = true;
    console.log("Initializing map...");

    const initialStyle = isDark ? DARK_STYLE : LIGHT_STYLE;
    currentStyleRef.current = initialStyle;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: MAP_INITIAL_CENTER,
      zoom: MAP_INITIAL_ZOOM,
      attributionControl: false,
      preserveDrawingBuffer: true,
    });

    mapInstanceRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl(), "bottom-left");
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => {
      console.log("Map loaded successfully");
      setMap(map);
      setMapReady(true);

      // Apply custom colors after initial load
      applyCustomColors(map, isDark);
    });

    map.on("error", e => {
      console.error("Map error:", e);
    });

    return () => {
      console.log("Cleaning up map...");
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMap(null);
        setMapReady(false);
        initializingRef.current = false;
      }
    };
  }, []);

  // Handle theme changes - update map style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const newStyle = isDark ? DARK_STYLE : LIGHT_STYLE;

    // Only update if style actually changed
    if (currentStyleRef.current !== newStyle) {
      console.log("Switching map style to:", isDark ? "dark" : "light");
      currentStyleRef.current = newStyle;

      // Store current center and zoom
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bearing = map.getBearing();
      const pitch = map.getPitch();

      map.setStyle(newStyle);

      // Restore view and apply custom colors after style loads
      map.once("style.load", () => {
        map.setCenter(center);
        map.setZoom(zoom);
        map.setBearing(bearing);
        map.setPitch(pitch);

        // Apply custom colors for the new theme
        applyCustomColors(map, isDark);
      });
    }
  }, [isDark, mapReady, applyCustomColors]);

  // Handle user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (isLocationEnabled && userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([
          userLocation.longitude,
          userLocation.latitude,
        ]);
      } else {
        const el = document.createElement("div");
        el.className = "user-location-marker";
        el.innerHTML = `
          <div style="position: relative;">
            <div style="
              width: 20px; 
              height: 20px; 
              background-color: #3b82f6; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute; 
              top: -6px; 
              left: -6px; 
              right: -6px; 
              bottom: -6px; 
              background-color: rgba(59, 130, 246, 0.2); 
              border-radius: 50%; 
              animation: userPulse 2s ease-out infinite;
            "></div>
          </div>
          <style>
            @keyframes userPulse {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(2); opacity: 0; }
            }
          </style>
        `;

        try {
          userMarkerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(map);
        } catch (e) {
          console.error("Error adding user marker:", e);
        }
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation, isLocationEnabled, mapReady]);

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <div ref={mapContainer} className="absolute inset-0" />

      {mapReady && mapInstanceRef.current && (
        <>
          <VehicleMarkers map={mapInstanceRef.current} vehicles={vehicles} />
          <RouteOverlay map={mapInstanceRef.current} />
          <DirectionsOverlay map={mapInstanceRef.current} />
        </>
      )}

      {/* Info overlay */}
      <div
        className={`absolute top-4 right-4 backdrop-blur-sm rounded-lg px-4 py-2 text-sm z-10 ${
          isDark ? "bg-dark-900/90" : "bg-white/90 shadow-md"
        }`}
      >
        <div className="flex items-center gap-3">
          <div>
            <span className={isDark ? "text-dark-400" : "text-gray-500"}>
              Active:{" "}
            </span>
            <span className="text-primary-400 font-bold">
              {vehicles.length}
            </span>
            <span className={isDark ? "text-dark-400" : "text-gray-500"}>
              {" "}
              vehicles
            </span>
          </div>
          {vehicles.filter(v => v.speed && v.speed > 0.5).length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 text-xs">
                {vehicles.filter(v => v.speed && v.speed > 0.5).length} moving
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
