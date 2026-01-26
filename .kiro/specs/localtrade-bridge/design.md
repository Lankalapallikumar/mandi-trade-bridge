

\## .kiro/specs/localtrade-bridge/design.md



```markdown

\# LocalTrade Bridge - Design Document



\## 1. Architecture Overview



\### 1.1 System Architecture

LocalTrade Bridge follows a client-side architecture optimized for rapid MVP development and deployment:



┌─────────────────────────────────────────────────────────────┐ │ Frontend (Next.js 14) │ ├─────────────────────────────────────────────────────────────┤ │ Pages: /vendor | /market | /chat/\[productId] | /deal │ ├─────────────────────────────────────────────────────────────┤ │ AI Engines (Client-side Logic) │ │ ┌─────────────────────┐ ┌─────────────────────────────┐ │ │ │ Pricing Engine │ │ Negotiation Engine │ │ │ │ - Fair price bands │ │ - Counter-offer logic │ │ │ │ - Confidence score │ │ - Acceptance criteria │ │ │ │ - Location factors │ │ - Negotiation strategy │ │ │ └─────────────────────┘ └─────────────────────────────┘ │ ├─────────────────────────────────────────────────────────────┤ │ Data Layer (localStorage) │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │ │ Listings │ │ Deals │ │ Negotiations │ │ │ │ Storage │ │ Storage │ │ Storage │ │ │ └─────────────┘ └─────────────┘ └─────────────────────┘ │ ├─────────────────────────────────────────────────────────────┤ │ Static Data (Mock Pricing) │ │ mockPrices.json │ └─────────────────────────────────────────────────────────────┘





\### 1.2 Technology Stack



\#### Frontend Framework

\- \*\*Next.js 14\*\*: React framework with App Router for modern development

\- \*\*TypeScript\*\*: Type safety and enhanced developer experience

\- \*\*Tailwind CSS\*\*: Utility-first CSS framework for rapid UI development



\#### State Management

\- \*\*React Hooks\*\*: useState, useEffect for component state

\- \*\*localStorage\*\*: Client-side persistence for MVP data storage

\- \*\*Context API\*\*: Global state management where needed



\#### AI Engines

\- \*\*Client-side JavaScript\*\*: Custom algorithms for pricing and negotiation

\- \*\*Static JSON Data\*\*: Mock market data for price calculations

\- \*\*Deterministic Logic\*\*: Predictable AI behavior for consistent user experience



\### 1.3 Project Structure

localtrade-bridge/ ├── src/ │ ├── app/ # Next.js App Router pages │ │ ├── layout.tsx # Root layout with navigation │ │ ├── page.tsx # Home page │ │ ├── vendor/ │ │ │ └── page.tsx # Vendor listing creation │ │ ├── market/ │ │ │ └── page.tsx # Product marketplace │ │ ├── chat/ │ │ │ └── \[productId]/ │ │ │ └── page.tsx # Negotiation chat │ │ └── deal/ │ │ └── page.tsx # Deal completion │ ├── components/ # Reusable UI components │ │ ├── ui/ # Basic UI components │ │ ├── forms/ # Form components │ │ └── chat/ # Chat-specific components │ ├── lib/ # Core business logic │ │ ├── engines/ # AI engines │ │ │ ├── pricingEngine.ts # Price calculation logic │ │ │ └── negotiationEngine.ts # Negotiation logic │ │ ├── types.ts # TypeScript interfaces │ │ └── utils.ts # Utility functions │ └── data/ │ └── mockPrices.json # Static pricing data ├── public/ # Static assets └── package.json # Dependencies and scripts





\## 2. Core Engine Design



\### 2.1 Pricing Engine Architecture



\#### Purpose

The Pricing Engine provides intelligent price recommendations by analyzing market data, location factors, and contextual variables to generate fair price bands with confidence scores.



\#### Core Components



\##### Price Band Calculator

```typescript

class PricingEngine {

&nbsp; static calculateFairPriceBand(

&nbsp;   productName: string,

&nbsp;   category: string, 

&nbsp;   city: string,

&nbsp;   quantity: number = 1

&nbsp; ): PriceBand {

&nbsp;   // Algorithm implementation details below

&nbsp; }

}



