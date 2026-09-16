export const DEFAULT_SITE_URL = "https://vikingclubstore.com";
export const SEO_SITE_NAME = "Viking Store";
export const SEO_DEFAULT_IMAGE = "/logo.png";
export const SEO_PRICE_CURRENCY = "EGP";
export const SEO_ALTERNATE_NAMES = [
  "فايكنج ستور",
  "فايكنج استور",
  "Viking Store Egypt",
];
const SEO_TITLE_BRAND_MENTIONS = [
  SEO_SITE_NAME.toLowerCase(),
  "فايكنج ستور",
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
  "/payments",
  "/wishlist",
  "/profile",
  "/order-success",
];
const ROBOTS_DISALLOW_PREFIXES = PRIVATE_SEO_PREFIXES.filter(
  (path) => path !== "/payments",
);

type SitemapEntry = {
  loc: string;
  lastmod?: string | null;
};

type ProductLike = {
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  sku?: string | null;
  description?: string | null;
  price?: number | string | null;
  cover_image?: string | null;
  image?: string | null;
  inventory_model?: string | null;
  product_group_key?: string | null;
  product_colors?: Array<{
    id?: number | string | null;
    name?: string | null;
    product_images?: Array<{ image_url?: string | null }> | null;
  }> | null;
  product_sizes?: Array<{
    id?: number | string | null;
    size?: string | null;
    in_stock?: boolean | null;
  }> | null;
  product_variants?: Array<{
    id?: number | string | null;
    public_key?: string | null;
    color_id?: number | string | null;
    size_id?: number | string | null;
    price?: number | string | null;
    old_price?: number | string | null;
    stock_quantity?: number | string | null;
    is_active?: boolean | null;
  }> | null;
  categories?: { slug?: string | null; name?: string | null } | null;
  category?: string | null;
  brand?: string | { name?: string | null } | null;
  brands?: { name?: string | null } | null;
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

export type ShopCategoryState = {
  slug: string;
  category: Extract<CategoryLike, { slug?: string | null; name?: string | null }> | null;
  isCategoryLanding: boolean;
  isInvalidCategory: boolean;
};

type ReviewSummaryLike = {
  total?: number;
  average?: number;
};

export type ShippingSettingsLike = {
  shipping_enabled?: boolean | null;
  free_shipping_all_orders?: boolean | null;
  free_shipping_threshold_enabled?: boolean | null;
  free_shipping_threshold?: number | string | null;
  default_shipping_fee?: number | string | null;
};

export type ShippingGovernorateLike = {
  code?: string | null;
  is_enabled?: boolean | null;
  shipping_fee?: number | string | null;
};

export type ShippingSchemaSource = {
  settings?: ShippingSettingsLike | null;
  governorates?: ShippingGovernorateLike[] | null;
};

type OrganizationStructuredDataOptions = {
  shippingSource?: ShippingSchemaSource | null;
};

const PRODUCT_META_DESCRIPTION_MAX_LENGTH = 180;
const NON_RETURNABLE_CATEGORY_KEYS = new Set(["mouth-guards"]);

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const stripQueryAndHash = (path: string) => path.split(/[?#]/)[0] || "/";

const normalizeMetaDescriptionText = (value?: string | null) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncateMetaDescription = (
  value: string,
  maxLength = PRODUCT_META_DESCRIPTION_MAX_LENGTH,
) => {
  if (value.length <= maxLength) return value;

  const snippet = value.slice(0, maxLength + 1).trimEnd();
  const lastSpace = snippet.lastIndexOf(" ");
  const cleanSnippet =
    lastSpace > Math.floor(maxLength * 0.6)
      ? snippet.slice(0, lastSpace)
      : snippet.slice(0, maxLength);

  return cleanSnippet.replace(/[.,;:!?،؛]+$/, "").trimEnd();
};

const normalizeProductMetaDescription = (value?: string | null) =>
  truncateMetaDescription(normalizeMetaDescriptionText(value));

const buildProductMetaDescriptionFallback = (
  productName: string,
  categoryTitle: string,
  locale: SeoLocale,
) =>
  locale === "ar"
    ? `${productName} من Viking Store ضمن ${categoryTitle}، مناسب للتمرين ورياضات القتال.`
    : `Shop ${productName} from Viking Store in our ${categoryTitle} range for combat sports and training.`;

export const buildSeoTitle = (title?: string | null) => {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) return SEO_SITE_NAME;

  const normalizedTitle = cleanTitle.toLowerCase();
  const hasBrandMention = SEO_TITLE_BRAND_MENTIONS.some((brand) =>
    normalizedTitle.includes(brand),
  );

  return hasBrandMention ? cleanTitle : `${cleanTitle} | ${SEO_SITE_NAME}`;
};

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
      label: "Boxing Gear",
      title: "Boxing Gear & Training Equipment",
      description:
        "Shop boxing gear for training, sparring, and protection, including gloves, wraps, and daily round essentials.",
      keywords: "boxing gear, boxing training equipment, boxing protection",
      alternateNames: ["Boxing Gear", "Boxing Training Equipment"],
    },
    ar: {
      label: "أدوات ملاكمة",
      title: "أدوات ومعدات الملاكمة",
      description:
        "اختار أدوات الملاكمة للتمرين والسبارينج، من القفازات والبنداج والحماية إلى أساسيات الجولات اليومية.",
      keywords: "أدوات ملاكمة، معدات ملاكمة، قفازات ملاكمة وحماية",
      alternateNames: [
        "أدوات ملاكمة",
        "معدات ملاكمة",
        "معدات بوكس",
        "أساسيات الملاكمة",
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
      keywords:
        "جلافز ملاكمة، قلبظ ملاكمة، قلابظ ملاكمة، قفازات ملاكمة، جلافز بوكس",
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
      title: "قفازات MMA وأدوات فنون قتالية",
      description:
        "اختار قفازات MMA وأدوات فنون قتالية للتمرين المختلط واللياقة والسبارينج.",
      keywords: "قفازات MMA، أدوات رياضات قتالية، فنون قتالية",
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
      keywords: "ادوات سندا، أدوات رياضات قتالية، فنون قتالية",
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
      title: "قفازات وأدوات مواي تاي",
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
      keywords:
        "شنكار كيك بوكس، شنكار مواي تاي، شنكار، شنكار شراب، واقي قصبة الساق",
      alternateNames: [
        "شنكار كيك بوكس",
        "شنكار مواي تاي",
        "شنكار",
        "شنكار شراب",
        "واقي قصبة الساق",
      ],
    },
  },
  "medical-products": {
    en: {
      label: "Medical Products",
      title: "Sports First Aid & Recovery Supplies",
      description:
        "Shop first-aid, recovery, and support supplies for athletes, training bags, and gym sessions.",
      keywords: "sports first aid, recovery supplies, athlete support",
      alternateNames: ["Medical Products", "Sports First Aid", "Recovery Supplies"],
    },
    ar: {
      label: "منتجات طبية",
      title: "مستلزمات طبية ورياضية للتمرين",
      description:
        "اختار مستلزمات إسعافات وتعافي ودعم للرياضيين، مناسبة لشنطة التمرين وتجهيزات النادي.",
      keywords: "مستلزمات طبية رياضية، إسعافات أولية للرياضة، مستلزمات تعافي",
      alternateNames: ["منتجات طبية", "مستلزمات طبية رياضية", "إسعافات رياضية"],
    },
  },
  "sports-equipment": {
    en: {
      label: "Sports Equipment",
      title: "Combat Sports Training Equipment",
      description:
        "Shop training equipment and sports gear for combat-sports sessions, fitness work, and daily practice.",
      keywords: "combat sports equipment, training equipment, sports gear",
      alternateNames: ["Sports Equipment", "Training Equipment", "Combat Sports Gear"],
    },
    ar: {
      label: "معدات رياضية",
      title: "معدات تمرين لرياضات القتال",
      description:
        "اختار معدات رياضية للتمرين اليومي ورياضات القتال واللياقة، بتجهيزات مناسبة لحصص التدريب.",
      keywords: "معدات تمرين، معدات رياضات قتالية، أدوات رياضية",
      alternateNames: ["معدات رياضية", "معدات التمرين", "معدات رياضات قتالية"],
    },
  },
  "mouth-guards": {
    en: {
      label: "Mouth Guards",
      title: "Mouth Guards for Sports",
      description:
        "Shop mouth guards for various sports and activities to protect your teeth and mouth.",
      keywords: "mouth guards, sports mouth guard, dental protection",
      alternateNames: ["Mouth Guards", "Sports Mouth Guard"],
    },
    ar: {
      label: "واقيات الفم",
      title: "ماوث جارد أو واقيات الفم",
      description:
        "اختار ماوث جارد أو واقي الفم المناسب للتمرين والسبارينج، لحماية الفم والأسنان أثناء رياضات القتال.",
      keywords: "ماوث جارد، واقيات الفم، واقي الفم",
      alternateNames: ["ماوث جارد", "واقيات الفم", "واقي الفم"],
    },
  },
  "gear-bundles": {
    en: {
      label: "Gear Bundles",
      title: "Sports Gear Bundles",
      description:
        "Shop complete gear bundles for various sports and training needs.",
      keywords: "gear bundles, sports gear, training gear",
      alternateNames: ["Gear Bundles", "Sports Gear"],
    },
    ar: {
      label: "مجموعة ادوات ",
      title: "مجموعات ادوات الرياضات",
      description:
        "اختار مجموعات ادوات كاملة للرياضات المختلفة والاحتياجات التمرينية.",
      keywords: "مجموعات ادوات، ادوات الرياضات، ادوات التمرين",
      alternateNames: ["مجموعة ادوات ", "ادوات الرياضات", "ادوات التمرين"],
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
      keywords:
        "boxing head guard, kickboxing head guard, martial arts head guard",
      alternateNames: ["Head Guards", "Boxing Head Guard"],
    },
    ar: {
      label: "هيد جارد",
      title: "هيد جارد وواقي رأس ملاكمة",
      description:
        "اختار هيد جارد مناسب للملاكمة والكيك بوكس والسبارينج، مع واقي رأس ثابت ومريح للتمرين.",
      keywords:
        "هيد جارد ملاكمة، واقي رأس ملاكمة، هيد جارد كيك بوكس، واقي رأس كيك بوكس، واقي رأس للفنون القتالية",
      alternateNames: [
        "هيد جارد ملاكمة",
        "واقي رأس ملاكمة",
        "هيد جارد كيك بوكس",
        "واقي رأس كيك بوكس",
        "واقي رأس للفنون القتالية",
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

export const resolveShopCategoryState = (
  slug: string | null | undefined,
  categories: Array<Extract<CategoryLike, { slug?: string | null; name?: string | null }>>,
): ShopCategoryState => {
  const cleanSlug = normalizeCategorySlug(slug || "all") || "all";
  const isCategoryLanding = cleanSlug !== "all";
  const category =
    categories.find((item) => normalizeCategorySlug(item.slug || "") === cleanSlug) ||
    null;

  return {
    slug: cleanSlug,
    category,
    isCategoryLanding,
    isInvalidCategory: isCategoryLanding && !category,
  };
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
  const description = normalizeProductMetaDescription(product.description);
  const isArabic = locale === "ar";

  return {
    title: isArabic ? `${name} | ${intent.title}` : `${name} | ${intent.title}`,
    description:
      description ||
      buildProductMetaDescriptionFallback(name, intent.title, locale),
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
    ...ROBOTS_DISALLOW_PREFIXES.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
};

export const buildAbsoluteImageUrl = (siteUrl: string, image?: string | null) => {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) return image;

  return buildCanonicalUrl(siteUrl, image);
};

export const buildOrganizationId = (siteUrl: string) =>
  `${buildCanonicalUrl(siteUrl, "/")}#organization`;

export const buildMerchantReturnPolicy = (siteUrl: string) => ({
  "@type": "MerchantReturnPolicy",
  applicableCountry: "EG",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 3,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  refundType: "https://schema.org/FullRefund",
  itemCondition: "https://schema.org/NewCondition",
  merchantReturnLink: buildCanonicalUrl(siteUrl, "/terms"),
});

const toFiniteMoney = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue >= 0
    ? Math.round((numberValue + Number.EPSILON) * 100) / 100
    : null;
};

const shippingDestinationEgypt = () => ({
  "@type": "DefinedRegion",
  addressCountry: "EG",
});

const shippingRate = (value: number, key: "value" | "maxValue") => ({
  "@type": "MonetaryAmount",
  [key]: value,
  currency: SEO_PRICE_CURRENCY,
});

const orderValue = ({
  minValue,
  maxValue,
}: {
  minValue: number;
  maxValue?: number;
}) => ({
  "@type": "MonetaryAmount",
  minValue,
  ...(maxValue === undefined ? {} : { maxValue }),
  currency: SEO_PRICE_CURRENCY,
});

const enabledShippingRates = (source: ShippingSchemaSource) => {
  const defaultFee = toFiniteMoney(source.settings?.default_shipping_fee);
  const enabledGovernorates = (source.governorates || []).filter(
    (governorate) => governorate.is_enabled !== false,
  );

  return enabledGovernorates
    .map((governorate) => toFiniteMoney(governorate.shipping_fee) ?? defaultFee)
    .filter((fee): fee is number => fee !== null);
};

export const buildShippingServiceStructuredData = (
  siteUrl: string,
  source?: ShippingSchemaSource | null,
) => {
  if (!source?.settings || source.settings.shipping_enabled === false) {
    return undefined;
  }

  const serviceBase = {
    "@type": "ShippingService",
    "@id": `${buildCanonicalUrl(siteUrl, "/")}#standard-shipping`,
    name: "Viking Store Standard Shipping",
    fulfillmentType: "https://schema.org/FulfillmentTypeDelivery",
  };

  if (source.settings.free_shipping_all_orders === true) {
    return {
      ...serviceBase,
      shippingConditions: {
        "@type": "ShippingConditions",
        shippingDestination: shippingDestinationEgypt(),
        shippingRate: shippingRate(0, "value"),
      },
    };
  }

  const rates = enabledShippingRates(source);
  if (!rates.length) return undefined;

  const maxShippingRate = Math.max(...rates);
  const threshold = toFiniteMoney(source.settings.free_shipping_threshold);
  const hasThreshold =
    source.settings.free_shipping_threshold_enabled === true &&
    threshold !== null &&
    threshold > 0;

  const paidCondition = {
    "@type": "ShippingConditions",
    shippingDestination: shippingDestinationEgypt(),
    shippingRate: shippingRate(maxShippingRate, "maxValue"),
    ...(hasThreshold
      ? { orderValue: orderValue({ minValue: 0, maxValue: threshold }) }
      : {}),
  };

  if (!hasThreshold) {
    return {
      ...serviceBase,
      shippingConditions: paidCondition,
    };
  }

  return {
    ...serviceBase,
    shippingConditions: [
      paidCondition,
      {
        "@type": "ShippingConditions",
        shippingDestination: shippingDestinationEgypt(),
        shippingRate: shippingRate(0, "value"),
        orderValue: orderValue({ minValue: threshold }),
      },
    ],
  };
};

export const buildOrganizationStructuredData = (
  siteUrl: string,
  options: OrganizationStructuredDataOptions = {},
) => {
  const shippingService = buildShippingServiceStructuredData(
    siteUrl,
    options.shippingSource,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": buildOrganizationId(siteUrl),
    name: SEO_SITE_NAME,
    alternateName: SEO_ALTERNATE_NAMES,
    description: SEO_ORGANIZATION_DESCRIPTION,
    url: buildCanonicalUrl(siteUrl, "/"),
    logo: buildAbsoluteImageUrl(siteUrl, SEO_DEFAULT_IMAGE),
    image: buildAbsoluteImageUrl(siteUrl, SEO_DEFAULT_IMAGE),
    sameAs: SEO_SOCIAL_LINKS,
    hasMerchantReturnPolicy: buildMerchantReturnPolicy(siteUrl),
    ...(shippingService ? { hasShippingService: shippingService } : {}),
  };
};

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

const cleanStructuredDataText = (value?: string | null) => {
  const cleanValue = String(value || "").trim();

  return cleanValue || undefined;
};

const productBrandName = (product: ProductLike) => {
  const brandRelationName =
    typeof product.brand === "object"
      ? cleanStructuredDataText(product.brand?.name)
      : undefined;
  const brandString =
    typeof product.brand === "string"
      ? cleanStructuredDataText(product.brand)
      : undefined;

  return (
    brandRelationName ||
    cleanStructuredDataText(product.brands?.name) ||
    cleanStructuredDataText(product.brand_name) ||
    brandString
  );
};

const productSku = (product: ProductLike) => cleanStructuredDataText(product.sku);

const offerSeller = (siteUrl: string) => ({
  "@id": buildOrganizationId(siteUrl),
});

const nonReturnableProductPolicy = () => ({
  "@type": "MerchantReturnPolicy",
  applicableCountry: "EG",
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
});

const isNonReturnableProduct = (product: ProductLike) =>
  NON_RETURNABLE_CATEGORY_KEYS.has(
    categoryIntentKey(product.categories || product.category),
  );

const productOfferReturnPolicy = (product: ProductLike) =>
  isNonReturnableProduct(product)
    ? { hasMerchantReturnPolicy: nonReturnableProductPolicy() }
    : {};

const productBrandStructuredData = (product: ProductLike) => {
  const brandName = productBrandName(product);

  return brandName
    ? {
        "@type": "Brand",
        name: brandName,
      }
    : undefined;
};

const productAggregateRating = (reviewSummary: ReviewSummaryLike) => {
  const totalReviews = Number(reviewSummary.total || 0);
  const averageRating = Number(reviewSummary.average || 0);

  return totalReviews > 0 && averageRating > 0
    ? {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: totalReviews,
      }
    : undefined;
};

const productAlternateNames = (product: ProductLike) => {
  const key = categoryIntentKey(product.categories || product.category);
  const names = [
    ...(categorySeoIntents[key]?.ar.alternateNames || []),
    ...(categorySeoIntents[key]?.en.alternateNames || []),
  ];

  return Array.from(new Set(names));
};

const rowId = (value?: number | string | null) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
};

const activeProductVariants = (product: ProductLike) =>
  (product.product_variants || []).filter((variant) => variant.is_active !== false);

const variantStockAvailability = (stockQuantity?: number | string | null) =>
  Number(stockQuantity || 0) > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

const variantPublicUrl = (canonicalUrl: string, publicKey: string) => {
  const url = new URL(canonicalUrl);
  url.searchParams.set("variant", publicKey);

  return url.toString();
};

const variantOptionMaps = (product: ProductLike) => ({
  colors: new Map(
    (product.product_colors || [])
      .map((color) => [rowId(color.id), color] as const)
      .filter(([id]) => id != null),
  ),
  sizes: new Map(
    (product.product_sizes || [])
      .map((size) => [rowId(size.id), size] as const)
      .filter(([id]) => id != null),
  ),
});

const variantOptionValues = (
  product: ProductLike,
  variant: NonNullable<ProductLike["product_variants"]>[number],
) => {
  const { colors, sizes } = variantOptionMaps(product);
  const color = colors.get(rowId(variant.color_id));
  const size = sizes.get(rowId(variant.size_id));

  return {
    colorName: cleanStructuredDataText(color?.name),
    sizeName: cleanStructuredDataText(size?.size),
    colorImages: (color?.product_images || [])
      .map((image) => image.image_url)
      .filter(Boolean) as string[],
  };
};

const variantName = (productName: string, colorName?: string, sizeName?: string) => {
  const suffixes = Array.from(new Set([colorName, sizeName].filter(Boolean)));

  return suffixes.length ? `${productName} - ${suffixes.join(" - ")}` : productName;
};

const productVariesBy = (product: ProductLike, variants: NonNullable<ProductLike["product_variants"]>) => {
  const dimensions = variants.reduce(
    (nextDimensions, variant) => {
      const { colorName, sizeName } = variantOptionValues(product, variant);
      if (colorName) nextDimensions.color = true;
      if (sizeName) nextDimensions.size = true;
      return nextDimensions;
    },
    { color: false, size: false },
  );
  const variesBy = [
    dimensions.color ? "https://schema.org/color" : null,
    dimensions.size ? "https://schema.org/size" : null,
  ].filter(Boolean);

  return variesBy.length ? variesBy : undefined;
};

const buildVariantStructuredData = (
  product: ProductLike,
  variant: NonNullable<ProductLike["product_variants"]>[number],
  productName: string,
  canonicalUrl: string,
  siteUrl: string,
  parentImages: string[],
) => {
  const publicKey = cleanStructuredDataText(variant.public_key);
  if (!publicKey) return null;

  const { colorName, sizeName, colorImages } = variantOptionValues(product, variant);
  const url = variantPublicUrl(canonicalUrl, publicKey);
  const images = colorImages.length ? colorImages : parentImages;

  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: variantName(productName, colorName, sizeName),
    url,
    ...(colorName ? { color: colorName } : {}),
    ...(sizeName ? { size: sizeName } : {}),
    image: images.length
      ? images.map((image) => buildAbsoluteImageUrl(siteUrl, image))
      : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: SEO_PRICE_CURRENCY,
      price: Number(variant.price || 0),
      availability: variantStockAvailability(variant.stock_quantity),
      itemCondition: "https://schema.org/NewCondition",
      seller: offerSeller(siteUrl),
      ...productOfferReturnPolicy(product),
    },
  };
};

