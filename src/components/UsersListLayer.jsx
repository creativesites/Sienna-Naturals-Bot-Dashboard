// app/users/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import randomName from '@scaleway/random-name';
import HairProfilePage from '@/components/WomanModelLayer';

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
    return <div>Loading...</div>;
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
      <div className='card h-100 p-0 radius-12'>
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
          <div className='grid-three-columns'>
        {users && users.length > 0 && users.map((user, index) => (
          <div className="usr-card">
            <div className="corner">
              <i data-corner="tl"></i>
              <i data-corner="br"></i>
              <Link href="/chat-message">
                <div data-action="notif" className="action">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 9h8M8 13h5M21 9c0-3.314-3.582-6-8-6s-8 2.686-8 6c0 2.28 1.59 4.27 4 5.255V21l5-3h3c4.418 0 8-2.686 8-6z"
                    ></path>
                    <circle cx="17" cy="6" r="3" fill="red" className="dot"></circle>
                  </svg>
                </div>
              </Link>
              <Link href={`/users/${user.user_id}`}>
                <div data-action="more" className="action">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17 7l-11 11"></path>
                    <path d="M8 7l9 0l0 9"></path>
                  </svg>
                </div>
              </Link>
            </div>

            <figure className="boxes">
              
              <figcaption className="caption">
                <p className="name">{user.name || randomName()}</p>
                <span className="as" title="CEO of media Ink"></span>
              </figcaption>
            </figure>

            <div className="box-body">
              <div className="box-content">
                
                <div className="caption">
                  <p>{user.name || randomName()}</p>
                  <div>
                    <p className="text-sm">
                      Joined: <time className="font-semibold">{new Date(user.created_at).toLocaleDateString()}</time>
                      
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div data-title="Last seen" className="box-foot">
              
              <div className="box-foot-actions">
                <p className="text-sm"> Hair Type: <time className="font-semibold">{user.hair_type || 'N/A'}</time> </p>
                <p className="text-sm"> Hair Texture: <time className="font-semibold">{user.hair_texture || 'N/A'}</time> </p>
              </div>
            </div>
          </div>
        ))}
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