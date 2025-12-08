"use client";

import type React from "react";
import type { NavTabId } from "../../utils/constants";
import RoutesTab from "../tabs/RoutesTab";
import FavouritesTab from "../tabs/FavouritesTab";
import SchedulesTab from "../tabs/SchedulesTab";
import AboutTab from "../tabs/AboutTab";

interface RightSidebarProps {
  activeTab: NavTabId;
  onClose: () => void;
  onOpenChatBot?: (message: string) => void;
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

const RightSidebar: React.FC<RightSidebarProps> = ({
  activeTab,
  onClose,
  onOpenChatBot,
}) => {
  const tabTitles: Record<NavTabId, string> = {
    routes: "Plan Route",
    favourites: "My Favourites",
    schedules: "Schedules",
    about: "About",
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "routes":
        return <RoutesTab onOpenChatBot={onOpenChatBot} />;
      case "favourites":
        return <FavouritesTab />;
      case "schedules":
        return <SchedulesTab />;
      case "about":
        return <AboutTab />;
      default:
        return null;
    }
  };

  return (
    <aside className="sidebar right-0 w-96 border-l animate-slide-in-right">
      <div className="sticky top-0 bg-dark-900 border-b border-dark-800 p-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold text-white">
          {tabTitles[activeTab]}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="p-4">{renderTabContent()}</div>
    </aside>
  );
};

export default RightSidebar;
