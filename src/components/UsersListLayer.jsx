// app/users/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import randomName from '@scaleway/random-name';

const UsersListLayer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10); // Now a state variable
  const [totalUsers, setTotalUsers] = useState(0); // For total count

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/all-users?search=${searchQuery}&page=${currentPage}&limit=${usersPerPage}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data.users);  // Assuming the API returns { users: [...], total: number }
        setTotalUsers(data.total);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, currentPage, usersPerPage]);


  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
       <div className="myavana-container">
          <div className="myavana-top">
            <div className="myavana-skeleton-container">
              <div className="myavana-skeleton myavana-skeleton-avatar"></div>
              <div className="myavana-skeleton myavana-skeleton-text"></div>
              <div className="myavana-skeleton myavana-skeleton-text"></div>
            </div>
          </div>
          <div className="myavana-content">
            <div>
              <div className="myavana-title">Loading...</div>
              <div className="myavana-timestamp">Users</div>
            </div>
            <div className="myavana-options"></div>
          </div>
        </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Calculate total pages *after* we have the total count
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
      <div className='card p-0 radius-12 pb-6'>
        
        <div className='card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between'>
          <div className='d-flex align-items-center flex-wrap gap-3'>
          <span className='text-md fw-medium text-secondary-light mb-0'>
            Show
          </span>
            <select
                className='form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px'
                value={usersPerPage} // Controlled component
                onChange={(e) => {
                  setUsersPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to page 1 when changing items per page
                }}
            >
              <option value='10'>10</option>
              <option value='25'>25</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
            </select>
            <form className='navbar-search'>
              <input
                  type='text'
                  className='bg-base h-40-px w-auto'
                  name='search'
                  placeholder='Search'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to the first page on new search
                  }}
              />
              <Icon icon='ion:search-outline' className='icon' />
            </form>
            {/* Removed the Status select, as it's not relevant to this example */}
          </div>
          {/* Removed "Add New User" link, as it's not relevant here */}
        </div>
        <div className='card-body p-24'>
          <div className='table-responsive scroll-sm'>
            <table className='table bordered-table sm-table mb-0'>
              <thead>
              <tr>
                <th scope='col'>
                  <div className='d-flex align-items-center gap-10'>
                    {/* Removed checkbox, not relevant for this example */}
                    S.L
                  </div>
                </th>
                <th scope='col'>Join Date</th>
                <th scope='col'>Name</th>
                <th scope='col'>Email</th>
                <th scope='col'>Hair Type</th>
                <th scope='col'>Hair Texture</th>
                <th scope='col' className='text-center'>
                  Action
                </th>
              </tr>
              </thead>
              <tbody>
              {users && users.length > 0 && users.map((user, index) => (
                  <tr key={user.user_id}>
                    <td>
                      <div className='d-flex align-items-center gap-10'>
                        {/* Removed checkbox */}
                        {(currentPage - 1) * usersPerPage + index + 1}
                      </div>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className='d-flex align-items-center'>
                        {/*  Placeholder until you have user images  */}
                        <div className='w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden'>
                          {/* <Icon icon="mdi:user-circle" className="text-4xl" /> */}
                         <section className="myavana-users-profile-icon">
                            <svg viewBox="0 0 15 15" className="icon">
                              <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z"></path>
                            </svg>
                          </section>
                        </div>
                        <div className='flex-grow-1'>
                        <span className='text-md mb-0 fw-normal text-secondary-light'>
                          {user.name || randomName()}
                        </span>
                        </div>
                      </div>
                    </td>
                    <td>
                    <span className='text-md mb-0 fw-normal text-secondary-light'>
                      {user.email || 'N/A'}
                    </span>
                    </td>
                    <td>
                    <span className='text-md mb-0 fw-normal text-secondary-light'>
                        {user.hair_type || 'N/A'}
                    </span>
                    </td>
                    <td>
                    <span className='text-md mb-0 fw-normal text-secondary-light'>
                        {user.hair_texture || 'N/A'}
                    </span>
                    </td>
                    <td className='text-center'>
                      <div className='d-flex align-items-center gap-10 justify-content-center'>
                        <Link href={`/users/${user.user_id}`}>
                          <button
                              type='button'
                              className='bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                          >
                            <Icon
                                icon='majesticons:eye-line'
                                className='icon text-xl'
                            />
                          </button>
                        </Link>
                        {/* Removed Edit and Delete buttons, focus on View */}
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24'>
            <span>Showing {users?.length > 0 ? (currentPage - 1) * usersPerPage + 1 : 0} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} entries</span>
            <ul className='pagination d-flex flex-wrap align-items-center gap-2 justify-content-center'>
              <li className='page-item'>
                <button
                    className='page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px  text-md'
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                  <Icon icon='ep:d-arrow-left' className='' />
                </button>
              </li>
              {pageNumbers.map((number) => (
                  <li key={number} className='page-item'>
                    <button
                        onClick={() => paginate(number)}
                        className={`page-link fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md ${
                            currentPage === number
                                ? 'bg-primary-600 text-white'
                                : 'bg-neutral-200 text-secondary-light'
                        }`}
                    >
                      {number}
                    </button>
                  </li>
              ))}
              <li className='page-item'>
                <button
                    className='page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px  text-md'
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}

                >
                  {" "}
                  <Icon icon='ep:d-arrow-right' className='' />{" "}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
  );
};

export default UsersListLayer;