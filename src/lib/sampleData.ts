import { ProductListing, PriceData } from './types';
import { LocalStorageManager, generateId } from './utils';
import { PricingEngine } from './engines/pricingEngine';

export function populateSampleData(): void {
  // Load price data into pricing engine first
  const priceData = getMockPriceData();
  PricingEngine.loadPriceData(priceData);

  const sampleListings: ProductListing[] = [
    {
      id: generateId(),
      name: 'Fresh Tomatoes',
      description: 'Premium quality tomatoes, freshly harvested from local farms. Perfect for cooking and salads.',
      category: 'Vegetables',
      quantity: 50,
      unit: 'kg',
      listingPrice: 45,
      floorPrice: 35,
      location: 'Mumbai',
      vendorName: 'Ramesh Farms',
      vendorContact: '+91 98765 43210',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      name: 'Basmati Rice',
      description: 'Premium aged basmati rice with excellent aroma and taste. Perfect for biryanis and special occasions.',
      category: 'Grains',
      quantity: 25,
      unit: 'kg',
      listingPrice: 120,
      floorPrice: 100,
      location: 'Delhi',
      vendorName: 'Singh Rice Mills',
      vendorContact: '+91 98765 43211',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      name: 'Fresh Onions',
      description: 'High quality onions sourced directly from farms. Great for daily cooking needs.',
      category: 'Vegetables',
      quantity: 100,
      unit: 'kg',
      listingPrice: 30,
      floorPrice: 25,
      location: 'Pune',
      vendorName: 'Maharashtra Agro',
      vendorContact: '+91 98765 43212',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      name: 'Alphonso Mangoes',
      description: 'Premium Alphonso mangoes from Ratnagiri. Sweet, juicy, and perfectly ripe.',
      category: 'Fruits',
      quantity: 20,
      unit: 'kg',
      listingPrice: 200,
      floorPrice: 160,
      location: 'Mumbai',
      vendorName: 'Ratnagiri Fruits',
      vendorContact: '+91 98765 43213',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      name: 'Turmeric Powder',
      description: 'Pure turmeric powder with high curcumin content. Organically grown and processed.',
      category: 'Spices',
      quantity: 10,
      unit: 'kg',
      listingPrice: 250,
      floorPrice: 200,
      location: 'Bangalore',
      vendorName: 'Organic Spices Co',
      vendorContact: '+91 98765 43214',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      name: 'Fresh Milk',
      description: 'Pure cow milk from local dairy farms. Rich in nutrients and completely natural.',
      category: 'Dairy',
      quantity: 30,
      unit: 'liter',
      listingPrice: 60,
      floorPrice: 50,
      location: 'Nashik',
      vendorName: 'Nashik Dairy',
      vendorContact: '+91 98765 43215',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      name: 'Red Apples',
      description: 'Fresh red apples from Kashmir. Crisp, sweet, and nutritious.',
      category: 'Fruits',
      quantity: 15,
      unit: 'kg',
      listingPrice: 150,
      floorPrice: 120,
      location: 'Delhi',
      vendorName: 'Kashmir Fruits',
      vendorContact: '+91 98765 43216',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      name: 'Toor Dal',
      description: 'High quality toor dal (pigeon peas) perfect for daily cooking. Rich in protein.',
      category: 'Pulses',
      quantity: 40,
      unit: 'kg',
      listingPrice: 130,
      floorPrice: 110,
      location: 'Hyderabad',
      vendorName: 'Andhra Pulses',
      vendorContact: '+91 98765 43217',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Save sample listings to localStorage
  sampleListings.forEach(listing => {
    LocalStorageManager.saveProductListing(listing);
  });
}

// Convert mock price data to PriceData format for the pricing engine
export function getMockPriceData(): PriceData[] {
  return [
    {
      product: 'Tomatoes',
      category: 'Vegetables',
      basePrice: 40,
      unit: 'kg',
      locationFactors: [
        { city: 'Mumbai', factor: 1.3 },
        { city: 'Delhi', factor: 1.2 },
        { city: 'Bangalore', factor: 1.25 },
        { city: 'Pune', factor: 1.1 },
        { city: 'Hyderabad', factor: 1.15 },
        { city: 'Chennai', factor: 1.2 },
        { city: 'Kolkata', factor: 1.1 },
        { city: 'Ahmedabad', factor: 1.05 }
      ],
      seasonalFactors: [
        { month: 6, factor: 0.8 },
        { month: 7, factor: 0.8 },
        { month: 8, factor: 0.8 },
        { month: 12, factor: 1.2 },
        { month: 1, factor: 1.2 },
        { month: 2, factor: 1.2 }
      ],
      bulkDiscounts: []
    },
    {
      product: 'Onions',
      category: 'Vegetables',
      basePrice: 35,
      unit: 'kg',
      locationFactors: [
        { city: 'Mumbai', factor: 1.25 },
        { city: 'Delhi', factor: 1.15 },
        { city: 'Bangalore', factor: 1.2 },
        { city: 'Pune', factor: 1.0 },
        { city: 'Hyderabad', factor: 1.1 },
        { city: 'Chennai', factor: 1.15 },
        { city: 'Kolkata', factor: 1.05 },
        { city: 'Ahmedabad', factor: 0.95 }
      ],
      seasonalFactors: [
        { month: 3, factor: 0.8 },
        { month: 4, factor: 0.8 },
        { month: 5, factor: 0.8 },
        { month: 9, factor: 1.3 },
        { month: 10, factor: 1.3 },
        { month: 11, factor: 1.3 }
      ],
      bulkDiscounts: [
        { minQuantity: 25, discountPercentage: 5 },
        { minQuantity: 50, discountPercentage: 10 },
        { minQuantity: 100, discountPercentage: 15 }
      ]
    },
    {
      product: 'Rice',
      category: 'Grains',
      basePrice: 60,
      unit: 'kg',
      locationFactors: [
        { city: 'Mumbai', factor: 1.2 },
        { city: 'Delhi', factor: 1.15 },
        { city: 'Bangalore', factor: 1.1 },
        { city: 'Pune', factor: 1.05 },
        { city: 'Hyderabad', factor: 1.0 },
        { city: 'Chennai', factor: 0.95 },
        { city: 'Kolkata', factor: 0.9 },
        { city: 'Ahmedabad', factor: 1.1 }
      ],
      seasonalFactors: [],
      bulkDiscounts: [
        { minQuantity: 10, discountPercentage: 5 },
        { minQuantity: 25, discountPercentage: 10 },
        { minQuantity: 50, discountPercentage: 15 }
      ]
    },
    {
      product: 'Mangoes',
      category: 'Fruits',
      basePrice: 80,
      unit: 'kg',
      locationFactors: [
        { city: 'Mumbai', factor: 1.3 },
        { city: 'Delhi', factor: 1.2 },
        { city: 'Bangalore', factor: 1.25 },
        { city: 'Pune', factor: 1.1 },
        { city: 'Hyderabad', factor: 1.0 },
        { city: 'Chennai', factor: 1.15 },
        { city: 'Kolkata', factor: 1.1 },
        { city: 'Ahmedabad', factor: 1.05 }
      ],
      seasonalFactors: [
        { month: 4, factor: 0.7 },
        { month: 5, factor: 0.7 },
        { month: 6, factor: 0.7 },
        { month: 11, factor: 1.5 },
        { month: 12, factor: 1.5 },
        { month: 1, factor: 1.5 }
      ],
      bulkDiscounts: []
    },
    {
      product: 'Turmeric',
      category: 'Spices',
      basePrice: 200,
      unit: 'kg',
      locationFactors: [
        { city: 'Mumbai', factor: 1.2 },
        { city: 'Delhi', factor: 1.15 },
        { city: 'Bangalore', factor: 1.1 },
        { city: 'Pune', factor: 1.05 },
        { city: 'Hyderabad', factor: 1.0 },
        { city: 'Chennai', factor: 0.95 },
        { city: 'Kolkata', factor: 1.1 },
        { city: 'Ahmedabad', factor: 1.05 }
      ],
      seasonalFactors: [],
      bulkDiscounts: []
    },
    {
      product: 'Milk',
      category: 'Dairy',
      basePrice: 55,
      unit: 'liter',
      locationFactors: [
        { city: 'Mumbai', factor: 1.3 },
        { city: 'Delhi', factor: 1.2 },
        { city: 'Bangalore', factor: 1.25 },
        { city: 'Pune', factor: 1.1 },
        { city: 'Hyderabad', factor: 1.15 },
        { city: 'Chennai', factor: 1.2 },
        { city: 'Kolkata', factor: 1.1 },
        { city: 'Ahmedabad', factor: 1.0 }
      ],
      seasonalFactors: [],
      bulkDiscounts: []
    },
    {
      product: 'Apples',
      category: 'Fruits',
      basePrice: 120,
      unit: 'kg',
      locationFactors: [
        { city: 'Mumbai', factor: 1.4 },
        { city: 'Delhi', factor: 1.1 },
        { city: 'Bangalore', factor: 1.3 },
        { city: 'Pune', factor: 1.2 },
        { city: 'Hyderabad', factor: 1.25 },
        { city: 'Chennai', factor: 1.35 },
        { city: 'Kolkata', factor: 1.15 },
        { city: 'Ahmedabad', factor: 1.1 }
      ],
      seasonalFactors: [
        { month: 9, factor: 0.8 },
        { month: 10, factor: 0.8 },
        { month: 11, factor: 0.8 },
        { month: 4, factor: 1.3 },
        { month: 5, factor: 1.3 },
        { month: 6, factor: 1.3 }
      ],
      bulkDiscounts: []
    },
    {
      product: 'Toor Dal',
      category: 'Pulses',
      basePrice: 120,
      unit: 'kg',
      locationFactors: [
        { city: 'Mumbai', factor: 1.15 },
        { city: 'Delhi', factor: 1.1 },
        { city: 'Bangalore', factor: 1.1 },
        { city: 'Pune', factor: 1.05 },
        { city: 'Hyderabad', factor: 1.0 },
        { city: 'Chennai', factor: 1.05 },
        { city: 'Kolkata', factor: 1.05 },
        { city: 'Ahmedabad', factor: 0.95 }
      ],
      seasonalFactors: [],
      bulkDiscounts: [
        { minQuantity: 10, discountPercentage: 5 },
        { minQuantity: 25, discountPercentage: 8 },
        { minQuantity: 50, discountPercentage: 12 }
      ]
    }
  ];
}