import { NextResponse } from "next/server";

type GooglePlaceReview = {
  text?: {
    text?: string;
  };
  authorAttribution?: {
    displayName?: string;
  };
};

type GooglePlaceDetailsResponse = {
  displayName?: {
    text?: string;
  };
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlaceReview[];
};

const FALLBACK_STATUS = { error: "Google reviews unavailable" };
const CACHE_SECONDS = 60 * 60;

function cleanAuthorName(value: string | undefined) {
  if (!value) {
    return "Google reviewer";
  }

  const collapsed = value.replace(/\s+/g, " ").trim();
  const shortName = collapsed.split(" ").slice(0, 2).join(" ");

  if (shortName.length <= 24) {
    return shortName;
  }

  return `${shortName.slice(0, 21).trim()}...`;
}

function trimReviewText(value: string | undefined, maxLength = 110) {
  if (!value) {
    return "";
  }

  const collapsed = value.replace(/\s+/g, " ").trim();

  if (collapsed.length <= maxLength) {
    return collapsed;
  }

  const shortened = collapsed.slice(0, maxLength);
  const lastSpace = shortened.lastIndexOf(" ");

  return `${(lastSpace > 60 ? shortened.slice(0, lastSpace) : shortened).trim()}...`;
}

function normalizeResponse(payload: GooglePlaceDetailsResponse) {
  const reviews = (payload.reviews ?? [])
    .map((review) => ({
      text: trimReviewText(review.text?.text),
      author: cleanAuthorName(review.authorAttribution?.displayName),
    }))
    .filter((review) => review.text.length > 0)
    .slice(0, 3);

  return {
    name: payload.displayName?.text ?? null,
    rating: typeof payload.rating === "number" ? payload.rating : null,
    reviewCount:
      typeof payload.userRatingCount === "number" ? payload.userRatingCount : null,
    reviews,
  };
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(FALLBACK_STATUS, {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const endpoint = `https://places.googleapis.com/v1/places/${placeId}?languageCode=en-GB`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
      },
      next: { revalidate: CACHE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`Google Places request failed with ${response.status}`);
    }

    const payload = (await response.json()) as GooglePlaceDetailsResponse;
    const normalized = normalizeResponse(payload);

    return NextResponse.json(normalized, {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("google-reviews:", error);

    return NextResponse.json(FALLBACK_STATUS, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
