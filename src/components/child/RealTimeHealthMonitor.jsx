"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const RealTimeHealthMonitor = () => {
  const [healthData, setHealthData] = useState({
    overview: {
      overall_health: 0,
      services_up: 0,
      services_down: 0,
      uptime_24h: 0
    },
    services: [],
    recent_errors: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/system-health');
        if (response.ok) {
          const data = await response.json();
          setHealthData(data);
          setLastUpdated(new Date());
        } else {
          throw new Error('API not available');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching health data:', error);
        // Show fallback state when API is not available
        setHealthData({
          overview: {
            overall_health: 0,
            services_up: 0,
            services_down: 6,
            uptime_24h: 0,
            total_services: 6
          },
          services: [
            { service_name: 'Database', status: 'unknown', response_time: 0, uptime: 0 },
            { service_name: 'AI Model Gateway', status: 'unknown', response_time: 0, uptime: 0 },
            { service_name: 'Cache Service', status: 'unknown', response_time: 0, uptime: 0 },
            { service_name: 'Chatbot API', status: 'unknown', response_time: 0, uptime: 0 },
            { service_name: 'File Storage', status: 'unknown', response_time: 0, uptime: 0 },
            { service_name: 'Node.js Process', status: 'unknown', response_time: 0, uptime: 0 }
          ],
          recent_errors: []
        });
        setLoading(false);
      }
    };

    fetchHealthData();
    const interval = setInterval(fetchHealthData, 5000); // Update every 5 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' };
      case 'warning': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
      case 'down': 
      case 'critical': return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
      case 'unknown':
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return 'solar:check-circle-bold-duotone';
      case 'warning': return 'solar:danger-triangle-bold-duotone';
      case 'down':
      case 'critical': return 'solar:close-circle-bold-duotone';
      case 'unknown':
      default: return 'solar:question-circle-bold-duotone';
    }
  };

  const overallHealth = healthData.overview?.overall_health || 0;
  const overallHealthColor = overallHealth === 0 ? 'text-gray-400' :
                            overallHealth >= 99 ? 'text-emerald-600' : 
                            overallHealth >= 95 ? 'text-yellow-600' : 'text-red-600';

  const getTimeSinceUpdate = () => {
    const secondsAgo = Math.floor((new Date() - lastUpdated) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  };

  return (
    <div className="health-monitor">
      <div className="monitor-header">
        <div className="header-content">
          <h3 className="section-title">
            <Icon icon="solar:shield-check-bold-duotone" className="title-icon" />
            System Health Monitor
          </h3>
          <div className="health-status">
            <div className="pulse-indicator">
              <div className="pulse-dot"></div>
            </div>
            <span className="status-text">Real-time Monitoring</span>
          </div>
        </div>
      </div>

      <div className="health-content">
        {/* Overall Health Score */}
        <div className="health-overview">
          <div className="health-score-card">
            <div className="score-container">
              <div className="score-circle">
                <svg viewBox="0 0 100 100" className="score-svg">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - overallHealth / 100)}`}
                    className={overallHealthColor}
                    style={{ 
                      transition: 'stroke-dashoffset 1s ease-in-out',
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%'
                    }}
                  />
                </svg>
                <div className="score-text">
                  <span className={`score-value ${overallHealthColor}`}>
                    {overallHealth === 0 ? '—' : `${overallHealth}%`}
                  </span>
                  <span className="score-label">{overallHealth === 0 ? 'Monitoring Offline' : 'System Health'}</span>
                </div>
              </div>
            </div>
            
            <div className="health-stats">
              <div className="stat-item">
                <Icon icon="solar:clock-circle-bold" className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{healthData.overview?.uptime_24h ? `${healthData.overview.uptime_24h.toFixed(1)}%` : '—%'}</span>
                  <span className="stat-label">Uptime (24h)</span>
                </div>
              </div>
              <div className="stat-item">
                <Icon icon="solar:server-bold" className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{healthData.overview?.services_up || 0}/{healthData.overview?.total_services || 0}</span>
                  <span className="stat-label">Services Up</span>
                </div>
              </div>
              <div className="stat-item">
                <Icon icon="solar:danger-triangle-bold" className="stat-icon text-red-500" />
                <div className="stat-content">
                  <span className="stat-value">{healthData.recent_errors?.length || 0}</span>
                  <span className="stat-label">Recent Errors</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="services-status">
          <div className="services-header">
            <h4 className="services-title">Service Status</h4>
            <div className="last-updated">
              <Icon icon="solar:refresh-bold" className="refresh-icon" />
              <span>Updated {getTimeSinceUpdate()}</span>
            </div>
          </div>

          <div className="services-grid">
            {healthData.services.map((service, index) => {
              const statusColors = getStatusColor(service.status);
              return (
                <div 
                  key={service.service_name} 
                  className="service-card"
                  style={{ '--delay': `${index * 50}ms` }}
                >
                  <div className="service-header">
                    <div className="service-info">
                      <div className="service-name">{service.service_name}</div>
                      <div className={`service-status ${statusColors.bg} ${statusColors.text}`}>
                        <div className={`status-dot ${statusColors.dot}`}></div>
                        {service.status}
                      </div>
                    </div>
                    <Icon 
                      icon={getStatusIcon(service.status)} 
                      className={`service-icon ${statusColors.text}`}
                    />
                  </div>

                  <div className="service-metrics">
                    <div className="metric-row">
                      <span className="metric-label">Response Time</span>
                      <span className="metric-value">{service.response_time || 0}ms</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Uptime</span>
                      <span className="metric-value">{service.uptime || 0}%</span>
                    </div>
                    {service.memory_usage !== undefined && (
                      <div className="metric-row">
                        <span className="metric-label">Memory</span>
                        <span className="metric-value">{service.memory_usage}%</span>
                      </div>
                    )}
                    {service.requests_per_min !== undefined && (
                      <div className="metric-row">
                        <span className="metric-label">Requests/min</span>
                        <span className="metric-value">{service.requests_per_min}</span>
                      </div>
                    )}
                  </div>

                  <div className="service-chart">
                    <div className="mini-chart">
                      {[...Array(24)].map((_, i) => (
                        <div 
                          key={i}
                          className="chart-bar"
                          style={{ 
                            height: `${service.status === 'healthy' ? Math.random() * 40 + 60 : 
                                     service.status === 'warning' ? Math.random() * 30 + 30 :
                                     service.status === 'down' ? 5 : Math.random() * 20 + 10}%`,
                            backgroundColor: service.status === 'healthy' ? '#10b981' : 
                                           service.status === 'warning' ? '#f59e0b' : 
                                           service.status === 'down' ? '#ef4444' : '#6b7280'
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Errors */}
        {healthData.recent_errors && healthData.recent_errors?.length > 0 && (
          <div className="alerts-section">
            <div className="alerts-header">
              <h4 className="alerts-title">
                <Icon icon="solar:bell-bold-duotone" className="alerts-icon" />
                Recent System Errors
              </h4>
              <div className="alerts-count">
                {healthData.recent_errors?.length || 0} error{(healthData.recent_errors?.length || 0) !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="alerts-list">
              {healthData.recent_errors?.map((error, index) => (
                <div key={index} className="alert-item" style={{ '--delay': `${index * 100}ms` }}>
                  <div className={`alert-icon ${getStatusColor(error.status).bg}`}>
                    <Icon 
                      icon={getStatusIcon(error.status)} 
                      className={getStatusColor(error.status).text}
                    />
                  </div>
                  <div className="alert-content">
                    <div className="alert-message">{error.error_details}</div>
                    <div className="alert-meta">
                      <span className="alert-service">{error.service_name}</span>
                      <span className="alert-time">
                        {new Date(error.created_at).toLocaleTimeString()}
                      </span>
                      {error.consecutive_failures > 1 && (
                        <span className="alert-failures">
                          {error.consecutive_failures} consecutive failures
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="alert-dismiss">
                    <Icon icon="solar:close-circle-bold" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeHealthMonitor;