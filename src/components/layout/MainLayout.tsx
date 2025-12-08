"use client";

import type React from "react";
import { useState, useCallback } from "react";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import MapView from "../map/MapView";
import VehiclePopup from "../ui/VehiclePopup";
import ChatBot from "../map/ChatBot";
import type { NavTabId } from "../../utils/constants";
import { useTransit } from "../../contexts/TransitContext";
import { useMap } from "../../contexts/MapContext";
import type { PlaceDetails } from "../../services/googleMapsService";

const MenuIcon = () => (
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
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<
    string | undefined
  >(undefined);
  const { selectedVehicle } = useTransit();
  const {
    setRouteDestination,
    setRouteOrigin,
    userLocation,
    isLocationEnabled,
  } = useMap();

  const handleShowSchedule = useCallback(() => {
    setActiveTab("schedules");
  }, []);

  const handleOpenChatBot = useCallback((message?: string) => {
    setChatInitialMessage(message);
    setShowChatBot(true);
  }, []);

  const handleToggleChatBot = useCallback(() => {
    setShowChatBot(prev => !prev);
    if (showChatBot) {
      setChatInitialMessage(undefined);
    }
  }, [showChatBot]);

  const handleSelectDestination = useCallback(
    (place: PlaceDetails) => {
      setRouteDestination(place);

      if (isLocationEnabled && userLocation) {
        const userPlace: PlaceDetails = {
          placeId: "user-location",
          name: "My Location",
          address: "Current Location",
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        };
        setRouteOrigin(userPlace);
      }

      setActiveTab("routes");
    },
    [setRouteDestination, setRouteOrigin, userLocation, isLocationEnabled]
  );

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Mobile menu button */}
      <button
        onClick={() => setLeftSidebarOpen(true)}
        className="fixed top-20 left-4 z-30 p-3 bg-dark-900 border border-dark-700 rounded-xl shadow-lg lg:hidden hover:bg-dark-800 transition-colors"
      >
        <MenuIcon />
      </button>

      <div className="pt-16 flex">
        <LeftSidebar
          isOpen={leftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
        />

        <main className="flex-1 lg:ml-80 relative">
          <MapView
            onOpenChatBot={handleOpenChatBot}
            showChatBot={showChatBot}
            onToggleChatBot={handleToggleChatBot}
          />
        </main>

        {activeTab && (
          <RightSidebar
            activeTab={activeTab}
            onClose={() => setActiveTab(null)}
            onOpenChatBot={handleOpenChatBot}
          />
        )}
      </div>

      {/* Vehicle popup - shifts left when right sidebar is open */}
      {selectedVehicle && (
        <VehiclePopup
          onShowSchedule={handleShowSchedule}
          rightSidebarOpen={activeTab !== null}
        />
      )}

      <ChatBot
        isOpen={showChatBot}
        onClose={() => {
          setShowChatBot(false);
          setChatInitialMessage(undefined);
        }}
        onSelectDestination={handleSelectDestination}
        initialMessage={chatInitialMessage}
      />
    </div>
  );
};

export default MainLayout;
