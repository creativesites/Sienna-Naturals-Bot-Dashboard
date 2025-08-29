"use client";
import React from 'react';
import { Icon } from '@iconify/react';

const WeeklyUsersOverviewChart = () => {
  return (
    <div className="sienna-card">
      <div className="sienna-card-header">
        <h3 className="sienna-card-title">
          <Icon icon="solar:users-group-rounded-bold-duotone" className="title-icon" />
          Weekly Users
        </h3>
      </div>
      <div className="sienna-card-body">
        <div className="sienna-empty-container">
          <Icon icon="solar:users-group-rounded-outline" className="sienna-empty-icon" />
          <h4 className="sienna-empty-title">Weekly User Overview</h4>
          <p className="sienna-empty-message">
            Weekly user activity and engagement charts will be displayed here. Monitor user growth and retention metrics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyUsersOverviewChart;