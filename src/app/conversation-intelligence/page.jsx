'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import MasterLayout from "@/masterLayout/MasterLayout";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ConversationIntelligencePage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
    const [selectedTopic, setSelectedTopic] = useState('all');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                timeframe: selectedTimeframe,
                topic: selectedTopic
            });

            const response = await fetch(`/api/conversation-intelligence?${params}`);
            const result = await response.json();

            if (response.ok) {
                setData(result);
            } else {
                throw new Error(result.error || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching conversation intelligence:', error);
            toast.error('Failed to load conversation intelligence data');
        } finally {
            setLoading(false);
        }
    }, [selectedTimeframe, selectedTopic]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Sentiment analysis chart options
    const sentimentOptions = {
        chart: {
            type: 'donut',
            height: 300,
            fontFamily: 'Archivo, sans-serif'
        },
        colors: ['#e7a690', '#4a4d68', '#eeece1'],
        labels: ['Positive', 'Neutral', 'Negative'],
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
                            label: 'Overall Sentiment',
                            fontSize: '14px',
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

    // Topic trends chart options
    const topicTrendsOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            fontFamily: 'Archivo, sans-serif'
        },
        colors: ['#e7a690'],
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: true,
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: data?.top_topics?.map(topic => topic.topic) || [],
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
        }
    };

    const formatTimeframe = (timeframe) => {
        const labels = {
            '1d': 'Last 24 hours',
            '7d': 'Last 7 days', 
            '30d': 'Last 30 days',
            '90d': 'Last 90 days'
        };
        return labels[timeframe] || 'Last 7 days';
    };

    const getSentimentColor = (sentiment) => {
        if (sentiment >= 0.7) return 'text-success';
        if (sentiment >= 0.5) return 'text-warning';
        return 'text-danger';
    };

    if (loading) {
        return (
            <MasterLayout>
                <div className="myavana-dashboard-container">
                    <div className="myavana-loading-section">
                        <div className="text-center py-5">
                            <div className="myavana-spinner"></div>
                            <p className="myavana-loading-text mt-3">Loading conversation intelligence...</p>
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
                        <span className="myavana-breadcrumb-current">Conversation Intelligence</span>
                    </div>
                    
                    <div className="myavana-page-title-section">
                        <h1 className="myavana-page-title">
                            Conversation Intelligence
                        </h1>
                        <p className="myavana-page-subtitle">
                            Advanced analytics and insights from user conversations
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="myavana-controls-section mb-6">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <select
                                className="myavana-select"
                                value={selectedTimeframe}
                                onChange={(e) => setSelectedTimeframe(e.target.value)}
                            >
                                <option value="1d">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="myavana-select"
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                            >
                                <option value="all">All Topics</option>
                                <option value="hair-dryness">Hair Dryness</option>
                                <option value="hair-breakage">Hair Breakage</option>
                                <option value="hair-loss">Hair Loss</option>
                                <option value="scalp-issues">Scalp Issues</option>
                            </select>
                        </div>
                        <div className="col-md-6 text-end">
                            <span className="myavana-text-muted">
                                Showing data for {formatTimeframe(selectedTimeframe)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="row g-4 mb-6 mt-4">
                    <div className="col-lg-2 col-md-4">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-primary">
                                    <i className="fas fa-comments"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.total_conversations?.toLocaleString() || 0}
                                </h3>
                                <p className="myavana-stats-label">Total Conversations</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-2 col-md-4">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-secondary">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.avg_conversation_length || 0}
                                </h3>
                                <p className="myavana-stats-label">Avg Length (messages)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-2 col-md-4">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-coral">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.resolution_rate || 0}%
                                </h3>
                                <p className="myavana-stats-label">Resolution Rate</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-2 col-md-4">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-sand">
                                    <i className="fas fa-star"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.user_satisfaction || 0}/5
                                </h3>
                                <p className="myavana-stats-label">User Satisfaction</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-2 col-md-4">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-primary">
                                    <i className="fas fa-tags"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.topic_coverage || 0}%
                                </h3>
                                <p className="myavana-stats-label">Topic Coverage</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-2 col-md-4">
                        <div className="myavana-card myavana-card-stats">
                            <div className="myavana-card-body">
                                <div className="myavana-stats-icon myavana-bg-coral">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <h3 className="myavana-stats-number">
                                    {data?.overview?.escalation_rate || 0}%
                                </h3>
                                <p className="myavana-stats-label">Escalation Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mt-4">
                    {/* Sentiment Analysis */}
                    <div className="col-lg-4">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-heart me-2"></i>
                                    Sentiment Analysis
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                {data?.sentiment_distribution && (
                                    <ReactApexChart
                                        options={sentimentOptions}
                                        series={[
                                            data.sentiment_distribution.positive,
                                            data.sentiment_distribution.neutral,
                                            data.sentiment_distribution.negative
                                        ]}
                                        type="donut"
                                        height={300}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Topics */}
                    <div className="col-lg-8">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-chart-bar me-2"></i>
                                    Top Conversation Topics
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                <div className="table-responsive">
                                    <table className="myavana-table">
                                        <thead>
                                            <tr>
                                                <th>Topic</th>
                                                <th>Count</th>
                                                <th>Sentiment</th>
                                                <th>Resolution Rate</th>
                                                <th>Avg Response Time</th>
                                                <th>Satisfaction</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.top_topics?.map((topic, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <strong>{topic.topic}</strong>
                                                    </td>
                                                    <td>
                                                        <span className="myavana-badge myavana-badge-primary">
                                                            {topic.count}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`fw-bold ${getSentimentColor(topic.sentiment)}`}>
                                                            {(topic.sentiment * 100).toFixed(0)}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="myavana-badge myavana-badge-success">
                                                            {topic.resolution_rate}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="myavana-text-muted">
                                                            {topic.avg_response_time_ms}ms
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-1">{topic.user_satisfaction}</span>
                                                            <div className="myavana-rating-small">
                                                                {Array.from({ length: 5 }, (_, i) => (
                                                                    <i key={i} className={`fas fa-star ${i < Math.floor(topic.user_satisfaction) ? 'text-warning' : 'text-muted'}`}></i>
                                                                ))}
                                                            </div>
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

                    {/* Conversation Flow */}
                    <div className="col-12">
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">
                                    <i className="fas fa-route me-2"></i>
                                    Conversation Flow Analysis
                                </h5>
                            </div>
                            <div className="myavana-card-body">
                                <div className="myavana-conversation-flow">
                                    {data?.conversation_flow?.map((stage, index) => (
                                        <div key={index} className="myavana-flow-stage">
                                            <div className="myavana-flow-connector">
                                                {index < data.conversation_flow.length - 1 && (
                                                    <div className="myavana-flow-arrow">
                                                        <i className="fas fa-arrow-right"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="myavana-flow-card">
                                                <div className="myavana-flow-header">
                                                    <h6>{stage.stage}</h6>
                                                    <span className="myavana-flow-percentage">
                                                        {stage.percentage}%
                                                    </span>
                                                </div>
                                                <div className="myavana-flow-details">
                                                    <div className="myavana-progress mb-2">
                                                        <div 
                                                            className="myavana-progress-bar" 
                                                            style={{ width: `${stage.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <small className="myavana-text-muted">
                                                        Avg time: {stage.avg_time_seconds}s
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default ConversationIntelligencePage;