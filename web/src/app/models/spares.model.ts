/**
 * Spares Model - TypeScript Interfaces for Autospares Application
 * Defines all data structures for products, categories, brands, and vehicles
 */

export interface Specification {
  key: string;
  value: string;
}

export interface CompatibleVehicle {
  model: {
    _id: string;
    name: string;
    brand?: string;
  };
  engineSizes?: string[];
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
}

export interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

export interface CarModel {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
  };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  partNumber?: string;
  oemNumber?: string;
  price?: number;
  isAvailable: boolean;
  condition: string;
  images: string[];
  category?: Category;
  partBrand?: Brand;
  compatibleVehicles?: CompatibleVehicle[];
  specifications?: Specification[];
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string | null;
  selectedBrand: string | null;
  selectedVehicleModel: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}
