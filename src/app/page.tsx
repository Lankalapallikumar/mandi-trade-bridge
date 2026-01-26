'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { populateSampleData } from '../lib/sampleData';
import { LocalStorageManager } from '../lib/utils';
import { useTranslation } from '../lib/i18n/context';


export default function HomePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalListings: 0,
    totalDeals: 0,
    totalSavings: 0
  });

  useEffect(() => {
    // Populate sample data on first load
    populateSampleData();
    
    // Load stats
    const loadStats = () => {
      const listings = LocalStorageManager.getListings();
      const deals = LocalStorageManager.getDeals();
      const totalSavings = deals.reduce((sum, deal) => sum + deal.savings, 0);

      setStats({
        totalListings: listings.length,
        totalDeals: deals.length,
        totalSavings
      });
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 px-4 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">{t('home.title').split(' ')[0] || 'LocalTrade'}</span>
              <br />
              <span className="text-neutral-800">{t('home.title').split(' ')[1] || 'Bridge'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.description')}
            </p>
          </div>
          
          <div className="slide-in-left flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/vendor" className="btn-primary text-lg px-8 py-4">
              🏪 {t('home.cta.vendor')}
            </Link>
            <Link href="/market" className="btn-secondary text-lg px-8 py-4">
              🛒 {t('home.cta.buyer')}
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto scale-in">
            <div className="card card-compact text-center">
              <div className="text-4xl font-bold gradient-text mb-2">
                {stats.totalListings}+
              </div>
              <div className="text-neutral-600 font-medium">Active Listings</div>
            </div>
            <div className="card card-compact text-center">
              <div className="text-4xl font-bold gradient-text mb-2">
                {stats.totalDeals}+
              </div>
              <div className="text-neutral-600 font-medium">Successful Deals</div>
            </div>
            <div className="card card-compact text-center">
              <div className="text-4xl font-bold gradient-text mb-2">
                ₹{stats.totalSavings.toLocaleString('en-IN')}+
              </div>
              <div className="text-neutral-600 font-medium">Total Savings</div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-secondary-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-accent-blue rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Experience the future of local commerce with AI-powered negotiations and community-focused trading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title={t('home.features.pricing.title')}
              description={t('home.features.pricing.description')}
              gradient="from-primary-400 to-primary-600"
            />
            <FeatureCard
              icon="🌱"
              title="Fresh Local Produce"
              description="Connect directly with local farmers and vendors to get the freshest fruits, vegetables, and organic products."
              gradient="from-secondary-400 to-secondary-600"
            />
            <FeatureCard
              icon="💰"
              title={t('home.features.negotiation.title')}
              description={t('home.features.negotiation.description')}
              gradient="from-accent-blue to-accent-purple"
            />
            <FeatureCard
              icon="📱"
              title="Mobile-First Design"
              description="Seamlessly browse, negotiate, and complete deals on any device with our responsive, modern interface."
              gradient="from-accent-pink to-accent-purple"
            />
            <FeatureCard
              icon="🏪"
              title="Support Local Business"
              description="Strengthen your community by supporting local vendors and farmers while getting competitive prices."
              gradient="from-accent-yellow to-secondary-500"
            />
            <FeatureCard
              icon="⚡"
              title={t('home.features.multilingual.title')}
              description={t('home.features.multilingual.description')}
              gradient="from-primary-500 to-accent-blue"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 hero-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Get started in just a few simple steps and experience the future of local trading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              step="1"
              title="Browse Products"
              description="Explore fresh local produce from verified vendors in your area."
              icon="🔍"
            />
            <StepCard
              step="2"
              title="AI Price Analysis"
              description="Get intelligent price recommendations based on market data and quality."
              icon="📊"
            />
            <StepCard
              step="3"
              title="Negotiate Smart"
              description="Use our AI assistant to negotiate fair prices that work for everyone."
              icon="💬"
            />
            <StepCard
              step="4"
              title="Complete Deal"
              description="Finalize your purchase and arrange pickup or delivery with the vendor."
              icon="✅"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers who are already saving money and supporting local businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/vendor" className="btn-secondary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-neutral-100">
                🏪 {t('home.cta.vendor')}
              </Link>
              <Link href="/market" className="btn-accent text-lg px-8 py-4">
                🛒 {t('home.cta.buyer')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="fade-in-up">
            <h3 className="text-3xl font-bold mb-4 gradient-text">🌾 LocalTrade Bridge</h3>
            <p className="text-neutral-400 mb-8 text-lg">
              Connecting communities through intelligent local commerce
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-neutral-400">
              <Link href="/market" className="nav-link text-neutral-400 hover:text-white">
                Market
              </Link>
              <Link href="/vendor" className="nav-link text-neutral-400 hover:text-white">
                Vendors
              </Link>
              <span className="text-sm">Made with ❤️ for local communities</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, gradient }: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="card group cursor-pointer">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-800 mb-4 group-hover:gradient-text transition-all duration-300">
        {title}
      </h3>
      <p className="text-neutral-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// Step Card Component
function StepCard({ step, title, description, icon }: {
  step: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="text-center group">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {step}
        </div>
      </div>
      <h3 className="text-xl font-bold text-neutral-800 mb-3 group-hover:gradient-text transition-all duration-300">
        {title}
      </h3>
      <p className="text-neutral-600">
        {description}
      </p>
    </div>
  );
}