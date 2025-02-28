// components/child/LatestRegisteredOne.js
"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useState, useEffect } from 'react';
import randomName from '@scaleway/random-name';

const LatestRegisteredOne = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('latest'); // 'all' or 'latest'


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/api/users?type=all'; // Default to all users
        if (activeTab === 'latest') {
          url = '/api/users?type=latest';
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if(activeTab === 'latest'){
          setLatestUsers(data);
        } else{
          setAllUsers(data);
        }


      } catch (error) {
        setError(error.message);
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]); // Refetch data when activeTab changes

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  // Determine which data to display based on activeTab
  const displayData = activeTab === 'latest' ? latestUsers : allUsers;
  const totalUsers =  activeTab === 'latest' ? latestUsers.length : allUsers.length
  return (
      <div className='col-xxl-9 col-xl-12'>
        <div className='card h-100'>
          <div className='card-body p-24'>
            <div className='d-flex flex-wrap align-items-center gap-1 justify-content-between mb-16'>
              <ul className='nav border-gradient-tab nav-pills mb-0' id='pills-tab' role='tablist'>
                <li className='nav-item' role='presentation'>
                  <button
                      className={`nav-link d-flex align-items-center ${activeTab === 'latest' ? 'active' : ''}`}
                      id='pills-latest-users-tab'
                      onClick={() => setActiveTab('latest')}
                      type='button'
                  >
                    Latest Registered
                    <span className='text-sm fw-semibold py-6 px-12 bg-neutral-500 rounded-pill text-white line-height-1 ms-12 notification-alert'>
                    {latestUsers.length}
                  </span>
                  </button>
                </li>
                <li className='nav-item' role='presentation'>
                  <button
                      className={`nav-link d-flex align-items-center ${activeTab === 'all' ? 'active' : ''}`}
                      id='pills-all-users-tab'
                      onClick={() => setActiveTab('all')}
                      type='button'

                  >
                    All Users
                    <span className='text-sm fw-semibold py-6 px-12 bg-neutral-500 rounded-pill text-white line-height-1 ms-12 notification-alert'>
                  {allUsers.length}
                  </span>
                  </button>
                </li>
              </ul>
              <Link href='#' className='text-primary-600 hover-text-primary d-flex align-items-center gap-1'>
                View All
                <Icon icon='solar:alt-arrow-right-linear' className='icon' />
              </Link>
            </div>
            <div className='tab-content' id='pills-tabContent'>
              <div className='tab-pane fade show active' id='pills-users' role='tabpanel' tabIndex={0}>
                <div className='table-responsive scroll-sm'>
                  <table className='table bordered-table sm-table mb-0'>
                    <thead>
                    <tr>
                      <th scope='col'>Users </th>
                      <th scope='col'>Name</th>
                      <th scope='col'>Email</th>
                      <th scope='col'>Registered On</th>
                      <th scope='col'>Hair Type</th>
                      <th scope='col'>Hair Texture</th>
                      <th scope='col'>Porosity</th>
                      <th scope='col'>Elasticity</th>
                      <th scope='col'>Density</th>
                      <th scope='col'>Curl Pattern</th>
                      <th scope='col'>Natural Hair Color</th>
                      <th scope='col'>Treated Hair Color</th>
                      <th scope='col'>Hair Concerns</th>
                      <th scope='col'>Hair Goals</th>
                      <th scope='col'>Hair History Treatments</th>
                      <th scope='col'>Hair Styling Habits</th>
                      <th scope='col'>Product Preferences Brands</th>
                      <th scope='col'>Product Preferences Ingredients</th>
                      <th scope='col'>City</th>
                      <th scope='col'>State</th>
                      <th scope='col'>Country</th>
                      <th scope='col'>ZIP</th>
                      <th scope='col'>Journey Stage Intent</th>
                      <th scope='col'>Last Hair Change Date</th>
                      <th scope='col'>Damage Level</th>
                      <th scope='col'>Experimenting Interest</th>
                      <th scope='col'>Boredom Expression</th>
                      <th scope='col'>Desperation Level</th>
                      <th scope='col'>Confidence Level</th>
                      <th scope='col'>Updated At</th>
                    </tr>
                    </thead>
                    <tbody>
                    {displayData.map((user) => (
                        <tr key={user.user_id}>
                          <td>
                            <div className='d-flex align-items-center'>
                              {/*  Placeholder for user image. Replace with actual image if available */}
                              <div className='w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden'>
                                {/*  If you have user images, use an img tag here */}
                                {/* <img src={user.image_url || 'path/to/default/image.png'} alt={user.name} className='w-full h-full object-cover' /> */}
                                <Icon icon="mdi:user-circle" className="text-4xl" /> {/*Using icon as placeholder*/}
                              </div>

                              <div className='flex-grow-1'>
                                <h6 className='text-md mb-0 fw-medium'>{user.name || randomName()}</h6>
                              </div>
                            </div>
                          </td>
                          <td>{user.name || randomName()}</td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>{user.hair_type || 'N/A'}</td>
                          <td>{user.hair_texture || 'N/A'}</td>
                          <td>{user.porosity || 'N/A'}</td>
                          <td>{user.elasticity || 'N/A'}</td>
                          <td>{user.density || 'N/A'}</td>
                          <td>{user.curl_pattern || 'N/A'}</td>
                          <td>{user.hair_color_natural || 'N/A'}</td>
                          <td>{user.hair_color_treated || 'N/A'}</td>
                          <td>{user.hair_concerns ? user.hair_concerns.join(', ') : 'N/A'}</td>
                          <td>{user.hair_goals ? user.hair_goals.join(', ') : 'N/A'}</td>
                          <td>{user.hair_history_treatments ? user.hair_history_treatments.join(', ') : 'N/A'}</td>
                          <td>{user.hair_styling_habits || 'N/A'}</td>
                          <td>{user.product_preferences_brands ? user.product_preferences_brands.join(', ') : 'N/A'}</td>
                          <td>{user.product_preferences_ingredients || 'N/A'}</td>
                          <td>{user.location_city || 'N/A'}</td>
                          <td>{user.location_state || 'N/A'}</td>
                          <td>{user.location_country || 'N/A'}</td>
                          <td>{user.location_zip || 'N/A'}</td>
                          <td>{user.journey_stage_intent || 'N/A'}</td>
                          <td>{user.last_hair_change_date ? new Date(user.last_hair_change_date).toLocaleDateString() : 'N/A'}</td>
                          <td>{user.damage_level_self_reported || 'N/A'}</td>
                          <td>{user.experimenting_interest !== null ? (user.experimenting_interest ? 'Yes' : 'No') : 'N/A'}</td>
                          <td>{user.boredom_expression !== null ? (user.boredom_expression ? 'Yes' : 'No') : 'N/A'}</td>
                          <td>{user.desperation_level_inferred || 'N/A'}</td>
                          <td>{user.confidence_level_inferred || 'N/A'}</td>
                          <td>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</td>

                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LatestRegisteredOne;