import React, { useState, useMemo } from "react";
import { useTransit } from "../../contexts/TransitContext";
import { formatScheduleTime } from "../../utils/formatters";
import Input from "../ui/Input";
import Select from "../ui/Select";

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

const SchedulesTab: React.FC = () => {
  const { staticData, selectedVehicle } = useTransit();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    selectedVehicle?.routeId || ""
  );

  const routes = staticData?.routes || [];
  const stops = staticData?.stops || [];
  const stopTimes = staticData?.stopTimes || [];

  const routeOptions = useMemo(
    () =>
      routes.map(r => ({
        value: r.routeId,
        label: `${r.routeShortName} - ${r.routeLongName}`,
      })),
    [routes]
  );

  const filteredStops = useMemo(() => {
    let filtered = stops;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        stop =>
          stop.stopName.toLowerCase().includes(query) ||
          stop.stopId.toLowerCase().includes(query)
      );
    }

    return filtered.slice(0, 20);
  }, [stops, searchQuery]);

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

  return (
    <div className="space-y-4">
      <Select
        label="Select Route"
        value={selectedRouteId}
        onChange={e => setSelectedRouteId(e.target.value)}
        options={routeOptions}
        placeholder="Choose a route"
      />

      <Input
        placeholder="Search stops..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        leftIcon={<SearchIcon />}
      />

      {selectedRouteId && routeSchedule.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-dark-400">
            Schedule for{" "}
            {routes.find(r => r.routeId === selectedRouteId)?.routeShortName}
          </h3>
          <div className="bg-dark-850 rounded-lg overflow-hidden">
            {routeSchedule.map((item, index) => (
              <div
                key={`${item.tripId}-${item.stopSequence}`}
                className="flex items-center gap-4 p-3 border-b border-dark-700 last:border-0"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      index === 0
                        ? "bg-green-500"
                        : index === routeSchedule.length - 1
                        ? "bg-red-500"
                        : "bg-dark-600"
                    }`}
                  />
                  {index < routeSchedule.length - 1 && (
                    <div className="w-0.5 h-6 bg-dark-600 mt-1" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{item.stopName}</p>
                  <div className="flex gap-4 text-sm text-dark-400">
                    <span>Arr: {formatScheduleTime(item.arrivalTime)}</span>
                    <span>Dep: {formatScheduleTime(item.departureTime)}</span>
                  </div>
                </div>
                <div className="text-xs text-dark-500">
                  #{item.stopSequence}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : selectedRouteId ? (
        <div className="text-center py-8 text-dark-400">
          No schedule data available for this route
        </div>
      ) : null}

      {!selectedRouteId && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-dark-400">All Stops</h3>
          {filteredStops.map(stop => (
            <div
              key={stop.stopId}
              className="bg-dark-850 rounded-lg p-3 hover:bg-dark-800 transition-colors"
            >
              <p className="font-medium text-white">{stop.stopName}</p>
              <p className="text-sm text-dark-500">ID: {stop.stopId}</p>
            </div>
          ))}
          {filteredStops.length === 0 && (
            <div className="text-center py-8 text-dark-400">No stops found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulesTab;
