import winston from 'winston';
import { EventEmitter } from 'events';

export class ProactiveEngagement extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.database = options.database;
    this.analytics = options.analytics;
    this.aiManager = options.aiManager;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });

    // Engagement triggers and rules
    this.engagementTriggers = {
      // User hasn't engaged in X days
      'dormant_user': {
        condition: 'days_since_last_interaction > 7',
        priority: 'medium',
        maxFrequency: '1_per_week',
        messageType: 're_engagement'
      },
      
      // User showed interest but didn't follow through
      'abandoned_journey': {
        condition: 'started_consultation_no_followup',
        priority: 'high',
        maxFrequency: '1_per_day',
        messageType: 'journey_continuation'
      },
      
      // Seasonal hair care reminders
      'seasonal_reminder': {
        condition: 'seasonal_change_approaching',
        priority: 'low',
        maxFrequency: '1_per_month',
        messageType: 'seasonal_tips'
      },
      
      // Product recommendation follow-up
      'product_followup': {
        condition: 'product_recommended_no_feedback',
        priority: 'medium',
        maxFrequency: '1_per_week',
        messageType: 'product_feedback'
      },
      
      // Journey stage progression
      'journey_progression': {
        condition: 'ready_for_next_stage',
        priority: 'high',
        maxFrequency: '1_per_week',
        messageType: 'stage_advancement'
      },
      
      // Educational content opportunity
      'education_opportunity': {
        condition: 'knowledge_gap_identified',
        priority: 'low',
        maxFrequency: '2_per_week',
        messageType: 'educational_content'
      },
      
      // Success celebration
      'success_celebration': {
        condition: 'positive_outcome_achieved',
        priority: 'medium',
        maxFrequency: '1_per_month',
        messageType: 'celebration'
      }
    };

    // Message templates for different engagement types
    this.messageTemplates = {
      're_engagement': [
        "Hi {name}! It's been a while since we last chatted about your hair care journey. How has your routine been working for you?",
        "Hey {name}! I've been thinking about your {hair_type} hair goals. Ready to take the next step in your journey?",
        "Hello {name}! I have some new tips for {primary_concern} that might interest you. Want to hear about them?"
      ],
      
      'journey_continuation': [
        "Hi {name}! I noticed you were interested in improving your {primary_concern}. Should we pick up where we left off?",
        "Hey {name}! I have some personalized recommendations ready for your hair care consultation. Shall we continue?",
        "Hello {name}! Based on our previous conversation, I found some great solutions for your {hair_goal}. Want to explore them?"
      ],
      
      'seasonal_tips': [
        "Hi {name}! With {season} approaching, your {hair_type} hair might need some routine adjustments. Want some seasonal tips?",
        "Hey {name}! {Season} weather can affect your hair differently. Let me share some protective strategies for your {hair_type} hair.",
        "Hello {name}! Ready to prep your {hair_type} hair for {season}? I have some great seasonal care tips!"
      ],
      
      'product_feedback': [
        "Hi {name}! How has the {product_name} been working for your {hair_type} hair? I'd love to hear your thoughts!",
        "Hey {name}! It's been a few weeks since you showed interest in {product_name}. Any questions or feedback?",
        "Hello {name}! I'm curious about your experience with {product_name} for your {primary_concern}. How's it going?"
      ],
      
      'stage_advancement': [
        "Hi {name}! You've been doing great with your {current_stage} routine. Ready to level up your hair care game?",
        "Hey {name}! Based on your progress, you might be ready for some advanced {hair_type} techniques. Interested?",
        "Hello {name}! I think you're ready to move from {current_stage} to {next_stage} in your hair journey. Want to explore?"
      ],
      
      'educational_content': [
        "Hi {name}! I came across some great information about {topic} that relates to your {hair_type} hair. Want to learn more?",
        "Hey {name}! There's a hair care myth about {topic} I'd love to debunk for you. Interested in the real facts?",
        "Hello {name}! I have some science-backed tips for {primary_concern} that might surprise you. Want to hear them?"
      ],
      
      'celebration': [
        "Hi {name}! I'm so excited to hear about your hair care success with {achievement}! How are you feeling about your progress?",
        "Hey {name}! Congratulations on reaching your {hair_goal}! Ready to set some new exciting hair goals?",
        "Hello {name}! Your dedication to your {hair_type} hair journey is inspiring! What's been your biggest win lately?"
      ]
    };

    // Engagement scoring factors
    this.engagementFactors = {
      'recency': { weight: 0.25, maxDays: 30 },
      'frequency': { weight: 0.20, maxInteractions: 50 },
      'satisfaction': { weight: 0.20, minScore: 0, maxScore: 5 },
      'journey_progress': { weight: 0.15, stages: 8 },
      'response_rate': { weight: 0.10, minRate: 0, maxRate: 1 },
      'session_depth': { weight: 0.10, minMessages: 1, maxMessages: 20 }
    };

    // Start proactive engagement monitoring
    this.startEngagementMonitoring();
  }

  startEngagementMonitoring() {
    // Check for engagement opportunities every hour
    this.monitoringInterval = setInterval(async () => {
      await this.checkForEngagementOpportunities();
    }, 3600000); // 1 hour

    this.logger.info('Proactive engagement monitoring started');
  }

  async checkForEngagementOpportunities() {
    try {
      if (!this.database) return;

      // Get users eligible for proactive engagement
      const eligibleUsers = await this.database.getEligibleUsersForProactiveEngagement();
      
      for (const user of eligibleUsers) {
        const opportunities = await this.evaluateEngagementOpportunities(user);
        
        for (const opportunity of opportunities) {
          if (await this.shouldSendEngagement(user.user_id, opportunity)) {
            await this.sendProactiveMessage(user, opportunity);
          }
        }
      }

    } catch (error) {
      this.logger.error('Error checking engagement opportunities:', error);
    }
  }

  async checkEngagementOpportunity(userId, userMessage, aiResponse) {
    try {
      const user = await this.database.getUserProfile(userId);
      if (!user) return;

      // Analyze the conversation for engagement signals
      const signals = this.analyzeConversationSignals(userMessage, aiResponse);
      
      // Check for immediate follow-up opportunities
      const immediateOpportunities = this.identifyImmediateOpportunities(signals, user);
      
      // Schedule future engagement if appropriate
      for (const opportunity of immediateOpportunities) {
        await this.scheduleEngagement(user, opportunity);
      }

    } catch (error) {
      this.logger.warn('Error checking engagement opportunity:', error);
    }
  }

  async evaluateEngagementOpportunities(user) {
    const opportunities = [];
    
    try {
      // Check each engagement trigger
      for (const [triggerName, trigger] of Object.entries(this.engagementTriggers)) {
        const isTriggered = await this.evaluateTriggerCondition(user, trigger.condition);
        
        if (isTriggered) {
          const score = await this.calculateEngagementScore(user, triggerName);
          
          opportunities.push({
            triggerName,
            trigger,
            score,
            priority: trigger.priority,
            messageType: trigger.messageType
          });
        }
      }

      // Sort by score and priority
      return opportunities.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const aPriorityScore = priorityWeight[a.priority] || 1;
        const bPriorityScore = priorityWeight[b.priority] || 1;
        
        // First by priority, then by engagement score
        if (aPriorityScore !== bPriorityScore) {
          return bPriorityScore - aPriorityScore;
        }
        return b.score - a.score;
      });

    } catch (error) {
      this.logger.error('Error evaluating engagement opportunities:', error);
      return [];
    }
  }

  async evaluateTriggerCondition(user, condition) {
    const now = new Date();
    
    switch (condition) {
      case 'days_since_last_interaction > 7':
        if (!user.last_interaction) return true;
        const daysSinceLastInteraction = (now - new Date(user.last_interaction)) / (1000 * 60 * 60 * 24);
        return daysSinceLastInteraction > 7;
        
      case 'started_consultation_no_followup':
        // Check if user started a consultation but didn't complete follow-up actions
        return await this.database.hasIncompleteConsultation(user.user_id);
        
      case 'seasonal_change_approaching':
        // Check if we're within 2 weeks of a seasonal change
        return this.isSeasonalChangeApproaching();
        
      case 'product_recommended_no_feedback':
        // Check if products were recommended but no feedback received
        return await this.database.hasUnacknowledgedProductRecommendations(user.user_id);
        
      case 'ready_for_next_stage':
        // Check if user is ready to progress to next journey stage
        return await this.isReadyForJourneyProgression(user);
        
      case 'knowledge_gap_identified':
        // Check if user has shown knowledge gaps we can address
        return await this.database.hasIdentifiedKnowledgeGaps(user.user_id);
        
      case 'positive_outcome_achieved':
        // Check if user has achieved positive outcomes worth celebrating
        return await this.database.hasPositiveOutcomes(user.user_id);
        
      default:
        return false;
    }
  }

  async calculateEngagementScore(user, triggerName) {
    let score = 0;
    
    try {
      const userStats = await this.database.getUserEngagementStats(user.user_id);
      
      // Recency score (more recent = higher score)
      if (userStats.daysSinceLastInteraction !== undefined) {
        const recencyScore = Math.max(0, 1 - (userStats.daysSinceLastInteraction / this.engagementFactors.recency.maxDays));
        score += recencyScore * this.engagementFactors.recency.weight;
      }
      
      // Frequency score
      if (userStats.totalInteractions !== undefined) {
        const frequencyScore = Math.min(1, userStats.totalInteractions / this.engagementFactors.frequency.maxInteractions);
        score += frequencyScore * this.engagementFactors.frequency.weight;
      }
      
      // Satisfaction score
      if (userStats.averageSatisfaction !== undefined) {
        const satisfactionScore = userStats.averageSatisfaction / 5; // Normalize to 0-1
        score += satisfactionScore * this.engagementFactors.satisfaction.weight;
      }
      
      // Journey progress score
      if (user.journey_stage) {
        const stages = ['discovery', 'transition', 'learning', 'experimentation', 'stabilization', 'optimization', 'maintenance', 'mastery'];
        const stageIndex = stages.indexOf(user.journey_stage);
        const progressScore = stageIndex / (stages.length - 1);
        score += progressScore * this.engagementFactors.journey_progress.weight;
      }
      
      // Response rate score
      if (userStats.responseRate !== undefined) {
        score += userStats.responseRate * this.engagementFactors.response_rate.weight;
      }
      
      // Session depth score
      if (userStats.averageSessionDepth !== undefined) {
        const depthScore = Math.min(1, userStats.averageSessionDepth / this.engagementFactors.session_depth.maxMessages);
        score += depthScore * this.engagementFactors.session_depth.weight;
      }

    } catch (error) {
      this.logger.warn('Error calculating engagement score:', error);
      score = 0.5; // Default moderate score
    }

    return Math.max(0, Math.min(1, score)); // Clamp to 0-1 range
  }

  async shouldSendEngagement(userId, opportunity) {
    try {
      // Check frequency limits
      const recentEngagements = await this.database.getRecentProactiveEngagements(
        userId, 
        opportunity.trigger.maxFrequency
      );
      
      if (recentEngagements.length > 0) {
        return false;
      }
      
      // Check user preferences
      const preferences = await this.database.getUserEngagementPreferences(userId);
      if (preferences && !preferences.allowProactiveMessages) {
        return false;
      }
      
      // Minimum score threshold
      if (opportunity.score < 0.3) {
        return false;
      }
      
      // Don't send during user's inactive hours
      const userTimezone = preferences?.timezone || 'America/New_York';
      const userTime = new Date().toLocaleString('en-US', { timeZone: userTimezone });
      const hour = new Date(userTime).getHours();
      
      if (hour < 8 || hour > 22) { // Avoid early morning and late night
        return false;
      }

      return true;
      
    } catch (error) {
      this.logger.error('Error checking if should send engagement:', error);
      return false;
    }
  }

  async sendProactiveMessage(user, opportunity) {
    try {
      // Select appropriate message template
      const templates = this.messageTemplates[opportunity.messageType] || this.messageTemplates['re_engagement'];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Personalize the message
      const personalizedMessage = await this.personalizeMessage(template, user, opportunity);
      
      // Generate AI response for context
      let aiContext = '';
      if (this.aiManager) {
        try {
          const contextPrompt = `Create a brief, engaging follow-up context for a proactive message about ${opportunity.messageType} for a user with ${user.hair_type || 'natural'} hair. Keep it under 100 words and helpful.`;
          
          const aiResponse = await this.aiManager.generateResponse({
            prompt: contextPrompt,
            context: { conversationType: 'proactive_engagement', urgency: 'low' },
            userId: user.user_id,
            requestId: `proactive_${Date.now()}`
          });
          
          aiContext = aiResponse.text;
        } catch (error) {
          this.logger.warn('Could not generate AI context for proactive message:', error);
        }
      }

      // Store the proactive engagement
      await this.database.logProactiveEngagement({
        userId: user.user_id,
        triggerName: opportunity.triggerName,
        messageType: opportunity.messageType,
        message: personalizedMessage,
        aiContext,
        engagementScore: opportunity.score,
        priority: opportunity.priority
      });

      // Emit event for external handling (e.g., sending via email, push notification, etc.)
      this.emit('proactive_message', {
        user,
        message: personalizedMessage,
        aiContext,
        opportunity,
        timestamp: new Date()
      });

      this.logger.info('Proactive message sent', {
        userId: user.user_id,
        triggerName: opportunity.triggerName,
        messageType: opportunity.messageType,
        score: opportunity.score
      });

    } catch (error) {
      this.logger.error('Error sending proactive message:', error);
    }
  }

  async personalizeMessage(template, user, opportunity) {
    let message = template;
    
    // Replace placeholders with user data
    const replacements = {
      '{name}': user.name || 'there',
      '{hair_type}': user.hair_type || 'beautiful',
      '{primary_concern}': user.primary_concerns?.[0] || 'hair care',
      '{hair_goal}': user.hair_goals?.[0] || 'healthy hair',
      '{current_stage}': user.journey_stage || 'current',
      '{next_stage}': this.getNextJourneyStage(user.journey_stage),
      '{season}': this.getCurrentSeason(),
      '{product_name}': 'our recommended product', // Would be populated from context
      '{topic}': this.getRelevantTopic(user),
      '{achievement}': 'your progress'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      message = message.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return message;
  }

  analyzeConversationSignals(userMessage, aiResponse) {
    const signals = {
      showedInterest: false,
      askedFollowUp: false,
      mentionedProduct: false,
      expressedFrustration: false,
      celebratedSuccess: false,
      requestedMoreInfo: false
    };

    const messageLower = userMessage.toLowerCase();
    
    // Interest signals
    const interestKeywords = ['interested', 'tell me more', 'sounds good', 'yes', 'please', 'want to know'];
    signals.showedInterest = interestKeywords.some(keyword => messageLower.includes(keyword));
    
    // Follow-up signals
    const followUpKeywords = ['what about', 'also', 'and', 'but what if', 'how about'];
    signals.askedFollowUp = followUpKeywords.some(keyword => messageLower.includes(keyword));
    
    // Product mention signals
    const productKeywords = ['product', 'shampoo', 'conditioner', 'cream', 'oil', 'mask'];
    signals.mentionedProduct = productKeywords.some(keyword => messageLower.includes(keyword));
    
    // Frustration signals
    const frustrationKeywords = ['not working', 'frustrated', 'annoyed', 'difficult', 'confusing'];
    signals.expressedFrustration = frustrationKeywords.some(keyword => messageLower.includes(keyword));
    
    // Success signals
    const successKeywords = ['working', 'great', 'love', 'amazing', 'better', 'improved'];
    signals.celebratedSuccess = successKeywords.some(keyword => messageLower.includes(keyword));
    
    // More info signals
    const infoKeywords = ['explain', 'more details', 'how do', 'why does', 'what is'];
    signals.requestedMoreInfo = infoKeywords.some(keyword => messageLower.includes(keyword));

    return signals;
  }

  identifyImmediateOpportunities(signals, user) {
    const opportunities = [];
    
    if (signals.showedInterest && !signals.askedFollowUp) {
      opportunities.push({
        type: 'follow_up_interest',
        priority: 'high',
        delay: 1440 // 24 hours
      });
    }
    
    if (signals.mentionedProduct) {
      opportunities.push({
        type: 'product_education',
        priority: 'medium', 
        delay: 2880 // 48 hours
      });
    }
    
    if (signals.expressedFrustration) {
      opportunities.push({
        type: 'support_check_in',
        priority: 'high',
        delay: 720 // 12 hours
      });
    }
    
    if (signals.celebratedSuccess) {
      opportunities.push({
        type: 'success_amplification',
        priority: 'medium',
        delay: 4320 // 72 hours
      });
    }

    return opportunities;
  }

  async scheduleEngagement(user, opportunity) {
    const scheduledTime = new Date(Date.now() + (opportunity.delay * 60000)); // delay in minutes
    
    await this.database.scheduleProactiveEngagement({
      userId: user.user_id,
      engagementType: opportunity.type,
      priority: opportunity.priority,
      scheduledTime,
      context: { source: 'immediate_opportunity' }
    });
  }

  // Utility methods
  
  isSeasonalChangeApproaching() {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    
    // Check if within 2 weeks of seasonal changes
    const seasonalDates = [
      { month: 2, day: 6 }, // 2 weeks before spring (March 20)
      { month: 5, day: 6 }, // 2 weeks before summer (June 20)
      { month: 8, day: 8 }, // 2 weeks before fall (September 22)
      { month: 11, day: 6 } // 2 weeks before winter (December 20)
    ];
    
    return seasonalDates.some(date => 
      month === date.month && Math.abs(day - date.day) <= 7
    );
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getNextJourneyStage(currentStage) {
    const stages = ['discovery', 'transition', 'learning', 'experimentation', 'stabilization', 'optimization', 'maintenance', 'mastery'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : 'advanced techniques';
  }

  getRelevantTopic(user) {
    if (user.primary_concerns && user.primary_concerns.length > 0) {
      return user.primary_concerns[0];
    }
    if (user.hair_type) {
      return `${user.hair_type} hair care`;
    }
    return 'natural hair care';
  }

  async isReadyForJourneyProgression(user) {
    if (!user.journey_stage || !this.database) return false;
    
    try {
      const stageStats = await this.database.getUserJourneyStageStats(user.user_id);
      
      // User is ready if they've been in current stage for sufficient time
      // and have positive engagement
      return stageStats.daysInCurrentStage >= 14 && 
             stageStats.averageSatisfaction >= 4 &&
             stageStats.engagementLevel >= 0.7;
             
    } catch (error) {
      this.logger.warn('Error checking journey progression readiness:', error);
      return false;
    }
  }

  // Analytics and reporting
  
  async getProactiveEngagementMetrics(timeRange = '30d') {
    if (!this.database) return null;

    try {
      return await this.database.getProactiveEngagementAnalytics(timeRange);
    } catch (error) {
      this.logger.error('Error getting proactive engagement metrics:', error);
      return null;
    }
  }

  // Shutdown
  async shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.removeAllListeners();
    this.logger.info('Proactive engagement system shut down');
  }
}