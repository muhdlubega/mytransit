import React, { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AuthPage from "./AuthPage";
import LoadingSpinner from "../ui/LoadingSpinner";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default AuthGuard;