Algorithm Flow

Base Price Lookup: Retrieve base price from mockPrices.json

Location Adjustment: Apply city-specific multipliers

Seasonal Factors: Adjust for seasonal price variations

Bulk Discounts: Apply quantity-based discounts

Confidence Calculation: Determine reliability score

Band Generation: Create min/max/recommended price range



Location Factor Matrix

locationFactors: {

&nbsp; // Metro cities (higher cost of living)

&nbsp; "mumbai": 1.3,

&nbsp; "delhi": 1.2,

&nbsp; "bangalore": 1.25,

&nbsp; 

&nbsp; // Tier-2 cities (moderate pricing)

&nbsp; "pune": 1.1,

&nbsp; "hyderabad": 1.15,

&nbsp; "chennai": 1.2,

&nbsp; 

&nbsp; // Tier-3 cities and rural areas (lower costs)

&nbsp; "nashik": 0.8,

&nbsp; "salem": 0.75,

&nbsp; "mysore": 0.85

}

Confidence Scoring Logic

Base Confidence: 70% for products with basic data

Location Data Bonus: +10% if location factors available

Bulk Pricing Bonus: +10% if bulk discount data exists

Seasonal Data Bonus: +10% if seasonal patterns defined

Maximum Confidence: Capped at 95% to account for market volatility

2.2 Negotiation Engine Architecture

Purpose

The Negotiation Engine manages AI-mediated price negotiations, ensuring fair outcomes while respecting vendor constraints and buyer expectations.



Core Components

Counter-Offer Generator



class NegotiationEngine {

&nbsp; static generateCounterOffer(

&nbsp;   currentOffer: number,

&nbsp;   floorPrice: number,

&nbsp;   priceBand: PriceBand,

&nbsp;   round: number = 1

&nbsp; ): { counterOffer: number; message: string }

}



Negotiation Strategy

Offer Evaluation: Assess buyer offer against fair price band

Floor Price Protection: Never accept offers below vendor floor price

Progressive Reduction: Gradually lower counter-offers over rounds

Acceptance Criteria: Accept reasonable offers meeting vendor needs

Communication: Provide contextual explanations for decisions

Negotiation Policy Rules

Round 1: Counter at 90% of fair price band maximum

Round 2: Counter at 80% of fair price band maximum

Round 3: Counter at 70% of fair price band maximum

Round 4+: Counter at maximum of (60% fair price max, floor price \* 1.05)

Acceptance: Accept any offer >= floor price

Rejection: Reject offers < 50% of fair price minimum

Message Generation Strategy

// Context-aware response generation

if (offer < priceBand.min \* 0.6) {

&nbsp; // Very low offer - educational response

&nbsp; message = "Market analysis shows this price is significantly below fair value...";

} else if (offer < floorPrice \* 0.9) {

&nbsp; // Below cost - cost-focused response  

&nbsp; message = "This price doesn't cover my costs, but I can offer...";

} else {

&nbsp; // Reasonable offer - collaborative response

&nbsp; message = "You're in the right range! Let me meet you at...";

}

3\. Data Architecture

3.1 Mock Pricing Data Structure

JSON Schema Design

{

&nbsp; "categories": {

&nbsp;   "vegetables": {

&nbsp;     "tomato": {

&nbsp;       "basePrice": 40,

&nbsp;       "unit": "kg",

&nbsp;       "seasonality": {

&nbsp;         "peak": \[6, 7, 8],      // June-August (monsoon)

&nbsp;         "low": \[12, 1, 2]       // Dec-Feb (winter)

&nbsp;       },

&nbsp;       "locationFactors": {

&nbsp;         "mumbai": 1.3,

&nbsp;         "delhi": 1.2,

&nbsp;         "bangalore": 1.25,

&nbsp;         "pune": 1.1,

&nbsp;         "nashik": 0.8

&nbsp;       },

&nbsp;       "qualityGrades": {

&nbsp;         "premium": 1.2,

&nbsp;         "standard": 1.0,

&nbsp;         "economy": 0.8

&nbsp;       }

&nbsp;     }

&nbsp;   },

&nbsp;   "grains": {

&nbsp;     "rice": {

&nbsp;       "basePrice": 60,

&nbsp;       "unit": "kg", 

&nbsp;       "bulkDiscounts": {

&nbsp;         "10": 0.05,             // 5% discount for 10+ kg

&nbsp;         "25": 0.1,              // 10% discount for 25+ kg

&nbsp;         "50": 0.15              // 15% discount for 50+ kg

&nbsp;       },

&nbsp;       "varieties": {

&nbsp;         "basmati": 1.8,

&nbsp;         "jasmine": 1.4,

&nbsp;         "regular": 1.0

&nbsp;       }

&nbsp;     }

&nbsp;   }

&nbsp; },

&nbsp; "marketTrends": {

&nbsp;   "inflation": 0.06,            // 6% annual inflation

&nbsp;   "volatility": 0.15            // 15% price volatility factor

&nbsp; }

}

