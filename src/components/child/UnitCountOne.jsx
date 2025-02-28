// components/child/UnitCountOne.js
'use client'
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const UnitCountOne = () => {
    const [stats, setStats] = useState({
        totalConversations: 0,
        activeUsers: 0,
        productInteractions: 0,
        hairProfiles: 0,
        commonConcerns: [],
        topProducts: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/statistics'); // Corrected endpoint
                console.log('stats api response')
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
                            <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="solar:chat-round-bold" className="text-white text-2xl mb-0" />
                            </div>
                        </div>
                        {/*  No additional info for total conversations  */}
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
                            <div className="w-50-px h-50-px bg-purple rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="gridicons:multiple-users" className="text-white text-2xl mb-0" />
                            </div>
                        </div>
                        {/* No additional info for active users (it's already for the last 30 days) */}
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
                            <div className="w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="mdi:hand-pointing-right" className="text-white text-2xl mb-0" /> {/* Icon for interaction */}
                            </div>
                        </div>
                        {/* No additional info needed */}
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
                            <div className="w-50-px h-50-px bg-success-main rounded-circle d-flex justify-content-center align-items-center">
                                <Icon icon="ph:hair" className="text-white text-2xl mb-0" /> {/* Icon for hair */}
                            </div>
                        </div>
                        {/* No additional info needed */}
                    </div>
                </div>
            </div>

            {/* Placeholder for Top Concerns/Products (Could be a separate component) */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-5 h-100">
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Top 5 Hair Concerns</p>
                                {/* Display Top Concerns - could be a simple list */}
                                <ul className="mb-0">
                                    {stats.commonConcerns.map((concern, index) => (
                                        <li key={index}>{concern.concern} ({concern.count})</li>
                                    ))}
                                </ul>
                            </div>
                            {/*No icon, it's a list */}
                        </div>
                    </div>
                </div>
            </div>

            {/*i can put here another row if needed, following the template patterns*/}
        </div>
    );
};

export default UnitCountOne;