'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProductListing, PRODUCT_CATEGORIES, INDIAN_CITIES } from '../../lib/types';
import { LocalStorageManager, searchProducts, filterByCity, filterByCategory, formatCurrency, formatCityName, formatCategoryName } from '../../lib/utils';
import { populateSampleData } from '../../lib/sampleData';
import LoadingSpinner, { SkeletonCard } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorBoundary';
import { useI18n } from '../../lib/i18n/context';

export default function MarketPage() {
  const { t } = useI18n();
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load listings from localStorage on component mount
  useEffect(() => {
    const loadListings = () => {
      try {
        setIsLoading(true);
        const storedListings = LocalStorageManager.getProductListings();
        
        // If no listings exist, populate with sample data
        if (storedListings.length === 0) {
          populateSampleData();
          const sampleListings = LocalStorageManager.getProductListings();
          setListings(sampleListings);
        } else {
          setListings(storedListings);
        }
      } catch (error) {
        console.error('Error loading listings:', error);
        // Still try to populate sample data on error
        try {
          populateSampleData();
          const sampleListings = LocalStorageManager.getProductListings();
          setListings(sampleListings);
        } catch (sampleError) {
          console.error('Error loading sample data:', sampleError);
          setListings([]);
          setError('Failed to load marketplace data. Please refresh the page.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, []);

  // Filter and search listings
  const filteredListings = useMemo(() => {
    let filtered = listings;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchProducts(filtered, searchQuery);
    }

    // Apply city filter
    if (selectedCity && selectedCity !== 'all') {
      filtered = filterByCity(filtered, selectedCity);
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filterByCategory(filtered, selectedCategory);
    }

    return filtered;
  }, [listings, searchQuery, selectedCity, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedCategory('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
                🛒 <span className="gradient-text">Marketplace</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Discover fresh local produce and negotiate the best prices with AI assistance
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <LoadingSpinner 
            size="lg" 
            text="Loading marketplace..." 
            className="py-16"
          />
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
                🛒 <span className="gradient-text">Marketplace</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Discover fresh local produce and negotiate the best prices with AI assistance
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <ErrorDisplay
            title="Failed to Load Marketplace"
            message={error}
            onRetry={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
              🛒 <span className="gradient-text">{t('market.title')}</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {t('market.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="card mb-8 slide-in-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-2">
                🔍 Search Products
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                placeholder="Search by product name, vendor, or description..."
              />
            </div>

            {/* City Filter */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
                📍 Location
              </label>
              <select
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="select-field"
              >
                <option value="">All Cities</option>
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {formatCityName(city)}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                🏷️ Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select-field"
              >
                <option value="">All Categories</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Summary and Clear */}
          {(searchQuery || selectedCity || selectedCategory) && (
            <div className="mt-6 pt-6 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-neutral-600">Active filters:</span>
                {searchQuery && (
                  <span className="status-badge status-active">
                    Search: &quot;{searchQuery}&quot;
                  </span>
                )}
                {selectedCity && (
                  <span className="status-badge status-pending">
                    📍 {formatCityName(selectedCity)}
                  </span>
                )}
                {selectedCategory && (
                  <span className="status-badge status-completed">
                    🏷️ {formatCategoryName(selectedCategory)}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm px-4 py-2"
              >
                ✨ Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-8 scale-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-800">
              {filteredListings.length > 0 
                ? `${filteredListings.length} Product${filteredListings.length !== 1 ? 's' : ''} Found`
                : 'No Products Found'
              }
            </h2>
            {listings.length > 0 && (
              <div className="text-sm text-neutral-600">
                Showing {filteredListings.length} of {listings.length} total products
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <ProductCard 
                key={listing.id} 
                listing={listing} 
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            hasListings={listings.length > 0}
            searchQuery={searchQuery}
            selectedCity={selectedCity}
            selectedCategory={selectedCategory}
            onClearFilters={clearFilters}
          />
        )}

        {/* Call to Action */}
        {listings.length > 0 && (
          <div className="mt-16 text-center fade-in-up">
            <div className="card">
              <h3 className="text-2xl font-bold text-neutral-800 mb-4">
                Have Products to Sell?
              </h3>
              <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
                Join our marketplace and reach local buyers with AI-powered pricing assistance. 
                Start earning from your fresh produce today!
              </p>
              <Link href="/vendor" className="btn-primary text-lg px-8 py-4">
                🏪 List Your Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ listing, index }: { listing: ProductListing; index: number }) {
  return (
    <div 
      className="product-card fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-neutral-800 mb-2 line-clamp-2">
            {listing.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-2">
            <span className="flex items-center">
              📍 {formatCityName(listing.location)}
            </span>
            <span className="flex items-center">
              🏷️ {formatCategoryName(listing.category)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold price-highlight">
            {formatCurrency(listing.listingPrice)}
          </div>
          <div className="text-sm text-neutral-500">per {listing.unit}</div>
        </div>
      </div>

      {listing.description && (
        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-neutral-600">
          <div className="flex items-center mb-1">
            <span className="font-medium">📦 Quantity:</span>
            <span className="ml-2">{listing.quantity} {listing.unit}s available</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium">👤 Vendor:</span>
            <span className="ml-2">{listing.vendorName}</span>
          </div>
        </div>
      </div>

      <Link
        href={`/chat/${listing.id}`}
        className="btn-primary w-full text-center"
      >
        💬 Start Negotiation
      </Link>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <div className="text-xs text-neutral-500">
          Listed {new Date(listing.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  hasListings, 
  searchQuery, 
  selectedCity, 
  selectedCategory, 
  onClearFilters 
}: {
  hasListings: boolean;
  searchQuery: string;
  selectedCity: string;
  selectedCategory: string;
  onClearFilters: () => void;
}) {
  const hasActiveFilters = searchQuery || selectedCity || selectedCategory;

  return (
    <div className="text-center py-16 scale-in">
      <div className="text-8xl mb-6">
        {hasListings ? '🔍' : '🏪'}
      </div>
      
      <h3 className="text-2xl font-bold text-neutral-800 mb-4">
        {hasListings 
          ? 'No products match your search'
          : 'No products listed yet'
        }
      </h3>
      
      <p className="text-neutral-600 mb-8 max-w-md mx-auto">
        {hasListings 
          ? hasActiveFilters
            ? 'Try adjusting your filters or search terms to find what you&apos;re looking for.'
            : 'It looks like there are no products available right now.'
          : 'Be the first to list products and start building our marketplace community!'
        }
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {hasListings && hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn-secondary"
          >
            ✨ Clear Filters
          </button>
        )}
        
        <Link
          href="/vendor"
          className="btn-primary"
        >
          🏪 List Your Products
        </Link>
      </div>
    </div>
  );
}