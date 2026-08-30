const arabicCategoryBySlug: Record<string, string> = {
  all: "الكل",
  boxing: "ملاكمة",
  gloves: "قفازات",
  "muay-thai": "مواي تاي",
  mma: "MMA",
  protection: "ادوات حماية",
  shorts: "شورتات",
  wraps: "بنداج",
  training: "تدريب",
  apparel: "ملابس رياضية",
  "shin-guards": "واقيات الساق",
  "head-guards": "واقيات الرائس",
  "hand-wraps": "بنداج اليد",
  "t-shirts": "تيشيرتات",
  "jump-ropes": "حبال القفز",
  "mouth-guards": "واقيات الفم",
  "2pcs": "طقم قطعتين",
};

const toFinitePrice = (value: number | string | null | undefined) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
};

const trimTrailingZeros = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export const formatStorePrice = (
  value: number | string | null | undefined,
  _locale = "en",
) => {
  const amount = toFinitePrice(value);

  return `${trimTrailingZeros(amount)} EGP`;
};

export const getLocalizedCategoryName = (
  category:
    | { slug?: string | null; name?: string | null }
    | string
    | null
    | undefined,
  locale = "en",
) => {
  if (typeof category === "string") return category;

  const fallback = category?.name || "";
  if (locale !== "ar") return fallback;

  return (category?.slug && arabicCategoryBySlug[category.slug]) || fallback;
};
