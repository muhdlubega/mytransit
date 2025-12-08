import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import lubegaImg from "../../assets/lubega.png";
import anasImg from "../../assets/anas.png";

// Icons
const TrackingIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const SpeedIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const RocketIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
    />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const AboutTab: React.FC = () => {
  const { isAuthenticated } = useAuth();
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
    { id: "feature" as const, label: "Feature" },
    { id: "bug" as const, label: "Bug" },
    { id: "improvement" as const, label: "Improve" },
  ];

  const futureImprovements = [
    {
      title: "First-Person Navigation",
      desc: "AR-style turn-by-turn directions",
    },
    {
      title: "Multi-Language Support",
      desc: "BM, Chinese, Tamil localization",
    },
    { title: "AI Chatbot", desc: "Natural language trip planning" },
    { title: "AI Navigation Agent", desc: "Smart in-app route guidance" },
  ];

  return (
    <div className="space-y-8">
      {/* Problem Statement */}
      <section>
        <h2 className="text-lg font-display font-bold text-white mb-4">
          Why MyTransit?
        </h2>

        <p className="text-dark-300 text-sm mb-6">
          Malaysia lacks a{" "}
          <span className="text-primary-400 font-medium">real-time</span> public
          transport tracker. Existing apps update every 30 seconds—we update{" "}
          <span className="text-primary-400 font-medium">live</span>.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-xl bg-gradient-to-b from-primary-500/10 to-transparent border border-primary-500/20">
            <div className="text-primary-400 flex justify-center mb-2">
              <TrackingIcon />
            </div>
            <p className="text-xs font-medium text-white">Live Tracking</p>
            <p className="text-[10px] text-dark-400">Real-time positions</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20">
            <div className="text-green-400 flex justify-center mb-2">
              <SpeedIcon />
            </div>
            <p className="text-xs font-medium text-white">Instant Updates</p>
            <p className="text-[10px] text-dark-400">Smooth interpolation</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
            <div className="text-blue-400 flex justify-center mb-2">
              <ClockIcon />
            </div>
            <p className="text-xs font-medium text-white">Plan Ahead</p>
            <p className="text-[10px] text-dark-400">Predict delays</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 text-[10px] rounded-full bg-dark-800 text-dark-300">
            ⚛️ React/Typescript
          </span>
          <span className="px-2 py-1 text-[10px] rounded-full bg-dark-800 text-dark-300">
            🦋 Flutter
          </span>
          <span className="px-2 py-1 text-[10px] rounded-full bg-dark-800 text-dark-300">
            🤖 Anthropic Claude (Web)
          </span>
          <span className="px-2 py-1 text-[10px] rounded-full bg-dark-800 text-dark-300">
            📱 Cursor Claude (Mobile)
          </span>
          <span className="px-2 py-1 text-[10px] rounded-full bg-dark-800 text-dark-300">
            🔐 Supabase (Auth & DB)
          </span>
          <span className="px-2 py-1 text-[10px] rounded-full bg-dark-800 text-dark-300">
            🎨 Gemini (Image Generation)
          </span>
        </div>
      </section>

      {/* The Team */}
      <section>
        <h2 className="text-lg font-display font-bold text-white mb-6">
          The Team
        </h2>

        <div className="space-y-6">
          {/* Lubega */}
          <div className="flex gap-4">
            <img
              src={lubegaImg}
              alt="Lubega"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-bold text-white">Lubega</h3>
                <span className="text-xs text-primary-400">Frontend Dev</span>
              </div>
              <p className="text-dark-400 text-xs mb-2">
                Full-stack developer in fintech, focusing on payment-related
                solutions impacting 3M+ users worldwide. React, TypeScript,
                Next.js expert.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://github.com/muhdlubega"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-500 hover:text-white transition-colors"
                >
                  <GithubIcon />
                </a>
                <a
                  href="https://www.linkedin.com/in/muhammad-lubega/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-500 hover:text-blue-400 transition-colors"
                >
                  <LinkedInIcon />
                </a>
              </div>
            </div>
          </div>

          {/* Anas */}
          <div className="flex gap-4">
            <img
              src={anasImg}
              alt="Anas"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-bold text-white">Anas</h3>
                <span className="text-xs text-primary-400">Mobile Dev</span>
              </div>
              <p className="text-dark-400 text-xs mb-2">
                Flutter & Swift specialist with UI/UX passion, blending
                technical skills with creative design and videography
                background.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://github.com/anasrul03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-500 hover:text-white transition-colors"
                >
                  <GithubIcon />
                </a>
                <a
                  href="https://www.linkedin.com/in/hanasrullah-halim-89496a15a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-500 hover:text-blue-400 transition-colors"
                >
                  <LinkedInIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Improvements */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-primary-400">
            <RocketIcon />
          </div>
          <h2 className="text-lg font-display font-bold text-white">
            Future Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {futureImprovements.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-dark-700 hover:border-primary-500/30 transition-colors"
            >
              <p className="text-white text-xs font-medium mb-0.5">
                {item.title}
              </p>
              <p className="text-dark-500 text-[10px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback */}
      <section className="pt-4 border-t border-dark-800">
        <h2 className="text-sm font-display font-semibold text-white mb-4">
          💡 Send Feedback
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                    category === cat.id
                      ? "bg-primary-500 text-white"
                      : "bg-dark-800 text-dark-400 hover:bg-dark-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder="Your feedback..."
              className="input min-h-[80px] resize-none text-sm"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              disabled={!suggestion.trim()}
            >
              Submit
            </Button>

            {submitted && (
              <p className="text-green-400 text-xs text-center">
                ✓ Thanks for your feedback!
              </p>
            )}
          </form>
        ) : (
          <p className="text-dark-500 text-xs text-center py-4">
            Sign in to submit feedback
          </p>
        )}
      </section>

      {/* Contact */}
      <div className="text-center pt-2">
        <a
          href="mailto:muhdlubegasiraje@gmail.com"
          className="text-primary-400 hover:text-primary-300 text-[10px]"
        >
          muhdlubegasiraje@gmail.com
        </a>{" "}
        <span className="text-primary-400 text-[10px]">|</span>{" "}
        <a
          href="mailto:hanasrullahhalim@gmail.com"
          className="text-primary-400 hover:text-primary-300 text-[10px]"
        >
          hanasrullahhalim@gmail.com
        </a>
      </div>
    </div>
  );
};

export default AboutTab;
