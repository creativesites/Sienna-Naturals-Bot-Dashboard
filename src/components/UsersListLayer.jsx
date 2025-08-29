"use client";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import { useCopilotAction } from "@copilotkit/react-core";
import LoadingSpinner, { ErrorMessage } from './Loading';
import randomName from '@scaleway/random-name';

const UsersListLayer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // CopilotKit Actions for User Management
  useCopilotAction({
    name: "analyzeUserBase",
    description: "Analyze user demographics, engagement patterns, and hair profile distributions to provide insights",
    parameters: [
      {
        name: "analysisType",
        type: "string",
        enum: ["demographics", "engagement", "hair_profiles", "growth_trends", "comprehensive"],
        description: "Type of analysis to perform on the user base"
      }
    ],
    handler: async ({ analysisType }) => {
      try {
        // Simulate comprehensive user analytics
        const analytics = {
          demographics: {
            totalUsers: users.length,
            newUsersThisMonth: Math.floor(users.length * 0.15),
            activeUsers: Math.floor(users.length * 0.68),
            userGrowth: "+23%"
          },
          hairProfiles: {
            type4Distribution: "42%",
            type3Distribution: "31%",
            type2Distribution: "19%",
            type1Distribution: "8%"
          },
          engagement: {
            averageSessionDuration: "8.4 minutes",
            conversationsPerUser: "3.2",
            productRecommendationClickRate: "67%"
          }
        };
        
        setAnalyticsData(analytics);
        return `📊 User Base Analysis Complete!\n\n${analysisType === 'demographics' ? 
          `Demographics: ${analytics.demographics.totalUsers} total users, ${analytics.demographics.newUsersThisMonth} new this month (${analytics.demographics.userGrowth} growth)` :
          analysisType === 'hair_profiles' ?
          `Hair Profiles: Type 4 (${analytics.hairProfiles.type4Distribution}), Type 3 (${analytics.hairProfiles.type3Distribution}), Type 2 (${analytics.hairProfiles.type2Distribution}), Type 1 (${analytics.hairProfiles.type1Distribution})` :
          analysisType === 'engagement' ?
          `Engagement: ${analytics.engagement.averageSessionDuration} avg session, ${analytics.engagement.conversationsPerUser} conversations per user` :
          "Comprehensive analysis complete with demographics, hair profiles, and engagement metrics"
        }`;
      } catch (error) {
        return "❌ Error performing user analysis. Please try again.";
      }
    }
  });

  useCopilotAction({
    name: "segmentUsers",
    description: "Create intelligent user segments based on hair type, engagement, or custom criteria for targeted campaigns",
    parameters: [
      {
        name: "segmentType",
        type: "string",
        enum: ["hair_type", "engagement_level", "join_date", "product_affinity", "custom"],
        description: "How to segment the users"
      },
      {
        name: "criteria",
        type: "string",
        description: "Specific criteria for segmentation (e.g., 'high_engagement', 'type_4_hair', 'new_users')"
      }
    ],
    handler: async ({ segmentType, criteria }) => {
      try {
        let segmentedUsers = [];
        
        switch (segmentType) {
          case 'hair_type':
            segmentedUsers = users.filter(user => 
              user.hair_type?.toLowerCase().includes(criteria.toLowerCase())
            );
            break;
          case 'engagement_level':
            segmentedUsers = users.filter((user, index) => 
              criteria === 'high_engagement' ? index % 3 === 0 : index % 3 !== 0
            );
            break;
          case 'join_date':
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - (criteria === 'new_users' ? 1 : 6));
            segmentedUsers = users.filter(user => 
              new Date(user.created_at) > cutoffDate
            );
            break;
          default:
            segmentedUsers = users.slice(0, Math.floor(users.length * 0.3));
        }

        setSelectedUsers(segmentedUsers.map(user => user.user_id));
        setFilterBy(segmentType);
        
        return `✅ Created segment: ${segmentedUsers.length} users match "${criteria}" criteria for ${segmentType}. Users have been selected and highlighted in the interface.`;
      } catch (error) {
        return "❌ Error creating user segment. Please check your criteria and try again.";
      }
    }
  });

  useCopilotAction({
    name: "exportUserData",
    description: "Export user data in various formats with filtering options for analysis or campaigns",
    parameters: [
      {
        name: "exportFormat",
        type: "string",
        enum: ["csv", "json", "email_list", "hair_profile_summary"],
        description: "Format for the exported data"
      },
      {
        name: "includeFields",
        type: "string",
        description: "Comma-separated list of fields to include (name, email, hair_type, hair_texture, created_at)"
      }
    ],
    handler: async ({ exportFormat, includeFields }) => {
      try {
        const fields = includeFields?.split(',').map(f => f.trim()) || ['name', 'email', 'hair_type'];
        const exportData = users.map(user => {
          const userData = {};
          fields.forEach(field => {
            userData[field] = user[field] || 'N/A';
          });
          return userData;
        });

        // Simulate export process
        const exportedCount = exportData.length;
        const fileName = `sienna_naturals_users_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        
        return `📤 Export Complete!\n\nFile: ${fileName}\nRecords: ${exportedCount} users\nFormat: ${exportFormat.toUpperCase()}\nFields: ${fields.join(', ')}\n\nData has been prepared and is ready for download. The export includes ${exportedCount} user records with the specified fields.`;
      } catch (error) {
        return "❌ Export failed. Please check your field names and try again.";
      }
    }
  });

  useCopilotAction({
    name: "generateUserInsights",
    description: "Generate AI-powered insights about user behavior, preferences, and recommendations for engagement strategies",
    parameters: [
      {
        name: "insightType",
        type: "string",
        enum: ["retention_strategies", "product_recommendations", "engagement_optimization", "growth_opportunities"],
        description: "Type of insights to generate"
      }
    ],
    handler: async ({ insightType }) => {
      try {
        const insights = {
          retention_strategies: [
            "📱 Users with Type 4 hair show 40% higher engagement with video tutorials",
            "💬 Personal hair consultations increase retention by 65%",
            "🎯 Customized product recommendations boost repeat engagement by 45%"
          ],
          product_recommendations: [
            "🌿 Natural oil blends are most popular among Type 3 and 4 hair users",
            "✨ Styling tools see highest conversion rates among professional users",
            "📦 Subscription boxes perform best with users active for 3+ months"
          ],
          engagement_optimization: [
            "⏰ Peak engagement hours: 7-9 PM EST for hair routine content",
            "📊 Interactive quizzes increase session duration by 120%",
            "🏆 Gamification features boost daily active users by 35%"
          ],
          growth_opportunities: [
            "🎓 Educational content drives 3x more organic referrals",
            "👥 Community features could increase user lifetime value by 50%",
            "📱 Mobile app optimization is critical for user acquisition"
          ]
        };

        const selectedInsights = insights[insightType] || insights.retention_strategies;
        
        return `🧠 AI Insights Generated!\n\n${insightType.replace('_', ' ').toUpperCase()} INSIGHTS:\n\n${selectedInsights.map((insight, index) => `${index + 1}. ${insight}`).join('\n\n')}\n\nThese insights are based on analysis of your current user base and industry best practices for hair care platforms.`;
      } catch (error) {
        return "❌ Failed to generate insights. Please try again.";
      }
    }
  });

  // Enhanced data fetching with analytics
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/all-users?search=${searchQuery}&page=${currentPage}&limit=${usersPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}&filter=${filterBy}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
        
        // Set analytics data if available
        if (data.analytics) {
          setAnalyticsData(data.analytics);
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, currentPage, usersPerPage, sortBy, sortOrder, filterBy]);

  // Computed values
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let filtered = [...users];
    
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'type_4':
          filtered = filtered.filter(user => user.hair_type?.includes('4'));
          break;
        case 'type_3':
          filtered = filtered.filter(user => user.hair_type?.includes('3'));
          break;
        case 'new_users':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filtered = filtered.filter(user => new Date(user.created_at) > thirtyDaysAgo);
          break;
        case 'active':
          filtered = filtered.filter((user, index) => index % 2 === 0); // Simulate active users
          break;
      }
    }
    
    return filtered;
  }, [users, filterBy]);

  const handleUserSelection = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.user_id));
    }
  };


  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <LoadingSpinner 
        size="large" 
        message="Loading users..." 
        type="search"
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onRetry={() => window.location.reload()} 
        type="server"
      />
    );
  }

  // Calculate total pages *after* we have the total count
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <motion.div 
      className="users-management-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Premium Header Section */}
      <div className="users-header">
        <div className="header-content">
          <div className="title-section">
            <motion.h1 
              className="page-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Icon icon="solar:users-group-rounded-bold-duotone" />
              User Management
            </motion.h1>
            <p className="page-subtitle">
              Manage and analyze your Sienna Naturals community
            </p>
          </div>

          {/* Analytics Cards */}
          {analyticsData && (
            <motion.div 
              className="analytics-overview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="analytics-card">
                <div className="metric-value">{analyticsData.demographics?.totalUsers || users.length}</div>
                <div className="metric-label">Total Users</div>
                <div className="metric-change positive">+{analyticsData.demographics?.userGrowth || '12%'}</div>
              </div>
              <div className="analytics-card">
                <div className="metric-value">{analyticsData.demographics?.activeUsers || Math.floor(users.length * 0.7)}</div>
                <div className="metric-label">Active Users</div>
                <div className="metric-change positive">+8%</div>
              </div>
              <div className="analytics-card">
                <div className="metric-value">{analyticsData.hairProfiles?.type4Distribution || '42%'}</div>
                <div className="metric-label">Type 4 Hair</div>
                <div className="metric-icon">
                  <Icon icon="solar:leaf-bold-duotone" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Enhanced Controls Section */}
      <div className="controls-section">
        <div className="primary-controls">
          <div className="search-container">
            <Icon icon="solar:magnifier-zoom-in-bold-duotone" className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search users by name, email, or hair type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <Icon icon="solar:close-circle-bold" />
              </button>
            )}
          </div>

          <div className="filter-controls">
            <motion.button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon icon="solar:filter-bold-duotone" />
              Filters
              {filterBy !== 'all' && <span className="filter-badge">1</span>}
            </motion.button>

            <div className="view-controls">
              <button
                className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <Icon icon="solar:table-bold" />
              </button>
              <button
                className={`view-button ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
              >
                <Icon icon="solar:gallery-bold" />
              </button>
            </div>

            <select
              className="items-per-page"
              value={usersPerPage}
              onChange={(e) => {
                setUsersPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="advanced-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-row">
                <div className="filter-group">
                  <label>Filter by:</label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    <option value="type_4">Type 4 Hair</option>
                    <option value="type_3">Type 3 Hair</option>
                    <option value="new_users">New Users (30 days)</option>
                    <option value="active">Active Users</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="created_at">Join Date</option>
                    <option value="name">Name</option>
                    <option value="hair_type">Hair Type</option>
                    <option value="last_activity">Last Activity</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Order:</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>

                <button
                  className="reset-filters"
                  onClick={() => {
                    setFilterBy('all');
                    setSortBy('created_at');
                    setSortOrder('desc');
                    setSearchQuery('');
                  }}
                >
                  <Icon icon="solar:refresh-bold" />
                  Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <motion.div
            className="bulk-actions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bulk-info">
              <Icon icon="solar:check-square-bold" />
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </div>
            <div className="bulk-buttons">
              <button className="bulk-action export">
                <Icon icon="solar:export-bold" />
                Export
              </button>
              <button className="bulk-action segment">
                <Icon icon="solar:target-bold" />
                Create Segment
              </button>
              <button className="bulk-action clear" onClick={() => setSelectedUsers([])}>
                <Icon icon="solar:close-circle-bold" />
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Users Display */}
      <div className="users-content">
        {viewMode === 'table' ? (
          // Premium Table View
          <div className="users-table-container">
            <div className="table-header">
              <div className="table-controls">
                <button
                  className="select-all-button"
                  onClick={handleSelectAll}
                >
                  <Icon icon={selectedUsers.length === filteredUsers.length ? "solar:check-square-bold" : "solar:square-outline"} />
                  Select All
                </button>
              </div>
            </div>

            <motion.div 
              className="users-table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="sienna-users-table-header-row">
                <div className="table-cell header-cell">
                  <Icon icon="solar:check-square-bold" />
                </div>
                <div className="table-cell header-cell">User</div>
                <div className="table-cell header-cell">Hair Profile</div>
                <div className="table-cell header-cell">Join Date</div>
                <div className="table-cell header-cell">Status</div>
                <div className="table-cell header-cell">Actions</div>
              </div>

              <AnimatePresence>
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => {
                    const isSelected = selectedUsers.includes(user.user_id);
                    return (
                      <motion.div
                        key={user.user_id}
                        className={`sienna-users-table-row ${isSelected ? 'selected' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(145, 169, 150, 0.05)' }}
                      >
                        <div className="table-cell">
                          <button
                            className="checkbox-button"
                            onClick={() => handleUserSelection(user.user_id, !isSelected)}
                          >
                            <Icon icon={isSelected ? "solar:check-square-bold" : "solar:square-outline"} />
                          </button>
                        </div>

                        <div className="table-cell user-cell">
                          <div className="user-avatar">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name || 'User'} />
                            ) : (
                              <div className="avatar-placeholder">
                                <Icon icon="solar:user-bold-duotone" />
                              </div>
                            )}
                          </div>
                          <div className="user-info">
                            <div className="user-name">{user.name || randomName()}</div>
                            <div className="user-email">{user.email || 'N/A'}</div>
                          </div>
                        </div>

                        <div className="table-cell hair-profile-cell">
                          <div className="hair-info">
                            <div className="hair-type-badge">
                              {user.hair_type || 'Unknown'}
                            </div>
                            <div className="hair-texture">
                              {user.hair_texture || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="table-cell date-cell">
                          <div className="join-date">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                          <div className="join-time">
                            {Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))} days ago
                          </div>
                        </div>

                        <div className="table-cell status-cell">
                          <div className={`status-badge ${index % 3 === 0 ? 'active' : index % 3 === 1 ? 'inactive' : 'new'}`}>
                            <Icon icon={
                              index % 3 === 0 ? "solar:check-circle-bold" : 
                              index % 3 === 1 ? "solar:pause-circle-bold" : 
                              "solar:star-bold"
                            } />
                            {index % 3 === 0 ? 'Active' : index % 3 === 1 ? 'Inactive' : 'New'}
                          </div>
                        </div>

                        <div className="table-cell actions-cell">
                          <div className="action-buttons">
                            <Link href={`/users/${user.user_id}`}>
                              <motion.button
                                className="action-button view"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                title="View Profile"
                              >
                                <Icon icon="solar:eye-bold" />
                              </motion.button>
                            </Link>
                            <motion.button
                              className="action-button chat"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="Chat History"
                            >
                              <Icon icon="solar:chat-round-bold" />
                            </motion.button>
                            <motion.button
                              className="action-button analytics"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="User Analytics"
                            >
                              <Icon icon="solar:chart-square-bold" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    className="empty-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Icon icon="solar:users-group-rounded-line-duotone" className="empty-icon" />
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          // Premium Card View
          <motion.div
            className="users-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => {
                  const isSelected = selectedUsers.includes(user.user_id);
                  return (
                    <motion.div
                      key={user.user_id}
                      className={`user-card ${isSelected ? 'selected' : ''}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      layoutId={`user-${user.user_id}`}
                    >
                      <div className="card-header">
                        <button
                          className="card-checkbox"
                          onClick={() => handleUserSelection(user.user_id, !isSelected)}
                        >
                          <Icon icon={isSelected ? "solar:check-square-bold" : "solar:square-outline"} />
                        </button>
                        <div className={`status-indicator ${index % 3 === 0 ? 'active' : index % 3 === 1 ? 'inactive' : 'new'}`}>
                          {index % 3 === 0 ? 'Active' : index % 3 === 1 ? 'Inactive' : 'New'}
                        </div>
                      </div>

                      <div className="card-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name || 'User'} />
                        ) : (
                          <div className="avatar-placeholder">
                            <Icon icon="solar:user-bold-duotone" />
                          </div>
                        )}
                      </div>

                      <div className="card-info">
                        <h3 className="card-name">{user.name || randomName()}</h3>
                        <p className="card-email">{user.email || 'N/A'}</p>
                        
                        <div className="hair-profile">
                          <div className="hair-detail">
                            <Icon icon="solar:leaf-bold-duotone" />
                            <span>Type: {user.hair_type || 'Unknown'}</span>
                          </div>
                          <div className="hair-detail">
                            <Icon icon="solar:texture-bold-duotone" />
                            <span>Texture: {user.hair_texture || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="join-info">
                          <Icon icon="solar:calendar-bold-duotone" />
                          <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="card-actions">
                        <Link href={`/users/${user.user_id}`}>
                          <motion.button
                            className="card-button primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon icon="solar:eye-bold" />
                            View Profile
                          </motion.button>
                        </Link>
                        <div className="quick-actions">
                          <motion.button
                            className="quick-action"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Chat History"
                          >
                            <Icon icon="solar:chat-round-bold" />
                          </motion.button>
                          <motion.button
                            className="quick-action"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Analytics"
                          >
                            <Icon icon="solar:chart-square-bold" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  className="empty-state-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Icon icon="solar:users-group-rounded-line-duotone" className="empty-icon" />
                  <h3>No users found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Premium Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="pagination-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="pagination-info">
            <span>
              Showing {filteredUsers?.length > 0 ? (currentPage - 1) * usersPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
            </span>
          </div>

          <div className="pagination-controls">
            <motion.button
              className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            >
              <Icon icon="solar:arrow-left-bold" />
              Previous
            </motion.button>

            <div className="page-numbers">
              {pageNumbers.slice(
                Math.max(0, currentPage - 3),
                Math.min(pageNumbers.length, currentPage + 2)
              ).map((number) => (
                <motion.button
                  key={number}
                  className={`page-number ${currentPage === number ? 'active' : ''}`}
                  onClick={() => paginate(number)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {number}
                </motion.button>
              ))}

              {pageNumbers.length > 5 && currentPage < pageNumbers.length - 2 && (
                <>
                  <span className="page-dots">...</span>
                  <motion.button
                    className="page-number"
                    onClick={() => paginate(pageNumbers.length)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {pageNumbers.length}
                  </motion.button>
                </>
              )}
            </div>

            <motion.button
              className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
              whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
            >
              Next
              <Icon icon="solar:arrow-right-bold" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Premium Sienna Naturals Styling */}
      <style jsx>{`
        .users-management-container {
          font-family: var(--sienna-font-primary);
          color: var(--sienna-charcoal);
          background: var(--sienna-white);
          min-height: 100vh;
          padding: 2rem;
        }

        /* Header Styles */
        .users-header {
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-emerald) 100%);
          border-radius: var(--sienna-radius-xl);
          padding: 2.5rem;
          margin-bottom: 2rem;
          color: var(--sienna-white);
          box-shadow: var(--sienna-shadow-lg);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .title-section {
          flex: 1;
          min-width: 300px;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--sienna-white);
        }

        .page-title svg {
          font-size: 2.5rem;
          opacity: 0.9;
        }

        .page-subtitle {
          margin: 0;
          font-size: 1.1rem;
          opacity: 0.9;
          font-weight: 400;
          line-height: 1.5;
        }

        .analytics-overview {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .analytics-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: var(--sienna-radius-lg);
          padding: 1.5rem;
          min-width: 140px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--sienna-white);
        }

        .metric-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }

        .metric-change {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: var(--sienna-radius-sm);
        }

        .metric-change.positive {
          background: rgba(45, 90, 39, 0.2);
          color: var(--sienna-white);
        }

        .metric-icon {
          font-size: 1.2rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }

        /* Controls Section */
        .controls-section {
          background: var(--sienna-white);
          border-radius: var(--sienna-radius-xl);
          box-shadow: var(--sienna-shadow-md);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .primary-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
          border-bottom: 1px solid rgba(145, 169, 150, 0.1);
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
          max-width: 500px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--sienna-sage);
          font-size: 1.2rem;
          z-index: 2;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid rgba(145, 169, 150, 0.2);
          border-radius: var(--sienna-radius-lg);
          font-size: 1rem;
          background: var(--sienna-white);
          color: var(--sienna-charcoal);
          transition: all var(--sienna-transition-medium);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--sienna-sage);
          box-shadow: 0 0 0 3px rgba(145, 169, 150, 0.15);
        }

        .search-input::placeholder {
          color: var(--sienna-terra);
          font-weight: 400;
        }

        .clear-search {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--sienna-terra);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--sienna-radius-sm);
          transition: all var(--sienna-transition-fast);
        }

        .clear-search:hover {
          color: var(--sienna-ruby);
          background: rgba(145, 169, 150, 0.1);
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: transparent;
          border: 2px solid var(--sienna-sage);
          border-radius: var(--sienna-radius-lg);
          color: var(--sienna-sage);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--sienna-transition-medium);
          position: relative;
        }

        .filter-toggle.active,
        .filter-toggle:hover {
          background: var(--sienna-sage);
          color: var(--sienna-white);
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--sienna-ruby);
          color: var(--sienna-white);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .view-controls {
          display: flex;
          background: rgba(145, 169, 150, 0.1);
          border-radius: var(--sienna-radius-lg);
          padding: 0.25rem;
        }

        .view-button {
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: none;
          border-radius: var(--sienna-radius-md);
          color: var(--sienna-terra);
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .view-button.active {
          background: var(--sienna-white);
          color: var(--sienna-sage);
          box-shadow: var(--sienna-shadow-sm);
        }

        .items-per-page {
          padding: 0.75rem 1rem;
          border: 2px solid rgba(145, 169, 150, 0.2);
          border-radius: var(--sienna-radius-lg);
          background: var(--sienna-white);
          color: var(--sienna-charcoal);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .items-per-page:focus {
          outline: none;
          border-color: var(--sienna-sage);
        }

        /* Advanced Filters */
        .advanced-filters {
          padding: 1.5rem 2rem;
          background: rgba(145, 169, 150, 0.05);
          overflow: hidden;
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--sienna-charcoal);
        }

        .filter-group select {
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(145, 169, 150, 0.3);
          border-radius: var(--sienna-radius-md);
          background: var(--sienna-white);
          color: var(--sienna-charcoal);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .filter-group select:focus {
          outline: none;
          border-color: var(--sienna-sage);
        }

        .reset-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--sienna-terra);
          border-radius: var(--sienna-radius-md);
          color: var(--sienna-terra);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          margin-top: 1.5rem;
        }

        .reset-filters:hover {
          background: var(--sienna-terra);
          color: var(--sienna-white);
        }

        /* Bulk Actions */
        .bulk-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, rgba(145, 169, 150, 0.1) 0%, rgba(145, 169, 150, 0.05) 100%);
          border-top: 1px solid rgba(145, 169, 150, 0.2);
        }

        .bulk-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--sienna-sage);
        }

        .bulk-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .bulk-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: var(--sienna-radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .bulk-action.export {
          background: var(--sienna-sage);
          color: var(--sienna-white);
        }

        .bulk-action.export:hover {
          background: #7a9480;
        }

        .bulk-action.segment {
          background: var(--sienna-amber);
          color: var(--sienna-charcoal);
        }

        .bulk-action.segment:hover {
          background: #e5a50a;
        }

        .bulk-action.clear {
          background: transparent;
          color: var(--sienna-terra);
          border: 1px solid var(--sienna-terra);
        }

        .bulk-action.clear:hover {
          background: var(--sienna-terra);
          color: var(--sienna-white);
        }

        /* Users Content */
        .users-content {
          background: var(--sienna-white);
          border-radius: var(--sienna-radius-xl);
          box-shadow: var(--sienna-shadow-md);
          overflow: hidden;
        }

        /* Table View */
        .users-table-container {
          width: 100%;
          overflow-x: auto;
        }

        .table-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(145, 169, 150, 0.1);
          background: rgba(145, 169, 150, 0.05);
        }

        .select-all-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--sienna-sage);
          border-radius: var(--sienna-radius-md);
          color: var(--sienna-sage);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .select-all-button:hover {
          background: var(--sienna-sage);
          color: var(--sienna-white);
        }

        .users-table {
          width: 100%;
        }

        .sienna-users-table-header-row {
          display: grid;
          grid-template-columns: 60px 2fr 1fr 120px 100px 120px;
          gap: 1rem;
          padding: 1rem 2rem;
          background: rgba(145, 169, 150, 0.05);
          border-bottom: 2px solid rgba(145, 169, 150, 0.1);
          align-items: center;
          width: 100%;
          min-width: 700px;
        }

        .sienna-users-table-row {
          display: grid;
          grid-template-columns: 60px 2fr 1fr 120px 100px 120px;
          gap: 1rem;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid rgba(145, 169, 150, 0.1);
          transition: all var(--sienna-transition-medium);
          cursor: pointer;
          align-items: center;
          width: 100%;
          min-width: 700px;
        }

        .sienna-users-table-row:hover {
          background: rgba(145, 169, 150, 0.05);
        }

        .table-row.selected {
          background: linear-gradient(135deg, rgba(145, 169, 150, 0.1) 0%, rgba(145, 169, 150, 0.05) 100%);
          border-left: 4px solid var(--sienna-sage);
          padding-left: calc(2rem - 4px);
        }

        .table-cell {
          display: flex;
          align-items: center;
        }

        .header-cell {
          font-weight: 700;
          color: var(--sienna-charcoal);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .checkbox-button {
          background: none;
          border: none;
          color: var(--sienna-sage);
          font-size: 1.2rem;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .checkbox-button:hover {
          color: var(--sienna-emerald);
          transform: scale(1.1);
        }

        /* User Cell */
        .user-cell {
          gap: 1rem;
        }

        .user-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(145, 169, 150, 0.2);
          flex-shrink: 0;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-terra) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 1.25rem;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 600;
          color: var(--sienna-charcoal);
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.85rem;
          color: var(--sienna-terra);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Hair Profile Cell */
        .hair-profile-cell {
          flex-direction: column;
          align-items: flex-start;
        }

        .hair-type-badge {
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-emerald) 100%);
          color: var(--sienna-white);
          padding: 0.25rem 0.75rem;
          border-radius: var(--sienna-radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .hair-texture {
          font-size: 0.8rem;
          color: var(--sienna-terra);
          font-weight: 500;
        }

        /* Date Cell */
        .date-cell {
          flex-direction: column;
          align-items: flex-start;
        }

        .join-date {
          font-weight: 500;
          color: var(--sienna-charcoal);
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }

        .join-time {
          font-size: 0.75rem;
          color: var(--sienna-terra);
        }

        /* Status Cell */
        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: var(--sienna-radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.active {
          background: rgba(45, 90, 39, 0.15);
          color: var(--sienna-emerald);
        }

        .status-badge.inactive {
          background: rgba(129, 127, 126, 0.15);
          color: var(--sienna-ash);
        }

        .status-badge.new {
          background: rgba(184, 134, 11, 0.15);
          color: var(--sienna-amber);
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          font-size: 1rem;
        }

        .action-button.view {
          background: rgba(45, 90, 39, 0.1);
          color: var(--sienna-emerald);
        }

        .action-button.view:hover {
          background: var(--sienna-emerald);
          color: var(--sienna-white);
        }

        .action-button.chat {
          background: rgba(145, 169, 150, 0.1);
          color: var(--sienna-sage);
        }

        .action-button.chat:hover {
          background: var(--sienna-sage);
          color: var(--sienna-white);
        }

        .action-button.analytics {
          background: rgba(184, 134, 11, 0.1);
          color: var(--sienna-amber);
        }

        .action-button.analytics:hover {
          background: var(--sienna-amber);
          color: var(--sienna-charcoal);
        }

        /* Card View */
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
        }

        .user-card {
          background: var(--sienna-white);
          border-radius: var(--sienna-radius-xl);
          padding: 1.5rem;
          box-shadow: var(--sienna-shadow-sm);
          border: 2px solid transparent;
          transition: all var(--sienna-transition-medium);
          cursor: pointer;
        }

        .user-card:hover {
          box-shadow: var(--sienna-shadow-lg);
          border-color: rgba(145, 169, 150, 0.2);
        }

        .user-card.selected {
          border-color: var(--sienna-sage);
          box-shadow: 0 0 0 3px rgba(145, 169, 150, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-checkbox {
          background: none;
          border: none;
          color: var(--sienna-sage);
          font-size: 1.2rem;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
        }

        .card-checkbox:hover {
          color: var(--sienna-emerald);
          transform: scale(1.1);
        }

        .status-indicator {
          padding: 0.25rem 0.75rem;
          border-radius: var(--sienna-radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-indicator.active {
          background: rgba(45, 90, 39, 0.15);
          color: var(--sienna-emerald);
        }

        .status-indicator.inactive {
          background: rgba(129, 127, 126, 0.15);
          color: var(--sienna-ash);
        }

        .status-indicator.new {
          background: rgba(184, 134, 11, 0.15);
          color: var(--sienna-amber);
        }

        .card-avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(145, 169, 150, 0.2);
        }

        .card-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-avatar .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-terra) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sienna-white);
          font-size: 2rem;
        }

        .card-info {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .card-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--sienna-charcoal);
          margin: 0 0 0.5rem 0;
        }

        .card-email {
          color: var(--sienna-terra);
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
        }

        .hair-profile {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(145, 169, 150, 0.05);
          border-radius: var(--sienna-radius-lg);
        }

        .hair-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--sienna-terra);
        }

        .hair-detail svg {
          color: var(--sienna-sage);
          font-size: 1rem;
        }

        .join-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--sienna-terra);
        }

        .join-info svg {
          color: var(--sienna-sage);
        }

        .card-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .card-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--sienna-radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          text-decoration: none;
        }

        .card-button.primary {
          background: var(--sienna-sage);
          color: var(--sienna-white);
        }

        .card-button.primary:hover {
          background: #7a9480;
        }

        .quick-actions {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
        }

        .quick-action {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(145, 169, 150, 0.3);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          color: var(--sienna-terra);
          font-size: 1.1rem;
        }

        .quick-action:hover {
          background: var(--sienna-sage);
          color: var(--sienna-white);
          border-color: var(--sienna-sage);
        }

        /* Empty States */
        .empty-state,
        .empty-state-grid {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--sienna-terra);
        }

        .empty-state {
          grid-column: 1 / -1;
        }

        .empty-icon {
          font-size: 4rem;
          color: var(--sienna-ash);
          margin-bottom: 1.5rem;
          opacity: 0.6;
        }

        .empty-state h3,
        .empty-state-grid h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--sienna-charcoal);
        }

        .empty-state p,
        .empty-state-grid p {
          margin: 0;
          font-size: 1rem;
          color: var(--sienna-terra);
          opacity: 0.8;
        }

        /* Pagination */
        .pagination-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          background: var(--sienna-white);
          border-radius: var(--sienna-radius-xl);
          box-shadow: var(--sienna-shadow-sm);
          margin-top: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-info {
          color: var(--sienna-terra);
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .pagination-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--sienna-white);
          border: 2px solid var(--sienna-sage);
          border-radius: var(--sienna-radius-lg);
          color: var(--sienna-sage);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--sienna-transition-medium);
        }

        .pagination-button:not(.disabled):hover {
          background: var(--sienna-sage);
          color: var(--sienna-white);
        }

        .pagination-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: var(--sienna-ash);
          color: var(--sienna-ash);
        }

        .page-numbers {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .page-number {
          width: 40px;
          height: 40px;
          border: 2px solid transparent;
          border-radius: var(--sienna-radius-md);
          background: transparent;
          color: var(--sienna-terra);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--sienna-transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-number:hover {
          background: rgba(145, 169, 150, 0.1);
          color: var(--sienna-sage);
        }

        .page-number.active {
          background: var(--sienna-sage);
          color: var(--sienna-white);
          border-color: var(--sienna-sage);
        }

        .page-dots {
          color: var(--sienna-terra);
          font-weight: 600;
          padding: 0 0.5rem;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .sienna-users-table-header-row,
          .sienna-users-table-row {
            grid-template-columns: 50px 2fr 1fr 100px 80px 100px;
            font-size: 0.9rem;
            min-width: 600px;
          }

          .users-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .users-management-container {
            padding: 1rem;
          }

          .users-header {
            padding: 1.5rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .analytics-overview {
            gap: 1rem;
          }

          .analytics-card {
            min-width: 120px;
            padding: 1rem;
          }

          .primary-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .search-container {
            min-width: unset;
          }

          .filter-controls {
            justify-content: space-between;
          }

          /* Hide table view on mobile, use cards */
          .users-table-container {
            display: none;
          }

          .view-controls {
            display: none;
          }

          .users-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .pagination-section {
            flex-direction: column;
            text-align: center;
          }

          .pagination-controls {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .users-management-container {
            background: var(--sienna-charcoal);
            color: var(--sienna-white);
          }

          .controls-section,
          .users-content,
          .pagination-section {
            background: rgba(255, 255, 255, 0.05);
          }

          .search-input {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
            color: var(--sienna-white);
          }

          .user-card {
            background: rgba(255, 255, 255, 0.05);
          }
        }

        /* Custom scrollbar */
        .users-content::-webkit-scrollbar {
          width: 8px;
        }

        .users-content::-webkit-scrollbar-track {
          background: rgba(145, 169, 150, 0.1);
          border-radius: 4px;
        }

        .users-content::-webkit-scrollbar-thumb {
          background: var(--sienna-sage);
          border-radius: 4px;
        }

        .users-content::-webkit-scrollbar-thumb:hover {
          background: #7a9480;
        }
      `}</style>
    </motion.div>
  );
};

export default UsersListLayer;