'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Deal } from '../../lib/types';
import { LocalStorageManager, formatCurrency, formatDate, formatCityName } from '../../lib/utils';
import { useI18n } from '../../lib/i18n/context';

function DealPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const dealId = searchParams.get('dealId');
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeal = () => {
      try {
        if (!dealId) {
          setError('No deal ID provided');
          setIsLoading(false);
          return;
        }

        const dealData = LocalStorageManager.getDealById(dealId);
        if (!dealData) {
          setError('Deal not found');
          setIsLoading(false);
          return;
        }

        setDeal(dealData);
      } catch (error) {
        console.error('Error loading deal:', error);
        setError('Failed to load deal details');
      } finally {
        setIsLoading(false);
      }
    };

    loadDeal();
  }, [dealId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">❌</div>
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            Deal Not Found
          </h2>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            {error || 'The deal you&apos;re looking for doesn&apos;t exist or has been removed.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/market" className="btn-primary">
              🛒 Browse Market
            </Link>
            <Link href="/vendor" className="btn-secondary">
              🏪 List Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Celebration Header */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-in-up">
            {/* Celebration Animation */}
            <div className="text-8xl mb-6 animate-bounce">
              🎉
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
              <span className="gradient-text">{t('deal.title')}</span>
            </h1>
            
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
              {t('deal.subtitle')}
            </p>

            {/* Savings Highlight */}
            {deal.savings > 0 && (
              <div className="inline-flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold text-lg mb-8 scale-in">
                💰 You saved {formatCurrency(deal.savings)} ({deal.savingsPercentage.toFixed(1)}%)!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Transaction Summary Card */}
        <div className="card mb-8 slide-in-left">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-800 mb-2">
              📋 Transaction Summary
            </h2>
            <p className="text-neutral-600">
              Complete details of your successful purchase
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center">
                  🛍️ Product Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-neutral-600 font-medium">Product:</span>
                    <span className="text-neutral-800 font-semibold text-right">
                      {deal.productName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">Quantity:</span>
                    <span className="text-neutral-800 font-semibold">
                      {deal.quantity} {deal.unit}{deal.quantity > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">Location:</span>
                    <span className="text-neutral-800 font-semibold">
                      📍 {formatCityName(deal.location)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">Vendor:</span>
                    <span className="text-neutral-800 font-semibold">
                      👤 {deal.vendorName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center">
                  💳 Transaction Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">Reference Number:</span>
                    <span className="text-neutral-800 font-mono font-bold bg-neutral-100 px-3 py-1 rounded-lg">
                      {deal.referenceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">Completed At:</span>
                    <span className="text-neutral-800 font-semibold">
                      {formatDate(deal.completedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">Buyer:</span>
                    <span className="text-neutral-800 font-semibold">
                      {deal.buyerName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center">
                  💰 Pricing Breakdown
                </h3>
                <div className="bg-neutral-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">Original Price:</span>
                    <span className="text-neutral-800 font-semibold text-lg">
                      {formatCurrency(deal.originalPrice)}
                    </span>
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600 font-medium">Final Price:</span>
                      <span className="text-primary-600 font-bold text-xl">
                        {formatCurrency(deal.agreedPrice)}
                      </span>
                    </div>
                  </div>

                  {deal.savings > 0 && (
                    <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-800 font-semibold">💰 Total Savings:</span>
                        <span className="text-green-800 font-bold text-xl">
                          {formatCurrency(deal.savings)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 text-sm">Percentage Saved:</span>
                        <span className="text-green-700 font-semibold">
                          {deal.savingsPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {deal.savings === 0 && (
                    <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="text-blue-800 text-center font-semibold">
                        ✨ You got the listed price!
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white text-center">
                <div className="text-3xl mb-3">🎊</div>
                <h4 className="text-lg font-bold mb-2">
                  Negotiation Successful!
                </h4>
                <p className="text-primary-100">
                  Your AI-assisted negotiation helped you secure a great deal. 
                  {deal.savings > 0 && ` You saved ${formatCurrency(deal.savings)}!`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6 scale-in">
          <h3 className="text-2xl font-bold text-neutral-800 mb-6">
            What would you like to do next?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/market"
              className="card card-compact hover:scale-105 transition-all duration-300 text-center group"
            >
              <div className="text-4xl mb-4 group-hover:animate-bounce">🛒</div>
              <h4 className="text-xl font-bold text-neutral-800 mb-2">
                Browse More Products
              </h4>
              <p className="text-neutral-600 text-sm">
                Discover more local products and negotiate great deals
              </p>
            </Link>

            <Link
              href="/vendor"
              className="card card-compact hover:scale-105 transition-all duration-300 text-center group"
            >
              <div className="text-4xl mb-4 group-hover:animate-bounce">🏪</div>
              <h4 className="text-xl font-bold text-neutral-800 mb-2">
                List Your Products
              </h4>
              <p className="text-neutral-600 text-sm">
                Start selling your own products and earn from local trade
              </p>
            </Link>
          </div>

          {/* Additional Actions */}
          <div className="pt-8 border-t border-neutral-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="btn-secondary"
              >
                🖨️ Print Receipt
              </button>
              
              <button
                onClick={() => {
                  const shareText = `🎉 Just completed a successful deal on LocalTrade Bridge! Saved ${formatCurrency(deal.savings)} (${deal.savingsPercentage.toFixed(1)}%) on ${deal.productName}. Reference: ${deal.referenceNumber}`;
                  if (navigator.share) {
                    navigator.share({
                      title: 'LocalTrade Bridge - Deal Completed',
                      text: shareText,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    alert('Deal details copied to clipboard!');
                  }
                }}
                className="btn-secondary"
              >
                📤 Share Success
              </button>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-16 text-center fade-in-up">
          <div className="card">
            <h3 className="text-2xl font-bold text-neutral-800 mb-4">
              Thank You for Using LocalTrade Bridge! 🙏
            </h3>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              We're building a community of local traders who believe in fair prices and transparent negotiations. 
              Your successful deal helps make our marketplace stronger for everyone.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-neutral-500">
              <span className="flex items-center">
                🤝 Fair Trade
              </span>
              <span className="flex items-center">
                🤖 AI Assisted
              </span>
              <span className="flex items-center">
                🏪 Local Community
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function DealPageLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading deal details...</p>
      </div>
    </div>
  );
}

export default function DealPage() {
  return (
    <Suspense fallback={<DealPageLoading />}>
      <DealPageContent />
    </Suspense>
  );
}