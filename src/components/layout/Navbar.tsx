import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { NAV_TABS, NavTabId } from "../../utils/constants";
import Button from "../ui/Button";

interface NavbarProps {
  activeTab: NavTabId | null;
  onTabChange: (tab: NavTabId | null) => void;
}

const TabIcon: React.FC<{ icon: string; active: boolean }> = ({
  icon,
  active,
}) => {
  const icons: Record<string, React.ReactNode> = {
    MapPin: (
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
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
    Star: (
      <svg
        className="w-5 h-5"
        fill={active ? "currentColor" : "none"}
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
    ),
    Clock: (
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    Lightbulb: (
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  };

  return <>{icons[icon]}</>;
};

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { isAuthenticated, isGuest, signOut, user } = useAuth();

  const visibleTabs = NAV_TABS.filter(tab => {
    if (tab.id === "favourites" && isGuest) return false;
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-dark-900 border-b border-dark-800 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <span className="text-xl font-display font-bold text-gradient hidden sm:block">
            MyTransit
          </span>
        </div>

        <div className="flex items-center gap-1">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(activeTab === tab.id ? null : tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary-500/20 text-primary-400"
                  : "text-dark-400 hover:text-white hover:bg-dark-800"
              }`}
            >
              <TabIcon icon={tab.icon} active={activeTab === tab.id} />
              <span className="hidden md:inline font-display">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-dark-400 hidden sm:block">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : isGuest ? (
            <span className="text-sm text-dark-400 font-display">
              Guest Mode
            </span>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
