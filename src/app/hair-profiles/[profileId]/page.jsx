'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import MasterLayout from "@/masterLayout/MasterLayout";

const HairProfileDetailPage = () => {
    const params = useParams();
    const { profileId } = params;
    
    const [profile, setProfile] = useState(null);
    const [issues, setIssues] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (profileId) {
            fetchProfileData();
        }
    }, [profileId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/hair-profiles/${profileId}`);
            const data = await response.json();

            if (response.ok) {
                setProfile(data.profile);
                setIssues(data.issues || []);
                setConversations(data.conversations || []);
                setRecommendations(data.recommendations || []);
                setTimeline(data.timeline || []);
                setAnalytics(data.analytics || {});
            } else {
                throw new Error(data.error || 'Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load hair profile');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    };

    const getHealthScoreColor = (score) => {
        if (score >= 85) return 'success';
        if (score >= 70) return 'warning';
        return 'danger';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'low': 'success',
            'medium': 'warning',
            'high': 'danger',
            'critical': 'danger'
        };
        return colors[severity?.toLowerCase()] || 'secondary';
    };

    const getEventIcon = (eventType) => {
        const icons = {
            'issue': 'fas fa-exclamation-triangle',
            'recommendation': 'fas fa-lightbulb',
            'conversation': 'fas fa-comments',
            'improvement': 'fas fa-arrow-up'
        };
        return icons[eventType] || 'fas fa-circle';
    };

    if (loading) {
        return (
            <MasterLayout>
                <div className="myavana-dashboard-container">
                    <div className="myavana-loading-section">
                        <div className="text-center py-5">
                            <div className="myavana-spinner"></div>
                            <p className="myavana-loading-text mt-3">Loading hair profile...</p>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    if (!profile) {
        return (
            <MasterLayout>
                <div className="myavana-dashboard-container">
                    <div className="myavana-empty-state">
                        <div className="myavana-empty-icon">
                            <i className="fas fa-search fa-3x"></i>
                        </div>
                        <h3 className="myavana-empty-title">Hair Profile Not Found</h3>
                        <p className="myavana-empty-description">
                            The hair profile you're looking for doesn't exist or has been removed.
                        </p>
                        <Link href="/hair-profiles" className="myavana-btn myavana-btn-primary">
                            <i className="fas fa-arrow-left me-1"></i> Back to Hair Profiles
                        </Link>
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
                        <Link href="/hair-profiles" className="myavana-breadcrumb-link">Hair Profiles</Link>
                        <span className="myavana-breadcrumb-separator">/</span>
                        <span className="myavana-breadcrumb-current">{profile.name}</span>
                    </div>
                </div>

                {/* Profile Hero Section */}
                <div className="myavana-card myavana-card-hero mb-4">
                    <div className="myavana-card-body">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                    <div className="myavana-avatar myavana-avatar-xl me-4">
                                        {getUserInitials(profile.name)}
                                    </div>
                                    <div>
                                        <h1 className="myavana-profile-name">
                                            {profile.name || 'Unknown User'}
                                        </h1>
                                        <p className="myavana-profile-email">{profile.email}</p>
                                        <div className="myavana-profile-meta">
                                            <span className="myavana-badge myavana-badge-outline-primary me-2">
                                                <i className="fas fa-calendar me-1"></i>
                                                Joined {formatDate(profile.created_at)}
                                            </span>
                                            <span className="myavana-badge myavana-badge-outline-secondary">
                                                ID: {profile.user_id.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="row text-center">
                                    <div className="col-3">
                                        <div className={`myavana-score-circle-lg myavana-score-${getHealthScoreColor(profile.hair_health_score)}`}>
                                            {profile.hair_health_score}
                                        </div>
                                        <div className="myavana-score-label">Health Score</div>
                                    </div>
                                    <div className="col-3">
                                        <div className="myavana-hero-metric">
                                            <div className="myavana-hero-number">{profile.total_conversations}</div>
                                            <div className="myavana-hero-label">Conversations</div>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="myavana-hero-metric">
                                            <div className="myavana-hero-number">{profile.active_issues_count}</div>
                                            <div className="myavana-hero-label">Active Issues</div>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="myavana-hero-metric">
                                            <div className="myavana-hero-number">{Math.round(profile.profile_completeness_score)}%</div>
                                            <div className="myavana-hero-label">Complete</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="myavana-tabs-container mb-4">
                    <ul className="myavana-tabs">
                        <li className={`myavana-tab ${activeTab === 'overview' ? 'active' : ''}`}>
                            <button onClick={() => setActiveTab('overview')}>
                                <i className="fas fa-eye me-2"></i> Overview
                            </button>
                        </li>
                        <li className={`myavana-tab ${activeTab === 'hair-details' ? 'active' : ''}`}>
                            <button onClick={() => setActiveTab('hair-details')}>
                                <i className="fas fa-cut me-2"></i> Hair Details
                            </button>
                        </li>
                        <li className={`myavana-tab ${activeTab === 'issues' ? 'active' : ''}`}>
                            <button onClick={() => setActiveTab('issues')}>
                                <i className="fas fa-exclamation-triangle me-2"></i> Issues ({issues.length})
                            </button>
                        </li>
                        <li className={`myavana-tab ${activeTab === 'recommendations' ? 'active' : ''}`}>
                            <button onClick={() => setActiveTab('recommendations')}>
                                <i className="fas fa-lightbulb me-2"></i> Products ({recommendations.length})
                            </button>
                        </li>
                        <li className={`myavana-tab ${activeTab === 'timeline' ? 'active' : ''}`}>
                            <button onClick={() => setActiveTab('timeline')}>
                                <i className="fas fa-clock me-2"></i> Timeline
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Tab Content */}
                <div className="myavana-tab-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="row g-4">
                            {/* Hair Health Analysis */}
                            <div className="col-lg-8">
                                <div className="myavana-card">
                                    <div className="myavana-card-header">
                                        <h5 className="myavana-card-title">
                                            <i className="fas fa-chart-line me-2"></i>
                                            Hair Health Analysis
                                        </h5>
                                    </div>
                                    <div className="myavana-card-body">
                                        {analytics.issue_categories && Object.keys(analytics.issue_categories).length > 0 ? (
                                            <div className="myavana-issue-categories">
                                                {Object.entries(analytics.issue_categories).map(([category, count]) => (
                                                    <div key={category} className="myavana-category-item">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="myavana-category-name">{category}</span>
                                                            <span className="myavana-category-count">{count} issues</span>
                                                        </div>
                                                        <div className="myavana-progress">
                                                            <div 
                                                                className="myavana-progress-bar" 
                                                                style={{ width: `${(count / Math.max(...Object.values(analytics.issue_categories))) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="myavana-empty-state-sm">
                                                <i className="fas fa-chart-line fa-2x"></i>
                                                <p>No hair issues reported - healthy hair!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="col-lg-4">
                                <div className="myavana-card">
                                    <div className="myavana-card-header">
                                        <h5 className="myavana-card-title">
                                            <i className="fas fa-tachometer-alt me-2"></i>
                                            Quick Stats
                                        </h5>
                                    </div>
                                    <div className="myavana-card-body">
                                        <div className="myavana-stats-list">
                                            <div className="myavana-stat-item">
                                                <div className="myavana-stat-icon myavana-bg-primary">
                                                    <i className="fas fa-comments"></i>
                                                </div>
                                                <div className="myavana-stat-content">
                                                    <div className="myavana-stat-number">{analytics.engagement_metrics?.total_conversations || 0}</div>
                                                    <div className="myavana-stat-label">Total Conversations</div>
                                                </div>
                                            </div>
                                            
                                            <div className="myavana-stat-item">
                                                <div className="myavana-stat-icon myavana-bg-secondary">
                                                    <i className="fas fa-message"></i>
                                                </div>
                                                <div className="myavana-stat-content">
                                                    <div className="myavana-stat-number">
                                                        {Math.round(analytics.engagement_metrics?.avg_messages_per_conversation || 0)}
                                                    </div>
                                                    <div className="myavana-stat-label">Avg Messages/Chat</div>
                                                </div>
                                            </div>
                                            
                                            <div className="myavana-stat-item">
                                                <div className="myavana-stat-icon myavana-bg-coral">
                                                    <i className="fas fa-clock"></i>
                                                </div>
                                                <div className="myavana-stat-content">
                                                    <div className="myavana-stat-number">
                                                        {analytics.engagement_metrics?.last_activity 
                                                            ? formatDate(analytics.engagement_metrics.last_activity).split(',')[0]
                                                            : 'Never'
                                                        }
                                                    </div>
                                                    <div className="myavana-stat-label">Last Activity</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hair Details Tab */}
                    {activeTab === 'hair-details' && (
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <div className="myavana-card">
                                    <div className="myavana-card-header">
                                        <h5 className="myavana-card-title">Hair Characteristics</h5>
                                    </div>
                                    <div className="myavana-card-body">
                                        <div className="myavana-detail-grid">
                                            <div className="myavana-detail-item">
                                                <label>Hair Type</label>
                                                <span className={`myavana-badge myavana-badge-primary`}>
                                                    {profile.hair_type || 'Not specified'}
                                                </span>
                                            </div>
                                            <div className="myavana-detail-item">
                                                <label>Hair Texture</label>
                                                <span>{profile.hair_texture || 'Not specified'}</span>
                                            </div>
                                            <div className="myavana-detail-item">
                                                <label>Hair Color</label>
                                                <span>{profile.hair_color || 'Not specified'}</span>
                                            </div>
                                            <div className="myavana-detail-item">
                                                <label>Hair Length</label>
                                                <span>{profile.hair_length || 'Not specified'}</span>
                                            </div>
                                            <div className="myavana-detail-item">
                                                <label>Hair Porosity</label>
                                                <span>{profile.hair_porosity || 'Not specified'}</span>
                                            </div>
                                            <div className="myavana-detail-item">
                                                <label>Hair Density</label>
                                                <span>{profile.hair_density || 'Not specified'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="myavana-card">
                                    <div className="myavana-card-header">
                                        <h5 className="myavana-card-title">Scalp & Styling</h5>
                                    </div>
                                    <div className="myavana-card-body">
                                        <div className="myavana-detail-grid">
                                            <div className="myavana-detail-item">
                                                <label>Scalp Condition</label>
                                                <span>{profile.scalp_condition || 'Not specified'}</span>
                                            </div>
                                            <div className="myavana-detail-item">
                                                <label>Styling Preference</label>
                                                <span>{profile.styling_preference || 'Not specified'}</span>
                                            </div>
                                            <div className="myavana-detail-item">
                                                <label>Chemical Treatments</label>
                                                <span>{profile.chemical_treatments || 'None specified'}</span>
                                            </div>
                                            <div className="myavana-detail-item">
                                                <label>Hair Goals</label>
                                                <span>{profile.hair_goals || 'Not specified'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Issues Tab */}
                    {activeTab === 'issues' && (
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">Hair Issues History</h5>
                            </div>
                            <div className="myavana-card-body">
                                {issues.length > 0 ? (
                                    <div className="myavana-issues-list">
                                        {issues.map((issue) => (
                                            <div key={issue.issue_id} className="myavana-issue-card">
                                                <div className="myavana-issue-header">
                                                    <div className="d-flex align-items-center">
                                                        <span className={`myavana-badge myavana-badge-${getSeverityColor(issue.severity_level)} me-3`}>
                                                            {issue.severity_level || 'Unknown'} Severity
                                                        </span>
                                                        <span className="myavana-issue-date">
                                                            {formatDate(issue.reported_at)}
                                                        </span>
                                                    </div>
                                                    {issue.resolution_status && (
                                                        <span className={`myavana-badge myavana-badge-${issue.resolution_status === 'resolved' ? 'success' : 'warning'}`}>
                                                            {issue.resolution_status}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="myavana-issue-content">
                                                    <h6>{issue.issue_description}</h6>
                                                    {issue.notes && (
                                                        <p className="myavana-issue-notes">{issue.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="myavana-empty-state-sm">
                                        <i className="fas fa-check-circle fa-2x text-success"></i>
                                        <p>No hair issues reported - excellent hair health!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">Product Recommendations</h5>
                            </div>
                            <div className="myavana-card-body">
                                {recommendations.length > 0 ? (
                                    <div className="row g-3">
                                        {recommendations.map((rec) => (
                                            <div key={rec.recommendation_id} className="col-md-6">
                                                <div className="myavana-recommendation-card">
                                                    <div className="myavana-recommendation-header">
                                                        <h6 className="myavana-product-name">{rec.product_name}</h6>
                                                        <span className="myavana-badge myavana-badge-outline-primary">
                                                            {rec.product_category}
                                                        </span>
                                                    </div>
                                                    <div className="myavana-recommendation-content">
                                                        <p>{rec.recommendation_reason}</p>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="myavana-recommendation-date">
                                                                {formatDate(rec.recommended_at)}
                                                            </span>
                                                            {rec.effectiveness_rating && (
                                                                <div className="myavana-rating">
                                                                    {Array.from({ length: 5 }, (_, i) => (
                                                                        <i key={i} className={`fas fa-star ${i < rec.effectiveness_rating ? 'text-warning' : 'text-muted'}`}></i>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="myavana-empty-state-sm">
                                        <i className="fas fa-lightbulb fa-2x"></i>
                                        <p>No product recommendations yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                        <div className="myavana-card">
                            <div className="myavana-card-header">
                                <h5 className="myavana-card-title">Hair Journey Timeline</h5>
                            </div>
                            <div className="myavana-card-body">
                                {timeline.length > 0 ? (
                                    <div className="myavana-timeline">
                                        {timeline.map((event, index) => (
                                            <div key={index} className="myavana-timeline-item">
                                                <div className="myavana-timeline-marker">
                                                    <i className={getEventIcon(event.event_type)}></i>
                                                </div>
                                                <div className="myavana-timeline-content">
                                                    <div className="myavana-timeline-header">
                                                        <h6>{event.event_title}</h6>
                                                        <span className="myavana-timeline-date">
                                                            {formatDate(event.event_date)}
                                                        </span>
                                                    </div>
                                                    <div className="myavana-timeline-details">
                                                        {event.event_detail && (
                                                            <span className="myavana-badge myavana-badge-outline-secondary me-2">
                                                                {event.event_detail}
                                                            </span>
                                                        )}
                                                        <span className="myavana-badge myavana-badge-outline-primary">
                                                            {event.event_type}
                                                        </span>
                                                    </div>
                                                    {event.event_notes && (
                                                        <p className="myavana-timeline-notes">{event.event_notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="myavana-empty-state-sm">
                                        <i className="fas fa-clock fa-2x"></i>
                                        <p>No timeline events yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MasterLayout>
    );
};

export default HairProfileDetailPage;