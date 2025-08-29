"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import MasterLayout from "@/masterLayout/MasterLayout";
import Breadcrumb from "@/components/Breadcrumb";

const CampaignsPage = () => {
    return (
        <MasterLayout>
            <div className="myavana-dashboard-container">
                <div className="myavana-page-header">
                    <div className="myavana-breadcrumb">
                        <Link href="/" className="myavana-breadcrumb-link">Dashboard</Link>
                        <span className="myavana-breadcrumb-separator">/</span>
                        <span className="myavana-breadcrumb-current">Proactive Campaigns</span>
                    </div>
                    
                    <div className="myavana-page-title-section">
                        <h1 className="myavana-page-title">
                            <Icon icon="solar:megaphone-bold" className="me-3" />
                            Proactive Campaigns
                        </h1>
                        <p className="myavana-page-subtitle">
                            Create and manage automated outreach campaigns to engage users proactively with personalized content
                        </p>
                    </div>
                </div>

                <div className="myavana-empty-container">
                    <div className="empty-content">
                        <div className="empty-illustration">
                            <Icon icon="solar:megaphone-bold-duotone" className="empty-icon" />
                        </div>
                        <div className="empty-text">
                            <h3 className="empty-title">PROACTIVE CAMPAIGNS</h3>
                            <p className="empty-message">
                                Smart campaign management system is coming soon. Create automated email sequences, 
                                push notifications, and targeted messaging based on user behavior and hair care journey stages.
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

export default CampaignsPage;