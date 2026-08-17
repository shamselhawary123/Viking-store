import { buildRobotsTxt, normalizeSiteUrl } from "../../utils/seo";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const origin = normalizeSiteUrl(String(config.public.siteUrl || ""));

  setHeader(event, "content-type", "text/plain; charset=utf-8");

  return buildRobotsTxt(origin);
});
