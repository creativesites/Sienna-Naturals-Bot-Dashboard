"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";

const ConversationDetails = ({ 
  conversation, 
  aiInsights, 
  isAnalyzing, 
  fullWidth = false 
}) => {
  const [responseText, setResponseText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    
    setIsTyping(true);
    // Simulate sending response
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResponseText('');
    setIsTyping(false);
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderAIInsights = () => {
    if (!aiInsights) return null;

    switch (aiInsights.type) {
      case 'sentiment':
        return (
          <div className="insight-content">
            <div className="sentiment-overview">
              <div className="sentiment-score">
                <div className="score-circle">
                  <span>{Math.round(aiInsights.score * 100)}%</span>
                </div>
                <div className="score-label">
                  Overall: <strong>{aiInsights.overall}</strong>
                </div>
              </div>
              <div className="sentiment-breakdown">
                <div className="breakdown-item positive">
                  <span className="percentage">{aiInsights.breakdown.positive}%</span>
                  <span className="label">Positive</span>
                </div>
                <div className="breakdown-item neutral">
                  <span className="percentage">{aiInsights.breakdown.neutral}%</span>
                  <span className="label">Neutral</span>
                </div>
                <div className="breakdown-item negative">
                  <span className="percentage">{aiInsights.breakdown.negative}%</span>
                  <span className="label">Negative</span>
                </div>
              </div>
            </div>
            {aiInsights.keyMoments && (
              <div className="key-moments">
                <h4>Key Moments</h4>
                {aiInsights.keyMoments.map((moment, index) => (
                  <div key={index} className={`moment ${moment.sentiment}`}>
                    <Icon icon="solar:quote-up-bold" />
                    <p>"{moment.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'topics':
        return (
          <div className="insight-content">
            <div className="topics-overview">
              <h4>Main Topics Discussed</h4>
              {aiInsights.mainTopics.map((topic, index) => (
                <div key={index} className="topic-item">
                  <div className="topic-info">
                    <span className="topic-name">{topic.topic}</span>
                    <span className="topic-mentions">{topic.mentions} mentions</span>
                  </div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${topic.confidence * 100}%` }}
                    />
                  </div>
                  <span className="confidence-score">{Math.round(topic.confidence * 100)}%</span>
                </div>
              ))}
            </div>
            <div className="trending-concerns">
              <h4>Trending Concerns</h4>
              <div className="concerns-tags">
                {aiInsights.trendingConcerns.map((concern, index) => (
                  <span key={index} className="concern-tag">{concern}</span>
                ))}
              </div>
            </div>
            <div className="recommended-actions">
              <h4>Recommended Actions</h4>
              <ul>
                {aiInsights.recommendedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="insight-content">
            <div className="user-profile">
              <h4>User Profile Analysis</h4>
              <div className="profile-tags">
                <span className="profile-tag hair-type">{aiInsights.userProfile.hairType} Hair</span>
                <span className="profile-tag experience">{aiInsights.userProfile.experience}</span>
                {aiInsights.userProfile.concerns.map((concern, index) => (
                  <span key={index} className="profile-tag concern">{concern}</span>
                ))}
              </div>
            </div>
            <div className="product-recommendations">
              <h4>Recommended Products</h4>
              {aiInsights.recommendedProducts.map((product, index) => (
                <div key={index} className="product-rec">
                  <span className="product-name">{product.name}</span>
                  <div className="match-score">
                    <span className="match-percentage">{product.match}% match</span>
                    <div className="match-bar">
                      <div 
                        className="match-fill"
                        style={{ width: `${product.match}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="next-steps">
              <h4>Next Steps</h4>
              <ul>
                {aiInsights.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="insight-content">
            <p>{aiInsights.summary}</p>
            {aiInsights.keyInsights && (
              <ul>
                {aiInsights.keyInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            )}
          </div>
        );
    }
  };

  if (!conversation) {
    return (
      <div className="conversation-details empty">
        <div className="empty-state">
          <Icon icon="solar:chat-round-line-duotone" className="empty-icon" />
          <h3>Select a conversation</h3>
          <p>Choose a conversation from the list to view details and messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`conversation-details ${fullWidth ? 'full-width' : ''}`}>
      {/* Conversation Header */}
      <div className="conversation-header">
        <div className="header-user-info">
          <div className="user-avatar">
            {conversation.user?.avatar ? (
              <img 
                src={conversation.user.avatar} 
                alt={conversation.user.name}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                <Icon icon="solar:user-bold-duotone" />
              </div>
            )}
          </div>
          <div className="user-details">
            <h2 className="user-name">{conversation.user?.name || 'Anonymous User'}</h2>
            <div className="user-meta">
              <span className="user-status online">
                <Icon icon="solar:check-circle-bold" />
                Online
              </span>
              <span className="message-count">
                {conversation.messageCount || 0} messages
              </span>
              <span className={`priority priority-${conversation.priority}`}>
                <Icon icon="solar:star-bold" />
                {conversation.priority} priority
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="action-btn" title="Video Call">
            <Icon icon="solar:videocamera-bold-duotone" />
          </button>
          <button className="action-btn" title="Voice Call">
            <Icon icon="solar:phone-bold-duotone" />
          </button>
          <button className="action-btn" title="More Options">
            <Icon icon="solar:menu-dots-bold" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        <div className="messages-list">
          <AnimatePresence>
            {conversation.messages?.map((message, index) => (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? (
                    conversation.user?.avatar ? (
                      <img src={conversation.user.avatar} alt="User" />
                    ) : (
                      <div className="avatar-placeholder small">
                        <Icon icon="solar:user-bold" />
                      </div>
                    )
                  ) : (
                    <div className="ai-avatar">
                      <Icon icon="solar:magic-stick-3-bold-duotone" />
                    </div>
                  )}
                </div>

                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.content}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="message-attachments">
                        {message.attachments.map((attachment, attIndex) => (
                          <div key={attIndex} className="attachment">
                            <Icon icon="solar:document-bold" />
                            <span>{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="message-meta">
                    <span className="message-time">
                      {formatMessageTime(message.timestamp)}
                    </span>
                    {message.status && (
                      <span className={`message-status ${message.status}`}>
                        <Icon icon="solar:check-circle-bold" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="typing-indicator"
            >
              <div className="ai-avatar">
                <Icon icon="solar:magic-stick-3-bold-duotone" />
              </div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <motion.div 
          className="ai-insights-panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="insights-header">
            <Icon icon="solar:brain-bold-duotone" className="insights-icon" />
            <h3>AI Insights</h3>
            {isAnalyzing && (
              <div className="analyzing-indicator">
                <Icon icon="solar:loading-bold" className="loading-icon" />
                <span>Analyzing...</span>
              </div>
            )}
          </div>
          {renderAIInsights()}
        </motion.div>
      )}

      {/* Response Input */}
      <div className="response-input-area">
        <div className="input-container">
          <div className="input-actions">
            <button className="input-action" title="Attach File">
              <Icon icon="solar:paperclip-bold" />
            </button>
            <button className="input-action" title="Emoji">
              <Icon icon="solar:smile-circle-bold" />
            </button>
          </div>
          
          <textarea
            className="response-input"
            placeholder="Type your response..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendResponse();
              }
            }}
            rows={3}
          />
          
          <button 
            className="send-button"
            onClick={handleSendResponse}
            disabled={!responseText.trim() || isTyping}
          >
            <Icon icon="solar:plain-bold" />
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .conversation-details {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--sienna-white);
        }

        .conversation-details.empty {
          align-items: center;
          justify-content: center;
        }

        .empty-state {
          text-align: center;
          color: var(--sienna-terra);
        }

        .empty-icon {
          font-size: 4rem;
          color: var(--sienna-ash);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          color: var(--sienna-charcoal);
        }

        .empty-state p {
          margin: 0;
          font-size: 1rem;
          color: var(--sienna-terra);
        }

        /* Header Styles */
        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(145, 169, 150, 0.2);
          background: linear-gradient(135deg, var(--sienna-white) 0%, rgba(145, 169, 150, 0.05) 100%);
        }

        .header-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar .avatar-image,
        .avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }

        .avatar-image {
          object-fit: cover;
          border: 3px solid var(--sienna-sage);
        }

        .avatar-placeholder {
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-terra) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 1.75rem;
        }

        .user-name {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--sienna-charcoal);
        }

        .user-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .user-status.online {
          color: var(--sienna-emerald);
        }

        .message-count {
          font-size: 0.85rem;
          color: var(--sienna-terra);
        }

        .priority {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .priority.priority-high { color: var(--sienna-ruby); }
        .priority.priority-medium { color: var(--sienna-amber); }
        .priority.priority-low { color: var(--sienna-ash); }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.75rem;
          border: 1px solid rgba(145, 169, 150, 0.3);
          background: transparent;
          border-radius: var(--sienna-radius-md);
          color: var(--sienna-sage);
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          font-size: 1.1rem;
        }

        .action-btn:hover {
          background: var(--sienna-sage);
          color: var(--sienna-white);
          transform: translateY(-2px);
        }

        /* Messages Styles */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: rgba(145, 169, 150, 0.02);
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .message {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .message.user-message {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .message-avatar img,
        .avatar-placeholder.small {
          width: 35px;
          height: 35px;
          border-radius: 50%;
        }

        .avatar-placeholder.small {
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-terra) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 1rem;
        }

        .ai-avatar {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, var(--sienna-charcoal) 0%, var(--sienna-sage) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 1rem;
        }

        .message-content {
          max-width: 70%;
        }

        .user-message .message-content {
          align-items: flex-end;
        }

        .message-bubble {
          padding: 1rem 1.25rem;
          border-radius: 1.25rem;
          margin-bottom: 0.25rem;
        }

        .user-message .message-bubble {
          background: linear-gradient(135deg, var(--sienna-sage) 0%, #7a9480 100%);
          color: var(--sienna-white);
          border-bottom-right-radius: 0.5rem;
        }

        .ai-message .message-bubble {
          background: var(--sienna-white);
          color: var(--sienna-charcoal);
          border: 1px solid rgba(145, 169, 150, 0.2);
          border-bottom-left-radius: 0.5rem;
        }

        .message-bubble p {
          margin: 0;
          line-height: 1.5;
        }

        .message-attachments {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .attachment {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: var(--sienna-radius-sm);
          font-size: 0.85rem;
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--sienna-terra);
        }

        .user-message .message-meta {
          justify-content: flex-end;
        }

        .message-status.delivered {
          color: var(--sienna-emerald);
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .typing-bubble {
          background: var(--sienna-white);
          border: 1px solid rgba(145, 169, 150, 0.2);
          border-radius: 1.25rem;
          border-bottom-left-radius: 0.5rem;
          padding: 1rem 1.25rem;
        }

        .typing-dots {
          display: flex;
          gap: 0.3rem;
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          background: var(--sienna-sage);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* AI Insights Panel */
        .ai-insights-panel {
          border-top: 1px solid rgba(145, 169, 150, 0.2);
          background: linear-gradient(135deg, rgba(145, 169, 150, 0.05) 0%, var(--sienna-white) 100%);
          padding: 1.5rem 2rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .insights-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .insights-icon {
          color: var(--sienna-sage);
          font-size: 1.5rem;
        }

        .insights-header h3 {
          margin: 0;
          color: var(--sienna-charcoal);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .analyzing-indicator {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--sienna-sage);
          font-size: 0.85rem;
        }

        .loading-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Insight Content Styles */
        .insight-content {
          font-size: 0.9rem;
          color: var(--sienna-charcoal);
        }

        .sentiment-overview {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .sentiment-score {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .score-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-emerald) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-weight: 700;
          font-size: 1rem;
        }

        .sentiment-breakdown {
          display: flex;
          gap: 1rem;
        }

        .breakdown-item {
          text-align: center;
        }

        .breakdown-item .percentage {
          display: block;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .breakdown-item.positive .percentage { color: var(--sienna-emerald); }
        .breakdown-item.neutral .percentage { color: var(--sienna-amber); }
        .breakdown-item.negative .percentage { color: var(--sienna-ruby); }

        .breakdown-item .label {
          font-size: 0.8rem;
          color: var(--sienna-terra);
        }

        /* Response Input */
        .response-input-area {
          border-top: 1px solid rgba(145, 169, 150, 0.2);
          padding: 1rem 2rem;
          background: var(--sienna-white);
        }

        .input-container {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .input-actions {
          display: flex;
          gap: 0.5rem;
        }

        .input-action {
          padding: 0.75rem;
          border: 1px solid rgba(145, 169, 150, 0.3);
          background: transparent;
          border-radius: var(--sienna-radius-md);
          color: var(--sienna-sage);
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .input-action:hover {
          background: var(--sienna-sage);
          color: var(--sienna-white);
        }

        .response-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(145, 169, 150, 0.3);
          border-radius: var(--sienna-radius-md);
          background: var(--sienna-white);
          color: var(--sienna-charcoal);
          font-family: inherit;
          font-size: 0.9rem;
          resize: none;
          transition: all var(--sienna-transition-medium);
        }

        .response-input:focus {
          outline: none;
          border-color: var(--sienna-sage);
          box-shadow: 0 0 0 3px rgba(145, 169, 150, 0.1);
        }

        .send-button {
          padding: 0.75rem 1rem;
          background: var(--sienna-sage);
          color: var(--sienna-white);
          border: none;
          border-radius: var(--sienna-radius-md);
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          font-size: 1.1rem;
        }

        .send-button:hover:not(:disabled) {
          background: #7a9480;
          transform: translateY(-2px);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Scrollbar Styling */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(145, 169, 150, 0.1);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: var(--sienna-sage);
          border-radius: 3px;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .conversation-header {
            padding: 1rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
            justify-content: center;
          }

          .messages-container {
            padding: 0.5rem;
          }

          .response-input-area {
            padding: 0.75rem;
          }

          .message-content {
            max-width: 85%;
          }

          .user-avatar .avatar-image,
          .avatar-placeholder {
            width: 50px;
            height: 50px;
          }

          .user-name {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ConversationDetails;