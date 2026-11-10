const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const supabaseHostnames = [
  ...new Set(
    ["jbatmtnlegydsjerkuml.supabase.co", supabaseHostname].filter(Boolean),
  ),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: "/english-breakfast-sidcup",
        destination: "/full-english-breakfast-sidcup",
        permanent: true,
      },
    ];
  },
  images: {
    qualities: [75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**/image/upload/**",
      },
      ...supabaseHostnames.flatMap((hostname) => [
        {
          protocol: "https",
          hostname,
          pathname: "/storage/v1/object/sign/**",
        },
        {
          protocol: "https",
          hostname,
          pathname: "/storage/v1/object/public/**",
        },
      ]),
    ],
  },
};

export default nextConfig;
