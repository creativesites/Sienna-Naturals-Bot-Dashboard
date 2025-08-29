"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import TeamManagement from '@/components/TeamManagement';

const SettingsLayout = ({ activeTab, setActiveTab }) => {
  const settingsTabs = [
    {
      id: 'team',
      name: 'Team Management',
      icon: 'solar:users-group-rounded-outline',
      description: 'Manage users, roles, and permissions'
    },
    {
      id: 'general',
      name: 'General Settings',
      icon: 'solar:settings-outline',
      description: 'Basic configuration and preferences'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: 'solar:bell-outline',
      description: 'Email and system notifications'
    },
    {
      id: 'security',
      name: 'Security',
      icon: 'solar:shield-check-outline',
      description: 'Authentication and security settings'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: 'solar:link-circle-outline',
      description: 'Third-party services and APIs'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return <TeamManagement />;
      case 'general':
        return <GeneralSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'integrations':
        return <IntegrationSettings />;
      default:
        return <TeamManagement />;
    }
  };

  return (
    <div className="myavana-settings-container">
      <div className="row">
        {/* Settings Navigation */}
        <div className="col-lg-3 col-md-4">
          <div className="myavana-card settings-nav-card">
            <div className="myavana-card-header">
              <h3 className="myavana-card-title">
                <Icon icon="solar:widget-outline" />
                Settings
              </h3>
            </div>
            <div className="myavana-card-body p-0">
              <ul className="myavana-settings-nav">
                {settingsTabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      className={`myavana-settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <div className="nav-item-icon">
                        <Icon icon={tab.icon} />
                      </div>
                      <div className="nav-item-content">
                        <span className="nav-item-title">{tab.name}</span>
                        <span className="nav-item-description">{tab.description}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-lg-9 col-md-8">
          <div className="settings-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other settings sections
const GeneralSettings = () => (
  <div className="myavana-card">
    <div className="myavana-card-header">
      <h3 className="myavana-card-title">
        <Icon icon="solar:settings-outline" />
        General Settings
      </h3>
    </div>
    <div className="myavana-card-body">
      <div className="settings-placeholder">
        <Icon icon="solar:widget-2-outline" className="placeholder-icon" />
        <h4>General Settings</h4>
        <p>Basic configuration options will be available here in future updates.</p>
      </div>
    </div>
  </div>
);

const NotificationSettings = () => (
  <div className="myavana-card">
    <div className="myavana-card-header">
      <h3 className="myavana-card-title">
        <Icon icon="solar:bell-outline" />
        Notification Settings
      </h3>
    </div>
    <div className="myavana-card-body">
      <div className="settings-placeholder">
        <Icon icon="solar:bell-bing-outline" className="placeholder-icon" />
        <h4>Notification Preferences</h4>
        <p>Email and system notification settings will be configured here.</p>
      </div>
    </div>
  </div>
);

const SecuritySettings = () => (
  <div className="myavana-card">
    <div className="myavana-card-header">
      <h3 className="myavana-card-title">
        <Icon icon="solar:shield-check-outline" />
        Security Settings
      </h3>
    </div>
    <div className="myavana-card-body">
      <div className="settings-placeholder">
        <Icon icon="solar:shield-star-outline" className="placeholder-icon" />
        <h4>Security & Authentication</h4>
        <p>Authentication methods and security policies will be managed here.</p>
      </div>
    </div>
  </div>
);

const IntegrationSettings = () => (
  <div className="myavana-card">
    <div className="myavana-card-header">
      <h3 className="myavana-card-title">
        <Icon icon="solar:link-circle-outline" />
        Integration Settings
      </h3>
    </div>
    <div className="myavana-card-body">
      <div className="settings-placeholder">
        <Icon icon="solar:link-broken-outline" className="placeholder-icon" />
        <h4>Third-party Integrations</h4>
        <p>API connections and external service integrations will be configured here.</p>
      </div>
    </div>
  </div>
);

export default SettingsLayout;