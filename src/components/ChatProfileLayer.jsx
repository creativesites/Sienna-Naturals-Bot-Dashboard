"use client";
import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const ChatProfileLayer = () => {
  return (
    <div className="chat-profile-container">
      <div className="profile-header">
        <Icon icon="solar:chat-round-dots-bold-duotone" className="profile-icon" />
        <h2>Chat Profile</h2>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              <Icon icon="solar:user-bold-duotone" />
            </div>
            <div className="profile-details">
              <h3>Chat Configuration</h3>
              <p>Manage your chatbot profile and settings</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .chat-profile-container {
          padding: 2rem;
          font-family: var(--sienna-font-primary);
        }
        
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .profile-icon {
          font-size: 2rem;
          color: var(--sienna-sage);
        }
        
        .profile-card {
          background: white;
          padding: 2rem;
          border-radius: var(--sienna-radius-lg);
          box-shadow: var(--sienna-shadow-md);
        }
        
        .profile-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .profile-avatar {
          width: 60px;
          height: 60px;
          background: rgba(145, 169, 150, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--sienna-sage);
        }
        
        .profile-details h3 {
          margin: 0 0 0.5rem 0;
          color: var(--sienna-charcoal);
        }
        
        .profile-details p {
          margin: 0;
          color: var(--sienna-terra);
        }
      `}</style>
    </div>
  );
};

export default ChatProfileLayer;