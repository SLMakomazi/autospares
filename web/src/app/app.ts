import { Component, OnInit, HostListener, signal, computed, WritableSignal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanityService } from './services/sanity';
import { Product, Category, Brand, Specification, CompatibleVehicle, CarModel } from './models/spares.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  // Data signals
  readonly productsSignal = signal<Product[]>([]);
  readonly categoriesSignal = signal<Category[]>([]);
  readonly brandsSignal = signal<Brand[]>([]);
  readonly carModelsSignal = signal<CarModel[]>([]);
  readonly loadingSignal = signal<boolean>(true);
  readonly errorMessageSignal = signal<string | null>(null);

  // Filter signals
  readonly searchQuerySignal = signal<string>('');
  readonly selectedCategorySignal = signal<string | null>(null);
  readonly selectedBrandSignal = signal<string | null>(null);
  readonly selectedVehicleModelSignal = signal<string | null>(null);
  readonly minPriceSignal = signal<number | null>(null);
  readonly maxPriceSignal = signal<number | null>(null);
  readonly showSearchSuggestionsSignal = signal<boolean>(false);

  // UI state signals
  readonly isScrolledSignal = signal<boolean>(false);
  readonly showMobileFiltersSignal = signal<boolean>(false);
  readonly expandedSpecsSignal = signal<Set<string>>(new Set());

  readonly searchSuggestionsSignal = computed(() => {
    const query = this.searchQuerySignal().trim().toLowerCase();
    if (!query) {
      return [];
    }

    const suggestions: Array<{ type: 'product' | 'category' | 'brand' | 'carModel'; label: string; value: string }> = [];

    this.productsSignal().forEach(product => {
      const searchableText = [product.name, product.sku, product.partNumber, product.oemNumber]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(query)) {
        suggestions.push({ type: 'product', label: product.name, value: product.name });
      }
    });

    return suggestions.slice(0, 8);
  });

  readonly searchResultsSignal = computed(() => {
    const products = this.productsSignal();
    const query = this.searchQuerySignal().trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter(product => {
      return [
        product.name,
        product.sku,
        product.partNumber,
        product.oemNumber
      ].some(value => value?.toLowerCase().includes(query));
    });
  });

  readonly filteredProductsSignal = computed(() => {
    const products = this.searchResultsSignal();
    const selectedCategory = this.selectedCategorySignal();
    const selectedBrand = this.selectedBrandSignal();
    const selectedVehicleModel = this.selectedVehicleModelSignal();
    const minPrice = this.minPriceSignal();
    const maxPrice = this.maxPriceSignal();

    return products.filter(product => {
      if (selectedCategory && (!product.category || product.category.title !== selectedCategory)) {
        return false;
      }

      if (selectedBrand && (!product.partBrand || product.partBrand.name !== selectedBrand)) {
        return false;
      }

      if (selectedVehicleModel) {
        const matchesVehicle = product.compatibleVehicles?.some(vehicle => {
          const vehicleName = `${vehicle.model?.brand || ''} ${vehicle.model?.name || ''}`.trim().toLowerCase();
          return vehicleName === selectedVehicleModel.toLowerCase();
        });
        if (!matchesVehicle) return false;
      }

      if (minPrice !== null && (!product.price || product.price < minPrice)) {
        return false;
      }
      if (maxPrice !== null && (!product.price || product.price > maxPrice)) {
        return false;
      }

      return true;
    });
  });

  constructor(private sanityService: SanityService) {}

  private getFallbackProducts(): Product[] {
    return [
      {
        _id: 'fallback-product-1',
        name: 'VW Polo 1.4 Starter Motor',
        slug: 'vw-polo-1-4-starter-motor',
        sku: 'SP-1001',
        partNumber: '123456',
        oemNumber: 'VW-78901',
        price: 1599,
        isAvailable: true,
        condition: 'New',
        images: ['https://via.placeholder.com/300x200?text=VW+Starter+Motor'],
        category: { _id: 'fallback-category-1', title: 'Engine Parts', slug: 'engine-parts' },
        partBrand: { _id: 'fallback-brand-1', name: 'Volkswagen' },
        compatibleVehicles: [{ model: { _id: 'fallback-model-1', name: 'Polo', brand: 'Volkswagen' } }],
        specifications: [{ key: 'Fitment', value: 'VW Polo 1.4' }]
      }
    ];
  }

  private getFallbackCategories(): Category[] {
    return [{ _id: 'fallback-category-1', title: 'Engine Parts', slug: 'engine-parts' }];
  }

  private getFallbackBrands(): Brand[] {
    return [{ _id: 'fallback-brand-1', name: 'Volkswagen' }];
  }

  private getFallbackCarModels(): CarModel[] {
    return [{ _id: 'fallback-model-1', name: 'Polo', brand: { _id: 'fallback-brand-1', name: 'Volkswagen' } }];
  }

  async ngOnInit() {
    try {
      const [products, categories, brands, carModels] = await Promise.all([
        this.sanityService.getProducts(),
        this.sanityService.getCategories(),
        this.sanityService.getBrands(),
        this.sanityService.getCarModels()
      ]);
      
      this.productsSignal.set(products.length > 0 ? products : this.getFallbackProducts());
      this.categoriesSignal.set(categories.length > 0 ? categories : this.getFallbackCategories());
      this.brandsSignal.set(brands.length > 0 ? brands : this.getFallbackBrands());
      this.carModelsSignal.set(carModels.length > 0 ? carModels : this.getFallbackCarModels());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      this.errorMessageSignal.set(message);
      this.productsSignal.set(this.getFallbackProducts());
      this.categoriesSignal.set(this.getFallbackCategories());
      this.brandsSignal.set(this.getFallbackBrands());
      this.carModelsSignal.set(this.getFallbackCarModels());
      console.error('Data fetch error:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolledSignal.set(window.scrollY > 50);
  }

  toggleFilters() {
    this.showMobileFiltersSignal.update(current => !current);
  }

  toggleSpecs(productId: string) {
    this.expandedSpecsSignal.update(current => {
      const newSet = new Set(current);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }

  isSpecsExpanded(productId: string): boolean {
    return this.expandedSpecsSignal().has(productId);
  }

  clearFilters() {
    this.searchQuerySignal.set('');
    this.selectedCategorySignal.set(null);
    this.selectedBrandSignal.set(null);
    this.selectedVehicleModelSignal.set(null);
    this.minPriceSignal.set(null);
    this.maxPriceSignal.set(null);
    this.showSearchSuggestionsSignal.set(false);
  }

  hideSearchSuggestions() {
    window.setTimeout(() => {
      this.showSearchSuggestionsSignal.set(false);
    }, 150);
  }

  applySuggestion(suggestion: { type: 'product' | 'category' | 'brand' | 'carModel'; label: string; value: string }) {
    this.searchQuerySignal.set(suggestion.value);
    this.showSearchSuggestionsSignal.set(false);
  }

  toggleCategoryFilter(categoryTitle: string | null) {
    if (this.selectedCategorySignal() === categoryTitle) {
      this.selectedCategorySignal.set(null);
    } else {
      this.selectedCategorySignal.set(categoryTitle);
    }
  }

  getWhatsAppLink(product: Product): string {
    const phoneNumber = '27XXXXXXXXX';
    const message = `Hi! I am interested in the "${product.name}" (SKU: ${product.sku || 'N/A'}). Is this auto part still available?`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }

  getCustomQuoteLink(): string {
    const phoneNumber = '27XXXXXXXXX';
    const searchQuery = this.searchQuerySignal();
    
    let message = 'Hi! I could not find the part I need in your catalog. Can you help source it for me?';
    if (searchQuery) {
      message += ` I am looking for: ${searchQuery}`;
    }
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }
}