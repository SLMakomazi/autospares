import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('matches products by category, brand, and car model in the search query', () => {
    const app = new App({} as any);
    app.productsSignal.set([
      {
        _id: 'p1',
        name: 'Brake Pad',
        slug: 'brake-pad',
        isAvailable: true,
        condition: 'New',
        images: [],
        category: { _id: 'c1', title: 'Brakes', slug: 'brakes' },
        partBrand: { _id: 'b1', name: 'Bosch' },
        compatibleVehicles: [{ model: { _id: 'm1', name: 'Civic', brand: 'Honda' } }]
      }
    ] as any);
    app.categoriesSignal.set([{ _id: 'c1', title: 'Brakes', slug: 'brakes' }]);

    app.searchQuerySignal.set('brakes');
    expect(app.filteredProductsSignal().map(product => product._id)).toEqual(['p1']);

    app.searchQuerySignal.set('bosch');
    expect(app.filteredProductsSignal().map(product => product._id)).toEqual(['p1']);

    app.searchQuerySignal.set('civic');
    expect(app.filteredProductsSignal().map(product => product._id)).toEqual(['p1']);
  });

  it('suggests matching categories, brands, and car models while typing', () => {
    const app = new App({} as any);
    app.productsSignal.set([
      {
        _id: 'p1',
        name: 'Brake Pad',
        slug: 'brake-pad',
        isAvailable: true,
        condition: 'New',
        images: [],
        category: { _id: 'c1', title: 'Brakes', slug: 'brakes' },
        partBrand: { _id: 'b1', name: 'Bosch' },
        compatibleVehicles: [{ model: { _id: 'm1', name: 'Civic', brand: 'Honda' } }]
      }
    ] as any);
    app.categoriesSignal.set([{ _id: 'c1', title: 'Brakes', slug: 'brakes' }]);

    app.searchQuerySignal.set('br');
    const suggestions = app.searchSuggestionsSignal();
    expect(suggestions.some(suggestion => suggestion.type === 'category' && suggestion.label === 'Brakes')).toBeTrue();
    expect(suggestions.some(suggestion => suggestion.type === 'brand' && suggestion.label === 'Bosch')).toBeTrue();
    expect(suggestions.some(suggestion => suggestion.type === 'carModel' && suggestion.label === 'Honda Civic')).toBeTrue();
  });
});
