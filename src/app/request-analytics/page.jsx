"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import MasterLayout from "@/masterLayout/MasterLayout";
import Breadcrumb from "@/components/Breadcrumb";

const RequestAnalyticsPage = () => {
    return (
        <MasterLayout>
            <div className="myavana-dashboard-container">
                <div className="myavana-page-header">
                    <div className="myavana-breadcrumb">
                        <Link href="/" className="myavana-breadcrumb-link">Dashboard</Link>
                        <span className="myavana-breadcrumb-separator">/</span>
                        <span className="myavana-breadcrumb-current">Request Analytics</span>
                    </div>
                    
                    <div className="myavana-page-title-section">
                        <h1 className="myavana-page-title">
                            <Icon icon="solar:server-square-bold" className="me-3" />
                            Request Analytics
                        </h1>
                        <p className="myavana-page-subtitle">
                            Monitor API performance, request patterns, and system health with detailed analytics and insights
                        </p>
                    </div>
                </div>

                <div className="myavana-empty-container">
                    <div className="empty-content">
                        <div className="empty-illustration">
                            <Icon icon="solar:server-square-bold-duotone" className="empty-icon" />
                        </div>
                        <div className="empty-text">
                            <h3 className="empty-title">REQUEST ANALYTICS</h3>
                            <p className="empty-message">
                                Advanced request analytics dashboard is in development. Track API performance, 
                                identify bottlenecks, monitor error rates, and analyze request patterns in real-time.
                            </p>
                        </div>
                        <div className="d-flex gap-3 justify-content-center">
                            <Link href="/" className="myavana-btn-primary">
                                <Icon icon="solar:arrow-left-bold" className="btn-icon" />
                                Return to Dashboard
                            </Link>
                            <Link href="/documentation" className="myavana-btn-outline-primary">
                                <Icon icon="solar:document-text-bold" className="btn-icon" />
                                View Documentation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default RequestAnalyticsPage;