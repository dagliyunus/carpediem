export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  allergens: string[];
  isPopular?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  category: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
