import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { Vehicle } from "../../types/vehicle";
import { useTransit } from "../../contexts/TransitContext";
import { useMap } from "../../contexts/MapContext";

interface VehicleMarkersProps {
  map: mapboxgl.Map;
  vehicles: Vehicle[];
}

const VehicleMarkers: React.FC<VehicleMarkersProps> = ({ map, vehicles }) => {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const { setSelectedVehicle, selectedVehicle } = useTransit();
  const { setHighlightedRouteId } = useMap();
  const mapLoadedRef = useRef(false);

  const createMarkerElement = useCallback(
    (vehicle: Vehicle, isSelected: boolean) => {
      const el = document.createElement("div");
      el.className = "vehicle-marker cursor-pointer";

      const color = vehicle.routeColor || "CF3476";
      const size = isSelected ? 44 : 36;
      const iconSize = isSelected ? 26 : 22;
      const ringStyle = isSelected
        ? "box-shadow: 0 0 0 3px white, 0 0 0 6px rgba(207, 52, 118, 0.5), 0 4px 12px rgba(0,0,0,0.4);"
        : "box-shadow: 0 2px 8px rgba(0,0,0,0.3);";

      const isMoving = vehicle.speed && vehicle.speed > 0.5;
      const movingIndicator = isMoving
        ? `<div style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background-color: #22c55e; border-radius: 50%; border: 2px solid white; animation: pulse 1.5s infinite;"></div>`
        : "";

      el.innerHTML = `
      <div style="position: relative; transition: transform 0.2s;">
        <div 
          style="
            width: ${size}px; 
            height: ${size}px; 
            background-color: #${color}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            ${ringStyle}
            transition: all 0.2s;
          "
        >
          <svg 
            style="color: white;" 
            width="${iconSize}" 
            height="${iconSize}" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M4 16c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h6v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2V8c0-3.5-3.58-4-8-4s-8 .5-8 4v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V8h12v3z"/>
          </svg>
        </div>
        <div style="
          position: absolute; 
          bottom: -6px; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 0; 
          height: 0; 
          border-left: 8px solid transparent; 
          border-right: 8px solid transparent; 
          border-top: 12px solid #${color};
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        "></div>
        ${movingIndicator}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
      </style>
    `;

      return el;
    },
    []
  );

  const handleMarkerClick = useCallback(
    (vehicle: Vehicle) => {
      console.log("Vehicle clicked:", vehicle.id, vehicle.label);
      setSelectedVehicle(vehicle);
      setHighlightedRouteId(vehicle.routeId || null);
    },
    [setSelectedVehicle, setHighlightedRouteId]
  );

  // Wait for map to be ready
  useEffect(() => {
    if (!map) return;

    const checkMapLoaded = () => {
      if (map.loaded()) {
        mapLoadedRef.current = true;
      } else {
        map.once("load", () => {
          mapLoadedRef.current = true;
        });
      }
    };

    checkMapLoaded();
  }, [map]);

  // Update markers
  useEffect(() => {
    if (!map || !mapLoadedRef.current) {
      // Wait for map to load
      if (map && !map.loaded()) {
        map.once("load", () => {
          mapLoadedRef.current = true;
        });
      }
      return;
    }

    const currentMarkerIds = new Set(vehicles.map(v => v.id));
    const existingMarkerIds = new Set(markersRef.current.keys());

    // Remove old markers
    existingMarkerIds.forEach(id => {
      if (!currentMarkerIds.has(id)) {
        const marker = markersRef.current.get(id);
        if (marker) {
          marker.remove();
          markersRef.current.delete(id);
        }
      }
    });

    // Add or update markers
    vehicles.forEach(vehicle => {
      const lng = vehicle.interpolatedLng ?? vehicle.longitude;
      const lat = vehicle.interpolatedLat ?? vehicle.latitude;

      if (
        typeof lng !== "number" ||
        typeof lat !== "number" ||
        isNaN(lng) ||
        isNaN(lat)
      ) {
        return;
      }

      const isSelected = selectedVehicle?.id === vehicle.id;
      let marker = markersRef.current.get(vehicle.id);

      if (marker) {
        // Update position smoothly
        marker.setLngLat([lng, lat]);

        // Update rotation based on bearing
        if (vehicle.bearing && vehicle.bearing !== 0) {
          marker.setRotation(vehicle.bearing);
        }

        // Update appearance if selection changed
        const el = marker.getElement();
        if (el) {
          const newEl = createMarkerElement(vehicle, isSelected);
          el.innerHTML = newEl.innerHTML;
        }
      } else {
        // Create new marker
        try {
          const el = createMarkerElement(vehicle, isSelected);

          marker = new mapboxgl.Marker({
            element: el,
            rotation: vehicle.bearing || 0,
            rotationAlignment: "map",
            anchor: "bottom",
          }).setLngLat([lng, lat]);

          if (map.getContainer()) {
            marker.addTo(map);

            // Add click handler
            el.addEventListener("click", e => {
              e.stopPropagation();
              handleMarkerClick(vehicle);
            });

            markersRef.current.set(vehicle.id, marker);
          }
        } catch (error) {
          console.error(
            "Error creating marker for vehicle:",
            vehicle.id,
            error
          );
        }
      }
    });
  }, [
    vehicles,
    map,
    selectedVehicle?.id,
    createMarkerElement,
    handleMarkerClick,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          // Ignore
        }
      });
      markersRef.current.clear();
    };
  }, []);

  return null;
};

export default VehicleMarkers;
