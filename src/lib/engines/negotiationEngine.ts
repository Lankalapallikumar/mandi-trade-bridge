// AI-powered negotiation engine for LocalTrade Bridge

import { ChatMessage, ProductListing, PriceBand } from '../types';
import { PricingEngine } from './pricingEngine';
import { generateId } from '../utils';

export interface NegotiationResult {
  accepted: boolean;
  counterOffer?: number;
  message: string;
  finalDeal?: boolean;
  shouldEnd?: boolean;
}

export class NegotiationEngine {
  private maxRounds: number = 5;

  constructor() {
    // Constructor no longer needs pricingEngine parameter
  }

  // Process buyer offer and generate AI response - now static with translation support
  static processOffer(
    offer: number,
    floorPrice: number,
    priceBand: PriceBand,
    currentRound: number = 1,
    productName: string = 'product',
    t?: (key: string, variables?: Record<string, string | number>) => string
  ): NegotiationResult {
    try {
      // Validate offer
      if (!NegotiationEngine.isValidOffer(offer)) {
        return {
          accepted: false,
          message: "I'm sorry, but that doesn't seem like a valid offer. Please enter a positive amount."
        };
      }

      // Check if offer meets floor price
      if (offer >= floorPrice) {
        return NegotiationEngine.acceptOffer(offer, floorPrice, t);
      }

      // Check if offer is unreasonably low
      if (offer < floorPrice * 0.5) {
        return NegotiationEngine.rejectUnreasonableOffer(offer, floorPrice, productName, t);
      }

      // Check if we've reached maximum rounds
      if (currentRound >= 5) {
        return NegotiationEngine.finalRejection(floorPrice, productName, t);
      }

      // Generate counter-offer
      return NegotiationEngine.generateCounterOffer(offer, floorPrice, productName, currentRound, t);

    } catch (error) {
      console.error('Error processing offer:', error);
      return {
        accepted: false,
        message: "I'm sorry, there was an error processing your offer. Please try again."
      };
    }
  }

  // Accept the offer - now static with translation support
  private static acceptOffer(
    offer: number, 
    floorPrice: number,
    t?: (key: string, variables?: Record<string, string | number>) => string
  ): NegotiationResult {
    const message = t 
      ? t('chat.messages.offerAccepted', { 
          finalPrice: `₹${offer.toLocaleString('en-IN')}`,
          unit: 'kg'
        })
      : `Excellent! I accept your offer of ₹${offer.toLocaleString('en-IN')}. Let's finalize this deal. The vendor will be happy with this price.`;

    return {
      accepted: true,
      message,
      finalDeal: true
    };
  }

  // Reject unreasonably low offers - now static with translation support
  private static rejectUnreasonableOffer(
    offer: number, 
    floorPrice: number, 
    productName: string,
    t?: (key: string, variables?: Record<string, string | number>) => string
  ): NegotiationResult {
    const minReasonable = Math.round(floorPrice * 0.8);
    
    const message = t
      ? t('chat.messages.offerTooLow', {
          counterOffer: `₹${minReasonable.toLocaleString('en-IN')}`,
          unit: 'kg'
        })
      : `I appreciate your interest, but ₹${offer.toLocaleString('en-IN')} is quite below the market value for quality ${productName}. The vendor has costs to consider too. Could you consider something closer to ₹${minReasonable.toLocaleString('en-IN')}?`;
    
    return {
      accepted: false,
      message
    };
  }

  // Final rejection when max rounds reached - now static with translation support
  private static finalRejection(
    floorPrice: number, 
    productName: string,
    t?: (key: string, variables?: Record<string, string | number>) => string
  ): NegotiationResult {
    const message = t
      ? t('chat.messages.offerRejected', {
          counterOffer: `₹${floorPrice.toLocaleString('en-IN')}`,
          unit: 'kg'
        })
      : `I've tried my best to find a middle ground, but I can't go below ₹${floorPrice.toLocaleString('en-IN')} for this quality ${productName}. The vendor needs to cover their costs. Perhaps you'd like to browse other similar products?`;
    
    return {
      accepted: false,
      shouldEnd: true,
      message
    };
  }

