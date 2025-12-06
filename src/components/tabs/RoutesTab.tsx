import React, { useState, useEffect, useRef } from "react";
import {
  getPlaceAutocomplete,
  getPlaceDetails,
  getDirections,
  PlacePrediction,
  PlaceDetails,
  DirectionRoute,
  DirectionStep,
} from "../../services/googleMapsService";
import { useMap } from "../../contexts/MapContext";
import { useTransit } from "../../contexts/TransitContext";
import { useDebounce } from "../../hooks/useDebounce";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

type TravelMode = "TRANSIT" | "DRIVING" | "WALKING" | "BICYCLING";

const LocationIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const WalkIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
  </svg>
);

const ModeIcon: React.FC<{ mode: TravelMode }> = ({ mode }) => {
  const icons: Record<TravelMode, React.ReactNode> = {
    TRANSIT: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    DRIVING: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
      </svg>
    ),
    WALKING: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
      </svg>
    ),
    BICYCLING: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" />
      </svg>
    ),
  };
  return <>{icons[mode]}</>;
};

// Transit Badge Component
const TransitBadge: React.FC<{ step: DirectionStep }> = ({ step }) => {
  if (!step.transitDetails) return null;

  const { lineShortName, lineName, lineColor, lineTextColor } =
    step.transitDetails;
  const displayName = lineShortName || lineName;

  if (!displayName) return null;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{
        backgroundColor: lineColor,
        color: lineTextColor,
      }}
    >
      {displayName}
    </span>
  );
};

// Step Display Component
const StepDisplay: React.FC<{ step: DirectionStep; index: number }> = ({
  step,
  index,
}) => {
  const isTransit = step.travelMode === "TRANSIT" && step.transitDetails;
  const isWalk = step.travelMode === "WALK";

  return (
    <div className="flex gap-3 text-sm py-2">
      {/* Step indicator with line color */}
      <div className="flex flex-col items-center">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            backgroundColor: step.color || "#9b2761",
            color: "#ffffff",
          }}
        >
          {isWalk ? <WalkIcon /> : index + 1}
        </div>
        <div
          className="w-0.5 flex-1 mt-1"
          style={{ backgroundColor: step.color || "#9b2761" }}
        />
      </div>

      <div className="flex-1 min-w-0 pb-3">
        {/* Transit Badge */}
        {isTransit && step.transitDetails && (
          <div className="flex items-center gap-2 mb-1">
            <TransitBadge step={step} />
            <span className="text-dark-400 text-xs">
              {step.transitDetails.vehicleType}
            </span>
          </div>
        )}

        {/* Instruction */}
        <p className="text-white font-medium">{step.instruction}</p>

        {/* Transit Details */}
        {isTransit && step.transitDetails && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <span className="text-green-400">●</span>
              <span>{step.transitDetails.departureStop}</span>
              <span className="text-dark-500">
                ({step.transitDetails.departureTime})
              </span>
            </div>
            {step.transitDetails.numStops > 0 && (
              <div className="text-xs text-dark-500 pl-4">
                {step.transitDetails.numStops} stops •{" "}
                {step.transitDetails.headsign}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <span className="text-red-400">●</span>
              <span>{step.transitDetails.arrivalStop}</span>
              <span className="text-dark-500">
                ({step.transitDetails.arrivalTime})
              </span>
            </div>
          </div>
        )}

        {/* Duration and Distance */}
        <div className="flex items-center gap-2 mt-1 text-xs text-dark-500">
          <span>{step.duration}</span>
          <span>•</span>
          <span>{step.distance}</span>
        </div>
      </div>
    </div>
  );
};

// Place Input Component
interface PlaceInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: PlaceDetails) => void;
  placeholder: string;
  icon: React.ReactNode;
  selectedPlace: PlaceDetails | null;
  onClear: () => void;
}

