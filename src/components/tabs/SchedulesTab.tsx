import React, { useState, useMemo } from "react";
import { useTransit } from "../../contexts/TransitContext";
import { formatScheduleTime } from "../../utils/formatters";
import Input from "../ui/Input";

const SearchIcon = () => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const BackIcon = () => (
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
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

// Bus Icon
const BusIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 16c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h6v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2V8c0-3.5-3.58-4-8-4s-8 .5-8 4v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V8h12v3z" />
  </svg>
);

const SchedulesTab: React.FC = () => {
  const { staticData, selectedVehicle } = useTransit();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    selectedVehicle?.routeId || ""
  );

  const routes = staticData?.routes || [];
  const stops = staticData?.stops || [];
  const stopTimes = staticData?.stopTimes || [];

  // Filter routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return routes;

    const query = searchQuery.toLowerCase();
    return routes.filter(
      route =>
        route.routeShortName?.toLowerCase().includes(query) ||
        route.routeLongName?.toLowerCase().includes(query) ||
        route.routeId.toLowerCase().includes(query)
    );
  }, [routes, searchQuery]);

  const routeSchedule = useMemo(() => {
    if (!selectedRouteId) return [];

    const trip = staticData?.trips.find(t => t.routeId === selectedRouteId);
    if (!trip) return [];

    const times = stopTimes
      .filter(st => st.tripId === trip.tripId)
      .sort((a, b) => a.stopSequence - b.stopSequence);

    return times.map(time => {
      const stop = stops.find(s => s.stopId === time.stopId);
      return {
        ...time,
        stopName: stop?.stopName || time.stopId,
      };
    });
  }, [selectedRouteId, staticData, stopTimes, stops]);

  const selectedRoute = routes.find(r => r.routeId === selectedRouteId);

  const handleRouteClick = (routeId: string) => {
    setSelectedRouteId(routeId);
    setSearchQuery("");
  };

  const handleBack = () => {
    setSelectedRouteId("");
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Input
        placeholder="Search routes..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        leftIcon={<SearchIcon />}
      />

      {/* Schedule View */}
      {selectedRouteId && routeSchedule.length > 0 ? (
        <div className="space-y-3">
          {/* Back Button and Route Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
            >
              <BackIcon />
            </button>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-white">
                {selectedRoute?.routeShortName || "Route"}
              </h3>
              <p className="text-sm text-dark-400 truncate">
                {selectedRoute?.routeLongName}
              </p>
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-dark-850 rounded-lg overflow-hidden overflow-y-auto">
            {routeSchedule.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === routeSchedule.length - 1;

              return (
                <div
                  key={`${item.tripId}-${item.stopSequence}`}
                  className="flex items-center gap-4 p-3 border-b border-dark-700 last:border-0 hover:bg-dark-800 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isFirst
                          ? "bg-green-500"
                          : isLast
                          ? "bg-red-500"
                          : "bg-dark-600"
                      }`}
                    />
                    {!isLast && <div className="w-0.5 h-6 bg-dark-600 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {item.stopName}
                    </p>
                    <div className="flex gap-4 text-sm text-dark-400">
                      <span>Arr: {formatScheduleTime(item.arrivalTime)}</span>
                      <span>Dep: {formatScheduleTime(item.departureTime)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-dark-500">
                    #{item.stopSequence}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stop Count */}
          <p className="text-xs text-dark-500 text-center">
            {routeSchedule.length} stops on this route
          </p>
        </div>
      ) : selectedRouteId ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
            >
              <BackIcon />
            </button>
            <h3 className="font-display font-semibold text-white">
              {selectedRoute?.routeShortName || "Route"}
            </h3>
          </div>
          <div className="text-center py-8 text-dark-400">
            No schedule data available for this route
          </div>
        </div>
      ) : (
        /* Route Selection View */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-dark-400">
              Available Routes
            </h3>
            <span className="text-xs text-dark-500">
              {filteredRoutes.length} routes
            </span>
          </div>

          {/* Route Buttons Grid */}
          <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-1">
            {filteredRoutes.map(route => (
              <button
                key={route.routeId}
                onClick={() => handleRouteClick(route.routeId)}
                className="flex items-center gap-3 p-3 bg-dark-850 rounded-lg hover:bg-dark-800 border border-transparent hover:border-primary-500/30 transition-all text-left group"
              >
                {/* Route Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: route.routeColor
                      ? `#${route.routeColor}20`
                      : "rgba(207, 52, 118, 0.1)",
                  }}
                >
                  <BusIcon className="w-5 h-5" />
                </div>

                {/* Route Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-display font-bold text-white"
                      style={{
                        color: route.routeColor
                          ? `#${route.routeColor}`
                          : undefined,
                      }}
                    >
                      {route.routeShortName || "MRT Feeder"}
                    </span>
                  </div>
                  <p className="text-sm text-dark-400 truncate">
                    {route.routeLongName || "Bus Route"}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-dark-600 group-hover:text-dark-400 transition-colors">
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* No Routes Found */}
          {filteredRoutes.length === 0 && (
            <div className="text-center py-8 text-dark-400">
              <p>No routes found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulesTab;
