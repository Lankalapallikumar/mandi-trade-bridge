// Utility functions for LocalTrade Bridge

import { ProductListing, Deal, NegotiationSession, ProductListingForm } from './types';

// LocalStorage management utilities
export class LocalStorageManager {
  private static getKey(type: string): string {
    return `localtrade_${type}`;
  }

  static saveProductListing(listing: ProductListing): void {
    try {
      const listings = this.getProductListings();
      listings.push(listing);
      localStorage.setItem(this.getKey('listings'), JSON.stringify(listings));
    } catch (error) {
      console.error('Failed to save product listing:', error);
      throw new Error('Failed to save product listing');
    }
  }

  static getProductListings(): ProductListing[] {
    try {
      const data = localStorage.getItem(this.getKey('listings'));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load product listings:', error);
      return [];
    }
  }

  static getProductById(id: string): ProductListing | null {
    const listings = this.getProductListings();
    return listings.find(listing => listing.id === id) || null;
  }

  static saveDeal(deal: Deal): void {
    try {
      const deals = this.getDeals();
      deals.push(deal);
      localStorage.setItem(this.getKey('deals'), JSON.stringify(deals));
    } catch (error) {
      console.error('Failed to save deal:', error);
      throw new Error('Failed to save deal');
    }
  }

  static getDeals(): Deal[] {
    try {
      const data = localStorage.getItem(this.getKey('deals'));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load deals:', error);
      return [];
    }
  }

  static saveNegotiationSession(session: NegotiationSession): void {
    try {
      const sessions = this.getNegotiationSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem(this.getKey('negotiations'), JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save negotiation session:', error);
      throw new Error('Failed to save negotiation session');
    }
  }

  static getNegotiationSessions(): NegotiationSession[] {
    try {
      const data = localStorage.getItem(this.getKey('negotiations'));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load negotiation sessions:', error);
      return [];
    }
  }

  static getNegotiationByProductId(productId: string): NegotiationSession | null {
    const sessions = this.getNegotiationSessions();
    return sessions.find(session => session.productId === productId) || null;
  }

  // Missing methods that are called from pages
  static getListings(): ProductListing[] {
    return this.getProductListings();
  }

  static getListingById(id: string): ProductListing | null {
    return this.getProductById(id);
  }

  static addNegotiation(session: NegotiationSession): void {
    this.saveNegotiationSession(session);
  }

  static updateNegotiation(session: NegotiationSession): void {
    this.saveNegotiationSession(session);
  }

  static addDeal(deal: Deal): void {
    this.saveDeal(deal);
  }

  static addListing(listing: ProductListing): boolean {
    try {
      this.saveProductListing(listing);
      return true;
    } catch (error) {
      console.error('Failed to add listing:', error);
      return false;
    }
  }

  static getDealById(id: string): Deal | null {
    const deals = this.getDeals();
    return deals.find(deal => deal.id === id) || null;
  }
}

// ID generation utility
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Currency formatting utility
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Date formatting utility
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Generate deal reference number
export function generateDealReference(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `LTB${year}${month}${day}${random}`;
}

// Calculate savings
export function calculateSavings(originalPrice: number, agreedPrice: number): {
  savings: number;
  savingsPercentage: number;
} {
  const savings = originalPrice - agreedPrice;
  const savingsPercentage = (savings / originalPrice) * 100;
  
  return {
    savings: Math.max(0, savings),
    savingsPercentage: Math.max(0, savingsPercentage)
  };
}

// Validate price inputs
export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && isFinite(price);
}

// Error handling utility
export function handleError(error: unknown, context: string): string {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return `An unexpected error occurred in ${context}`;
}

// Search and filtering utilities
export function searchProducts(listings: ProductListing[], searchTerm: string): ProductListing[] {
  if (!searchTerm.trim()) return listings;
  
  const term = searchTerm.toLowerCase();
  return listings.filter(listing =>
    listing.name.toLowerCase().includes(term) ||
    listing.description.toLowerCase().includes(term) ||
    listing.category.toLowerCase().includes(term) ||
    listing.location.toLowerCase().includes(term) ||
    listing.vendorName.toLowerCase().includes(term)
  );
}

export function filterByCity(listings: ProductListing[], city: string): ProductListing[] {
  if (!city || city === 'all') return listings;
  return listings.filter(listing => listing.location.toLowerCase() === city.toLowerCase());
}

export function filterByCategory(listings: ProductListing[], category: string): ProductListing[] {
  if (!category || category === 'all') return listings;
  return listings.filter(listing => listing.category.toLowerCase() === category.toLowerCase());
}

// Formatting utilities
export function formatCityName(city: string): string {
  return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

export function formatCategoryName(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}
// Validate product listing form data
export function validateProductListing(listing: Partial<ProductListingForm>): string[] {
  const errors: string[] = [];

  if (!listing.name?.trim()) {
    errors.push('Product name is required');
  }

  if (!listing.category?.trim()) {
    errors.push('Category is required');
  }

  if (!listing.location?.trim()) {
    errors.push('Location is required');
  }

  if (!listing.vendorName?.trim()) {
    errors.push('Vendor name is required');
  }

  if (!listing.vendorContact?.trim()) {
    errors.push('Vendor contact is required');
  }

  if (!listing.quantity || listing.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (!validatePrice(listing.listingPrice || 0)) {
    errors.push('Listing price must be a valid positive number');
  }

  if (!validatePrice(listing.floorPrice || 0)) {
    errors.push('Floor price must be a valid positive number');
  }

  if (listing.floorPrice && listing.listingPrice && listing.floorPrice > listing.listingPrice) {
    errors.push('Floor price cannot be higher than listing price');
  }

  return errors;
}