// Unit tests for NegotiationEngine

import { NegotiationEngine, NegotiationResult } from './negotiationEngine';
import { PriceBand, ChatMessage } from '../types';
import { createTestPriceBand, mockProductListing } from '../testUtils';

describe('NegotiationEngine', () => {
  const testPriceBand: PriceBand = createTestPriceBand(30, 50, 40, 85);
  const floorPrice = 35;
  const productName = 'tomato';

  describe('processOffer', () => {
    test('should accept offers at or above floor price', () => {
      const result = NegotiationEngine.processOffer(floorPrice, floorPrice, testPriceBand, 1, productName);
      
      expect(result.accepted).toBe(true);
      expect(result.finalDeal).toBe(true);
      expect(result.message).toContain('accept');
      expect(result.message).toContain('₹35');
    });

    test('should accept offers above floor price', () => {
      const result = NegotiationEngine.processOffer(40, floorPrice, testPriceBand, 1, productName);
      
      expect(result.accepted).toBe(true);
      expect(result.finalDeal).toBe(true);
      expect(result.message).toContain('accept');
      expect(result.message).toContain('₹40');
    });

    test('should reject unreasonably low offers', () => {
      const veryLowOffer = floorPrice * 0.4; // 40% of floor price
      const result = NegotiationEngine.processOffer(veryLowOffer, floorPrice, testPriceBand, 1, productName);
      
      expect(result.accepted).toBe(false);
      expect(result.finalDeal).toBeFalsy();
      expect(result.message).toContain('below the market value');
      expect(result.counterOffer).toBeUndefined();
    });

    test('should generate counter-offers for reasonable but low offers', () => {
      const lowButReasonableOffer = floorPrice * 0.8; // 80% of floor price
      const result = NegotiationEngine.processOffer(lowButReasonableOffer, floorPrice, testPriceBand, 1, productName);
      
      expect(result.accepted).toBe(false);
      expect(result.counterOffer).toBeDefined();
      expect(result.counterOffer!).toBeGreaterThanOrEqual(floorPrice);
      expect(result.message).toContain('₹');
    });

    test('should never counter-offer below floor price', () => {
      const testOffers = [10, 20, 30, 32];
      
      testOffers.forEach(offer => {
        const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, 1, productName);
        
        if (result.counterOffer) {
          expect(result.counterOffer).toBeGreaterThanOrEqual(floorPrice);
        }
      });
    });

    test('should implement progressive negotiation strategy', () => {
      const offer = 30; // Below floor price of 35
      
      const round1 = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, 1, productName);
      const round2 = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, 2, productName);
      const round3 = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, 3, productName);
      
      // Counter-offers should generally decrease over rounds (but never below floor)
      if (round1.counterOffer && round2.counterOffer && round3.counterOffer) {
        expect(round1.counterOffer).toBeGreaterThanOrEqual(round2.counterOffer);
        expect(round2.counterOffer).toBeGreaterThanOrEqual(round3.counterOffer);
        
        // All should be at or above floor price
        expect(round1.counterOffer).toBeGreaterThanOrEqual(floorPrice);
        expect(round2.counterOffer).toBeGreaterThanOrEqual(floorPrice);
        expect(round3.counterOffer).toBeGreaterThanOrEqual(floorPrice);
      }
    });

    test('should end negotiation after maximum rounds', () => {
      const offer = 30; // Below floor price
      const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, 5, productName);
      
      expect(result.accepted).toBe(false);
      expect(result.shouldEnd).toBe(true);
      expect(result.message).toContain('tried my best');
      expect(result.counterOffer).toBeUndefined();
    });

    test('should handle invalid offers', () => {
      const invalidOffers = [0, -10, NaN, Infinity];
      
      invalidOffers.forEach(offer => {
        const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, 1, productName);
        
        expect(result.accepted).toBe(false);
        expect(result.message).toContain('valid offer');
      });
    });

    test('should provide contextual messages for different scenarios', () => {
      // Very low offer
      const veryLow = NegotiationEngine.processOffer(10, floorPrice, testPriceBand, 1, productName);
      expect(veryLow.message).toContain('below the market value');
      
      // Reasonable offer that gets accepted
      const acceptable = NegotiationEngine.processOffer(floorPrice, floorPrice, testPriceBand, 1, productName);
      expect(acceptable.message).toContain('accept');
      
      // Final round rejection
      const finalRound = NegotiationEngine.processOffer(30, floorPrice, testPriceBand, 5, productName);
      expect(finalRound.message).toContain('tried my best');
    });

    test('should handle edge case floor prices', () => {
      // Very low floor price
      const lowFloor = 1;
      const result1 = NegotiationEngine.processOffer(0.5, lowFloor, testPriceBand, 1, productName);
      expect(result1.accepted).toBe(false);
      
      // Very high floor price
      const highFloor = 1000;
      const result2 = NegotiationEngine.processOffer(500, highFloor, testPriceBand, 1, productName);
      if (result2.counterOffer) {
        expect(result2.counterOffer).toBeGreaterThanOrEqual(highFloor);
      }
    });
  });

  describe('createInitialMessage', () => {
    test('should create valid initial chat message', () => {
      const message = NegotiationEngine.createInitialMessage(productName, testPriceBand, 45);
      
      expect(message.id).toBeDefined();
      expect(message.sender).toBe('ai');
      expect(message.message).toContain(productName);
      expect(message.message).toContain('₹45');
      expect(message.timestamp).toBeDefined();
      expect(message.type).toBe('message');
      expect(new Date(message.timestamp)).toBeInstanceOf(Date);
    });

    test('should include product name and listing price in message', () => {
      const listingPrice = 50;
      const message = NegotiationEngine.createInitialMessage('apple', testPriceBand, listingPrice);
      
      expect(message.message).toContain('apple');
      expect(message.message).toContain('₹50');
    });

    test('should create different messages on multiple calls', () => {
      const message1 = NegotiationEngine.createInitialMessage(productName, testPriceBand, 45);
      const message2 = NegotiationEngine.createInitialMessage(productName, testPriceBand, 45);
      
      // Messages should have different IDs
      expect(message1.id).not.toBe(message2.id);
      // Messages might be different due to randomization
    });
  });

  describe('createDealCompletionMessage', () => {
    test('should create valid deal completion message', () => {
      const agreedPrice = 40;
      const message = NegotiationEngine.createDealCompletionMessage(agreedPrice);
      
      expect(message.id).toBeDefined();
      expect(message.sender).toBe('ai');
      expect(message.message).toContain('Congratulations');
      expect(message.message).toContain('₹40');
      expect(message.timestamp).toBeDefined();
      expect(message.type).toBe('message');
    });

    test('should format price correctly in completion message', () => {
      const prices = [100, 1000, 10000];
      
      prices.forEach(price => {
        const message = NegotiationEngine.createDealCompletionMessage(price);
        expect(message.message).toContain(`₹${price.toLocaleString('en-IN')}`);
      });
    });
  });

  describe('Instance methods', () => {
    let engine: NegotiationEngine;

    beforeEach(() => {
      engine = new NegotiationEngine();
    });

    describe('generatePriceAnalysis', () => {
      test('should generate comprehensive price analysis', () => {
        const analysis = engine.generatePriceAnalysis(mockProductListing);
        
        expect(analysis).toContain('Based on current market data');
        expect(analysis).toContain(mockProductListing.location);
        expect(analysis).toContain(mockProductListing.name);
        expect(analysis).toContain('₹');
        expect(analysis).toContain('%');
      });
    });

    describe('shouldContinueNegotiation', () => {
      test('should continue when under max rounds and offer below floor', () => {
        const shouldContinue = engine.shouldContinueNegotiation(3, 30, mockProductListing);
        expect(shouldContinue).toBe(true);
      });

      test('should stop when max rounds reached', () => {
        const shouldContinue = engine.shouldContinueNegotiation(5, 30, mockProductListing);
        expect(shouldContinue).toBe(false);
      });

      test('should stop when offer meets floor price', () => {
        const shouldContinue = engine.shouldContinueNegotiation(2, mockProductListing.floorPrice, mockProductListing);
        expect(shouldContinue).toBe(false);
      });
    });

    describe('getNegotiationStatus', () => {
      test('should provide appropriate status for different scenarios', () => {
        // Deal can be accepted
        const acceptableStatus = engine.getNegotiationStatus(2, mockProductListing.floorPrice, mockProductListing);
        expect(acceptableStatus).toContain('accepted');

        // Final round
        const finalStatus = engine.getNegotiationStatus(4, 30, mockProductListing);
        expect(finalStatus).toContain('Final round');

        // Far from acceptable
        const farStatus = engine.getNegotiationStatus(1, 10, mockProductListing);
        expect(farStatus).toContain('quite far');

        // Getting closer
        const closeStatus = engine.getNegotiationStatus(2, 32, mockProductListing);
        expect(closeStatus).toContain('Getting closer');
      });

      test('should include remaining rounds in status', () => {
        const status = engine.getNegotiationStatus(2, 30, mockProductListing);
        expect(status).toContain('3'); // 5 - 2 = 3 rounds remaining
      });
    });
  });

  describe('Message generation quality', () => {
    test('should generate professional and contextual messages', () => {
      const rounds = [1, 2, 3, 4];
      
      rounds.forEach(round => {
        const result = NegotiationEngine.processOffer(30, floorPrice, testPriceBand, round, productName);
        
        if (result.counterOffer) {
          expect(result.message).toContain('₹');
          expect(result.message.length).toBeGreaterThan(50); // Substantial message
          expect(result.message).not.toContain('undefined');
          expect(result.message).not.toContain('null');
        }
      });
    });

    test('should maintain respectful tone in all messages', () => {
      const scenarios = [
        { offer: 10, round: 1 }, // Very low
        { offer: 30, round: 1 }, // Reasonable but low
        { offer: 35, round: 1 }, // Acceptable
        { offer: 30, round: 5 }  // Final round
      ];

      scenarios.forEach(({ offer, round }) => {
        const result = NegotiationEngine.processOffer(offer, floorPrice, testPriceBand, round, productName);
        
        // Check for respectful language - no offensive words
        expect(result.message).not.toMatch(/stupid|dumb|ridiculous|absurd/i);
        
        // Messages should be professional and polite
        expect(result.message.length).toBeGreaterThan(20);
        expect(result.message).toMatch(/[.!]/); // Should end with punctuation
      });
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle extreme price bands', () => {
      const extremeBand = createTestPriceBand(1, 10000, 5000, 50);
      const result = NegotiationEngine.processOffer(100, 50, extremeBand, 1, productName);
      
      expect(result.accepted).toBe(true); // 100 > 50 floor price
    });

    test('should handle zero and negative floor prices', () => {
      const result1 = NegotiationEngine.processOffer(10, 0, testPriceBand, 1, productName);
      expect(result1.accepted).toBe(true); // Any positive offer > 0 floor

      const result2 = NegotiationEngine.processOffer(10, -5, testPriceBand, 1, productName);
      expect(result2.accepted).toBe(true); // Any positive offer > negative floor
    });

    test('should handle very long product names', () => {
      const longName = 'a'.repeat(100);
      const result = NegotiationEngine.processOffer(30, floorPrice, testPriceBand, 1, longName);
      
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
    });

    test('should handle concurrent negotiations (stateless behavior)', () => {
      // Since methods are static, they should be stateless
      const result1 = NegotiationEngine.processOffer(30, 35, testPriceBand, 1, 'product1');
      const result2 = NegotiationEngine.processOffer(40, 35, testPriceBand, 1, 'product2');
      
      // Results should be independent
      expect(result1.accepted).toBe(false);
      expect(result2.accepted).toBe(true);
    });
  });

  describe('Performance and reliability', () => {
    test('should handle multiple rapid calls without issues', () => {
      const calls = Array.from({ length: 100 }, (_, i) => 
        NegotiationEngine.processOffer(30 + i, floorPrice, testPriceBand, 1, productName)
      );

      calls.forEach((result, i) => {
        expect(result).toBeDefined();
        expect(typeof result.message).toBe('string');
        expect(typeof result.accepted).toBe('boolean');
        
        if (30 + i >= floorPrice) {
          expect(result.accepted).toBe(true);
        }
      });
    });

    test('should be deterministic for same inputs', () => {
      const inputs = [30, floorPrice, testPriceBand, 1, productName] as const;
      
      const result1 = NegotiationEngine.processOffer(...inputs);
      const result2 = NegotiationEngine.processOffer(...inputs);
      
      expect(result1.accepted).toBe(result2.accepted);
      expect(result1.counterOffer).toBe(result2.counterOffer);
      // Note: messages might differ due to randomization, which is acceptable
    });
  });
});