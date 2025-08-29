"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import dynamic from "next/dynamic";

// Dynamically import ApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AIModelsLayer = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [modelData, setModelData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelData();
    fetchPerformanceData();
  }, [selectedTimeframe]);

  const fetchModelData = async () => {
    try {
      const response = await fetch(`/api/ai-model-usage?timeframe=${selectedTimeframe}`);
      const data = await response.json();
      setModelData(data);
    } catch (error) {
      console.error("Error fetching model data:", error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch(`/api/ai-model-performance?timeframe=${selectedTimeframe}`);
      const data = await response.json();
      setPerformanceData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setLoading(false);
    }
  };

  // Sample data for demonstration
  const sampleModelData = [
    {
      model_name: "GPT-4o",
      provider: "OpenAI",
      total_requests: 15420,
      success_rate: 98.5,
      avg_response_time: 1200,
      total_cost: 234.56,
      total_tokens: 1250000
    },
    {
      model_name: "Claude-3.5-Sonnet",
      provider: "Anthropic",
      total_requests: 8970,
      success_rate: 99.2,
      avg_response_time: 980,
      total_cost: 145.23,
      total_tokens: 890000
    },
    {
      model_name: "Gemini-Pro",
      provider: "Google",
      total_requests: 5432,
      success_rate: 97.8,
      avg_response_time: 1150,
      total_cost: 89.45,
      total_tokens: 650000
    }
  ];

  // Performance chart data
  const performanceChartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false },
      background: '#ffffff'
    },
    colors: ['#e7a690', '#4a4d68', '#eeece1'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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

  const performanceChartSeries = [
    {
      name: 'Response Time (ms)',
      data: [1200, 1150, 1300, 1100, 1250, 1180, 1220]
    },
    {
      name: 'Success Rate (%)',
      data: [98.5, 99.1, 97.8, 99.3, 98.9, 99.0, 98.7]
    },
    {
      name: 'Requests/Hour',
      data: [450, 520, 480, 600, 580, 490, 510]
    }
  ];

  // Cost breakdown chart
  const costChartOptions = {
    chart: {
      type: 'donut',
      height: 300
    },
    colors: ['#e7a690', '#4a4d68', '#eeece1', '#fce5d7'],
    labels: ['GPT-4o', 'Claude-3.5-Sonnet', 'Gemini-Pro', 'Others'],
    legend: {
      position: 'bottom',
      fontFamily: 'Archivo, sans-serif'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Cost',
              fontSize: '16px',
              fontFamily: 'Archivo, sans-serif',
              fontWeight: 600,
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

  const costChartSeries = [234.56, 145.23, 89.45, 45.12];

  return (
    <div className="myavana-dashboard-page-container">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
        <h6 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
          AI Model Performance
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
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
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
                    <Icon icon="solar:cpu-bolt-outline" className="text-xl" />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                    Total Requests
                  </h6>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                  29,822
                </h2>
                <span className="text-sm fw-medium text-success-600 d-flex align-items-center gap-1">
                  <Icon icon="iconamoon:arrow-up-2-fill" className="text-xs" />
                  12.5%
                </span>
              </div>
              <p className="text-sm mb-0 mt-4" style={{ color: '#4a4d68' }}>vs last period</p>
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
                    <Icon icon="solar:target-outline" className="text-xl" />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                    Avg Success Rate
                  </h6>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                  98.5%
                </h2>
                <span className="text-sm fw-medium text-success-600 d-flex align-items-center gap-1">
                  <Icon icon="iconamoon:arrow-up-2-fill" className="text-xs" />
                  0.3%
                </span>
              </div>
              <p className="text-sm mb-0 mt-4" style={{ color: '#4a4d68' }}>vs last period</p>
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
                    <Icon icon="solar:clock-circle-outline" className="text-xl" />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                    Avg Response Time
                  </h6>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                  1.15s
                </h2>
                <span className="text-sm fw-medium text-danger-600 d-flex align-items-center gap-1">
                  <Icon icon="iconamoon:arrow-down-2-fill" className="text-xs" />
                  8.2%
                </span>
              </div>
              <p className="text-sm mb-0 mt-4" style={{ color: '#4a4d68' }}>vs last period</p>
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
                    <Icon icon="solar:dollar-minimalistic-outline" className="text-xl" />
                  </div>
                  <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                    Total Cost
                  </h6>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                  $514.36
                </h2>
                <span className="text-sm fw-medium text-danger-600 d-flex align-items-center gap-1">
                  <Icon icon="iconamoon:arrow-up-2-fill" className="text-xs" />
                  15.4%
                </span>
              </div>
              <p className="text-sm mb-0 mt-4" style={{ color: '#4a4d68' }}>vs last period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="row gy-4 mb-24">
        <div className="col-xxl-8">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                Performance Trends
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={performanceChartOptions}
                series={performanceChartSeries}
                type="line"
                height={350}
              />
            </div>
          </div>
        </div>

        <div className="col-xxl-4">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                Cost Distribution
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={costChartOptions}
                series={costChartSeries}
                type="donut"
                height={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="card radius-8 border" style={{ borderColor: '#eeece1' }}>
        <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
          <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
            Model Performance Comparison
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
                    Provider
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Requests
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Success Rate
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Avg Response Time
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Total Tokens
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Cost
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleModelData.map((model, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-circle"
                          style={{ backgroundColor: index === 0 ? '#e7a690' : index === 1 ? '#4a4d68' : '#eeece1' }}
                        ></div>
                        <span style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                          {model.model_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Archivo, sans-serif', color: '#4a4d68' }}>
                      {model.provider}
                    </td>
                    <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      {model.total_requests.toLocaleString()}
                    </td>
                    <td>
                      <span 
                        className={`badge ${model.success_rate > 99 ? 'bg-success' : model.success_rate > 98 ? 'bg-warning' : 'bg-danger'}`}
                        style={{ fontFamily: 'Archivo, sans-serif' }}
                      >
                        {model.success_rate}%
                      </span>
                    </td>
                    <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      {model.avg_response_time}ms
                    </td>
                    <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      {(model.total_tokens / 1000).toFixed(0)}K
                    </td>
                    <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                      ${model.total_cost}
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
                          <Icon icon="solar:settings-outline" />
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

export default AIModelsLayer;