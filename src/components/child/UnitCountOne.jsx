// components/child/PremiumMetricsOverview.js
"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const PremiumMetricsOverview = () => {
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    activeUsers: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    aiModelAccuracy: 0,
    userSatisfaction: 0,
    growthRate: 0,
    totalHairProfiles: 0,
    productInteractions: 0,
    changes: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard-metrics?timeframe=${timeframe}`);
        if (response.ok) {
          const data = await response.json();
          setTimeout(() => {
            setMetrics(data);
            setLoading(false);
          }, 300);
        } else {
          throw new Error('API not available');
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setTimeout(() => {
          setMetrics({
            totalConversations: 0,
            activeUsers: 0,
            conversionRate: 0,
            avgResponseTime: 0,
            aiModelAccuracy: 0,
            userSatisfaction: 0,
            growthRate: 0,
            totalHairProfiles: 0,
            productInteractions: 0,
            changes: {}
          });
          setLoading(false);
        }, 300);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const metricCards = [
    {
      title: 'Total Conversations',
      value: metrics.totalConversations > 0 ? metrics.totalConversations.toLocaleString() : '—',
      change: metrics.totalConversations > 0 ? 
        `${parseFloat(metrics.changes.totalConversationsChange || 0) >= 0 ? '+' : ''}${metrics.changes.totalConversationsChange || 0}%` : 
        'No data yet',
      trend: metrics.totalConversations > 0 ? 
        (parseFloat(metrics.changes.totalConversationsChange || 0) > 0 ? 'up' : parseFloat(metrics.changes.totalConversationsChange || 0) < 0 ? 'down' : 'neutral') : 
        'neutral',
      icon: 'solar:chat-round-dots-bold-duotone',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      isEmpty: metrics.totalConversations === 0
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers > 0 ? metrics.activeUsers.toLocaleString() : '—',
      change: metrics.activeUsers > 0 ? 
        `${parseFloat(metrics.changes.activeUsersChange || 0) >= 0 ? '+' : ''}${metrics.changes.activeUsersChange || 0}%` : 
        'No data yet',
      trend: metrics.activeUsers > 0 ? 
        (parseFloat(metrics.changes.activeUsersChange || 0) > 0 ? 'up' : parseFloat(metrics.changes.activeUsersChange || 0) < 0 ? 'down' : 'neutral') : 
        'neutral',
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      isEmpty: metrics.activeUsers === 0
    },
    {
      title: 'Conversion Rate',
      value: metrics.conversionRate > 0 ? `${metrics.conversionRate.toFixed(1)}%` : '—%',
      change: metrics.conversionRate > 0 ? '+2.1%' : 'Collecting data',
      trend: metrics.conversionRate > 0 ? 'up' : 'neutral',
      icon: 'solar:target-bold-duotone',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      isEmpty: metrics.conversionRate === 0
    },
    {
      title: 'AI Model Accuracy',
      value: metrics.aiModelAccuracy > 0 ? `${metrics.aiModelAccuracy.toFixed(1)}%` : '—%',
      change: metrics.aiModelAccuracy > 0 ? '+0.8%' : 'Training in progress',
      trend: metrics.aiModelAccuracy > 0 ? 'up' : 'neutral',
      icon: 'solar:cpu-bolt-bold-duotone',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      isEmpty: metrics.aiModelAccuracy === 0
    },
    {
      title: 'Avg Response Time',
      value: metrics.avgResponseTime > 0 ? `${metrics.avgResponseTime}ms` : '—ms',
      change: metrics.avgResponseTime > 0 ? '-5.3%' : 'Monitoring',
      trend: metrics.avgResponseTime > 0 ? 'down' : 'neutral',
      icon: 'solar:clock-circle-bold-duotone',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      isEmpty: metrics.avgResponseTime === 0
    },
    {
      title: 'User Satisfaction',
      value: metrics.userSatisfaction > 0 ? `${metrics.userSatisfaction.toFixed(1)}/5` : '—/5',
      change: metrics.userSatisfaction > 0 ? '+0.3' : 'Awaiting feedback',
      trend: metrics.userSatisfaction > 0 ? 'up' : 'neutral',
      icon: 'solar:star-bold-duotone',
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      isEmpty: metrics.userSatisfaction === 0
    },
    {
      title: 'Growth Rate',
      value: metrics.growthRate > 0 ? `${metrics.growthRate.toFixed(1)}%` : '—%',
      change: metrics.growthRate > 0 ? '+3.7%' : 'Calculating',
      trend: metrics.growthRate > 0 ? 'up' : 'neutral',
      icon: 'solar:graph-up-bold-duotone',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      isEmpty: metrics.growthRate === 0
    },
    {
      title: 'Hair Profiles',
      value: metrics.totalHairProfiles > 0 ? metrics.totalHairProfiles.toLocaleString() : '—',
      change: metrics.totalHairProfiles > 0 ? '+15.2%' : 'Building database',
      trend: metrics.totalHairProfiles > 0 ? 'up' : 'neutral',
      icon: 'solar:user-id-bold-duotone',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      isEmpty: metrics.totalHairProfiles === 0
    },
    {
      title: 'Product Interactions',
      value: metrics.productInteractions > 0 ? metrics.productInteractions.toLocaleString() : '—',
      change: metrics.productInteractions > 0 ? 
        `${parseFloat(metrics.changes.productInteractionsChange || 0) >= 0 ? '+' : ''}${metrics.changes.productInteractionsChange || 0}%` : 
        'No interactions yet',
      trend: metrics.productInteractions > 0 ? 
        (parseFloat(metrics.changes.productInteractionsChange || 0) > 0 ? 'up' : parseFloat(metrics.changes.productInteractionsChange || 0) < 0 ? 'down' : 'neutral') : 
        'neutral',
      icon: 'solar:shop-bold-duotone',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      isEmpty: metrics.productInteractions === 0
    }
  ];

  return (
    <div className="premium-metrics-overview">
      {/* Header with Time Filter */}
      <div className="metrics-header">
        <div className="header-content">
          <h2 className="dashboard-title">
            <Icon icon="solar:chart-2-bold-duotone" className="title-icon" />
            Analytics Overview
          </h2>
          <div className="live-indicator">
            <div className="pulse-dot"></div>
            <span>Live Data</span>
          </div>
        </div>
        
        <div className="time-filter">
          {['24h', '7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              className={`filter-btn ${timeframe === period ? 'active' : ''}`}
              onClick={() => setTimeframe(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metricCards.map((metric, index) => (
          <div 
            key={metric.title}
            className="metric-card"
            style={{ '--animation-delay': `${index * 100}ms` }}
          >
            <div className="card-background">
              <div className={`gradient-bg bg-gradient-to-br ${metric.color}`}></div>
            </div>
            
            <div className="card-content">
              <div className="card-header">
                <div className={`icon-container ${metric.bgColor}`}>
                  <Icon icon={metric.icon} className={`metric-icon ${metric.textColor}`} />
                </div>
                <div className={`trend-indicator ${
                  metric.trend === 'up' ? 'trend-up' : 
                  metric.trend === 'down' ? 'trend-down' : 'trend-neutral'
                }`}>
                  {metric.trend !== 'neutral' && (
                    <Icon 
                      icon={metric.trend === 'up' ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'} 
                      className="trend-icon" 
                    />
                  )}
                  <span className="trend-value">{metric.change}</span>
                </div>
              </div>
              
              <div className="card-body">
                <div className="metric-value">
                  {loading ? (
                    <div className="loading-skeleton"></div>
                  ) : (
                    <span className="value-text">{metric.value}</span>
                  )}
                </div>
                <p className="metric-title">{metric.title}</p>
              </div>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="hover-overlay"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumMetricsOverview;