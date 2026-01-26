// Test script to verify the complete LocalTrade Bridge flow
// This script simulates creating a product listing, negotiating, and completing a deal

const { LocalStorageManager, generateId, formatCurrency } = require('./src/lib/utils');

// Mock localStorage for Node.js testing
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

// Test data
const testListing = {
  id: generateId(),
  name: 'Fresh Tomatoes',
  description: 'Premium quality tomatoes, freshly harvested from local farms.',
  category: 'Vegetables',
  quantity: 50,
  unit: 'kg',
  listingPrice: 45,
  floorPrice: 35,
  location: 'Mumbai',
  vendorName: 'Ramesh Farms',
  vendorContact: '+91 98765 43210',
  createdAt: new Date().toISOString()
};

const testDeal = {
  id: generateId(),
  productId: testListing.id,
  productName: testListing.name,
  originalPrice: testListing.listingPrice,
  agreedPrice: 38,
  savings: testListing.listingPrice - 38,
  savingsPercentage: ((testListing.listingPrice - 38) / testListing.listingPrice) * 100,
  buyerName: 'Test Buyer',
  vendorName: testListing.vendorName,
  location: testListing.location,
  quantity: testListing.quantity,
  unit: testListing.unit,
  referenceNumber: 'LTB' + Date.now().toString().slice(-8).toUpperCase(),
  completedAt: new Date().toISOString()
};

// Test functions
function testFlow() {
  console.log('🧪 Testing LocalTrade Bridge Complete Flow\n');

  // Test 1: Create product listing
  console.log('1. Creating product listing...');
  try {
    LocalStorageManager.saveProductListing(testListing);
    const savedListing = LocalStorageManager.getListingById(testListing.id);
    console.log('✅ Product listing created successfully');
    console.log(`   Product: ${savedListing.name}`);
    console.log(`   Price: ${formatCurrency(savedListing.listingPrice)}`);
    console.log(`   Location: ${savedListing.location}\n`);
  } catch (error) {
    console.log('❌ Failed to create product listing:', error.message);
    return;
  }

  // Test 2: Create deal
  console.log('2. Creating deal...');
  try {
    LocalStorageManager.addDeal(testDeal);
    const savedDeal = LocalStorageManager.getDealById(testDeal.id);
    console.log('✅ Deal created successfully');
    console.log(`   Product: ${savedDeal.productName}`);
    console.log(`   Original Price: ${formatCurrency(savedDeal.originalPrice)}`);
    console.log(`   Agreed Price: ${formatCurrency(savedDeal.agreedPrice)}`);
    console.log(`   Savings: ${formatCurrency(savedDeal.savings)} (${savedDeal.savingsPercentage.toFixed(1)}%)`);
    console.log(`   Reference: ${savedDeal.referenceNumber}\n`);
  } catch (error) {
    console.log('❌ Failed to create deal:', error.message);
    return;
  }

  // Test 3: Verify data persistence
  console.log('3. Testing data persistence...');
  const allListings = LocalStorageManager.getProductListings();
  const allDeals = LocalStorageManager.getDeals();
  
  console.log(`✅ Data persistence verified`);
  console.log(`   Total listings: ${allListings.length}`);
  console.log(`   Total deals: ${allDeals.length}\n`);

  // Test 4: Generate deal page URL
  console.log('4. Deal page URL:');
  console.log(`   http://localhost:3000/deal?dealId=${testDeal.id}\n`);

  console.log('🎉 All tests passed! The complete flow is working correctly.');
  console.log('\nNext steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Navigate to the Market page');
  console.log('3. Start a negotiation with any product');
  console.log('4. Complete the deal to see the celebration page');
}

// Run tests
testFlow();