  // Generate counter-offer with progressive strategy - now static with translation support
  private static generateCounterOffer(
    offer: number,
    floorPrice: number,
    productName: string,
    round: number,
    t?: (key: string, variables?: Record<string, string | number>) => string
  ): NegotiationResult {
    // Calculate counter-offer using progressive strategy
    const gap = floorPrice - offer;
    const progressFactor = NegotiationEngine.getProgressFactor(round);
    
    // Move closer to buyer's offer with each round, but never below floor price
    const counterOffer = Math.max(
      floorPrice,
      Math.round(floorPrice + (gap * progressFactor))
    );

    // Generate contextual message
    const message = NegotiationEngine.generateNegotiationMessage(offer, counterOffer, productName, round, t);

    return {
      accepted: false,
      counterOffer,
      message
    };
  }

  // Calculate progress factor for each round (how much to concede) - now static
  private static getProgressFactor(round: number): number {
    // Progressive concession: give more ground in later rounds
    switch (round) {
      case 1: return 0.8; // Start high, concede 20%
      case 2: return 0.6; // Concede 40%
      case 3: return 0.4; // Concede 60%
      case 4: return 0.2; // Concede 80%
      default: return 0.1; // Final round, minimal concession
    }
  }

  // Generate contextual negotiation messages - now static
  private static generateNegotiationMessage(
    buyerOffer: number,
    counterOffer: number,
    productName: string,
    round: number
  ): string {
    const messages = {
      round1: [
        `I understand you're looking for a good deal! While ₹${buyerOffer.toLocaleString('en-IN')} is a bit low for this quality ${productName}, I can offer ₹${counterOffer.toLocaleString('en-IN')}. This is fresh produce and the vendor takes great care in quality.`,
        `Thanks for your offer of ₹${buyerOffer.toLocaleString('en-IN')}! I'd love to help you get a fair price. How about ₹${counterOffer.toLocaleString('en-IN')}? This accounts for the quality and freshness you'll get.`,
        `I appreciate your interest! ₹${buyerOffer.toLocaleString('en-IN')} is a bit below what we can do, but I can offer ₹${counterOffer.toLocaleString('en-IN')} for this premium ${productName}. What do you think?`
      ],
      round2: [
        `I can see you're a savvy shopper! Let me work with the vendor... I can come down to ₹${counterOffer.toLocaleString('en-IN')}. This is really good value for quality ${productName}.`,
        `You drive a hard bargain! I've spoken with the vendor and we can do ₹${counterOffer.toLocaleString('en-IN')}. This is getting close to their bottom line, but I want to make this work for you.`,
        `I respect your negotiation skills! How about we meet closer to the middle at ₹${counterOffer.toLocaleString('en-IN')}? The vendor is being flexible because they value good customers.`
      ],
      round3: [
        `You're really pushing for the best deal! I can go to ₹${counterOffer.toLocaleString('en-IN')}, but this is getting very close to the vendor's cost. They still need to make a fair living from their hard work.`,
        `I admire your persistence! ₹${counterOffer.toLocaleString('en-IN')} is about as low as we can go while being fair to the vendor. They put a lot of effort into growing quality produce.`,
        `This is a tough negotiation! I can offer ₹${counterOffer.toLocaleString('en-IN')}, but we're really at the limit now. The vendor has to cover their farming costs and time.`
      ],
      round4: [
        `This is my final offer: ₹${counterOffer.toLocaleString('en-IN')}. I've pushed the vendor as much as I can while keeping it fair for everyone. This is truly the best price possible for this quality.`,
        `I've done everything I can to get you the best deal. ₹${counterOffer.toLocaleString('en-IN')} is the absolute lowest we can go. The vendor is already making very little profit at this price.`,
        `Last chance to make this work: ₹${counterOffer.toLocaleString('en-IN')}. I can't go any lower without being unfair to the vendor who works hard to bring you fresh, quality produce.`
      ]
    };

    const roundKey = `round${Math.min(round, 4)}` as keyof typeof messages;
    const roundMessages = messages[roundKey];
    
    return roundMessages[Math.floor(Math.random() * roundMessages.length)];
  }

