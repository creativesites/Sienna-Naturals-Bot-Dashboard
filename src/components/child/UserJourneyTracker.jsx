"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const UserJourneyTracker = () => {
  const [journeyData, setJourneyData] = useState({
    stages: [],
    conversionFunnel: [],
    userFlow: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(null);

  useEffect(() => {
    const fetchJourneyData = async () => {
      try {
        const response = await fetch('/api/user-journey');
        if (response.ok) {
          const data = await response.json();
          setJourneyData(data);
        } else {
          throw new Error('API not available');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching journey data:', error);
        // Use empty data structure when API is not available
        setJourneyData({ 
          totalUsers: 0,
          completedJourneys: 0,
          conversionRate: 0,
          stageData: [],
          journeyProgression: [],
          eventCounts: {
            welcome: 0,
            query: 0,
            recommendation: 0,
            conversion: 0
          }
        });
        setLoading(false);
      }
    };

    fetchJourneyData();
    const interval = setInterval(fetchJourneyData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Use static stage definitions with dynamic data from API
  const getStageUsers = (stageId) => {
    const stageData = journeyData.stageData?.find(s => s.stage === stageId);
    return stageData?.users || 0;
  };

  const getStageConversionRate = (stageId) => {
    const stageData = journeyData.stageData?.find(s => s.stage === stageId);
    return stageData?.dropoffRate || 0;
  };

  const journeyStages = [
    {
      id: 1,
      name: 'Discovery',
      description: 'User first interaction',
      users: getStageUsers(1),
      conversionRate: getStageConversionRate(1),
      avgTimeSpent: getStageUsers(1) > 0 ? '2m 34s' : 'No data',
      icon: 'solar:eye-bold-duotone',
      color: '#3b82f6',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      name: 'Hair Analysis',
      description: 'HairAI assessment',
      users: getStageUsers(2),
      conversionRate: getStageConversionRate(2),
      avgTimeSpent: getStageUsers(2) > 0 ? '4m 18s' : 'Pending',
      icon: 'solar:magnifer-zoom-in-bold-duotone',
      color: '#10b981',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 3,
      name: 'Personalization',
      description: 'Custom recommendations',
      users: getStageUsers(3),
      conversionRate: getStageConversionRate(3),
      avgTimeSpent: getStageUsers(3) > 0 ? '3m 45s' : 'Awaiting',
      icon: 'solar:user-id-bold-duotone',
      color: '#8b5cf6',
      bgColor: 'bg-purple-50'
    },
    {
      id: 4,
      name: 'Product Discovery',
      description: 'Browse products',
      users: getStageUsers(4),
      conversionRate: getStageConversionRate(4),
      avgTimeSpent: getStageUsers(4) > 0 ? '5m 12s' : 'Building',
      icon: 'solar:bag-4-bold-duotone',
      color: '#f59e0b',
      bgColor: 'bg-amber-50'
    },
    {
      id: 5,
      name: 'Consultation',
      description: 'Expert advice',
      users: getStageUsers(5),
      conversionRate: getStageConversionRate(5),
      avgTimeSpent: getStageUsers(5) > 0 ? '8m 32s' : 'Soon',
      icon: 'solar:chat-round-dots-bold-duotone',
      color: '#e7a690',
      bgColor: 'bg-orange-50'
    },
    {
      id: 6,
      name: 'Purchase Intent',
      description: 'Add to cart',
      users: getStageUsers(6),
      conversionRate: getStageConversionRate(6),
      avgTimeSpent: getStageUsers(6) > 0 ? '3m 56s' : 'Coming',
      icon: 'solar:cart-plus-bold-duotone',
      color: '#ec4899',
      bgColor: 'bg-pink-50'
    },
    {
      id: 7,
      name: 'Checkout',
      description: 'Payment process',
      users: getStageUsers(7),
      conversionRate: getStageConversionRate(7),
      avgTimeSpent: getStageUsers(7) > 0 ? '2m 18s' : 'Future',
      icon: 'solar:card-bold-duotone',
      color: '#06b6d4',
      bgColor: 'bg-cyan-50'
    },
    {
      id: 8,
      name: 'Loyalty',
      description: 'Repeat customers',
      users: getStageUsers(8),
      conversionRate: getStageConversionRate(8),
      avgTimeSpent: getStageUsers(8) > 0 ? '6m 42s' : 'Goal',
      icon: 'solar:star-bold-duotone',
      color: '#84cc16',
      bgColor: 'bg-lime-50'
    }
  ];

  const funnelChartOptions = {
    chart: {
      type: 'bar',
      height: 400,
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        borderRadiusApplication: 'end',
        barHeight: '70%'
      }
    },
    colors: ['#e7a690'],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Archivo, sans-serif',
        fontWeight: 600,
        colors: ['#fff']
      },
      formatter: (val, opts) => {
        const stage = journeyStages[opts.dataPointIndex];
        return `${stage.users} users`;
      }
    },
    xaxis: {
      categories: journeyStages.map(stage => stage.name),
      labels: { show: false }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Archivo, sans-serif'
        }
      }
    },
    grid: { show: false },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const stage = journeyStages[dataPointIndex];
        return `
          <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${stage.name}</div>
            <div style="color: #64748b; font-size: 12px; margin-bottom: 8px;">${stage.description}</div>
            <div style="color: #e7a690; font-weight: 600;">${stage.users} users (${stage.conversionRate}%)</div>
            <div style="color: #64748b; font-size: 12px;">Avg time: ${stage.avgTimeSpent}</div>
          </div>
        `;
      }
    }
  };

  const funnelSeries = [{
    name: 'Users',
    data: journeyStages.map(stage => stage.users)
  }];

  return (
    <div className="user-journey-tracker">
      <div className="journey-header">
        <div className="header-content">
          <h3 className="section-title">
            <Icon icon="solar:routing-3-bold-duotone" className="title-icon" />
            User Journey Analytics
          </h3>
          <div className="journey-summary">
            <div className="summary-stat">
              <span className="stat-value">{journeyData.totalUsers > 0 ? journeyData.totalUsers.toLocaleString() : '—'}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{journeyData.conversionRate > 0 ? `${journeyData.conversionRate.toFixed(1)}%` : '—%'}</span>
              <span className="stat-label">Conversion Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="journey-content">
        {/* Journey Stages */}
        <div className="journey-stages">
          <div className="stages-header">
            <h4 className="stages-title">8-Stage Hair Journey</h4>
            <div className="stages-legend">
              <div className="legend-item">
                <div className="legend-dot high"></div>
                <span>High conversion</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot medium"></div>
                <span>Medium conversion</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot low"></div>
                <span>Low conversion</span>
              </div>
            </div>
          </div>

          <div className="stages-flow">
            {journeyStages.map((stage, index) => (
              <div key={stage.id} className="stage-card" style={{ '--delay': `${index * 100}ms` }}>
                <div className="stage-connector">
                  {index < journeyStages.length - 1 && (
                    <div className="connector-line">
                      <div className="connector-arrow">
                        <Icon icon="solar:arrow-right-bold" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div 
                  className={`stage-content ${selectedStage === stage.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                >
                  <div className={`stage-icon ${stage.bgColor}`}>
                    <Icon icon={stage.icon} className="icon" style={{ color: stage.color }} />
                  </div>
                  
                  <div className="stage-info">
                    <div className="stage-header">
                      <h5 className="stage-name">{stage.name}</h5>
                      <div className={`conversion-rate ${
                        stage.conversionRate > 50 ? 'high' : 
                        stage.conversionRate > 25 ? 'medium' : 'low'
                      }`}>
                        {stage.conversionRate}%
                      </div>
                    </div>
                    
                    <p className="stage-description">{stage.description}</p>
                    
                    <div className="stage-metrics">
                      <div className="metric">
                        <Icon icon="solar:users-group-rounded-bold" className="metric-icon" />
                        <span className="metric-value">{stage.users.toLocaleString()}</span>
                        <span className="metric-label">users</span>
                      </div>
                      <div className="metric">
                        <Icon icon="solar:clock-circle-bold" className="metric-icon" />
                        <span className="metric-value">{stage.avgTimeSpent}</span>
                        <span className="metric-label">avg time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="funnel-chart-container">
          <div className="chart-header">
            <h4 className="chart-title">Conversion Funnel</h4>
            <div className="chart-subtitle">User progression through journey stages</div>
          </div>
          
          <div className="funnel-chart">
            {!loading && (
              <ReactApexChart
                options={funnelChartOptions}
                series={funnelSeries}
                type="bar"
                height={400}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserJourneyTracker;