"use client";
import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const ListLayer = () => {
  return (
    <div className="list-container">
      <div className="list-header">
        <Icon icon="solar:list-bold-duotone" className="list-icon" />
        <h2>List View</h2>
      </div>
      <div className="list-content">
        <div className="list-card">
          <p>List functionality</p>
        </div>
      </div>
      <style jsx>{`
        .list-container { padding: 2rem; font-family: var(--sienna-font-primary); }
        .list-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .list-icon { font-size: 2rem; color: var(--sienna-sage); }
        .list-card { background: white; padding: 2rem; border-radius: var(--sienna-radius-lg); box-shadow: var(--sienna-shadow-md); }
      `}</style>
    </div>
  );
};
export default ListLayer;