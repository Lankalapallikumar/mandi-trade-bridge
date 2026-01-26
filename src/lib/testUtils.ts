// Test utilities for LocalTrade Bridge

import { PriceData } from './types';
import mockPricesData from '../data/mockPrices.json';

// Convert mock prices JSON to PriceData array format
export function loadMockPriceData(): PriceData[] {
  const priceData: PriceData[] = [];
  
  Object.entries(mockPricesData.categories).forEach(([categoryName, products]) => {
    Object.entries(products).forEach(([productName, productInfo]) => {
      const locationFactors = Object.entries((productInfo as any).locationFactors || {}).map(([city, factor]) => ({
        city,
        factor: factor as number
      }));

      const seasonalFactors = (productInfo as any).seasonality ? 
        Object.entries((productInfo as any).seasonality).flatMap(([type, months]) => 
          (months as number[]).map(month => ({
            month,
            factor: type === 'peak' ? 1.2 : type === 'low' ? 0.8 : 1.0
          }))
        ) : [];

      const bulkDiscounts = (productInfo as any).bulkDiscounts ? 
        Object.entries((productInfo as any).bulkDiscounts).map(([minQty, discount]) => ({
          minQuantity: parseInt(minQty),
          discountPercentage: discount as number * 100 // Convert to percentage
        })) : [];

      priceData.push({
        product: productName,
        category: categoryName,
        basePrice: productInfo.basePrice,
        unit: productInfo.unit,
        locationFactors,
        seasonalFactors,
        bulkDiscounts
      });
    });
  });

  return priceData;
}

// Test data generators
export const testProducts = {
  tomato: {
    name: 'tomato',
    category: 'vegetables',
    location: 'mumbai',
    quantity: 10,
    floorPrice: 35
  },
  rice: {
    name: 'rice',
    category: 'grains', 
    location: 'delhi',
    quantity: 25,
    floorPrice: 55
  },
  apple: {
    name: 'apple',
    category: 'fruits',
    location: 'bangalore',
    quantity: 5,
    floorPrice: 100
  }
};

// Mock product listing for testing
export const mockProductListing = {
  id: 'test-product-1',
  name: 'Fresh Tomatoes',
  description: 'Premium quality tomatoes',
  category: 'Vegetables',
  quantity: 50,
  unit: 'kg',
  listingPrice: 45,
  floorPrice: 35,
  location: 'Mumbai',
  vendorName: 'Test Vendor',
  vendorContact: '9876543210',
  createdAt: new Date().toISOString()
};

// Helper to create price bands for testing
export function createTestPriceBand(min: number, max: number, recommended: number, confidence: number) {
  return { min, max, recommended, confidence };
}

// Helper to validate price band structure
export function isValidPriceBand(priceBand: any): boolean {
  return (
    typeof priceBand === 'object' &&
    typeof priceBand.min === 'number' &&
    typeof priceBand.max === 'number' &&
    typeof priceBand.recommended === 'number' &&
    typeof priceBand.confidence === 'number' &&
    priceBand.min > 0 &&
    priceBand.max >= priceBand.min &&
    priceBand.recommended >= priceBand.min &&
    priceBand.recommended <= priceBand.max &&
    priceBand.confidence >= 0 &&
    priceBand.confidence <= 100
  );
}