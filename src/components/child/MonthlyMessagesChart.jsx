"use client";
import React from 'react';
import { Icon } from '@iconify/react';

const MonthlyMessagesChart = () => {
  return (
    <div className="sienna-card">
      <div className="sienna-card-header">
        <h3 className="sienna-card-title">
          <Icon icon="solar:chart-2-bold-duotone" className="title-icon" />
          Monthly Messages
        </h3>
      </div>
      <div className="sienna-card-body">
        <div className="sienna-empty-container">
          <Icon icon="solar:chart-2-outline" className="sienna-empty-icon" />
          <h4 className="sienna-empty-title">Monthly Message Analytics</h4>
          <p className="sienna-empty-message">
            Monthly message trends and analytics charts will be displayed here. Track conversation volumes and growth patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyMessagesChart;