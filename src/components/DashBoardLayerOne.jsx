"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import PremiumMetricsOverview from "./child/PremiumMetricsOverview";
import AIPerformanceMonitor from "./child/AIPerformanceMonitor";
import UserJourneyTracker from "./child/UserJourneyTracker";
import RealTimeHealthMonitor from "./child/RealTimeHealthMonitor";
import MonthlyMessagesChart from "./child/MonthlyMessagesChart";
import WeeklyUsersOverviewChart from "./child/WeeklyUsersOverviewChart";
import HairConcernsOverviewChart from "./child/HairConcernsOverviewChart";
import UsersListLayer from "@/components/UsersListLayer";
import { useUser } from "@clerk/nextjs";

const DashBoardLayerOne = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState('overview');
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const viewTabs = [
    { id: 'overview', label: 'Overview', icon: 'solar:chart-2-bold-duotone' },
    { id: 'analytics', label: 'Analytics', icon: 'solar:graph-up-bold-duotone' },
    { id: 'performance', label: 'AI Performance', icon: 'solar:cpu-bolt-bold-duotone' },
    { id: 'health', label: 'System Health', icon: 'solar:shield-check-bold-duotone' }
  ];

  return (
    <div className="premium-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="welcome-section">
            <h3 className="dashboard-welcome">
              <Icon icon="solar:sun-bold-duotone" className="welcome-icon" />
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'} {user?.firstName}
            </h3>
            <p className="dashboard-subtitle">
              Here's what's happening with your Sienna Naturals chatbot today
            </p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="time-widget">
            <div className="current-time">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="current-date">
              {currentTime.toLocaleDateString([], { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <div className="quick-actions">
            <button 
              className="action-btn" 
              onClick={() => window.location.href = '/chat-message'}
              title="View Conversations"
            >
              <Icon icon="solar:chat-round-dots-bold" />
              <span className="action-label">Conversations</span>
            </button>
            <button 
              className="action-btn" 
              onClick={() => window.location.href = '/users'}
              title="Manage Users"
            >
              <Icon icon="solar:users-group-rounded-bold" />
              <span className="action-label">Users</span>
            </button>
            <button 
              className="action-btn" 
              onClick={() => window.location.href = '/training'}
              title="AI Training"
            >
              <Icon icon="solar:cpu-bolt-bold" />
              <span className="action-label">Training</span>
            </button>
            <button 
              className="action-btn" 
              onClick={() => window.location.href = '/products'}
              title="Manage Products"
            >
              <Icon icon="solar:bag-bold" />
              <span className="action-label">Products</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="dashboard-nav">
        <div className="nav-tabs">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeView === tab.id ? 'active' : ''}`}
              onClick={() => setActiveView(tab.id)}
            >
              <Icon icon={tab.icon} className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {activeView === 'overview' && (
          <div className="view-content fade-in">
            <PremiumMetricsOverview />
            
            <div className="dashboard-grid">
              <div className="grid-section full-width">
                <UserJourneyTracker />
              </div>
              
              <div className="grid-section half-width">
                <MonthlyMessagesChart />
              </div>
              
              <div className="grid-section half-width">
                <WeeklyUsersOverviewChart />
              </div>
              
              <div className="grid-section half-width">
                <HairConcernsOverviewChart />
              </div>
              
              <div className="grid-section full-width">
                <RealTimeHealthMonitor />
              </div>
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="view-content fade-in">
            <div className="analytics-header">
              <h2 className="view-title">
                <Icon icon="solar:graph-up-bold-duotone" className="title-icon" />
                Advanced Analytics
              </h2>
              <p className="view-subtitle">Deep insights into user behavior and performance metrics</p>
            </div>
            
            <div className="dashboard-grid">
              <div className="grid-section full-width">
                <UserJourneyTracker />
              </div>
              
              <div className="grid-section full-width">
                <UsersListLayer />
              </div>
            </div>
          </div>
        )}

        {activeView === 'performance' && (
          <div className="view-content fade-in">
            <div className="performance-header">
              <h2 className="view-title">
                <Icon icon="solar:cpu-bolt-bold-duotone" className="title-icon" />
                AI Performance Dashboard
              </h2>
              <p className="view-subtitle">Monitor and optimize AI model performance in real-time</p>
            </div>
            
            <AIPerformanceMonitor />
          </div>
        )}

        {activeView === 'health' && (
          <div className="view-content fade-in">
            <div className="health-header">
              <h2 className="view-title">
                <Icon icon="solar:shield-check-bold-duotone" className="title-icon" />
                System Health & Monitoring
              </h2>
              <p className="view-subtitle">Real-time system status and infrastructure monitoring</p>
            </div>
            
            <RealTimeHealthMonitor />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoardLayerOne;
