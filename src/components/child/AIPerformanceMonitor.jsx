"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AIPerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState({
    current_performance: [],
    historical_trends: [],
    overview: {
      total_requests: 0,
      total_models: 0,
      avg_success_rate: 0,
      avg_response_time: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('all');

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch('/api/ai-model-performance');
        if (response.ok) {
          const data = await response.json();
          setPerformanceData(data);
        } else {
          throw new Error('API not available');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching AI performance data:', error);
        // Use empty data when API is not available
        setPerformanceData({
          current_performance: [],
          historical_trends: [],
          overview: {
            total_requests: 0,
            total_models: 0,
            avg_success_rate: 0,
            avg_response_time: 0
          }
        });
        setLoading(false);
      }
    };

    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 15000);
    return () => clearInterval(interval);
  }, []);

  const responseTimeChartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      }
    },
    colors: ['#e7a690', '#4a4d68', '#22c55e', '#f59e0b'],
    stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round'
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Archivo, sans-serif'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Archivo, sans-serif'
        },
        formatter: (val) => `${val}ms`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Archivo, sans-serif',
      fontSize: '12px',
      markers: { width: 8, height: 8, strokeWidth: 0, radius: 4 }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => `${val}ms` }
    }
  };

  // Generate chart data from API response
  const generateResponseTimeSeries = () => {
    if (!performanceData.historical_trends || performanceData.historical_trends.length === 0) {
      return [
        { name: 'No Data Available', data: [0, 0, 0, 0, 0, 0] }
      ];
    }

    // Group historical data by model
    const modelGroups = {};
    performanceData.historical_trends.forEach(trend => {
      if (!modelGroups[trend.model_name]) {
        modelGroups[trend.model_name] = [];
      }
      modelGroups[trend.model_name].push({
        date: trend.date,
        response_time: Math.round(trend.avg_response_time_ms)
      });
    });

    // Convert to chart series format
    return Object.entries(modelGroups).map(([modelName, data]) => ({
      name: modelName.replace(' Experimental', '').replace('2.0 Flash', '2.0').replace('1.5 Flash', '1.5'),
      data: data.slice(-6).map(d => d.response_time) // Last 6 data points
    }));
  };

  const responseTimeSeries = generateResponseTimeSeries();

  const accuracyChartOptions = {
    chart: {
      type: 'radialBar',
      height: 300,
      background: 'transparent'
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: '60%' },
        dataLabels: {
          name: {
            fontSize: '16px',
            fontFamily: 'Archivo, sans-serif',
            fontWeight: 600,
            color: '#1e293b'
          },
          value: {
            fontSize: '24px',
            fontFamily: 'Archivo, sans-serif',
            fontWeight: 700,
            color: '#e7a690',
            formatter: (val) => `${val}%`
          }
        }
      }
    },
    colors: ['#e7a690'],
    labels: ['Overall Accuracy'],
    responsive: [{
      breakpoint: 768,
      options: {
        chart: { height: 250 }
      }
    }]
  };

  // Generate model stats from API data
  const modelStats = performanceData.current_performance?.map(model => ({
    name: model.model_name.replace(' Experimental', '').replace('2.0 Flash', '2.0').replace('1.5 Flash', '1.5'),
    fullName: model.model_name,
    accuracy: model.success_rate,
    responseTime: model.avg_response_time_ms,
    requests: model.request_count,
    conversations: model.conversations_processed || 0,
    users_served: model.total_users_served || 0,
    status: model.request_count > 0 ? 'active' : 'idle'
  })) || [];

  return (
    <div className="ai-performance-monitor">
      <div className="monitor-header">
        <div className="header-content">
          <h3 className="section-title">
            <Icon icon="solar:cpu-bolt-bold-duotone" className="title-icon" />
            AI Model Performance
          </h3>
          <div className="status-indicator">
            <div className={`status-dot ${performanceData.overview?.total_requests > 0 ? 'active' : 'idle'}`}></div>
            <span>
              {performanceData.overview?.total_requests > 0 ? 
                `${performanceData.overview.total_models} Models Active` : 
                'Awaiting Data'}
            </span>
          </div>
        </div>
        
        <div className="model-selector">
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
          >
            <option value="all">All Models</option>
            {modelStats.map(model => (
              <option key={model.fullName} value={model.fullName}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="performance-grid">
        {/* Response Time Chart */}
        <div className="performance-card chart-card">
          <div className="card-header">
            <h4 className="card-title">Response Time Trends</h4>
            <div className="chart-legend">
              <span className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#e7a690' }}></div>
                Real-time
              </span>
            </div>
          </div>
          <div className="chart-container">
            {!loading && (
              <ReactApexChart
                options={responseTimeChartOptions}
                series={responseTimeSeries}
                type="line"
                height={350}
              />
            )}
          </div>
        </div>

        {/* Accuracy Gauge */}
        <div className="performance-card gauge-card">
          <div className="card-header">
            <h4 className="card-title">Model Accuracy</h4>
          </div>
          <div className="gauge-container">
            {!loading && (
              <ReactApexChart
                options={accuracyChartOptions}
                series={[performanceData.overview?.avg_success_rate || 0]}
                type="radialBar"
                height={300}
              />
            )}
            <div className="gauge-stats">
              <div className="stat-item">
                <span className="stat-label">Avg Success Rate</span>
                <span className="stat-value">
                  {performanceData.overview?.avg_success_rate ? 
                    `${performanceData.overview.avg_success_rate.toFixed(1)}%` : '—%'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Model</span>
                <span className="stat-value">
                  {performanceData.current_performance?.length > 0 ? 
                    `${Math.max(...performanceData.current_performance.map(m => m.success_rate)).toFixed(1)}%` : '—%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Model Statistics */}
        <div className="performance-card stats-card">
          <div className="card-header">
            <h4 className="card-title">Model Statistics</h4>
            <div className="refresh-btn">
              <Icon icon="solar:refresh-bold" />
            </div>
          </div>
          <div className="stats-list">
            {modelStats.map((model, index) => (
              <div key={model.name} className="stat-row" style={{ '--delay': `${index * 100}ms` }}>
                <div className="model-info">
                  <div className="model-name">{model.name}</div>
                  <div className={`model-status ${model.status}`}>
                    <div className="status-dot"></div>
                    {model.status}
                  </div>
                </div>
                <div className="model-metrics">
                  <div className="metric">
                    <span className="metric-label">Accuracy</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill accuracy" 
                        style={{ width: `${model.accuracy}%` }}
                      ></div>
                      <span className="metric-value">{model.accuracy}%</span>
                    </div>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Response</span>
                    <span className="metric-value">{model.responseTime}ms</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Requests</span>
                    <span className="metric-value">{model.requests ? model.requests.toLocaleString() : '0'}</span>
                  </div>
                  {model.conversations > 0 && (
                    <div className="metric">
                      <span className="metric-label">Conversations</span>
                      <span className="metric-value">{model.conversations.toLocaleString()}</span>
                    </div>
                  )}
                  {model.users_served > 0 && (
                    <div className="metric">
                      <span className="metric-label">Users Served</span>
                      <span className="metric-value">{model.users_served.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPerformanceMonitor;