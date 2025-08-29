"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CostAnalyticsLayer = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [budgetData, setBudgetData] = useState(null);
  const [costTrends, setCostTrends] = useState([]);

  // Sample cost data
  const costMetrics = {
    current_spend: 2456.78,
    monthly_budget: 3000.00,
    projected_spend: 2890.45,
    cost_per_request: 0.082,
    cost_per_token: 0.0000156,
    savings_vs_last_month: 234.56
  };

  const modelCostBreakdown = [
    { model: "GPT-4o", cost: 1234.56, percentage: 50.2, requests: 15420, cost_per_request: 0.080 },
    { model: "Claude-3.5-Sonnet", cost: 745.23, percentage: 30.3, requests: 8970, cost_per_request: 0.083 },
    { model: "Gemini-Pro", cost: 356.89, percentage: 14.5, requests: 5432, cost_per_request: 0.066 },
    { model: "Others", cost: 120.10, percentage: 4.9, requests: 1500, cost_per_request: 0.080 }
  ];

  // Cost trend chart options
  const costTrendOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      background: '#ffffff'
    },
    colors: ['#e7a690', '#4a4d68'],
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
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
        },
        formatter: function (val) {
          return '$' + val.toFixed(0);
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
      theme: 'light',
      y: {
        formatter: function (val) {
          return '$' + val.toFixed(2);
        }
      }
    }
  };

  const costTrendSeries = [
    {
      name: 'Actual Cost',
      data: [450, 620, 580, 806]
    },
    {
      name: 'Budgeted Cost',
      data: [500, 600, 650, 750]
    }
  ];

  // Budget utilization chart
  const budgetOptions = {
    chart: {
      type: 'radialBar',
      height: 300
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '60%'
        },
        track: {
          background: '#f5f5f7',
          strokeWidth: '100%'
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px',
            fontFamily: 'Archivo, sans-serif',
            color: '#222323',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '30px',
            fontFamily: 'Archivo, sans-serif',
            fontWeight: 600,
            color: '#222323',
            offsetY: -50,
            formatter: function (val) {
              return val + '%';
            }
          }
        }
      }
    },
    colors: ['#e7a690'],
    labels: ['Budget Used']
  };

  const budgetSeries = [Math.round((costMetrics.current_spend / costMetrics.monthly_budget) * 100)];

  // Token usage chart
  const tokenUsageOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false }
    },
    colors: ['#e7a690', '#4a4d68', '#eeece1'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    xaxis: {
      categories: ['Input Tokens', 'Output Tokens', 'Total Tokens'],
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
        },
        formatter: function (val) {
          return (val / 1000).toFixed(0) + 'K';
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
          return val.toLocaleString() + ' tokens';
        }
      }
    }
  };

  const tokenUsageSeries = [{
    name: 'Tokens',
    data: [1250000, 890000, 2140000]
  }];

  return (
    <div className="myavana-dashboard-page-container">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
        <h6 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
          Cost Analytics & Budget Management
        </h6>
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
          <button 
            className="btn btn-sm"
            style={{ 
              backgroundColor: '#e7a690', 
              color: 'white',
              border: 'none',
              fontFamily: 'Archivo, sans-serif'
            }}
          >
            <Icon icon="solar:download-outline" className="me-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="row gy-4 mb-24">
        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="w-44 h-44 rounded-circle d-flex justify-content-center align-items-center text-white"
                    style={{ backgroundColor: '#e7a690' }}
                  >
                    <Icon icon="solar:dollar-minimalistic-outline" className="text-xl" />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                    Current Spend
                  </h6>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                  ${costMetrics.current_spend.toLocaleString()}
                </h2>
                <span className="text-sm fw-medium text-success-600 d-flex align-items-center gap-1">
                  <Icon icon="iconamoon:arrow-down-2-fill" className="text-xs" />
                  8.7%
                </span>
              </div>
              <p className="text-sm mb-0 mt-4" style={{ color: '#4a4d68' }}>
                vs last month
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="w-44 h-44 rounded-circle d-flex justify-content-center align-items-center text-white"
                    style={{ backgroundColor: '#4a4d68' }}
                  >
                    <Icon icon="solar:chart-2-outline" className="text-xl" />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                    Projected Spend
                  </h6>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                  ${costMetrics.projected_spend.toLocaleString()}
                </h2>
                <span className="text-sm fw-medium text-warning-600 d-flex align-items-center gap-1">
                  <Icon icon="iconamoon:arrow-up-2-fill" className="text-xs" />
                  3.2%
                </span>
              </div>
              <p className="text-sm mb-0 mt-4" style={{ color: '#4a4d68' }}>
                for this month
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="w-44 h-44 rounded-circle d-flex justify-content-center align-items-center text-white"
                    style={{ backgroundColor: '#eeece1', color: '#222323' }}
                  >
                    <Icon icon="solar:calculator-outline" className="text-xl" />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                    Cost per Request
                  </h6>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                  ${costMetrics.cost_per_request.toFixed(3)}
                </h2>
                <span className="text-sm fw-medium text-success-600 d-flex align-items-center gap-1">
                  <Icon icon="iconamoon:arrow-down-2-fill" className="text-xs" />
                  12.1%
                </span>
              </div>
              <p className="text-sm mb-0 mt-4" style={{ color: '#4a4d68' }}>
                average cost
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="w-44 h-44 rounded-circle d-flex justify-content-center align-items-center text-white"
                    style={{ backgroundColor: '#fce5d7', color: '#222323' }}
                  >
                    <Icon icon="solar:shield-check-outline" className="text-xl" />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                    Savings
                  </h6>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                  ${costMetrics.savings_vs_last_month.toFixed(2)}
                </h2>
                <span className="text-sm fw-medium text-success-600 d-flex align-items-center gap-1">
                  <Icon icon="iconamoon:arrow-up-2-fill" className="text-xs" />
                  vs last month
                </span>
              </div>
              <p className="text-sm mb-0 mt-4" style={{ color: '#4a4d68' }}>
                optimization savings
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
                Cost Trends & Budget Tracking
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={costTrendOptions}
                series={costTrendSeries}
                type="area"
                height={350}
              />
            </div>
          </div>
        </div>

        <div className="col-xxl-4">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                Budget Utilization
              </h6>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <ReactApexChart
                options={budgetOptions}
                series={budgetSeries}
                type="radialBar"
                height={300}
              />
              <div className="text-center mt-3">
                <p className="mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#4a4d68' }}>
                  ${costMetrics.current_spend.toLocaleString()} of ${costMetrics.monthly_budget.toLocaleString()}
                </p>
                <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                  ${(costMetrics.monthly_budget - costMetrics.current_spend).toLocaleString()} remaining
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Cost Breakdown & Token Usage */}
      <div className="row gy-4 mb-24">
        <div className="col-xxl-8">
          <div className="card radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                Model Cost Breakdown
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: '#f5f5f7' }}>
                    <tr>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Model
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Total Cost
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Percentage
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Requests
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Cost/Request
                      </th>
                      <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelCostBreakdown.map((model, index) => (
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
                              {model.model}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                          ${model.cost.toFixed(2)}
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
                                  width: `${model.percentage}%`, 
                                  backgroundColor: '#e7a690' 
                                }}
                              ></div>
                            </div>
                            <span style={{ fontFamily: 'Archivo, sans-serif', color: '#4a4d68' }}>
                              {model.percentage}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                          {model.requests.toLocaleString()}
                        </td>
                        <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                          ${model.cost_per_request.toFixed(3)}
                        </td>
                        <td>
                          <span className={`text-sm fw-medium ${index % 2 === 0 ? 'text-success-600' : 'text-danger-600'} d-flex align-items-center gap-1`}>
                            <Icon icon={index % 2 === 0 ? "iconamoon:arrow-down-2-fill" : "iconamoon:arrow-up-2-fill"} className="text-xs" />
                            {index % 2 === 0 ? '5.2%' : '2.1%'}
                          </span>
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
                Token Usage
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={tokenUsageOptions}
                series={tokenUsageSeries}
                type="bar"
                height={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="card radius-8 border" style={{ borderColor: '#eeece1' }}>
        <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
          <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
            Budget Alerts & Recommendations
          </h6>
        </div>
        <div className="card-body">
          <div className="row gy-3">
            <div className="col-md-6">
              <div className="alert alert-warning border-0" style={{ backgroundColor: '#fce5d7' }}>
                <div className="d-flex align-items-center gap-3">
                  <Icon icon="solar:danger-triangle-outline" className="text-warning text-xl" />
                  <div>
                    <h6 className="mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      Budget Alert
                    </h6>
                    <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                      Projected to exceed monthly budget by $156.78
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="alert alert-success border-0" style={{ backgroundColor: '#e7f5e7' }}>
                <div className="d-flex align-items-center gap-3">
                  <Icon icon="solar:shield-check-outline" className="text-success text-xl" />
                  <div>
                    <h6 className="mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      Optimization Opportunity
                    </h6>
                    <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                      Switch to Claude for 15% cost savings on similar tasks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostAnalyticsLayer;