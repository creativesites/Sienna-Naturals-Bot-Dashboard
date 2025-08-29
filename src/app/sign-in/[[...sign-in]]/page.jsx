"use client";
import { SignIn } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCopilotAction } from "@copilotkit/react-core";
import { motion } from "framer-motion";

export default function SiennaAdminSignIn() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState("All systems operational");
    const [dashboardMetrics, setDashboardMetrics] = useState({
        totalConversations: 0,
        activeUsers: 0,
        aiModelAccuracy: 0,
        pendingReviews: 0,
        loading: true
    });

    // Update time every minute and fetch real metrics
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        
        // Fetch real dashboard metrics
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/dashboard-metrics?timeframe=7d');
                if (response.ok) {
                    const data = await response.json();
                    setDashboardMetrics({
                        totalConversations: data.totalConversations || 0,
                        activeUsers: data.activeUsers || 0,
                        aiModelAccuracy: data.aiModelAccuracy || 0,
                        pendingReviews: Math.floor(data.totalConversations * 0.02) || 0, // 2% of conversations need review
                        loading: false
                    });
                } else {
                    // Fallback to mock data if API fails
                    setDashboardMetrics({
                        totalConversations: 1247,
                        activeUsers: 342,
                        aiModelAccuracy: 98.2,
                        pendingReviews: 34,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching metrics:', error);
                // Fallback to mock data
                setDashboardMetrics({
                    totalConversations: 1247,
                    activeUsers: 342,
                    aiModelAccuracy: 98.2,
                    pendingReviews: 34,
                    loading: false
                });
            }
        };

        fetchMetrics();
        return () => clearInterval(timer);
    }, []);

    // CopilotKit Action for Admin Assistance
    useCopilotAction({
        name: "assistWithAdminSignIn",
        description: "Helps admin users with sign-in troubleshooting",
        parameters: [
            {
                name: "issue",
                type: "string",
                description: "The sign-in issue the admin is experiencing",
            }
        ],
        handler: async ({ issue }) => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            let suggestion = "";
            switch (issue?.toLowerCase()) {
                case "forgot password":
                    suggestion = "Admin password reset available. Contact IT support or use the admin recovery link.";
                    break;
                case "access denied":
                    suggestion = "Check your admin permissions. Contact system administrator if access was recently revoked.";
                    break;
                case "two factor":
                    suggestion = "Use your admin authenticator app. Backup codes available in your admin profile.";
                    break;
                default:
                    suggestion = "Admin sign-in support available. Check credentials and contact IT if issues persist.";
            }
            
            setSystemStatus(suggestion);
            setIsLoading(false);
            return suggestion;
        },
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="admin-signin-container">
            <motion.div 
                className="signin-wrapper"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.header className="admin-header" variants={itemVariants}>
                    <div className="header-left">
                        <img
                        src='/assets/images/sienna-logo.svg'
                        alt='Sienna Naturals'
                        className='logo-icon brand-icon'
                        style={{filter: 'none', width: '180px !important'}}
                        />
                        <div className="brand-info">
                            <span className="dashboard-label">Chatbot Admin Dashboard</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="system-status">
                            <div className="status-indicator"></div>
                            <span>System Online</span>
                        </div>
                        <div className="current-time">
                            {currentTime.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                            })}
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <div className="main-grid">
                    {/* Left Side - Quick Stats */}
                    <motion.div className="stats-panel" variants={itemVariants}>
                        <div className="panel-header">
                            <Icon icon="solar:chart-2-bold-duotone" />
                            <h6>System Overview</h6>
                        </div>
                        
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">
                                    69
                                    {/* {dashboardMetrics.loading ? '—' : dashboardMetrics.totalConversations.toLocaleString()} */}
                                </div>
                                <div className="stat-label">Total Conversations</div>
                                <Icon icon="solar:chat-round-dots-bold-duotone" className="stat-icon" />
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">
                                    64
                                    {/* {dashboardMetrics.loading ? '—' : `${dashboardMetrics.aiModelAccuracy.toFixed(1)}%`} */}
                                </div>
                                <div className="stat-label">AI Accuracy</div>
                                <Icon icon="solar:target-bold-duotone" className="stat-icon" />
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">
                                    {dashboardMetrics.loading ? '—' : dashboardMetrics.pendingReviews.toLocaleString()}
                                </div>
                                <div className="stat-label">Pending Reviews</div>
                                <Icon icon="solar:clipboard-check-bold-duotone" className="stat-icon" />
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">
                                    17
                                    {/* {dashboardMetrics.loading ? '—' : dashboardMetrics.activeUsers.toLocaleString()} */}
                                </div>
                                <div className="stat-label">Active Users</div>
                                <Icon icon="solar:users-group-rounded-bold-duotone" className="stat-icon" />
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="status-panel">
                            <div className="status-header">
                                <Icon icon="solar:server-bold-duotone" />
                                <span>System Status</span>
                            </div>
                            <div className="status-message">
                                {isLoading ? (
                                    <div className="loading-status">
                                        <Icon icon="solar:loading-bold" className="loading-spin" />
                                        <span>Checking status...</span>
                                    </div>
                                ) : (
                                    <span>{systemStatus}</span>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side - Sign In Form */}
                    <motion.div className="signin-panel" variants={itemVariants}>
                        <div className="signin-card">
                            <div className="card-header">
                                <Icon icon="solar:shield-user-bold-duotone" className="signin-icon" />
                                <div>
                                    <h6 className="signin-title">Admin Access</h6>
                                    <p className="signin-subtitle">Sign in to manage your chatbot</p>
                                </div>
                            </div>

                            {/* AI Assistant Widget */}
                            <motion.div className="admin-assistant" variants={itemVariants}>
                                <div className="assistant-header">
                                    <Icon icon="solar:robot-bold-duotone" />
                                    <span>Admin Assistant</span>
                                    <div className="online-badge">Online</div>
                                </div>
                                <p className="assistant-text">
                                    Need help accessing the admin panel? I can assist with login issues and system status.
                                </p>
                            </motion.div>

                            {/* Clerk Sign In */}
                            <div className="clerk-container">
                                <SignIn 
                                    appearance={{
                                        elements: {
                                            rootBox: "admin-clerk-root",
                                            card: "admin-clerk-card",
                                            headerTitle: "admin-clerk-title",
                                            headerSubtitle: "admin-clerk-subtitle",
                                            socialButtons: "admin-clerk-social",
                                            formButtonPrimary: "admin-btn-primary",
                                            formFieldInput: "admin-form-input",
                                            formFieldLabel: "admin-form-label",
                                            footerAction: "admin-clerk-footer"
                                        },
                                        variables: {
                                            colorPrimary: "#91A996",
                                            colorText: "#131A19",
                                            colorTextSecondary: "#817F7E",
                                            colorBackground: "#FFFFFF",
                                            colorInputBackground: "#FFFFFF",
                                            colorInputText: "#131A19",
                                            borderRadius: "8px",
                                            fontFamily: "'Inter', sans-serif"
                                        }
                                    }}
                                />
                            </div>

                            <div className="signin-footer">
                                <div className="footer-item">
                                    <Icon icon="solar:question-circle-bold-duotone" />
                                    <span>Need admin support? Contact IT team</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <style jsx global>{`
                .admin-signin-container {
                    height: 100vh;
                    background: linear-gradient(135deg, #f8f6f4 0%, #f5f3f0 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .signin-wrapper {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    max-width: 1400px;
                    margin: 0 auto;
                    width: 100%;
                }

                /* Header */
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 2rem;
                    background: white;
                    border-bottom: 1px solid rgba(145, 169, 150, 0.2);
                    box-shadow: 0 2px 8px rgba(19, 26, 25, 0.05);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .brand-icon {
                    font-size: 2.5rem;
                    color: #91A996;
                    width: 180px;
                }

                .brand-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #131A19;
                    margin: 0;
                    letter-spacing: 0.05em;
                }

                .dashboard-label {
                    font-size: 0.85rem;
                    color: #817F7E;
                    font-weight: 500;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .system-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: #2d5a27;
                    font-weight: 500;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #2d5a27;
                    animation: pulse 2s infinite;
                    aspect-ratio: 1 / 1; 
                }

                .current-time {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #131A19;
                    padding: 0.5rem 1rem;
                    background: rgba(145, 169, 150, 0.1);
                    border-radius: 6px;
                    border: 1px solid rgba(145, 169, 150, 0.2);
                }

                /* Main Grid */
                .main-grid {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    padding: 2rem;
                    overflow: hidden;
                }

                /* Stats Panel */
                .stats-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .panel-header svg {
                    font-size: 1.5rem;
                    color: #91A996;
                }

                .panel-header h3 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #131A19;
                    margin: 0;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .stat-card {
                    background: white;
                    padding: 1.25rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(19, 26, 25, 0.08);
                    border: 1px solid rgba(145, 169, 150, 0.1);
                    position: relative;
                    transition: transform 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                }

                .stat-value {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #131A19;
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: #817F7E;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .stat-icon {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    font-size: 1.2rem;
                    color: rgba(145, 169, 150, 0.6);
                }

                /* Status Panel */
                .status-panel {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(19, 26, 25, 0.08);
                    border: 1px solid rgba(145, 169, 150, 0.1);
                }

                .status-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                    color: #131A19;
                }

                .status-header svg {
                    font-size: 1.1rem;
                    color: #91A996;
                }

                .status-message {
                    color: #817F7E;
                    line-height: 1.5;
                }

                .loading-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #91A996;
                }

                .loading-spin {
                    animation: spin 1s linear infinite;
                }

                /* Sign In Panel */
                .signin-panel {
                    display: flex;
                    align-items: stretch;
                    height: 100%;
                }

                .signin-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(19, 26, 25, 0.12);
                    border: 1px solid rgba(145, 169, 150, 0.1);
                    width: 100%;
                    max-width: 400px;
                    margin: 0 auto;
                    height: fit-content;
                    max-height: calc(100vh - 200px);
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .signin-icon {
                    font-size: 2rem;
                    color: #91A996;
                }

                .signin-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #131A19;
                    margin: 0;
                }

                .signin-subtitle {
                    font-size: 0.9rem;
                    color: #817F7E;
                    margin: 0;
                }

                /* Admin Assistant */
                .admin-assistant {
                    background: rgba(145, 169, 150, 0.08);
                    border: 1px solid rgba(145, 169, 150, 0.2);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                }

                .assistant-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #131A19;
                }

                .assistant-header svg {
                    font-size: 1rem;
                    color: #91A996;
                }

                .online-badge {
                    margin-left: auto;
                    background: #2d5a27;
                    color: white;
                    padding: 0.2rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .assistant-text {
                    font-size: 0.85rem;
                    color: #817F7E;
                    line-height: 1.4;
                    margin: 0;
                }

                /* Clerk Container */
                .clerk-container {
                    margin-bottom: 1.5rem;
                    width: 100% !important;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 600px;
                    margin-left: -32px;
                }

                .clerk-container > div {
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                }

                .clerk-container * {
                    pointer-events: auto !important;
                }

                .cl-headerTitle {
                    display: none !important;
                }

                /* Ensure Clerk form is properly sized */
                .clerk-container .cl-rootBox {
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                }

                .clerk-container .cl-card {
                    box-shadow: none !important;
                    border: none !important;
                    background: transparent !important;
                    flex: 1 !important;
                    display: flex !important;
                    flex-direction: column !important;
                }

                .clerk-container .cl-main {
                    flex: 1 !important;
                    display: flex !important;
                    flex-direction: column !important;
                }

                /* Footer */
                .signin-footer {
                    border-top: 1px solid rgba(129, 127, 126, 0.15);
                    padding-top: 1rem;
                }

                .footer-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: #817F7E;
                }

                .footer-item svg {
                    color: #91A996;
                    font-size: 1rem;
                }

                /* Animations */
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .main-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(4, 1fr);
                        gap: 0.75rem;
                    }

                    .stat-card {
                        padding: 1rem;
                    }

                    .stat-value {
                        font-size: 1.4rem;
                    }
                }

                @media (max-width: 768px) {
                    .admin-header {
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1rem;
                    }

                    .main-grid {
                        padding: 1rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .signin-card {
                        padding: 1.5rem;
                        max-height: calc(100vh - 140px);
                        height: auto;
                    }

                    .clerk-container {
                        min-height: 350px;
                    }
                }
            `}</style>
        </div>
    );
}