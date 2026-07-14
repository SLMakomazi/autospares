import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SanityService } from './services/sanity';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = true;
  errorMessage: string | null = null; // To display errors on screen

  constructor(private sanityService: SanityService) {}

  async ngOnInit() {
    console.log('AppComponent initialized. Fetching data from Sanity...');
    try {
      this.products = await this.sanityService.getProducts();
      console.log('Products loaded successfully:', this.products);

      this.categories = await this.sanityService.getCategories();
      console.log('Categories loaded successfully:', this.categories);
    } catch (error: any) {
      console.error('CRITICAL ERROR fetching from Sanity:', error);
      this.errorMessage = error.message || 'Unknown connection error';
    } finally {
      this.loading = false;
    }
  }

  getWhatsAppLink(product: any): string {
    const phoneNumber = '27XXXXXXXXX';
    const message = `Hi! I am interested in the "${product.name}" (SKU: ${product.sku || 'N/A'}). Is this auto part still available?`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }
}