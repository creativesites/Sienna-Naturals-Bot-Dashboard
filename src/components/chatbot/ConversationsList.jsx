"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";

const ConversationsList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  fullWidth = false 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'var(--sienna-emerald)';
      case 'negative': return 'var(--sienna-ruby)';
      default: return 'var(--sienna-amber)';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'solar:star-bold';
      case 'medium': return 'solar:star-line-duotone';
      default: return 'solar:star-outline';
    }
  };

  const formatLastActivity = (date) => {
    const now = new Date();
    const activity = new Date(date);
    const diffInHours = (now - activity) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className={`conversations-list ${fullWidth ? 'full-width' : ''}`}>
      <motion.div
        className="conversations-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <AnimatePresence>
          {conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              layout
              className={`conversation-item ${
                selectedConversation?.id === conversation.id ? 'selected' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* User Avatar */}
              <div className="conversation-avatar">
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
                {conversation.unread && <div className="unread-indicator" />}
              </div>

              {/* Conversation Content */}
              <div className="conversation-content">
                <div className="conversation-header">
                  <h4 className="user-name">
                    {conversation.user?.name || 'Anonymous User'}
                  </h4>
                  <div className="conversation-meta">
                    <span className="last-activity">
                      {formatLastActivity(conversation.lastActivity)}
                    </span>
                    <Icon 
                      icon={getPriorityIcon(conversation.priority)} 
                      className={`priority-icon priority-${conversation.priority}`}
                    />
                  </div>
                </div>

                <div className="conversation-preview">
                  <p className="last-message">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                  <div className="conversation-indicators">
                    <div className="message-count">
                      <Icon icon="solar:chat-round-bold" />
                      <span>{conversation.messageCount || 0}</span>
                    </div>
                    <div 
                      className="sentiment-indicator"
                      style={{ backgroundColor: getSentimentColor(conversation.sentiment) }}
                      title={`Sentiment: ${conversation.sentiment}`}
                    />
                  </div>
                </div>

                {/* Tags */}
                {conversation.tags && conversation.tags.length > 0 && (
                  <div className="conversation-tags">
                    {conversation.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">
                        {tag}
                      </span>
                    ))}
                    {conversation.tags.length > 2 && (
                      <span className="tag-overflow">
                        +{conversation.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Follow-up indicator */}
                {conversation.followUp?.scheduled && (
                  <div className="follow-up-indicator">
                    <Icon icon="solar:calendar-bold" />
                    <span>Follow-up scheduled</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="conversation-actions">
                <button 
                  className="quick-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle quick archive
                  }}
                  title="Archive"
                >
                  <Icon icon="solar:archive-bold" />
                </button>
                <button 
                  className="quick-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle quick priority toggle
                  }}
                  title="Toggle Priority"
                >
                  <Icon icon="solar:star-bold" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {conversations.length === 0 && (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Icon icon="solar:chat-round-line-duotone" className="empty-icon" />
            <h3>No conversations found</h3>
            <p>Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </motion.div>

      {/* Custom Styles */}
      <style jsx>{`
        .conversations-list {
          background: var(--sienna-white);
          border-right: 1px solid rgba(145, 169, 150, 0.2);
          overflow-y: auto;
          max-height: 100%;
        }

        .conversations-list.full-width {
          border-right: none;
        }

        .conversations-container {
          padding: 1rem 0;
        }

        .conversation-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(145, 169, 150, 0.1);
          cursor: pointer;
          transition: all var(--sienna-transition-medium);
          position: relative;
          background: transparent;
        }

        .conversation-item:hover {
          background: rgba(145, 169, 150, 0.05);
          border-left: 4px solid var(--sienna-sage);
          padding-left: 1.25rem;
        }

        .conversation-item.selected {
          background: linear-gradient(135deg, rgba(145, 169, 150, 0.1) 0%, rgba(145, 169, 150, 0.05) 100%);
          border-left: 4px solid var(--sienna-sage);
          padding-left: 1.25rem;
          box-shadow: inset 0 0 10px rgba(145, 169, 150, 0.1);
        }

        .conversation-avatar {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-image {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(145, 169, 150, 0.3);
        }

        .avatar-placeholder {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-terra) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 1.5rem;
        }

        .unread-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: var(--sienna-ruby);
          border-radius: 50%;
          border: 2px solid var(--sienna-white);
          animation: pulse 2s infinite;
        }

        .conversation-content {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .user-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--sienna-charcoal);
          truncate: true;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .conversation-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
          margin-left: 1rem;
        }

        .last-activity {
          font-size: 0.8rem;
          color: var(--sienna-terra);
          font-weight: 500;
        }

        .priority-icon {
          font-size: 1rem;
        }

        .priority-icon.priority-high {
          color: var(--sienna-ruby);
        }

        .priority-icon.priority-medium {
          color: var(--sienna-amber);
        }

        .priority-icon.priority-low {
          color: var(--sienna-ash);
        }

        .conversation-preview {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 0.75rem;
        }

        .last-message {
          margin: 0;
          font-size: 0.9rem;
          color: var(--sienna-terra);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
          margin-right: 1rem;
        }

        .conversation-indicators {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .message-count {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--sienna-ash);
        }

        .sentiment-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
        }

        .conversation-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .tag {
          padding: 0.2rem 0.5rem;
          background: rgba(145, 169, 150, 0.15);
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--sienna-sage);
          border: 1px solid rgba(145, 169, 150, 0.3);
        }

        .tag-overflow {
          padding: 0.2rem 0.5rem;
          background: rgba(129, 127, 126, 0.15);
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--sienna-terra);
          border: 1px solid rgba(129, 127, 126, 0.3);
        }

        .follow-up-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: rgba(184, 134, 11, 0.1);
          border-radius: var(--sienna-radius-sm);
          font-size: 0.75rem;
          color: var(--sienna-amber);
          border: 1px solid rgba(184, 134, 11, 0.2);
        }

        .conversation-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity var(--sienna-transition-fast);
        }

        .conversation-item:hover .conversation-actions {
          opacity: 1;
        }

        .quick-action {
          padding: 0.5rem;
          background: transparent;
          border: 1px solid rgba(145, 169, 150, 0.3);
          border-radius: var(--sienna-radius-sm);
          color: var(--sienna-terra);
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          font-size: 0.9rem;
        }

        .quick-action:hover {
          background: var(--sienna-sage);
          color: var(--sienna-white);
          border-color: var(--sienna-sage);
          transform: scale(1.1);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--sienna-terra);
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--sienna-ash);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          color: var(--sienna-charcoal);
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--sienna-terra);
        }

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

        /* Scrollbar Styling */
        .conversations-list::-webkit-scrollbar {
          width: 6px;
        }

        .conversations-list::-webkit-scrollbar-track {
          background: rgba(145, 169, 150, 0.1);
          border-radius: 3px;
        }

        .conversations-list::-webkit-scrollbar-thumb {
          background: var(--sienna-sage);
          border-radius: 3px;
        }

        .conversations-list::-webkit-scrollbar-thumb:hover {
          background: var(--sienna-charcoal);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .conversation-item {
            padding: 1rem;
          }

          .conversation-actions {
            display: none;
          }

          .conversation-meta {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.25rem;
          }

          .avatar-image,
          .avatar-placeholder {
            width: 40px;
            height: 40px;
          }

          .user-name {
            font-size: 0.9rem;
          }

          .last-message {
            font-size: 0.8rem;
            -webkit-line-clamp: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ConversationsList;