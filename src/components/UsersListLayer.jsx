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
                          <Icon icon="mdi:user-circle" className="text-4xl" />
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