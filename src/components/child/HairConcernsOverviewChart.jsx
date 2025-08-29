"use client";
import React from 'react';
import { Icon } from '@iconify/react';

const HairConcernsOverviewChart = () => {
  return (
    <div className="sienna-card">
      <div className="sienna-card-header">
        <h3 className="sienna-card-title">
          <Icon icon="mingcute:hair-2-line" className="title-icon" />
          Hair Concerns Analytics
        </h3>
      </div>
      <div className="sienna-card-body">
        <div className="sienna-empty-container">
          <Icon icon="mingcute:hair-line" className="sienna-empty-icon" />
          <h4 className="sienna-empty-title">Hair Concerns Overview</h4>
          <p className="sienna-empty-message">
            Hair concerns analytics and trending issues will be displayed here. Track the most common hair problems and solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HairConcernsOverviewChart;