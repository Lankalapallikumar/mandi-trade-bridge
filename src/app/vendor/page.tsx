'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRODUCT_CATEGORIES, INDIAN_CITIES } from '../../lib/types';
import { LocalStorageManager, validateProductListing, formatCurrency } from '../../lib/utils';
import { useI18n } from '../../lib/i18n/context';

export default function VendorPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    vendorName: '',
    vendorContact: '',
    category: '',
    location: '',
    quantity: 1,
    unit: 'kg',
    listingPrice: 0,
    floorPrice: 0,
    description: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form data
    const validationErrors = validateProductListing(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Create listing
    try {
      const listing = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        quantity: formData.quantity,
        unit: formData.unit,
        listingPrice: formData.listingPrice,
        floorPrice: formData.floorPrice,
        vendorName: formData.vendorName,
        vendorContact: formData.vendorContact,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const success = LocalStorageManager.addListing(listing);
      
      if (success) {
        setShowSuccess(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setFormData({
            name: '',
            vendorName: '',
            vendorContact: '',
            category: '',
            location: '',
            quantity: 1,
            unit: 'kg',
            listingPrice: 0,
            floorPrice: 0,
            description: ''
          });
        }, 3000);
      } else {
        setErrors(['Failed to save listing. Please try again.']);
      }

    } catch (error) {
      console.error('Error saving listing:', error);
      setErrors(['Failed to save listing. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gram', label: 'Gram (g)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'piece', label: 'Piece' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'quintal', label: 'Quintal' },
    { value: 'ton', label: 'Ton' }
  ];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 text-center scale-in">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold gradient-text mb-4">
            {t('vendor.success.title')}
          </h2>
          <p className="text-neutral-600 mb-6 text-lg">
            {t('vendor.success.message')}
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/market" className="btn-primary">
              🛒 {t('vendor.success.actions.viewMarket')}
            </Link>
            <div className="spinner mx-auto"></div>
            <p className="text-sm text-neutral-500">Redirecting in a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  const negotiationRange = formData.listingPrice > 0 && formData.floorPrice > 0 
    ? ((formData.listingPrice - formData.floorPrice) / formData.listingPrice) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
              🏪 <span className="gradient-text">{t('vendor.title')}</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {t('vendor.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card slide-in-left">
              {errors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                  <div className="flex items-start">
                    <div className="text-3xl mr-4">⚠️</div>
                    <div>
                      <h3 className="text-lg font-bold text-red-800 mb-2">
                        Please fix the following errors:
                      </h3>
                      <ul className="space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="text-red-700 flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Product Information */}
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                    📦 {t('chat.product.details')}
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        {t('vendor.form.productName.label')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="input-field"
                        placeholder={t('vendor.form.productName.placeholder')}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                          {t('vendor.form.category.label')} *
                        </label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="select-field"
                          required
                        >
                          <option value="">{t('vendor.form.category.placeholder')}</option>
                          {PRODUCT_CATEGORIES.map((category) => (
                            <option key={category} value={category.toLowerCase()}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                          {t('vendor.form.city.label')} *
                        </label>
                        <select
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="select-field"
                          required
                        >
                          <option value="">{t('vendor.form.city.placeholder')}</option>
                          {INDIAN_CITIES.map((city) => (
                            <option key={city} value={city.toLowerCase()}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-neutral-700 mb-2">
                          {t('vendor.form.quantity.label')} *
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                          className="input-field"
                          placeholder={t('vendor.form.quantity.placeholder')}
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-neutral-700 mb-2">
                          {t('vendor.form.unit.label')} *
                        </label>
                        <select
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => handleInputChange('unit', e.target.value)}
                          className="select-field"
                          required
                        >
                          {units.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                        {t('vendor.form.description.label')}
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="input-field"
                        rows={4}
                        placeholder={t('vendor.form.description.placeholder')}
                      />
                    </div>
                  </div>
                </div>

                {/* Vendor Information */}
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                    👤 Vendor Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="vendorName" className="block text-sm font-medium text-neutral-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="vendorName"
                        value={formData.vendorName}
                        onChange={(e) => handleInputChange('vendorName', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Ramesh Kumar"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="vendorContact" className="block text-sm font-medium text-neutral-700 mb-2">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        id="vendorContact"
                        value={formData.vendorContact}
                        onChange={(e) => handleInputChange('vendorContact', e.target.value)}
                        className="input-field"
                        placeholder="e.g., +91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                    💰 Pricing Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="listingPrice" className="block text-sm font-medium text-neutral-700 mb-2">
                        {t('vendor.form.listingPrice.label')} *
                      </label>
                      <input
                        type="number"
                        id="listingPrice"
                        value={formData.listingPrice || ''}
                        onChange={(e) => handleInputChange('listingPrice', parseFloat(e.target.value) || 0)}
                        className="input-field"
                        placeholder={t('vendor.form.listingPrice.placeholder')}
                        min="0"
                        step="0.01"
                        required
                      />
                      <p className="text-sm text-neutral-500 mt-2">
                        {t('vendor.form.listingPrice.help')}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="floorPrice" className="block text-sm font-medium text-neutral-700 mb-2">
                        {t('vendor.form.floorPrice.label')} *
                      </label>
                      <input
                        type="number"
                        id="floorPrice"
                        value={formData.floorPrice || ''}
                        onChange={(e) => handleInputChange('floorPrice', parseFloat(e.target.value) || 0)}
                        className="input-field"
                        placeholder={t('vendor.form.floorPrice.placeholder')}
                        min="0"
                        step="0.01"
                        required
                      />
                      <p className="text-sm text-neutral-500 mt-2">
                        {t('vendor.form.floorPrice.help')}
                      </p>
                    </div>
                  </div>

                  {/* Price Analysis */}
                  {formData.listingPrice > 0 && formData.floorPrice > 0 && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                      <div className="flex items-start">
                        <div className="text-3xl mr-4">💡</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-primary-800 mb-2">Price Analysis</h4>
                          {formData.floorPrice > formData.listingPrice ? (
                            <p className="text-red-600 font-medium">
                              ⚠️ {t('vendor.form.floorPrice.validation')}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-primary-700 font-medium">
                                ✅ Negotiation range: {formatCurrency(formData.floorPrice)} - {formatCurrency(formData.listingPrice)}
                              </p>
                              <p className="text-primary-600">
                                Flexibility: {negotiationRange.toFixed(1)}% ({negotiationRange > 20 ? 'High' : negotiationRange > 10 ? 'Medium' : 'Low'} negotiation room)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full btn-primary text-lg py-4 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner mr-3"></div>
                        {t('vendor.form.submitting')}
                      </div>
                    ) : (
                      `🏪 ${t('vendor.form.submit')}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Tips Card */}
              <div className="card scale-in">
                <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
                  💡 Listing Tips
                </h3>
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use clear, descriptive product names that buyers will search for
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Set competitive listing prices based on local market rates
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Keep minimum prices reasonable to encourage negotiations
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Add detailed descriptions highlighting quality and freshness
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Respond promptly to buyer negotiations for better deals
                  </li>
                </ul>
              </div>

              {/* Benefits Card */}
              <div className="card">
                <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
                  🌟 Why List Here?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                      🤖
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">AI-Powered Negotiations</h4>
                      <p className="text-sm text-neutral-600">Smart pricing assistance helps you get fair deals</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                      🏪
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Local Community</h4>
                      <p className="text-sm text-neutral-600">Connect directly with buyers in your area</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                      💰
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Better Prices</h4>
                      <p className="text-sm text-neutral-600">Skip middlemen and earn more from your produce</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}