Data Coverage Strategy

Vegetables: 15+ common items (tomato, onion, potato, etc.)

Fruits: 10+ seasonal fruits (apple, banana, mango, etc.)

Grains: 8+ staple grains (rice, wheat, dal varieties)

Spices: 12+ essential spices (turmeric, chili, coriander)

Dairy: 6+ dairy products (milk, curd, paneer)

3.2 LocalStorage Schema

Storage Keys and Structure

// Product listings storage

interface ListingsStorage {

&nbsp; key: 'listings';

&nbsp; value: ProductListing\[];

}



// Deals storage  

interface DealsStorage {

&nbsp; key: 'deals';

&nbsp; value: Deal\[];

}



// Negotiation sessions storage

interface NegotiationsStorage {

&nbsp; key: 'negotiations'; 

&nbsp; value: NegotiationSession\[];

}



// User preferences storage

interface PreferencesStorage {

&nbsp; key: 'userPrefs';

&nbsp; value: {

&nbsp;   preferredCity?: string;

&nbsp;   preferredCategories?: string\[];

&nbsp;   language?: string;

&nbsp;   currency?: string;

&nbsp; };

}

Data Persistence Strategy

Automatic Save: Save data immediately after user actions

Optimistic Updates: Update UI before confirming storage

Error Handling: Graceful degradation if localStorage unavailable

Data Migration: Version tracking for future schema changes

4\. User Interface Design

4.1 Design System

Color Palette

/\* Primary Colors \*/

--green-primary: #16a34a;     /\* Trust, growth, money \*/

--green-light: #22c55e;       /\* Success states \*/

--green-dark: #15803d;        /\* Hover states \*/



/\* Secondary Colors \*/

--blue-primary: #2563eb;      /\* Information, links \*/

--blue-light: #3b82f6;        /\* Highlights \*/

--blue-dark: #1d4ed8;         /\* Active states \*/



/\* Neutral Colors \*/

--gray-50: #f9fafb;           /\* Background \*/

--gray-100: #f3f4f6;          /\* Light backgrounds \*/

--gray-600: #4b5563;          /\* Body text \*/

--gray-800: #1f2937;          /\* Headings \*/



/\* Semantic Colors \*/

--red-500: #ef4444;           /\* Errors, warnings \*/

--yellow-500: #eab308;        /\* Cautions, pending \*/

--emerald-500: #10b981;       /\* Success, savings \*/

Typography Scale

/\* Headings \*/

.text-3xl { font-size: 1.875rem; }  /\* Page titles \*/

.text-2xl { font-size: 1.5rem; }    /\* Section headers \*/

.text-xl { font-size: 1.25rem; }    /\* Card titles \*/

.text-lg { font-size: 1.125rem; }   /\* Subheadings \*/



/\* Body Text \*/

.text-base { font-size: 1rem; }     /\* Regular text \*/

.text-sm { font-size: 0.875rem; }   /\* Secondary text \*/

.text-xs { font-size: 0.75rem; }    /\* Captions \*/

Spacing System

/\* Consistent spacing scale \*/

.space-2 { margin: 0.5rem; }        /\* Tight spacing \*/

.space-4 { margin: 1rem; }          /\* Standard spacing \*/

.space-6 { margin: 1.5rem; }        /\* Loose spacing \*/

.space-8 { margin: 2rem; }          /\* Sect