export const buildProductStructuredData = (
  product: ProductLike,
  canonicalUrl: string,
  reviewSummary: ReviewSummaryLike,
) => {
  const name = product.title || product.name || "Viking Store Product";
  const images = productImages(product);
  const siteUrl = new URL(canonicalUrl).origin;
  const brand = productBrandStructuredData(product);
  const sku = productSku(product);
  const alternateName = productAlternateNames(product);
  const description = normalizeProductMetaDescription(product.description) || name;
  const category = product.categories?.name || product.category || undefined;
  const aggregateRating = productAggregateRating(reviewSummary);
  const activeVariants = activeProductVariants(product);

  if (product.inventory_model === "variants") {
    const variants = activeVariants
      .map((variant) =>
        buildVariantStructuredData(product, variant, name, canonicalUrl, siteUrl, images),
      )
      .filter(Boolean);

    return {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      "@id": `${canonicalUrl}#product-group`,
      productGroupID: cleanStructuredDataText(product.product_group_key),
      name,
      url: canonicalUrl,
      alternateName: alternateName.length ? alternateName : undefined,
      description,
      image: images.length
        ? images.map((image) => buildAbsoluteImageUrl(siteUrl, image))
        : undefined,
      category,
      ...(brand ? { brand } : {}),
      variesBy: productVariesBy(product, activeVariants),
      hasVariant: variants,
      ...(aggregateRating ? { aggregateRating } : {}),
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url: canonicalUrl,
    alternateName: alternateName.length ? alternateName : undefined,
    description,
    image: images.length
      ? images.map((image) => buildAbsoluteImageUrl(siteUrl, image))
      : undefined,
    category,
    ...(brand ? { brand } : {}),
    ...(sku ? { sku } : {}),
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: SEO_PRICE_CURRENCY,
      price: Number(product.price || 0),
      availability: productAvailability(product),
      itemCondition: "https://schema.org/NewCondition",
      seller: offerSeller(siteUrl),
      ...productOfferReturnPolicy(product),
    },
    aggregateRating,
  };
};
