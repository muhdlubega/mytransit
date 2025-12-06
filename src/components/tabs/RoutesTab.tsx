import React, { useState } from "react";
import { getDirections } from "../../services/googleMapsService";
import { DirectionRoute } from "../../types/map";
import { useTransit } from "../../contexts/TransitContext";
import Input from "../ui/Input";
import Button from "../ui/Button";

type TravelMode = "transit" | "driving" | "walking" | "bicycling";

const ModeIcon: React.FC<{ mode: TravelMode }> = ({ mode }) => {
  const icons: Record<TravelMode, React.ReactNode> = {
    transit: (
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
    driving: (
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
          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
        />
      </svg>
    ),
    walking: (
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    bicycling: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="5.5" cy="17.5" r="3.5" strokeWidth={2} fill="none" />
        <circle cx="18.5" cy="17.5" r="3.5" strokeWidth={2} fill="none" />
      </svg>
    ),
  };
  return <>{icons[mode]}</>;
};

const RoutesTab: React.FC = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<TravelMode>("transit");
  const [routes, setRoutes] = useState<DirectionRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { staticData } = useTransit();

  const handleSearch = async () => {
    if (!origin || !destination) {
      setError("Please enter both origin and destination");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await getDirections(origin, destination, mode);

    if (result.status !== "OK" || result.routes.length === 0) {
      setError("No routes found. Try different locations.");
      setRoutes([]);
    } else {
      setRoutes(result.routes);
    }

    setIsLoading(false);
  };

  const modes: TravelMode[] = ["transit", "driving", "walking", "bicycling"];
  const modeLabels: Record<TravelMode, string> = {
    transit: "Transit",
    driving: "Car",
    walking: "Walk",
    bicycling: "Bike",
  };

  const stopSuggestions = staticData?.stops.map(s => s.stopName) || [];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Input
          placeholder="Starting point"
          value={origin}
          onChange={e => setOrigin(e.target.value)}
          leftIcon={<div className="w-3 h-3 bg-green-500 rounded-full" />}
        />
        <Input
          placeholder="Destination"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          leftIcon={<div className="w-3 h-3 bg-red-500 rounded-full" />}
        />
      </div>

      <div className="flex gap-2">
        {modes.map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              mode === m
                ? "bg-primary-500 text-white"
                : "bg-dark-800 text-dark-400 hover:bg-dark-700"
            }`}
          >
            <ModeIcon mode={m} />
            <span className="text-xs">{modeLabels[m]}</span>
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={handleSearch}
        isLoading={isLoading}
      >
        Get Directions
      </Button>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {routes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-dark-400">Route Options</h3>
          {routes.map((route, index) => (
            <div
              key={index}
              className="bg-dark-850 rounded-lg p-4 border border-dark-700 hover:border-primary-500/50 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-white">
                    {route.summary || `Route ${index + 1}`}
                  </p>
                  <p className="text-sm text-dark-400">via {mode}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-400">
                    {route.duration}
                  </p>
                  <p className="text-sm text-dark-400">{route.distance}</p>
                </div>
              </div>

              <div className="space-y-2 mt-3 pt-3 border-t border-dark-700">
                {route.steps.slice(0, 3).map((step, stepIndex) => (
                  <div key={stepIndex} className="flex gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-dark-700 flex items-center justify-center text-xs text-dark-400">
                      {stepIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-dark-300">{step.instruction}</p>
                      <p className="text-xs text-dark-500">
                        {step.distance} • {step.duration}
                      </p>
                    </div>
                  </div>
                ))}
                {route.steps.length > 3 && (
                  <p className="text-xs text-dark-500 pl-8">
                    +{route.steps.length - 3} more steps
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {stopSuggestions.length > 0 && !routes.length && (
        <div className="pt-4 border-t border-dark-800">
          <h3 className="text-sm font-medium text-dark-400 mb-3">
            Popular Stops
          </h3>
          <div className="flex flex-wrap gap-2">
            {stopSuggestions.slice(0, 6).map((stop, index) => (
              <button
                key={index}
                onClick={() => setDestination(stop)}
                className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-full text-sm text-dark-300 transition-colors"
              >
                {stop}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesTab;
