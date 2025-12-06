import React, { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "../../contexts/MapContext";
import { useTransit } from "../../contexts/TransitContext";
import {
  MAPBOX_TOKEN,
  MAP_INITIAL_CENTER,
  MAP_INITIAL_ZOOM,
} from "../../utils/constants";
import VehicleMarkers from "./VehicleMarkers";
import RouteOverlay from "./RouteOverlay";

mapboxgl.accessToken = MAPBOX_TOKEN;

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const initializingRef = useRef(false);
  const { setMap, userLocation, isLocationEnabled } = useMap();
  const { vehicles } = useTransit();
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize map only once
  useEffect(() => {
    // Prevent multiple initializations
    if (
      initializingRef.current ||
      mapInstanceRef.current ||
      !mapContainer.current
    ) {
      return;
    }

    initializingRef.current = true;
    console.log("Initializing map...");

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
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
    });

    map.on("error", e => {
      console.error("Map error:", e);
    });

    // Cleanup only when component unmounts
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
  }, []); // Empty deps - run only once

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
        </>
      )}

      {/* Info overlay */}
      <div className="absolute top-4 right-4 bg-dark-900/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm z-10">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-dark-400">Active: </span>
            <span className="text-primary-400 font-bold">
              {vehicles.length}
            </span>
            <span className="text-dark-400"> vehicles</span>
          </div>
          {vehicles.filter(v => v.speed && v.speed > 0.5).length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">
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
