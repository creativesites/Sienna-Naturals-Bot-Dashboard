"use client";
import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const TemplatePage = ({ title, icon, description }) => {
  return (
    <div className="template-container">
      <div className="template-header">
        <Icon icon={icon || "solar:widget-bold-duotone"} className="template-icon" />
        <h2>{title || "Page"}</h2>
      </div>
      <div className="template-content">
        <div className="template-card">
          <p>{description || "This page is under construction."}</p>
        </div>
      </div>
      <style jsx>{`
        .template-container { padding: 2rem; font-family: var(--sienna-font-primary); }
        .template-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .template-icon { font-size: 2rem; color: var(--sienna-sage); }
        .template-card { background: white; padding: 2rem; border-radius: var(--sienna-radius-lg); box-shadow: var(--sienna-shadow-md); text-align: center; }
      `}</style>
    </div>
  );
};
export default TemplatePage;