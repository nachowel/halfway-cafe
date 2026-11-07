import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const env = getSupabasePublicEnv();
  let slugs = ["breakfast", "omelettes", "pancakes-eggs", "sandwiches", "burgers", "jacket-potatoes", "lunch", "panini", "sides-extras", "drinks", "kids-menu"];
  if (env) {
    try {
      const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
      const { data, error } = await supabase.from("categories").select("slug").eq("active", true);
      if (error) throw error;
      if (data?.length) slugs = data.map((category) => category.slug);
    } catch (error) {
      console.error("Sitemap category fetch failed:", error);
    }
  }
  return [
    ...slugs.map((slug) => ({ url: `https://halfwaycafe.co.uk/menu/${slug}`, priority: 0.8, changeFrequency: "weekly" as const })),
    {
      url: "https://halfwaycafe.co.uk",
      priority: 1.0,
    },
    {
      url: "https://halfwaycafe.co.uk/menu",
      priority: 0.9,
    },
    {
      url: "https://halfwaycafe.co.uk/gallery",
      priority: 0.7,
    },
    {
      url: "https://halfwaycafe.co.uk/about",
      priority: 0.6,
    },
    {
      url: "https://halfwaycafe.co.uk/faq",
      priority: 0.7,
    },
    {
      url: "https://halfwaycafe.co.uk/contact",
      priority: 0.8,
    },
    {
      url: "https://halfwaycafe.co.uk/breakfast-sidcup",
      priority: 0.8,
    },
    {
      url: "https://halfwaycafe.co.uk/cafe-sidcup",
      priority: 0.8,
    },
    {
      url: "https://halfwaycafe.co.uk/coffee-shop-sidcup",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: "https://halfwaycafe.co.uk/cafe-near-sidcup-station",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: "https://halfwaycafe.co.uk/brunch-sidcup",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: "https://halfwaycafe.co.uk/full-english-breakfast-sidcup",
      priority: 0.8,
    },
    {
      url: "https://halfwaycafe.co.uk/takeaway-sidcup",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: "https://halfwaycafe.co.uk/bacon-sandwich-sidcup",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: "https://halfwaycafe.co.uk/pancakes-sidcup",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: "https://halfwaycafe.co.uk/eggs-benedict-sidcup",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: "https://halfwaycafe.co.uk/breakfast-da15",
      priority: 0.8,
      changeFrequency: "monthly",
    },
  ];
}
