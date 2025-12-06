import React from "react";
import { useTransit } from "../../contexts/TransitContext";
import { useMap } from "../../contexts/MapContext";
import { VEHICLE_TYPES } from "../../utils/constants";
import Select from "./Select";
import Button from "./Button";

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

const RefreshIcon = () => (
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
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const FEED_OPTIONS = [
  { value: "rapid-bus-mrtfeeder", label: "MRT Feeder Bus (KL)" },
  { value: "rapid-bus-kl", label: "RapidKL Bus" },
  { value: "rapid-bus-penang", label: "Rapid Penang" },
  { value: "rapid-bus-kuantan", label: "Rapid Kuantan" },
];

const Filters: React.FC = () => {
  const {
    filters,
    setFilters,
    selectedFeed,
    setSelectedFeed,
    refreshVehicles,
    isLoading,
  } = useTransit();
  const {
    isLocationEnabled,
    enableLocation,
    disableLocation,
    userLocation,
    flyTo,
  } = useMap();

  const handleFeedChange = (value: string) => {
    setSelectedFeed({ type: "prasarana", category: value });
  };

  const handleLocationToggle = () => {
    if (isLocationEnabled) {
      disableLocation();
    } else {
      enableLocation();
    }
  };

  const handleGoToLocation = () => {
    if (userLocation) {
      flyTo(userLocation.longitude, userLocation.latitude, 15);
    }
  };

  return (
    <div className="space-y-4">
      {/* Feed Selection */}
      <div>
        <h3 className="text-sm font-display font-semibold text-dark-400 mb-2">
          Data Source
        </h3>
        <Select
          value={selectedFeed.category}
          onChange={e => handleFeedChange(e.target.value)}
          options={FEED_OPTIONS}
        />
      </div>

      {/* Refresh Button */}
      <Button
        variant="secondary"
        fullWidth
        leftIcon={<RefreshIcon />}
        onClick={refreshVehicles}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Refresh Data"}
      </Button>

      {/* Vehicle Type Filter - Only Bus and Train */}
      <div>
        <h3 className="text-sm font-display font-semibold text-dark-400 mb-2">
          Vehicle Type
        </h3>
        <div className="flex gap-2">
          {VEHICLE_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() =>
                setFilters({
                  ...filters,
                  vehicleType:
                    filters.vehicleType === type.value ? null : type.value,
                })
              }
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                filters.vehicleType === type.value
                  ? "bg-primary-500 text-white"
                  : "bg-dark-800 text-dark-300 hover:bg-dark-700"
              }`}
            >
              <span className="mr-1">{type.icon}</span> {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="pt-2">
        <h3 className="text-sm font-display font-semibold text-dark-400 mb-2">
          Location
        </h3>
        <div className="space-y-2">
          <Button
            variant={isLocationEnabled ? "primary" : "secondary"}
            fullWidth
            leftIcon={<LocationIcon />}
            onClick={handleLocationToggle}
          >
            {isLocationEnabled ? "Location Enabled" : "Turn on Location"}
          </Button>

          {isLocationEnabled && userLocation && (
            <Button variant="ghost" fullWidth onClick={handleGoToLocation}>
              Go to My Location
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
