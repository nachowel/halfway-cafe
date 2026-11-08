import type { Metadata } from "next";

import {
  formatQrMenuPrice,
  getQrMenuPriceOptions,
  type QrMenuProduct,
} from "@/lib/qr-menu-data";
import { getQrMenuData } from "@/lib/qr-menu.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "QR Menu",
  description: "The current Halfway Cafe menu and prices.",
  alternates: {
    canonical: "/menu",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

function ProductPrices({ product }: { product: QrMenuProduct }) {
  const prices = getQrMenuPriceOptions(product);

  if (prices.length === 1 && prices[0].label === null) {
    return (
      <p className="shrink-0 font-inter text-[15px] font-bold text-[#9a6b18] sm:text-base">
        {formatQrMenuPrice(prices[0].value)}
      </p>
    );
  }

  return (
    <dl
      className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 border-t border-[#ded3bd] pt-3"
      aria-label={`${product.name} prices`}
    >
      {prices.map((price) => (
        <div key={price.label} className="min-w-0">
          <dt className="font-inter text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f6f66] sm:text-[11px]">
            {price.label}
          </dt>
          <dd className="mt-0.5 font-inter text-sm font-bold text-[#9a6b18] sm:text-[15px]">
            {formatQrMenuPrice(price.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function MenuUnavailable() {
  return (
    <main className="qr-menu-page min-h-screen bg-[#f6f0e2] px-4 py-16 text-[#17352b]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#d9caa8] bg-[#fffaf0] p-8 text-center shadow-[0_16px_40px_rgba(20,56,45,0.08)]">
        <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#9a6b18]">
          Halfway Cafe
        </p>
        <h1 className="mt-3 font-playfair text-3xl font-bold">Menu temporarily unavailable</h1>
        <p className="mt-4 font-inter text-sm leading-6 text-[#50645b]">
          We could not load the current prices safely. Please speak to a member of staff for
          today&apos;s menu.
        </p>
        <a
          href="/menu"
          className="mt-6 inline-flex rounded-full bg-[#173f32] px-5 py-3 font-inter text-sm font-bold text-white no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8872e] focus-visible:ring-offset-2"
        >
          View the main menu
        </a>
      </div>
    </main>
  );
}

export default async function QrMenuPage() {
  const result = await getQrMenuData();

  if (result.status === "error") {
    return <MenuUnavailable />;
  }

  const productCount = result.categories.reduce(
    (count, category) => count + category.products.length,
    0,
  );

  return (
    <div className="qr-menu-page min-h-screen bg-[#f6f0e2] text-[#17352b]">
      <style>{`
        body:has(.qr-menu-page),
        main:has(> .qr-menu-page) {
          overflow-x: clip;
        }
      `}</style>
      <a
        href="#qr-menu-content"
        className="sr-only z-[70] rounded-md bg-white px-4 py-3 font-inter font-bold text-[#173f32] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to menu items
      </a>

      <header className="overflow-hidden bg-[#14382d] text-white">
        <div className="mx-auto max-w-4xl px-4 pb-9 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
          <div className="flex items-center justify-between gap-4">
            <a
              href="/"
              className="font-inter text-[11px] font-bold uppercase tracking-[0.2em] text-[#e4c16f] no-underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c16f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#14382d]"
            >
              Halfway Cafe
            </a>
            <span className="font-inter text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Sidcup · DA15
            </span>
          </div>

          <div className="mt-10 max-w-2xl">
            <p className="font-inter text-xs font-bold uppercase tracking-[0.24em] text-[#e4c16f]">
              Freshly made, every day
            </p>
            <h1 className="mt-3 font-playfair text-5xl font-bold leading-none sm:text-6xl">
              Our Menu
            </h1>
            <p className="mt-5 max-w-xl font-inter text-sm leading-6 text-[#edf4ef] sm:text-base">
              Browse {productCount} dishes across {result.categories.length} categories. Prices shown
              here come directly from our current cafe menu.
            </p>
          </div>
        </div>
      </header>

      <nav
        aria-label="QR menu categories"
        className="sticky top-0 z-40 border-b border-[#cdbd99] bg-[#fffaf0]/95 shadow-[0_6px_18px_rgba(20,56,45,0.08)] backdrop-blur md:top-[73px]"
      >
        <div className="mx-auto max-w-4xl overflow-x-auto px-3 py-3 sm:px-5">
          <div className="flex min-w-max gap-2">
            {result.categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.slug}`}
                className="rounded-full border border-[#cdbd99] bg-[#f6f0e2] px-4 py-2 font-inter text-xs font-bold text-[#173f32] no-underline transition-colors hover:border-[#b8872e] hover:bg-[#14382d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8872e] focus-visible:ring-offset-2"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main id="qr-menu-content" className="mx-auto max-w-4xl px-4 pb-16 pt-7 sm:px-6 sm:pt-10">
        <aside className="rounded-2xl border border-[#d4b96e] bg-[#fff8df] px-4 py-4 sm:px-5">
          <p className="font-inter text-sm leading-6 text-[#5c4b25]">
            <strong className="text-[#173f32]">Allergies and dietary requirements:</strong>{" "}
            please speak to a member of staff before ordering. Our kitchen handles common allergens.
          </p>
        </aside>

        <div className="mt-4 divide-y divide-[#cdbd99]">
          {result.categories.map((category) => (
            <section
              key={category.id}
              id={category.slug}
              data-qr-category={category.slug}
              aria-labelledby={`${category.slug}-heading`}
              className="scroll-mt-24 py-10 first:pt-7 md:scroll-mt-48"
            >
              <div className="flex items-end justify-between gap-4 border-b-2 border-[#173f32] pb-3">
                <h2
                  id={`${category.slug}-heading`}
                  className="font-playfair text-3xl font-bold leading-tight text-[#173f32] sm:text-4xl"
                >
                  {category.name}
                </h2>
                <p className="shrink-0 pb-1 font-inter text-xs font-semibold text-[#6b786f]">
                  {category.products.length} item{category.products.length === 1 ? "" : "s"}
                </p>
              </div>

              {category.products.length > 0 ? (
                <div className="mt-2 divide-y divide-[#ded3bd]">
                  {category.products.map((product) => {
                    const prices = getQrMenuPriceOptions(product);
                    const hasVariants = prices.some((price) => price.label !== null);

                    return (
                      <article
                        key={product.id}
                        data-qr-product-id={product.id}
                        className="py-5 sm:py-6"
                      >
                        <div className="flex items-start justify-between gap-5">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-inter text-base font-bold leading-6 text-[#17352b] sm:text-[17px]">
                              {product.name}
                            </h3>
                            {product.description ? (
                              <p className="mt-1.5 max-w-2xl font-inter text-[13px] leading-5 text-[#5f6f66] sm:text-sm sm:leading-6">
                                {product.description}
                              </p>
                            ) : null}
                          </div>
                          {!hasVariants ? <ProductPrices product={product} /> : null}
                        </div>
                        {hasVariants ? <ProductPrices product={product} /> : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="py-6 font-inter text-sm text-[#5f6f66]">
                  Please ask a member of staff about today&apos;s selection.
                </p>
              )}
            </section>
          ))}
        </div>

        <div className="rounded-3xl bg-[#14382d] px-5 py-7 text-center text-white sm:px-8">
          <p className="font-playfair text-2xl font-bold">Ready to order?</p>
          <p className="mt-2 font-inter text-sm leading-6 text-[#edf4ef]">
            Note your choices and order with a member of our team.
          </p>
          <a
            href="#qr-menu-content"
            className="mt-5 inline-flex rounded-full border border-[#e4c16f] px-5 py-2.5 font-inter text-xs font-bold uppercase tracking-[0.14em] text-[#e4c16f] no-underline hover:bg-[#e4c16f] hover:text-[#14382d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#14382d]"
          >
            Back to the top
          </a>
        </div>
      </main>
    </div>
  );
}
