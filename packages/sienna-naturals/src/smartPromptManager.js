import winston from 'winston';

export class SmartPromptManager {
  constructor(options) {
    this.brandName = options.brandName || 'Sienna Naturals';
    this.brandFocus = options.brandFocus || 'natural hair care';
    this.database = options.database;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });

    // Topic detection patterns
    this.topicPatterns = {
      hairTypes: [
        'type 1', 'type 2', 'type 3', 'type 4', 'straight', 'wavy', 'curly', 'coily',
        'fine hair', 'thick hair', 'dense hair', 'low density', 'high density',
        '1a', '1b', '1c', '2a', '2b', '2c', '3a', '3b', '3c', '4a', '4b', '4c'
      ],
      hairConcerns: [
        'dryness', 'breakage', 'split ends', 'frizz', 'tangles', 'shedding',
        'hair loss', 'thinning', 'damage', 'brittle', 'rough', 'dull',
        'scalp issues', 'dandruff', 'itchy scalp', 'oily scalp', 'sensitive scalp'
      ],
      hairGoals: [
        'growth', 'length retention', 'moisture', 'definition', 'shine', 'volume',
        'thickness', 'strength', 'softness', 'manageability', 'curl pattern',
        'protective styling', 'heat protection', 'color protection'
      ],
      styling: [
        'wash and go', 'twist out', 'braid out', 'protective style', 'silk press',
        'roller set', 'flexi rods', 'perm rods', 'bantu knots', 'flat iron',
        'blow dry', 'air dry', 'diffuser', 'plopping', 'scrunching'
      ],
      products: [
        'shampoo', 'conditioner', 'deep conditioner', 'leave-in', 'cream', 'gel',
        'mousse', 'oil', 'serum', 'mask', 'treatment', 'protein treatment',
        'moisturizing treatment', 'clarifying shampoo', 'co-wash', 'pre-poo'
      ],
      routine: [
        'wash day', 'routine', 'regimen', 'schedule', 'frequency', 'steps',
        'order', 'application', 'technique', 'method', 'timing', 'maintenance'
      ]
    };

    // Conversation contexts
    this.conversationContexts = {
      consultation: ['new', 'help', 'advice', 'recommend', 'suggest', 'guidance'],
      troubleshooting: ['problem', 'issue', 'wrong', 'not working', 'fix', 'solution'],
      education: ['learn', 'explain', 'understand', 'how', 'why', 'what', 'when'],
      shopping: ['buy', 'purchase', 'where', 'store', 'price', 'cost', 'product'],
      maintenance: ['maintain', 'keep', 'preserve', 'continue', 'routine', 'schedule']
    };

    // Hair journey stages
    this.hairJourneyStages = [
      'discovery', 'transition', 'learning', 'experimentation',
      'stabilization', 'optimization', 'maintenance', 'mastery'
    ];
  }

  async analyzeQueryContext(message, chatHistory = []) {
    const analysis = {
      topics: [],
      concerns: [],
      goals: [],
      conversationType: 'general',
      urgency: 'normal',
      complexity: 'medium',
      journeyStage: 'learning',
      sentiment: 'neutral',
      hasImages: false,
      followUp: false,
      productMentions: [],
      brandMentions: []
    };

    const messageLower = message.toLowerCase();
    const historyContext = chatHistory.slice(-3); // Last 3 messages for context

    // Analyze topics
    for (const [category, keywords] of Object.entries(this.topicPatterns)) {
      const matches = keywords.filter(keyword => messageLower.includes(keyword.toLowerCase()));
      if (matches.length > 0) {
        analysis.topics.push({
          category,
          keywords: matches,
          relevance: this.calculateRelevance(matches, messageLower)
        });
      }
    }

    // Analyze conversation type
    for (const [type, keywords] of Object.entries(this.conversationContexts)) {
      const matches = keywords.filter(keyword => messageLower.includes(keyword.toLowerCase()));
      if (matches.length > 0) {
        analysis.conversationType = type;
        break;
      }
    }

    // Determine urgency
    const urgencyKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'help!', 'crisis', 'severe'];
    if (urgencyKeywords.some(keyword => messageLower.includes(keyword))) {
      analysis.urgency = 'high';
    }

    // Analyze sentiment
    analysis.sentiment = this.analyzeSentiment(message);

    // Check for follow-up questions
    if (historyContext.length > 0) {
      const followUpIndicators = ['also', 'and', 'but', 'however', 'additionally', 'what about'];
      analysis.followUp = followUpIndicators.some(indicator => messageLower.includes(indicator));
    }

    // Analyze complexity
    analysis.complexity = this.analyzeComplexity(message, analysis.topics);

    // Detect hair journey stage
    analysis.journeyStage = this.detectJourneyStage(message, historyContext);

    // Extract product mentions
    analysis.productMentions = this.extractProductMentions(messageLower);

    // Extract brand mentions
    analysis.brandMentions = this.extractBrandMentions(messageLower);

    return analysis;
  }

  analyzeSentiment(message) {
    const positiveWords = [
      'love', 'amazing', 'great', 'wonderful', 'perfect', 'excellent', 'fantastic',
      'happy', 'pleased', 'satisfied', 'thank', 'grateful', 'works', 'success'
    ];
    
    const negativeWords = [
      'hate', 'terrible', 'awful', 'horrible', 'worst', 'frustrated', 'angry',
      'disappointed', 'annoyed', 'problem', 'issue', 'fail', 'doesn\'t work', 'broken'
    ];

    const messageLower = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  analyzeComplexity(message, topics) {
    let complexityScore = 0;

    // Message length factor
    if (message.length > 200) complexityScore += 2;
    else if (message.length > 100) complexityScore += 1;

    // Number of topics
    complexityScore += topics.length;

    // Question complexity
    const questionWords = ['how', 'why', 'what if', 'should i', 'can i combine'];
    const complexQuestions = questionWords.filter(q => message.toLowerCase().includes(q));
    complexityScore += complexQuestions.length * 2;

    // Multiple products mentioned
    const productCount = this.extractProductMentions(message.toLowerCase()).length;
    if (productCount > 2) complexityScore += 2;
    else if (productCount > 1) complexityScore += 1;

    if (complexityScore >= 5) return 'high';
    if (complexityScore >= 3) return 'medium';
    return 'low';
  }

  detectJourneyStage(message, historyContext) {
    const messageLower = message.toLowerCase();
    
    const stageIndicators = {
      discovery: ['new to', 'just started', 'beginning', 'first time', 'don\'t know'],
      transition: ['switching', 'changing', 'transitioning', 'going natural', 'big chop'],
      learning: ['how to', 'learn', 'understand', 'explain', 'what is', 'why does'],
      experimentation: ['trying', 'experiment', 'test', 'different', 'various', 'which one'],
      stabilization: ['routine', 'consistent', 'regular', 'established', 'works for me'],
      optimization: ['improve', 'better', 'enhance', 'perfect', 'fine-tune', 'adjust'],
      maintenance: ['maintain', 'keep', 'preserve', 'continue', 'same routine'],
      mastery: ['advanced', 'expert', 'help others', 'recommend', 'experience', 'years']
    };

    let maxScore = 0;
    let detectedStage = 'learning';

    for (const [stage, indicators] of Object.entries(stageIndicators)) {
      const score = indicators.filter(indicator => messageLower.includes(indicator)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedStage = stage;
      }
    }

    return detectedStage;
  }

  extractProductMentions(messageLower) {
    const productKeywords = [
      'shampoo', 'conditioner', 'leave-in', 'cream', 'gel', 'oil', 'serum',
      'mask', 'treatment', 'mousse', 'foam', 'butter', 'pomade', 'wax'
    ];
    
    return productKeywords.filter(product => messageLower.includes(product));
  }

  extractBrandMentions(messageLower) {
    const commonBrands = [
      'sienna naturals', 'cantu', 'shea moisture', 'carol\'s daughter',
      'mielle', 'design essentials', 'ouidad', 'devacurl', 'mixed chicks'
    ];
    
    return commonBrands.filter(brand => messageLower.includes(brand));
  }

  calculateRelevance(matches, message) {
    const totalWords = message.split(' ').length;
    const matchedWords = matches.length;
    return Math.min((matchedWords / totalWords) * 10, 10);
  }

  async buildSmartPrompt(userId, message, chatHistory, userInfo, chatsSummary) {
    try {
      // Analyze the current query
      const context = await this.analyzeQueryContext(message, chatHistory);
      
      // Get user's hair profile and preferences
      const hairProfile = await this.getUserHairProfile(userId, userInfo);
      
      // Build dynamic prompt based on context
      let prompt = await this.buildContextualPrompt(context, hairProfile, userInfo);
      
      // Add conversation history context
      if (chatHistory.length > 0) {
        prompt += this.buildHistoryContext(chatHistory, context);
      }
      
      // Add user-specific context
      prompt += this.buildUserContext(userInfo, hairProfile, chatsSummary);
      
      // Add the current question
      prompt += `\n\nCurrent Question: "${message}"\n\n`;
      
      // Add response guidelines based on context
      prompt += this.buildResponseGuidelines(context, hairProfile);
      
      // Log prompt analytics for optimization
      await this.logPromptAnalytics(userId, context, prompt.length);
      
      return prompt;
      
    } catch (error) {
      this.logger.error('Error building smart prompt:', error);
      return this.buildFallbackPrompt(message, userInfo);
    }
  }

  async buildContextualPrompt(context, hairProfile, userInfo) {
    let prompt = `You are an expert ${this.brandName} hair care consultant specializing in ${this.brandFocus}. `;

    // Add context-specific expertise
    switch (context.conversationType) {
      case 'consultation':
        prompt += `You're conducting a personalized hair care consultation. Focus on understanding the client's needs, hair type, concerns, and goals. Provide detailed, actionable recommendations.`;
        break;
      case 'troubleshooting':
        prompt += `You're helping solve a specific hair care problem. Be methodical in identifying the root cause and provide step-by-step solutions. Consider environmental factors and product interactions.`;
        break;
      case 'education':
        prompt += `You're teaching about hair care science and techniques. Explain concepts clearly, use analogies when helpful, and provide the 'why' behind recommendations.`;
        break;
      case 'shopping':
        prompt += `You're helping with product selection and purchasing decisions. Consider budget, availability, and compatibility with existing routine. Provide specific product recommendations with reasoning.`;
        break;
      case 'maintenance':
        prompt += `You're helping maintain and optimize an existing hair care routine. Focus on consistency, timing, and long-term hair health strategies.`;
        break;
      default:
        prompt += `Provide comprehensive, personalized hair care guidance tailored to the individual's specific needs and goals.`;
    }

    // Add hair type specific guidance
    if (hairProfile.hairType) {
      prompt += ` The client has ${hairProfile.hairType} hair`;
      if (hairProfile.porosity) {
        prompt += ` with ${hairProfile.porosity} porosity`;
      }
      if (hairProfile.density) {
        prompt += ` and ${hairProfile.density} density`;
      }
      prompt += `.`;
    }

    // Add urgency context
    if (context.urgency === 'high') {
      prompt += ` This is an urgent concern that requires immediate attention and practical solutions.`;
    }

    // Add journey stage context
    const journeyGuidance = {
      discovery: 'The client is new to natural hair care. Use simple language, explain basics, and provide foundational guidance.',
      transition: 'The client is transitioning their hair care approach. Focus on patience, gentle methods, and managing expectations.',
      learning: 'The client is actively learning. Provide educational content, explain the science, and encourage experimentation.',
      experimentation: 'The client is trying different approaches. Help evaluate results, adjust techniques, and find what works.',
      stabilization: 'The client is establishing a routine. Focus on consistency, timing, and building sustainable habits.',
      optimization: 'The client wants to improve their results. Provide advanced techniques and fine-tuning advice.',
      maintenance: 'The client has an established routine. Focus on long-term maintenance and prevention strategies.',
      mastery: 'The client is experienced. Provide advanced insights and consider them a peer in the conversation.'
    };

    prompt += ` ${journeyGuidance[context.journeyStage] || journeyGuidance.learning}`;

    return prompt + '\n\n';
  }

  buildHistoryContext(chatHistory, context) {
    let historyPrompt = 'Recent Conversation Context:\n';
    
    const recentMessages = chatHistory.slice(-3);
    recentMessages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'Client' : 'You';
      historyPrompt += `${role}: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}\n`;
    });

    if (context.followUp) {
      historyPrompt += '\nThis appears to be a follow-up question. Build upon the previous conversation and maintain continuity.\n';
    }

    return historyPrompt + '\n';
  }

  buildUserContext(userInfo, hairProfile, chatsSummary) {
    let userContext = 'Client Profile:\n';
    
    if (userInfo.name) {
      userContext += `Name: ${userInfo.name}\n`;
    }
    
    if (hairProfile.concerns && hairProfile.concerns.length > 0) {
      userContext += `Primary Concerns: ${hairProfile.concerns.join(', ')}\n`;
    }
    
    if (hairProfile.goals && hairProfile.goals.length > 0) {
      userContext += `Hair Goals: ${hairProfile.goals.join(', ')}\n`;
    }
    
    if (hairProfile.currentRoutine) {
      userContext += `Current Routine: ${hairProfile.currentRoutine}\n`;
    }
    
    if (hairProfile.productAllergies && hairProfile.productAllergies.length > 0) {
      userContext += `Allergies/Sensitivities: ${hairProfile.productAllergies.join(', ')}\n`;
    }
    
    if (chatsSummary && chatsSummary.length > 0) {
      userContext += `\nPrevious Session Insights: ${chatsSummary.substring(0, 200)}${chatsSummary.length > 200 ? '...' : ''}\n`;
    }

    return userContext + '\n';
  }

  buildResponseGuidelines(context, hairProfile) {
    let guidelines = 'Response Guidelines:\n';
    
    // Tone and style based on context
    switch (context.sentiment) {
      case 'negative':
        guidelines += '- Use empathetic, supportive tone. Acknowledge frustrations and provide hope.\n';
        break;
      case 'positive':
        guidelines += '- Match the positive energy. Celebrate successes and build on enthusiasm.\n';
        break;
      default:
        guidelines += '- Use warm, professional, and encouraging tone.\n';
    }

    // Complexity guidelines
    switch (context.complexity) {
      case 'high':
        guidelines += '- Break down complex topics into digestible steps.\n- Prioritize the most important actions.\n';
        break;
      case 'low':
        guidelines += '- Provide concise, direct answers while being thorough.\n';
        break;
      default:
        guidelines += '- Balance detail with clarity. Use examples when helpful.\n';
    }

    // Brand-specific guidelines
    guidelines += `- Recommend ${this.brandName} products when appropriate, explaining why they're suitable.\n`;
    guidelines += '- Focus on natural, gentle approaches that promote hair health.\n';
    guidelines += '- Include practical tips that can be implemented immediately.\n';
    guidelines += '- If suggesting products from other brands, explain the reasoning.\n';

    // Safety guidelines
    guidelines += '- Always prioritize hair and scalp health over aesthetic goals.\n';
    guidelines += '- Warn about potential risks or side effects when relevant.\n';
    guidelines += '- Suggest professional consultation for serious concerns.\n';

    return guidelines;
  }

  async getUserHairProfile(userId, userInfo) {
    try {
      if (this.database) {
        const profile = await this.database.getUserHairProfile(userId);
        if (profile) return profile;
      }
      
      // Fallback to basic profile from userInfo
      return {
        hairType: userInfo.hairType || 'unknown',
        porosity: userInfo.porosity || 'unknown',
        density: userInfo.density || 'unknown',
        concerns: userInfo.concerns || [],
        goals: userInfo.goals || [],
        currentRoutine: userInfo.currentRoutine || '',
        productAllergies: userInfo.allergies || []
      };
    } catch (error) {
      this.logger.warn('Could not fetch hair profile:', error);
      return {
        hairType: 'unknown',
        porosity: 'unknown',
        density: 'unknown',
        concerns: [],
        goals: [],
        currentRoutine: '',
        productAllergies: []
      };
    }
  }

  buildFallbackPrompt(message, userInfo) {
    return `You are a ${this.brandName} hair care expert specializing in ${this.brandFocus}. 
    
Provide helpful, personalized advice for this hair care question: "${message}"

Focus on:
- Natural hair care approaches
- Gentle, health-focused solutions  
- Practical, actionable advice
- ${this.brandName} product recommendations when appropriate

Keep your response warm, professional, and encouraging.`;
  }

  async logPromptAnalytics(userId, context, promptLength) {
    try {
      if (this.database) {
        await this.database.logPromptAnalytics({
          userId,
          conversationType: context.conversationType,
          complexity: context.complexity,
          journeyStage: context.journeyStage,
          topicCount: context.topics.length,
          promptLength,
          urgency: context.urgency,
          sentiment: context.sentiment,
          timestamp: new Date()
        });
      }
    } catch (error) {
      this.logger.warn('Failed to log prompt analytics:', error);
    }
  }

  // Method to analyze and improve prompt effectiveness
  async analyzePromptEffectiveness(timeRange = '7d') {
    try {
      if (!this.database) return null;

      const analytics = await this.database.getPromptAnalytics(timeRange);
      
      const analysis = {
        totalPrompts: analytics.length,
        averageLength: analytics.reduce((sum, p) => sum + p.promptLength, 0) / analytics.length,
        conversationTypes: this.groupBy(analytics, 'conversationType'),
        complexityDistribution: this.groupBy(analytics, 'complexity'),
        journeyStageDistribution: this.groupBy(analytics, 'journeyStage'),
        sentimentDistribution: this.groupBy(analytics, 'sentiment'),
        recommendations: []
      };

      // Generate optimization recommendations
      if (analysis.averageLength > 1500) {
        analysis.recommendations.push('Consider reducing average prompt length for better performance');
      }
      
      if (analysis.complexityDistribution.high > analysis.totalPrompts * 0.3) {
        analysis.recommendations.push('High complexity queries are common - consider better context pre-processing');
      }

      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing prompt effectiveness:', error);
      return null;
    }
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }
}