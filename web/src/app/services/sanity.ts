import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SanityService {
  private client: SanityClient;

  constructor() {
    this.client = createClient({
      projectId: environment.sanity.projectId,
      dataset: environment.sanity.dataset,
      apiVersion: environment.sanity.apiVersion,
      useCdn: environment.sanity.useCdn,
    });
  }

  // Fetch all products/car parts along with categories and brands
  async getProducts(): Promise<any[]> {
    const query = `*[_type == "product"] {
      _id,
      name,
      "slug": slug.current,
      sku,
      partNumber,
      price,
      isAvailable,
      condition,
      "image": images[0].asset->url,
      "category": category->title,
      "partBrand": partBrand->name
    }`;
    return await this.client.fetch(query);
  }

  // Fetch only categories to build a filter menu
  async getCategories(): Promise<any[]> {
    const query = `*[_type == "category"] {
      _id,
      title,
      "slug": slug.current
    }`;
    return await this.client.fetch(query);
  }
}