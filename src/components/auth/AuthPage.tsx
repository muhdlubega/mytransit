import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useAuth } from "../../contexts/AuthContext";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { continueAsGuest } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">MyTransit</h1>
          <p className="text-dark-400">Real-time public transport tracking</p>
        </div>

        <div className="card">
          <div className="flex border-b border-dark-700 mb-6">
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                isLogin
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-dark-400 hover:text-white"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                !isLogin
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-dark-400 hover:text-white"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <LoginForm />
          ) : (
            <SignupForm onSuccess={() => setIsLogin(true)} />
          )}

          <div className="mt-6 pt-6 border-t border-dark-700">
            <button
              onClick={continueAsGuest}
              className="w-full btn btn-ghost text-dark-400 hover:text-white"
            >
              Continue as Guest
            </button>
            <p className="text-center text-dark-500 text-sm mt-2">
              Some features will be limited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
