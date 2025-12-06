import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "../../contexts/MapContext";
import { decodePolyline } from "../../services/googleMapsService";

interface DirectionsOverlayProps {
  map: mapboxgl.Map;
}

const DirectionsOverlay: React.FC<DirectionsOverlayProps> = ({ map }) => {
  const { routeOrigin, routeDestination, selectedDirection } = useMap();
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeLayerAddedRef = useRef(false);

  // Clear direction route
  const clearDirectionRoute = useCallback(() => {
    if (!map) return;

    try {
      if (map.getLayer("directions-route-outline")) {
        map.removeLayer("directions-route-outline");
      }
      if (map.getLayer("directions-route")) {
        map.removeLayer("directions-route");
      }
      if (map.getSource("directions-route")) {
        map.removeSource("directions-route");
      }
    } catch (e) {
      // Ignore errors
    }

    routeLayerAddedRef.current = false;
  }, [map]);

  // Create marker element
  const createMarkerElement = (type: "origin" | "destination") => {
    const el = document.createElement("div");
    const color = type === "origin" ? "#22c55e" : "#ef4444";
    const label = type === "origin" ? "A" : "B";

    el.innerHTML = `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
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
  }, [map, routeOrigin]);

  // Handle destination marker
  useEffect(() => {
    if (!map || !map.loaded()) return;

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
  }, [map, routeDestination]);

  // Handle direction route display
  useEffect(() => {
    if (!map || !map.loaded()) return;

    if (!selectedDirection || !selectedDirection.polyline) {
      clearDirectionRoute();
      return;
    }

    // Decode polyline
    const coordinates = decodePolyline(selectedDirection.polyline);

    if (coordinates.length < 2) {
      clearDirectionRoute();
      return;
    }

    // Clear existing route
    clearDirectionRoute();

    try {
      // Add source
      map.addSource("directions-route", {
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
        id: "directions-route-outline",
        type: "line",
        source: "directions-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1e3a8a",
          "line-width": 10,
          "line-opacity": 0.4,
        },
      });

      // Add main route layer
      map.addLayer({
        id: "directions-route",
        type: "line",
        source: "directions-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 6,
          "line-opacity": 0.9,
        },
      });

      routeLayerAddedRef.current = true;

      // Fit bounds
      const bounds = selectedDirection.bounds;
      if (bounds) {
        map.fitBounds(
          [
            [bounds.southwest.lng, bounds.southwest.lat],
            [bounds.northeast.lng, bounds.northeast.lat],
          ],
          {
            padding: { top: 100, bottom: 150, left: 350, right: 50 },
            maxZoom: 15,
            duration: 1000,
          }
        );
      }
    } catch (error) {
      console.error("Error adding directions route:", error);
    }
  }, [map, selectedDirection, clearDirectionRoute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDirectionRoute();
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
      }
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
      }
    };
  }, [clearDirectionRoute]);

  return null;
};

export default DirectionsOverlay;
