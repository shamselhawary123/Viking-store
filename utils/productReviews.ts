export const REVIEW_RATINGS = [5, 4, 3, 2, 1] as const;

type ReviewLike = {
  rating?: number | string | null;
};

type ProfileLike = {
  full_name?: string | null;
};

export const normalizeRating = (rating: number | string | null | undefined) => {
  const value = Number(rating);

  return Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
};

export const getProductReviewSummary = (reviews: ReviewLike[]) => {
  const distribution: Record<number, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  const validRatings = reviews
    .map((review) => normalizeRating(review.rating))
    .filter((rating): rating is number => rating !== null);

  validRatings.forEach((rating) => {
    distribution[rating] += 1;
  });

  const total = validRatings.length;
  const average = total
    ? validRatings.reduce((sum, rating) => sum + rating, 0) / total
    : 0;

  return {
    total,
    average,
    displayAverage: average.toFixed(1),
    distribution,
  };
};

export const normalizeReviewInput = (rating: number | string | null | undefined, comment: string) => {
  const normalizedRating = normalizeRating(rating);

  if (!normalizedRating) {
    return { ok: false as const, error: "rating" as const };
  }

  const trimmedComment = comment.trim();

  if (!trimmedComment) {
    return { ok: false as const, error: "comment" as const };
  }

  return {
    ok: true as const,
    rating: normalizedRating,
    comment: trimmedComment,
  };
};

export const reviewerDisplayName = (profile: ProfileLike | null | undefined, fallback: string) => {
  const name = profile?.full_name?.trim();

  return name || fallback;
};