const PlaceInput: React.FC<PlaceInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  icon,
  selectedPlace,
  onClear,
}) => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedValue = useDebounce(value, 400);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (debouncedValue.length < 2 || selectedPlace) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getPlaceAutocomplete(debouncedValue);
        setPredictions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [debouncedValue, selectedPlace]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (prediction: PlacePrediction) => {
    setIsLoading(true);
    setIsOpen(false);

    try {
      const details = await getPlaceDetails(prediction.placeId);
      if (details) {
        onChange(prediction.mainText);
        onSelect(details);
        setPredictions([]);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
          {icon}
        </div>
        <input
          type="text"
          value={selectedPlace ? selectedPlace.name : value}
          onChange={e => {
            if (selectedPlace) onClear();
            onChange(e.target.value);
          }}
          onFocus={() =>
            predictions.length > 0 && !selectedPlace && setIsOpen(true)
          }
          placeholder={placeholder}
          className="input pl-10 pr-10"
        />
        {(selectedPlace || value) && (
          <button
            onClick={() => {
              onChange("");
              onClear();
              setPredictions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white p-1 rounded"
          >
            <CloseIcon />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-850 border border-dark-700 rounded-lg shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
          {predictions.map(prediction => (
            <button
              key={prediction.placeId}
              onClick={() => handleSelect(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-dark-800 transition-colors border-b border-dark-700 last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-dark-400">
                  <LocationIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {prediction.mainText}
                  </div>
                  <div className="text-sm text-dark-400 truncate">
                    {prediction.secondaryText}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Routes Tab
const RoutesTab: React.FC = () => {
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [mode, setMode] = useState<TravelMode>("TRANSIT");
  const [routes, setRoutes] = useState<DirectionRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
    null
  );

  const {
    routeOrigin,
    setRouteOrigin,
    routeDestination,
    setRouteDestination,
    setSelectedDirection,
    flyTo,
    flyToBounds,
    userLocation,
    isLocationEnabled,
    clearRoutePoints,
    setRouteDisplayMode,
  } = useMap();

  const { setSelectedVehicle } = useTransit();

  // Clear vehicle selection when using directions
  useEffect(() => {
    if (routeOrigin || routeDestination) {
      setSelectedVehicle(null);
      setRouteDisplayMode("directions");
    }
  }, [routeOrigin, routeDestination, setSelectedVehicle, setRouteDisplayMode]);

  useEffect(() => {
    if (routeOrigin) {
      flyTo(routeOrigin.lng, routeOrigin.lat, 14);
    }
  }, [routeOrigin, flyTo]);

  useEffect(() => {
    if (routeDestination) {
      flyTo(routeDestination.lng, routeDestination.lat, 14);
    }
  }, [routeDestination, flyTo]);

  const handleSearch = async () => {
    if (!routeOrigin || !routeDestination) {
      setError("Please select both origin and destination");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoutes([]);
    setSelectedRouteIndex(null);
    setSelectedDirection(null);

    try {
      const result = await getDirections(
        { lat: routeOrigin.lat, lng: routeOrigin.lng },
        { lat: routeDestination.lat, lng: routeDestination.lng },
        mode
      );

      if (result.status !== "OK" || result.routes.length === 0) {
        setError("No routes found. Try different locations or travel mode.");
      } else {
        setRoutes(result.routes);
        setSelectedRouteIndex(0);
        setSelectedDirection(result.routes[0]);
        setRouteDisplayMode("directions");

        // Fit bounds with padding for sidebar
        if (result.routes[0].bounds) {
          flyToBounds(result.routes[0].bounds, { left: 350, right: 420 });
        }
      }
    } catch (err) {
      console.error("Error fetching directions:", err);
      setError("Failed to get directions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteSelect = (index: number) => {
    setSelectedRouteIndex(index);
    setSelectedDirection(routes[index]);
    setRouteDisplayMode("directions");

    if (routes[index].bounds) {
      flyToBounds(routes[index].bounds, { left: 350, right: 420 });
    }
  };

  const handleUseMyLocation = () => {
    if (isLocationEnabled && userLocation) {
      const place: PlaceDetails = {
        placeId: "user-location",
        name: "My Location",
        address: "Current Location",
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
      setRouteOrigin(place);
      setOriginInput("My Location");
    }
  };

  const handleClearAll = () => {
    clearRoutePoints();
    setOriginInput("");
    setDestinationInput("");
    setRoutes([]);
    setSelectedRouteIndex(null);
    setError(null);
    setRouteDisplayMode("none");
  };

  const modes: TravelMode[] = ["TRANSIT", "DRIVING", "WALKING", "BICYCLING"];
  const modeLabels: Record<TravelMode, string> = {
    TRANSIT: "Transit",
    DRIVING: "Drive",
    WALKING: "Walk",
    BICYCLING: "Bike",
  };

  return (
    <div className="space-y-4">
      {/* Origin Input */}
      <div className="space-y-2">
        <PlaceInput
          value={originInput}
          onChange={setOriginInput}
          onSelect={place => setRouteOrigin(place)}
          placeholder="Enter starting point"
          icon={<div className="w-3 h-3 bg-green-500 rounded-full" />}
          selectedPlace={routeOrigin}
          onClear={() => setRouteOrigin(null)}
        />

        {isLocationEnabled && !routeOrigin && (
          <button
            onClick={handleUseMyLocation}
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 ml-1"
          >
            <LocationIcon />
            Use my current location
          </button>
        )}
      </div>

      {/* Swap Button */}
      {(routeOrigin || routeDestination) && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              const tempOrigin = routeOrigin;
              const tempInput = originInput;
              setRouteOrigin(routeDestination);
              setOriginInput(destinationInput);
              setRouteDestination(tempOrigin);
              setDestinationInput(tempInput);
            }}
            className="p-2 bg-dark-800 hover:bg-dark-700 rounded-full transition-colors"
          >
            <svg
              className="w-4 h-4 text-dark-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Destination Input */}
      <PlaceInput
        value={destinationInput}
        onChange={setDestinationInput}
        onSelect={place => setRouteDestination(place)}
        placeholder="Enter destination"
        icon={<div className="w-3 h-3 bg-red-500 rounded-full" />}
        selectedPlace={routeDestination}
        onClear={() => setRouteDestination(null)}
      />

      {/* Mode Selector */}
      <div className="flex gap-2">
        {modes.map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all ${
              mode === m
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                : "bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white"
            }`}
          >
            <ModeIcon mode={m} />
            <span className="text-xs font-medium">{modeLabels[m]}</span>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleSearch}
          isLoading={isLoading}
          disabled={!routeOrigin || !routeDestination}
        >
          Get Directions
        </Button>
        {(routeOrigin || routeDestination || routes.length > 0) && (
          <Button variant="ghost" onClick={handleClearAll}>
            Clear
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Route Results */}
      {routes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-display font-semibold text-dark-400">
            {routes.length} Route{routes.length !== 1 ? "s" : ""} Found
          </h3>

          {routes.map((route, index) => (
            <div
              key={index}
              className={`bg-dark-850 rounded-lg border transition-all ${
                selectedRouteIndex === index
                  ? "border-primary-500 ring-1 ring-primary-500/50"
                  : "border-dark-700 hover:border-dark-600"
              }`}
            >
              {/* Route Header - Clickable */}
              <button
                onClick={() => handleRouteSelect(index)}
                className="w-full p-4 text-left"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-white">
                      {route.summary || `Route ${index + 1}`}
                    </p>
                    <p className="text-sm text-dark-400">
                      via {modeLabels[mode]}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-display font-bold text-primary-400">
                      {route.duration}
                    </p>
                    <p className="text-sm text-dark-400">{route.distance}</p>
                  </div>
                </div>
              </button>

              {/* Full Steps - Always visible when selected */}
              {selectedRouteIndex === index && route.steps.length > 0 && (
                <div className="px-4 pb-4 border-t border-dark-700">
                  <div className="pt-3">
                    {route.steps.map((step, stepIndex) => (
                      <StepDisplay
                        key={stepIndex}
                        step={step}
                        index={stepIndex}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutesTab;
