'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductListing, NegotiationSession, ChatMessage, PriceBand, Deal } from '../../../lib/types';
import { LocalStorageManager, generateId, formatCurrency, formatCityName, formatCategoryName } from '../../../lib/utils';
import { PricingEngine } from '../../../lib/engines/pricingEngine';
import { NegotiationEngine } from '../../../lib/engines/negotiationEngine';
import { useI18n } from '../../../lib/i18n/context';
import LanguageSelector from '../../../components/LanguageSelector';

export default function ChatPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  
  const [listing, setListing] = useState<ProductListing | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationSession | null>(null);
  const [priceBand, setPriceBand] = useState<PriceBand | null>(null);
  const [currentOffer, setCurrentOffer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load product and negotiation data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load product listing
        const productListing = LocalStorageManager.getListingById(productId);
        if (!productListing) {
          setError('Product not found');
          setIsLoading(false);
          return;
        }
        setListing(productListing);

        // Calculate price band
        const band = PricingEngine.calculateFairPriceBand(
          productListing.name,
          productListing.category,
          productListing.location,
          productListing.quantity
        );
        setPriceBand(band);

        // Load or create negotiation session
        let session = LocalStorageManager.getNegotiationByProductId(productId);
        
        if (!session) {
          // Create new negotiation session
          const initialMessage = NegotiationEngine.createInitialMessage(
            productListing.name,
            band,
            productListing.listingPrice,
            t
          );

          session = {
            id: generateId(),
            productId: productId,
            messages: [initialMessage],
            currentOffer: 0,
            status: 'active',
            rounds: 0,
            createdAt: new Date().toISOString()
          };

          LocalStorageManager.addNegotiation(session);
        }
        
        setNegotiation(session);
      } catch (error) {
        console.error('Error loading chat data:', error);
        setError('Failed to load chat data');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadData();
    }
  }, [productId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [negotiation?.messages]);

  // Update AI messages when language changes
  useEffect(() => {
    if (!negotiation || !listing || !priceBand) return;

    const updateMessagesForLanguage = () => {
      const updatedMessages = negotiation.messages.map((message) => {
        // Only update AI messages, keep user messages as-is
        if (message.sender !== 'ai') return message;

        // Update different types of AI messages
        if (message.type === 'message' || message.type === 'welcome') {
          // This is an initial welcome message - regenerate it
          const welcomeMessage = t('chat.messages.welcome');
          const priceAnalysisMessage = t('chat.messages.priceAnalysis', {
            min: `₹${priceBand.min.toLocaleString('en-IN')}`,
            max: `₹${priceBand.max.toLocaleString('en-IN')}`,
            recommended: `₹${priceBand.recommended.toLocaleString('en-IN')}`,
            confidence: priceBand.confidence.toString(),
            unit: 'kg'
          });
          const makeOfferMessage = t('chat.messages.makeOffer');
          
          return {
            ...message,
            message: `${welcomeMessage}\n\n${priceAnalysisMessage}\n\n${makeOfferMessage}`
          };
        } else if (message.type === 'counter-offer' && message.offer) {
          // This is a counter-offer message
          return {
            ...message,
            message: t('chat.messages.offerReasonable', {
              counterOffer: `₹${message.offer.toLocaleString('en-IN')}`,
              unit: 'kg'
            })
          };
        } else if (message.type === 'acceptance') {
          // This is an acceptance message
          return {
            ...message,
            message: t('chat.messages.offerAccepted', {
              finalPrice: `₹${message.offer?.toLocaleString('en-IN') || '0'}`,
              unit: 'kg'
            })
          };
        }

        return message;
      });

      // Update the negotiation with translated messages
      const updatedNegotiation = {
        ...negotiation,
        messages: updatedMessages
      };

      setNegotiation(updatedNegotiation);
      // Also save to localStorage
      LocalStorageManager.updateNegotiation(updatedNegotiation);
    };

    updateMessagesForLanguage();
  }, [t, negotiation?.id, listing, priceBand]); // Re-run when language (t function) changes

  const handleSendOffer = async () => {
    if (!currentOffer.trim() || !listing || !negotiation || !priceBand) return;
    
    const offerAmount = parseFloat(currentOffer);
    if (isNaN(offerAmount) || offerAmount <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    setIsProcessing(true);
    setCurrentOffer('');

    try {
      // Add buyer message
      const buyerMessage: ChatMessage = {
        id: generateId(),
        sender: 'buyer',
        message: `I'd like to offer ${formatCurrency(offerAmount)}`,
        offer: offerAmount,
        timestamp: new Date().toISOString(),
        type: 'offer'
      };

      const updatedMessages = [...negotiation.messages, buyerMessage];
      
      // Process offer with negotiation engine
      const negotiationRound = negotiation.messages.filter(m => m.sender === 'buyer').length + 1;
      const result = NegotiationEngine.processOffer(
        offerAmount,
        listing.floorPrice,
        priceBand,
        negotiationRound,
        listing.name,
        t
      );

      // Add AI response
      const aiMessage: ChatMessage = {
        id: generateId(),
        sender: 'ai',
        message: result.message,
        offer: result.counterOffer,
        timestamp: new Date().toISOString(),
        type: result.accepted ? 'acceptance' : 'counter-offer'
      };

      const finalMessages = [...updatedMessages, aiMessage];
      
      // Update negotiation session
      const updatedNegotiation: NegotiationSession = {
        ...negotiation,
        messages: finalMessages,
        currentOffer: result.accepted ? offerAmount : (result.counterOffer || 0),
        status: result.accepted || result.shouldEnd ? 'completed' : 'active',
        rounds: negotiationRound
      };

      // Save updated negotiation
      LocalStorageManager.updateNegotiation(updatedNegotiation);
      setNegotiation(updatedNegotiation);

      // If deal is accepted, create deal record and redirect
      if (result.accepted) {
        const deal: Deal = {
          id: generateId(),
          productId: listing.id,
          productName: listing.name,
          originalPrice: listing.listingPrice,
          agreedPrice: offerAmount,
          savings: listing.listingPrice - offerAmount,
          savingsPercentage: ((listing.listingPrice - offerAmount) / listing.listingPrice) * 100,
          buyerName: 'Buyer', // In real app, this would be authenticated user
          vendorName: listing.vendorName,
          location: listing.location,
          quantity: listing.quantity,
          unit: listing.unit,
          referenceNumber: generateId().toUpperCase(),
          completedAt: new Date().toISOString()
        };

        LocalStorageManager.addDeal(deal);
        
        // Add completion message
        const completionMessage = NegotiationEngine.createDealCompletionMessage(offerAmount, t);
        const completionMessages = [...finalMessages, completionMessage];
        
        const completedNegotiation = {
          ...updatedNegotiation,
          messages: completionMessages,
          status: 'completed' as const
        };
        
        LocalStorageManager.updateNegotiation(completedNegotiation);
        setNegotiation(completedNegotiation);

        // Redirect to deal page after a short delay
        setTimeout(() => {
          router.push(`/deal?dealId=${deal.id}`);
        }, 2000);
      }

    } catch (error) {
      console.error('Error processing offer:', error);
      alert('Failed to process offer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendOffer();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading negotiation...</p>
        </div>
      </div>
    );
  }

  if (error || !listing || !negotiation || !priceBand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/market')}
            className="btn-primary"
          >
            🛒 Back to Market
          </button>
        </div>
      </div>
    );
  }

  const isNegotiationActive = negotiation.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Product Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {listing.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  📍 {formatCityName(listing.location)}
                </span>
                <span className="flex items-center">
                  🏷️ {formatCategoryName(listing.category)}
                </span>
                <span className="flex items-center">
                  📦 {listing.quantity} available
                </span>
              </div>
              {listing.description && (
                <p className="text-gray-600 mt-2">{listing.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold price-highlight">
                {formatCurrency(listing.listingPrice)}
              </div>
              <div className="text-sm text-gray-500">Listed price</div>
            </div>
          </div>
          
          {/* Chat Language Selector */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              💬 {t('chat.title')} - <span className="font-medium text-blue-600">Switch language anytime during negotiation</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium">Chat Language:</span>
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Price Analysis Panel */}
        <div className="bg-blue-50 border-b border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            💰 {t('chat.priceAnalysis.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t('chat.priceAnalysis.fairRange')}</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(priceBand.min)} - {formatCurrency(priceBand.max)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t('chat.priceAnalysis.recommended')}</div>
              <div className="text-lg font-semibold price-highlight">
                {formatCurrency(priceBand.recommended)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Confidence Level</div>
              <div className="flex items-center">
                <div className="text-lg font-semibold text-gray-900 mr-2">
                  {priceBand.confidence}%
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${priceBand.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-800">
            {PricingEngine.getPriceAnalysisExplanation(
              listing.name,
              listing.category,
              listing.location,
              listing.quantity,
              priceBand
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="bg-white h-96 overflow-y-auto p-6 space-y-4"
        >
          {negotiation.messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {isNegotiationActive ? (
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="offer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Offer (₹)
                </label>
                <input
                  type="number"
                  id="offer"
                  value={currentOffer}
                  onChange={(e) => setCurrentOffer(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="input-field"
                  placeholder="Enter your offer amount"
                  min="0"
                  step="0.01"
                  disabled={isProcessing}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSendOffer}
                  disabled={isProcessing || !currentOffer.trim()}
                  className={`btn-primary px-6 ${
                    isProcessing || !currentOffer.trim() 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    '💬 Send Offer'
                  )}
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Press Enter to send your offer, or click the button above.
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 border-t border-gray-200 p-6 text-center">
            <p className="text-gray-600 mb-4">
              {negotiation.status === 'completed' 
                ? '🎉 Negotiation completed successfully!'
                : '❌ Negotiation has ended.'
              }
            </p>
            <button
              onClick={() => router.push('/market')}
              className="btn-secondary"
            >
              🛒 Back to Market
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Chat Bubble Component
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'buyer';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-green-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="flex items-center mb-1">
          <span className="text-sm font-medium">
            {isUser ? '👤 You' : '🤖 AI Assistant'}
          </span>
          <span className="text-xs opacity-75 ml-2">
            {new Date(message.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="text-sm whitespace-pre-wrap">
          {message.message}
        </div>
        {message.offer && (
          <div className={`text-xs mt-1 font-medium ${
            isUser ? 'text-green-100' : 'text-green-600'
          }`}>
            Offer: {formatCurrency(message.offer)}
          </div>
        )}
      </div>
    </div>
  );
}