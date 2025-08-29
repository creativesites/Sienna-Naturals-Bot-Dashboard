"use client";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";

const LoadingSpinner = ({ size = 'medium', message = 'Loading...', type = 'default' }) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium', 
    large: 'loading-large'
  };

  const renderLoadingContent = () => {
    switch (type) {
      case 'conversations':
        return (
          <div className="loading-content">
            <div className="loading-icon-container">
              <Icon icon="solar:chat-round-bold-duotone" className="loading-icon" />
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <p className="loading-text">Loading conversations...</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="loading-content">
            <div className="loading-icon-container">
              <Icon icon="solar:brain-bold-duotone" className="loading-icon brain-icon" />
              <div className="pulse-ring"></div>
            </div>
            <p className="loading-text">AI is analyzing...</p>
            <div className="analysis-steps">
              <div className="step active">
                <Icon icon="solar:check-circle-bold" />
                <span>Reading conversation</span>
              </div>
              <div className="step processing">
                <Icon icon="solar:loading-bold" className="spin" />
                <span>Processing sentiment</span>
              </div>
              <div className="step pending">
                <Icon icon="solar:clock-circle-outline" />
                <span>Generating insights</span>
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="loading-content">
            <div className="loading-icon-container">
              <Icon icon="solar:magnifier-zoom-in-bold-duotone" className="loading-icon search-icon" />
              <div className="search-waves">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>
            </div>
            <p className="loading-text">Searching conversations...</p>
          </div>
        );

      default:
        return (
          <div className="loading-content">
            <div className="loading-icon-container">
              <Icon icon="solar:leaf-bold-duotone" className="loading-icon default-icon" />
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
              </div>
            </div>
            <p className="loading-text">{message}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      className={`loading-container ${sizeClasses[size]}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderLoadingContent()}</motion.div>
  );
};

// Error Message Component
export const ErrorMessage = ({ error, onRetry, type = 'default' }) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return 'solar:wifi-router-cross-bold-duotone';
      case 'auth':
        return 'solar:shield-cross-bold-duotone';
      case 'server':
        return 'solar:server-square-cloud-cross-bold-duotone';
      default:
        return 'solar:danger-circle-bold-duotone';
    }
  };

  const getErrorMessage = () => {
    switch (type) {
      case 'network':
        return 'Network connection failed. Please check your internet connection.';
      case 'auth':
        return 'Authentication failed. Please sign in again.';
      case 'server':
        return 'Server error occurred. Our team has been notified.';
      default:
        return error || 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <motion.div
      className="error-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="error-content">
        <div className="error-icon">
          <Icon icon={getErrorIcon()} />
        </div>
        <h3 className="error-title">Oops! Something went wrong</h3>
        <p className="error-message">{getErrorMessage()}</p>
        
        {onRetry && (
          <div className="error-actions">
            <motion.button
              className="retry-button"
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon icon="solar:refresh-bold" />
              Try Again
            </motion.button>
            <button 
              className="support-button"
              onClick={() => window.open('mailto:support@sienna-naturals.com')}
            >
              <Icon icon="solar:chat-round-call-bold" />
              Contact Support
            </button>
          </div>
        )}
      </div>

      {/* Shared Styles for both components */}
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: var(--sienna-font-primary);
          color: var(--sienna-charcoal);
        }

        .loading-container.loading-small {
          padding: 1rem;
        }

        .loading-container.loading-large {
          padding: 4rem 2rem;
          min-height: 400px;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 300px;
        }

        .loading-icon-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .loading-icon {
          font-size: 3rem;
          color: var(--sienna-sage);
          z-index: 2;
          position: relative;
        }

        .loading-container.loading-small .loading-icon {
          font-size: 2rem;
        }

        .loading-container.loading-large .loading-icon {
          font-size: 4rem;
        }

        .loading-text {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 500;
          color: var(--sienna-terra);
        }

        .loading-container.loading-small .loading-text {
          font-size: 0.9rem;
        }

        /* Default Loading Animation */
        .default-icon {
          animation: float 3s ease-in-out infinite;
        }

        .loading-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .spinner-ring {
          width: 60px;
          height: 60px;
          border: 3px solid rgba(145, 169, 150, 0.2);
          border-top: 3px solid var(--sienna-sage);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Conversation Loading */
        .loading-dots {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
        }

        .loading-dots span {
          width: 6px;
          height: 6px;
          background: var(--sienna-sage);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

        .loading-progress {
          width: 200px;
          margin-top: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(145, 169, 150, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--sienna-sage), var(--sienna-emerald));
          border-radius: 2px;
          animation: progress 2s ease-in-out infinite;
        }

        /* Analysis Loading */
        .brain-icon {
          animation: pulse 2s ease-in-out infinite;
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border: 2px solid var(--sienna-sage);
          border-radius: 50%;
          animation: pulse-ring 2s ease-in-out infinite;
          opacity: 0.6;
        }

        .analysis-steps {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          width: 100%;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: var(--sienna-radius-md);
          font-size: 0.85rem;
          transition: all var(--sienna-transition-fast);
        }

        .step.active {
          background: rgba(45, 90, 39, 0.1);
          color: var(--sienna-emerald);
        }

        .step.processing {
          background: rgba(145, 169, 150, 0.1);
          color: var(--sienna-sage);
        }

        .step.pending {
          background: rgba(129, 127, 126, 0.05);
          color: var(--sienna-ash);
        }

        /* Search Loading */
        .search-icon {
          animation: searchPulse 2s ease-in-out infinite;
        }

        .search-waves {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
        }

        .wave {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border: 2px solid var(--sienna-sage);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: wave 2s ease-out infinite;
          opacity: 0;
        }

        .wave:nth-child(2) { animation-delay: 0.5s; }
        .wave:nth-child(3) { animation-delay: 1s; }

        /* Error Message Styles */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          font-family: var(--sienna-font-primary);
          text-align: center;
          min-height: 300px;
        }

        .error-content {
          max-width: 400px;
        }

        .error-icon {
          font-size: 4rem;
          color: var(--sienna-ruby);
          margin-bottom: 1.5rem;
          animation: errorPulse 2s ease-in-out infinite;
        }

        .error-title {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--sienna-charcoal);
        }

        .error-message {
          margin: 0 0 2rem 0;
          font-size: 1rem;
          color: var(--sienna-terra);
          line-height: 1.5;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .retry-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--sienna-sage);
          color: var(--sienna-white);
          border: none;
          border-radius: var(--sienna-radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .retry-button:hover {
          background: #7a9480;
          transform: translateY(-2px);
        }

        .support-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          color: var(--sienna-terra);
          border: 1px solid var(--sienna-terra);
          border-radius: var(--sienna-radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .support-button:hover {
          background: var(--sienna-terra);
          color: var(--sienna-white);
          transform: translateY(-2px);
        }

        /* Keyframe Animations */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes searchPulse {
          0%, 100% {
            transform: scale(1);
            color: var(--sienna-sage);
          }
          50% {
            transform: scale(1.1);
            color: var(--sienna-emerald);
          }
        }

        @keyframes wave {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 100px;
            height: 100px;
            opacity: 0;
          }
        }

        @keyframes errorPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .loading-container,
          .error-container {
            padding: 1.5rem 1rem;
          }

          .loading-icon,
          .error-icon {
            font-size: 2.5rem;
          }

          .loading-text,
          .error-title {
            font-size: 0.9rem;
          }

          .error-title {
            font-size: 1.3rem;
          }

          .analysis-steps {
            font-size: 0.8rem;
          }

          .spinner-ring {
            width: 50px;
            height: 50px;
          }

          .pulse-ring {
            width: 70px;
            height: 70px;
          }

          .error-actions {
            flex-direction: column;
            width: 100%;
          }

          .retry-button,
          .support-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default LoadingSpinner;