age-Specific Design Specifications

Vendor Page Design



┌─────────────────────────────────────────────────────────┐

│                    Navigation Bar                        │

├─────────────────────────────────────────────────────────┤

│  📝 List Your Product                                   │

│                                                         │

│  ┌─────────────────────────────────────────────────┐   │

│  │              Product Form                       │   │

│  │  Product Name: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]               │   │

│  │  Category:     \[Dropdown ▼]                    │   │

│  │  City:         \[Dropdown ▼]                    │   │

│  │  Quantity:     \[\_\_\_\_\_\_] units                  │   │

│  │  Listing Price: ₹\[\_\_\_\_\_\_]                      │   │

│  │  Floor Price:   ₹\[\_\_\_\_\_\_] (min acceptable)     │   │

│  │  Description:  \[Text Area]                     │   │

│  │                                                 │   │

│  │              \[List Product]                    │   │

│  └─────────────────────────────────────────────────┘   │

└─────────────────────────────────────────────────────────┘



Market Page Design



┌─────────────────────────────────────────────────────────┐

│                    Navigation Bar                        │

├─────────────────────────────────────────────────────────┤

│  🛒 Local Market                                        │

│                                                         │

│  ┌─────────────────────────────────────────────────┐   │

│  │ Search: \[\_\_\_\_\_\_\_\_\_\_\_\_\_] City:\[▼] Category:\[▼]   │   │

│  └─────────────────────────────────────────────────┘   │

│                                                         │

│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │

│  │ Product │ │ Product │ │ Product │ │ Product │      │

│  │  Card   │ │  Card   │ │  Card   │ │  Card   │      │

│  │ ₹40/kg  │ │ ₹25/kg  │ │ ₹60/kg  │ │ ₹35/kg  │      │

│  │\[Negotiate]│\[Negotiate]│\[Negotiate]│\[Negotiate]│      │

│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │

└─────────────────────────────────────────────────────────┘



Chat Page Design



┌─────────────────────────────────────────────────────────┐

│                    Navigation Bar                        │

├─────────────────────────────────────────────────────────┤

│  🍅 Fresh Tomatoes - Mumbai - 50kg Available           │

├─────────────────────────────────────────────────────────┤

│  💰 AI Price Analysis                                   │

│  Fair Range: ₹35-55/kg | Recommended: ₹42/kg | 85% ✓   │

├─────────────────────────────────────────────────────────┤

│                    Chat Messages                        │

│  🤖 AI: Based on market data, fair price is ₹35-55...  │

│      👤 You: I'd like to offer ₹38/kg                  │

│  🤖 AI: That's reasonable! I can accept ₹40/kg...      │

│      👤 You: How about ₹39/kg?                         │

│  🤖 AI: Perfect! I accept ₹39/kg. Let's complete!      │

├─────────────────────────────────────────────────────────┤

│  Your Offer: ₹\[\_\_\_\_]/kg          \[Send Offer]          │

└─────────────────────────────────────────────────────────┘





Deal Page Design



┌─────────────────────────────────────────────────────────┐

│                    Navigation Bar                        │

├─────────────────────────────────────────────────────────┤

│                      🎉                                 │

│              Deal Completed Successfully!               │

│                                                         │

│  ┌─────────────────────────────────────────────────┐   │

│  │           Transaction Summary                   │   │

│  │                                                 │   │

│  │  Product: Fresh Tomatoes (50kg)                │   │

│  │  Vendor: Mumbai Vendor                          │   │

│  │  Original Price: ₹2,000                        │   │

│  │  Final Price: ₹1,950                           │   │

│  │  💰 You Saved: ₹50 (2.5%)                     │   │

│  │                                                 │   │

│  │  Reference: LTB20240126001                     │   │

│  │  Date: 26 Jan 2024, 2:30 PM                   │   │

│  └─────────────────────────────────────────────────┘   │

│                                                         │

│        \[Browse More Products] \[List Your Products]     │

└─────────────────────────────────────────────────────────┘



5\. Component Architecture

5.1 Reusable Components

Form Components

// Input field with validation

