import React, { useState, useCallback } from "react";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import MapView from "../map/MapView";
import VehiclePopup from "../ui/VehiclePopup";
import { NavTabId } from "../../utils/constants";
import { useTransit } from "../../contexts/TransitContext";

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId | null>(null);
  const { selectedVehicle } = useTransit();

  const handleShowSchedule = useCallback(() => {
    setActiveTab("schedules");
  }, []);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pt-16 flex">
        <LeftSidebar />

        <main className="flex-1 ml-80 relative">
          <MapView />
        </main>

        {activeTab && (
          <RightSidebar
            activeTab={activeTab}
            onClose={() => setActiveTab(null)}
          />
        )}
      </div>

      {selectedVehicle && <VehiclePopup onShowSchedule={handleShowSchedule} />}
    </div>
  );
};

export default MainLayout;
