import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "../../contexts/MapContext";
import { decodePolyline } from "../../services/googleMapsService";

interface DirectionsOverlayProps {
  map: mapboxgl.Map;
}

const DEFAULT_ROUTE_COLOR = "#9b2761";

const DirectionsOverlay: React.FC<DirectionsOverlayProps> = ({ map }) => {
  const { routeOrigin, routeDestination, selectedDirection, routeDisplayMode } =
    useMap();

  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const layerIdsRef = useRef<string[]>([]);
  const sourceIdsRef = useRef<string[]>([]);

  // Clear all direction layers
  const clearDirectionLayers = useCallback(() => {
    if (!map) return;

    try {
      // Remove all step layers
      layerIdsRef.current.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

      // Remove all sources
      sourceIdsRef.current.forEach(sourceId => {
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      });
    } catch (e) {
      console.warn("Error clearing direction layers:", e);
    }

    layerIdsRef.current = [];
    sourceIdsRef.current = [];
  }, [map]);

  // Create marker element
  const createMarkerElement = (type: "origin" | "destination") => {
    const el = document.createElement("div");
    const color = type === "origin" ? "#22c55e" : "#ef4444";
    const label = type === "origin" ? "A" : "B";

    el.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid white;
          font-weight: bold;
          color: white;
          font-size: 14px;
          font-family: 'Rethink Sans', sans-serif;
        ">${label}</div>
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${color};
          margin-top: -2px;
        "></div>
      </div>
    `;

    return el;
  };

  // Handle origin marker
  useEffect(() => {
    if (!map || !map.loaded()) return;

    // Only show markers when in directions mode
    if (routeDisplayMode !== "directions") {
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
        originMarkerRef.current = null;
      }
      return;
    }

    if (routeOrigin) {
      if (originMarkerRef.current) {
        originMarkerRef.current.setLngLat([routeOrigin.lng, routeOrigin.lat]);
      } else {
        const el = createMarkerElement("origin");
        originMarkerRef.current = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([routeOrigin.lng, routeOrigin.lat])
          .addTo(map);
      }
    } else if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
  }, [map, routeOrigin, routeDisplayMode]);

  // Handle destination marker
  useEffect(() => {
    if (!map || !map.loaded()) return;

    if (routeDisplayMode !== "directions") {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
      return;
    }

    if (routeDestination) {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLngLat([
          routeDestination.lng,
          routeDestination.lat,
        ]);
      } else {
        const el = createMarkerElement("destination");
        destinationMarkerRef.current = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([routeDestination.lng, routeDestination.lat])
          .addTo(map);
      }
    } else if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }
  }, [map, routeDestination, routeDisplayMode]);

  // Handle direction route display with multi-color segments
  useEffect(() => {
    if (!map || !map.loaded()) return;

    // Hide directions when not in directions mode
    if (routeDisplayMode !== "directions") {
      clearDirectionLayers();
      return;
    }

    if (
      !selectedDirection ||
      !selectedDirection.steps ||
      selectedDirection.steps.length === 0
    ) {
      clearDirectionLayers();
      return;
    }

    // Clear existing layers
    clearDirectionLayers();

    try {
      // Add each step as a separate layer with its own color
      selectedDirection.steps.forEach((step, index) => {
        if (!step.polyline) return;

        const coordinates = decodePolyline(step.polyline);
        if (coordinates.length < 2) return;

        const sourceId = `directions-step-${index}`;
        const outlineLayerId = `directions-step-outline-${index}`;
        const layerId = `directions-step-${index}`;
        const color = step.color || DEFAULT_ROUTE_COLOR;

        // Add source
        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          },
        });

        // Add outline layer
        map.addLayer({
          id: outlineLayerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#000000",
            "line-width": 10,
            "line-opacity": 0.3,
          },
        });

        // Add main colored layer
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color,
            "line-width": 6,
            "line-opacity": 0.9,
          },
        });

        sourceIdsRef.current.push(sourceId);
        layerIdsRef.current.push(outlineLayerId, layerId);
      });
    } catch (error) {
      console.error("Error adding direction route layers:", error);
    }
  }, [map, selectedDirection, routeDisplayMode, clearDirectionLayers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDirectionLayers();
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
      }
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
      }
    };
  }, [clearDirectionLayers]);

  return null;
};

export default DirectionsOverlay;
