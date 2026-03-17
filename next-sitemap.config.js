/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://halfwaycafe.co.uk",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,

  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: path === "/" ? 1.0 : config.priority,
      lastmod: new Date().toISOString(),
    };
  },

  additionalPaths: async (config) => {
    const { createClient } = await import("@supabase/supabase-js");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (!categories) return [];

    return categories.map((cat) => ({
      loc: `/menu/${cat.slug}`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }));
  },
};
