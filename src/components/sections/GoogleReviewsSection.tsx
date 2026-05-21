"use client";

import { useEffect, useState } from "react";
import { HALFWAY_CAFE_PLACE_URL } from "@/lib/maps";
import ScrollReveal from "@/components/ui/ScrollReveal";

type GoogleReview = {
  text: string;
  author: string;
};

type GoogleReviewsData = {
  rating: number | null;
  reviewCount: number | null;
  reviews: GoogleReview[];
};

function formatReviewCount(value: number | null) {
  if (!value || value < 1) {
    return null;
  }

  return value.toLocaleString("en-GB");
}

export default function GoogleReviewsSection() {
  const [googleReviews, setGoogleReviews] = useState<GoogleReviewsData>({
    rating: null,
    reviewCount: null,
    reviews: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      const response = await fetch("/api/google-reviews", { cache: "no-store" }).catch(() => null);

      if (!isMounted || !response?.ok) {
        return;
      }

      const payload = (await response.json()) as Partial<GoogleReviewsData>;

      setGoogleReviews({
        rating: typeof payload.rating === "number" ? payload.rating : null,
        reviewCount: typeof payload.reviewCount === "number" ? payload.reviewCount : null,
        reviews: Array.isArray(payload.reviews)
          ? payload.reviews
              .filter(
                (review): review is GoogleReview =>
                  typeof review?.text === "string" && typeof review?.author === "string"
              )
              .slice(0, 3)
          : [],
      });
    }

    loadReviews().catch(() => null);

    return () => {
      isMounted = false;
    };
  }, []);

  if (googleReviews.reviews.length === 0) {
    return null;
  }

  const trustRating = googleReviews.rating ?? 4.9;
  const trustReviewCount = formatReviewCount(googleReviews.reviewCount);

  return (
    <section className="bg-parchment py-12">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <ScrollReveal duration={700}>
          <div className="text-center">
            <h2 className="font-playfair text-3xl font-bold text-ink">Customer Reviews</h2>
            <p className="mt-2 font-lora text-sm italic text-ink-light">
              ⭐ {trustRating.toFixed(1)} Google Rating
              {trustReviewCount ? ` • Based on ${trustReviewCount} reviews` : ""}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {googleReviews.reviews.map((review, index) => (
            <ScrollReveal
              key={`${review.author}-${review.text}`}
              as="article"
              duration={750}
              delay={index * 100}
              className="w-full rounded-2xl border border-[#E8E0D8] bg-[#F9F6F2] px-5 py-4"
            >
              <p className="mb-2 font-inter text-[14px] leading-none tracking-[0.12em] text-[#F5B301]">
                ★★★★★
              </p>
              <p
                className="font-inter text-sm leading-6 text-[#1A1A1A]"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 4,
                  overflow: "hidden",
                }}
              >
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="mt-4 text-xs font-medium text-[#6B6B6B]">{review.author}</p>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal duration={700} delay={150}>
          <div className="mt-4 text-center">
            <a
              href={HALFWAY_CAFE_PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inter text-sm font-medium text-[#8A7C6D] no-underline"
            >
              See all reviews on Google
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

