/* Menu category metadata — merged with Supabase categories on the public menu page */

export interface MenuCategoryDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export const menuCategoryDefinitions: MenuCategoryDefinition[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    slug: "breakfast",
    description: "Classic cafe breakfasts, early plates, and proper morning favourites.",
  },
  {
    id: "omelettes",
    name: "Omelettes",
    slug: "omelettes",
    description: "Folded to order with hearty fillings and simple, satisfying sides.",
  },
  {
    id: "pancakes-eggs",
    name: "Pancakes & Eggs",
    slug: "pancakes-eggs",
    description: "Sweet stacks, soft eggs, and brunch staples made for slow mornings.",
  },
  {
    id: "lunch",
    name: "Lunch Plates",
    slug: "lunch",
    description: "Fresh midday plates designed for a proper sit-down lunch.",
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    slug: "sandwiches",
    description: "Cafe sandwiches built with familiar fillings and generous portions.",
  },
  {
    id: "burgers",
    name: "Burgers",
    slug: "burgers",
    description: "Stacked burgers, grilled fresh, with the cafe's no-fuss comfort style.",
  },
  {
    id: "jacket-potatoes",
    name: "Jacket Potatoes",
    slug: "jacket-potatoes",
    description: "Crisp-skinned jackets with warm fillings for an easy, filling meal.",
  },
  {
    id: "panini",
    name: "Panini",
    slug: "panini",
    description: "Pressed panini with melted centres and crisp golden edges.",
  },
  {
    id: "extras",
    name: "Sides & Extras",
    slug: "extras",
    description: "Add-ons, bites, and little extras to round out the table.",
  },
  {
    id: "drinks",
    name: "Drinks",
    slug: "drinks",
    description: "Coffee, tea, soft drinks, and the everyday pours that keep the room moving.",
  },
];

export function getMenuCategoryDefinitionBySlug(slug: string) {
  return menuCategoryDefinitions.find((category) => category.slug === slug);
}
