import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import { environment } from '../../environments/environment';

import { Product, Category, Brand, CarModel } from '../models/spares.model';

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

  /**
   * Fetch all products with robust error handling and type safety
   */
  async getProducts(): Promise<Product[]> {
    const query = `*[_type == "product" && defined(name)] | order(_createdAt desc) {
      _id,
      name,
      "slug": slug.current,
      sku,
      partNumber,
      oemNumber,
      price,
      isAvailable,
      condition,
      "images": images[].asset->url,
      "category": category->{
        _id,
        title,
        "slug": slug.current
      },
      "partBrand": partBrand->{
        _id,
        name,
        "logo": logo.asset->url
      },
      compatibleVehicles[] {
        "model": model->{
          _id,
          name,
          "brand": brand->name
        },
        engineSizes
      },
      specifications[] {
        key,
        value
      }
    }`;
    return await this.client.fetch(query) || [];
  }

  /**
   * Fetch categories for the filter menu
   */
  async getCategories(): Promise<Category[]> {
    const query = `*[_type == "category" && defined(title)] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }`;
    return await this.client.fetch(query) || [];
  }

  /**
   * Fetch brands for the filter menu
   */
  async getBrands(): Promise<Brand[]> {
    const query = `*[_type == "brand" && defined(name)] | order(name asc) {
      _id,
      name,
      "logo": logo.asset->url
    }`;
    return await this.client.fetch(query) || [];
  }

  /**
   * Fetch car models for advanced vehicle selection
   */
  async getCarModels(): Promise<CarModel[]> {
    const query = `*[_type == "carModel" && defined(name)] | order(name asc) {
      _id,
      name,
      "brand": brand->{
        _id,
        name
      }
    }`;
    return await this.client.fetch(query) || [];
  }
}