import React from "react";
import { useFavorites } from "../../hooks/useFavorites";
import { useTransit } from "../../contexts/TransitContext";
import { useMap } from "../../contexts/MapContext";
import LoadingSpinner from "../ui/LoadingSpinner";

const StarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const TrashIcon = () => (
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
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const FavouritesTab: React.FC = () => {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const { vehicles, setSelectedVehicle } = useTransit();
  const { flyTo, setHighlightedRouteId } = useMap();

  const handleViewFavorite = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setHighlightedRouteId(vehicle.routeId || null);
      flyTo(
        vehicle.interpolatedLng || vehicle.longitude,
        vehicle.interpolatedLat || vehicle.latitude,
        16
      );
    }
  };

  const handleRemove = async (favoriteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeFavorite(favoriteId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-400">
          <StarIcon />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          No Favourites Yet
        </h3>
        <p className="text-dark-400 text-sm max-w-xs mx-auto">
          Click on a vehicle marker and tap the star icon to add it to your
          favourites.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-dark-400 mb-4">
        {favorites.length} saved favourite{favorites.length !== 1 ? "s" : ""}
      </p>

      {favorites.map(favorite => {
        const vehicle = vehicles.find(v => v.vehicleId === favorite.vehicleId);
        const isActive = !!vehicle;

        return (
          <div
            key={favorite.id}
            onClick={() => isActive && handleViewFavorite(favorite.vehicleId)}
            className={`bg-dark-850 rounded-lg p-4 border transition-all ${
              isActive
                ? "border-dark-700 hover:border-primary-500/50 cursor-pointer"
                : "border-dark-800 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-primary-500" : "bg-dark-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 16c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h6v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2V8c0-3.5-3.58-4-8-4s-8 .5-8 4v8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-white">
                    {favorite.displayName}
                  </h4>
                  <p className="text-sm text-dark-400">
                    {favorite.routeId || "Unknown Route"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                        isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-dark-700 text-dark-500"
                      }`}
                    >
                      {isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={e => handleRemove(favorite.id, e)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-500 hover:text-red-400"
              >
                <TrashIcon />
              </button>
            </div>

            {isActive && vehicle && (
              <div className="mt-3 pt-3 border-t border-dark-700 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-dark-500">Speed</p>
                  <p className="text-sm font-medium text-white">
                    {vehicle.speed
                      ? `${Math.round(vehicle.speed * 3.6)} km/h`
                      : "Stopped"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-500">Status</p>
                  <p className="text-sm font-medium text-white">
                    {vehicle.speed && vehicle.speed > 0
                      ? "Moving"
                      : "Stationary"}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FavouritesTab;
