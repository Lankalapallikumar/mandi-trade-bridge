// AI-powered pricing engine for LocalTrade Bridge

import { PriceBand, PriceData, LocationFactor, SeasonalFactor, BulkDiscount } from '../types';

export class PricingEngine {
  private static priceData: PriceData[] = [];

  // Load price data from mock dataset
  static loadPriceData(data: PriceData[]): void {
    PricingEngine.priceData = data;
  }

  // Calculate fair price band for a product - now static
  static calculateFairPriceBand(
    productName: string,
    category: string,
    location: string,
    quantity: number = 1,
    currentMonth: number = new Date().getMonth() + 1
  ): PriceBand {
    try {
      // Find matching product data
      const productData = PricingEngine.findProductData(productName, category);
      
      if (!productData) {
        // Fallback for unknown products
        return PricingEngine.generateFallbackPriceBand();
      }

      // Calculate base price with all factors
      const basePrice = productData.basePrice;
      const locationFactor = PricingEngine.getLocationFactor(productData.locationFactors, location);
      const seasonalFactor = PricingEngine.getSeasonalFactor(productData.seasonalFactors, currentMonth);
      const bulkDiscount = PricingEngine.getBulkDiscount(productData.bulkDiscounts, quantity);

      // Apply all factors to base price
      let adjustedPrice = basePrice * locationFactor * seasonalFactor;
      adjustedPrice = adjustedPrice * (1 - bulkDiscount / 100);

      // Generate price band around adjusted price
      const variance = 0.15; // 15% variance for price band
      const min = Math.round(adjustedPrice * (1 - variance));
      const max = Math.round(adjustedPrice * (1 + variance));
      const recommended = Math.round(adjustedPrice);

      // Calculate confidence based on data availability
      const confidence = PricingEngine.calculateConfidence(productData, location, currentMonth);

      return {
        min: Math.max(1, min),
        max: Math.max(min + 1, max),
        recommended: Math.max(min, Math.min(max, recommended)),
        confidence: Math.round(confidence)
      };

    } catch (error) {
      console.error('Error calculating price band:', error);
      return PricingEngine.generateFallbackPriceBand();
    }
  }

  // Find product data by name and category - now static
  private static findProductData(productName: string, category: string): PriceData | null {
    // First try exact match
    let match = PricingEngine.priceData.find(
      data => data.product.toLowerCase() === productName.toLowerCase() &&
               data.category.toLowerCase() === category.toLowerCase()
    );

    if (match) return match;

    // Try partial name match within category
    match = PricingEngine.priceData.find(
      data => data.category.toLowerCase() === category.toLowerCase() &&
               (data.product.toLowerCase().includes(productName.toLowerCase()) ||
                productName.toLowerCase().includes(data.product.toLowerCase()))
    );

    if (match) return match;

    // Try category match only
    match = PricingEngine.priceData.find(
      data => data.category.toLowerCase() === category.toLowerCase()
    );

    return match || null;
  }

  // Get location adjustment factor - now static
  private static getLocationFactor(locationFactors: LocationFactor[], location: string): number {
    const factor = locationFactors.find(
      lf => lf.city.toLowerCase() === location.toLowerCase()
    );
    
    return factor ? factor.factor : 1.0; // Default to no adjustment
  }

  // Get seasonal adjustment factor - now static
  private static getSeasonalFactor(seasonalFactors: SeasonalFactor[], month: number): number {
    const factor = seasonalFactors.find(sf => sf.month === month);
    return factor ? factor.factor : 1.0; // Default to no adjustment
  }

  // Get bulk discount percentage - now static
  private static getBulkDiscount(bulkDiscounts: BulkDiscount[], quantity: number): number {
    // Find the highest applicable discount
    const applicableDiscounts = bulkDiscounts.filter(bd => quantity >= bd.minQuantity);
    
    if (applicableDiscounts.length === 0) return 0;
    
    return Math.max(...applicableDiscounts.map(bd => bd.discountPercentage));
  }

