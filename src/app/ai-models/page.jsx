'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import MasterLayout from "@/masterLayout/MasterLayout";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AIModelsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ai-model-performance?timeframe=${selectedTimeframe}`);
            const result = await response.json();

            if (response.ok) {
                setData(result);
            } else {
                throw new Error(result.error || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching AI model performance:', error);
            toast.error('Failed to load AI model performance data');
        } finally {
            setLoading(false);
        }
    }, [selectedTimeframe]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Performance trends chart options
    const trendsOptions = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false },
            fontFamily: 'Archivo, sans-serif'
        },
        colors: ['#e7a690', '#4a4d68', '#eeece1'],
        stroke: {
            curve: 'smooth',
            width: 3
        },
        markers: {
            size: 5,
            strokeWidth: 0,
            hover: {
                size: 8
            }
        },
        xaxis: {
            categories: data?.historical_trends ? 
                [...new Set(data.historical_trends.map(item => 
                    new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                ))] : [],
            labels: {
                style: {
                    colors: '#222323',
                    fontFamily: 'Archivo, sans-serif'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Success Rate (%)',
                style: {
                    color: '#222323',
                    fontFamily: 'Archivo, sans-serif'
                }
            },
            labels: {
                style: {
                    colors: '#222323',
                    fontFamily: 'Archivo, sans-serif'
                }
            }
        },
        legend: {
            position: 'top',
            fontFamily: 'Archivo, sans-serif'
        },
        grid: {
            borderColor: '#f5f5f7'
        }
    };

    // Response time chart options
    const responseTimeOptions = {
        chart: {
            type: 'bar',
            height: 300,
            toolbar: { show: false },
            fontFamily: 'Archivo, sans-serif'
        },
        colors: ['#e7a690', '#4a4d68', '#eeece1'],
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: false,
                columnWidth: '60%'
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val.toFixed(0) + 'ms';
            },
            style: {
                fontFamily: 'Archivo, sans-serif'
            }
        },
        xaxis: {
            categories: data?.current_performance?.map(model => 
                model.model_name.replace('Gemini', 'G').replace('Experimental', 'Exp')
            ) || [],
            labels: {
                style: {
                    colors: '#222323',
                    fontFamily: 'Archivo, sans-serif'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Response Time (ms)',
                style: {
                    color: '#222323',
                    fontFamily: 'Archivo, sans-serif'
                }
            },
            labels: {
                style: {
                    colors: '#222323',
                    fontFamily: 'Archivo, sans-serif'
                }
            }
        },
        grid: {
            borderColor: '#f5f5f7'
        }
    };

    const getModelStatus = (successRate) => {
        if (successRate >= 98) return { status: 'excellent', color: 'success' };
        if (successRate >= 95) return { status: 'good', color: 'primary' };
        if (successRate >= 90) return { status: 'fair', color: 'warning' };
        return { status: 'poor', color: 'danger' };
    };

    const getResponseTimeStatus = (responseTime) => {
        if (responseTime <= 800) return 'success';
        if (responseTime <= 1200) return 'warning';
        return 'danger';
    };

    const formatTimeframe = (timeframe) => {
        const labels = {
            '24h': 'Last 24 hours',
            '7d': 'Last 7 days',
            '30d': 'Last 30 days',
            '90d': 'Last 90 days'
        };
        return labels[timeframe] || 'Last 7 days';
    };

    if (loading) {
        return (
            <MasterLayout>
                <div className="myavana-dashboard-container">
                    <div className="myavana-loading-section">
                        <div className="text-center py-5">
                            <div className="myavana-spinner"></div>
                            <p className="myavana-loading-text mt-3">Loading AI model performance...</p>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <div className="myavana-dashboard-container">
                {/* Header Section */}
                <div className="myavana-page-header">
                    <div className="myavana-breadcrumb">
                        <Link href="/" className="myavana-breadcrumb-link">Dashboard</Link>
                        <span className="myavana-breadcrumb-separator">/</span>
                        <span className="myavana-breadcrumb-current">AI Model Performance</span>
                    </div>
                    
                    <div className="myavana-page-title-section">
                        <h1 className="myavana-page-title">
                            AI Model Performance
                        </h1>
                        <p className="myavana-page-subtitle">
                            Monitor and analyze AI model performance metrics
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="myavana-controls-section">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <select
                                className="myavana-select"
                                value={selectedTimeframe}
                                onChange={(e) => setSelectedTimeframe(e.target.value)}
                            >
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                            </select>
                        </div>
                        <div className="col-md-6 text-end">
                            <span className="myavana-text-muted">
                                Showing data for {formatTimeframe(selectedTimeframe)}
                                {data?.overview?.last_updated && (
                                    <span className="ms-2">
                                        • Updated {new Date(data.overview.last_updated).toLocaleTimeString()}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Overview Metrics */}
                <div className="row g-4 mb-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-primary">
                                    <i className="fas fa-robot"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.total_models || 0}
                                </h3>
                                <p className="myavana-stats-label">Active Models</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-secondary">
                                    <i className="fas fa-paper-plane"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.total_requests?.toLocaleString() || 0}
                                </h3>
                                <p className="myavana-stats-label">Total Requests</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-coral">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.avg_success_rate?.toFixed(1) || 0}%
                                </h3>
                                <p className="myavana-stats-label">Avg Success Rate</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-sand">
                                    <i className="fas fa-tachometer-alt"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {Math.round(data?.overview?.avg_response_time || 0)}ms
                                </h3>
                                <p className="myavana-stats-label">Avg Response Time</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Model Performance Table */}
                    <div className="col-12">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-chart-bar me-2"></i>
                                    Current Model Performance
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                <div className="table-responsive">
                                    <table className="myavana-table">
                                        <thead>
                                            <tr>
                                                <th>Model</th>
                                                <th>Status</th>
                                                <th>Requests</th>
                                                <th>Success Rate</th>
                                                <th>Response Time</th>
                                                <th>Conversations</th>
                                                <th>Users Served</th>
                                                <th>Error Recovery</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.current_performance?.map((model, index) => {
                                                const statusInfo = getModelStatus(model.success_rate);
                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className={`myavana-model-icon myavana-bg-${statusInfo.color}`}>
                                                                    <i className="fas fa-brain"></i>
                                                                </div>
                                                                <div className="ms-3">
                                                                    <strong>{model.model_name}</strong>
                                                                    <div className="myavana-text-muted small">
                                                                        Updated {model.date_tracked}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`myavana-badge myavana-badge-${statusInfo.color}`}>
                                                                {statusInfo.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column">
                                                                <span className="fw-bold">
                                                                    {model.request_count.toLocaleString()}
                                                                </span>
                                                                <small className="myavana-text-muted">
                                                                    {model.failure_count > 0 && `${model.failure_count} failed`}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <span className={`fw-bold text-${statusInfo.color}`}>
                                                                    {model.success_rate}%
                                                                </span>
                                                                <div className="myavana-progress ms-2" style={{ width: '60px' }}>
                                                                    <div 
                                                                        className="myavana-progress-bar" 
                                                                        style={{ width: `${model.success_rate}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`fw-bold text-${getResponseTimeStatus(model.avg_response_time_ms)}`}>
                                                                {model.avg_response_time_ms}ms
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="myavana-badge myavana-badge-outline-primary">
                                                                {model.conversations_processed || 0}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="myavana-text-primary fw-bold">
                                                                {model.total_users_served?.toLocaleString() || 0}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {model.error_recovery_attempts > 0 ? (
                                                                <span className="myavana-badge myavana-badge-warning">
                                                                    {model.error_recovery_attempts} attempts
                                                                </span>
                                                            ) : (
                                                                <span className="myavana-text-muted">None</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Trends Chart */}
                    <div className="col-lg-8">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-chart-line me-2"></i>
                                    Success Rate Trends
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                {data?.historical_trends && data.historical_trends.length > 0 ? (
                                    <ReactApexChart
                                        options={trendsOptions}
                                        series={[
                                            ...new Set(data.historical_trends.map(item => item.model_name))
                                        ].map(modelName => ({
                                            name: modelName.replace('Gemini', 'G').replace('Experimental', 'Exp'),
                                            data: data.historical_trends
                                                .filter(item => item.model_name === modelName)
                                                .map(item => item.success_rate.toFixed(1))
                                        }))}
                                        type="line"
                                        height={350}
                                    />
                                ) : (
                                    <div className="myavana-empty-state-sm">
                                        <i className="fas fa-chart-line fa-2x"></i>
                                        <p>No trend data available for the selected period</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Response Time Comparison */}
                    <div className="col-lg-4">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-stopwatch me-2"></i>
                                    Response Time Comparison
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                {data?.current_performance && (
                                    <ReactApexChart
                                        options={responseTimeOptions}
                                        series={[{
                                            name: 'Response Time',
                                            data: data.current_performance.map(model => model.avg_response_time_ms)
                                        }]}
                                        type="bar"
                                        height={300}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default AIModelsPage;