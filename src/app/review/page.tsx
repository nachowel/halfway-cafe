"use client";

const GOOGLE_REVIEW_URL = "https://g.page/r/CYyuBTDQ9qyAEAE/review";
const TRIPADVISOR_REVIEW_URL = "https://www.tripadvisor.co.uk/UserReviewEdit-g1639613-d18854100-Half_Way_Cafe-Sidcup_Greater_London_England.html";

import { useState } from "react";

type Stage = "rating" | "positive" | "negative" | "submitted";

const STARS = [1, 2, 3, 4, 5];

export default function ReviewPage() {
  const [hovered, setHovered] = useState<number>(0);
  const [selected, setSelected] = useState<number>(0);
  const [stage, setStage] = useState<Stage>("rating");
  const [feedback, setFeedback] = useState("");

  const handleStarClick = (rating: number) => {
    setSelected(rating);
    setStage(rating >= 4 ? "positive" : "negative");
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStage("submitted");
  };

  const activeRating = hovered || selected;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-[0_12px_40px_rgba(26,26,26,0.1)]">

        {/* Header — always visible until a stage change hides it */}
        {stage === "rating" && (
          <>
            <h1 className="font-playfair text-2xl font-bold leading-snug text-ink md:text-3xl">
              We loved having you today!{" "}<span className="inline-block">☀️</span>
            </h1>
            <p className="mt-2 font-inter text-sm text-text-mid">
              We&apos;d love your feedback.
            </p>
            <p className="mt-1 font-inter text-xs text-text-mid/70">
              ⭐ 4.9 stars · 126 Google reviews
            </p>

            {/* Star rating */}
            <div
              className="mt-8 flex justify-center gap-3"
              role="group"
              aria-label="Rate your experience from 1 to 5 stars"
            >
              {STARS.map((star, i) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onFocus={() => setHovered(star)}
                  onBlur={() => setHovered(0)}
                  className="text-4xl leading-none transition-transform duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-90 md:text-5xl animate-[fadeIn_0.4s_ease-out_forwards]"
                  style={{ opacity: 0, animationDelay: `${i * 100}ms` }}
                >
                  <span
                    className={
                      star <= activeRating
                        ? "text-amber-400 drop-shadow-sm"
                        : "text-gray-300"
                    }
                  >
                    {star <= activeRating ? "★" : "☆"}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-center font-inter text-xs text-text-mid">
              {activeRating === 0 && "Join our 126 happy customers — it only takes 10 seconds"}
              {activeRating === 1 && "Very poor"}
              {activeRating === 2 && "Poor"}
              {activeRating === 3 && "Average"}
              {activeRating === 4 && "Good"}
              {activeRating === 5 && "Excellent"}
            </p>
          </>
        )}

        {/* Positive flow — 4 or 5 stars */}
        {stage === "positive" && (
          <div className="text-center">
            <p className="font-playfair text-2xl font-bold text-ink">
              We hope you enjoyed your visit 😊
            </p>
            <p className="mt-3 font-inter text-base text-text-mid">
              It would mean a lot to us if you could leave a quick review.
            </p>
            <p className="mt-2 font-inter text-xs text-text-mid">
              We really appreciate your support.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {/* Primary — Google */}
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-inter text-sm font-bold uppercase tracking-[0.1em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <GoogleIcon />
                Leave a Google Review
              </a>

              {/* Secondary — TripAdvisor */}
              <a
                href={TRIPADVISOR_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-accent px-6 py-3.5 font-inter text-sm font-bold uppercase tracking-[0.1em] text-accent no-underline transition-colors duration-200 hover:bg-accent hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <TripAdvisorIcon />
                Leave a TripAdvisor Review
              </a>
            </div>

            <button
              type="button"
              onClick={() => { setStage("rating"); setSelected(0); setHovered(0); }}
              className="mt-6 font-inter text-xs text-text-mid underline hover:text-ink"
            >
              Go back
            </button>
          </div>
        )}

        {/* Negative flow — 1, 2, or 3 stars */}
        {stage === "negative" && (
          <div>
            <p className="font-playfair text-2xl font-bold text-ink">
              We&apos;re sorry your experience wasn&apos;t great.
            </p>
            <p className="mt-2 font-inter text-sm text-text-mid">
              Your feedback helps us improve.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="mt-6 flex flex-col gap-4">
              <label htmlFor="feedback" className="sr-only">
                Tell us what went wrong
              </label>
              <textarea
                id="feedback"
                name="feedback"
                rows={5}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what went wrong"
                className="w-full resize-none rounded-xl border border-border bg-[#FAF8F5] px-4 py-3 font-inter text-sm text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="submit"
                className="rounded-full bg-accent px-6 py-3.5 font-inter text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Send Feedback
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setStage("rating"); setSelected(0); setHovered(0); }}
              className="mt-4 font-inter text-xs text-text-mid underline hover:text-ink"
            >
              Go back
            </button>
          </div>
        )}

        {/* Submitted confirmation */}
        {stage === "submitted" && (
          <div className="text-center">
            <span className="block text-4xl">🙏</span>
            <p className="mt-4 font-playfair text-2xl font-bold text-ink">
              Thank you
            </p>
            <p className="mt-2 font-inter text-sm text-text-mid">
              Thanks for your feedback. We&apos;ll use it to improve.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#fff" d="M21.8 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z"/>
      <path fill="#fff" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22z"/>
      <path fill="#fff" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3.4-2.6z"/>
      <path fill="#fff" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 5.9 12 5.9z"/>
    </svg>
  );
}

function TripAdvisorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3.5 13a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm7 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM7 10.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    </svg>
  );
}
