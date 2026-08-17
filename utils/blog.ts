export const BLOG_POST_STATUSES = ["draft", "published"] as const;

export type BlogPostStatus = (typeof BLOG_POST_STATUSES)[number];
export type BlogPostId = string | number;

export type BlogPostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string | string[];
  status: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
  og_image: string;
};

export type BlogPostLike = {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image?: string | null;
  category?: string | null;
  tags?: string[] | null;
  status?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
};

export const normalizeBlogSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const normalizeBlogRouteId = (value: string | string[] | number | null | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;

  return raw === null || raw === undefined ? "" : String(raw).trim();
};

export const normalizeBlogTags = (tags: string | string[] | null | undefined) => {
  const values = Array.isArray(tags) ? tags : String(tags || "").split(",");
  const seen = new Set<string>();

  return values
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const validateBlogPostForm = (form: Pick<BlogPostForm, "title" | "slug" | "content" | "status">) => {
  if (!form.title.trim()) return "Title is required.";
  if (!normalizeBlogSlug(form.slug)) return "Slug is required.";
  if (!form.content.trim()) return "Content is required.";
  if (!BLOG_POST_STATUSES.includes(form.status as BlogPostStatus)) return "Status must be draft or published.";

  return "";
};

export const buildBlogPostPayload = (form: BlogPostForm, authorId: string | null | undefined) => {
  const status = BLOG_POST_STATUSES.includes(form.status as BlogPostStatus)
    ? (form.status as BlogPostStatus)
    : "draft";
  const publishedAt = status === "published"
    ? form.published_at
      ? new Date(form.published_at).toISOString()
      : new Date().toISOString()
    : null;

  return {
    title: form.title.trim(),
    slug: normalizeBlogSlug(form.slug),
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    cover_image: form.cover_image.trim() || null,
    category: form.category.trim() || null,
    tags: normalizeBlogTags(form.tags),
    author_id: authorId || null,
    status,
    published_at: publishedAt,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
    og_image: form.og_image.trim() || null,
  };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderInlineMarkdown = (value: string) =>
  escapeHtml(value).replace(
    /\[([^\]]+)\]\((\/(?:shop|categories|blog)(?:\/[a-z0-9-]+)?(?:\?[a-z0-9=&_-]+)?)\)/gi,
    '<a class="premium-link" href="$2">$1</a>',
  );

export const renderSafeBlogContent = (content: string) => {
  const blocks: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`);
    listItems = [];
  };

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push(`<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      blocks.push(`<h2>${renderInlineMarkdown(trimmed.slice(2))}</h2>`);
      return;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(renderInlineMarkdown(trimmed.slice(2)));
      return;
    }

    flushList();
    blocks.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  });

  flushList();

  return blocks.join("\n");
};

export const calculateReadingTime = (content: string, wordsPerMinute = 180) => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

export const buildBlogCanonicalUrl = (siteUrl: string, slug: string) =>
  `${siteUrl.replace(/\/$/, "")}/blog/${normalizeBlogSlug(slug)}`;

export const buildBlogSeoMeta = (post: BlogPostLike, canonicalUrl: string) => {
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || "";
  const image = post.og_image || post.cover_image || undefined;

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: canonicalUrl,
    twitterCard: image ? "summary_large_image" : "summary",
  };
};

export const buildBlogStructuredData = (
  post: BlogPostLike,
  canonicalUrl: string,
  publisherName: string,
  authorName?: string | null,
) => ({
  article: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo_description || post.excerpt || post.title,
    image: post.og_image || post.cover_image || undefined,
    datePublished: post.published_at || post.created_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    author: authorName
      ? {
          "@type": "Person",
          name: authorName,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: publisherName,
    },
    mainEntityOfPage: canonicalUrl,
  },
  breadcrumb: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: `${canonicalUrl.replace(/\/blog\/[^/]+$/, "")}/blog`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  },
});

export const buildBlogImagePath = (fileName: string, timestamp = Date.now()) => {
  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `blog-images/${timestamp}-${safeName || "image"}`;
};

export const formatBlogDate = (date?: string | null, locale = "en") => {
  if (!date) return "-";

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const filterAdminBlogPosts = <T extends BlogPostLike>(
  posts: T[],
  filters: { search: string; status: string; category: string },
) => {
  const term = filters.search.trim().toLowerCase();

  return posts.filter((post) => {
    const matchesSearch =
      !term ||
      [post.title, post.slug, post.excerpt, post.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    const matchesStatus = filters.status === "all" || post.status === filters.status;
    const matchesCategory = filters.category === "all" || post.category === filters.category;

    return matchesSearch && matchesStatus && matchesCategory;
  });
};
