"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ExperimentsLayer = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Experiments data
  const experimentsData = [
    {
      id: 1,
      experiment_name: "Hair Product Recommendation Style",
      experiment_type: "Message Format",
      variant_a: "Detailed product descriptions",
      variant_b: "Concise bullet points",
      success_metric: "Click-through rate",
      status: "active",
      created_at: "2025-01-20",
      participants: 2456,
      conversion_a: 23.4,
      conversion_b: 31.7,
      confidence: 95.2,
      statistical_significance: true
    },
    {
      id: 2,
      experiment_name: "Hair Analysis Questions Order",
      experiment_type: "User Flow",
      variant_a: "Hair type first, then concerns",
      variant_b: "Concerns first, then hair type",
      success_metric: "Completion rate",
      status: "active",
      created_at: "2025-01-18",
      participants: 1890,
      conversion_a: 78.3,
      conversion_b: 82.1,
      confidence: 89.7,
      statistical_significance: false
    },
    {
      id: 3,
      experiment_name: "Greeting Message Personalization",
      experiment_type: "Content",
      variant_a: "Generic welcome message",
      variant_b: "Personalized based on time of day",
      success_metric: "Engagement rate",
      status: "completed",
      created_at: "2025-01-10",
      participants: 3421,
      conversion_a: 45.6,
      conversion_b: 52.3,
      confidence: 98.1,
      statistical_significance: true
    },
    {
      id: 4,
      experiment_name: "Hair Care Routine Frequency",
      experiment_type: "Recommendation",
      variant_a: "Daily routine suggestions",
      variant_b: "Weekly routine suggestions",
      success_metric: "Follow-through rate",
      status: "paused",
      created_at: "2025-01-15",
      participants: 1234,
      conversion_a: 34.2,
      conversion_b: 28.9,
      confidence: 76.4,
      statistical_significance: false
    }
  ];

  const experimentMetrics = {
    total_experiments: 8,
    active_experiments: 2,
    completed_experiments: 5,
    paused_experiments: 1,
    avg_confidence: 87.6,
    significant_results: 4
  };

  // Performance comparison chart
  const performanceOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    colors: ['#e7a690', '#4a4d68'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    xaxis: {
      categories: experimentsData.map(exp => exp.experiment_name.substring(0, 20) + '...'),
      labels: {
        style: {
          colors: '#222323',
          fontFamily: 'Archivo, sans-serif',
          fontSize: '10px'
        },
        rotate: -45
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#222323',
          fontFamily: 'Archivo, sans-serif'
        },
        formatter: function (val) {
          return val + '%';
        }
      }
    },
    grid: {
      borderColor: '#f5f5f7'
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
          return val + '%';
        }
      }
    }
  };

  const performanceSeries = [
    {
      name: 'Variant A',
      data: experimentsData.map(exp => exp.conversion_a)
    },
    {
      name: 'Variant B', 
      data: experimentsData.map(exp => exp.conversion_b)
    }
  ];

  // Success rate chart
  const successRateOptions = {
    chart: {
      type: 'donut',
      height: 300
    },
    colors: ['#28a745', '#dc3545', '#ffc107'],
    labels: ['Significant Results', 'Inconclusive', 'In Progress'],
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
              label: 'Total Tests',
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

  const successRateSeries = [4, 2, 2];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'completed': return '#007bff';
      case 'paused': return '#ffc107';
      case 'draft': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'solar:play-circle-bold';
      case 'completed': return 'solar:check-circle-bold';
      case 'paused': return 'solar:pause-circle-bold';
      case 'draft': return 'solar:document-outline';
      default: return 'solar:question-circle-bold';
    }
  };

  return (
    <div className="myavana-dashboard-page-container">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
        <div>
          <h6 className="fw-semibold mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
            A/B Testing & Experiments
          </h6>
          <p className="text-sm mb-0 mt-1" style={{ color: '#4a4d68' }}>
            Optimize chatbot performance through controlled experiments
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <select
            className="form-select form-select-sm w-auto"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ 
              borderColor: '#eeece1',
              fontFamily: 'Archivo, sans-serif',
              color: '#222323'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
          <button 
            className="btn btn-sm"
            style={{ 
              backgroundColor: '#e7a690', 
              color: 'white',
              border: 'none',
              fontFamily: 'Archivo, sans-serif'
            }}
            onClick={() => setShowCreateModal(true)}
          >
            <Icon icon="solar:add-circle-outline" className="me-2" />
            New Experiment
          </button>
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
                  <Icon icon="solar:test-tube-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {experimentMetrics.total_experiments}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Total Experiments
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
                  style={{ backgroundColor: '#28a745' }}
                >
                  <Icon icon="solar:play-circle-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {experimentMetrics.active_experiments}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Active Tests
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
                  style={{ backgroundColor: '#007bff' }}
                >
                  <Icon icon="solar:check-circle-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {experimentMetrics.completed_experiments}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Completed
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
                  <Icon icon="solar:chart-2-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {experimentMetrics.avg_confidence}%
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Avg Confidence
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
                  style={{ backgroundColor: '#28a745' }}
                >
                  <Icon icon="solar:target-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {experimentMetrics.significant_results}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Significant Results
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
                  style={{ backgroundColor: '#ffc107' }}
                >
                  <Icon icon="solar:pause-circle-outline" className="text-lg" />
                </div>
              </div>
              <h3 className="fw-semibold mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                {experimentMetrics.paused_experiments}
              </h3>
              <p className="text-sm mb-0" style={{ color: '#4a4d68' }}>
                Paused
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
                Experiment Performance Comparison
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={performanceOptions}
                series={performanceSeries}
                type="bar"
                height={350}
              />
            </div>
          </div>
        </div>

        <div className="col-xxl-4">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                Results Distribution
              </h6>
            </div>
            <div className="card-body">
              <ReactApexChart
                options={successRateOptions}
                series={successRateSeries}
                type="donut"
                height={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Experiments Table */}
      <div className="card radius-8 border" style={{ borderColor: '#eeece1' }}>
        <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
          <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
            Experiment Results
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: '#f5f5f7' }}>
                <tr>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Experiment
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Type
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Status
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Participants
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Variant A
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Variant B
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Confidence
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Winner
                  </th>
                  <th style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {experimentsData
                  .filter(exp => selectedStatus === 'all' || exp.status === selectedStatus)
                  .map((experiment, index) => (
                  <tr key={experiment.id}>
                    <td>
                      <div>
                        <span style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                          {experiment.experiment_name}
                        </span>
                        <p className="text-sm mb-0 mt-1" style={{ color: '#4a4d68' }}>
                          {experiment.success_metric}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: '#eeece1',
                          color: '#222323',
                          fontFamily: 'Archivo, sans-serif'
                        }}
                      >
                        {experiment.experiment_type}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Icon 
                          icon={getStatusIcon(experiment.status)} 
                          style={{ color: getStatusColor(experiment.status) }}
                        />
                        <span 
                          className="badge"
                          style={{ 
                            backgroundColor: getStatusColor(experiment.status) + '20',
                            color: getStatusColor(experiment.status),
                            fontFamily: 'Archivo, sans-serif'
                          }}
                        >
                          {experiment.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      {experiment.participants.toLocaleString()}
                    </td>
                    <td>
                      <div className="text-center">
                        <span style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                          {experiment.conversion_a}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="text-center">
                        <span style={{ fontFamily: 'Archivo, sans-serif', color: '#222323', fontWeight: 600 }}>
                          {experiment.conversion_b}%
                        </span>
                      </div>
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
                              width: `${experiment.confidence}%`, 
                              backgroundColor: experiment.confidence > 95 ? '#28a745' : experiment.confidence > 80 ? '#ffc107' : '#dc3545'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontFamily: 'Archivo, sans-serif', color: '#4a4d68', fontSize: '12px' }}>
                          {experiment.confidence}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {experiment.statistical_significance ? (
                        <span 
                          className={`badge ${experiment.conversion_b > experiment.conversion_a ? 'bg-success' : 'bg-primary'}`}
                          style={{ fontFamily: 'Archivo, sans-serif' }}
                        >
                          {experiment.conversion_b > experiment.conversion_a ? 'Variant B' : 'Variant A'}
                        </span>
                      ) : (
                        <span 
                          className="badge bg-secondary"
                          style={{ fontFamily: 'Archivo, sans-serif' }}
                        >
                          Inconclusive
                        </span>
                      )}
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
                        {experiment.status === 'active' && (
                          <button 
                            className="btn btn-sm"
                            style={{ 
                              backgroundColor: '#ffc107', 
                              color: 'white',
                              border: 'none',
                              fontFamily: 'Archivo, sans-serif'
                            }}
                          >
                            <Icon icon="solar:pause-outline" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Best Practices & Recommendations */}
      <div className="row gy-4 mt-24">
        <div className="col-xxl-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                Experiment Insights
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start gap-3 p-3 rounded" style={{ backgroundColor: '#e7f5e7' }}>
                  <div 
                    className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                    style={{ backgroundColor: '#28a745' }}
                  >
                    <Icon icon="solar:lightbulb-outline" className="text-white" />
                  </div>
                  <div>
                    <h6 className="mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      High-Impact Finding
                    </h6>
                    <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                      Personalized greetings increase user engagement by 15%, showing users value tailored experiences.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 p-3 rounded" style={{ backgroundColor: '#fce5d7' }}>
                  <div 
                    className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                    style={{ backgroundColor: '#e7a690' }}
                  >
                    <Icon icon="solar:chart-2-outline" className="text-white" />
                  </div>
                  <div>
                    <h6 className="mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      Content Format Preference
                    </h6>
                    <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                      Users prefer concise bullet points over detailed descriptions, leading to 35% higher click-through rates.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 p-3 rounded" style={{ backgroundColor: '#fff3cd' }}>
                  <div 
                    className="w-40 h-40 rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                    style={{ backgroundColor: '#ffc107' }}
                  >
                    <Icon icon="solar:target-outline" className="text-white" />
                  </div>
                  <div>
                    <h6 className="mb-1" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                      Optimization Opportunity
                    </h6>
                    <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                      Question ordering affects completion rates. Starting with concerns increases completion by 4.8%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xxl-6">
          <div className="card h-100 radius-8 border" style={{ borderColor: '#eeece1' }}>
            <div className="card-header border-bottom" style={{ borderColor: '#f5f5f7' }}>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                Recommended Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ backgroundColor: '#f5f5f7' }}>
                  <div className="d-flex align-items-center gap-3">
                    <Icon icon="solar:rocket-outline" style={{ color: '#e7a690' }} />
                    <div>
                      <h6 className="mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                        Deploy Winning Variants
                      </h6>
                      <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                        Implement statistically significant improvements
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-sm"
                    style={{ 
                      backgroundColor: '#e7a690', 
                      color: 'white',
                      border: 'none',
                      fontFamily: 'Archivo, sans-serif'
                    }}
                  >
                    Deploy
                  </button>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ backgroundColor: '#f5f5f7' }}>
                  <div className="d-flex align-items-center gap-3">
                    <Icon icon="solar:test-tube-outline" style={{ color: '#4a4d68' }} />
                    <div>
                      <h6 className="mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                        Test Response Timing
                      </h6>
                      <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                        Experiment with AI response delays for better UX
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-sm"
                    style={{ 
                      backgroundColor: '#4a4d68', 
                      color: 'white',
                      border: 'none',
                      fontFamily: 'Archivo, sans-serif'
                    }}
                  >
                    Create
                  </button>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ backgroundColor: '#f5f5f7' }}>
                  <div className="d-flex align-items-center gap-3">
                    <Icon icon="solar:chart-outline" style={{ color: '#eeece1' }} />
                    <div>
                      <h6 className="mb-0" style={{ fontFamily: 'Archivo, sans-serif', color: '#222323' }}>
                        Analyze User Segments
                      </h6>
                      <p className="mb-0 text-sm" style={{ color: '#4a4d68' }}>
                        Test variations by user persona and journey stage
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-sm"
                    style={{ 
                      backgroundColor: '#fce5d7', 
                      color: '#222323',
                      border: 'none',
                      fontFamily: 'Archivo, sans-serif'
                    }}
                  >
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentsLayer;