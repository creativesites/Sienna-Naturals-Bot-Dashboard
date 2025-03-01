// app/users/[userId]/page.jsx
"use client";
import React, { useState, useEffect, use } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { generate } from '@scaleway/random-name';
import Link from 'next/link';
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

const UserDetailPage = ({ params }) => {
    const [user, setUser] = useState(null);
    const [userStats, setUserStats] = useState({ totalConversations: 0, totalMessages: 0, totalHairIssues: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = use(params).userId;


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const userResponse = await fetch(`/api/users/${userId}`);
                if (!userResponse.ok) {
                    throw new Error(`HTTP error! status: ${userResponse.status}`);
                }
                const userData = await userResponse.json();
                setUser(userData);

                // Fetch user statistics
                const statsResponse = await fetch(`/api/users/${userId}/stats`);
                if (!statsResponse.ok) {
                    throw new Error(`HTTP error! status: ${statsResponse.status}`);
                }
                const statsData = await statsResponse.json();
                setUserStats(statsData);


            } catch (error) {
                setError(error.message);
                console.error("Error fetching user details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>User not found.</div>;
    }

    const userName = user.name || generate();

    // Prepare user details for display, handling null/undefined and arrays
    const userDetails = [
        { label: "Name", value: userName, bg: "bg-info-50", border: "border-info" },
        { label: "Registered On", value: new Date(user.created_at).toLocaleDateString(), bg: "bg-transparent", border: "border-success-main" },
        { label: "Hair Type", value: user.hair_type || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Hair Texture", value: user.hair_texture || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Email", value: user.email || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Porosity", value: user.porosity || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Elasticity", value: user.elasticity || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Density", value: user.density || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Curl Pattern", value: user.curl_pattern || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Natural Hair Color", value: user.hair_color_natural || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Treated Hair Color", value: user.hair_color_treated || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Hair Concerns", value: user.hair_concerns ? user.hair_concerns.join(', ') : 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Hair Goals", value: user.hair_goals ? user.hair_goals.join(', ') : 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Hair History Treatments", value: user.hair_history_treatments ? user.hair_history_treatments.join(', ') : 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Hair Styling Habits", value: user.hair_styling_habits || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Product Preferences (Brands)", value: user.product_preferences_brands ? user.product_preferences_brands.join(', ') : 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Product Preferences (Ingredients)", value: user.product_preferences_ingredients || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "City", value: user.location_city || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "State", value: user.location_state || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Country", value: user.location_country || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "ZIP", value: user.location_zip || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Journey Stage Intent", value: user.journey_stage_intent || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Last Hair Change Date", value: user.last_hair_change_date ? new Date(user.last_hair_change_date).toLocaleDateString() : 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Damage Level", value: user.damage_level_self_reported || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Experimenting Interest", value: user.experimenting_interest !== null ? (user.experimenting_interest ? 'Yes' : 'No') : 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Boredom Expression", value: user.boredom_expression !== null ? (user.boredom_expression ? 'Yes' : 'No') : 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Desperation Level", value: user.desperation_level_inferred || 'N/A', bg: "bg-info-50", border: "border-info" },
        { label: "Confidence Level", value: user.confidence_level_inferred || 'N/A', bg: "bg-transparent", border: "border-success-main" },
        { label: "Updated At", value: user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A', bg: "bg-info-50", border: "border-info" },
    ];


    return (
        <MasterLayout>
            <Breadcrumb title={userName} />

            <div className="card h-100 radius-12 p-4">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/users" className="text-blue-500 hover:underline">
                        <Icon icon="akar-icons:arrow-back" className="mr-1" /> Back to Users
                    </Link>
                </div>
                <h1 className="text-2xl font-bold mb-4">User Details: {userName}</h1>

                {/* User Stats Cards - Reusing your UnitCountOne styles as much as possible */}
                <div className='row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4 mb-8'>
                    <div className='col'>
                        <div className='card shadow-none border bg-gradient-start-1 h-100'>
                            <div className='card-body p-20'>
                                <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                                    <div>
                                        <p className='fw-medium text-primary-light mb-1'>Total Conversations</p>
                                        <h6 className='mb-0'>{userStats.totalConversations}</h6>
                                    </div>
                                    <div className='w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center'>
                                        <Icon icon="solar:chat-round-bold" className='text-white text-2xl mb-0' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*  Repeat similar structure for other stats cards  */}
                    <div className='col'>
                        <div className='card shadow-none border bg-gradient-start-2 h-100'>
                            <div className='card-body p-20'>
                                <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                                    <div>
                                        <p className='fw-medium text-primary-light mb-1'>Total Messages</p>
                                        <h6 className='mb-0'>{userStats.totalMessages}</h6>
                                    </div>
                                    <div className='w-50-px h-50-px bg-purple rounded-circle d-flex justify-content-center align-items-center'>
                                        <Icon icon="bx:message-square-detail" className='text-white text-2xl mb-0' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col'>
                        <div className='card shadow-none border bg-gradient-start-3 h-100'>
                            <div className='card-body p-20'>
                                <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                                    <div>
                                        <p className='fw-medium text-primary-light mb-1'>Total Hair Issues</p>
                                        <h6 className='mb-0'>{userStats.totalHairIssues}</h6>
                                    </div>
                                    <div className='w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center'>
                                        <Icon icon="lucide:hair-dryer" className='text-white text-2xl mb-0' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* User Details - Using your provided blockquote templates */}
                <div className="row gy-4">
                    {userDetails.map((detail, index) => (
                        <div key={index} className="col-lg-4 col-sm-6">
                            <div className={`p-16 radius-8 border-start-width-3-px border-top-0 border-end-0 border-bottom-0 ${detail.bg} ${detail.border}`}>
                                <h6 className="text-primary-light text-md mb-8">{detail.label}</h6>
                                <span className={`${detail.bg.includes('bg-info-50') ? 'text-info-main' :
                                    detail.bg.includes('bg-success-50') ? 'text-success-main' :
                                        detail.bg.includes('bg-warning-50') ? 'text-warning-main' :
                                            detail.bg.includes('bg-danger-50') ? 'text-danger-main' : ''
                                } mb-0`}>
                                    - {detail.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MasterLayout>
    );
};

export default UserDetailPage;