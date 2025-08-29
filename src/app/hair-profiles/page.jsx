'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import MasterLayout from "@/masterLayout/MasterLayout";

const HairProfilesPage = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [hairTypeFilter, setHairTypeFilter] = useState('');
    const [hairTextureFilter, setHairTextureFilter] = useState('');
    const [statistics, setStatistics] = useState({});
    const [total, setTotal] = useState(0);

    const limit = 12;

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search: search.trim(),
                page: currentPage.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder,
                hairType: hairTypeFilter,
                hairTexture: hairTextureFilter
            });

            const response = await fetch(`/api/hair-profiles?${params}`);
            const data = await response.json();

            if (response.ok) {
                setProfiles(data.profiles || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total || 0);
                setStatistics(data.statistics || {});
            } else {
                throw new Error(data.error || 'Failed to fetch hair profiles');
            }
        } catch (error) {
            console.error('Error fetching hair profiles:', error);
            toast.error('Failed to load hair profiles');
        } finally {
            setLoading(false);
        }
    }, [search, currentPage, sortBy, sortOrder, hairTypeFilter, hairTextureFilter]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchProfiles();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [fetchProfiles]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

    const getHairTypeColor = (hairType) => {
        const colors = {
            'Straight': 'primary',
            'Wavy': 'secondary', 
            'Curly': 'coral',
            'Coily': 'sand'
        };
        return colors[hairType] || 'stone';
    };

    const clearFilters = () => {
        setSearch('');
        setHairTypeFilter('');
        setHairTextureFilter('');
        setCurrentPage(1);
    };

    return (
        <MasterLayout>
            <div className="myavana-dashboard-container">
                {/* Header Section */}
                <div className="myavana-page-header">
                    <div className="myavana-breadcrumb">
                        <Link href="/" className="myavana-breadcrumb-link">Dashboard</Link>
                        <span className="myavana-breadcrumb-separator">/</span>
                        <span className="myavana-breadcrumb-current">Hair Profiles</span>
                    </div>
                    
                    <div className="myavana-page-title-section">
                        <h1 className="myavana-page-title">
                            Hair Profiles
                            <span className="myavana-badge myavana-badge-primary ms-3">
                                {total.toLocaleString()} profiles
                            </span>
                        </h1>
                        <p className="myavana-page-subtitle">
                            Comprehensive hair health analysis and user profiles
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                {statistics.total_profiles && (
                    <div className="row g-4 mb-4">
                        <div className="col-lg-3 col-md-6">
                            <div className="myavana-card myavana-card-stats">
                                <div className="myavana-card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="myavana-stats-icon myavana-bg-primary">
                                            <i className="fas fa-users"></i>
                                        </div>
                                        <div className="ms-3">
                                            <h3 className="myavana-stats-number">
                                                {statistics.total_profiles?.toLocaleString() || 0}
                                            </h3>
                                            <p className="myavana-stats-label">Total Profiles</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-lg-3 col-md-6">
                            <div className="myavana-card myavana-card-stats">
                                <div className="myavana-card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="myavana-stats-icon myavana-bg-secondary">
                                            <i className="fas fa-cut"></i>
                                        </div>
                                        <div className="ms-3">
                                            <h3 className="myavana-stats-number">
                                                {statistics.unique_hair_types || 0}
                                            </h3>
                                            <p className="myavana-stats-label">Hair Types</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-lg-3 col-md-6">
                            <div className="myavana-card myavana-card-stats">
                                <div className="myavana-card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="myavana-stats-icon myavana-bg-coral">
                                            <i className="fas fa-heart"></i>
                                        </div>
                                        <div className="ms-3">
                                            <h3 className="myavana-stats-number">
                                                {statistics.avg_hair_health_score || 0}%
                                            </h3>
                                            <p className="myavana-stats-label">Avg Health Score</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-lg-3 col-md-6">
                            <div className="myavana-card myavana-card-stats">
                                <div className="myavana-card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="myavana-stats-icon myavana-bg-sand">
                                            <i className="fas fa-palette"></i>
                                        </div>
                                        <div className="ms-3">
                                            <h3 className="myavana-stats-number">
                                                {statistics.unique_hair_textures || 0}
                                            </h3>
                                            <p className="myavana-stats-label">Hair Textures</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls Section */}
                <div className="myavana-controls-section">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="myavana-search-container">
                                <i className="fas fa-search myavana-search-icon"></i>
                                <input
                                    type="text"
                                    className="myavana-search-input"
                                    placeholder="Search profiles by name, email, or hair type..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="col-md-2">
                            <select
                                className="myavana-select"
                                value={hairTypeFilter}
                                onChange={(e) => {
                                    setHairTypeFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Hair Types</option>
                                <option value="Straight">Straight</option>
                                <option value="Wavy">Wavy</option>
                                <option value="Curly">Curly</option>
                                <option value="Coily">Coily</option>
                            </select>
                        </div>
                        
                        <div className="col-md-2">
                            <select
                                className="myavana-select"
                                value={hairTextureFilter}
                                onChange={(e) => {
                                    setHairTextureFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Textures</option>
                                <option value="Fine">Fine</option>
                                <option value="Medium">Medium</option>
                                <option value="Coarse">Coarse</option>
                            </select>
                        </div>
                        
                        <div className="col-md-2">
                            <select
                                className="myavana-select"
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                            >
                                <option value="created_at-desc">Newest First</option>
                                <option value="created_at-asc">Oldest First</option>
                                <option value="name-asc">Name A-Z</option>
                                <option value="hair_health_score-desc">Health Score ↓</option>
                                <option value="total_issues-desc">Most Issues</option>
                                <option value="total_conversations-desc">Most Active</option>
                            </select>
                        </div>
                        
                        <div className="col-md-2">
                            <button
                                className="myavana-btn myavana-btn-outline-secondary w-100"
                                onClick={clearFilters}
                            >
                                <i className="fas fa-times me-1"></i> Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="myavana-loading-section">
                        <div className="text-center py-5">
                            <div className="myavana-spinner"></div>
                            <p className="myavana-loading-text mt-3">Loading hair profiles...</p>
                        </div>
                    </div>
                )}

                {/* Profiles Grid */}
                {!loading && (
                    <>
                        <div className="row g-4">
                            {profiles.map((profile) => (
                                <div key={profile.user_id} className="col-xl-4 col-lg-6">
                                    <div className="myavana-card myavana-card-hover myavana-card-hair-profile">
                                        <div className="myavana-card-body">
                                            {/* Profile Header */}
                                            <div className="myavana-profile-header">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="myavana-avatar myavana-avatar-md me-3">
                                                        {getUserInitials(profile.name)}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h5 className="myavana-card-title mb-1">
                                                            {profile.name || 'Unknown User'}
                                                        </h5>
                                                        <p className="myavana-text-muted small mb-0">
                                                            {profile.email}
                                                        </p>
                                                    </div>
                                                    <div className="myavana-health-score">
                                                        <div className={`myavana-score-circle myavana-score-${getHealthScoreColor(profile.hair_health_score)}`}>
                                                            {profile.hair_health_score}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hair Type & Texture */}
                                            <div className="myavana-hair-details mb-3">
                                                <div className="d-flex gap-2 mb-2">
                                                    {profile.hair_type && (
                                                        <span className={`myavana-badge myavana-badge-${getHairTypeColor(profile.hair_type)}`}>
                                                            {profile.hair_type}
                                                        </span>
                                                    )}
                                                    {profile.hair_texture && (
                                                        <span className="myavana-badge myavana-badge-outline-primary">
                                                            {profile.hair_texture}
                                                        </span>
                                                    )}
                                                    {profile.hair_color && (
                                                        <span className="myavana-badge myavana-badge-outline-secondary">
                                                            {profile.hair_color}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {profile.scalp_condition && (
                                                    <div className="myavana-scalp-condition">
                                                        <small className="myavana-text-muted">
                                                            <i className="fas fa-info-circle me-1"></i>
                                                            Scalp: {profile.scalp_condition}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hair Issues Preview */}
                                            {profile.common_issues && profile.common_issues.length > 0 && (
                                                <div className="myavana-issues-preview mb-3">
                                                    <div className="myavana-section-label">Common Issues</div>
                                                    <div className="myavana-issues-tags">
                                                        {profile.common_issues.slice(0, 2).map((issue, index) => (
                                                            <span key={index} className="myavana-issue-tag">
                                                                {issue}
                                                            </span>
                                                        ))}
                                                        {profile.common_issues.length > 2 && (
                                                            <span className="myavana-issue-tag myavana-issue-tag-more">
                                                                +{profile.common_issues.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Profile Metrics */}
                                            <div className="myavana-profile-metrics mb-3">
                                                <div className="row text-center">
                                                    <div className="col-4">
                                                        <div className="myavana-metric-value">
                                                            {profile.total_issues || 0}
                                                        </div>
                                                        <div className="myavana-metric-label">Issues</div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="myavana-metric-value">
                                                            {profile.total_conversations || 0}
                                                        </div>
                                                        <div className="myavana-metric-label">Chats</div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="myavana-metric-value">
                                                            {profile.total_recommendations || 0}
                                                        </div>
                                                        <div className="myavana-metric-label">Products</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="d-flex gap-2">
                                                <Link
                                                    href={`/hair-profiles/${profile.user_id}`}
                                                    className="myavana-btn myavana-btn-primary myavana-btn-sm flex-fill"
                                                >
                                                    <i className="fas fa-microscope me-1"></i>
                                                    View Profile
                                                </Link>
                                                <Link
                                                    href={`/users/${profile.user_id}`}
                                                    className="myavana-btn myavana-btn-outline-secondary myavana-btn-sm"
                                                    title="User Details"
                                                >
                                                    <i className="fas fa-user"></i>
                                                </Link>
                                            </div>

                                            {/* Profile Footer */}
                                            <div className="myavana-card-footer">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="myavana-text-muted">
                                                        Created {formatDate(profile.created_at)}
                                                    </small>
                                                    {profile.last_issue_reported && (
                                                        <small className="myavana-text-warning">
                                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                                            Recent issue
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {profiles.length === 0 && (
                            <div className="myavana-empty-state">
                                <div className="myavana-empty-icon">
                                    <i className="fas fa-cut fa-3x"></i>
                                </div>
                                <h3 className="myavana-empty-title">No Hair Profiles Found</h3>
                                <p className="myavana-empty-description">
                                    {search || hairTypeFilter || hairTextureFilter 
                                        ? 'Try adjusting your search criteria or filters' 
                                        : 'No hair profiles have been created yet'
                                    }
                                </p>
                                {(search || hairTypeFilter || hairTextureFilter) && (
                                    <button
                                        className="myavana-btn myavana-btn-outline-primary"
                                        onClick={clearFilters}
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="myavana-pagination-container">
                                <nav aria-label="Hair profiles pagination">
                                    <ul className="myavana-pagination">
                                        <li className={`myavana-page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="myavana-page-link"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                        </li>
                                        
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <li key={pageNum} className={`myavana-page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                    <button
                                                        className="myavana-page-link"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        
                                        <li className={`myavana-page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="myavana-page-link"
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                                
                                <div className="myavana-pagination-info">
                                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} profiles
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </MasterLayout>
    );
};

export default HairProfilesPage;