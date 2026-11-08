export interface RecoveryImage {
  slug: string;
  width: number;
  height: number;
  widths: readonly number[];
}

const recoveryImages = {
  "supabase:Hero/icon-logo.png": { slug: "logo", width: 1024, height: 1024, widths: [48, 96] },
  "supabase:Hero/hero1.png": { slug: "hero-desktop", width: 1376, height: 768, widths: [640, 828, 1080, 1376] },
  "supabase:Hero/mobilehero1.png": { slug: "hero-mobile", width: 928, height: 1152, widths: [384, 640, 828, 928] },
  "supabase:Hero/breakfast-hero.webp": { slug: "breakfast-hero", width: 1792, height: 1024, widths: [384, 640, 828, 1080, 1200, 1600] },
  "supabase:set breakfast/Buildersbreakfast.png": { slug: "builders-breakfast", width: 1200, height: 896, widths: [96, 128, 256, 384, 640, 750, 1080] },
  "unsplash:photo-1485962398705-ef6a13c41e8f": { slug: "photo-1485962398705-ef6a13c41e8f", width: 600, height: 900, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1495474472287-4d71bcdd2085": { slug: "photo-1495474472287-4d71bcdd2085", width: 600, height: 400, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1509042239860-f550ce710b93": { slug: "photo-1509042239860-f550ce710b93", width: 600, height: 900, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1510693206972-df098062cb71": { slug: "photo-1510693206972-df098062cb71", width: 600, height: 499, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1512621776951-a57141f2eefd": { slug: "photo-1512621776951-a57141f2eefd", width: 600, height: 400, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1517673400267-0251440c45dc": { slug: "photo-1517673400267-0251440c45dc", width: 600, height: 400, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1520072959219-c595dc870360": { slug: "photo-1520072959219-c595dc870360", width: 600, height: 352, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1525351484163-7529414344d8": { slug: "photo-1525351484163-7529414344d8", width: 600, height: 600, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1528736235302-52922df5c122": { slug: "photo-1528736235302-52922df5c122", width: 600, height: 365, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1533089860892-a7c6f0a88666": { slug: "photo-1533089860892-a7c6f0a88666", width: 1600, height: 1067, widths: [128, 256, 384, 640, 828, 1080, 1200, 1600] },
  "unsplash:photo-1541519227354-08fa5d50c44d": { slug: "photo-1541519227354-08fa5d50c44d", width: 600, height: 399, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1542990253-0d0f5be5f0ed": { slug: "photo-1542990253-0d0f5be5f0ed", width: 600, height: 900, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1544025162-d76694265947": { slug: "photo-1544025162-d76694265947", width: 600, height: 401, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1547592166-23ac45744acd": { slug: "photo-1547592166-23ac45744acd", width: 600, height: 400, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1551024506-0bccd828d307": { slug: "photo-1551024506-0bccd828d307", width: 600, height: 750, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1553909489-cd47e0907980": { slug: "photo-1553909489-cd47e0907980", width: 600, height: 480, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1554118811-1e0d58224f24": { slug: "photo-1554118811-1e0d58224f24", width: 900, height: 617, widths: [256, 384, 640, 828, 900] },
  "unsplash:photo-1556679343-c7306c1976bc": { slug: "photo-1556679343-c7306c1976bc", width: 600, height: 750, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1559925393-8be0ec4767c8": { slug: "photo-1559925393-8be0ec4767c8", width: 800, height: 533, widths: [384, 640, 800] },
  "unsplash:photo-1562802378-063ec186a863": { slug: "photo-1562802378-063ec186a863", width: 600, height: 900, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1567620905732-2d1ec7ab7445": { slug: "photo-1567620905732-2d1ec7ab7445", width: 600, height: 725, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1568901346375-23c9450c58cd": { slug: "photo-1568901346375-23c9450c58cd", width: 600, height: 498, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1572490122747-3968b75cc699": { slug: "photo-1572490122747-3968b75cc699", width: 600, height: 900, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1579954115545-a95591f28bfc": { slug: "photo-1579954115545-a95591f28bfc", width: 600, height: 400, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1600093463592-8e36ae95ef56": { slug: "photo-1600093463592-8e36ae95ef56", width: 500, height: 333, widths: [96, 128, 256, 384, 500] },
  "unsplash:photo-1606755962773-d324e0a13086": { slug: "photo-1606755962773-d324e0a13086", width: 600, height: 900, widths: [96, 128, 256, 384, 600] },
  "unsplash:photo-1621506289937-a8e4df240d0b": { slug: "photo-1621506289937-a8e4df240d0b", width: 600, height: 900, widths: [96, 128, 256, 384, 600] },
} satisfies Record<string, RecoveryImage>;

function getImageKey(src: string): string | null {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    return null;
  }

  if (url.hostname === "images.unsplash.com") {
    return `unsplash:${url.pathname.replace(/^\//, "")}`;
  }

  if (url.hostname.endsWith(".supabase.co")) {
    const path = decodeURIComponent(url.pathname).replace(
      /^\/storage\/v1\/object\/(?:sign|public)\//,
      ""
    );

    if (path !== decodeURIComponent(url.pathname)) {
      return `supabase:${path}`;
    }
  }

  return null;
}

export function getRecoveryImage(src: string): RecoveryImage | null {
  const key = getImageKey(src);
  return key ? recoveryImages[key] ?? null : null;
}

export function isSupabaseStorageImage(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/")
    );
  } catch {
    return false;
  }
}

export function getRecoveryVariantUrl(
  image: RecoveryImage,
  width: number,
  format: "avif" | "webp"
): string {
  return `/images/recovery/${image.slug}-${width}.${format}`;
}
