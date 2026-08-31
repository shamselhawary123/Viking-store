import { createClient } from "@supabase/supabase-js";
import { buildCanonicalUrl, buildShopCategoryCanonicalUrl, buildSitemapXml, normalizeSiteUrl, publicSitemapEntries } from "../../utils/seo";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const origin = normalizeSiteUrl(String(config.public.siteUrl || ""));
  const urls: Array<{ loc: string; lastmod?: string | null }> = publicSitemapEntries(origin);

  if (config.public.supabaseUrl && config.public.supabaseKey) {
    const supabase = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseKey as string,
    );

    const { data: products } = await supabase
      .from("products")
      .select("slug,created_at")
      .not("slug", "is", null)
      .order("id", { ascending: false });

    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .not("slug", "is", null)
      .order("id", { ascending: true });

    (categories || []).forEach((category) => {
      if (!category.slug || category.slug === "all") return;

      urls.push({
        loc: buildShopCategoryCanonicalUrl(origin, category.slug),
      });
    });

    (products || []).forEach((product) => {
      urls.push({
        loc: buildCanonicalUrl(origin, `/shop/${product.slug}`),
        lastmod: product.created_at,
      });
    });

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug,updated_at,published_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });

    (posts || []).forEach((post) => {
      urls.push({
        loc: buildCanonicalUrl(origin, `/blog/${post.slug}`),
        lastmod: post.updated_at || post.published_at,
      });
    });
  }

  setHeader(event, "content-type", "application/xml; charset=utf-8");

  return buildSitemapXml(urls);
});
