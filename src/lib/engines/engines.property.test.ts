// Property-based testing concepts for AI engines
// These tests validate universal properties that should hold across all inputs

import { PricingEngine } from './pricingEngine';
import { NegotiationEngine } from './negotiationEngine';
import { loadMockPriceData, createTestPriceBand } from '../testUtils';

describe('AI Engines - Property-Based Tests', () => {
  beforeAll(() => {
    const mockData = loadMockPriceData();
    PricingEngine.loadPriceData(mockData);
  });

  describe('PricingEngine Properties', () => {
    // Property: Price bands should always be well-formed
    test('Property: Price bands are always well-formed regardless of input', () => {
      const testInputs = [
        ['tomato', 'vegetables', 'mumbai', 1],
        ['rice', 'grains', 'delhi', 50],
        ['apple', 'fruits', 'bangalore', 10],
        ['unknown', 'unknown', 'unknown', 0],
        ['', '', '', -5],
        ['very-long-product-name-that-exceeds-normal-length', 'category', 'city', 1000]
      ];

      testInputs.forEach(([product, category, location, quantity]) => {
        const priceBand = PricingEngine.calculateFairPriceBand(
          product as string, 
          category as string, 
          location as string, 
          quantity as number
        );

        // Universal properties that must always hold
        expect(priceBand.min).toBeGreaterThan(0);
        expect(priceBand.max).toBeGreaterThanOrEqual(priceBand.min);
        expect(priceBand.recommended).toBeGreaterThanOrEqual(priceBand.min);
        expect(priceBand.recommended).toBeLessThanOrEqual(priceBand.max);
        expect(priceBand.confidence).toBeGreaterThanOrEqual(0);
        expect(priceBand.confidence).toBeLessThanOrEqual(100);
        expect(Number.isInteger(priceBand.confidence)).toBe(true);
      });
    });

    // Property: Location factors should affect prices consistently
    test('Property: Higher location factors always result in higher prices', () => {
      const product = 'tomato';
      const category = 'vegetables';
      const quantity = 10;

      const cities = [
        { name: 'nashik', expectedFactor: 0.8 },    // Lower cost
        { name: 'mumbai', expectedFactor: 1.3 },    // Higher cost
        { name: 'delhi', expectedFactor: 1.2 }      // Medium-high cost
      ];

      const prices = cities.map(city => ({
        city: city.name,
        factor: city.expectedFactor,
        priceBand: PricingEngine.calculateFairPriceBand(product, category, city.name, quantity)
      }));

      // Sort by expected factor
      prices.sort((a, b) => a.factor - b.factor);

      // Property: Prices should increase with location factors
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i].priceBand.recommended).toBeGreaterThan(prices[i-1].priceBand.recommended);
        expect(prices[i].priceBand.min).toBeGreaterThan(prices[i-1].priceBand.min);
        expect(prices[i].priceBand.max).toBeGreaterThan(prices[i-1].priceBand.max);
      }
    });

    // Property: Bulk discounts should never increase prices
    test('Property: Larger quantities never result in higher per-unit prices', () => {
      const product = 'rice';
      const category = 'grains';
      const location = 'mumbai';

      const quantities = [1, 10, 25, 50, 100];
      const priceBands = quantities.map(qty => ({
        quantity: qty,
        priceBand: PricingEngine.calculateFairPriceBand(product, category, location, qty)
      }));

      // Property: Price should not increase with quantity (bulk discounts)
      for (let i = 1; i < priceBands.length; i++) {
        expect(priceBands[i].priceBand.recommended).toBeLessThanOrEqual(priceBands[i-1].priceBand.recommended);
      }
    });

    // Property: Confidence scores should be consistent
    test('Property: Known products have higher confidence than unknown products', () => {
      const knownProducts = [
        ['tomato', 'vegetables', 'mumbai'],
        ['rice', 'grains', 'delhi'],
        ['apple', 'fruits', 'bangalore']
      ];

      const unknownProducts = [
        ['unknown-product', 'unknown-category', 'mumbai'],
        ['fake-item', 'non-existent', 'delhi'],
        ['', '', 'bangalore']
      ];

      const knownConfidences = knownProducts.map(([product, category, location]) => 
        PricingEngine.calculateFairPriceBand(product, category, location, 1).confidence
      );

      const unknownConfidences = unknownProducts.map(([product, category, location]) => 
        PricingEngine.calculateFairPriceBand(product, category, location, 1).confidence
      );

      const avgKnownConfidence = knownConfidences.reduce((a, b) => a + b, 0) / knownConfidences.length;
      const avgUnknownConfidence = unknownConfidences.reduce((a, b) => a + b, 0) / unknownConfidences.length;

      // Property: Known products should have higher average confidence
      expect(avgKnownConfidence).toBeGreaterThan(avgUnknownConfidence);
    });
  });

  describe('NegotiationEngine Properties', () => {
    const testPriceBand = createTestPriceBand(30, 50, 40, 85);
    const floorPrice = 35;

    // Property: Counter-offers should never go below floor price
    test('Property: Counter-offers are never below floor price', () => {
      const testOffers = [10, 15, 20, 25, 30, 32, 34];
      const testRounds = [1, 2, 3, 4];

      testOffers.forEach(offer => {
        testRounds.forEach(round => {
          const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, round, 'product');
          
          if (result.counterOffer !== undefined) {
            expect(result.counterOffer).toBeGreaterThanOrEqual(floorPrice);
          }
        });
      });
    });

    // Property: Offers at or above floor price are always accepted
    test('Property: Offers at or above floor price are always accepted', () => {
      const acceptableOffers = [35, 36, 40, 45, 50, 100, 1000];
      
      acceptableOffers.forEach(offer => {
        const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, 1, 'product');
        expect(result.accepted).toBe(true);
        expect(result.finalDeal).toBe(true);
      });
    });

    // Property: Progressive negotiation - counter-offers should decrease over rounds
    test('Property: Counter-offers decrease or stay same over negotiation rounds', () => {
      const offer = 30; // Below floor price
      const rounds = [1, 2, 3, 4];
      
      const counterOffers = rounds.map(round => {
        const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, round, 'product');
        return result.counterOffer || floorPrice;
      });

      // Property: Each counter-offer should be <= previous (progressive concession)
      for (let i = 1; i < counterOffers.length; i++) {
        expect(counterOffers[i]).toBeLessThanOrEqual(counterOffers[i-1]);
      }
    });

    // Property: Negotiation should end after maximum rounds
    test('Property: Negotiation ends after maximum rounds with unacceptable offers', () => {
      const lowOffer = 20; // Well below floor price
      const maxRounds = 5;
      
      const result = NegotiationEngine.processOffer(lowOffer, floorPrice, testPriceBand, maxRounds, 'product');
      
      expect(result.accepted).toBe(false);
      expect(result.shouldEnd).toBe(true);
      expect(result.counterOffer).toBeUndefined();
    });

    // Property: Invalid offers are always rejected
    test('Property: Invalid offers are always rejected with helpful message', () => {
      const invalidOffers = [0, -10, -100, NaN, Infinity, -Infinity];
      
      invalidOffers.forEach(offer => {
        const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, 1, 'product');
        
        expect(result.accepted).toBe(false);
        expect(result.message).toContain('valid offer');
        expect(result.counterOffer).toBeUndefined();
      });
    });

    // Property: Messages are always non-empty strings
    test('Property: All negotiation messages are meaningful non-empty strings', () => {
      const testScenarios = [
        { offer: 10, round: 1 },   // Very low
        { offer: 30, round: 1 },   // Below floor
        { offer: 35, round: 1 },   // At floor
        { offer: 50, round: 1 },   // Above floor
        { offer: 0, round: 1 },    // Invalid
        { offer: 30, round: 5 }    // Final round
      ];

      testScenarios.forEach(({ offer, round }) => {
        const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, round, 'product');
        
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(10);
        expect(result.message.trim()).toBe(result.message); // No leading/trailing whitespace
        expect(result.message).not.toContain('undefined');
        expect(result.message).not.toContain('null');
      });
    });

    // Property: Negotiation is deterministic for same inputs
    test('Property: Same inputs produce same negotiation results', () => {
      const testCases = [
        { offer: 30, floor: 35, round: 1 },
        { offer: 35, floor: 35, round: 1 },
        { offer: 25, floor: 40, round: 3 }
      ];

      testCases.forEach(({ offer, floor, round }) => {
        const result1 = NegotiationEngine.processOffer(offer, floor, testPriceBand, round, 'product');
        const result2 = NegotiationEngine.processOffer(offer, floor, testPriceBand, round, 'product');

        expect(result1.accepted).toBe(result2.accepted);
        expect(result1.counterOffer).toBe(result2.counterOffer);
        expect(result1.finalDeal).toBe(result2.finalDeal);
        expect(result1.shouldEnd).toBe(result2.shouldEnd);
        // Note: Messages might differ due to randomization, which is acceptable
      });
    });
  });

  describe('Cross-Engine Integration Properties', () => {
    // Property: Pricing and negotiation engines work together consistently
    test('Property: Negotiation respects pricing engine recommendations', () => {
      const products = [
        { name: 'tomato', category: 'vegetables', location: 'mumbai', quantity: 10, floor: 35 },
        { name: 'rice', category: 'grains', location: 'delhi', quantity: 25, floor: 55 }
      ];

      products.forEach(product => {
        const priceBand = PricingEngine.calculateFairPriceBand(
          product.name, product.category, product.location, product.quantity
        );

        // Test negotiation with pricing recommendations
        const lowOffer = priceBand.min * 0.8;
        const fairOffer = priceBand.recommended;
        const highOffer = priceBand.max * 1.2;

        const lowResult = NegotiationEngine.processOffer(lowOffer, product.floor, priceBand, 1, product.name);
        const fairResult = NegotiationEngine.processOffer(fairOffer, product.floor, priceBand, 1, product.name);
        const highResult = NegotiationEngine.processOffer(highOffer, product.floor, priceBand, 1, product.name);

        // Property: Fair offers within price band should be more likely to be accepted
        if (fairOffer >= product.floor) {
          expect(fairResult.accepted).toBe(true);
        }

        // Property: High offers should always be accepted if above floor
        if (highOffer >= product.floor) {
          expect(highResult.accepted).toBe(true);
        }
      });
    });

    // Property: System maintains consistency across multiple operations
    test('Property: Multiple pricing calculations are consistent', () => {
      const product = 'tomato';
      const category = 'vegetables';
      const location = 'mumbai';
      const quantity = 10;

      // Calculate same price band multiple times
      const calculations = Array.from({ length: 10 }, () => 
        PricingEngine.calculateFairPriceBand(product, category, location, quantity)
      );

      // Property: All calculations should return identical results
      const first = calculations[0];
      calculations.forEach(calc => {
        expect(calc.min).toBe(first.min);
        expect(calc.max).toBe(first.max);
        expect(calc.recommended).toBe(first.recommended);
        expect(calc.confidence).toBe(first.confidence);
      });
    });
  });
});