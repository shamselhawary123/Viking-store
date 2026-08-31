export const DEFAULT_SITE_URL = "https://viking-store.vercel.app";
export const SEO_SITE_NAME = "Viking Store";
export const SEO_DEFAULT_IMAGE = "/logo.png";
export const SEO_PRICE_CURRENCY = "EGP";
export const SEO_ALTERNATE_NAMES = [
  "فايكنج ستور",
  "فايكنج استور",
  "Viking Store Egypt",
];
export const SEO_SOCIAL_LINKS = [
  "https://www.facebook.com/profile.php?id=100025354200512",
  "https://www.instagram.com/vikingclubstore/",
  "https://www.tiktok.com/@the_vikings22",
];
export const SEO_ORGANIZATION_DESCRIPTION =
  "Viking Store / فايكنج ستور is an Egypt online store for combat-sports gear, boxing gloves, MMA gloves, head guards, mouth guards, hand wraps, and martial arts training essentials.";

export const PRIVATE_SEO_PREFIXES = [
  "/admin",
  "/auth",
  "/cart",
  "/checkout",
  "/wishlist",
  "/profile",
  "/order-success",
];

type SitemapEntry = {
  loc: string;
  lastmod?: string | null;
};

type ProductLike = {
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  price?: number | string | null;
  cover_image?: string | null;
  image?: string | null;
  product_colors?: Array<{
    product_images?: Array<{ image_url?: string | null }> | null;
  }> | null;
  product_sizes?: Array<{ in_stock?: boolean | null }> | null;
  categories?: { slug?: string | null; name?: string | null } | null;
  category?: string | null;
  brand?: string | { name?: string | null } | null;
  brand_name?: string | null;
};

type CategoryLike =
  | {
      slug?: string | null;
      name?: string | null;
    }
  | string
  | null
  | undefined;

type SeoLocale = "en" | "ar" | string;

type CategorySeoIntent = {
  slug: string;
  label: string;
  title: string;
  description: string;
  keywords: string;
  alternateNames?: string[];
  known: boolean;
};

