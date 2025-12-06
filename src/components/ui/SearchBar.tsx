import React, { useState, useRef, useEffect } from "react";
import { useTransit } from "../../contexts/TransitContext";
import { useMap } from "../../contexts/MapContext";
import { useDebounce } from "../../hooks/useDebounce";
import { Vehicle } from "../../types/vehicle";

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

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Vehicle[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const { vehicles, setSelectedVehicle } = useTransit();
  const { flyTo, setHighlightedRouteId } = useMap();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const filtered = vehicles.filter(
      vehicle =>
        vehicle.vehicleId
          .toLowerCase()
          .includes(debouncedQuery.toLowerCase()) ||
        vehicle.label?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        vehicle.routeId?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        vehicle.routeName?.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    setResults(filtered.slice(0, 10));
  }, [debouncedQuery, vehicles]);

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

  const handleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setHighlightedRouteId(vehicle.routeId || null);
    flyTo(
      vehicle.interpolatedLng || vehicle.longitude,
      vehicle.interpolatedLat || vehicle.latitude,
      16
    );
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search vehicles, routes..."
          className="input pl-10"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-850 border border-dark-700 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
          {results.map(vehicle => (
            <button
              key={vehicle.id}
              onClick={() => handleSelect(vehicle)}
              className="w-full px-4 py-3 text-left hover:bg-dark-800 transition-colors border-b border-dark-700 last:border-0"
            >
              <div className="font-medium text-white">
                {vehicle.label || vehicle.vehicleId}
              </div>
              <div className="text-sm text-dark-400">
                {vehicle.routeName} • {vehicle.operator}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && debouncedQuery.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-850 border border-dark-700 rounded-lg p-4 text-center text-dark-400">
          No vehicles found
        </div>
      )}
    </div>
  );
};

export default SearchBar;
