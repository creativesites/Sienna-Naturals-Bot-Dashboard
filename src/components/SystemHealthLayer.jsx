"use client";
import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const SystemHealthLayer = () => {
  return (
    <div className="system-health-container">
      <div className="health-header">
        <Icon icon="solar:shield-check-bold-duotone" className="health-icon" />
        <h2>System Health</h2>
      </div>
      
      <div className="health-metrics">
        <div className="health-card">
          <div className="metric-value">99.9%</div>
          <div className="metric-label">Uptime</div>
        </div>
        
        <div className="health-card">
          <div className="metric-value">120ms</div>
          <div className="metric-label">Response Time</div>
        </div>
        
        <div className="health-card">
          <div className="metric-value">Healthy</div>
          <div className="metric-label">Status</div>
        </div>
      </div>
      
      <style jsx>{`
        .system-health-container {
          padding: 2rem;
          font-family: var(--sienna-font-primary);
        }
        
        .health-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .health-icon {
          font-size: 2rem;
          color: var(--sienna-sage);
        }
        
        .health-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .health-card {
          background: white;
          padding: 1.5rem;
          border-radius: var(--sienna-radius-lg);
          box-shadow: var(--sienna-shadow-md);
          text-align: center;
        }
        
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--sienna-emerald);
          margin-bottom: 0.5rem;
        }
        
        .metric-label {
          color: var(--sienna-terra);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default SystemHealthLayer;