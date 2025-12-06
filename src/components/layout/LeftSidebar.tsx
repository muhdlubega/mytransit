import React from "react";
import SearchBar from "../ui/SearchBar";
import Filters from "../ui/Filters";
import { useTransit } from "../../contexts/TransitContext";

const LeftSidebar: React.FC = () => {
  const { vehicles, isLoading, error } = useTransit();

  return (
    <aside className="sidebar left-0 w-80 border-r animate-slide-in-left">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">
            Find Transport
          </h2>
          <p className="text-sm text-dark-400">Search and filter vehicles</p>
        </div>

        <SearchBar />

        <Filters />

        <div className="pt-4 border-t border-dark-800">
          <h3 className="text-sm font-medium text-dark-400 mb-3">
            Active Vehicles
          </h3>

          {isLoading ? (
            <div className="flex items-center gap-2 text-dark-500">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm">{error}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-850 rounded-lg p-3">
                <p className="text-2xl font-bold text-primary-400">
                  {vehicles.length}
                </p>
                <p className="text-xs text-dark-500">Vehicles</p>
              </div>
              <div className="bg-dark-850 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-400">
                  {vehicles.filter(v => (v.speed || 0) > 0).length}
                </p>
                <p className="text-xs text-dark-500">Moving</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-dark-800">
          <h3 className="text-sm font-medium text-dark-400 mb-3">
            Nearby Vehicles
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {vehicles.slice(0, 5).map(vehicle => (
              <div
                key={vehicle.id}
                className="bg-dark-850 rounded-lg p-3 hover:bg-dark-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">
                      {vehicle.label || vehicle.vehicleId}
                    </p>
                    <p className="text-xs text-dark-500">{vehicle.operator}</p>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: `#${vehicle.routeColor || "CF3476"}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
