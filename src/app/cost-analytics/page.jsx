'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import MasterLayout from "@/masterLayout/MasterLayout";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CostAnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/cost-analytics?timeframe=${selectedTimeframe}`);
            const result = await response.json();

            if (response.ok) {
                setData(result);
            } else {
                throw new Error(result.error || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching cost analytics:', error);
            toast.error('Failed to load cost analytics data');
        } finally {
            setLoading(false);
        }
    }, [selectedTimeframe]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Cost trends chart options
    const costTrendsOptions = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: { show: false },
            fontFamily: 'Archivo, sans-serif'
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
            categories: data?.cost_trends?.daily_costs?.map(day => 
                new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            ) || [],
            labels: {
                style: {
                    colors: '#222323',
                    fontFamily: 'Archivo, sans-serif'
                }
            }
        },
        yaxis: [
            {
                title: {
                    text: 'Cost ($)',
                    style: {
                        color: '#222323',
                        fontFamily: 'Archivo, sans-serif'
                    }
                },
                labels: {
                    style: {
                        colors: '#222323',
                        fontFamily: 'Archivo, sans-serif'
                    },
                    formatter: function (val) {
                        return '$' + val.toFixed(2);
                    }
                }
            },
            {
                opposite: true,
                title: {
                    text: 'Conversations',
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
            }
        ],
        legend: {
            position: 'top',
            fontFamily: 'Archivo, sans-serif'
        },
        grid: {
            borderColor: '#f5f5f7'
        }
    };

    // Model breakdown pie chart options
    const modelBreakdownOptions = {
        chart: {
            type: 'donut',
            height: 300,
            fontFamily: 'Archivo, sans-serif'
        },
        colors: ['#e7a690', '#4a4d68', '#eeece1'],
        labels: data?.model_breakdown?.map(model => 
            model.model_name.replace('Gemini', 'G').replace('Experimental', 'Exp')
        ) || [],
        legend: {
            position: 'bottom',
            fontFamily: 'Archivo, sans-serif'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '60%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Cost',
                            fontSize: '14px',
                            fontFamily: 'Archivo, sans-serif',
                            color: '#222323',
                            formatter: function (w) {
                                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return '$' + total.toFixed(2);
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val, opts) {
                return '$' + opts.w.globals.series[opts.seriesIndex].toFixed(2);
            },
            style: {
                fontFamily: 'Archivo, sans-serif'
            }
        }
    };

    const formatTimeframe = (timeframe) => {
        const labels = {
            '7d': 'Last 7 days',
            '30d': 'Last 30 days',
            '90d': 'Last 90 days',
            '1y': 'Last year'
        };
        return labels[timeframe] || 'Last 30 days';
    };

    const getCostTrend = (trend) => {
        const colors = {
            'increasing': 'danger',
            'decreasing': 'success',
            'stable': 'warning'
        };
        return colors[trend] || 'warning';
    };

    const getSavingsColor = (savings) => {
        if (savings >= 50) return 'success';
        if (savings >= 20) return 'warning';
        return 'primary';
    };

    if (loading) {
        return (
            <MasterLayout>
                <div className="myavana-dashboard-container">
                    <div className="myavana-loading-section">
                        <div className="text-center py-5">
                            <div className="myavana-spinner"></div>
                            <p className="myavana-loading-text mt-3">Loading cost analytics...</p>
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
                        <span className="myavana-breadcrumb-current">Cost Analytics</span>
                    </div>
                    
                    <div className="myavana-page-title-section">
                        <h1 className="myavana-page-title">
                            Cost Analytics
                        </h1>
                        <p className="myavana-page-subtitle">
                            Monitor and optimize AI model usage costs
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
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="1y">Last year</option>
                            </select>
                        </div>
                        <div className="col-md-6 text-end">
                            <span className="myavana-text-muted">
                                Showing costs for {formatTimeframe(selectedTimeframe)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cost Overview Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-primary">
                                    <i className="fas fa-dollar-sign"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    ${data?.period_summary?.total_cost?.toFixed(2) || '0.00'}
                                </h3>
                                <p className="myavana-stats-label">Total Cost ({selectedTimeframe})</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-secondary">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    ${data?.period_summary?.projected_monthly_cost?.toFixed(2) || '0.00'}
                                </h3>
                                <p className="myavana-stats-label">Projected Monthly</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-coral">
                                    <i className="fas fa-comments"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    ${data?.period_summary?.avg_cost_per_conversation?.toFixed(3) || '0.000'}
                                </h3>
                                <p className="myavana-stats-label">Cost/Conversation</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className={`myavana-stats-icon myavana-bg-${getCostTrend(data?.cost_trends?.trend)}`}>
                                    <i className={`fas fa-arrow-${data?.cost_trends?.trend === 'increasing' ? 'up' : data?.cost_trends?.trend === 'decreasing' ? 'down' : 'right'}`}></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    ${data?.cost_trends?.avg_daily_cost?.toFixed(2) || '0.00'}
                                </h3>
                                <p className="myavana-stats-label">Avg Daily Cost</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Cost Trends Chart */}
                    <div className="col-lg-8">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-chart-area me-2"></i>
                                    Cost Trends Over Time
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                {data?.cost_trends?.daily_costs && data.cost_trends.daily_costs.length > 0 ? (
                                    <ReactApexChart
                                        options={costTrendsOptions}
                                        series={[
                                            {
                                                name: 'Daily Cost',
                                                type: 'area',
                                                data: data.cost_trends.daily_costs.map(day => day.cost.toFixed(2))
                                            },
                                            {
                                                name: 'Conversations',
                                                type: 'line',
                                                yAxisIndex: 1,
                                                data: data.cost_trends.daily_costs.map(day => day.conversations)
                                            }
                                        ]}
                                        type="line"
                                        height={350}
                                    />
                                ) : (
                                    <div className="myavana-empty-state-sm">
                                        <i className="fas fa-chart-area fa-2x"></i>
                                        <p>No cost data available for the selected period</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Model Cost Breakdown */}
                    <div className="col-lg-4">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-chart-pie me-2"></i>
                                    Cost by Model
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                {data?.model_breakdown && data.model_breakdown.length > 0 ? (
                                    <ReactApexChart
                                        options={modelBreakdownOptions}
                                        series={data.model_breakdown.map(model => model.total_cost)}
                                        type="donut"
                                        height={300}
                                    />
                                ) : (
                                    <div className="myavana-empty-state-sm">
                                        <i className="fas fa-chart-pie fa-2x"></i>
                                        <p>No model cost data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Model Details Table */}
                    <div className="col-12">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-table me-2"></i>
                                    Detailed Model Costs
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                <div className="table-responsive">
                                    <table className="myavana-table">
                                        <thead>
                                            <tr>
                                                <th>Model</th>
                                                <th>Requests</th>
                                                <th>Input Cost</th>
                                                <th>Output Cost</th>
                                                <th>Total Cost</th>
                                                <th>Percentage</th>
                                                <th>Cost/Request</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.model_breakdown?.map((model, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className={`myavana-model-icon myavana-bg-${index === 0 ? 'primary' : index === 1 ? 'secondary' : 'coral'}`}>
                                                                <i className="fas fa-brain"></i>
                                                            </div>
                                                            <div className="ms-3">
                                                                <strong>{model.model_name}</strong>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="myavana-badge myavana-badge-outline-primary">
                                                            {model.requests.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="myavana-text-success fw-bold">
                                                            ${model.input_cost.toFixed(4)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="myavana-text-warning fw-bold">
                                                            ${model.output_cost.toFixed(4)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="myavana-text-primary fw-bold">
                                                            ${model.total_cost.toFixed(4)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{model.percentage.toFixed(1)}%</span>
                                                            <div className="myavana-progress" style={{ width: '60px' }}>
                                                                <div 
                                                                    className="myavana-progress-bar" 
                                                                    style={{ width: `${model.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="myavana-text-muted">
                                                            ${(model.total_cost / model.requests).toFixed(6)}
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

                    {/* Optimization Suggestions */}
                    {data?.optimization_suggestions && data.optimization_suggestions.length > 0 && (
                        <div className="col-12">
                            <div className="myavana-card">
                                <div className="myavana-card-header">
                                    <h5 className="myavana-card-title">
                                        <i className="fas fa-lightbulb me-2"></i>
                                        Cost Optimization Suggestions
                                    </h5>
                                </div>
                                <div className="myavana-card-body">
                                    <div className="row g-3">
                                        {data.optimization_suggestions.map((suggestion, index) => (
                                            <div key={index} className="col-md-6">
                                                <div className="myavana-optimization-card">
                                                    <div className="d-flex align-items-start">
                                                        <div className={`myavana-optimization-icon myavana-bg-${getSavingsColor(suggestion.potential_savings)}`}>
                                                            <i className="fas fa-coins"></i>
                                                        </div>
                                                        <div className="ms-3 flex-grow-1">
                                                            <h6 className="myavana-optimization-title">
                                                                {suggestion.title}
                                                            </h6>
                                                            <p className="myavana-optimization-description">
                                                                {suggestion.description}
                                                            </p>
                                                            <div className="myavana-potential-savings">
                                                                <strong>Potential Savings: ${suggestion.potential_savings.toFixed(2)}</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MasterLayout>
    );
};

export default CostAnalyticsPage;