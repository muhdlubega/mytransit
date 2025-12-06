import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "../../contexts/MapContext";
import { useTransit } from "../../contexts/TransitContext";
import { shapeToCoordinates } from "../../utils/distance";

interface RouteOverlayProps {
  map: mapboxgl.Map;
}

const RouteOverlay: React.FC<RouteOverlayProps> = ({ map }) => {
  const { highlightedRouteId } = useMap();
  const { selectedVehicle, getShapeForVehicle, staticData } = useTransit();
  const sourceAddedRef = useRef(false);
  const currentRouteIdRef = useRef<string | null>(null);

  const clearRoute = useCallback(() => {
    if (!map) return;

    try {
      if (map.getLayer("route-highlight-outline")) {
        map.removeLayer("route-highlight-outline");
      }
      if (map.getLayer("route-highlight")) {
        map.removeLayer("route-highlight");
      }
      if (map.getLayer("route-stops")) {
        map.removeLayer("route-stops");
      }
      if (map.getSource("route-highlight")) {
        map.removeSource("route-highlight");
      }
      if (map.getSource("route-stops")) {
        map.removeSource("route-stops");
      }
    } catch (e) {
      // Ignore errors during cleanup
    }

    sourceAddedRef.current = false;
    currentRouteIdRef.current = null;
  }, [map]);

  useEffect(() => {
    if (!map || !map.loaded()) {
      return;
    }

    // Clear if no vehicle selected
    if (!selectedVehicle) {
      clearRoute();
      return;
    }

    // Get shape for selected vehicle
    const shapePoints =
      selectedVehicle.shapePoints || getShapeForVehicle(selectedVehicle);

    if (!shapePoints || shapePoints.length < 2) {
      console.log("No shape data for vehicle:", selectedVehicle.id);
      clearRoute();
      return;
    }

    // Check if route already displayed
    const routeId =
      selectedVehicle.shapeId || selectedVehicle.routeId || selectedVehicle.id;
    if (currentRouteIdRef.current === routeId && sourceAddedRef.current) {
      return;
    }

    // Clear existing route
    clearRoute();

    const coordinates = shapeToCoordinates(shapePoints);
    const routeColor = selectedVehicle.routeColor
      ? `#${selectedVehicle.routeColor}`
      : "#CF3476";

    console.log(
      "Drawing route with",
      coordinates.length,
      "points, color:",
      routeColor
    );

    try {
      // Add route source
      map.addSource("route-highlight", {
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

      // Add outline layer (wider, darker)
      map.addLayer({
        id: "route-highlight-outline",
        type: "line",
        source: "route-highlight",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#000000",
          "line-width": 8,
          "line-opacity": 0.5,
        },
      });

      // Add main route layer
      map.addLayer({
        id: "route-highlight",
        type: "line",
        source: "route-highlight",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": routeColor,
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });

      // Add stops along the route if available
      if (staticData?.stopTimes && selectedVehicle.tripId) {
        const tripStopTimes = staticData.stopTimes
          .filter(st => st.tripId === selectedVehicle.tripId)
          .sort((a, b) => a.stopSequence - b.stopSequence);

        const stopFeatures = tripStopTimes
          .map(st => {
            const stop = staticData.stops.find(s => s.stopId === st.stopId);
            if (stop && stop.stopLat && stop.stopLon) {
              return {
                type: "Feature" as const,
                properties: {
                  name: stop.stopName,
                  sequence: st.stopSequence,
                },
                geometry: {
                  type: "Point" as const,
                  coordinates: [stop.stopLon, stop.stopLat],
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        if (stopFeatures.length > 0) {
          map.addSource("route-stops", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: stopFeatures as any,
            },
          });

          map.addLayer({
            id: "route-stops",
            type: "circle",
            source: "route-stops",
            paint: {
              "circle-radius": 6,
              "circle-color": "#ffffff",
              "circle-stroke-width": 2,
              "circle-stroke-color": routeColor,
            },
          });
        }
      }

      sourceAddedRef.current = true;
      currentRouteIdRef.current = routeId;

      // Fit map to show entire route
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(
          coordinates[0] as [number, number],
          coordinates[0] as [number, number]
        )
      );

      map.fitBounds(bounds, {
        padding: { top: 100, bottom: 150, left: 350, right: 50 },
        maxZoom: 15,
        duration: 1000,
      });
    } catch (error) {
      console.error("Error adding route to map:", error);
    }
  }, [map, selectedVehicle, getShapeForVehicle, staticData, clearRoute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRoute();
    };
  }, [clearRoute]);

  return null;
};

export default RouteOverlay;
