import React, { useEffect, useState } from "react";
import { useTransit } from "../../contexts/TransitContext";
import { useMap } from "../../contexts/MapContext";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import { formatSpeed, formatDistance } from "../../utils/formatters";
import { calculateDistance } from "../../utils/distance";
import { getDrivingTimeToUser } from "../../services/googleMapsService";
import Button from "./Button";

interface VehiclePopupProps {
  onShowSchedule: () => void;
  rightSidebarOpen?: boolean;
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

const CarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
  </svg>
);

const VehiclePopup: React.FC<VehiclePopupProps> = ({
  onShowSchedule,
  rightSidebarOpen = false,
}) => {
  const { selectedVehicle, setSelectedVehicle } = useTransit();
  const { userLocation, setHighlightedRouteId, isLocationEnabled } = useMap();
  const { isAuthenticated, isGuest } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const [drivingETA, setDrivingETA] = useState<string | null>(null);
  const [isLoadingETA, setIsLoadingETA] = useState(false);

  // Calculate driving ETA when vehicle or user location changes
  useEffect(() => {
    const fetchDrivingETA = async () => {
      if (!selectedVehicle || !userLocation || !isLocationEnabled) {
        setDrivingETA(null);
        return;
      }

      setIsLoadingETA(true);
      try {
        const vehicleLat =
          selectedVehicle.interpolatedLat || selectedVehicle.latitude;
        const vehicleLng =
          selectedVehicle.interpolatedLng || selectedVehicle.longitude;

        const result = await getDrivingTimeToUser(
          vehicleLat,
          vehicleLng,
          userLocation.latitude,
          userLocation.longitude
        );

        if (result) {
          setDrivingETA(result.duration);
        } else {
          setDrivingETA(null);
        }
      } catch (error) {
        console.error("Error fetching driving ETA:", error);
        setDrivingETA(null);
      } finally {
        setIsLoadingETA(false);
      }
    };

    fetchDrivingETA();
  }, [
    selectedVehicle?.id,
    userLocation?.latitude,
    userLocation?.longitude,
    isLocationEnabled,
  ]);

  if (!selectedVehicle) return null;

  const favorite = favorites.find(
    f => f.vehicleId === selectedVehicle.vehicleId
  );
  const isVehicleFavorite = !!favorite;

  let distanceToUser: number | null = null;

  if (userLocation && selectedVehicle) {
    distanceToUser = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      selectedVehicle.interpolatedLat || selectedVehicle.latitude,
      selectedVehicle.interpolatedLng || selectedVehicle.longitude
    );
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
    <div
      className={`
        fixed bottom-4 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-slide-in-up z-50
        transition-all duration-300 ease-in-out
        ${rightSidebarOpen ? "right-[400px]" : "right-4"}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-850">
        <div>
          <h3 className="font-display font-bold text-white">
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
            <p className="text-xs text-dark-500 uppercase font-medium">Speed</p>
            <p className="text-lg font-display font-bold text-white">
              {selectedVehicle.speed
                ? formatSpeed(selectedVehicle.speed)
                : "Stopped"}
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-500 uppercase font-medium">
              Operator
            </p>
            <p className="text-lg font-display font-bold text-white">
              {selectedVehicle.operator || "Unknown"}
            </p>
          </div>
        </div>

        {selectedVehicle.nextStop && (
          <div>
            <p className="text-xs text-dark-500 uppercase font-medium">
              Next Stop
            </p>
            <p className="text-white font-medium">{selectedVehicle.nextStop}</p>
          </div>
        )}

        {/* Distance and ETA to User */}
        {isLocationEnabled && userLocation && distanceToUser !== null && (
          <div className="bg-dark-850 rounded-lg p-3 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-dark-500 uppercase font-medium">
                  Distance to You
                </p>
                <p className="text-lg font-display font-bold text-primary-400">
                  {formatDistance(distanceToUser)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-dark-500 uppercase font-medium flex items-center gap-1 justify-end">
                  <CarIcon />
                  Driving Time
                </p>
                {isLoadingETA ? (
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : drivingETA ? (
                  <p className="text-lg font-display font-bold text-primary-400">
                    {drivingETA}
                  </p>
                ) : (
                  <p className="text-sm text-dark-500">N/A</p>
                )}
              </div>
            </div>
            <p className="text-xs text-dark-500">
              * Time based on current driving conditions from vehicle to your
              location
            </p>
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
