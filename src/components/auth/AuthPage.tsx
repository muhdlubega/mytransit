import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useAuth } from "../../contexts/AuthContext";

import bgImage from "../../assets/cover.png";
import bgImage2 from "../../assets/cover2.png";
import bgImage3 from "../../assets/cover3.png";

const images = [bgImage, bgImage2, bgImage3];

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { continueAsGuest } = useAuth();

  const [index, setIndex] = useState(0);

  // Auto cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      {/* =================== LEFT SLIDER =================== */}
      <div className="hidden md:block md:w-[60%] h-screen relative overflow-hidden bg-black">
        {/* Image Track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="w-full h-full flex-shrink-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-24 rounded-full transition-all ${
                i === index ? "bg-primary-600" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* =================== RIGHT PANEL =================== */}
      <div
        className="w-full md:w-[40%] bg-zinc-900 text-white flex items-center justify-center px-6 py-10 md:py-0"
        style={{ height: "100dvh" }} // full height on mobile
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-gradient mb-2">MyTransit</h1>
            <p className="text-lg text-gray-400">
              Real-time public transport tracking
            </p>
          </div>

          {/* Card */}
          <div className="bg-zinc-900 rounded-xl p-6 min-h-[465px]">
            {/* Tabs */}
            <div className="flex border-b border-zinc-700 mb-6">
              <button
                className={`flex-1 py-3 font-medium ${
                  isLogin
                    ? "text-gray-500 hover:text-gray-300 border-b-2 border-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>

              <button
                className={`flex-1 py-3 font-medium ${
                  !isLogin
                    ? "text-gray-500 hover:text-gray-300 border-b-2 border-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {/* Forms */}
            {isLogin ? (
              <LoginForm />
            ) : (
              <SignupForm onSuccess={() => setIsLogin(true)} />
            )}

            {/* Guest */}
            <div className="mt-6 pt-6 border-t border-zinc-700">
              <button
                onClick={continueAsGuest}
                className="w-full text-gray-400 hover:text-gray-200 font-medium py-2 transition"
              >
                Continue as Guest
              </button>
              <p className="text-center text-gray-600 text-sm">
                Some features will be limited
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
