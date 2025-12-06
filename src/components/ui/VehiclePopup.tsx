import React from "react";
import { useTransit } from "../../contexts/TransitContext";
import { useMap } from "../../contexts/MapContext";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import {
  formatSpeed,
  formatDistance,
  formatDuration,
} from "../../utils/formatters";
import { calculateDistance, getETA } from "../../utils/distance";
import Button from "./Button";

interface VehiclePopupProps {
  onShowSchedule: () => void;
}

const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className="w-5 h-5"
    fill={filled ? "currentColor" : "none"}
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

const VehiclePopup: React.FC<VehiclePopupProps> = ({ onShowSchedule }) => {
  const { selectedVehicle, setSelectedVehicle } = useTransit();
  const { userLocation, setHighlightedRouteId } = useMap();
  const { isAuthenticated, isGuest } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  if (!selectedVehicle) return null;

  const favorite = favorites.find(
    f => f.vehicleId === selectedVehicle.vehicleId
  );
  const isVehicleFavorite = !!favorite;

  let distanceToUser: number | null = null;
  let etaToUser: string | null = null;

  if (userLocation && selectedVehicle) {
    distanceToUser = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      selectedVehicle.interpolatedLat || selectedVehicle.latitude,
      selectedVehicle.interpolatedLng || selectedVehicle.longitude
    );

    if (selectedVehicle.speed && selectedVehicle.speed > 0) {
      const etaSeconds = getETA(distanceToUser, selectedVehicle.speed);
      etaToUser = formatDuration(etaSeconds);
    }
  }

  const handleClose = () => {
    setSelectedVehicle(null);
    setHighlightedRouteId(null);
  };

  const handleToggleFavorite = async () => {
    if (isVehicleFavorite && favorite) {
      await removeFavorite(favorite.id);
    } else {
      await addFavorite(
        selectedVehicle.vehicleId,
        selectedVehicle.label || selectedVehicle.vehicleId,
        selectedVehicle.routeId,
        selectedVehicle.vehicleType
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-slide-in-up z-50">
      <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-850">
        <div>
          <h3 className="font-semibold text-white">
            {selectedVehicle.label || selectedVehicle.vehicleId}
          </h3>
          <p className="text-sm text-dark-400">{selectedVehicle.routeName}</p>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-dark-500 uppercase">Speed</p>
            <p className="text-lg font-semibold text-white">
              {selectedVehicle.speed
                ? formatSpeed(selectedVehicle.speed)
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-500 uppercase">Operator</p>
            <p className="text-lg font-semibold text-white">
              {selectedVehicle.operator || "Unknown"}
            </p>
          </div>
        </div>

        {selectedVehicle.nextStop && (
          <div>
            <p className="text-xs text-dark-500 uppercase">Next Stop</p>
            <p className="text-white font-medium">{selectedVehicle.nextStop}</p>
          </div>
        )}

        {userLocation && distanceToUser !== null && (
          <div className="bg-dark-850 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-dark-500 uppercase">
                  Distance to You
                </p>
                <p className="text-lg font-semibold text-primary-400">
                  {formatDistance(distanceToUser)}
                </p>
              </div>
              {etaToUser && (
                <div className="text-right">
                  <p className="text-xs text-dark-500 uppercase">
                    Est. Arrival
                  </p>
                  <p className="text-lg font-semibold text-primary-400">
                    {etaToUser}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onShowSchedule}
          >
            Show Schedule
          </Button>

          {isAuthenticated && !isGuest && (
            <Button
              variant={isVehicleFavorite ? "primary" : "ghost"}
              onClick={handleToggleFavorite}
              className={isVehicleFavorite ? "" : "border border-dark-600"}
            >
              <StarIcon filled={isVehicleFavorite} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePopup;
