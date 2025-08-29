"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from 'react-toastify';
import Link from 'next/link';
import { debounce } from 'lodash';
import { stripHtml } from "string-strip-html";

import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

const ProductsPage = () => {
    const router = useRouter();
    
    // State management
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(12);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });
    const [deleteLoading, setDeleteLoading] = useState(null);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((query) => {
            setCurrentPage(1);
            fetchProducts(query, 1, productsPerPage, category, sortBy, sortOrder);
        }, 300),
        [productsPerPage, category, sortBy, sortOrder]
    );

    // Fetch products with filters
    const fetchProducts = async (search = '', page = 1, limit = 12, cat = '', sort = 'created_at', order = 'desc') => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({
                ...(search && { search }),
                page: page.toString(),
                limit: limit.toString(),
                ...(cat && { category: cat }),
                sortBy: sort,
                sortOrder: order
            });
            
            const response = await fetch(`/api/products?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setProducts(data.products || []);
            setPagination(data.pagination || {});
            
            // Extract unique categories
            if (data.products) {
                const uniqueCategories = [...new Set(data.products.map(p => p.product_category).filter(Boolean))];
                setCategories(uniqueCategories);
            }
            
        } catch (error) {
            setError(error.message);
            console.error("Error fetching products:", error);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(searchQuery, currentPage, productsPerPage, category, sortBy, sortOrder);
    }, [currentPage, productsPerPage, category, sortBy, sortOrder]);

    // Event handlers
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        if (mode === 'table') {
            setProductsPerPage(10);
        } else {
            setProductsPerPage(12);
        }
    };

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        setDeleteLoading(productId);
        
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete product');
            }
            
            setProducts(products.filter(product => product.product_id !== productId));
            toast.success('Product deleted successfully');
            
            // Refresh products if current page becomes empty
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchProducts(searchQuery, currentPage, productsPerPage, category, sortBy, sortOrder);
            }
            
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error(error.message || 'Failed to delete product');
        } finally {
            setDeleteLoading(null);
        }
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Premium Loading component
    const LoadingSpinner = () => (
        <div className="sienna-loading-container">
            <div className="sienna-loading-content">
                <div className="loading-animation">
                    <Icon icon="solar:loading-bold" className="sienna-loading-icon spinner" />
                </div>
                <div className="loading-text">
                    <h4 className="sienna-loading-title">LOADING PRODUCTS</h4>
                    <p className="sienna-loading-subtitle">Discovering your premium natural hair care collection...</p>
                </div>
            </div>
        </div>
    );

    // Premium Error component
    const ErrorMessage = () => (
        <div className="sienna-error-container">
            <div className="error-content">
                <div className="error-icon-wrapper">
                    <Icon icon="solar:danger-bold-duotone" className="sienna-error-icon" />
                </div>
                <div className="error-text">
                    <h4 className="sienna-error-title">SOMETHING WENT WRONG</h4>
                    <p className="sienna-error-message">{error}</p>
                    <p className="error-subtitle">We encountered an issue while loading your products. Please try again.</p>
                </div>
                <button 
                    className="sienna-btn sienna-btn-secondary retry-btn"
                    onClick={() => fetchProducts(searchQuery, currentPage, productsPerPage, category, sortBy, sortOrder)}
                >
                    <Icon icon="solar:refresh-bold" className="sienna-btn-icon" />
                    Try Again
                </button>
            </div>
        </div>
    );

    // Premium Empty state component
    const EmptyState = () => (
        <div className="sienna-empty-container">
            <div className="empty-content">
                <div className="empty-illustration">
                    <Icon icon="solar:box-bold-duotone" className="sienna-empty-icon" />
                    <div className="empty-decoration">
                        <div className="decoration-dot dot-1"></div>
                        <div className="decoration-dot dot-2"></div>
                        <div className="decoration-dot dot-3"></div>
                    </div>
                </div>
                <div className="empty-text">
                    <h3 className="sienna-empty-title">
                        {searchQuery || category ? 'NO MATCHING PRODUCTS' : 'YOUR CATALOG AWAITS'}
                    </h3>
                    <p className="sienna-empty-message">
                        {searchQuery || category 
                            ? 'We couldn\'t find any products matching your current filters. Try adjusting your search criteria or browse all products.' 
                            : 'Start building your premium natural hair care product collection. Add your first product to get started.'
                        }
                    </p>
                </div>
                <div className="empty-actions">
                    {searchQuery || category ? (
                        <div className="action-group">
                            <button 
                                className="sienna-btn sienna-btn-secondary"
                                onClick={() => {
                                    setSearchQuery('');
                                    setCategory('');
                                    setCurrentPage(1);
                                    fetchProducts('', 1, productsPerPage, '', sortBy, sortOrder);
                                }}
                            >
                                <Icon icon="solar:filter-bold" className="sienna-btn-icon" />
                                Clear Filters
                            </button>
                            <Link href="/products/create" className="sienna-btn sienna-btn-primary">
                                <Icon icon="solar:add-circle-bold" className="sienna-btn-icon" />
                                Add New Product
                            </Link>
                        </div>
                    ) : (
                        <Link href="/products/create" className="sienna-btn sienna-btn-primary">
                            <Icon icon="solar:add-circle-bold" className="sienna-btn-icon" />
                            Create Your First Product
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <MasterLayout>
            <Breadcrumb title='Products' />
            
            {/* Premium Header Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="sienna-premium-header">
                        <div className="sienna-card border-0 sienna-animate-fadeIn">
                            <div className="sienna-card-body p-5">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <div className="header-content">
                                            <h1 className="sienna-card-title">
                                                <Icon icon="solar:box-bold-duotone" className="title-icon me-3" style={{color: 'var(--sienna-copper)'}} />
                                                PRODUCTS CATALOG
                                            </h1>
                                            <p className="sienna-card-subtitle">
                                                Manage your premium natural hair care product collection with sophisticated tools and insights
                                            </p>
                                            <div className="stats-preview d-flex gap-4 mt-4">
                                                <div className="stat-item">
                                                    <span className="stat-number fs-3 fw-bold text-primary">{pagination.total || 0}</span>
                                                    <span className="stat-label d-block text-muted">Total Products</span>
                                                </div>
                                                <div className="stat-divider border-start ps-4">
                                                    <span className="stat-number fs-3 fw-bold" style={{color: 'var(--sienna-copper)'}}>{categories.length}</span>
                                                    <span className="stat-label d-block text-muted">Categories</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-md-end">
                                        <Link href="/products/create" className="sienna-btn sienna-btn-primary sienna-btn-lg">
                                            <Icon icon="solar:add-circle-bold" className="sienna-btn-icon" />
                                            Add New Product
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Filters and Controls */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="myavana-filters-panel">
                        <div className="filters-card border-0">
                            <div className="card-body p-4">
                                <div className="filters-header mb-3">
                                    <h6 className="filters-title">
                                        <Icon icon="solar:filter-bold-duotone" className="me-2" />
                                        REFINE YOUR SEARCH
                                    </h6>
                                </div>
                                <div className="row g-3 align-items-center">
                                    {/* Premium Search */}
                                    <div className="col-lg-4 col-md-6">
                                        <div className="myavana-search-field">
                                            <Icon icon="solar:magnifer-bold-duotone" className="search-icon" />
                                            <input
                                                type="text"
                                                className="premium-search-input"
                                                placeholder="Discover products..."
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Category Filter */}
                                    <div className="col-lg-2 col-md-6">
                                        <select
                                            className="myavana-select"
                                            value={category}
                                            onChange={(e) => {
                                                setCategory(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Sort */}
                                    <div className="col-lg-2 col-md-4">
                                        <select
                                            className="myavana-select"
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={(e) => {
                                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                                setSortBy(newSortBy);
                                                setSortOrder(newSortOrder);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="created_at-desc">Newest First</option>
                                            <option value="created_at-asc">Oldest First</option>
                                            <option value="product_name-asc">Name A-Z</option>
                                            <option value="product_name-desc">Name Z-A</option>
                                            <option value="price-asc">Price Low-High</option>
                                            <option value="price-desc">Price High-Low</option>
                                        </select>
                                    </div>
                                    
                                    {/* Items per page */}
                                    <div className="col-lg-2 col-md-4">
                                        <select
                                            className="myavana-select"
                                            value={productsPerPage}
                                            onChange={(e) => {
                                                setProductsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value={8}>8 per page</option>
                                            <option value={12}>12 per page</option>
                                            <option value={24}>24 per page</option>
                                            <option value={48}>48 per page</option>
                                        </select>
                                    </div>
                                    
                                    {/* Premium View Mode Toggle */}
                                    <div className="col-lg-2 col-md-4">
                                        <div className="myavana-view-toggle">
                                            <button
                                                type="button"
                                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                                onClick={() => handleViewModeChange('grid')}
                                                title="Grid View"
                                            >
                                                <Icon icon="solar:grid-bold-duotone" />
                                            </button>
                                            <button
                                                type="button"
                                                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                                onClick={() => handleViewModeChange('table')}
                                                title="Table View"
                                            >
                                                <Icon icon="solar:list-bold-duotone" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Results Info */}
            {!loading && !error && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="myavana-results-bar">
                            <div className="results-info">
                                <span className="results-text">
                                    Showing <strong>{products.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0} - {Math.min(currentPage * productsPerPage, pagination.total)}</strong> of <strong>{pagination.total}</strong> products
                                </span>
                                <div className="active-filters">
                                    {searchQuery && <span className="myavana-filter-tag search-tag">
                                        <Icon icon="solar:magnifer-bold" className="tag-icon" />
                                        "{searchQuery}"
                                        <button className="remove-filter" onClick={() => {setSearchQuery(''); fetchProducts('', currentPage, productsPerPage, category, sortBy, sortOrder);}}>
                                            <Icon icon="solar:close-circle-bold" />
                                        </button>
                                    </span>}
                                    {category && <span className="myavana-filter-tag category-tag">
                                        <Icon icon="solar:tag-bold" className="tag-icon" />
                                        {category}
                                        <button className="remove-filter" onClick={() => {setCategory(''); setCurrentPage(1);}}>
                                            <Icon icon="solar:close-circle-bold" />
                                        </button>
                                    </span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage />}
            {!loading && !error && products.length === 0 && <EmptyState />}
            {!loading && !error && products.length > 0 && (
                <>
                    {viewMode === 'grid' ? (
                        <ProductGrid 
                            products={products}
                            onDelete={handleDeleteProduct}
                            deleteLoading={deleteLoading}
                        />
                    ) : (
                        <ProductTable 
                            products={products}
                            onDelete={handleDeleteProduct}
                            deleteLoading={deleteLoading}
                            onSort={handleSortChange}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                        />
                    )}
                    
                    {/* Premium Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="row mt-5">
                            <div className="col-12">
                                <div className="myavana-pagination-container">
                                    <nav aria-label="Products pagination" className="premium-pagination">
                                        <div className="pagination-info">
                                            <span className="pagination-text">
                                                Page {currentPage} of {pagination.totalPages}
                                            </span>
                                        </div>
                                        <ul className="pagination-list">
                                            <li className={`pagination-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                                                <button
                                                    className="pagination-btn prev-btn"
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={!pagination.hasPrev}
                                                    title="Previous Page"
                                                >
                                                    <Icon icon="solar:arrow-left-bold" />
                                                    <span className="btn-text">Previous</span>
                                                </button>
                                            </li>
                                            
                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                                .filter(page => {
                                                    const delta = 2;
                                                    return page === 1 || 
                                                           page === pagination.totalPages || 
                                                           (page >= currentPage - delta && page <= currentPage + delta);
                                                })
                                                .map((page, index, array) => {
                                                    if (index > 0 && array[index - 1] < page - 1) {
                                                        return [
                                                            <li key={`ellipsis-${page}`} className="pagination-item ellipsis">
                                                                <span className="pagination-dots">...</span>
                                                            </li>,
                                                            <li key={page} className={`pagination-item ${currentPage === page ? 'active' : ''}`}>
                                                                <button
                                                                    className="pagination-btn page-btn"
                                                                    onClick={() => paginate(page)}
                                                                >
                                                                    {page}
                                                                </button>
                                                            </li>
                                                        ];
                                                    }
                                                    return (
                                                        <li key={page} className={`pagination-item ${currentPage === page ? 'active' : ''}`}>
                                                            <button
                                                                className="pagination-btn page-btn"
                                                                onClick={() => paginate(page)}
                                                            >
                                                                {page}
                                                            </button>
                                                        </li>
                                                    );
                                                })
                                            }
                                            
                                            <li className={`pagination-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                                                <button
                                                    className="pagination-btn next-btn"
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={!pagination.hasNext}
                                                    title="Next Page"
                                                >
                                                    <span className="btn-text">Next</span>
                                                    <Icon icon="solar:arrow-right-bold" />
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </MasterLayout>
    );
};

// Premium Product Grid Component
const ProductGrid = ({ products, onDelete, deleteLoading }) => {
    return (
        <div className="myavana-products-grid">
            {products.map((product) => (
                <div key={product.product_id} className="product-grid-item">
                    <div className="myavana-product-card">
                        <div className="product-image-container">
                            <img
                                src={product.image || product.main_image || 'https://via.placeholder.com/300x250?text=No+Image&color=222323&bg=f5f5f7'}
                                className="product-image"
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x250?text=No+Image&color=222323&bg=f5f5f7';
                                }}
                            />
                            <div className="product-overlay">
                                <div className="overlay-actions">
                                    <Link href={`/products/${product.product_id}`} className="overlay-btn view-btn" title="View Details">
                                        <Icon icon="solar:eye-bold" />
                                    </Link>
                                    <Link href={`/products/${product.product_id}?edit=true`} className="overlay-btn edit-btn" title="Edit Product">
                                        <Icon icon="solar:pen-bold" />
                                    </Link>
                                </div>
                            </div>
                            {product.product_category && (
                                <div className="product-category-badge">
                                    {product.product_category}
                                </div>
                            )}
                        </div>
                        
                        <div className="product-content">
                            <div className="product-header">
                                <h3 className="product-title" title={product.name}>
                                    {product.name}
                                </h3>
                                <div className="product-actions">
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => onDelete(product.product_id)}
                                        disabled={deleteLoading === product.product_id}
                                        title="Delete Product"
                                    >
                                        {deleteLoading === product.product_id ? (
                                            <div className="loading-spinner">
                                                <Icon icon="solar:loading-bold" className="spinner" />
                                            </div>
                                        ) : (
                                            <Icon icon="solar:trash-bin-minimalistic-bold" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            <p className="product-description">
                                {stripHtml(product.general_description?.substring(0, 120) || 'No description available').result}
                                {product.general_description?.length > 120 && '...'}
                            </p>
                            
                            <div className="product-footer">
                                <div className="product-price">
                                    {product.cost || 'Price not set'}
                                </div>
                                <div className="product-meta">
                                    <span className="meta-item">
                                        <Icon icon="solar:calendar-bold-duotone" className="meta-icon" />
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Premium Product Table Component
const ProductTable = ({ products, onDelete, deleteLoading, onSort, sortBy, sortOrder }) => {
    const getSortIcon = (field) => {
        if (sortBy !== field) return 'solar:sort-vertical-bold';
        return sortOrder === 'asc' ? 'solar:sort-from-bottom-to-top-bold' : 'solar:sort-from-top-to-bottom-bold';
    };

    return (
        <div className="myavana-table-container">
            <div className="premium-table-card">
                <div className="table-wrapper">
                    <table className="myavana-table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-header-cell product-col">
                                    <button 
                                        className="sort-button"
                                        onClick={() => onSort('product_name')}
                                    >
                                        <span className="header-text">PRODUCT</span>
                                        <Icon icon={getSortIcon('product_name')} className="sort-icon" />
                                    </button>
                                </th>
                                <th className="table-header-cell category-col">
                                    <span className="header-text">CATEGORY</span>
                                </th>
                                <th className="table-header-cell description-col">
                                    <span className="header-text">DESCRIPTION</span>
                                </th>
                                <th className="table-header-cell cost-col">
                                    <button 
                                        className="sort-button"
                                        onClick={() => onSort('price')}
                                    >
                                        <span className="header-text">PRICE</span>
                                        <Icon icon={getSortIcon('price')} className="sort-icon" />
                                    </button>
                                </th>
                                <th className="table-header-cell link-col">
                                    <span className="header-text">LINK</span>
                                </th>
                                <th className="table-header-cell actions-col">
                                    <span className="header-text">ACTIONS</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {products.map((product, index) => (
                                <tr key={product.product_id} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                                    <td className="table-cell product-cell">
                                        <div className="product-info">
                                            <div className="product-image-thumb">
                                                <img
                                                    src={product.image || product.main_image || 'https://via.placeholder.com/48x48?text=No+Image&color=222323&bg=f5f5f7'}
                                                    alt={product.name}
                                                    className="thumb-image"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/48x48?text=No+Image&color=222323&bg=f5f5f7';
                                                    }}
                                                />
                                            </div>
                                            <div className="product-details">
                                                <div className="product-name" title={product.name}>
                                                    {product.name}
                                                </div>
                                                <div className="product-id">
                                                    ID: {product.product_id.substring(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell category-cell">
                                        <span className="category-badge">
                                            <Icon icon="solar:tag-bold" className="category-icon" />
                                            {product.product_category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="table-cell description-cell">
                                        <div className="description-text">
                                            {stripHtml(product.general_description?.substring(0, 80) || 'No description available').result}
                                            {product.general_description?.length > 80 && '...'}
                                        </div>
                                    </td>
                                    <td className="table-cell cost-cell">
                                        <div className="price-display">
                                            {product.cost || 'Not set'}
                                        </div>
                                    </td>
                                    <td className="table-cell link-cell">
                                        {product.url ? (
                                            <a href={product.url} target="_blank" rel="noopener noreferrer" className="external-link">
                                                <Icon icon="solar:external-link-bold" />
                                                <span className="link-text">Visit</span>
                                            </a>
                                        ) : (
                                            <span className="no-link-text">No link</span>
                                        )}
                                    </td>
                                    <td className="table-cell actions-cell">
                                        <div className="action-buttons">
                                            <Link href={`/products/${product.product_id}`} className="action-btn view-btn" title="View Product">
                                                <Icon icon="solar:eye-bold" />
                                            </Link>
                                            <Link href={`/products/${product.product_id}?edit=true`} className="action-btn edit-btn" title="Edit Product">
                                                <Icon icon="solar:pen-bold" />
                                            </Link>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => onDelete(product.product_id)}
                                                disabled={deleteLoading === product.product_id}
                                                title="Delete Product"
                                            >
                                                {deleteLoading === product.product_id ? (
                                                    <Icon icon="solar:loading-bold" className="spinner" />
                                                ) : (
                                                    <Icon icon="solar:trash-bin-minimalistic-bold" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;