export interface QrMenuCategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number | null;
  active: boolean | null;
}

export interface QrMenuProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number | string | null;
  price_roll: number | string | null;
  price_sandwich: number | string | null;
  price_baguette: number | string | null;
  category: string;
  sort_order: number | null;
  active: boolean | null;
}

export interface QrMenuProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
  basePrice: number;
  rollPrice: number | null;
  sandwichPrice: number | null;
  baguettePrice: number | null;
}

export interface QrMenuCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  products: QrMenuProduct[];
}

export interface QrMenuPriceOption {
  label: "Roll" | "Sandwich" | "Baguette" | null;
  value: number;
}

export function formatQrMenuPrice(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function rowOrder(value: number | null) {
  return Number.isFinite(value) ? Number(value) : Number.MAX_SAFE_INTEGER;
}

function requiredPrice(value: number | string | null, itemId: string) {
  if (value === null || value === "") {
    throw new Error(`Invalid base price for menu item ${itemId}`);
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid base price for menu item ${itemId}`);
  }

  return parsed;
}

function optionalPrice(
  value: number | string | null,
  itemId: string,
  field: "roll" | "sandwich" | "baguette",
) {
  if (value === null || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${field} price for menu item ${itemId}`);
  }

  return parsed;
}

export function getQrMenuPriceOptions(product: QrMenuProduct): QrMenuPriceOption[] {
  const variants: QrMenuPriceOption[] = [];

  if (product.rollPrice !== null) {
    variants.push({ label: "Roll", value: product.rollPrice });
  }
  if (product.sandwichPrice !== null) {
    variants.push({ label: "Sandwich", value: product.sandwichPrice });
  }
  if (product.baguettePrice !== null) {
    variants.push({ label: "Baguette", value: product.baguettePrice });
  }

  return variants.length > 0 ? variants : [{ label: null, value: product.basePrice }];
}

export function buildQrMenuData(
  categoryRows: QrMenuCategoryRow[],
  productRows: QrMenuProductRow[],
): QrMenuCategory[] {
  const categorySlugs = new Set<string>();
  const categories = categoryRows
    .filter((category) => category.active === true)
    .sort(
      (left, right) =>
        rowOrder(left.sort_order) - rowOrder(right.sort_order) ||
        left.name.localeCompare(right.name),
    )
    .filter((category) => {
      if (!category.slug || categorySlugs.has(category.slug)) {
        return false;
      }
      categorySlugs.add(category.slug);
      return true;
    })
    .map<QrMenuCategory>((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      sortOrder: rowOrder(category.sort_order),
      products: [],
    }));

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const productIds = new Set<string>();
  const sortedProducts = productRows
    .filter((product) => product.active === true && categoryBySlug.has(product.category))
    .sort(
      (left, right) =>
        rowOrder(left.sort_order) - rowOrder(right.sort_order) ||
        left.name.localeCompare(right.name),
    );

  for (const product of sortedProducts) {
    if (!product.id || productIds.has(product.id)) {
      continue;
    }
    productIds.add(product.id);

    categoryBySlug.get(product.category)?.products.push({
      id: product.id,
      name: product.name,
      description: product.description?.trim() ?? "",
      category: product.category,
      sortOrder: rowOrder(product.sort_order),
      basePrice: requiredPrice(product.price, product.id),
      rollPrice: optionalPrice(product.price_roll, product.id, "roll"),
      sandwichPrice: optionalPrice(product.price_sandwich, product.id, "sandwich"),
      baguettePrice: optionalPrice(product.price_baguette, product.id, "baguette"),
    });
  }

  return categories;
}
