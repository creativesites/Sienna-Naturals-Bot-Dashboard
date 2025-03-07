"use client";
import { useState, useEffect, useCallback } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import { debounce } from 'lodash';

import { stripHtml } from "string-strip-html";

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((query) => {
            fetchProducts(query);
        }, 300), // 300ms delay
        []
    );

    // Fetch products from the API
    const fetchProducts = async (query = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/products?search=${query}&page=${currentPage}&limit=${productsPerPage}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data.products);
            setTotalProducts(data.total);
        } catch (error) {
            setError(error.message);
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query); // Trigger debounced search
    };

    // Pagination handler
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Delete product handler
    const handleDeleteProduct = async (productId) => {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setProducts(products.filter(product => product.product_id !== productId));
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    useEffect(() => {
        fetchProducts(searchQuery);
    }, [currentPage, productsPerPage]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const totalPages = Math.ceil(totalProducts / productsPerPage);
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
                        value={productsPerPage}
                        onChange={(e) => {
                            setProductsPerPage(Number(e.target.value));
                            setCurrentPage(1);
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
                            onChange={handleSearchChange} // Use debounced handler
                        />
                        <Icon icon='ion:search-outline' className='icon' />
                    </form>
                </div>
                <Link href="/products/create">
                    
                    <button
                        type='button'
                        className='d-flex align-items-center gap-6 px-8 py-4 bg-primary-50 radius-4 bg-hover-primary-100 flex-shrink-0 mb-24'
                    >
                        <i className='ri-edit-2-fill' /> Add New Product
                    </button>
                </Link>
            </div>
            <div className='card-body p-24'>
                <div className='table-responsive scroll-sm'>
                    <table className='table bordered-table sm-table mb-0'>
                        <thead>
                        <tr>
                            <th scope='col'>S.L</th>
                            <th scope='col'>Image</th>
                            <th scope='col'>Name</th>
                            <th scope='col'>Description</th>
                            <th scope='col'>Price</th>
                            <th scope='col'>URL</th>
                            <th scope='col' className='text-center'>
                                Action
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {products && products.length > 0 && products.map((product, index) => (
                            <tr key={product.product_id}>
                                <td>{(currentPage - 1) * productsPerPage + index + 1}</td>
                                <td><img src={product.image??'https://static.vecteezy.com/system/resources/thumbnails/030/607/510/small/cosmetic-rounded-all-white-soap-bottle-mockup-on-white-table-ai-generative-free-photo.jpg'} alt={product.name} width="50" /></td>
                                <td>{product.name}</td>
                                <td>{stripHtml(product.desc.substring(0,30)).result}</td>
                                <td>{product.price}</td>
                                <td><a href={product.url} target="_blank" rel="noopener noreferrer">Link</a></td>
                                <td className='text-center'>
                                    <div className='d-flex align-items-center gap-10 justify-content-center'>
                                        <Link href={`/products/${product.product_id}`}>
                                            <button
                                                type='button'
                                                className='bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                                                onClick={() => handleEditProduct(product.product_id)}
                                            >

                                                <Icon icon='majesticons:eye-line' className='icon text-xl' />
                                            </button>
                                        </Link>
                                        <button
                                            type='button'
                                            className='bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                                            onClick={() => handleDeleteProduct(product.product_id)}
                                        >
                                            <Icon icon='mdi:trash-outline' className='icon text-xl' />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24'>
                    <span>Showing {products?.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} entries</span>
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
                                <Icon icon='ep:d-arrow-right' className='' />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProductTable;