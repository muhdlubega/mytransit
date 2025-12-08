"use client";

import type React from "react";
import SearchBar from "../ui/SearchBar";
import Filters from "../ui/Filters";
import { useTransit } from "../../contexts/TransitContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../ui/Button";

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SunIcon = () => (
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
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = () => (
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
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const AndroidIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 00-.83.22l-1.88 3.24a11.463 11.463 0 00-8.94 0L5.65 5.67a.643.643 0 00-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 001 18h22a10.78 10.78 0 00-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
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

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onClose }) => {
  const { vehicles, isLoading, error, showVehicles, setShowVehicles } =
    useTransit();
  const { toggleTheme, isDark } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        sidebar left-0 w-80 border-r transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="p-4 space-y-6">
          {/* Header with Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-white dark:text-white">
                Find Transport
              </h2>
              <p className="text-sm text-dark-400">
                Search and filter vehicles
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors lg:hidden"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Search */}
          <SearchBar />

          {/* Filters */}
          <Filters />

          {/* Show/Hide Vehicles Toggle */}
          <div className="pt-4 border-t border-dark-800">
            <button
              onClick={() => setShowVehicles(!showVehicles)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                showVehicles
                  ? "bg-primary-500 text-white"
                  : "bg-dark-850 text-dark-400 hover:bg-dark-800"
              }`}
            >
              <span className="font-medium">
                {showVehicles ? "Hide Live Vehicles" : "Show Live Vehicles"}
              </span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showVehicles ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="pt-4 border-t border-dark-800">
            <h3 className="text-sm font-display font-semibold text-dark-400 mb-3">
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
                  <p className="text-2xl font-display font-bold text-primary-400">
                    {vehicles.length}
                  </p>
                  <p className="text-xs text-dark-500">Total</p>
                </div>
                <div className="bg-dark-850 rounded-lg p-3">
                  <p className="text-2xl font-display font-bold text-green-400">
                    {vehicles.filter(v => (v.speed || 0) > 0.5).length}
                  </p>
                  <p className="text-xs text-dark-500">Moving</p>
                </div>
              </div>
            )}
          </div>

          {/* Download Mobile App */}
          <div className="pt-4 border-t border-dark-800">
            <Button
              variant="primary"
              fullWidth
              leftIcon={<AndroidIcon />}
              onClick={() =>
                window.open(
                  "https://drive.google.com/drive/folders/1A9idFPYLfamLrU35k8XF_EVFiEgBXqC8?usp=sharing",
                  "_blank"
                )
              }
              className="font-display py-4"
            >
              Download Mobile App
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;
