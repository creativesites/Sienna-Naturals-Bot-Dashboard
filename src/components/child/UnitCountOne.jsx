// components/child/UnitCountOne.js
"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const UnitCountOne = () => {
    const [stats, setStats] = useState({
        totalConversations: 0,
        activeUsers: 0,
        productInteractions: 0,
        hairProfiles: 0,
        totalHairIssues: 0, // Use this for the total count
        commonConcerns: [], // Keep this if you want to use it later, but it's not used in this component now
        topProducts: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/statistics');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                setError(error.message);
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div>Loading statistics...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
            {/* Total Conversations */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-1 h-100">
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Total Conversations</p>
                                <h6 className="mb-0">{stats.totalConversations}</h6>
                            </div>
                            <div className="w-50-px h-50-px bg-sienna-light-green rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="solar:chat-round-bold" className="text-white text-2xl mb-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Users (Last 30 Days) */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-2 h-100">
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Active Users (30 Days)</p>
                                <h6 className="mb-0">{stats.activeUsers}</h6>
                            </div>
                            <div className="w-50-px h-50-px bg-sienna-light-green rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="gridicons:multiple-users" className="text-white text-2xl mb-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Product Interactions */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-3 h-100">
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Product Interactions</p>
                                <h6 className="mb-0">{stats.productInteractions}</h6>
                            </div>
                            <div className="w-50-px h-50-px bg-sienna-light-green rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="mdi:hand-pointing-right" className="text-white text-2xl mb-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Hair Profiles Analyzed */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-4 h-100">
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Hair Profiles Analyzed</p>
                                <h6 className="mb-0">{stats.hairProfiles}</h6>
                            </div>
                            <div className="w-50-px h-50-px bg-sienna-light-green rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="mingcute:hair-line" className="text-white text-2xl mb-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Hair Issues */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-5 h-100">
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Total Hair Issues</p>
                                <h6 className="mb-0">{stats.totalHairIssues}</h6> {/* Display totalHairIssues */}
                            </div>
                            <div className="w-50-px h-50-px bg-sienna-light-green rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="mingcute:hair-2-line" className="text-white text-2xl mb-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnitCountOne;