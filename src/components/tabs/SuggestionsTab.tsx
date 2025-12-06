import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";

const LightbulbIcon = () => (
  <svg
    className="w-12 h-12"
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
);

const SuggestionsTab: React.FC = () => {
  const { isGuest } = useAuth();
  const [suggestion, setSuggestion] = useState("");
  const [category, setCategory] = useState<"feature" | "bug" | "improvement">(
    "feature"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setSuggestion("");
    setIsSubmitting(false);

    setTimeout(() => setSubmitted(false), 3000);
  };

  const categories = [
    { id: "feature" as const, label: "New Feature", icon: "✨" },
    { id: "bug" as const, label: "Report Bug", icon: "🐛" },
    { id: "improvement" as const, label: "Improvement", icon: "💡" },
  ];

  const upcomingFeatures = [
    { title: "Live Chat Support", status: "In Progress", progress: 60 },
    { title: "Multi-language Support", status: "Planned", progress: 20 },
    { title: "Dark/Light Theme Toggle", status: "Planned", progress: 10 },
    { title: "Offline Mode", status: "Research", progress: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-400">
          <LightbulbIcon />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Help Us Improve
        </h3>
        <p className="text-dark-400 text-sm">
          Your feedback helps make MyTransit better for everyone
        </p>
      </div>

      {!isGuest ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Category
            </label>
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    category === cat.id
                      ? "bg-primary-500 text-white"
                      : "bg-dark-800 text-dark-400 hover:bg-dark-700"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Your Suggestion
            </label>
            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder="Describe your idea or feedback..."
              className="input min-h-[120px] resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={!suggestion.trim()}
          >
            Submit Suggestion
          </Button>

          {submitted && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
              ✓ Thank you for your feedback!
            </div>
          )}
        </form>
      ) : (
        <div className="bg-dark-850 rounded-lg p-4 text-center">
          <p className="text-dark-400 text-sm mb-3">
            Sign in to submit suggestions
          </p>
          <Button variant="secondary" size="sm">
            Sign In
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-dark-800">
        <h3 className="text-sm font-medium text-dark-400 mb-3">
          Upcoming Features
        </h3>
        <div className="space-y-3">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="bg-dark-850 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white text-sm">
                  {feature.title}
                </span>
                <span className="text-xs text-dark-500">{feature.status}</span>
              </div>
              <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${feature.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-850 rounded-lg p-4 text-center">
        <p className="text-dark-400 text-sm mb-2">Have urgent issues?</p>
        <a
          href="mailto:support@mytransit.my"
          className="text-primary-400 hover:text-primary-300 text-sm font-medium"
        >
          support@mytransit.my
        </a>
      </div>
    </div>
  );
};

export default SuggestionsTab;