type ReviewSummaryLike = {
  total?: number;
  average?: number;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const stripQueryAndHash = (path: string) => path.split(/[?#]/)[0] || "/";

const categoryValue = (category: CategoryLike, key: "slug" | "name") => {
  if (!category) return "";
  if (typeof category === "string") return key === "name" ? category : "";

  return category[key] || "";
};

export const normalizeCategorySlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const categoryAliases: Record<string, string> = {
  "boxing-glove": "gloves",
  "boxing-gloves": "gloves",
  glove: "gloves",
  "kick-boxing": "kickboxing",
  "kick-box": "kickboxing",
  handwraps: "hand-wraps",
  wraps: "hand-wraps",
  headguards: "head-guards",
  mouthguards: "mouth-guards",
  mouthguard: "mouth-guards",
  muaythai: "muay-thai",
  "thai-boxing": "muay-thai",
  kungfu: "kung-fu",
  "kung-fu": "kung-fu",
};

const categorySeoIntents: Record<
  string,
  Record<"en" | "ar", Omit<CategorySeoIntent, "slug" | "known">>
> = {
  boxing: {
    en: {
      label: "Boxing Gloves",
      title: "Boxing Gloves & Gear",
      description:
        "Shop boxing gloves, wraps, protection, and training essentials built for daily rounds in Egypt.",
      keywords: "boxing gloves, boxing gear, combat sports gear Egypt",
      alternateNames: ["Boxing Gloves"],
    },
    ar: {
      label: "جلافز ملاكمة",
      title: "جلافز وقلبظ ملاكمة",
      description:
        "اختار جلافز وقلبظ الملاكمة المناسبة للتمرين والسبارينج، مع قفازات ملاكمة تستحمل شغل الكيس والجولات اليومية.",
      keywords: "جلافز ملاكمة، قلبظ ملاكمة، قفازات ملاكمة، جلافز بوكس",
      alternateNames: [
        "جلافز ملاكمة",
        "قلبظ ملاكمة",
        "قلابظ ملاكمة",
        "قفازات ملاكمة",
        "جلافز بوكس",
      ],
    },
  },
  gloves: {
    en: {
      label: "Boxing Gloves",
      title: "Boxing Gloves in Egypt",
      description:
        "Shop boxing gloves for bag work, sparring, and daily combat-sports training in Egypt.",
      keywords: "boxing gloves, boxing gloves Egypt, sparring gloves",
      alternateNames: ["Boxing Gloves"],
    },
    ar: {
      label: "جلافز ملاكمة",
      title: "جلافز ملاكمة في مصر",
      description:
        "اختار جلافز ملاكمة للتمرين والسبارينج بأوزان ومقاسات مختلفة، مع قفازات ملاكمة وخيارات مناسبة للبوكس والرياضات القتالية في مصر.",
      keywords: "جلافز ملاكمة، قلبظ ملاكمة، قلابظ ملاكمة، قفازات ملاكمة، جلافز بوكس",
      alternateNames: [
        "جلافز ملاكمة",
        "قلبظ ملاكمة",
        "قلابظ ملاكمة",
        "قفازات ملاكمة",
        "جلافز بوكس",
      ],
    },
  },
  kickboxing: {
    en: {
      label: "Kickboxing Gear",
      title: "Kickboxing Gloves & Shin Guards",
      description:
        "Shop kickboxing gloves, shin guards, and protection for hard striking sessions.",
      keywords: "kickboxing gloves, kickboxing shin guards, combat sports gear",
    },
    ar: {
      label: "ادوات كيك بوكس",
      title: "قفازات كيك بوكس وشنكار كيك بوكس",
      description:
        "جهز تمرين الكيك بوكس بقفازات وشنكار وحماية مناسبة للجولات التقيلة.",
      keywords: "قفازات كيك بوكس، شنكار كيك بوكس، ادوات رياضية",
    },
  },
  mma: {
    en: {
      label: "MMA Gear",
      title: "MMA Gloves & Training Gear",
      description:
        "Shop MMA gloves, fightwear, and training gear for striking, grappling, and conditioning.",
      keywords: "MMA gloves, MMA gear, martial arts equipment",
    },
    ar: {
      label: "ادوات MMA",
      title: "قفازات MMA وادوات فنون قتالية",
      description:
        "اختار قفازات MMA وادوات فنون قتالية للتمرين المختلط واللياقة والسبارينج.",
      keywords: "قفازات MMA، أدوات وادوات رياضات قتالية، فنون قتالية",
    },
  },
  sanda: {
    en: {
      label: "Sanda Gear",
      title: "Sanda Training Gear",
      description:
        "Shop Sanda gear and martial arts essentials for striking, movement, and regular training.",
      keywords: "Sanda gear, martial arts equipment, combat sports gear",
    },
    ar: {
      label: "ادوات سندا",
      title: "ادوات سندا وفنون قتالية",
      description:
        "ادوات سندا عملية للتمرين، الحركة، والجولات اللي محتاجة حماية وثبات.",
      keywords: "ادوات سندا، أدوات وادوات رياضات قتالية، فنون قتالية",
    },
  },
  "kung-fu": {
    en: {
      label: "Kung Fu Gear",
      title: "Kung Fu Training Gear",
      description:
        "Shop Kung Fu and martial arts training essentials selected for discipline and daily practice.",
      keywords: "Kung Fu gear, martial arts equipment, training gear",
    },
    ar: {
      label: "ادوات كونغ فو",
      title: "ادوات كونغ فو وتمرين فنون قتالية",
      description:
        "ادوات كونغ فو وفنون قتالية مناسبة للتمرين المنتظم والتحكم والحركة.",
      keywords: "ادوات كونغ فو، فنون قتالية، أدوات رياضية",
    },
  },
  "muay-thai": {
    en: {
      label: "Muay Thai Gear",
      title: "Muay Thai Gloves & Training Gear",
      description:
        "Shop Muay Thai gloves, protection, and striking gear for pads, bag work, and sparring.",
      keywords: "Muay Thai gloves, Muay Thai gear, striking gear",
    },
    ar: {
      label: "ادوات مواي تاي",
      title: "قفازات وادوات مواي تاي",
      description:
        "اختار ادوات مواي تاي للجولات التقيلة، شغل الباد، والسبارينج.",
      keywords: "ادوات مواي تاي، قفازات مواي تاي، أدوات رياضية",
    },
  },
  "shin-guards": {
    en: {
      label: "Shin Guards",
      title: "Kickboxing & Muay Thai Shin Guards",
      description:
        "Shop shin guards for kickboxing, Muay Thai, sparring, and striking training.",
      keywords: "shin guards, kickboxing shin guards, Muay Thai shin guards",
      alternateNames: ["Shin Guards", "Kickboxing Shin Guards"],
    },
    ar: {
      label: "شنكار",
      title: "شنكار كيك بوكس ومواي تاي في مصر",
      description:
        "اختار الشنكار المناسب للكيك بوكس والمواي تاي، من شنكار شراب لتصميمات حماية ثابتة للسبارينج.",
      keywords: "شنكار كيك بوكس، شنكار مواي تاي، شنكار، شنكار شراب، واقي قصبة الساق",
      alternateNames: [
        "شنكار كيك بوكس",
        "شنكار مواي تاي",
        "شنكار",
        "شنكار شراب",
        "واقي قصبة الساق",
      ],
    },
  },
  "hand-wraps": {
    en: {
      label: "Hand Wraps",
      title: "Boxing Hand Wraps",
      description:
        "Shop hand wraps for boxing, bag work, and wrist support during daily training.",
      keywords: "boxing hand wraps, hand wraps, wrist wraps",
      alternateNames: ["Hand Wraps", "Boxing Hand Wraps"],
    },
    ar: {
      label: "بنداج ملاكمة",
      title: "بنداج ملاكمة وبنداج بوكس",
      description:
        "اختار بنداج ملاكمة يحمي إيدك ومعصمك في التمرين، سواء لشغل الكيس أو السبارينج.",
      keywords: "بنداج ملاكمة، بنداج بوكس، رباط يد للملاكمة",
      alternateNames: ["بنداج ملاكمة", "بنداج بوكس", "رباط يد للملاكمة"],
    },
  },
  "head-guards": {
    en: {
      label: "Head Guards",
      title: "Boxing & Kickboxing Head Guards",
      description:
        "Shop head guards for boxing, kickboxing, martial arts sparring, and daily protection.",
      keywords: "boxing head guard, kickboxing head guard, martial arts head guard",
      alternateNames: ["Head Guards", "Boxing Head Guard"],
    },
    ar: {
      label: "هيد جارد",
      title: "هيد جارد وواقي رأس ملاكمة",
      description:
        "اختار هيد جارد مناسب للملاكمة والكيك بوكس والسبارينج، مع واقي رأس ثابت ومريح للتمرين.",
      keywords: "هيد جارد ملاكمة، واقي رأس ملاكمة، هيد جارد كيك بوكس، واقي رأس كيك بوكس، واقي رأس للفنون القتالية",
      alternateNames: [
        "هيد جارد ملاكمة",
        "واقي رأس ملاكمة",
        "هيد جارد كيك بوكس",
        "واقي رأس كيك بوكس",
        "واقي رأس للفنون القتالية",
      ],
    },
  },
  "mouth-guards": {
    en: {
      label: "Mouthguards",
      title: "Mouthguards for Combat Sports",
      description:
        "Shop mouthguards for boxing, kickboxing, and combat-sports training protection.",
      keywords: "mouthguard, boxing mouthguard, kickboxing mouthguard",
      alternateNames: ["Mouthguard", "Boxing Mouthguard"],
    },
    ar: {
      label: "ماوث جارد",
      title: "ماوث جارد وواقي أسنان ملاكمة",
      description:
        "اختار ماوث جارد للتمرين والسبارينج، مع واقي أسنان مناسب للملاكمة والكيك بوكس والرياضات القتالية.",
      keywords: "ماوث جارد، واقي أسنان ملاكمة، واقي أسنان كيك بوكس، واقي أسنان للرياضات القتالية",
      alternateNames: [
        "ماوث جارد",
        "واقي أسنان ملاكمة",
        "واقي أسنان كيك بوكس",
        "واقي أسنان للرياضات القتالية",
      ],
    },
  },
};

const categoryIntentKey = (category: CategoryLike) => {
  const slug = normalizeCategorySlug(categoryValue(category, "slug"));
  const name = normalizeCategorySlug(categoryValue(category, "name"));
  const raw = slug || name;

  return categoryAliases[raw] || raw;
};

export const normalizeSiteUrl = (
  siteUrl: string,
  fallback = DEFAULT_SITE_URL,
) => trimTrailingSlash(siteUrl || fallback);

export const buildCanonicalUrl = (siteUrl: string, path: string) => {
  const origin = normalizeSiteUrl(siteUrl);
  const cleanPath = stripQueryAndHash(path || "/");
  const normalizedPath = cleanPath.startsWith("/")
    ? cleanPath
    : `/${cleanPath}`;

  return normalizedPath === "/"
    ? `${origin}/`
    : `${origin}${normalizedPath.replace(/\/+$/, "")}`;
};

export const buildShopCategoryUrl = (slug?: string | null) => {
  const cleanSlug = normalizeCategorySlug(slug || "");

  return !cleanSlug || cleanSlug === "all"
    ? "/shop"
    : `/shop?category=${encodeURIComponent(cleanSlug)}`;
};

export const buildShopCategoryCanonicalUrl = (
  siteUrl: string,
  slug?: string | null,
) => {
  const path = buildShopCategoryUrl(slug);
  const origin = normalizeSiteUrl(siteUrl);

  return path.includes("?")
    ? `${origin}${path}`
    : buildCanonicalUrl(origin, path);
};

export const getCategorySeoIntent = (
  category: CategoryLike,
  locale: SeoLocale = "en",
): CategorySeoIntent => {
  const requestedSlug = normalizeCategorySlug(
    categoryValue(category, "slug") || categoryValue(category, "name"),
  );
  const key = categoryIntentKey(category);
  const language = locale === "ar" ? "ar" : "en";
  const intent = categorySeoIntents[key]?.[language];

  if (intent) {
    return {
      ...intent,
      slug: requestedSlug || key,
      known: true,
    };
  }

  const fallbackLabel =
    categoryValue(category, "name") || requestedSlug || "Combat Gear";

  return {
    slug: requestedSlug,
    label: fallbackLabel,
    title:
      language === "ar"
        ? `${fallbackLabel} من Viking Store`
        : `${fallbackLabel} Gear`,
    description:
      language === "ar"
        ? `اختار ${fallbackLabel} من Viking Store بجودة مناسبة للتمرين اليومي.`
        : `Shop ${fallbackLabel} at Viking Store with gear selected for daily combat-sports training.`,
    keywords:
      language === "ar"
        ? `${fallbackLabel}، أدوات رياضية`
        : `${fallbackLabel}, combat sports gear`,
    known: false,
  };
};

export const buildCategorySeo = (
  category: CategoryLike,
  locale: SeoLocale = "en",
) => {
  const intent = getCategorySeoIntent(category, locale);

  return {
    title: intent.title,
    description: intent.description,
    h1: intent.title,
    intro: intent.description,
    url: buildShopCategoryUrl(intent.slug),
    keywords: intent.keywords,
  };
};

export const buildProductSeoMeta = (
  product: ProductLike,
  locale: SeoLocale = "en",
) => {
  const name = product.title || product.name || "Viking Store Product";
  const intent = getCategorySeoIntent(
    product.categories || product.category,
    locale,
  );
  const description = product.description?.trim();
  const isArabic = locale === "ar";

  return {
    title: isArabic ? `${name} | ${intent.title}` : `${name} | ${intent.title}`,
    description: description
      ? `${description} ${intent.description}`
      : isArabic
        ? `${name} من Viking Store. ${intent.description}`
        : `Shop ${name} from Viking Store. ${intent.description}`,
  };
};

export const buildProductImageAlt = (
  product: ProductLike,
  locale: SeoLocale = "en",
) => {
  const name = product.title || product.name || "Viking Store Product";
  const intent = getCategorySeoIntent(
    product.categories || product.category,
    locale,
  );

  return `${name} - ${intent.label}`;
};

export const isPrivateSeoPath = (path: string) => {
  const cleanPath = stripQueryAndHash(path);

  return PRIVATE_SEO_PREFIXES.some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`),
  );
};

export const publicSitemapEntries = (siteUrl: string): SitemapEntry[] => [
  { loc: buildCanonicalUrl(siteUrl, "/") },
  { loc: buildCanonicalUrl(siteUrl, "/shop") },
  { loc: buildCanonicalUrl(siteUrl, "/categories") },
  { loc: buildCanonicalUrl(siteUrl, "/blog") },
  { loc: buildCanonicalUrl(siteUrl, "/about") },
  { loc: buildCanonicalUrl(siteUrl, "/contact") },
  { loc: buildCanonicalUrl(siteUrl, "/faq") },
  { loc: buildCanonicalUrl(siteUrl, "/privacy-policy") },
  { loc: buildCanonicalUrl(siteUrl, "/terms") },
  { loc: buildCanonicalUrl(siteUrl, "/cookies") },
];

export const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const buildSitemapXml = (
  urls: SitemapEntry[],
) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .filter((url) => !isPrivateSeoPath(new URL(url.loc).pathname))
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${
      url.lastmod
        ? `
    <lastmod>${escapeXml(new Date(url.lastmod).toISOString())}</lastmod>`
        : ""
    }
  </url>`,
  )
  .join("\n")}
</urlset>`;

export const buildRobotsTxt = (siteUrl: string) => {
  const origin = normalizeSiteUrl(siteUrl);

  return [
    "User-agent: *",
    "Allow: /",
    ...PRIVATE_SEO_PREFIXES.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
};

const absoluteImageUrl = (siteUrl: string, image?: string | null) => {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) return image;

  return buildCanonicalUrl(siteUrl, image);
};

export const buildOrganizationStructuredData = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO_SITE_NAME,
  alternateName: SEO_ALTERNATE_NAMES,
  description: SEO_ORGANIZATION_DESCRIPTION,
  url: buildCanonicalUrl(siteUrl, "/"),
  logo: absoluteImageUrl(siteUrl, SEO_DEFAULT_IMAGE),
  image: absoluteImageUrl(siteUrl, SEO_DEFAULT_IMAGE),
  sameAs: SEO_SOCIAL_LINKS,
});

export const buildWebsiteStructuredData = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SEO_SITE_NAME,
  alternateName: SEO_ALTERNATE_NAMES,
  url: buildCanonicalUrl(siteUrl, "/"),
  potentialAction: {
    "@type": "SearchAction",
    target: `${buildCanonicalUrl(siteUrl, "/shop")}?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildBreadcrumbStructuredData = (
  items: Array<{ name: string; url: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const productImages = (product: ProductLike) => {
  const images = [
    product.cover_image,
    product.image,
    ...(product.product_colors || []).flatMap((color) =>
      (color.product_images || []).map((image) => image.image_url),
    ),
  ].filter(Boolean) as string[];

  return Array.from(new Set(images));
};

const productAvailability = (product: ProductLike) => {
  if (!product.product_sizes?.length) return "https://schema.org/InStock";

  return product.product_sizes.some((size) => size.in_stock)
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
};

const productBrandName = (product: ProductLike) => {
  if (typeof product.brand === "string") return product.brand;

  return product.brand?.name || product.brand_name || SEO_SITE_NAME;
};

const productAlternateNames = (product: ProductLike) => {
  const key = categoryIntentKey(product.categories || product.category);
  const names = [
    ...(categorySeoIntents[key]?.ar.alternateNames || []),
    ...(categorySeoIntents[key]?.en.alternateNames || []),
  ];

  return Array.from(new Set(names));
};

export const buildProductStructuredData = (
  product: ProductLike,
  canonicalUrl: string,
  reviewSummary: ReviewSummaryLike,
) => {
  const name = product.title || product.name || "Viking Store Product";
  const images = productImages(product);
  const siteUrl = new URL(canonicalUrl).origin;
  const totalReviews = Number(reviewSummary.total || 0);
  const averageRating = Number(reviewSummary.average || 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    alternateName: productAlternateNames(product).length
      ? productAlternateNames(product)
      : undefined,
    description: product.description || name,
    image: images.length
      ? images.map((image) => absoluteImageUrl(siteUrl, image))
      : undefined,
    category: product.categories?.name || product.category || undefined,
    brand: {
      "@type": "Brand",
      name: productBrandName(product),
    },
    sku: product.slug || undefined,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: SEO_PRICE_CURRENCY,
      price: Number(product.price || 0),
      availability: productAvailability(product),
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating:
      totalReviews > 0 && averageRating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: totalReviews,
          }
        : undefined,
  };
};
