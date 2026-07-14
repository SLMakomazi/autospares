import { Component, OnInit, HostListener, signal, computed, WritableSignal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanityService } from './services/sanity';
import { Product, Category, Brand, Specification, CompatibleVehicle } from './models/spares.model';

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
  readonly loadingSignal = signal<boolean>(true);
  readonly errorMessageSignal = signal<string | null>(null);

  // Filter signals
  readonly searchQuerySignal = signal<string>('');
  readonly selectedCategorySignal = signal<string | null>(null);
  readonly selectedBrandSignal = signal<string | null>(null);
  readonly selectedVehicleModelSignal = signal<string | null>(null);
  readonly minPriceSignal = signal<number | null>(null);
  readonly maxPriceSignal = signal<number | null>(null);

  // UI state signals
  readonly isScrolledSignal = signal<boolean>(false);
  readonly showMobileFiltersSignal = signal<boolean>(false);
  readonly expandedSpecsSignal = signal<Set<string>>(new Set());

  // Computed filtered products signal
  readonly filteredProductsSignal = computed(() => {
    const products = this.productsSignal();
    const searchQuery = this.searchQuerySignal();
    const selectedCategory = this.selectedCategorySignal();
    const selectedBrand = this.selectedBrandSignal();
    const selectedVehicleModel = this.selectedVehicleModelSignal();
    const minPrice = this.minPriceSignal();
    const maxPrice = this.maxPriceSignal();

    return products.filter(product => {
      // Text search - null-safe
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name?.toLowerCase().includes(query) ||
          (product.sku && product.sku.toLowerCase().includes(query)) ||
          (product.partNumber && product.partNumber.toLowerCase().includes(query)) ||
          (product.oemNumber && product.oemNumber.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter - null-safe
      if (selectedCategory && (!product.category || product.category.title !== selectedCategory)) {
        return false;
      }

      // Brand filter - null-safe
      if (selectedBrand && (!product.partBrand || product.partBrand.name !== selectedBrand)) {
        return false;
      }

      // Vehicle filter - null-safe
      if (selectedVehicleModel) {
        if (!product.compatibleVehicles || product.compatibleVehicles.length === 0) {
          return false;
        }
        
        const matchesVehicle = product.compatibleVehicles.some(vehicle => {
          return vehicle.model?.name === selectedVehicleModel;
        });
        
        if (!matchesVehicle) return false;
      }

      // Price filter - null-safe
      if (minPrice !== null && (!product.price || product.price < minPrice)) {
        return false;
      }
      if (maxPrice !== null && (!product.price || product.price > maxPrice)) {
        return false;
      }

      return true;
    });
  });

  // Computed unique vehicle models signal
  readonly vehicleModelsSignal = computed(() => {
    const products = this.productsSignal();
    const models = new Set<string>();
    
    products.forEach(product => {
      product.compatibleVehicles?.forEach(vehicle => {
        if (vehicle.model?.name) {
          models.add(vehicle.model.name);
        }
      });
    });
    
    return Array.from(models).sort();
  });

  constructor(private sanityService: SanityService) {}

  async ngOnInit() {
    try {
      const products = await this.sanityService.getProducts();
      this.productsSignal.set(products);

      const categories = await this.sanityService.getCategories();
      this.categoriesSignal.set(categories);

      const brands = await this.sanityService.getBrands();
      this.brandsSignal.set(brands);
    } catch (error: any) {
      this.errorMessageSignal.set(error.message || 'Unknown connection error');
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
  }

  getWhatsAppLink(product: Product): string {
    const phoneNumber = '27XXXXXXXXX';
    const message = `Hi! I am interested in the "${product.name}" (SKU: ${product.sku || 'N/A'}). Is this auto part still available?`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }

  getCustomQuoteLink(): string {
    const phoneNumber = '27XXXXXXXXX';
    const searchQuery = this.searchQuerySignal();
    const selectedBrand = this.selectedBrandSignal();
    const selectedVehicleModel = this.selectedVehicleModelSignal();
    
    let message = 'Hi! I could not find the part I need in your catalog. Can you help source it for me?';
    if (searchQuery) {
      message += ` I am looking for: ${searchQuery}`;
    }
    if (selectedBrand) {
      message += ` Brand: ${selectedBrand}`;
    }
    if (selectedVehicleModel) {
      message += ` Model: ${selectedVehicleModel}`;
    }
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }
}