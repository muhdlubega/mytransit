"use client";

import type React from "react";
import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { Vehicle } from "../../types/vehicle";
import { useTransit } from "../../contexts/TransitContext";
import { useMap } from "../../contexts/MapContext";

interface VehicleMarkersProps {
  map: mapboxgl.Map;
  vehicles: Vehicle[];
}

const VehicleMarkers: React.FC<VehicleMarkersProps> = ({ map, vehicles }) => {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const { setSelectedVehicle, selectedVehicle, showVehicles } = useTransit();
  const { setHighlightedRouteId, setRouteDisplayMode, clearRoutePoints } =
    useMap();
  const mapLoadedRef = useRef(false);

  const createMarkerElement = useCallback(
    (vehicle: Vehicle, isSelected: boolean) => {
      const el = document.createElement("div");
      el.className = "vehicle-marker";
      el.style.cursor = "pointer";
      el.style.zIndex = isSelected ? "10" : "1";

      const color = vehicle.routeColor || "CF3476";
      const size = 36;
      const iconSize = 18;
      const pointerHeight = 10;
      const totalHeight = size + pointerHeight;

      const isMoving = vehicle.speed && vehicle.speed > 0.5;

      el.innerHTML = `
      <div 
        class="marker-wrapper"
        style="
          width: ${size}px;
          height: ${totalHeight}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: auto;
        "
      >
        <div 
          class="marker-body"
          style="
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(180deg, #${color} 0%, #${color}cc 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${
              isSelected
                ? `0 0 0 3px white, 0 0 0 6px rgba(207, 52, 118, 0.5), 0 4px 20px rgba(0,0,0,0.5)`
                : `0 2px 10px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.2)`
            };
            position: relative;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          "
        >
          <svg 
            width="${iconSize}" 
            height="${iconSize}" 
            viewBox="0 0 24 24" 
            fill="white"
          >
            ${
              vehicle.vehicleType === "train"
                ? `<path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4s-8 .5-8 4v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V8h12v3z"/>`
                : `<path d="M4 16c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h6v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2V8c0-3.5-3.58-4-8-4s-8 .5-8 4v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V8h12v3z"/>`
            }
          </svg>
          
          ${
            isMoving
              ? `
            <div style="
              position: absolute;
              top: -4px;
              right: -4px;
              width: 14px;
              height: 14px;
              background-color: #22c55e;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            "></div>
          `
              : ""
          }
        </div>
        
        <div style="
          width: 0;
          height: 0;
          border-left: ${pointerHeight * 0.7}px solid transparent;
          border-right: ${pointerHeight * 0.7}px solid transparent;
          border-top: ${pointerHeight}px solid #${color}cc;
          margin-top: -1px;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        "></div>
      </div>
      
      <style>
        .vehicle-marker:hover .marker-body {
          transform: scale(1.1);
        }
        .vehicle-marker:active .marker-body {
          transform: scale(0.95);
        }
      </style>
    `;

      return el;
    },
    []
  );

  // Handle marker click - switches to vehicle route display mode
  const handleMarkerClick = useCallback(
    (vehicle: Vehicle, event?: MouseEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      console.log("Vehicle marker clicked:", vehicle.id, vehicle.label);

      // Clear any directions route
      clearRoutePoints();

      // Set selected vehicle
      setSelectedVehicle(vehicle);
      setHighlightedRouteId(vehicle.routeId || null);

      // Switch to vehicle route display mode
      setRouteDisplayMode("vehicle");
    },
    [
      setSelectedVehicle,
      setHighlightedRouteId,
      setRouteDisplayMode,
      clearRoutePoints,
    ]
  );

  useEffect(() => {
    if (!map) return;

    if (map.loaded()) {
      mapLoadedRef.current = true;
    } else {
      const onLoad = () => {
        mapLoadedRef.current = true;
      };
      map.once("load", onLoad);
      return () => {
        map.off("load", onLoad);
      };
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (!map.loaded()) {
      map.once("load", () => {
        mapLoadedRef.current = true;
      });
      return;
    }

    if (!showVehicles) {
      // Hide all markers when showVehicles is false
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      return;
    }

    const currentMarkerIds = new Set(vehicles.map(v => v.id));
    const existingMarkerIds = new Set(markersRef.current.keys());

    existingMarkerIds.forEach(id => {
      if (!currentMarkerIds.has(id)) {
        const marker = markersRef.current.get(id);
        if (marker) {
          marker.remove();
          markersRef.current.delete(id);
        }
      }
    });

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
        marker.setLngLat([lng, lat]);

        const oldEl = marker.getElement();
        const newEl = createMarkerElement(vehicle, isSelected);

        if (oldEl && oldEl.parentNode) {
          const wrapper = oldEl.querySelector(".marker-wrapper");
          const newWrapper = newEl.querySelector(".marker-wrapper");
          if (wrapper && newWrapper) {
            wrapper.innerHTML = newWrapper.innerHTML;
          }
          oldEl.style.zIndex = isSelected ? "10" : "1";
        }
      } else {
        try {
          const el = createMarkerElement(vehicle, isSelected);

          el.addEventListener("click", e => handleMarkerClick(vehicle, e), {
            capture: true,
          });
          el.addEventListener(
            "touchend",
            e => {
              e.preventDefault();
              handleMarkerClick(vehicle);
            },
            { capture: true, passive: false }
          );

          marker = new mapboxgl.Marker({
            element: el,
            anchor: "bottom",
          }).setLngLat([lng, lat]);

          if (map.getContainer()) {
            marker.addTo(map);
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
    showVehicles,
  ]);

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
