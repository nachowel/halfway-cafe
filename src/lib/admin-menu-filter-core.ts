export interface AdminMenuFilterRow {
  name: string;
  description: string | null;
  price: number;
  category: string;
  active: boolean;
  featured: boolean;
}

export interface AdminMenuFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  onlyActive: boolean;
  onlyFeatured: boolean;
}

export function filterAdminMenuItems<T extends AdminMenuFilterRow>(items: T[], filters: AdminMenuFilters): T[] {
  const normalizedSearch = filters.search.trim().toLowerCase();
  const parsedMinPrice = filters.minPrice === "" ? null : Number.parseFloat(filters.minPrice);
  const parsedMaxPrice = filters.maxPrice === "" ? null : Number.parseFloat(filters.maxPrice);

  return items.filter((item) => {
    const searchable = `${item.name} ${item.description ?? ""}`.toLowerCase();
    const itemPrice = Number(item.price);
    const matchesMin = parsedMinPrice === null || Number.isNaN(parsedMinPrice) || itemPrice >= parsedMinPrice;
    const matchesMax = parsedMaxPrice === null || Number.isNaN(parsedMaxPrice) || itemPrice <= parsedMaxPrice;

    return searchable.includes(normalizedSearch)
      && (filters.category === "All" || item.category === filters.category)
      && matchesMin
      && matchesMax
      && (!filters.onlyActive || item.active)
      && (!filters.onlyFeatured || item.featured);
  });
}
