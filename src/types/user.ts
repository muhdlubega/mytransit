export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  vehicleId: string;
  routeId?: string;
  vehicleType?: string;
  displayName: string;
  createdAt: string;
}

export interface RecentSearch {
  id: string;
  userId: string;
  searchQuery: string;
  searchType: "vehicle" | "route" | "stop";
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}
