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

  // Fetch all products/car parts along with categories, brands, and extended data
  async getProducts(): Promise<any[]> {
    const query = `*[_type == "product"] {
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

  // Fetch all part brands for filtering
  async getBrands(): Promise<any[]> {
    const query = `*[_type == "brand"] {
      _id,
      name,
      "logo": logo.asset->url
    }`;
    return await this.client.fetch(query);
  }

  // Fetch all car models for vehicle filtering
  async getCarModels(): Promise<any[]> {
    const query = `*[_type == "carModel"] {
      _id,
      name,
      "brand": brand->{
        _id,
        name
      }
    }`;
    return await this.client.fetch(query);
  }
}