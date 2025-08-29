"use client";
import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import SettingsLayout from '@/components/SettingsLayout';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('team');

  return (
    <div className="myavana-dashboard-container">
      {/* Header */}
      <div className="myavana-page-header">
        <div className="myavana-breadcrumb">
          <ul className="myavana-breadcrumb-list">
            <li><a href="/">Dashboard</a></li>
            <li>Settings</li>
          </ul>
        </div>
        <div className="myavana-page-title-section">
          <div className="myavana-page-title-content">
            <Icon icon="solar:settings-outline" className="title-icon" />
            <div>
              <h1 className="myavana-page-title">Site Settings</h1>
              <p className="myavana-page-subtitle">Manage your Myavana dashboard configuration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Layout */}
      <SettingsLayout activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default SettingsPage;