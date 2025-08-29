"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCopilotAction } from "@copilotkit/react-core";
import PremiumMetricsOverview from "./child/PremiumMetricsOverview";
import AIPerformanceMonitor from "./child/AIPerformanceMonitor";
import UserJourneyTracker from "./child/UserJourneyTracker";
import RealTimeHealthMonitor from "./child/RealTimeHealthMonitor";
import MonthlyMessagesChart from "./child/MonthlyMessagesChart";
import WeeklyUsersOverviewChart from "./child/WeeklyUsersOverviewChart";
import HairConcernsOverviewChart from "./child/HairConcernsOverviewChart";
import UsersListLayer from "@/components/UsersListLayer";
import LoadingSpinner from "./Loading";
import { useUser } from "@clerk/nextjs";

const DashBoardLayerOne = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();

  // CopilotKit Actions for Dashboard Management
  useCopilotAction({
    name: "analyzeDashboardMetrics",
    description: "Analyze current dashboard metrics and provide insights about chatbot performance, user engagement, and business trends",
    parameters: [
      {
        name: "analysisType",
        type: "string",
        enum: ["performance", "user_engagement", "growth_trends", "ai_effectiveness", "comprehensive"],
        description: "Type of analysis to perform on dashboard data"
      },
      {
        name: "timeframe",
        type: "string",
        enum: ["24h", "7d", "30d", "90d"],
        description: "Time period for analysis"
      }
    ],
    handler: async ({ analysisType, timeframe = "7d" }) => {
      try {
        const response = await fetch(`/api/dashboard-metrics?timeframe=${timeframe}`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const metrics = await response.json();
        
        const insights = {
          performance: `🚀 Performance Analysis (${timeframe}):\n• Total Conversations: ${metrics.totalConversations.toLocaleString()}\n• AI Accuracy: ${metrics.aiModelAccuracy.toFixed(1)}%\n• Avg Response Time: ${metrics.avgResponseTime}ms\n• Growth Rate: ${metrics.growthRate.toFixed(1)}%`,
          user_engagement: `👥 User Engagement Analysis (${timeframe}):\n• Active Users: ${metrics.activeUsers.toLocaleString()}\n• Conversion Rate: ${metrics.conversionRate.toFixed(1)}%\n• User Satisfaction: ${metrics.userSatisfaction}/5\n• Hair Profiles Created: ${metrics.totalHairProfiles.toLocaleString()}`,
          growth_trends: `📈 Growth Trends Analysis (${timeframe}):\n• Conversation Growth: ${metrics.changes.totalConversationsChange}%\n• User Growth: ${metrics.changes.activeUsersChange}%\n• Product Interactions: ${metrics.changes.productInteractionsChange}%\n• Overall Growth: ${metrics.growthRate > 0 ? 'Positive trajectory' : 'Needs attention'}`,
          ai_effectiveness: `🤖 AI Effectiveness Analysis (${timeframe}):\n• Model Accuracy: ${metrics.aiModelAccuracy.toFixed(1)}%\n• Response Time: ${metrics.avgResponseTime}ms\n• Success Rate: ${((metrics.productInteractions / Math.max(metrics.totalConversations, 1)) * 100).toFixed(1)}%\n• Recommendation Efficiency: ${metrics.productInteractions > 0 ? 'Performing well' : 'Needs improvement'}`,
          comprehensive: `📊 Comprehensive Dashboard Analysis (${timeframe}):\n\n🚀 PERFORMANCE:\n• ${metrics.totalConversations.toLocaleString()} total conversations\n• ${metrics.aiModelAccuracy.toFixed(1)}% AI accuracy\n• ${metrics.avgResponseTime}ms response time\n\n👥 USERS:\n• ${metrics.activeUsers.toLocaleString()} active users\n• ${metrics.conversionRate.toFixed(1)}% conversion rate\n• ${metrics.userSatisfaction}/5 satisfaction\n\n📈 GROWTH:\n• ${metrics.growthRate.toFixed(1)}% growth rate\n• ${metrics.changes.totalConversationsChange}% conversation growth\n• ${metrics.changes.activeUsersChange}% user growth`
        };

        return insights[analysisType] || insights.comprehensive;
      } catch (error) {
        return "❌ Unable to analyze dashboard metrics. Please check the connection and try again.";
      }
    }
  });

  useCopilotAction({
    name: "generateDashboardReport",
    description: "Generate a comprehensive dashboard report for stakeholders with key insights and recommendations",
    parameters: [
      {
        name: "reportType",
        type: "string",
        enum: ["executive_summary", "technical_performance", "user_analytics", "ai_insights", "full_report"],
        description: "Type of report to generate"
      },
      {
        name: "timeframe",
        type: "string",
        enum: ["24h", "7d", "30d", "90d"],
        description: "Time period for the report"
      }
    ],
    handler: async ({ reportType, timeframe = "30d" }) => {
      try {
        const response = await fetch(`/api/dashboard-metrics?timeframe=${timeframe}`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const metrics = await response.json();
        
        const reports = {
          executive_summary: `📋 EXECUTIVE SUMMARY (${timeframe})\n\nKEY METRICS:\n• Conversations: ${metrics.totalConversations.toLocaleString()} (${metrics.changes.totalConversationsChange}% change)\n• Active Users: ${metrics.activeUsers.toLocaleString()} (${metrics.changes.activeUsersChange}% change)\n• AI Accuracy: ${metrics.aiModelAccuracy.toFixed(1)}%\n• User Satisfaction: ${metrics.userSatisfaction}/5\n• Growth Rate: ${metrics.growthRate.toFixed(1)}%\n\nSTATUS: ${metrics.growthRate > 0 && metrics.userSatisfaction > 4 ? '🟢 Excellent' : metrics.growthRate > 0 ? '🟡 Good' : '🟠 Needs Attention'}`,
          technical_performance: `⚙️ TECHNICAL PERFORMANCE REPORT (${timeframe})\n\nSYSTEM METRICS:\n• AI Model Accuracy: ${metrics.aiModelAccuracy.toFixed(1)}%\n• Average Response Time: ${metrics.avgResponseTime}ms\n• Successful Interactions: ${metrics.productInteractions.toLocaleString()}\n• Conversation Success Rate: ${((metrics.productInteractions / Math.max(metrics.totalConversations, 1)) * 100).toFixed(1)}%\n\nPERFORMANCE STATUS: ${metrics.avgResponseTime < 2000 && metrics.aiModelAccuracy > 85 ? '🟢 Optimal' : '🟡 Monitor'}`,
          user_analytics: `👥 USER ANALYTICS REPORT (${timeframe})\n\nUSER ENGAGEMENT:\n• Active Users: ${metrics.activeUsers.toLocaleString()}\n• Conversion Rate: ${metrics.conversionRate.toFixed(1)}%\n• Hair Profiles: ${metrics.totalHairProfiles.toLocaleString()}\n• User Satisfaction: ${metrics.userSatisfaction}/5\n• Product Interactions: ${metrics.productInteractions.toLocaleString()}\n\nUSER GROWTH: ${metrics.changes.activeUsersChange}% change`,
          ai_insights: `🤖 AI INSIGHTS REPORT (${timeframe})\n\nAI PERFORMANCE:\n• Model Accuracy: ${metrics.aiModelAccuracy.toFixed(1)}%\n• Response Efficiency: ${metrics.avgResponseTime}ms avg\n• Recommendation Rate: ${((metrics.productInteractions / Math.max(metrics.totalConversations, 1)) * 100).toFixed(1)}%\n\nAI EFFECTIVENESS: ${metrics.aiModelAccuracy > 90 ? '🟢 Excellent' : metrics.aiModelAccuracy > 80 ? '🟡 Good' : '🟠 Needs Training'}`,
          full_report: `📊 COMPREHENSIVE DASHBOARD REPORT (${timeframe})\n\n🎯 EXECUTIVE SUMMARY:\n• Total Conversations: ${metrics.totalConversations.toLocaleString()}\n• Active Users: ${metrics.activeUsers.toLocaleString()}\n• Growth Rate: ${metrics.growthRate.toFixed(1)}%\n• User Satisfaction: ${metrics.userSatisfaction}/5\n\n⚙️ TECHNICAL PERFORMANCE:\n• AI Accuracy: ${metrics.aiModelAccuracy.toFixed(1)}%\n• Response Time: ${metrics.avgResponseTime}ms\n• Success Rate: ${((metrics.productInteractions / Math.max(metrics.totalConversations, 1)) * 100).toFixed(1)}%\n\n👥 USER ENGAGEMENT:\n• Conversion Rate: ${metrics.conversionRate.toFixed(1)}%\n• Hair Profiles: ${metrics.totalHairProfiles.toLocaleString()}\n• Product Interactions: ${metrics.productInteractions.toLocaleString()}\n\n📈 TRENDS:\n• Conversation Growth: ${metrics.changes.totalConversationsChange}%\n• User Growth: ${metrics.changes.activeUsersChange}%\n• Interaction Growth: ${metrics.changes.productInteractionsChange}%\n\n💡 RECOMMENDATIONS:\n${metrics.growthRate < 5 ? '• Focus on user acquisition strategies\n' : ''}${metrics.aiModelAccuracy < 85 ? '• Enhance AI model training\n' : ''}${metrics.userSatisfaction < 4 ? '• Improve user experience\n' : ''}${metrics.avgResponseTime > 2000 ? '• Optimize response times\n' : ''}• Continue monitoring key metrics\n• Regular performance reviews recommended`
        };

        return reports[reportType] || reports.full_report;
      } catch (error) {
        return "❌ Unable to generate dashboard report. Please check the connection and try again.";
      }
    }
  });

  useCopilotAction({
    name: "refreshDashboard",
    description: "Refresh all dashboard data and metrics to get the most current information",
    parameters: [],
    handler: async () => {
      try {
        setRefreshing(true);
        const response = await fetch('/api/dashboard-metrics?timeframe=7d&refresh=true');
        if (!response.ok) throw new Error('Failed to refresh data');
        const data = await response.json();
        setDashboardData(data);
        setRefreshing(false);
        return "✅ Dashboard refreshed successfully! All metrics have been updated with the latest data.";
      } catch (error) {
        setRefreshing(false);
        return "❌ Failed to refresh dashboard. Please try again or check your connection.";
      }
    }
  });

  useCopilotAction({
    name: "identifyDashboardIssues",
    description: "Identify potential issues or areas for improvement based on current dashboard metrics",
    parameters: [
      {
        name: "focusArea",
        type: "string",
        enum: ["performance", "user_experience", "ai_effectiveness", "growth", "all"],
        description: "Area to focus the issue analysis on"
      }
    ],
    handler: async ({ focusArea = "all" }) => {
      try {
        const response = await fetch('/api/dashboard-metrics?timeframe=7d');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const metrics = await response.json();
        
        const issues = [];
        
        if (focusArea === "performance" || focusArea === "all") {
          if (metrics.avgResponseTime > 2000) issues.push("⚠️ Response time is above 2 seconds - consider optimization");
          if (metrics.aiModelAccuracy < 85) issues.push("⚠️ AI accuracy below 85% - model training recommended");
        }
        
        if (focusArea === "user_experience" || focusArea === "all") {
          if (metrics.userSatisfaction < 4) issues.push("⚠️ User satisfaction below 4/5 - UX improvements needed");
          if (metrics.conversionRate < 10) issues.push("⚠️ Low conversion rate - engagement strategies needed");
        }
        
        if (focusArea === "ai_effectiveness" || focusArea === "all") {
          const recommendationRate = (metrics.productInteractions / Math.max(metrics.totalConversations, 1)) * 100;
          if (recommendationRate < 30) issues.push("⚠️ Low recommendation rate - AI effectiveness needs improvement");
        }
        
        if (focusArea === "growth" || focusArea === "all") {
          if (metrics.growthRate < 0) issues.push("🚨 Negative growth rate - immediate attention required");
          if (parseFloat(metrics.changes.activeUsersChange) < 0) issues.push("⚠️ Declining active users - retention strategies needed");
        }
        
        if (issues.length === 0) {
          return `✅ No significant issues detected in ${focusArea === "all" ? "any area" : focusArea}. Dashboard metrics are within healthy ranges!`;
        }
        
        return `🔍 DASHBOARD ISSUES IDENTIFIED (${focusArea}):\n\n${issues.join('\n')}\n\n💡 Consider addressing these areas to improve overall performance.`;
      } catch (error) {
        return "❌ Unable to analyze dashboard for issues. Please check the connection and try again.";
      }
    }
  });

  // Enhanced data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard-metrics?timeframe=7d');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 5 minutes
    const dataInterval = setInterval(fetchDashboardData, 300000);
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(dataInterval);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/dashboard-metrics?timeframe=7d');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const viewTabs = [
    { id: 'overview', label: 'Overview', icon: 'solar:chart-2-bold-duotone' },
    { id: 'analytics', label: 'Analytics', icon: 'solar:graph-up-bold-duotone' },
    { id: 'performance', label: 'AI Performance', icon: 'solar:cpu-bolt-bold-duotone' },
    { id: 'health', label: 'System Health', icon: 'solar:shield-check-bold-duotone' }
  ];

  if (loading) {
    return (
      <LoadingSpinner 
        size="large" 
        message="Loading dashboard..." 
        type="analysis"
      />
    );
  }

  return (
    <motion.div 
      className="premium-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Dashboard Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="header-left">
          <div className="welcome-section">
            <motion.h3 
              className="dashboard-welcome"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Icon icon="solar:sun-bold-duotone" className="welcome-icon" />
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'} {user?.firstName}
            </motion.h3>
            <motion.p 
              className="dashboard-subtitle"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Here's what's happening with your Sienna Naturals chatbot today
            </motion.p>
            
            {dashboardData && (
              <motion.div 
                className="status-indicators"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className={`status-dot ${dashboardData.totalConversations > 0 ? 'active' : 'inactive'}`}></div>
                <span className="status-text">
                  {dashboardData.totalConversations > 0 ? 'System Active' : 'No Activity'}
                </span>
                {dashboardData.growthRate > 0 && (
                  <>
                    <div className="status-separator"></div>
                    <Icon icon="solar:arrow-up-bold" className="growth-icon" />
                    <span className="growth-text">+{dashboardData.growthRate.toFixed(1)}% growth</span>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="header-right">
          <motion.div 
            className="time-widget"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
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
          </motion.div>

          <motion.button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Icon 
              icon="solar:refresh-bold" 
              className={`refresh-icon ${refreshing ? 'spinning' : ''}`} 
            />
            <span className="refresh-label">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </motion.button>
          
          <motion.div 
            className="dashboard-header-quick-actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { icon: 'solar:chat-round-dots-bold', label: 'Conversations', href: '/chat-message' },
              { icon: 'solar:users-group-rounded-bold', label: 'Users', href: '/users' },
              { icon: 'solar:cpu-bolt-bold', label: 'Training', href: '/training' },
              { icon: 'solar:bag-bold', label: 'Products', href: '/products' }
            ].map((action, index) => (
              <motion.button 
                key={action.label}
                className="dashboard-header-action-button" 
                onClick={() => window.location.href = action.href}
                title={action.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <Icon icon={action.icon} />
                <span className="dashboard-header-action-label">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

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

      {/* Premium Sienna Naturals Dashboard Styling */}
      <style jsx>{`
        .premium-dashboard {
          font-family: var(--sienna-font-primary);
          color: var(--sienna-charcoal);
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          padding: 1.5rem;
        }

        /* Enhanced Header Styles */
        .dashboard-header {
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-emerald) 100%);
          border-radius: var(--sienna-radius-xl);
          padding: 2rem;
          margin-bottom: 2rem;
          color: var(--sienna-white);
          box-shadow: var(--sienna-shadow-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          position: relative;
          overflow: hidden;
        }

        .dashboard-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .header-left {
          flex: 1;
          min-width: 300px;
          z-index: 2;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          z-index: 2;
        }

        .dashboard-welcome {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--sienna-white);
        }

        .welcome-icon {
          font-size: 2.5rem;
          opacity: 0.9;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .dashboard-subtitle {
          margin: 0 0 1rem 0;
          font-size: 1.15rem;
          opacity: 0.9;
          font-weight: 400;
          line-height: 1.5;
        }

        .status-indicators {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-dot.active {
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }

        .status-dot.inactive {
          background: #f59e0b;
        }

        .status-text {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-separator {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.3);
          margin: 0 0.5rem;
        }

        .growth-icon {
          color: #22c55e;
          font-size: 1.1rem;
        }

        .growth-text {
          color: #22c55e;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .time-widget {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: var(--sienna-radius-lg);
          padding: 1rem 1.5rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .current-time {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          font-feature-settings: 'tnum';
        }

        .current-date {
          font-size: 0.85rem;
          opacity: 0.8;
          font-weight: 500;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--sienna-radius-lg);
          color: var(--sienna-white);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--sienna-transition-medium);
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .refresh-icon {
          font-size: 1.1rem;
        }

        .refresh-icon.spinning {
          animation: spin 1s linear infinite;
        }

        .dashboard-header-quick-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .dashboard-header-action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--sienna-radius-lg);
          color: var(--sienna-white);
          cursor: pointer;
          transition: all var(--sienna-transition-medium);
          min-width: 80px;
        }

        .dashboard-header-action-button:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .dashboard-header-action-button svg {
          font-size: 1.5rem;
        }

        .dashboard-header-action-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
        }

        /* Enhanced Navigation */
        .dashboard-nav {
          background: var(--sienna-white);
          border-radius: var(--sienna-radius-xl);
          box-shadow: var(--sienna-shadow-md);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .nav-tabs {
          display: flex;
          background: rgba(145, 169, 150, 0.05);
          padding: 0.5rem;
          gap: 0.25rem;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: var(--sienna-radius-lg);
          color: var(--sienna-terra);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--sienna-transition-medium);
          flex: 1;
          justify-content: center;
        }

        .nav-tab:hover {
          background: rgba(145, 169, 150, 0.1);
          color: var(--sienna-sage);
        }

        .nav-tab.active {
          background: var(--sienna-sage);
          color: var(--sienna-white);
          box-shadow: var(--sienna-shadow-sm);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-label {
          font-size: 0.95rem;
        }

        /* Dashboard Content */
        .dashboard-content {
          min-height: 600px;
        }

        .view-content {
          animation: fadeIn 0.5s ease-in-out;
        }

        .view-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
          font-weight: 700;
          color: var(--sienna-charcoal);
          margin: 0 0 0.5rem 0;
        }

        .title-icon {
          font-size: 2rem;
          color: var(--sienna-sage);
        }

        .view-subtitle {
          color: var(--sienna-terra);
          margin: 0 0 2rem 0;
          font-size: 1.1rem;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .grid-section.full-width {
          grid-column: 1 / -1;
        }

        .grid-section.half-width {
          min-width: 400px;
        }

        /* Section Headers */
        .analytics-header,
        .performance-header,
        .health-header {
          background: var(--sienna-white);
          border-radius: var(--sienna-radius-xl);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: var(--sienna-shadow-md);
          text-align: center;
        }

        /* Animations */
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
          }
          50% { 
            opacity: 0.5; 
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .grid-section.half-width {
            min-width: unset;
          }
        }

        @media (max-width: 768px) {
          .premium-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .header-left {
            min-width: unset;
          }

          .header-right {
            justify-content: center;
          }

          .dashboard-welcome {
            font-size: 1.75rem;
            justify-content: center;
          }

          .nav-tabs {
            flex-direction: column;
            gap: 0.5rem;
          }

          .nav-tab {
            justify-content: flex-start;
          }

          .dashboard-header-quick-actions {
            justify-content: center;
            width: 100%;
          }

          .dashboard-header-action-button {
            min-width: 70px;
            padding: 0.75rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .premium-dashboard {
            background: linear-gradient(135deg, var(--sienna-charcoal) 0%, #0f172a 100%);
          }

          .dashboard-nav {
            background: rgba(255, 255, 255, 0.05);
          }

          .analytics-header,
          .performance-header,
          .health-header {
            background: rgba(255, 255, 255, 0.05);
            color: var(--sienna-white);
          }

          .view-title {
            color: var(--sienna-white);
          }
        }

        /* Loading States */
        .loading-skeleton {
          background: linear-gradient(90deg, rgba(145, 169, 150, 0.1) 0%, rgba(145, 169, 150, 0.2) 50%, rgba(145, 169, 150, 0.1) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default DashBoardLayerOne;
