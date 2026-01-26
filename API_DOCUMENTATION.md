# 🔧 API Documentation

## LocalTrade Bridge - Component & Engine API Reference

This document provides comprehensive documentation for the LocalTrade Bridge application's internal APIs, components, and engines.

## 🧠 AI Engines

### PricingEngine

The PricingEngine provides intelligent price analysis and recommendations.

#### `calculateFairPriceBand(productName, category, city, quantity)`

Calculates a fair price band for a given product.

**Parameters:**
- `productName` (string): Name of the product
- `category` (string): Product category
- `city` (string): Location city
- `quantity` (number): Quantity being purchased

**Returns:** `PriceBand`
```typescript
interface PriceBand {
  min: number;           // Minimum fair price
  max: number;           // Maximum fair price
  recommended: number;   // AI recommended price
  confidence: number;    // Confidence score (0-100)
}
```

**Example:**
```typescript
const priceBand = PricingEngine.calculateFairPriceBand(
  'tomato', 
  'vegetables', 
  'mumbai', 
  10
);
// Returns: { min: 35, max: 55, recommended: 42, confidence: 85 }
```

#### `getPriceAnalysisExplanation(productName, category, city, quantity, priceBand)`

Generates human-readable explanation for price analysis.

**Parameters:**
- `productName` (string): Product name
- `category` (string): Product category  
- `city` (string): Location city
- `quantity` (number): Quantity
- `priceBand` (PriceBand): Price band object

**Returns:** `string` - Explanation text

### NegotiationEngine

The NegotiationEngine handles AI-mediated price negotiations.

#### `processOffer(offer, floorPrice, priceBand, round, productName)`

Processes a buyer's offer and generates AI response.

**Parameters:**
- `offer` (number): Buyer's offer amount
- `floorPrice` (number): Vendor's minimum acceptable price
- `priceBand` (PriceBand): Fair price analysis
- `round` (number): Current negotiation round
- `productName` (string): Product being negotiated

**Returns:** `NegotiationResult`
```typescript
interface NegotiationResult {
  accepted: boolean;      // Whether offer was accepted
  counterOffer?: number;  // AI counter-offer (if not accepted)
  message: string;        // AI response message
  shouldEnd: boolean;     // Whether negotiation should end
}
```

#### `createInitialMessage(productName, priceBand, listingPrice)`

Creates the initial AI message to start negotiation.

**Parameters:**
- `productName` (string): Product name
- `priceBand` (PriceBand): Price analysis
- `listingPrice` (number): Listed price

**Returns:** `ChatMessage`

## 📊 Data Management

### LocalStorageManager

Handles all data persistence operations using browser localStorage.

#### Product Listings

##### `getProductListings()`
Returns all product listings.
**Returns:** `ProductListing[]`

##### `addListing(listing)`
Adds a new product listing.
**Parameters:** `listing` (ProductListing)
**Returns:** `boolean` - Success status

##### `getListingById(id)`
Retrieves a specific listing by ID.
**Parameters:** `id` (string)
**Returns:** `ProductListing | null`

#### Deals

##### `getDeals()`
Returns all completed deals.
**Returns:** `Deal[]`

##### `addDeal(deal)`
Adds a new completed deal.
**Parameters:** `deal` (Deal)
**Returns:** `boolean` - Success status

##### `getDealById(id)`
Retrieves a specific deal by ID.
**Parameters:** `id` (string)
**Returns:** `Deal | null`

#### Negotiations

##### `getNegotiations()`
Returns all negotiation sessions.
**Returns:** `NegotiationSession[]`

##### `addNegotiation(session)`
Adds a new negotiation session.
**Parameters:** `session` (NegotiationSession)
**Returns:** `boolean` - Success status

##### `updateNegotiation(session)`
Updates an existing negotiation session.
**Parameters:** `session` (NegotiationSession)
**Returns:** `boolean` - Success status

##### `getNegotiationByProductId(productId)`
Retrieves negotiation for a specific product.
**Parameters:** `productId` (string)
**Returns:** `NegotiationSession | null`

## 🎨 UI Components

### Core Components

#### `<Navigation />`
Main navigation component with responsive mobile menu.

**Props:** None

**Features:**
- Responsive design
- Active route highlighting
- Mobile hamburger menu
- Accessibility support

