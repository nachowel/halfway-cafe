/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://halfwaycafe.co.uk",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/api/*", "/admin/*", "/admin/login"],

  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
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

    const categoryPaths = (categories ?? []).map((cat) => ({
      loc: `/menu/${cat.slug}`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }));

    return [
      {
        loc: "/",
        changefreq: "weekly",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      },
      ...categoryPaths,
    ];
  },
};
