"use client";
import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const CompanyLayer = () => {
  return (
    <div className="company-container">
      <div className="company-header">
        <Icon icon="solar:buildings-bold-duotone" className="company-icon" />
        <h2>Company Information</h2>
      </div>
      <div className="company-content">
        <div className="company-card">
          <h3>Sienna Naturals</h3>
          <p>Premium natural hair care solutions powered by AI</p>
        </div>
      </div>
      <style jsx>{`
        .company-container { padding: 2rem; font-family: var(--sienna-font-primary); }
        .company-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .company-icon { font-size: 2rem; color: var(--sienna-sage); }
        .company-card { background: white; padding: 2rem; border-radius: var(--sienna-radius-lg); box-shadow: var(--sienna-shadow-md); }
      `}</style>
    </div>
  );
};
export default CompanyLayer;