#### `<LoadingSpinner />`
Reusable loading indicator component.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}
```

#### `<ErrorBoundary />`
Error boundary component for graceful error handling.

**Props:**
```typescript
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
```

#### `<ErrorDisplay />`
Standardized error display component.

**Props:**
```typescript
interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRefresh?: boolean;
}
```

### Form Components

#### `<Input />`
Enhanced input field with validation support.

**Props:**
```typescript
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  className?: string;
}
```

## 🔧 Utility Functions

### Data Utilities

#### `formatCurrency(amount)`
Formats number as Indian Rupee currency.
**Parameters:** `amount` (number)
**Returns:** `string` - Formatted currency (e.g., "₹1,234")

#### `formatDate(dateString)`
Formats ISO date string for display.
**Parameters:** `dateString` (string)
**Returns:** `string` - Formatted date

#### `formatCityName(city)`
Formats city name for display.
**Parameters:** `city` (string)
**Returns:** `string` - Capitalized city name

#### `formatCategoryName(category)`
Formats category name for display.
**Parameters:** `category` (string)
**Returns:** `string` - Capitalized category name

### Search & Filter Utilities

#### `searchProducts(listings, query)`
Searches products by name, description, or vendor.
**Parameters:** 
- `listings` (ProductListing[])
- `query` (string)
**Returns:** `ProductListing[]`

#### `filterByCity(listings, city)`
Filters products by city.
**Parameters:**
- `listings` (ProductListing[])
- `city` (string)
**Returns:** `ProductListing[]`

#### `filterByCategory(listings, category)`
Filters products by category.
**Parameters:**
- `listings` (ProductListing[])
- `category` (string)
**Returns:** `ProductListing[]`

### Validation Utilities

#### `validateProductListing(formData)`
Validates product listing form data.
**Parameters:** `formData` (ProductListingForm)
**Returns:** `string[]` - Array of validation errors

#### `generateId()`
Generates unique identifier.
**Returns:** `string` - Unique ID

## 📱 Type Definitions

### Core Types

#### `ProductListing`
```typescript
interface ProductListing {
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
```

#### `Deal`
```typescript
interface Deal {
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
```

#### `NegotiationSession`
```typescript
interface NegotiationSession {
  id: string;
  productId: string;
  messages: ChatMessage[];
  currentOffer: number;
  status: 'active' | 'completed' | 'rejected';
  rounds: number;
  createdAt: string;
}
```

#### `ChatMessage`
```typescript
interface ChatMessage {
  id: string;
  sender: 'buyer' | 'ai';
  message: string;
  offer?: number;
  timestamp: string;
  type: 'message' | 'offer' | 'counter-offer' | 'acceptance' | 'rejection';
}
```

### Constants

#### `PRODUCT_CATEGORIES`
```typescript
const PRODUCT_CATEGORIES = [
  'Vegetables', 'Fruits', 'Grains', 'Spices', 
  'Dairy', 'Pulses', 'Oil & Ghee', 'Dry Fruits', 
  'Herbs', 'Other'
] as const;
```

#### `INDIAN_CITIES`
```typescript
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 
  'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'
] as const;
```

## 🔄 Data Flow

### Product Listing Flow
1. User fills vendor form
2. `validateProductListing()` validates data
3. `LocalStorageManager.addListing()` saves listing
4. Market page displays new listing

### Negotiation Flow
1. Buyer clicks "Negotiate" on product
2. `PricingEngine.calculateFairPriceBand()` analyzes price
3. `NegotiationEngine.createInitialMessage()` starts chat
4. User makes offers via `NegotiationEngine.processOffer()`
5. Deal completion saves via `LocalStorageManager.addDeal()`

### Search & Filter Flow
1. User enters search query or selects filters
2. `searchProducts()`, `filterByCity()`, `filterByCategory()` process data
3. Results update in real-time using React state

## 🚀 Performance Considerations

### Optimization Strategies
- **Memoization**: Use `useMemo` for expensive calculations
- **Lazy Loading**: Components loaded on demand
- **Debouncing**: Search queries debounced for performance
- **Caching**: LocalStorage acts as client-side cache

### Memory Management
- Clean up event listeners in `useEffect` cleanup
- Avoid memory leaks in async operations
- Optimize re-renders with proper dependency arrays

## 🔒 Security Considerations

### Data Validation
- All user inputs validated on client-side
- Type checking with TypeScript
- Sanitization of display data

### Storage Security
- LocalStorage data is domain-specific
- No sensitive data stored client-side
- Data encryption ready for future implementation

---

This API documentation is maintained alongside the codebase. For the most up-to-date information, refer to the TypeScript definitions and inline code comments.