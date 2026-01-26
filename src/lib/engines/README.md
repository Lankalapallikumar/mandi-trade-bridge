# AI Engines Test Suite

This directory contains comprehensive unit tests for the LocalTrade Bridge AI engines, covering both **PricingEngine** and **NegotiationEngine** functionality.

## Test Coverage

### PricingEngine Tests (`pricingEngine.test.ts`)

**Core Functionality:**
- ✅ Price band calculation with various inputs
- ✅ Location factor applications (Mumbai vs Nashik pricing)
- ✅ Seasonal factor adjustments (peak vs low season)
- ✅ Bulk discount calculations
- ✅ Confidence score generation (0-100 range)
- ✅ Unknown product handling with fallback pricing
- ✅ Price reasonableness validation

**Edge Cases:**
- ✅ Invalid inputs (empty strings, negative quantities)
- ✅ Unknown locations and products
- ✅ Extreme quantities (0, 1000+)
- ✅ Different seasonal months
- ✅ Error handling and graceful degradation

**Integration:**
- ✅ Mock data integration with all product categories
- ✅ Multi-city price calculations
- ✅ Explanation generation for price recommendations

### NegotiationEngine Tests (`negotiationEngine.test.ts`)

**Core Functionality:**
- ✅ Offer processing and acceptance logic
- ✅ Counter-offer generation with progressive strategy
- ✅ Floor price protection (never goes below vendor minimum)
- ✅ Multi-round negotiation handling
- ✅ Deal completion and rejection scenarios
- ✅ Message generation for different contexts

**Edge Cases:**
- ✅ Invalid offers (0, negative, NaN, Infinity)
- ✅ Extreme floor prices (very low/high)
- ✅ Maximum round limits (5 rounds)
- ✅ Unreasonably low offers (< 50% of floor)
- ✅ Concurrent negotiation handling (stateless behavior)

**Quality Assurance:**
- ✅ Professional message tone validation
- ✅ Message content quality (length, punctuation)
- ✅ Deterministic behavior for same inputs
- ✅ Performance with rapid multiple calls

### Property-Based Tests (`engines.property.test.ts`)

**Universal Properties:**
- ✅ Price bands are always well-formed (min ≤ recommended ≤ max)
- ✅ Confidence scores always within 0-100 range
- ✅ Location factors consistently affect pricing
- ✅ Bulk discounts never increase per-unit prices
- ✅ Counter-offers never go below floor price
- ✅ Offers at/above floor price always accepted
- ✅ Progressive negotiation (decreasing counter-offers)
- ✅ Invalid offers always rejected appropriately

**Cross-Engine Integration:**
- ✅ Pricing and negotiation engines work together
- ✅ Multiple calculations return consistent results
- ✅ System maintains data integrity across operations

## Test Statistics

- **Total Test Suites:** 3
- **Total Tests:** 65
- **Coverage:** High coverage of critical business logic
- **Test Types:** Unit tests, Integration tests, Property-based tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Data

Tests use realistic mock data including:
- **50+ products** across 6 categories (vegetables, fruits, grains, spices, dairy, pulses)
- **12+ Indian cities** with location-specific pricing factors
- **Seasonal variations** for agricultural products
- **Bulk discount structures** for wholesale scenarios
- **Quality grades** and product varieties

## Key Test Scenarios

### Pricing Engine Scenarios
1. **Mumbai Tomatoes (Peak Season):** Tests high-cost city with seasonal premium
2. **Nashik Onions (Bulk Order):** Tests low-cost region with bulk discounts
3. **Delhi Rice (Standard):** Tests metro pricing with grain-specific factors
4. **Unknown Products:** Tests fallback pricing with low confidence scores

### Negotiation Engine Scenarios
1. **Reasonable Negotiation:** Buyer offers 80% of floor, AI counters progressively
2. **Immediate Acceptance:** Buyer meets floor price, deal completed instantly
3. **Unreasonable Offers:** Very low offers rejected with educational messaging
4. **Maximum Rounds:** Negotiation ends after 5 rounds with final rejection

## Quality Assurance

### Message Quality Standards
- All AI messages are professional and respectful
- Messages contain proper currency formatting (₹ symbol)
- No offensive or inappropriate language
- Contextual explanations for pricing decisions
- Clear reasoning for counter-offers and rejections

### Data Integrity Checks
- All prices are positive numbers
- Confidence scores are integers between 0-100
- Price bands maintain logical relationships (min ≤ max)
- Deal calculations are mathematically correct
- Timestamps and IDs are properly generated

### Performance Validation
- Tests handle 100+ rapid successive calls
- Memory usage remains stable during test execution
- No memory leaks or resource accumulation
- Deterministic results for identical inputs

## Future Enhancements

Potential areas for additional testing:
- Load testing with thousands of concurrent negotiations
- Fuzzing tests with random input generation
- Integration tests with actual localStorage operations
- End-to-end tests with complete user workflows
- Performance benchmarking for pricing calculations

## Contributing

When adding new features to the AI engines:
1. Add corresponding unit tests for new functionality
2. Include edge case testing for error conditions
3. Add property-based tests for universal behaviors
4. Update this documentation with new test scenarios
5. Ensure all tests pass before submitting changes

---

*This test suite ensures the LocalTrade Bridge AI engines provide reliable, fair, and consistent pricing and negotiation services for all users.*