"use client";
import { useState, useEffect, useRef } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCopilotAction } from "@copilotkit/react-core";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import LoadingSpinner from './Loading';

const ChatMessageLayer = ({ user_id }) => {
  // State Management
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'details'
  const [sortBy, setSortBy] = useState('recent');
  const messagesEndRef = useRef(null);

  // CopilotKit Actions
  // Action 1: Conversation Analysis
  useCopilotAction({
    name: "analyzeConversation",
    description: "Analyzes selected conversation for insights, sentiment, and patterns",
    parameters: [
      {
        name: "conversationId",
        type: "string",
        description: "ID of the conversation to analyze",
      },
      {
        name: "analysisType",
        type: "string",
        description: "Type of analysis: sentiment, topics, issues, recommendations",
      }
    ],
    handler: async ({ conversationId, analysisType }) => {
      setIsAnalyzing(true);
      
      try {
        // Simulate AI analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (!conversation) {
          throw new Error("Conversation not found");
        }

        let insights = {};
        
        switch(analysisType) {
          case "sentiment":
            insights = {
              type: "sentiment",
              overall: "positive",
              score: 0.75,
              breakdown: {
                positive: 60,
                neutral: 30,
                negative: 10
              },
              keyMoments: [
                { message: "Thank you so much for the recommendation!", sentiment: "very_positive" },
                { message: "I'm not sure about this product", sentiment: "uncertain" }
              ]
            };
            break;
            
          case "topics":
            insights = {
              type: "topics",
              mainTopics: [
                { topic: "Hair Care Routine", confidence: 0.9, mentions: 12 },
                { topic: "Product Recommendations", confidence: 0.8, mentions: 8 },
                { topic: "Hair Type Assessment", confidence: 0.7, mentions: 5 }
              ],
              trendingConcerns: ["Dryness", "Breakage", "Product Selection"],
              recommendedActions: [
                "Follow up with personalized product suggestions",
                "Provide hair care routine guide",
                "Schedule hair assessment"
              ]
            };
            break;
            
          case "issues":
            insights = {
              type: "issues",
              identifiedIssues: [
                {
                  issue: "Product compatibility concern",
                  severity: "medium",
                  resolution: "Provide ingredient analysis and alternatives"
                },
                {
                  issue: "Confusion about hair type classification",
                  severity: "low", 
                  resolution: "Send hair type identification guide"
                }
              ],
              resolutionRate: 85,
              followUpNeeded: true
            };
            break;
            
          case "recommendations":
            insights = {
              type: "recommendations",
              userProfile: {
                hairType: "4B",
                concerns: ["Dryness", "Length retention"],
                experience: "Intermediate"
              },
              recommendedProducts: [
                { name: "Moisture Lock Leave-In", match: 95 },
                { name: "Strengthening Hair Mask", match: 88 },
                { name: "Gentle Cleansing Conditioner", match: 82 }
              ],
              nextSteps: [
                "Schedule virtual hair consultation",
                "Create personalized routine plan",
                "Set up progress tracking"
              ]
            };
            break;
            
          default:
            insights = {
              type: "general",
              summary: "This conversation shows positive engagement with personalized hair care guidance.",
              keyInsights: [
                "User is actively seeking natural hair care solutions",
                "Strong interest in product recommendations",
                "Values scientific approach to hair care"
              ]
            };
        }
        
        setAiInsights(insights);
        return insights;
        
      } catch (error) {
        console.error("Analysis failed:", error);
        setError("Failed to analyze conversation. Please try again.");
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
  });

  // Action 2: Conversation Management
  useCopilotAction({
    name: "manageConversation",
    description: "Performs management actions on conversations like tagging, prioritizing, or archiving",
    parameters: [
      {
        name: "conversationId",
        type: "string",
        description: "ID of the conversation to manage",
      },
      {
        name: "action",
        type: "string",
        description: "Management action: tag, priority, archive, follow_up, export",
      },
      {
        name: "value",
        type: "string",
        description: "Value for the action (tag name, priority level, etc.)",
        required: false,
      }
    ],
    handler: async ({ conversationId, action, value }) => {
      try {
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (!conversation) {
          throw new Error("Conversation not found");
        }

        let result = "";
        
        switch(action) {
          case "tag":
            // Simulate tagging
            conversation.tags = conversation.tags || [];
            conversation.tags.push(value || "important");
            result = `Tagged conversation with "${value || "important"}"`;
            break;
            
          case "priority":
            conversation.priority = value || "high";
            result = `Set conversation priority to ${value || "high"}`;
            break;
            
          case "archive":
            conversation.archived = true;
            result = "Conversation archived successfully";
            break;
            
          case "follow_up":
            conversation.followUp = {
              scheduled: true,
              date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              type: value || "general"
            };
            result = `Follow-up scheduled for tomorrow (${value || "general"} follow-up)`;
            break;
            
          case "export":
            result = "Conversation export prepared. Download will begin shortly.";
            // In real implementation, trigger download
            break;
            
          default:
            result = "Unknown action requested";
        }
        
        setConversations([...conversations]);
        return result;
        
      } catch (error) {
        console.error("Management action failed:", error);
        return "Failed to perform action. Please try again.";
      }
    },
  });

  // Action 3: Smart Search and Filter
  useCopilotAction({
    name: "smartSearchConversations",
    description: "Performs intelligent search across conversations using natural language queries",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Natural language search query",
      },
      {
        name: "filters",
        type: "string",
        description: "Additional filters: date, sentiment, topic, user_type",
        required: false,
      }
    ],
    handler: async ({ query, filters }) => {
      setLoading(true);
      
      try {
        // Simulate intelligent search
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In real implementation, this would use AI to understand the query
        const searchResults = conversations.filter(conv => {
          const searchText = query.toLowerCase();
          
          // Simple keyword matching (in real app, use semantic search)
          const messageMatch = conv.messages?.some(msg => 
            msg.content?.toLowerCase().includes(searchText)
          );
          
          const metaMatch = (
            conv.user?.name?.toLowerCase().includes(searchText) ||
            conv.topic?.toLowerCase().includes(searchText) ||
            conv.tags?.some(tag => tag.toLowerCase().includes(searchText))
          );
          
          return messageMatch || metaMatch;
        });
        
        setConversations(searchResults);
        setSearchQuery(query);
        
        return `Found ${searchResults.length} conversations matching "${query}"`;
        
      } catch (error) {
        console.error("Search failed:", error);
        return "Search failed. Please try again.";
      } finally {
        setLoading(false);
      }
    },
  });

  // Action 4: Generate Response Suggestions
  useCopilotAction({
    name: "generateResponseSuggestions",
    description: "Generates AI-powered response suggestions for conversations",
    parameters: [
      {
        name: "conversationId",
        type: "string",
        description: "ID of the conversation to generate responses for",
      },
      {
        name: "responseType",
        type: "string",
        description: "Type of response: helpful, educational, product_rec, follow_up",
      }
    ],
    handler: async ({ conversationId, responseType }) => {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const suggestions = {
        "helpful": [
          "Thank you for sharing your hair journey with us! Based on what you've described, I'd recommend trying our moisture-retention routine.",
          "I understand your concerns about hair breakage. Let me suggest some gentle handling techniques that have helped many of our community members.",
          "Your hair goals are absolutely achievable! Here's a personalized plan to help you get there step by step."
        ],
        "educational": [
          "Did you know that hair porosity plays a crucial role in product absorption? Here's how to determine your hair's porosity level.",
          "The science behind curl pattern classification can help you choose the right products. Your hair appears to be in the Type 4 family.",
          "Natural hair requires a balance of protein and moisture. Here are signs to look for to maintain that balance."
        ],
        "product_rec": [
          "Based on your hair type and concerns, I recommend our Moisture Lock Leave-In Conditioner paired with the Strengthening Hair Mask.",
          "For your specific needs, these three products would create an excellent foundation routine: [product suggestions with explanations]",
          "I've curated a selection of products that align with your hair goals and budget preferences."
        ],
        "follow_up": [
          "How has your new routine been working? I'd love to hear about your progress and adjust recommendations if needed.",
          "It's been a week since we discussed your hair care plan. Any questions or concerns I can help address?",
          "Your progress photos look amazing! Let's discuss the next steps in your hair journey."
        ]
      };
      
      return suggestions[responseType] || suggestions["helpful"];
    },
  });

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/conversations?search=${searchQuery}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Simulate additional data for demo
        const enrichedData = data.map((conv, index) => ({
          ...conv,
          id: conv.id || `conv_${index}`,
          sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          tags: ['hair-care', 'product-inquiry', 'routine-help'][Math.floor(Math.random() * 3)],
          unread: Math.random() > 0.7,
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          messageCount: Math.floor(Math.random() * 20) + 1
        }));
        
        setConversations(enrichedData);
        if (enrichedData.length > 0 && !selectedConversation) {
          setSelectedConversation(enrichedData[0]);
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [searchQuery]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    switch(activeFilter) {
      case 'unread': return conv.unread;
      case 'priority': return conv.priority === 'high';
      case 'recent': return new Date(conv.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      default: return true;
    }
  });

  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch(sortBy) {
      case 'recent': return new Date(b.lastActivity) - new Date(a.lastActivity);
      case 'oldest': return new Date(a.lastActivity) - new Date(b.lastActivity);
      case 'priority': 
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default: return 0;
    }
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="sienna-chat-container">
      <motion.div
        className="chat-layout"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <ChatHeader 
          totalConversations={conversations.length}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main Content */}
        <div className="chat-main">
          {viewMode === 'split' ? (
            <>
              <ConversationsList
                conversations={sortedConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
              />
              <ConversationDetails
                conversation={selectedConversation}
                aiInsights={aiInsights}
                isAnalyzing={isAnalyzing}
              />
            </>
          ) : viewMode === 'list' ? (
            <ConversationsList
              conversations={sortedConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              fullWidth={true}
            />
          ) : (
            <ConversationDetails
              conversation={selectedConversation}
              aiInsights={aiInsights}
              isAnalyzing={isAnalyzing}
              fullWidth={true}
            />
          )}
        </div>

        {/* CopilotKit Assistant Panel */}
        <CopilotAssistantPanel 
          selectedConversation={selectedConversation}
          isAnalyzing={isAnalyzing}
        />
      </motion.div>

      {/* Custom Styles */}
      <style jsx>{`
        .sienna-chat-container {
          font-family: var(--sienna-font-primary);
          background: var(--sienna-gradient-pearl);
          min-height: 100vh;
          padding: 1rem;
        }

        .chat-layout {
          max-width: 1600px;
          margin: 0 auto;
          background: var(--sienna-white);
          border-radius: var(--sienna-radius-lg);
          box-shadow: var(--sienna-shadow-luxury);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 2rem);
        }

        .chat-main {
          flex: 1;
          display: grid;
          grid-template-columns: 400px 1fr;
          overflow: hidden;
        }

        .chat-main.list-mode {
          grid-template-columns: 1fr;
        }

        .chat-main.details-mode {
          grid-template-columns: 1fr;
        }

        @media (max-width: 768px) {
          .chat-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Header Component
const ChatHeader = ({ 
  totalConversations, 
  activeFilter, 
  setActiveFilter, 
  viewMode, 
  setViewMode,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery 
}) => (
  <motion.div 
    className="chat-header"
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="header-content">
      <div className="header-left">
        <h1 className="header-title">
          <Icon icon="solar:chat-round-bold-duotone" className="title-icon" />
          Conversations
        </h1>
        <p className="header-subtitle">
          {totalConversations} conversations • AI-powered insights
        </p>
      </div>

      <div className="header-controls">
        <div className="search-container">
          <Icon icon="solar:magnifier-bold" className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All', icon: 'solar:list-bold' },
            { key: 'unread', label: 'Unread', icon: 'solar:bell-bold' },
            { key: 'priority', label: 'Priority', icon: 'solar:star-bold' },
            { key: 'recent', label: 'Recent', icon: 'solar:clock-bold' }
          ].map(filter => (
            <button
              key={filter.key}
              className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              <Icon icon={filter.icon} />
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        <div className="view-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
          </select>

          <div className="view-mode-toggle">
            {[
              { key: 'split', icon: 'solar:sidebar-bold', title: 'Split View' },
              { key: 'list', icon: 'solar:list-bold', title: 'List View' },
              { key: 'details', icon: 'solar:document-bold', title: 'Details View' }
            ].map(mode => (
              <button
                key={mode.key}
                className={`view-btn ${viewMode === mode.key ? 'active' : ''}`}
                onClick={() => setViewMode(mode.key)}
                title={mode.title}
              >
                <Icon icon={mode.icon} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    <style jsx>{`
      .chat-header {
        background: linear-gradient(135deg, var(--sienna-white) 0%, var(--sienna-cream) 100%);
        border-bottom: 1px solid rgba(145, 169, 150, 0.2);
        padding: 1.5rem 2rem;
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
      }

      .header-left {
        flex-shrink: 0;
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--sienna-charcoal);
      }

      .title-icon {
        color: var(--sienna-sage);
        font-size: 1.75rem;
      }

      .header-subtitle {
        margin: 0;
        color: var(--sienna-terra);
        font-size: 0.9rem;
      }

      .header-controls {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .search-container {
        position: relative;
        min-width: 300px;
      }

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--sienna-ash);
        font-size: 1.1rem;
      }

      .search-input {
        width: 100%;
        padding: 0.75rem 0.75rem 0.75rem 2.5rem;
        border: 1px solid rgba(145, 169, 150, 0.3);
        border-radius: var(--sienna-radius-md);
        background: var(--sienna-white);
        font-size: 0.9rem;
        color: var(--sienna-charcoal);
        transition: all var(--sienna-transition-medium);
      }

      .search-input:focus {
        outline: none;
        border-color: var(--sienna-sage);
        box-shadow: 0 0 0 3px rgba(145, 169, 150, 0.1);
      }

      .filter-tabs {
        display: flex;
        background: rgba(145, 169, 150, 0.1);
        border-radius: var(--sienna-radius-md);
        padding: 0.25rem;
        gap: 0.25rem;
      }

      .filter-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        background: transparent;
        color: var(--sienna-terra);
        border-radius: var(--sienna-radius-sm);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--sienna-transition-fast);
      }

      .filter-tab:hover,
      .filter-tab.active {
        background: var(--sienna-sage);
        color: var(--sienna-white);
        transform: translateY(-1px);
      }

      .view-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .sort-select {
        padding: 0.5rem;
        border: 1px solid rgba(145, 169, 150, 0.3);
        border-radius: var(--sienna-radius-sm);
        background: var(--sienna-white);
        color: var(--sienna-charcoal);
        font-size: 0.85rem;
      }

      .view-mode-toggle {
        display: flex;
        background: rgba(129, 127, 126, 0.1);
        border-radius: var(--sienna-radius-sm);
        padding: 0.25rem;
      }

      .view-btn {
        padding: 0.5rem;
        border: none;
        background: transparent;
        color: var(--sienna-terra);
        border-radius: var(--sienna-radius-sm);
        cursor: pointer;
        transition: all var(--sienna-transition-fast);
        font-size: 1rem;
      }

      .view-btn:hover,
      .view-btn.active {
        background: var(--sienna-sage);
        color: var(--sienna-white);
      }

      @media (max-width: 1024px) {
        .header-content {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
        }

        .header-controls {
          justify-content: space-between;
        }

        .search-container {
          min-width: auto;
          flex: 1;
        }
      }
    `}</style>
  </motion.div>
);

// Continue with remaining components in the next part due to length...
// [The file would continue with ConversationsList, ConversationDetails, CopilotAssistantPanel, LoadingSpinner, and ErrorMessage components]

export default ChatMessageLayer;