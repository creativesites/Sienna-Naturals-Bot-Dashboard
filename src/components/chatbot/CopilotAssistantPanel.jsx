"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";

const CopilotAssistantPanel = ({ selectedConversation, isAnalyzing }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');

  const quickSuggestions = [
    {
      type: 'analysis',
      title: 'Analyze Sentiment',
      description: 'Get sentiment analysis of this conversation',
      action: 'analyzeConversation',
      params: { analysisType: 'sentiment' },
      icon: 'solar:heart-bold-duotone'
    },
    {
      type: 'analysis',
      title: 'Topic Analysis',
      description: 'Identify main topics and trends',
      action: 'analyzeConversation', 
      params: { analysisType: 'topics' },
      icon: 'solar:chart-bold-duotone'
    },
    {
      type: 'management',
      title: 'Tag as Priority',
      description: 'Mark this conversation as high priority',
      action: 'manageConversation',
      params: { action: 'priority', value: 'high' },
      icon: 'solar:star-bold-duotone'
    },
    {
      type: 'response',
      title: 'Generate Response',
      description: 'Get AI-powered response suggestions',
      action: 'generateResponseSuggestions',
      params: { responseType: 'helpful' },
      icon: 'solar:magic-stick-3-bold-duotone'
    }
  ];

  const assistantFeatures = [
    {
      name: 'Smart Search',
      description: 'Search conversations using natural language',
      status: 'active',
      icon: 'solar:magnifier-zoom-in-bold-duotone'
    },
    {
      name: 'Auto-Tagging',
      description: 'Automatically tag conversations by topic',
      status: 'active',
      icon: 'solar:tag-bold-duotone'
    },
    {
      name: 'Response Templates',
      description: 'Pre-built responses for common scenarios',
      status: 'active',
      icon: 'solar:document-text-bold-duotone'
    },
    {
      name: 'Follow-up Reminders',
      description: 'Smart reminders for important conversations',
      status: 'coming-soon',
      icon: 'solar:bell-bing-bold-duotone'
    }
  ];

  const recentActions = [
    {
      action: 'Analyzed sentiment for conversation with Maya K.',
      timestamp: '2 minutes ago',
      result: 'Positive sentiment detected',
      icon: 'solar:heart-bold-duotone'
    },
    {
      action: 'Generated product recommendations for Zara M.',
      timestamp: '5 minutes ago',
      result: '3 products suggested',
      icon: 'solar:bag-smile-bold-duotone'
    },
    {
      action: 'Tagged conversation as "urgent"',
      timestamp: '10 minutes ago',
      result: 'Priority updated',
      icon: 'solar:tag-bold-duotone'
    }
  ];

  const handleQuickAction = (suggestion) => {
    if (!selectedConversation) {
      alert('Please select a conversation first');
      return;
    }

    // This would trigger the CopilotKit action
    console.log('Triggering action:', suggestion.action, {
      conversationId: selectedConversation.id,
      ...suggestion.params
    });
  };

  return (
    <div className={`copilot-assistant-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Panel Toggle */}
      <div className="panel-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="toggle-content">
          <Icon icon="solar:robot-bold-duotone" className="toggle-icon" />
          {isExpanded && <span className="toggle-text">AI Assistant</span>}
          <div className="status-indicator">
            <div className="status-dot active" />
            {isExpanded && <span className="status-text">Online</span>}
          </div>
        </div>
        <button className="expand-btn">
          <Icon icon={isExpanded ? 'solar:minimize-bold' : 'solar:maximize-bold'} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="panel-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab Navigation */}
            <div className="panel-tabs">
              {[
                { key: 'suggestions', label: 'Quick Actions', icon: 'solar:lightning-bold' },
                { key: 'features', label: 'Features', icon: 'solar:settings-bold' },
                { key: 'history', label: 'History', icon: 'solar:history-bold' }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon icon={tab.icon} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'suggestions' && (
                <motion.div 
                  className="suggestions-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="tab-header">
                    <h3>Quick Actions</h3>
                    <p>AI-powered tools to enhance your conversation management</p>
                  </div>

                  <div className="suggestions-grid">
                    {quickSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        className="suggestion-card"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAction(suggestion)}
                      >
                        <div className="suggestion-icon">
                          <Icon icon={suggestion.icon} />
                        </div>
                        <div className="suggestion-content">
                          <h4>{suggestion.title}</h4>
                          <p>{suggestion.description}</p>
                        </div>
                        <div className="suggestion-action">
                          <Icon icon="solar:arrow-right-bold" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {selectedConversation && (
                    <div className="conversation-context">
                      <div className="context-header">
                        <Icon icon="solar:chat-round-bold-duotone" />
                        <span>Selected Conversation</span>
                      </div>
                      <div className="context-details">
                        <div className="context-user">
                          <div className="user-avatar-small">
                            {selectedConversation.user?.avatar ? (
                              <img src={selectedConversation.user.avatar} alt="User" />
                            ) : (
                              <Icon icon="solar:user-bold" />
                            )}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{selectedConversation.user?.name || 'Anonymous'}</span>
                            <span className="message-count">{selectedConversation.messageCount || 0} messages</span>
                          </div>
                        </div>
                        <div className="conversation-tags">
                          {selectedConversation.tags?.map((tag, index) => (
                            <span key={index} className="context-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="analyzing-overlay">
                      <div className="analyzing-content">
                        <Icon icon="solar:loading-bold" className="loading-icon" />
                        <span>AI is analyzing the conversation...</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'features' && (
                <motion.div 
                  className="features-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="tab-header">
                    <h3>AI Features</h3>
                    <p>Available AI capabilities for conversation management</p>
                  </div>

                  <div className="features-list">
                    {assistantFeatures.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <div className="feature-icon">
                          <Icon icon={feature.icon} />
                        </div>
                        <div className="feature-content">
                          <h4>{feature.name}</h4>
                          <p>{feature.description}</p>
                        </div>
                        <div className={`feature-status ${feature.status}`}>
                          {feature.status === 'active' ? (
                            <Icon icon="solar:check-circle-bold" />
                          ) : (
                            <Icon icon="solar:clock-circle-bold" />
                          )}
                          <span>{feature.status === 'active' ? 'Active' : 'Coming Soon'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="feature-metrics">
                    <div className="metric-card">
                      <Icon icon="solar:chart-2-bold-duotone" className="metric-icon" />
                      <div className="metric-content">
                        <span className="metric-value">94%</span>
                        <span className="metric-label">Analysis Accuracy</span>
                      </div>
                    </div>
                    <div className="metric-card">
                      <Icon icon="solar:speedometer-bold-duotone" className="metric-icon" />
                      <div className="metric-content">
                        <span className="metric-value">1.2s</span>
                        <span className="metric-label">Avg Response Time</span>
                      </div>
                    </div>
                    <div className="metric-card">
                      <Icon icon="solar:like-bold-duotone" className="metric-icon" />
                      <div className="metric-content">
                        <span className="metric-value">87%</span>
                        <span className="metric-label">User Satisfaction</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div 
                  className="history-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="tab-header">
                    <h3>Recent Actions</h3>
                    <p>Your recent AI assistant interactions</p>
                  </div>

                  <div className="history-list">
                    {recentActions.map((action, index) => (
                      <div key={index} className="history-item">
                        <div className="history-icon">
                          <Icon icon={action.icon} />
                        </div>
                        <div className="history-content">
                          <p className="history-action">{action.action}</p>
                          <div className="history-meta">
                            <span className="history-timestamp">{action.timestamp}</span>
                            <span className="history-result">{action.result}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="history-stats">
                    <div className="stat-item">
                      <span className="stat-value">23</span>
                      <span className="stat-label">Actions Today</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">156</span>
                      <span className="stat-label">This Week</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">2.1K</span>
                      <span className="stat-label">Total</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style jsx>{`
        .copilot-assistant-panel {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--sienna-white);
          border-radius: var(--sienna-radius-lg);
          box-shadow: var(--sienna-shadow-luxury);
          border: 1px solid rgba(145, 169, 150, 0.2);
          font-family: var(--sienna-font-primary);
          z-index: 1000;
          max-width: 400px;
          transition: all var(--sienna-transition-medium);
        }

        .copilot-assistant-panel.collapsed {
          width: auto;
        }

        .copilot-assistant-panel.expanded {
          width: 400px;
        }

        /* Panel Toggle */
        .panel-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          cursor: pointer;
          background: linear-gradient(135deg, var(--sienna-sage) 0%, #7a9480 100%);
          color: var(--sienna-white);
          border-radius: var(--sienna-radius-lg);
          transition: all var(--sienna-transition-fast);
        }

        .panel-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(145, 169, 150, 0.3);
        }

        .toggle-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .toggle-icon {
          font-size: 1.5rem;
          color: var(--sienna-white);
        }

        .toggle-text {
          font-weight: 600;
          font-size: 1rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--sienna-emerald);
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .expand-btn {
          background: transparent;
          border: none;
          color: var(--sienna-white);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.25rem;
          transition: transform var(--sienna-transition-fast);
        }

        .expand-btn:hover {
          transform: scale(1.1);
        }

        /* Panel Content */
        .panel-content {
          background: var(--sienna-white);
          border-top: 1px solid rgba(145, 169, 150, 0.2);
        }

        /* Tabs */
        .panel-tabs {
          display: flex;
          border-bottom: 1px solid rgba(145, 169, 150, 0.2);
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 0.5rem;
          border: none;
          background: transparent;
          color: var(--sienna-terra);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          border-bottom: 2px solid transparent;
        }

        .tab-btn:hover,
        .tab-btn.active {
          color: var(--sienna-sage);
          background: rgba(145, 169, 150, 0.05);
          border-bottom-color: var(--sienna-sage);
        }

        .tab-content {
          padding: 1.5rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .tab-header {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .tab-header h3 {
          margin: 0 0 0.5rem 0;
          color: var(--sienna-charcoal);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .tab-header p {
          margin: 0;
          color: var(--sienna-terra);
          font-size: 0.85rem;
          line-height: 1.4;
        }

        /* Suggestions Tab */
        .suggestions-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .suggestion-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid rgba(145, 169, 150, 0.2);
          border-radius: var(--sienna-radius-md);
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          background: var(--sienna-white);
        }

        .suggestion-card:hover {
          border-color: var(--sienna-sage);
          background: rgba(145, 169, 150, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(145, 169, 150, 0.15);
        }

        .suggestion-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-emerald) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .suggestion-content {
          flex: 1;
        }

        .suggestion-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--sienna-charcoal);
        }

        .suggestion-content p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--sienna-terra);
          line-height: 1.3;
        }

        .suggestion-action {
          color: var(--sienna-sage);
          font-size: 1rem;
          transition: transform var(--sienna-transition-fast);
        }

        .suggestion-card:hover .suggestion-action {
          transform: translateX(4px);
        }

        /* Conversation Context */
        .conversation-context {
          background: rgba(145, 169, 150, 0.05);
          border-radius: var(--sienna-radius-md);
          padding: 1rem;
          border: 1px solid rgba(145, 169, 150, 0.2);
        }

        .context-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          color: var(--sienna-sage);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .context-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .context-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar-small {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-terra) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 0.9rem;
          overflow: hidden;
        }

        .user-avatar-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: var(--sienna-charcoal);
          font-size: 0.85rem;
        }

        .message-count {
          font-size: 0.75rem;
          color: var(--sienna-terra);
        }

        .conversation-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .context-tag {
          padding: 0.2rem 0.5rem;
          background: rgba(145, 169, 150, 0.15);
          border-radius: 12px;
          font-size: 0.7rem;
          color: var(--sienna-sage);
          border: 1px solid rgba(145, 169, 150, 0.3);
        }

        /* Analyzing Overlay */
        .analyzing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--sienna-radius-md);
        }

        .analyzing-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--sienna-sage);
        }

        .loading-icon {
          font-size: 2rem;
          animation: spin 1s linear infinite;
        }

        /* Features Tab */
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid rgba(145, 169, 150, 0.2);
          border-radius: var(--sienna-radius-md);
          background: var(--sienna-white);
        }

        .feature-icon {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-terra) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .feature-content {
          flex: 1;
        }

        .feature-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--sienna-charcoal);
        }

        .feature-content p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--sienna-terra);
          line-height: 1.3;
        }

        .feature-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }

        .feature-status.active {
          color: var(--sienna-emerald);
          background: rgba(45, 90, 39, 0.1);
        }

        .feature-status.coming-soon {
          color: var(--sienna-amber);
          background: rgba(212, 165, 116, 0.1);
        }

        .feature-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.75rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(145, 169, 150, 0.05);
          border-radius: var(--sienna-radius-md);
          border: 1px solid rgba(145, 169, 150, 0.2);
        }

        .metric-icon {
          color: var(--sienna-sage);
          font-size: 1.2rem;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
        }

        .metric-value {
          font-weight: 700;
          color: var(--sienna-charcoal);
          font-size: 0.9rem;
        }

        .metric-label {
          font-size: 0.7rem;
          color: var(--sienna-terra);
        }

        /* History Tab */
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .history-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(145, 169, 150, 0.03);
          border-radius: var(--sienna-radius-md);
          border-left: 3px solid var(--sienna-sage);
        }

        .history-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--sienna-sage);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .history-content {
          flex: 1;
        }

        .history-action {
          margin: 0 0 0.25rem 0;
          font-size: 0.85rem;
          color: var(--sienna-charcoal);
          line-height: 1.3;
        }

        .history-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
        }

        .history-timestamp {
          color: var(--sienna-terra);
        }

        .history-result {
          color: var(--sienna-sage);
          font-weight: 500;
        }

        .history-stats {
          display: flex;
          justify-content: space-around;
          padding: 1rem;
          background: rgba(145, 169, 150, 0.05);
          border-radius: var(--sienna-radius-md);
          border: 1px solid rgba(145, 169, 150, 0.2);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-value {
          font-weight: 700;
          color: var(--sienna-charcoal);
          font-size: 1.1rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--sienna-terra);
          margin-top: 0.25rem;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Scrollbar Styling */
        .tab-content::-webkit-scrollbar {
          width: 4px;
        }

        .tab-content::-webkit-scrollbar-track {
          background: rgba(145, 169, 150, 0.1);
          border-radius: 2px;
        }

        .tab-content::-webkit-scrollbar-thumb {
          background: var(--sienna-sage);
          border-radius: 2px;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .copilot-assistant-panel {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
          }

          .copilot-assistant-panel.expanded {
            width: auto;
          }

          .panel-tabs {
            flex-direction: column;
          }

          .tab-btn {
            justify-content: flex-start;
            padding: 1rem;
          }

          .suggestions-grid {
            grid-template-columns: 1fr;
          }

          .feature-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CopilotAssistantPanel;