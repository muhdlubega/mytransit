"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  chatWithMistral,
  type PlaceSuggestion,
} from "../../services/mistralService";
import { useMap } from "../../contexts/MapContext";
import { useTheme } from "../../contexts/ThemeContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { PlaceDetails } from "../../services/googleMapsService";
import {
  getPlaceAutocomplete,
  getPlaceDetails,
} from "../../services/googleMapsService";

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination: (place: PlaceDetails) => void;
  initialMessage?: string;
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

const SendIcon = () => (
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
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: PlaceSuggestion[];
}

const ChatBot: React.FC<ChatBotProps> = ({
  isOpen,
  onClose,
  onSelectDestination,
  initialMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userLocation } = useMap();
  const { isDark } = useTheme();
  console.log("inti", initialMessage);

  // Handle initial message
  useEffect(() => {
    if (initialMessage && isOpen) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;
    console.log("text", textToSend);

    const userMessage: ChatMessage = {
      role: "user",
      content: textToSend,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const location = userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : null;

      const response = await chatWithMistral(textToSend, location);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message,
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("[v0] Error calling Mistral API:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: PlaceSuggestion) => {
    try {
      console.log("[v0] Searching for place:", suggestion.name);

      // Use Google Maps autocomplete to find the actual place
      const predictions = await getPlaceAutocomplete(
        suggestion.name + suggestion.address
      );

      if (predictions.length > 0) {
        // Get details of the first match
        const placeDetails = await getPlaceDetails(predictions[0].placeId);

        if (placeDetails) {
          console.log("[v0] Found place details:", placeDetails);
          onSelectDestination(placeDetails);
          onClose();
          return;
        }
      }

      // Fallback: use the suggestion data directly
      console.log("[v0] Using suggestion data directly");
      const placeDetails: PlaceDetails = {
        placeId: `suggestion-${Date.now()}`,
        name: suggestion.name,
        address: suggestion.address,
        lat: suggestion.lat || 0,
        lng: suggestion.lng || 0,
      };
      onSelectDestination(placeDetails);
      onClose();
    } catch (error) {
      console.error("[v0] Error handling suggestion click:", error);
      // Fallback to original behavior
      const placeDetails: PlaceDetails = {
        placeId: `suggestion-${Date.now()}`,
        name: suggestion.name,
        address: suggestion.address,
        lat: suggestion.lat || 0,
        lng: suggestion.lng || 0,
      };
      onSelectDestination(placeDetails);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-30 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog positioned near bottom-left (above robot) */}
      <div className="fixed bottom-40 left-8 w-96 max-h-[500px] z-40 flex flex-col bg-dark-900 rounded-2xl shadow-2xl border border-dark-700 animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">
                AI Assistant
              </h2>
              <p className="text-xs text-dark-400">Ask me anything</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
          {messages.length === 0 && (
            <div className="text-center text-dark-400 mt-8">
              <p>Hi! I can help you find:</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• Nearby petrol stations</li>
                <li>• Restaurant suggestions</li>
                <li>• Transit directions</li>
                <li>• Points of interest</li>
              </ul>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary-500 text-white"
                    : "bg-dark-850 text-white"
                }`}
              >
                <p className="text-sm">{message.content}</p>

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors border border-dark-600"
                      >
                        <div className="font-medium text-sm text-white">
                          {suggestion.name}
                        </div>
                        <div className="text-xs text-dark-400 mt-1">
                          {suggestion.address}
                        </div>
                        <div className="text-xs text-primary-400 mt-1">
                          {suggestion.type.replace("_", " ")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-dark-850 rounded-lg p-3">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-dark-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e =>
                e.key === "Enter" && !isLoading && handleSendMessage()
              }
              placeholder="Ask for directions or places..."
              className="flex-1 bg-dark-850 border border-dark-700 rounded-lg px-4 py-2 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-800 disabled:text-dark-600 text-white rounded-lg transition-colors"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
