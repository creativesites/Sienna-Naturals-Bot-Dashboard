"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/nextjs';

const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useUser();

  // Form state for add/edit user
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  // Available roles (will be expanded later)
  const roles = [
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Team management access' },
    { value: 'user', label: 'User', description: 'Standard user access' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'warning' },
    { value: 'suspended', label: 'Suspended', color: 'danger' }
  ];

  // Fetch team users from Clerk API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Error loading team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submission for add/edit user
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser 
        ? `/api/team/users/${editingUser.id}` 
        : '/api/team/users';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        const message = editingUser ? 'Team member updated successfully' : 'Team member invited successfully';
        toast.success(message);
        resetForm();
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save team member');
      }
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Error saving team member');
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      status: 'active'
    });
    setEditingUser(null);
    setShowAddUser(false);
  };

  // Edit user
  const handleEdit = (user) => {
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setEditingUser(user);
    setShowAddUser(true);
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (userId === currentUser?.id) {
      toast.error('Cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to remove this team member? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/team/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Team member removed successfully');
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Error removing team member');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const roleColors = {
      admin: 'danger',
      manager: 'warning',
      user: 'primary',
      viewer: 'secondary'
    };
    return roleColors[role] || 'secondary';
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const statusColors = {
      active: 'success',
      inactive: 'warning',
      suspended: 'danger'
    };
    return statusColors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="myavana-card">
        <div className="myavana-card-body">
          <div className="myavana-loading-section">
            <div className="myavana-spinner"></div>
            <p>Loading team members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-management-container">
      {/* Team Overview Card */}
      <div className="myavana-card mb-4">
        <div className="myavana-card-header">
          <h3 className="myavana-card-title">
            <Icon icon="solar:users-group-rounded-outline" />
            Team Management
          </h3>
          <div className="card-actions">
            <button 
              className="myavana-btn-primary"
              onClick={() => setShowAddUser(true)}
            >
              <Icon icon="solar:user-plus-outline" />
              Add Team Member
            </button>
          </div>
        </div>
        
        <div className="myavana-card-body">
          {/* Team Stats */}
          <div className="team-stats-grid">
            <div className="team-stat-card">
              <div className="stat-icon">
                <Icon icon="solar:users-group-rounded-outline" />
              </div>
              <div className="stat-content">
                <h4>{users.length}</h4>
                <p>Total Members</p>
              </div>
            </div>
            <div className="team-stat-card">
              <div className="stat-icon active">
                <Icon icon="solar:user-check-outline" />
              </div>
              <div className="stat-content">
                <h4>{users.filter(u => u.status === 'active').length}</h4>
                <p>Active Members</p>
              </div>
            </div>
            <div className="team-stat-card">
              <div className="stat-icon admin">
                <Icon icon="solar:shield-user-outline" />
              </div>
              <div className="stat-content">
                <h4>{users.filter(u => u.role === 'admin').length}</h4>
                <p>Administrators</p>
              </div>
            </div>
            <div className="team-stat-card">
              <div className="stat-icon recent">
                <Icon icon="solar:calendar-add-outline" />
              </div>
              <div className="stat-content">
                <h4>{users.filter(u => {
                  const created = new Date(u.created_at);
                  const week = new Date();
                  week.setDate(week.getDate() - 7);
                  return created > week;
                }).length}</h4>
                <p>New This Week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Card */}
      <div className="myavana-card">
        <div className="myavana-card-header">
          <h3 className="myavana-card-title">
            <Icon icon="solar:user-id-outline" />
            Team Members
          </h3>
          <div className="card-actions">
            <div className="search-box">
              <Icon icon="solar:magnifer-outline" className="search-icon" />
              <input
                type="text"
                placeholder="Search members..."
                className="myavana-form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="myavana-card-body p-0">
          {filteredUsers.length === 0 ? (
            <div className="myavana-empty-state">
              <Icon icon="solar:users-group-rounded-outline" className="empty-icon" />
              <h4>No team members found</h4>
              <p>Start by adding your first team member</p>
              <button 
                className="myavana-btn-primary"
                onClick={() => setShowAddUser(true)}
              >
                <Icon icon="solar:user-plus-outline" />
                Add Team Member
              </button>
            </div>
          ) : (
            <div className="myavana-table-container">
              <table className="myavana-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.imageUrl ? (
                              <img src={user.imageUrl} alt={user.fullName} className="avatar-image" />
                            ) : (
                              user.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="user-details">
                            <span className="user-name">
                              {user.fullName || 'Unnamed User'}
                              {user.id === currentUser?.id && (
                                <small className="current-user-indicator">(You)</small>
                              )}
                            </span>
                            <span className="user-id">
                              ID: {user.id.slice(0, 8)}...
                              {user.username && ` • @${user.username}`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="user-email">
                          {user.email || <em>No email provided</em>}
                        </span>
                      </td>
                      <td>
                        <span className={`myavana-badge badge-${getRoleBadgeColor(user.role)}`}>
                          {roles.find(r => r.value === user.role)?.label || user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`myavana-badge badge-${getStatusBadgeColor(user.status)}`}>
                          {statuses.find(s => s.value === user.status)?.label || user.status}
                        </span>
                      </td>
                      <td>
                        <div className="join-info">
                          <span className="join-date">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          {user.lastSignInAt && (
                            <span className="last-sign-in">
                              Last active: {new Date(user.lastSignInAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="myavana-btn-sm myavana-btn-outline-primary"
                            onClick={() => handleEdit(user)}
                            title="Edit team member"
                            disabled={user.id === currentUser?.id && user.role === 'admin'}
                          >
                            <Icon icon="solar:pen-outline" />
                          </button>
                          <button
                            className="myavana-btn-sm myavana-btn-outline-danger"
                            onClick={() => handleDelete(user.id)}
                            title="Remove team member"
                            disabled={user.id === currentUser?.id}
                          >
                            <Icon icon="solar:trash-bin-trash-outline" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="myavana-modal-overlay">
          <div className="myavana-modal">
            <div className="myavana-modal-header">
              <h4 className="myavana-modal-title">
                <Icon icon={editingUser ? "solar:pen-outline" : "solar:user-plus-outline"} />
                {editingUser ? 'Edit Team Member' : 'Add Team Member'}
              </h4>
              <button 
                className="myavana-modal-close"
                onClick={resetForm}
              >
                <Icon icon="solar:close-circle-outline" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="myavana-modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="myavana-form-group">
                      <label className="myavana-form-label">
                        <Icon icon="solar:user-outline" />
                        First Name
                      </label>
                      <input
                        type="text"
                        className="myavana-form-control"
                        value={userForm.firstName}
                        onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="myavana-form-group">
                      <label className="myavana-form-label">
                        <Icon icon="solar:user-outline" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="myavana-form-control"
                        value={userForm.lastName}
                        onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="myavana-form-group">
                  <label className="myavana-form-label">
                    <Icon icon="solar:letter-outline" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="myavana-form-control"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                    disabled={editingUser} // Can't change email in Clerk after creation
                  />
                  {editingUser && (
                    <div className="myavana-form-help">
                      <Icon icon="solar:info-circle-outline" />
                      Email cannot be changed for existing users
                    </div>
                  )}
                </div>

                <div className="myavana-form-group">
                  <label className="myavana-form-label">
                    <Icon icon="solar:shield-user-outline" />
                    Role
                  </label>
                  <select
                    className="myavana-form-control"
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                {editingUser && (
                  <div className="myavana-form-group">
                    <label className="myavana-form-label">
                      <Icon icon="solar:check-circle-outline" />
                      Status
                    </label>
                    <select
                      className="myavana-form-control"
                      value={userForm.status}
                      onChange={(e) => setUserForm({...userForm, status: e.target.value})}
                      disabled={editingUser?.id === currentUser?.id}
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    {editingUser?.id === currentUser?.id && (
                      <div className="myavana-form-help">
                        <Icon icon="solar:info-circle-outline" />
                        You cannot change your own status
                      </div>
                    )}
                  </div>
                )}

                {!editingUser && (
                  <div className="myavana-form-help">
                    <Icon icon="solar:info-circle-outline" />
                    An invitation email will be sent to the provided email address. The user will need to accept the invitation to join the team.
                  </div>
                )}
              </div>

              <div className="myavana-modal-footer">
                <button
                  type="button"
                  className="myavana-btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="myavana-btn-primary"
                >
                  <Icon icon={editingUser ? "solar:check-circle-outline" : "solar:letter-outline"} />
                  {editingUser ? 'Update Member' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;