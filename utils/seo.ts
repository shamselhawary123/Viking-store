export const DEFAULT_SITE_URL = "https://viking-store.vercel.app";
export const SEO_SITE_NAME = "Viking Store";
export const SEO_DEFAULT_IMAGE = "/logo.png";
export const SEO_PRICE_CURRENCY = "EGP";

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
  product_colors?: Array<{ product_images?: Array<{ image_url?: string | null }> | null }> | null;
  product_sizes?: Array<{ in_stock?: boolean | null }> | null;
  categories?: { name?: string | null } | null;
  category?: string | null;
  brand?: string | { name?: string | null } | null;
  brand_name?: string | null;
};

type ReviewSummaryLike = {
  total?: number;
  average?: number;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const stripQueryAndHash = (path: string) => path.split(/[?#]/)[0] || "/";

export const normalizeSiteUrl = (siteUrl: string, fallback = DEFAULT_SITE_URL) =>
  trimTrailingSlash(siteUrl || fallback);

export const buildCanonicalUrl = (siteUrl: string, path: string) => {
  const origin = normalizeSiteUrl(siteUrl);
  const cleanPath = stripQueryAndHash(path || "/");
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  return normalizedPath === "/" ? `${origin}/` : `${origin}${normalizedPath.replace(/\/+$/, "")}`;
};

export const isPrivateSeoPath = (path: string) => {
  const cleanPath = stripQueryAndHash(path);

  return PRIVATE_SEO_PREFIXES.some((prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`));
};

export const publicSitemapEntries = (siteUrl: string): SitemapEntry[] => [
  { loc: buildCanonicalUrl(siteUrl, "/") },
  { loc: buildCanonicalUrl(siteUrl, "/shop") },
  { loc: buildCanonicalUrl(siteUrl, "/categories") },
  { loc: buildCanonicalUrl(siteUrl, "/blog") },
  { loc: buildCanonicalUrl(siteUrl, "/about") },
  { loc: buildCanonicalUrl(siteUrl, "/contact") },
  { loc: buildCanonicalUrl(siteUrl, "/faq") },
];

export const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const buildSitemapXml = (urls: SitemapEntry[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .filter((url) => !isPrivateSeoPath(new URL(url.loc).pathname))
  .map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `
    <lastmod>${escapeXml(new Date(url.lastmod).toISOString())}</lastmod>` : ""}
  </url>`)
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
  url: buildCanonicalUrl(siteUrl, "/"),
  logo: absoluteImageUrl(siteUrl, SEO_DEFAULT_IMAGE),
});

export const buildWebsiteStructuredData = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SEO_SITE_NAME,
  url: buildCanonicalUrl(siteUrl, "/"),
  potentialAction: {
    "@type": "SearchAction",
    target: `${buildCanonicalUrl(siteUrl, "/shop")}?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => ({
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
    description: product.description || name,
    image: images.length ? images.map((image) => absoluteImageUrl(siteUrl, image)) : undefined,
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
    aggregateRating: totalReviews > 0 && averageRating > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: averageRating.toFixed(1),
          reviewCount: totalReviews,
        }
      : undefined,
  };
};