  // Calculate confidence score based on data availability - now static
  private static calculateConfidence(
    productData: PriceData,
    location: string,
    month: number
  ): number {
    let confidence = 60; // Base confidence

    // Boost confidence for exact product match
    confidence += 20;

    // Boost for location data availability
    const hasLocationData = productData.locationFactors.some(
      lf => lf.city.toLowerCase() === location.toLowerCase()
    );
    if (hasLocationData) confidence += 10;

    // Boost for seasonal data availability
    const hasSeasonalData = productData.seasonalFactors.some(sf => sf.month === month);
    if (hasSeasonalData) confidence += 10;

    return Math.min(100, confidence);
  }

  // Generate fallback price band for unknown products - now static
  private static generateFallbackPriceBand(): PriceBand {
    return {
      min: 50,
      max: 200,
      recommended: 100,
      confidence: 30
    };
  }

  // Get price recommendation explanation - now static
  static getPriceExplanation(
    productName: string,
    category: string,
    location: string,
    quantity: number = 1
  ): string {
    const productData = PricingEngine.findProductData(productName, category);
    
    if (!productData) {
      return `Price estimate based on general market data. Limited information available for ${productName}.`;
    }

    const explanations: string[] = [];
    
    explanations.push(`Base price for ${productData.product}: ₹${productData.basePrice}/${productData.unit}`);

    // Location factor explanation
    const locationFactor = PricingEngine.getLocationFactor(productData.locationFactors, location);
    if (locationFactor !== 1.0) {
      const adjustment = locationFactor > 1.0 ? 'higher' : 'lower';
      const percentage = Math.abs((locationFactor - 1.0) * 100).toFixed(0);
      explanations.push(`${location} market: ${percentage}% ${adjustment} than average`);
    }

    // Seasonal factor explanation
    const currentMonth = new Date().getMonth() + 1;
    const seasonalFactor = PricingEngine.getSeasonalFactor(productData.seasonalFactors, currentMonth);
    if (seasonalFactor !== 1.0) {
      const adjustment = seasonalFactor > 1.0 ? 'higher' : 'lower';
      const percentage = Math.abs((seasonalFactor - 1.0) * 100).toFixed(0);
      explanations.push(`Seasonal adjustment: ${percentage}% ${adjustment} this month`);
    }

    // Bulk discount explanation
    const bulkDiscount = PricingEngine.getBulkDiscount(productData.bulkDiscounts, quantity);
    if (bulkDiscount > 0) {
      explanations.push(`Bulk discount: ${bulkDiscount}% off for ${quantity}+ units`);
    }

    return explanations.join('. ') + '.';
  }

  // Add missing getPriceAnalysisExplanation method
  static getPriceAnalysisExplanation(
    productName: string,
    category: string,
    location: string,
    quantity: number,
    priceBand: PriceBand
  ): string {
    const explanation = PricingEngine.getPriceExplanation(productName, category, location, quantity);
    return `AI Analysis: ${explanation} Confidence level: ${priceBand.confidence}% based on available market data.`;
  }

  // Check if price is reasonable - now static
  static isPriceReasonable(
    price: number,
    productName: string,
    category: string,
    location: string,
    quantity: number = 1
  ): { reasonable: boolean; explanation: string } {
    const priceBand = PricingEngine.calculateFairPriceBand(productName, category, location, quantity);
    
    const isWithinBand = price >= priceBand.min && price <= priceBand.max;
    const isNearBand = price >= priceBand.min * 0.8 && price <= priceBand.max * 1.2;

    if (isWithinBand) {
      return {
        reasonable: true,
        explanation: 'Price is within the fair market range.'
      };
    } else if (isNearBand) {
      if (price < priceBand.min) {
        return {
          reasonable: true,
          explanation: 'Price is slightly below market range - good deal for buyer.'
        };
      } else {
        return {
          reasonable: false,
          explanation: 'Price is slightly above market range - consider negotiating.'
        };
      }
    } else {
      if (price < priceBand.min * 0.8) {
        return {
          reasonable: false,
          explanation: 'Price is significantly below market value - may indicate quality issues.'
        };
      } else {
        return {
          reasonable: false,
          explanation: 'Price is significantly above market value - strong negotiation recommended.'
        };
      }
    }
  }
}