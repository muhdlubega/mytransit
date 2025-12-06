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

  // Create marker element with proper orientation
  // Icon points UP, tail points DOWN to actual position
  const createMarkerElement = useCallback(
    (vehicle: Vehicle, isSelected: boolean) => {
      const el = document.createElement("div");
      el.className = "vehicle-marker cursor-pointer";

      const color = vehicle.routeColor || "CF3476";
      const size = isSelected ? 48 : 40;
      const iconSize = isSelected ? 24 : 20;

      const isMoving = vehicle.speed && vehicle.speed > 0.5;

      // The marker container - arrow points UP by default, then we rotate based on bearing
      el.innerHTML = `
      <div 
        class="marker-container"
        style="
          position: relative;
          width: ${size}px;
          height: ${size + 16}px;
          display: flex;
          flex-direction: column;
          align-items: center;
        "
      >
        <!-- Main circle with icon (top part) -->
        <div 
          style="
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, #${color} 0%, #${color}dd 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${
              isSelected
                ? `0 0 0 3px white, 0 0 0 6px rgba(207, 52, 118, 0.4), 0 4px 16px rgba(0,0,0,0.4)`
                : `0 3px 12px rgba(0,0,0,0.4)`
            };
            position: relative;
            z-index: 2;
          "
        >
          <!-- Bus/Train icon pointing UP -->
          <svg 
            width="${iconSize}" 
            height="${iconSize}" 
            viewBox="0 0 24 24" 
            fill="white"
            style="transform: rotate(0deg);"
          >
            ${
              vehicle.vehicleType === "train"
                ? `<path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>`
                : `<path d="M4 16c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h6v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2V8c0-3.5-3.58-4-8-4s-8 .5-8 4v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V8h12v3z"/>`
            }
          </svg>
          
          <!-- Moving indicator -->
          ${
            isMoving
              ? `
            <div style="
              position: absolute;
              top: -3px;
              right: -3px;
              width: 14px;
              height: 14px;
              background-color: #22c55e;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              <div style="
                position: absolute;
                inset: -4px;
                background-color: rgba(34, 197, 94, 0.4);
                border-radius: 50%;
                animation: markerPulse 1.5s ease-out infinite;
              "></div>
            </div>
          `
              : ""
          }
        </div>
        
        <!-- Tail/pointer (bottom part) - points to actual position -->
        <div style="
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 14px solid #${color};
          margin-top: -2px;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
          z-index: 1;
        "></div>
      </div>
      
      <style>
        @keyframes markerPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .vehicle-marker:hover .marker-container > div:first-child {
          transform: scale(1.05);
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

  // Wait for map to load
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
        // Update position
        marker.setLngLat([lng, lat]);

        // Update rotation - the bearing indicates direction of travel
        // We rotate the entire marker so the bus icon "points" in the direction of travel
        if (vehicle.bearing !== undefined && vehicle.bearing !== null) {
          marker.setRotation(vehicle.bearing);
        }

        // Update appearance if needed
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
            anchor: "bottom", // Anchor at bottom (the tail) so it points to exact position
          }).setLngLat([lng, lat]);

          if (map.getContainer()) {
            marker.addTo(map);

            el.addEventListener("click", e => {
              e.stopPropagation();
              handleMarkerClick(vehicle);
            });

            markersRef.current.set(vehicle.id, marker);
          }
        } catch (error) {
          console.error("Error creating marker:", vehicle.id, error);
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

  // Cleanup
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {}
      });
      markersRef.current.clear();
    };
  }, []);

  return null;
};

export default VehicleMarkers;
