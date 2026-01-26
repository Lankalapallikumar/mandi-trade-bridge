// Unit tests for PricingEngine

import { PricingEngine } from './pricingEngine';
import { PriceBand } from '../types';
import { loadMockPriceData, testProducts, isValidPriceBand, createTestPriceBand } from '../testUtils';

describe('PricingEngine', () => {
  beforeAll(() => {
    // Load mock price data before running tests
    const mockData = loadMockPriceData();
    PricingEngine.loadPriceData(mockData);
  });

  describe('calculateFairPriceBand', () => {
    test('should return valid price band structure', () => {
      const priceBand = PricingEngine.calculateFairPriceBand(
        'tomato',
        'vegetables',
        'mumbai',
        10
      );

      expect(isValidPriceBand(priceBand)).toBe(true);
      expect(priceBand.min).toBeGreaterThan(0);
      expect(priceBand.max).toBeGreaterThanOrEqual(priceBand.min);
      expect(priceBand.recommended).toBeGreaterThanOrEqual(priceBand.min);
      expect(priceBand.recommended).toBeLessThanOrEqual(priceBand.max);
    });

    test('should apply location factors correctly', () => {
      const mumbaiPrice = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', 1);
      const nashikPrice = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'nashik', 1);

      // Mumbai should be more expensive than Nashik (factor 1.3 vs 0.8)
      expect(mumbaiPrice.recommended).toBeGreaterThan(nashikPrice.recommended);
      expect(mumbaiPrice.min).toBeGreaterThan(nashikPrice.min);
      expect(mumbaiPrice.max).toBeGreaterThan(nashikPrice.max);
    });

    test('should apply seasonal factors correctly', () => {
      // Test with peak season month (June = 6)
      const peakPrice = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', 1, 6);
      // Test with low season month (December = 12)
      const lowPrice = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', 1, 12);

      // Peak season should be more expensive than low season
      expect(peakPrice.recommended).toBeGreaterThan(lowPrice.recommended);
    });

    test('should apply bulk discounts correctly', () => {
      const smallQuantity = PricingEngine.calculateFairPriceBand('onion', 'vegetables', 'mumbai', 5);
      const bulkQuantity = PricingEngine.calculateFairPriceBand('onion', 'vegetables', 'mumbai', 50);

      // Bulk quantity should be cheaper per unit
      expect(bulkQuantity.recommended).toBeLessThan(smallQuantity.recommended);
      expect(bulkQuantity.max).toBeLessThan(smallQuantity.max);
    });

    test('should handle unknown products gracefully', () => {
      const priceBand = PricingEngine.calculateFairPriceBand('unknown-product', 'unknown-category', 'mumbai', 1);

      expect(isValidPriceBand(priceBand)).toBe(true);
      expect(priceBand.confidence).toBeLessThan(50); // Should have low confidence
    });

    test('should handle unknown locations gracefully', () => {
      const priceBand = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'unknown-city', 1);

      expect(isValidPriceBand(priceBand)).toBe(true);
      // Should still work with default location factor of 1.0
    });

    test('should calculate confidence scores correctly', () => {
      // Known product with location data should have high confidence
      const knownProduct = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', 1);
      expect(knownProduct.confidence).toBeGreaterThan(80);

      // Unknown product should have low confidence
      const unknownProduct = PricingEngine.calculateFairPriceBand('unknown', 'unknown', 'mumbai', 1);
      expect(unknownProduct.confidence).toBeLessThan(50);
    });

    test('should ensure confidence scores are within 0-100 range', () => {
      const testCases = [
        ['tomato', 'vegetables', 'mumbai'],
        ['rice', 'grains', 'delhi'],
        ['apple', 'fruits', 'bangalore'],
        ['unknown', 'unknown', 'unknown']
      ];

      testCases.forEach(([product, category, location]) => {
        const priceBand = PricingEngine.calculateFairPriceBand(product, category, location, 1);
        expect(priceBand.confidence).toBeGreaterThanOrEqual(0);
        expect(priceBand.confidence).toBeLessThanOrEqual(100);
      });
    });

    test('should handle edge case quantities', () => {
      // Test with quantity 0
      const zeroQuantity = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', 0);
      expect(isValidPriceBand(zeroQuantity)).toBe(true);

      // Test with very large quantity
      const largeQuantity = PricingEngine.calculateFairPriceBand('rice', 'grains', 'mumbai', 1000);
      expect(isValidPriceBand(largeQuantity)).toBe(true);
    });

    test('should handle different months correctly', () => {
      const months = [1, 6, 12];
      months.forEach(month => {
        const priceBand = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', 1, month);
        expect(isValidPriceBand(priceBand)).toBe(true);
      });
    });
  });

  describe('getPriceExplanation', () => {
    test('should provide meaningful explanation for known products', () => {
      const explanation = PricingEngine.getPriceExplanation('tomato', 'vegetables', 'mumbai', 10);
      
      expect(explanation).toContain('tomato');
      expect(explanation).toContain('₹');
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(20);
    });

    test('should handle unknown products in explanation', () => {
      const explanation = PricingEngine.getPriceExplanation('unknown', 'unknown', 'mumbai', 1);
      
      expect(explanation).toContain('Limited information');
      expect(typeof explanation).toBe('string');
    });

    test('should mention location factors when applicable', () => {
      const explanation = PricingEngine.getPriceExplanation('tomato', 'vegetables', 'mumbai', 1);
      
      // Mumbai has a location factor, so it should be mentioned
      expect(explanation.toLowerCase()).toContain('mumbai');
    });

    test('should mention bulk discounts when applicable', () => {
      const explanation = PricingEngine.getPriceExplanation('onion', 'vegetables', 'mumbai', 50);
      
      // Should mention bulk discount for large quantity
      expect(explanation.toLowerCase()).toContain('bulk');
    });
  });

  describe('getPriceAnalysisExplanation', () => {
    test('should provide comprehensive analysis explanation', () => {
      const priceBand = createTestPriceBand(30, 50, 40, 85);
      const analysis = PricingEngine.getPriceAnalysisExplanation(
        'tomato', 'vegetables', 'mumbai', 10, priceBand
      );

      expect(analysis).toContain('AI Analysis');
      expect(analysis).toContain('Confidence level');
      expect(analysis).toContain('85%');
      expect(typeof analysis).toBe('string');
    });
  });

  describe('isPriceReasonable', () => {
    test('should identify reasonable prices correctly', () => {
      const priceBand = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', 1);
      
      // Price within band should be reasonable
      const reasonableResult = PricingEngine.isPriceReasonable(
        priceBand.recommended, 'tomato', 'vegetables', 'mumbai', 1
      );
      expect(reasonableResult.reasonable).toBe(true);
      expect(reasonableResult.explanation).toContain('fair market range');
    });

    test('should identify unreasonable high prices', () => {
      const result = PricingEngine.isPriceReasonable(1000, 'tomato', 'vegetables', 'mumbai', 1);
      expect(result.reasonable).toBe(false);
      expect(result.explanation).toContain('above market value');
    });

    test('should identify unreasonable low prices', () => {
      const result = PricingEngine.isPriceReasonable(1, 'tomato', 'vegetables', 'mumbai', 1);
      expect(result.reasonable).toBe(false);
      expect(result.explanation).toContain('below market value');
    });

    test('should handle slightly off-range prices appropriately', () => {
      const priceBand = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', 1);
      
      // Slightly below range
      const slightlyLow = PricingEngine.isPriceReasonable(
        priceBand.min * 0.9, 'tomato', 'vegetables', 'mumbai', 1
      );
      expect(slightlyLow.reasonable).toBe(true);
      expect(slightlyLow.explanation).toContain('good deal');

      // Slightly above range
      const slightlyHigh = PricingEngine.isPriceReasonable(
        priceBand.max * 1.1, 'tomato', 'vegetables', 'mumbai', 1
      );
      expect(slightlyHigh.reasonable).toBe(false);
      expect(slightlyHigh.explanation).toContain('consider negotiating');
    });
  });

  describe('Error handling', () => {
    test('should handle invalid inputs gracefully', () => {
      // Test with null/undefined inputs
      const result1 = PricingEngine.calculateFairPriceBand('', '', '', 0);
      expect(isValidPriceBand(result1)).toBe(true);

      // Test with negative quantity
      const result2 = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', 'mumbai', -5);
      expect(isValidPriceBand(result2)).toBe(true);
    });

    test('should never return negative prices', () => {
      const testCases = [
        ['tomato', 'vegetables', 'mumbai', 1],
        ['rice', 'grains', 'delhi', 50],
        ['unknown', 'unknown', 'unknown', 1]
      ];

      testCases.forEach(([product, category, location, quantity]) => {
        const priceBand = PricingEngine.calculateFairPriceBand(product, category, location, quantity as number);
        expect(priceBand.min).toBeGreaterThan(0);
        expect(priceBand.max).toBeGreaterThan(0);
        expect(priceBand.recommended).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration with mock data', () => {
    test('should work with all products in mock data', () => {
      const mockData = loadMockPriceData();
      
      mockData.forEach(product => {
        const priceBand = PricingEngine.calculateFairPriceBand(
          product.product,
          product.category,
          'mumbai',
          1
        );
        
        expect(isValidPriceBand(priceBand)).toBe(true);
        expect(priceBand.confidence).toBeGreaterThan(70); // Should have good confidence for known products
      });
    });

    test('should handle all cities in mock data', () => {
      const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'pune', 'hyderabad'];
      
      cities.forEach(city => {
        const priceBand = PricingEngine.calculateFairPriceBand('tomato', 'vegetables', city, 1);
        expect(isValidPriceBand(priceBand)).toBe(true);
      });
    });
  });
});