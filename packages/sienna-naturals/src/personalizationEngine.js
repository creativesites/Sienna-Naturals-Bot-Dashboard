import winston from 'winston';

export class PersonalizationEngine {
  constructor(options = {}) {
    this.database = options.database;
    this.analytics = options.analytics;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });

    // User personas and communication styles
    this.personas = {
      'newbie': {
        name: 'Natural Hair Newbie',
        characteristics: ['learning', 'uncertain', 'needs guidance'],
        communicationStyle: 'detailed',
        preferredTopics: ['basics', 'simple routines', 'beginner tips'],
        responseLength: 'medium-long'
      },
      'experimenter': {
        name: 'Hair Care Experimenter',
        characteristics: ['curious', 'trying new things', 'research-oriented'],
        communicationStyle: 'informative',
        preferredTopics: ['product comparisons', 'techniques', 'ingredients'],
        responseLength: 'medium'
      },
      'expert': {
        name: 'Hair Care Expert',
        characteristics: ['knowledgeable', 'specific questions', 'advanced needs'],
        communicationStyle: 'concise',
        preferredTopics: ['advanced techniques', 'troubleshooting', 'optimization'],
        responseLength: 'short-medium'
      },
      'busy_parent': {
        name: 'Busy Parent',
        characteristics: ['time-constrained', 'practical', 'efficiency-focused'],
        communicationStyle: 'concise',
        preferredTopics: ['quick routines', 'time-saving tips', 'kid-friendly'],
        responseLength: 'short'
      },
      'product_seeker': {
        name: 'Product Seeker',
        characteristics: ['shopping-focused', 'comparison-oriented', 'value-conscious'],
        communicationStyle: 'informative',
        preferredTopics: ['product recommendations', 'reviews', 'comparisons'],
        responseLength: 'medium'
      }
    };

    // Communication styles
    this.communicationStyles = {
      'detailed': {
        explanation: 'comprehensive',
        examples: 'multiple',
        tone: 'educational',
        structure: 'step-by-step'
      },
      'concise': {
        explanation: 'brief',
        examples: 'minimal',
        tone: 'direct',
        structure: 'bulleted'
      },
      'informative': {
        explanation: 'balanced',
        examples: 'relevant',
        tone: 'professional',
        structure: 'organized'
      }
    };

    // Personalization factors
    this.personalizationFactors = {
      hairType: {
        weight: 0.25,
        values: ['1a', '1b', '1c', '2a', '2b', '2c', '3a', '3b', '3c', '4a', '4b', '4c']
      },
      journeyStage: {
        weight: 0.20,
        values: ['discovery', 'transition', 'learning', 'experimentation', 'stabilization', 'optimization', 'maintenance', 'mastery']
      },
      concerns: {
        weight: 0.20,
        values: ['dryness', 'breakage', 'frizz', 'growth', 'styling', 'color', 'scalp']
      },
      goals: {
        weight: 0.15,
        values: ['length', 'health', 'styling', 'manageability', 'definition']
      },
      interactionHistory: {
        weight: 0.10,
        values: ['frequency', 'satisfaction', 'engagement']
      },
      preferences: {
        weight: 0.10,
        values: ['communication_style', 'response_length', 'topic_preference']
      }
    };
  }

  async personalizeResponse(aiResponse, userInfo, context) {
    try {
      // Get user persona
      const persona = await this.identifyUserPersona(userInfo, context);
      
      // Get personalization preferences
      const preferences = await this.getUserPreferences(userInfo.user_id || userInfo.userId);
      
      // Apply personalization
      const personalizedResponse = await this.applyPersonalization(
        aiResponse, 
        persona, 
        preferences, 
        userInfo, 
        context
      );

      // Track personalization effectiveness
      await this.trackPersonalizationEvent(userInfo.user_id || userInfo.userId, {
        persona: persona.name,
        originalLength: aiResponse.text.length,
        personalizedLength: personalizedResponse.text.length,
        context: context.conversationType,
        adjustments: personalizedResponse.adjustments
      });

      return personalizedResponse;

    } catch (error) {
      this.logger.error('Error personalizing response:', error);
      
      // Return original response with basic personalization
      return {
        text: this.addPersonalTouch(aiResponse.text, userInfo),
        modelUsed: aiResponse.modelUsed,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions || [],
        personalized: false,
        error: error.message
      };
    }
  }

  async identifyUserPersona(userInfo, context) {
    // Calculate persona scores based on user data
    const scores = {};
    
    for (const [personaKey, persona] of Object.entries(this.personas)) {
      scores[personaKey] = 0;
    }

    // Analyze journey stage
    if (context.journeyStage) {
      switch (context.journeyStage) {
        case 'discovery':
        case 'transition':
        case 'learning':
          scores.newbie += 3;
          break;
        case 'experimentation':
          scores.experimenter += 3;
          break;
        case 'optimization':
        case 'mastery':
          scores.expert += 3;
          break;
        case 'maintenance':
          scores.busy_parent += 2;
          scores.expert += 1;
          break;
      }
    }

    // Analyze conversation type
    switch (context.conversationType) {
      case 'shopping':
        scores.product_seeker += 2;
        break;
      case 'troubleshooting':
        scores.experimenter += 2;
        scores.expert += 1;
        break;
      case 'education':
        scores.newbie += 2;
        scores.experimenter += 1;
        break;
      case 'consultation':
        scores.newbie += 1;
        scores.experimenter += 1;
        break;
    }

    // Analyze message complexity and urgency
    if (context.complexity === 'low' && context.urgency === 'high') {
      scores.busy_parent += 2;
    } else if (context.complexity === 'high') {
      scores.expert += 2;
      scores.experimenter += 1;
    }

    // Get historical interaction data
    if (this.database && userInfo.user_id) {
      try {
        const interactionHistory = await this.database.getUserInteractionHistory(userInfo.user_id);
        
        if (interactionHistory) {
          // Frequent user with short sessions = busy parent
          if (interactionHistory.frequencyScore > 0.7 && interactionHistory.avgSessionDuration < 180) {
            scores.busy_parent += 2;
          }
          
          // Long sessions with detailed questions = experimenter/expert  
          if (interactionHistory.avgSessionDuration > 300) {
            scores.experimenter += 1;
            scores.expert += 1;
          }
          
          // High satisfaction with detailed responses = detail seeker
          if (interactionHistory.satisfactionWithDetail > 0.8) {
            scores.newbie += 1;
            scores.experimenter += 1;
          }
        }
      } catch (error) {
        this.logger.warn('Could not fetch interaction history:', error);
      }
    }

    // Find highest scoring persona
    const topPersona = Object.entries(scores).reduce((max, [key, score]) => 
      score > max.score ? { key, score } : max, 
      { key: 'experimenter', score: 0 }
    );

    return {
      ...this.personas[topPersona.key],
      key: topPersona.key,
      confidence: Math.min(topPersona.score / 5, 1.0) // Normalize to 0-1
    };
  }

  async getUserPreferences(userId) {
    const defaultPreferences = {
      communicationStyle: 'informative',
      responseLength: 'medium',
      includeExamples: true,
      includeProductRecommendations: true,
      includeScientificExplanations: false,
      preferredTopics: [],
      avoidedTopics: []
    };

    if (!this.database || !userId) {
      return defaultPreferences;
    }

    try {
      const preferences = await this.database.getUserPersonalizationPreferences(userId);
      return { ...defaultPreferences, ...preferences };
    } catch (error) {
      this.logger.warn('Could not fetch user preferences:', error);
      return defaultPreferences;
    }
  }

  async applyPersonalization(aiResponse, persona, preferences, userInfo, context) {
    let personalizedText = aiResponse.text;
    const adjustments = [];

    // Apply persona-based adjustments
    const style = this.communicationStyles[persona.communicationStyle];

    // Adjust response length
    if (persona.responseLength === 'short' && personalizedText.length > 300) {
      personalizedText = this.shortenResponse(personalizedText);
      adjustments.push('shortened_for_persona');
    } else if (persona.responseLength === 'medium-long' && personalizedText.length < 200) {
      personalizedText = this.expandResponse(personalizedText, userInfo, context);
      adjustments.push('expanded_for_persona');
    }

    // Apply communication style
    if (style.structure === 'bulleted' && !personalizedText.includes('•')) {
      personalizedText = this.convertToBulletPoints(personalizedText);
      adjustments.push('converted_to_bullets');
    } else if (style.structure === 'step-by-step' && !personalizedText.includes('Step')) {
      personalizedText = this.convertToSteps(personalizedText);
      adjustments.push('converted_to_steps');
    }

    // Add personal touches
    personalizedText = this.addPersonalTouch(personalizedText, userInfo);
    adjustments.push('added_personal_touch');

    // Add persona-specific elements
    if (persona.key === 'newbie') {
      personalizedText = this.addBeginnerFriendlyElements(personalizedText);
      adjustments.push('added_beginner_elements');
    } else if (persona.key === 'expert') {
      personalizedText = this.addExpertElements(personalizedText);
      adjustments.push('added_expert_elements');
    } else if (persona.key === 'busy_parent') {
      personalizedText = this.addTimeEfficiencyElements(personalizedText);
      adjustments.push('added_efficiency_elements');
    }

    // Generate personalized suggestions
    const personalizedSuggestions = await this.generatePersonalizedSuggestions(
      userInfo, 
      context, 
      persona
    );

    return {
      text: personalizedText.trim(),
      modelUsed: aiResponse.modelUsed,
      confidence: aiResponse.confidence,
      suggestions: personalizedSuggestions,
      personalized: true,
      persona: persona.name,
      adjustments
    };
  }

  shortenResponse(text) {
    // Extract key points and condense
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Keep the most important sentences (first, last, and any with key terms)
    const keyTerms = ['sienna naturals', 'recommend', 'important', 'key', 'essential', 'best'];
    const importantSentences = sentences.filter((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      return index === 0 || 
             index === sentences.length - 1 || 
             keyTerms.some(term => lowerSentence.includes(term));
    });

    return importantSentences.join('. ').trim() + '.';
  }

  expandResponse(text, userInfo, context) {
    let expanded = text;

    // Add helpful context based on user's hair type
    if (userInfo.hair_type || userInfo.hairType) {
      const hairType = userInfo.hair_type || userInfo.hairType;
      expanded += `\n\nFor your ${hairType} hair specifically, this approach tends to work well because of your hair's natural texture and needs.`;
    }

    // Add encouragement for newbies
    if (context.journeyStage === 'discovery' || context.journeyStage === 'learning') {
      expanded += `\n\nRemember, finding the right routine takes time and experimentation. Be patient with yourself as you learn what works best for your unique hair!`;
    }

    // Add next steps
    expanded += `\n\nNext steps: Try this approach for 2-3 weeks and see how your hair responds. Feel free to ask me any follow-up questions!`;

    return expanded;
  }

  convertToBulletPoints(text) {
    // Simple conversion - split by periods and convert to bullet points
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length > 2) {
      const intro = sentences[0] + '.';
      const bullets = sentences.slice(1).map(sentence => `• ${sentence.trim()}`);
      return intro + '\n\n' + bullets.join('\n');
    }
    
    return text;
  }

  convertToSteps(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length > 2) {
      const intro = sentences[0] + '.';
      const steps = sentences.slice(1).map((sentence, index) => 
        `Step ${index + 1}: ${sentence.trim()}.`
      );
      return intro + '\n\n' + steps.join('\n');
    }
    
    return text;
  }

  addPersonalTouch(text, userInfo) {
    // Add name if available
    if (userInfo.name) {
      // Don't add name if it's already there
      if (!text.toLowerCase().includes(userInfo.name.toLowerCase())) {
        text = text.replace(/^/, `Hi ${userInfo.name}! `);
      }
    }

    // Add hair type specific language
    if (userInfo.hair_type || userInfo.hairType) {
      const hairType = userInfo.hair_type || userInfo.hairType;
      text = text.replace(/your hair/gi, `your beautiful ${hairType} hair`);
    }

    return text;
  }

  addBeginnerFriendlyElements(text) {
    // Add reassuring language
    text = text.replace(/you should/gi, 'you might want to try');
    text = text.replace(/you must/gi, 'it can be helpful to');
    
    // Add explanation markers
    if (!text.includes('because') && !text.includes('since')) {
      // Find the first recommendation and add a brief explanation
      text = text.replace(/try using/gi, 'try using (this helps because it)');
    }

    return text;
  }

  addExpertElements(text) {
    // Add more technical language if not already present
    const technicalTerms = ['porosity', 'moisture-protein balance', 'cuticle', 'pH level'];
    const hasATechnicalTerm = technicalTerms.some(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );

    if (!hasATechnicalTerm) {
      // Add a brief technical note
      text += '\n\nTip: Consider your hair\'s porosity level when choosing products for optimal results.';
    }

    return text;
  }

  addTimeEfficiencyElements(text) {
    // Emphasize time-saving aspects
    text = text.replace(/routine/gi, 'quick routine');
    text = text.replace(/apply/gi, 'quickly apply');
    
    // Add time estimates where relevant
    if (text.includes('deep condition') && !text.includes('minutes')) {
      text = text.replace(/deep condition/gi, 'deep condition (15-20 minutes)');
    }

    // Add efficiency tip
    if (!text.includes('time-saving') && !text.includes('quick')) {
      text += '\n\nTime-saving tip: You can multitask during treatment time - catch up on emails or prep for the week!';
    }

    return text;
  }

  async generatePersonalizedSuggestions(userInfo, context, persona) {
    const suggestions = [];

    // Persona-based suggestions
    switch (persona.key) {
      case 'newbie':
        suggestions.push(
          'Learn about your hair type',
          'Create a simple starter routine',
          'Ask about beginner-friendly products'
        );
        break;
      case 'experimenter':
        suggestions.push(
          'Compare product ingredients',
          'Try a new styling technique',
          'Explore seasonal routine adjustments'
        );
        break;
      case 'expert':
        suggestions.push(
          'Fine-tune your current routine',
          'Troubleshoot specific issues',
          'Discuss advanced techniques'
        );
        break;
      case 'busy_parent':
        suggestions.push(
          'Quick 5-minute routines',
          'Overnight treatments',
          'Kid-friendly hair tips'
        );
        break;
      case 'product_seeker':
        suggestions.push(
          'Compare Sienna Naturals products',
          'Get personalized product recommendations',
          'Learn about ingredient benefits'
        );
        break;
    }

    // Context-based suggestions
    if (context.conversationType === 'troubleshooting') {
      suggestions.unshift('Schedule a follow-up check-in');
    } else if (context.conversationType === 'shopping') {
      suggestions.unshift('View full product details');
    }

    // Hair type specific suggestions
    if (userInfo.hair_type || userInfo.hairType) {
      const hairType = userInfo.hair_type || userInfo.hairType;
      suggestions.push(`Get ${hairType}-specific tips`);
    }

    // Return up to 4 most relevant suggestions
    return suggestions.slice(0, 4);
  }

  async trackPersonalizationEvent(userId, data) {
    if (this.analytics) {
      await this.analytics.trackEvent('personalization_applied', {
        userId,
        ...data
      });
    }
  }

  // Personalization learning and optimization

  async learnFromUserFeedback(userId, feedback, context) {
    if (!this.database) return;

    try {
      await this.database.recordPersonalizationFeedback(userId, {
        feedback,
        context,
        timestamp: new Date()
      });

      // Adjust user preferences based on feedback
      if (feedback.responseLength) {
        await this.updateUserPreference(userId, 'responseLength', feedback.responseLength);
      }
      
      if (feedback.communicationStyle) {
        await this.updateUserPreference(userId, 'communicationStyle', feedback.communicationStyle);
      }

    } catch (error) {
      this.logger.error('Error learning from user feedback:', error);
    }
  }

  async updateUserPreference(userId, preferenceKey, value) {
    if (!this.database) return;

    try {
      await this.database.updateUserPersonalizationPreference(userId, preferenceKey, value);
      this.logger.info('Updated user preference', { userId, preferenceKey, value });
    } catch (error) {
      this.logger.error('Error updating user preference:', error);
    }
  }

  async analyzePersonalizationEffectiveness(timeRange = '7d') {
    if (!this.database) return null;

    try {
      const analysis = await this.database.getPersonalizationAnalytics(timeRange);
      
      return {
        totalPersonalizedResponses: analysis.total,
        averageUserSatisfaction: analysis.avgSatisfaction,
        personaDistribution: analysis.personaBreakdown,
        mostEffectivePersona: analysis.topPerforming,
        improvementAreas: analysis.suggestions,
        timeRange
      };
    } catch (error) {
      this.logger.error('Error analyzing personalization effectiveness:', error);
      return null;
    }
  }

  // A/B testing for personalization strategies
  async runPersonalizationABTest(userId, testName, variants) {
    const selectedVariant = variants[Math.floor(Math.random() * variants.length)];
    
    if (this.analytics) {
      await this.analytics.trackABTest(testName, selectedVariant.name, userId, null);
    }

    return selectedVariant;
  }
}