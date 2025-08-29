"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const UserJourneyLayer = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedJourneyStage, setSelectedJourneyStage] = useState("all");

  // User journey metrics
  const journeyMetrics = {
    total_users: 45678,
    active_users: 28943,
    new_users_today: 234,
    returning_users: 16789,
    avg_journey_length: 14.2,
    conversion_rate: 23.4
  };

  // Journey stages data
  const journeyStages = [
    {
      stage: "Discovery",
      users: 12456,
      conversion_rate: 78.3,
      avg_duration_days: 2.1,
      top_concerns: ["Hair type identification", "Product research"],
      satisfaction: 4.2
    },
    {
      stage: "Exploration", 
      users: 9758,
      conversion_rate: 65.8,
      avg_duration_days: 5.7,
      top_concerns: ["Hair care routine", "Product compatibility"],
      satisfaction: 4.0
    },
    {
      stage: "Consideration",
      users: 6425,
      conversion_rate: 52.4,
      avg_duration_days: 8.3,
      top_concerns: ["Product effectiveness", "Price comparison"],
      satisfaction: 3.8
    },
    {
      stage: "Purchase Intent",
      users: 3367,
      conversion_rate: 41.2,
      avg_duration_days: 3.2,
      top_concerns: ["Final product selection", "Purchase confidence"],
      satisfaction: 4.1
    },
    {
      stage: "Post-Purchase",
      users: 1388,
      conversion_rate: 89.3,
      avg_duration_days: 12.5,
      top_concerns: ["Usage guidance", "Results tracking"],
      satisfaction: 4.5
    }
  ];

  // User personas
  const userPersonas = [
    {
      persona: "Hair Care Beginner",
      count: 18934,
      percentage: 41.5,
      avg_engagement: 3.2,
      primary_concerns: ["Basic hair care", "Product selection"],
      conversion_rate: 28.7
    },
    {
      persona: "Damage Recovery Seeker",
      count: 13670,
      percentage: 29.9,
      avg_engagement: 4.8,
      primary_concerns: ["Hair repair", "Damage prevention"],
      conversion_rate: 35.2
    },
    {
      persona: "Styling Enthusiast",
      count: 8912,
      percentage: 19.5,
      avg_engagement: 3.9,
      primary_concerns: ["Styling tips", "Product versatility"],
      conversion_rate: 22.1
    },
    {
      persona: "Natural Hair Expert",
      count: 4162,
      percentage: 9.1,
      avg_engagement: 5.6,
      primary_concerns: ["Natural ingredients", "Curl care"],
      conversion_rate: 42.8
    }
  ];

  // Journey funnel chart
  const journeyFunnelOptions = {
    chart: {
      type: 'bar',
      height: 400,
      toolbar: { show: false }
    },
    colors: ['#e7a690'],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%',
        borderRadius: 8
      }
    },
    xaxis: {
      categories: journeyStages.map(stage => stage.stage),
      labels: {
        style: {
          colors: '#222323',
          fontFamily: 'Archivo, sans-serif'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#222323',
          fontFamily: 'Archivo, sans-serif'
        }
      }
    },
    grid: {
      borderColor: '#f5f5f7'
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function (val) {
          return val.toLocaleString() + ' users';
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toLocaleString();
      },
      style: {
        colors: ['#fff'],
        fontFamily: 'Archivo, sans-serif'
      }
    }
  };

  const journeyFunnelSeries = [{
    name: 'Users',
    data: journeyStages.map(stage => stage.users)
  }];

  // Persona distribution chart
  const personaOptions = {
    chart: {
      type: 'donut',
      height: 350
    },
    colors: ['#e7a690', '#4a4d68', '#eeece1', '#fce5d7'],
    labels: userPersonas.map(persona => persona.persona),
    legend: {
      position: 'bottom',
      fontFamily: 'Archivo, sans-serif'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Users',
              fontSize: '16px',
              fontFamily: 'Archivo, sans-serif',
              color: '#222323'
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + '%';
      },
      style: {
        fontFamily: 'Archivo, sans-serif'
      }
    }
  };

  const personaSeries = userPersonas.map(persona => persona.count);

  // Engagement timeline chart
  const engagementTimelineOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false }
    },
    colors: ['#e7a690', '#4a4d68'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,  
        stops: [0, 90, 100]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      labels: {
        style: {
          colors: '#222323',
          fontFamily: 'Archivo, sans-serif'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#222323',
          fontFamily: 'Archivo, sans-serif'
        }
      }
    },
    grid: {
      borderColor: '#f5f5f7',
      strokeDashArray: 5
    },
    legend: {
      position: 'top',
      fontFamily: 'Archivo, sans-serif',
      fontWeight: 600
    },
    tooltip: {
      theme: 'light'
    }
  };

  const engagementTimelineSeries = [
    { name: 'New Users', data: [1234, 1456, 1123, 1567] },
    { name: 'Returning Users', data: [2345, 2134, 2567, 2890] }
  ];

  return (
    <div className="myavana-dashboard-page-container">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
        <div>
          <h6 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
            User Journey Analytics
          </h6>
          <p className="text-sm mb-0 mt-1" style={{ color: '#4a4d68' }}>
            Track user progression through their hair care journey
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <select
            className="form-select form-select-sm w-auto"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            style={{ 
              borderColor: '#eeece1',
              fontFamily: 'Archivo, sans-serif',
              color: '#222323'
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <select
            className="form-select form-select-sm w-auto"
            value={selectedJourneyStage}
            onChange={(e) => setSelectedJourneyStage(e.target.value)}
            style={{ 
              borderColor: '#eeece1',
              fontFamily: 'Archivo, sans-serif',
              color: '#222323'
            }}
          >
            <option value="all">All Stages</option>
            <option value="discovery">Discovery</option>
            <option value="exploration">Exploration</option>
            <option value="consideration">Consideration</option>
            <option value="purchase">Purchase Intent</option>
            <option value="post-purchase">Post-Purchase</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="row gy-4 mb-24">
        <div className="col-xxl-2 col-md-4 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div 
                  className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{ backgroundColor: '#e7a690' }}
                >
                  <Icon icon="solar:users-group-rounded-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {journeyMetrics.total_users.toLocaleString()}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Total Users
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-2 col-md-4 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div 
                  className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{ backgroundColor: '#4a4d68' }}
                >
                  <Icon icon="solar:pulse-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {journeyMetrics.active_users.toLocaleString()}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Active Users
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-2 col-md-4 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div 
                  className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{ backgroundColor: '#eeece1', color: '#222323' }}
                >
                  <Icon icon="solar:user-plus-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {journeyMetrics.new_users_today}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                New Users Today
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-2 col-md-4 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div 
                  className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{ backgroundColor: '#fce5d7', color: '#222323' }}
                >
                  <Icon icon="solar:refresh-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {journeyMetrics.returning_users.toLocaleString()}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Returning Users
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-2 col-md-4 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div 
                  className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{ backgroundColor: '#e7a690' }}
                >
                  <Icon icon="solar:clock-circle-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {journeyMetrics.avg_journey_length}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Avg Journey (days)
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-2 col-md-4 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div 
                  className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{ backgroundColor: '#4a4d68' }}
                >
                  <Icon icon="solar:target-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {journeyMetrics.conversion_rate}%
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Conversion Rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row gy-4 mb-24">
        <div className="col-xxl-8">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                User Journey Funnel
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={journeyFunnelOptions}
                series={journeyFunnelSeries}
                type="bar"
                height={400}
              />
            </div>
          </div>
        </div>

        <div className="col-xxl-4">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                User Personas
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={personaOptions}
                series={personaSeries}
                type="donut"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Journey Stages Analysis */}
      <div className="row gy-4 mb-24">
        <div className="col-xxl-8">
          <div className="card radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                Journey Stages Breakdown
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: '#f5f5f7' }}>
                    <tr>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Stage
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Users
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Conversion Rate
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Avg Duration
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Satisfaction
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Top Concerns
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {journeyStages.map((stage, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-circle"
                              style={{ 
                                backgroundColor: index === 0 ? '#e7a690' : 
                                               index === 1 ? '#4a4d68' : 
                                               index === 2 ? '#eeece1' : 
                                               index === 3 ? '#fce5d7' : '#e7a690'
                              }}
                            ></div>
                            <span style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                              {stage.stage}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                          {stage.users.toLocaleString()}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div 
                              className="progress" 
                              style={{ 
                                width: '60px', 
                                height: '6px', 
                                backgroundColor: '#f5f5f7' 
                              }}
                            >
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${stage.conversion_rate}%`, 
                                  backgroundColor: '#e7a690'
                                }}
                              ></div>
                            </div>
                            <span style={{ fontFamily: 'Archivo, sans-serif', color: '#4a4d68', fontSize: '12px' }}>
                              {stage.conversion_rate}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                          {stage.avg_duration_days} days
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Icon 
                                key={i}
                                icon="solar:star-bold" 
                                className={i < Math.floor(stage.satisfaction) ? 'text-warning' : 'text-300'}
                                style={{ fontSize: '12px' }}
                              />
                            ))}
                            <span className="text-sm ms-1" style={{ color: '#4a4d68' }}>
                              {stage.satisfaction}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            {stage.top_concerns.map((concern, idx) => (
                              <span 
                                key={idx}
                                className="badge"
                                style={{ 
                                  backgroundColor: '#fce5d7',
                                  color: '#222323',
                                  fontFamily: 'Archivo, sans-serif',
                                  fontSize: '10px'
                                }}
                              >
                                {concern}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xxl-4">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                User Engagement Timeline
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={engagementTimelineOptions}
                series={engagementTimelineSeries}
                type="area"
                height={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Persona Details */}
      <div className="card radius-8 border" style={{ borderColor: '#eeece1' }}>
        <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
          <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
            User Persona Analysis
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: '#f5f5f7' }}>
                <tr>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Persona
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    User Count
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Percentage
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Avg Engagement
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Primary Concerns
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Conversion Rate
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {userPersonas.map((persona, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-circle"
                          style={{ 
                            backgroundColor: index === 0 ? '#e7a690' : 
                                           index === 1 ? '#4a4d68' : 
                                           index === 2 ? '#eeece1' : '#fce5d7'
                          }}
                        ></div>
                        <span style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                          {persona.persona}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      {persona.count.toLocaleString()}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="progress" 
                          style={{ 
                            width: '60px', 
                            height: '6px', 
                            backgroundColor: '#f5f5f7' 
                          }}
                        >
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${persona.percentage}%`, 
                              backgroundColor: '#4a4d68'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontFamily: 'Archivo, sans-serif', color: '#4a4d68', fontSize: '12px' }}>
                          {persona.percentage}%
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      {persona.avg_engagement}
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        {persona.primary_concerns.map((concern, idx) => (
                          <span 
                            key={idx}
                            className="badge"
                            style={{ 
                              backgroundColor: '#eeece1',
                              color: '#222323',
                              fontFamily: 'Archivo, sans-serif',
                              fontSize: '10px'
                            }}
                          >
                            {concern}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`badge ${persona.conversion_rate > 35 ? 'bg-success' : persona.conversion_rate > 25 ? 'bg-warning' : 'bg-danger'}`}
                        style={{ fontFamily: 'Archivo, sans-serif' }}
                      >
                        {persona.conversion_rate}%
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button 
                          className="btn btn-sm"
                          style={{ 
                            backgroundColor: '#fce5d7', 
                            color: '#222323',
                            border: 'none',
                            fontFamily: 'Archivo, sans-serif'
                          }}
                        >
                          <Icon icon="solar:eye-outline" />
                        </button>
                        <button 
                          className="btn btn-sm"
                          style={{ 
                            backgroundColor: '#e7a690', 
                            color: 'white',
                            border: 'none',
                            fontFamily: 'Archivo, sans-serif'
                          }}
                        >
                          <Icon icon="solar:target-outline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserJourneyLayer;