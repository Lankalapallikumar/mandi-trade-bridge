// Core type definitions for LocalTrade Bridge

export interface ProductListing {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  listingPrice: number;
  floorPrice: number;
  location: string;
  vendorName: string;
  vendorContact: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  agreedPrice: number;
  savings: number;
  savingsPercentage: number;
  buyerName: string;
  vendorName: string;
  location: string;
  quantity: number;
  unit: string;
  referenceNumber: string;
  completedAt: string;
}

export interface NegotiationSession {
  id: string;
  productId: string;
  messages: ChatMessage[];
  currentOffer: number;
  status: 'active' | 'completed' | 'rejected';
  rounds: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'ai';
  message: string;
  offer?: number;
  timestamp: string;
  type: 'message' | 'offer' | 'counter-offer' | 'acceptance' | 'rejection';
}

export interface PriceBand {
  min: number;
  max: number;
  recommended: number;
  confidence: number;
}

export interface LocationFactor {
  city: string;
  factor: number;
}

export interface SeasonalFactor {
  month: number;
  factor: number;
}

export interface BulkDiscount {
  minQuantity: number;
  discountPercentage: number;
}

export interface PriceData {
  product: string;
  category: string;
  basePrice: number;
  unit: string;
  locationFactors: LocationFactor[];
  seasonalFactors: SeasonalFactor[];
  bulkDiscounts: BulkDiscount[];
}

// Product categories available in the marketplace
export const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits', 
  'Grains',
  'Spices',
  'Dairy',
  'Pulses',
  'Oil & Ghee',
  'Dry Fruits',
  'Herbs',
  'Other'
] as const;

// Major Indian cities supported
export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Nagpur'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
export type IndianCity = typeof INDIAN_CITIES[number];
// Form interface for product listing
export interface ProductListingForm {
  name: string;
  description: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  listingPrice: number;
  floorPrice: number;
  vendorName: string;
  vendorContact: string;
}