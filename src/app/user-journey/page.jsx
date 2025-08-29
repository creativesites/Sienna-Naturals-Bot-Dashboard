'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import MasterLayout from "@/masterLayout/MasterLayout";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const UserJourneyPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user-journey');
            const result = await response.json();

            if (response.ok) {
                setData(result);
            } else {
                throw new Error(result.error || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching user journey data:', error);
            toast.error('Failed to load user journey data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Journey funnel chart options
    const funnelOptions = {
        chart: {
            type: 'bar',
            height: 400,
            fontFamily: 'Archivo, sans-serif'
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '80%',
                distributed: true
            }
        },
        colors: ['#e7a690', '#4a4d68', '#eeece1', '#fce5d7', '#d4806c', '#3a3c55', '#ddd9c7', '#f0b59b'],
        dataLabels: {
            enabled: true,
            textAnchor: 'middle',
            formatter: function (val, opts) {
                return opts.w.globals.labels[opts.dataPointIndex] + ': ' + val;
            },
            style: {
                colors: ['#fff'],
                fontFamily: 'Archivo, sans-serif'
            }
        },
        xaxis: {
            categories: data?.stageData?.map(stage => stage.name) || [],
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
        legend: {
            show: false
        },
        grid: {
            borderColor: '#f5f5f7'
        }
    };

    // Journey progression chart options
    const progressionOptions = {
        chart: {
            type: 'line',
            height: 300,
            toolbar: { show: false },
            fontFamily: 'Archivo, sans-serif'
        },
        colors: ['#e7a690', '#4a4d68', '#eeece1', '#fce5d7'],
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
            categories: data?.journeyProgression?.map(day => {
                const date = new Date(day.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }) || [],
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
        legend: {
            position: 'top',
            fontFamily: 'Archivo, sans-serif'
        },
        grid: {
            borderColor: '#f5f5f7'
        }
    };

    const getStageColor = (index) => {
        const colors = [
            'myavana-primary', 'myavana-secondary', 'myavana-coral', 'myavana-sand',
            'myavana-primary', 'myavana-secondary', 'myavana-coral', 'myavana-sand'
        ];
        return colors[index] || 'myavana-primary';
    };

    const getDropoffColor = (rate) => {
        if (rate >= 70) return 'success';
        if (rate >= 40) return 'warning';
        return 'danger';
    };

    if (loading) {
        return (
            <MasterLayout>
                <div className="myavana-dashboard-container">
                    <div className="myavana-loading-section">
                        <div className="text-center py-5">
                            <div className="myavana-spinner"></div>
                            <p className="myavana-loading-text mt-3">Loading user journey analytics...</p>
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
                        <span className="myavana-breadcrumb-current">User Journey Analytics</span>
                    </div>
                    
                    <div className="myavana-page-title-section">
                        <h1 className="myavana-page-title">
                            User Journey Analytics
                        </h1>
                        <p className="myavana-page-subtitle">
                            Track user behavior and optimize conversion paths
                        </p>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="row g-4 mb-4 mt-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-primary">
                                    <i className="fas fa-users"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.totalUsers?.toLocaleString() || 0}
                                </h3>
                                <p className="myavana-stats-label">Total Users (30 days)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-secondary">
                                    <i className="fas fa-flag-checkered"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.completedJourneys?.toLocaleString() || 0}
                                </h3>
                                <p className="myavana-stats-label">Completed Journeys</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-coral">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.conversionRate?.toFixed(1) || 0}%
                                </h3>
                                <p className="myavana-stats-label">Conversion Rate</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-sand">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {Math.round((data?.totalUsers || 0) / 30)}
                                </h3>
                                <p className="myavana-stats-label">Daily Avg Users</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mt-4 mb-4">
                    {/* Journey Funnel */}
                    <div className="col-lg-8">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-filter me-2"></i>
                                    User Journey Funnel
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                {data?.stageData && (
                                    <ReactApexChart
                                        options={funnelOptions}
                                        series={[{
                                            name: 'Users',
                                            data: data.stageData.map(stage => stage.users)
                                        }]}
                                        type="bar"
                                        height={400}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Journey Stages Details */}
                    <div className="col-lg-4">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-layer-group me-2"></i>
                                    Stage Details
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                <div className="myavana-journey-stages">
                                    {data?.stageData?.map((stage, index) => (
                                        <div key={stage.stage} className="myavana-journey-stage-item">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className={`myavana-stage-icon myavana-bg-${getStageColor(index)}`}>
                                                    {stage.stage}
                                                </div>
                                                <div className="ms-3 flex-grow-1">
                                                    <h6 className="mb-1">{stage.name}</h6>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="myavana-stage-users">
                                                            {stage.users.toLocaleString()} users
                                                        </span>
                                                        <span className={`myavana-badge myavana-badge-${getDropoffColor(stage.dropoffRate)}`}>
                                                            {stage.dropoffRate}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="myavana-progress mb-3">
                                                <div 
                                                    className="myavana-progress-bar" 
                                                    style={{ width: `${stage.dropoffRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Event Analytics */}
                    <div className="col-lg-6">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-calendar-check me-2"></i>
                                    Journey Events (30 days)
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                <div className="myavana-journey-events">
                                    <div className="myavana-event-item">
                                        <div className="myavana-event-icon myavana-bg-primary">
                                            <i className="fas fa-hand-wave"></i>
                                        </div>
                                        <div className="myavana-event-content">
                                            <h6>Welcome Events</h6>
                                            <span className="myavana-event-count">
                                                {data?.eventCounts?.welcome?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="myavana-event-item">
                                        <div className="myavana-event-icon myavana-bg-secondary">
                                            <i className="fas fa-search"></i>
                                        </div>
                                        <div className="myavana-event-content">
                                            <h6>Queries</h6>
                                            <span className="myavana-event-count">
                                                {data?.eventCounts?.query?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="myavana-event-item">
                                        <div className="myavana-event-icon myavana-bg-coral">
                                            <i className="fas fa-lightbulb"></i>
                                        </div>
                                        <div className="myavana-event-content">
                                            <h6>Recommendations</h6>
                                            <span className="myavana-event-count">
                                                {data?.eventCounts?.recommendation?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="myavana-event-item">
                                        <div className="myavana-event-icon myavana-bg-sand">
                                            <i className="fas fa-shopping-cart"></i>
                                        </div>
                                        <div className="myavana-event-content">
                                            <h6>Conversions</h6>
                                            <span className="myavana-event-count">
                                                {data?.eventCounts?.conversion?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journey Progression Over Time */}
                    <div className="col-lg-6">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-chart-area me-2"></i>
                                    Journey Progression (7 days)
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                {data?.journeyProgression && data.journeyProgression.length > 0 ? (
                                    <ReactApexChart
                                        options={progressionOptions}
                                        series={[
                                            {
                                                name: 'Discovery',
                                                data: data.journeyProgression.map(day => day.stage1_users)
                                            },
                                            {
                                                name: 'Analysis',
                                                data: data.journeyProgression.map(day => day.stage2_users)
                                            },
                                            {
                                                name: 'Personalization',
                                                data: data.journeyProgression.map(day => day.stage3_users)
                                            },
                                            {
                                                name: 'Product Discovery',
                                                data: data.journeyProgression.map(day => day.stage4_users)
                                            }
                                        ]}
                                        type="line"
                                        height={300}
                                    />
                                ) : (
                                    <div className="myavana-empty-state-sm">
                                        <i className="fas fa-chart-line fa-2x"></i>
                                        <p>No progression data available for the selected period</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default UserJourneyPage;