// app/users/[userId]/page.jsx
"use client";
import { useState, useEffect, use } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import randomName from '@scaleway/random-name';
import Link from 'next/link';
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";


const UserDetailPage = ({ params }) => {
    const [user, setUser] = useState(null);
    const [userStats, setUserStats] = useState({totalConversations: 0, totalMessages: 0, totalHairIssues: 0});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = use(params);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const userResponse = await fetch(`/api/users/${userId.userId}`);
                if (!userResponse.ok) {
                    throw new Error(`HTTP error! status: ${userResponse.status}`);
                }
                const userData = await userResponse.json();
                setUser(userData);

                // Fetch user statistics
                const statsResponse = await fetch(`/api/users/${userId.userId}/stats`);
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
    }, [userId.userId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>User not found.</div>;
    }

    const userName = user.name || randomName();
    return (
        <MasterLayout>
            {/* Breadcrumb */}
            <Breadcrumb title={userName} />

            <div className="card h-100  radius-12 p-4">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/users" className="text-blue-500 hover:underline">
                    <Icon icon="akar-icons:arrow-back" className="mr-1" /> Back to Users
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">User Details: {userName}</h1>

            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Conversations</h2>
                    <p className="text-3xl font-bold">{userStats.totalConversations}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Messages</h2>
                    <p className="text-3xl font-bold">{userStats.totalMessages}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Hair Issues</h2>
                    <p className="text-3xl font-bold">{userStats.totalHairIssues}</p>
                </div>
            </div>

            {/* User Details */}
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong className="mr-2">User ID:</strong> {user.user_id}</p>
                        <p><strong className="mr-2">Name:</strong> {userName}</p>
                        <p><strong className="mr-2">Email:</strong> {user.email || 'N/A'}</p>
                        <p><strong className="mr-2">Registered On:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                        <p><strong className="mr-2">Hair Type:</strong> {user.hair_type || 'N/A'}</p>
                        <p><strong className="mr-2">Hair Texture:</strong> {user.hair_texture || 'N/A'}</p>
                        <p><strong className="mr-2">Porosity:</strong> {user.porosity || 'N/A'}</p>
                        <p><strong className="mr-2">Elasticity:</strong> {user.elasticity || 'N/A'}</p>
                        <p><strong className="mr-2">Density:</strong> {user.density || 'N/A'}</p>
                        <p><strong className="mr-2">Curl Pattern:</strong> {user.curl_pattern || 'N/A'}</p>
                    </div>
                    <div>
                        <p><strong className="mr-2">Natural Hair Color:</strong> {user.hair_color_natural || 'N/A'}</p>
                        <p><strong className="mr-2">Treated Hair Color:</strong> {user.hair_color_treated || 'N/A'}</p>
                        <p><strong className="mr-2">Hair Concerns:</strong> {user.hair_concerns ? user.hair_concerns.join(', ') : 'N/A'}</p>
                        <p><strong className="mr-2">Hair Goals:</strong> {user.hair_goals ? user.hair_goals.join(', ') : 'N/A'}</p>
                        <p><strong className="mr-2">Hair History Treatments:</strong> {user.hair_history_treatments ? user.hair_history_treatments.join(', ') : 'N/A'}</p>
                        <p><strong className="mr-2">Hair Styling Habits:</strong> {user.hair_styling_habits || 'N/A'}</p>
                        <p><strong className="mr-2">Product Preferences (Brands):</strong> {user.product_preferences_brands ? user.product_preferences_brands.join(', ') : 'N/A'}</p>
                        <p><strong className="mr-2">Product Preferences (Ingredients):</strong> {user.product_preferences_ingredients || 'N/A'}</p>
                        <p><strong className="mr-2">City:</strong> {user.location_city || 'N/A'}</p>
                        <p><strong className="mr-2">State:</strong> {user.location_state || 'N/A'}</p>
                        <p><strong className="mr-2">Country:</strong> {user.location_country || 'N/A'}</p>
                        <p><strong className="mr-2">ZIP:</strong> {user.location_zip || 'N/A'}</p>
                        <p><strong className="mr-2">Journey Stage Intent:</strong> {user.journey_stage_intent || 'N/A'}</p>
                        <p><strong className="mr-2">Last Hair Change Date:</strong>{user.last_hair_change_date ? new Date(user.last_hair_change_date).toLocaleDateString() : 'N/A'}</p>
                        <p><strong className="mr-2">Damage Level:</strong> {user.damage_level_self_reported || 'N/A'}</p>
                        <p><strong className="mr-2">Experimenting Interest:</strong> {user.experimenting_interest !== null ? (user.experimenting_interest ? 'Yes' : 'No') : 'N/A'}</p>
                        <p><strong className="mr-2">Boredom Expression:</strong> {user.boredom_expression !== null ? (user.boredom_expression ? 'Yes' : 'No') : 'N/A'}</p>
                        <p><strong className="mr-2">Desperation Level:</strong> {user.desperation_level_inferred || 'N/A'}</p>
                        <p><strong className="mr-2">Confidence Level:</strong> {user.confidence_level_inferred || 'N/A'}</p>
                        <p><strong className="mr-2">Updated At:</strong> {user.updated_at ? new Date(user.updated_at).toLocaleDateString(): 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
        </MasterLayout>
    );
};

export default UserDetailPage;