interface InputFieldProps {

&nbsp; label: string;

&nbsp; value: string;

&nbsp; onChange: (value: string) => void;

&nbsp; error?: string;

&nbsp; required?: boolean;

&nbsp; type?: 'text' | 'number' | 'email';

}



// Dropdown selector

interface DropdownProps {

&nbsp; label: string;

&nbsp; options: { value: string; label: string }\[];

&nbsp; value: string;

&nbsp; onChange: (value: string) => void;

&nbsp; placeholder?: string;

}

UI Components



// Product card for market display

interface ProductCardProps {

&nbsp; listing: ProductListing;

&nbsp; onNegotiate: (productId: string) => void;

}



// Price band display

interface PriceBandProps {

&nbsp; priceBand: PriceBand;

&nbsp; currentOffer?: number;

}



// Chat message bubble

interface ChatBubbleProps {

&nbsp; message: ChatMessage;

&nbsp; isOwn: boolean;

}



5.2 State Management Strategy

Component State Pattern



// Local component state for forms

const \[formData, setFormData] = useState<FormData>({

&nbsp; productName: '',

&nbsp; category: '',

&nbsp; // ... other fields

});



// Derived state for validation

const isValid = useMemo(() => {

&nbsp; return formData.productName \&\& 

&nbsp;        formData.category \&\& 

&nbsp;        formData.floorPrice > 0;

}, \[formData]);



Global State Pattern

// Context for user preferences

const UserContext = createContext<{

&nbsp; preferences: UserPreferences;

&nbsp; updatePreferences: (prefs: Partial<UserPreferences>) => void;

}>();



// Context for current negotiation

const NegotiationContext = createContext<{

&nbsp; session: NegotiationSession | null;

&nbsp; addMessage: (message: ChatMessage) => void;

&nbsp; completeNegotiation: (finalPrice: number) => void;

}>();



6\. Performance Optimization

6.1 Loading Strategy

Static Generation: Pre-build static pages where possible

Client-side Hydration: Fast initial page loads

Lazy Loading: Load components on demand

Image Optimization: Compress and resize product images

6.2 Caching Strategy

localStorage Caching: Cache frequently accessed data

Component Memoization: Prevent unnecessary re-renders

API Response Caching: Cache pricing data calculations

Static Asset Caching: Browser caching for CSS/JS

6.3 Mobile Optimization

Responsive Design: Mobile-first approach

Touch Interactions: Optimized for touch interfaces

Reduced Data Usage: Minimize API calls and data transfer

Offline Capability: Basic functionality without internet

7\. Security and Privacy

7.1 Data Protection

Client-side Only: No server-side data storage in MVP

Local Storage Encryption: Encrypt sensitive data

Input Sanitization: Prevent XSS attacks

Data Validation: Validate all user inputs

7.2 Privacy Considerations

No Personal Data: Avoid collecting personal information

Anonymous Usage: Generate random user IDs

Data Retention: Clear old data automatically

User Control: Allow users to clear their data

8\. Testing Strategy

8.1 Unit Testing

Engine Testing: Test pricing and negotiation algorithms

Component Testing: Test individual React components

Utility Testing: Test helper functions and utilities

Data Validation: Test input validation logic

8.2 Integration Testing

Page Flow Testing: Test complete user journeys

State Management: Test data flow between components

localStorage Integration: Test data persistence

Cross-browser Testing: Ensure compatibility

8.3 User Acceptance Testing

Scenario Testing: Test real-world usage scenarios

Performance Testing: Test on various devices

Accessibility Testing: Test with screen readers

Usability Testing: Test with target users

9\. Deployment and Monitoring

9.1 Deployment Strategy

Static Hosting: Deploy to Vercel/Netlify

CDN Distribution: Global content delivery

Environment Configuration: Separate dev/prod configs

Automated Deployment: CI/CD pipeline setup

9.2 Monitoring and Analytics

Error Tracking: Monitor JavaScript errors

Performance Monitoring: Track page load times

User Analytics: Track user behavior patterns

Business Metrics: Monitor conversion rates

9.3 Maintenance Plan

Regular Updates: Keep dependencies updated

Bug Fixes: Address issues promptly

Feature Enhancements: Iterative improvements

Data Backup: Regular localStorage data exports

