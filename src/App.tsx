import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { TransitProvider } from "./contexts/TransitContext";
import { MapProvider } from "./contexts/MapContext";
import AuthGuard from "./components/auth/AuthGuard";
import MainLayout from "./components/layout/MainLayout";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TransitProvider>
        <MapProvider>
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        </MapProvider>
      </TransitProvider>
    </AuthProvider>
  );
};

export default App;