  // Validate if offer is a valid number - now static
  private static isValidOffer(offer: number): boolean {
    return typeof offer === 'number' && offer > 0 && isFinite(offer);
  }

  // Generate opening message for negotiation - now static with translation support
  static createInitialMessage(
    productName: string, 
    priceBand: PriceBand, 
    listingPrice: number,
    t?: (key: string, variables?: Record<string, string | number>) => string
  ): ChatMessage {
    // Use translation if available, otherwise fallback to English
    const welcomeMessage = t 
      ? t('chat.messages.welcome')
      : "Hello! I'm here to help you negotiate a fair price for this product. Based on market analysis, here's what I found:";
    
    const priceAnalysisMessage = t
      ? t('chat.messages.priceAnalysis', {
          min: `₹${priceBand.min.toLocaleString('en-IN')}`,
          max: `₹${priceBand.max.toLocaleString('en-IN')}`,
          recommended: `₹${priceBand.recommended.toLocaleString('en-IN')}`,
          confidence: priceBand.confidence.toString(),
          unit: 'kg' // Default unit, should be passed as parameter
        })
      : `Fair price range: ₹${priceBand.min.toLocaleString('en-IN')} - ₹${priceBand.max.toLocaleString('en-IN')} per kg. I recommend ₹${priceBand.recommended.toLocaleString('en-IN')} per kg with ${priceBand.confidence}% confidence.`;

    const makeOfferMessage = t
      ? t('chat.messages.makeOffer')
      : "What price would you like to offer?";

    const fullMessage = `${welcomeMessage}\n\n${priceAnalysisMessage}\n\n${makeOfferMessage}`;

    return {
      id: generateId(),
      sender: 'ai',
      message: fullMessage,
      timestamp: new Date().toISOString(),
      type: 'message'
    };
  }

  // Generate deal completion message - now static with translation support
  static createDealCompletionMessage(
    agreedPrice: number,
    t?: (key: string, variables?: Record<string, string | number>) => string
  ): ChatMessage {
    const message = t
      ? t('chat.messages.negotiationComplete', {
          finalPrice: `₹${agreedPrice.toLocaleString('en-IN')}`,
          unit: 'kg'
        })
      : `🎉 Congratulations! The deal has been finalized at ₹${agreedPrice.toLocaleString('en-IN')}. You'll receive a confirmation with all the details. Thank you for using our negotiation service!`;

    return {
      id: generateId(),
      sender: 'ai',
      message,
      timestamp: new Date().toISOString(),
      type: 'message'
    };
  }

  // Generate price analysis message
  generatePriceAnalysis(product: ProductListing): string {
    const priceBand = PricingEngine.calculateFairPriceBand(
      product.name,
      product.category,
      product.location,
      product.quantity
    );

    const explanation = PricingEngine.getPriceExplanation(
      product.name,
      product.category,
      product.location,
      product.quantity
    );

    return `Based on current market data for ${product.location}, the fair price range for ${product.name} is ₹${priceBand.min.toLocaleString('en-IN')} - ₹${priceBand.max.toLocaleString('en-IN')}. My recommended price is ₹${priceBand.recommended.toLocaleString('en-IN')} (${priceBand.confidence}% confidence). ${explanation}`;
  }

  // Check if negotiation should continue
  shouldContinueNegotiation(
    currentRound: number,
    lastOffer: number,
    product: ProductListing
  ): boolean {
    return currentRound < this.maxRounds && lastOffer < product.floorPrice;
  }

  // Get negotiation status summary
  getNegotiationStatus(
    currentRound: number,
    lastOffer: number,
    product: ProductListing
  ): string {
    const remainingRounds = this.maxRounds - currentRound;
    const gapToFloor = product.floorPrice - lastOffer;
    const gapPercentage = (gapToFloor / product.floorPrice) * 100;

    if (lastOffer >= product.floorPrice) {
      return "Deal can be accepted!";
    } else if (remainingRounds <= 1) {
      return "Final round - this is your last chance to negotiate!";
    } else if (gapPercentage > 50) {
      return `Still quite far from acceptable range. ${remainingRounds} rounds left.`;
    } else {
      return `Getting closer! ${remainingRounds} rounds remaining.`;
    }
  }
}