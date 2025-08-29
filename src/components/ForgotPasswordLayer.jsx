"use client";
import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const ForgotPasswordLayer = () => {
  return (
    <div className="forgot-password-container">
      <div className="forgot-header">
        <Icon icon="solar:key-bold-duotone" className="forgot-icon" />
        <h2>Password Recovery</h2>
      </div>
      <div className="forgot-content">
        <div className="forgot-card">
          <p>Password recovery functionality</p>
        </div>
      </div>
      <style jsx>{`
        .forgot-password-container { padding: 2rem; font-family: var(--sienna-font-primary); }
        .forgot-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .forgot-icon { font-size: 2rem; color: var(--sienna-sage); }
        .forgot-card { background: white; padding: 2rem; border-radius: var(--sienna-radius-lg); box-shadow: var(--sienna-shadow-md); }
      `}</style>
    </div>
  );
};
export default ForgotPasswordLayer;