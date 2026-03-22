import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://halfwaycafe.co.uk",
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: "https://halfwaycafe.co.uk/menu",
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: "https://halfwaycafe.co.uk/gallery",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://halfwaycafe.co.uk/about",
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: "https://halfwaycafe.co.uk/faq",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://halfwaycafe.co.uk/contact",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://halfwaycafe.co.uk/breakfast-sidcup",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://halfwaycafe.co.uk/cafe-sidcup",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://halfwaycafe.co.uk/english-breakfast-sidcup",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://halfwaycafe.co.uk/takeaway-sidcup",
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: "https://halfwaycafe.co.uk/bacon-sandwich-sidcup",
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly",
    },
  ];
}
