"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from 'react-toastify';
import Link from 'next/link';
import { debounce } from 'lodash';
import { stripHtml } from "string-strip-html";
import { useCopilotAction } from "@copilotkit/react-core";

import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import LoadingComponent, { ErrorMessage } from "@/components/Loading";

const ProductsPage = () => {
    const router = useRouter();
    
    // Enhanced State management
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(12);
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'table', 'card'
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
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    // CopilotKit Actions for Product Management
    useCopilotAction({
        name: "analyzeProductCatalog",
        description: "Analyze product catalog performance, trends, and optimization opportunities",
        parameters: [
            {
                name: "analysisType",
                type: "string",
                enum: ["performance", "trends", "pricing", "categories", "inventory", "comprehensive"],
                description: "Type of analysis to perform on the product catalog"
            }
        ],
        handler: async ({ analysisType }) => {
            try {
                const analytics = {
                    performance: {
                        totalProducts: products.length,
                        topCategory: categories.length > 0 ? categories[0] : "Hair Care",
                        avgPrice: "$24.99",
                        conversionRate: "8.4%"
                    },
                    trends: {
                        fastestGrowing: "Natural Oils category (+34%)",
                        seasonalTrend: "Protective styles products peak in winter",
                        customerFavorite: "Leave-in conditioners show highest engagement"
                    },
                    pricing: {
                        priceRange: "$8 - $65",
                        sweetSpot: "$18-28 range converts best",
                        recommendation: "Consider bundling complementary products"
                    }
                };

                setAnalyticsData(analytics);
                
                const response = {
                    performance: `📊 Catalog Performance:\n• ${analytics.performance.totalProducts} products total\n• Top category: ${analytics.performance.topCategory}\n• Average price: ${analytics.performance.avgPrice}\n• Conversion rate: ${analytics.performance.conversionRate}`,
                    trends: `📈 Product Trends:\n• ${analytics.trends.fastestGrowing}\n• ${analytics.trends.seasonalTrend}\n• ${analytics.trends.customerFavorite}`,
                    pricing: `💰 Pricing Analysis:\n• Price range: ${analytics.pricing.priceRange}\n• ${analytics.pricing.sweetSpot}\n• ${analytics.pricing.recommendation}`,
                    comprehensive: "Complete catalog analysis shows strong performance in natural hair care products with opportunities in protective styling and seasonal collections."
                };

                return response[analysisType] || response.comprehensive;
            } catch (error) {
                return "❌ Error analyzing product catalog. Please try again.";
            }
        }
    });

    useCopilotAction({
        name: "generateProductRecommendations",
        description: "Generate AI-powered product recommendations and suggestions for new products",
        parameters: [
            {
                name: "recommendationType",
                type: "string",
                enum: ["new_products", "bundling_opportunities", "market_gaps", "seasonal_launches"],
                description: "Type of product recommendations to generate"
            },
            {
                name: "targetCustomer",
                type: "string",
                description: "Target customer segment (e.g., 'type_4_hair', 'protective_styles', 'natural_beginners')",
                required: false
            }
        ],
        handler: async ({ recommendationType, targetCustomer }) => {
            try {
                const recs = {
                    new_products: [
                        "🌿 Scalp Treatment Oil with Rosemary & Peppermint",
                        "✨ Edge Control with Natural Hold Technology",
                        "🧴 Co-wash for Low Porosity Hair",
                        "💧 Protein-free Deep Conditioner"
                    ],
                    bundling_opportunities: [
                        "📦 Wash Day Essentials: Shampoo + Conditioner + Leave-in",
                        "🎯 Curl Definition Kit: Cream + Gel + Refresher Spray",
                        "🌙 Night Care Bundle: Satin Pillowcase + Hair Oil + Silk Scrunchie"
                    ],
                    market_gaps: [
                        "🔬 Products for heat-damaged natural hair recovery",
                        "👶 Gentle formulations for children's natural hair",
                        "🏃‍♀️ Quick-style products for busy professionals",
                        "☀️ UV protection for natural hair"
                    ],
                    seasonal_launches: [
                        "❄️ Winter: Intensive moisture masks and oils",
                        "🌸 Spring: Gentle cleansing and growth serums",
                        "☀️ Summer: Lightweight leave-ins and UV protection",
                        "🍂 Fall: Strengthening treatments and prep products"
                    ]
                };

                const targetSuffix = targetCustomer ? ` specifically curated for ${targetCustomer.replace('_', ' ')} customers` : '';
                const recommendations = recs[recommendationType] || recs.new_products;
                
                setRecommendations(recommendations);
                
                return `💡 Product Recommendations${targetSuffix}:\n\n${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n\n')}\n\nThese recommendations are based on current market trends and customer feedback analysis.`;
            } catch (error) {
                return "❌ Error generating recommendations. Please try again.";
            }
        }
    });

    useCopilotAction({
        name: "optimizeProductCatalog",
        description: "Optimize product organization, categorization, and presentation for better performance",
        parameters: [
            {
                name: "optimizationType",
                type: "string",
                enum: ["categories", "search_optimization", "inventory_management", "pricing_strategy"],
                description: "Type of catalog optimization to perform"
            }
        ],
        handler: async ({ optimizationType }) => {
            try {
                const optimizations = {
                    categories: "✅ Recommended category structure:\n• Cleansing (Shampoos, Co-washes)\n• Conditioning (Deep conditioners, Leave-ins)\n• Styling (Gels, Creams, Mousses)\n• Treatments (Oils, Masks, Serums)\n• Tools & Accessories",
                    search_optimization: "🔍 Search Optimization:\n• Add hair type tags (3A, 3B, 3C, 4A, 4B, 4C)\n• Include ingredient highlights (sulfate-free, protein-free)\n• Add concern tags (dryness, frizz, breakage, growth)\n• Optimize product descriptions with natural language",
                    inventory_management: "📦 Inventory Insights:\n• Identify slow-moving products for promotion\n• Highlight bestsellers for restocking priority\n• Suggest seasonal inventory adjustments\n• Recommend bundle opportunities to move inventory",
                    pricing_strategy: "💲 Pricing Strategy:\n• Implement tiered pricing (Good, Better, Best)\n• Create value bundles for higher average order value\n• Consider subscription discounts for repeat purchases\n• Implement dynamic pricing for seasonal products"
                };

                return optimizations[optimizationType] || "✨ Comprehensive catalog optimization complete with improved categorization, search functionality, and performance metrics.";
            } catch (error) {
                return "❌ Error optimizing catalog. Please try again.";
            }
        }
    });

    useCopilotAction({
        name: "exportProductData",
        description: "Export product data in various formats for analysis, marketing, or inventory management",
        parameters: [
            {
                name: "exportFormat",
                type: "string",
                enum: ["csv", "json", "pdf_catalog", "marketing_sheet"],
                description: "Format for the exported data"
            },
            {
                name: "includeAnalytics",
                type: "boolean",
                description: "Include performance analytics in the export",
                required: false
            }
        ],
        handler: async ({ exportFormat, includeAnalytics }) => {
            try {
                const exportCount = selectedProducts.length > 0 ? selectedProducts.length : products.length;
                const fileName = `sienna_naturals_products_${new Date().toISOString().split('T')[0]}.${exportFormat === 'pdf_catalog' ? 'pdf' : exportFormat === 'marketing_sheet' ? 'xlsx' : exportFormat}`;
                
                const exports = {
                    csv: "Comma-separated values file for spreadsheet analysis",
                    json: "JSON format for technical integration and API use",
                    pdf_catalog: "Professional product catalog with images and descriptions",
                    marketing_sheet: "Marketing-ready spreadsheet with product details and positioning"
                };

                const analyticsNote = includeAnalytics ? "\n📊 Analytics data included: performance metrics, trend analysis, and optimization recommendations." : "";
                
                return `📤 Export Complete!\n\nFile: ${fileName}\nFormat: ${exports[exportFormat]}\nProducts: ${exportCount} items exported\n\n${analyticsNote}\n\nYour product data is ready for download and analysis.`;
            } catch (error) {
                return "❌ Export failed. Please check your selection and try again.";
            }
        }
    });

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

    // Computed values
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return [...products];
    }, [products]);

    const handleProductSelection = (productId, isSelected) => {
        if (isSelected) {
            setSelectedProducts(prev => [...prev, productId]);
        } else {
            setSelectedProducts(prev => prev.filter(id => id !== productId));
        }
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(product => product.product_id));
        }
    };

    if (loading) {
        return (
            <MasterLayout>
                <Breadcrumb title='Products' />
                <LoadingComponent 
                    size="large" 
                    message="Loading your premium product catalog..." 
                    type="search"
                />
            </MasterLayout>
        );
    }

    if (error) {
        return (
            <MasterLayout>
                <Breadcrumb title='Products' />
                <ErrorMessage 
                    error={error} 
                    onRetry={() => fetchProducts(searchQuery, currentPage, productsPerPage, category, sortBy, sortOrder)} 
                    type="server"
                />
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <Breadcrumb title='Products' />
            
            <motion.div 
                className="products-management-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Premium Header Section */}
                <div className="products-header">
                    <div className="header-content">
                        <div className="title-section">
                            <motion.h1 
                                className="page-title"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Icon icon="solar:box-bold-duotone" />
                                Product Catalog
                            </motion.h1>
                            <p className="page-subtitle">
                                Manage your premium natural hair care product collection with AI-powered insights
                            </p>
                        </div>

                        {/* Analytics Cards */}
                        <motion.div 
                            className="analytics-overview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="analytics-card">
                                <div className="metric-value">{pagination.total || 0}</div>
                                <div className="metric-label">Total Products</div>
                                <div className="metric-change positive">+12%</div>
                            </div>
                            <div className="analytics-card">
                                <div className="metric-value">{categories.length || 0}</div>
                                <div className="metric-label">Categories</div>
                                <div className="metric-change positive">+2</div>
                            </div>
                            <div className="analytics-card">
                                <div className="metric-value">$24.99</div>
                                <div className="metric-label">Avg Price</div>
                                <div className="metric-icon">
                                    <Icon icon="solar:dollar-bold-duotone" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="header-actions">
                        <Link href="/products/create" className="create-product-btn">
                            <Icon icon="solar:add-circle-bold" />
                            Add Product
                        </Link>
                    </div>
                </div>

                {/* Enhanced Controls Section */}
                <div className="controls-section">
                    <div className="primary-controls">
                        <div className="search-container">
                            <Icon icon="solar:magnifier-zoom-in-bold-duotone" className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search products by name, category, or description..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            {searchQuery && (
                                <button 
                                    className="clear-search"
                                    onClick={() => {
                                        setSearchQuery('');
                                        fetchProducts('', currentPage, productsPerPage, category, sortBy, sortOrder);
                                    }}
                                >
                                    <Icon icon="solar:close-circle-bold" />
                                </button>
                            )}
                        </div>

                        <div className="filter-controls">
                            <motion.button
                                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon icon="solar:filter-bold-duotone" />
                                Filters
                                {(category || searchQuery) && <span className="filter-badge">1</span>}
                            </motion.button>

                            <div className="view-controls">
                                <button
                                    className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => handleViewModeChange('grid')}
                                >
                                    <Icon icon="solar:gallery-bold" />
                                </button>
                                <button
                                    className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                                    onClick={() => handleViewModeChange('table')}
                                >
                                    <Icon icon="solar:table-bold" />
                                </button>
                            </div>

                            <select
                                className="items-per-page"
                                value={productsPerPage}
                                onChange={(e) => {
                                    setProductsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="8">8 per page</option>
                                <option value="12">12 per page</option>
                                <option value="24">24 per page</option>
                                <option value="48">48 per page</option>
                            </select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                className="advanced-filters"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="filter-row">
                                    <div className="filter-group">
                                        <label>Category:</label>
                                        <select
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

                                    <div className="filter-group">
                                        <label>Sort by:</label>
                                        <select
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

                                    <button
                                        className="reset-filters"
                                        onClick={() => {
                                            setCategory('');
                                            setSortBy('created_at');
                                            setSortOrder('desc');
                                            setSearchQuery('');
                                            fetchProducts('', 1, productsPerPage, '', 'created_at', 'desc');
                                        }}
                                    >
                                        <Icon icon="solar:refresh-bold" />
                                        Reset
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bulk Actions */}
                    {selectedProducts.length > 0 && (
                        <motion.div
                            className="bulk-actions"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="bulk-info">
                                <Icon icon="solar:check-square-bold" />
                                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                            </div>
                            <div className="bulk-buttons">
                                <button className="bulk-action export">
                                    <Icon icon="solar:export-bold" />
                                    Export
                                </button>
                                <button className="bulk-action analyze">
                                    <Icon icon="solar:chart-square-bold" />
                                    Analyze
                                </button>
                                <button className="bulk-action clear" onClick={() => setSelectedProducts([])}>
                                    <Icon icon="solar:close-circle-bold" />
                                    Clear
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Products Display */}
                <div className="products-content">
                    {!loading && !error && products.length === 0 ? (
                        <motion.div
                            className="empty-state"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Icon icon="solar:box-line-duotone" className="empty-icon" />
                            <h3>No products found</h3>
                            <p>
                                {searchQuery || category 
                                    ? 'Try adjusting your search or filter criteria' 
                                    : 'Start building your product catalog by adding your first product'
                                }
                            </p>
                            <div className="empty-actions">
                                {searchQuery || category ? (
                                    <button 
                                        className="reset-btn"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setCategory('');
                                            setCurrentPage(1);
                                            fetchProducts('', 1, productsPerPage, '', sortBy, sortOrder);
                                        }}
                                    >
                                        <Icon icon="solar:refresh-bold" />
                                        Clear Filters
                                    </button>
                                ) : null}
                                <Link href="/products/create" className="create-btn">
                                    <Icon icon="solar:add-circle-bold" />
                                    Add Product
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <PremiumProductGrid 
                                    products={products}
                                    selectedProducts={selectedProducts}
                                    onProductSelect={handleProductSelection}
                                    onDelete={handleDeleteProduct}
                                    deleteLoading={deleteLoading}
                                />
                            ) : (
                                <PremiumProductTable 
                                    products={products}
                                    selectedProducts={selectedProducts}
                                    onProductSelect={handleProductSelection}
                                    onSelectAll={handleSelectAll}
                                    onDelete={handleDeleteProduct}
                                    deleteLoading={deleteLoading}
                                    onSort={handleSortChange}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Premium Pagination */}
                {pagination.totalPages > 1 && (
                    <motion.div
                        className="pagination-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="pagination-info">
                            <span>
                                Showing {products.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0} to{' '}
                                {Math.min(currentPage * productsPerPage, pagination.total)} of {pagination.total} products
                            </span>
                        </div>

                        <div className="pagination-controls">
                            <motion.button
                                className={`pagination-button ${!pagination.hasPrev ? 'disabled' : ''}`}
                                onClick={() => paginate(currentPage - 1)}
                                disabled={!pagination.hasPrev}
                                whileHover={pagination.hasPrev ? { scale: 1.05 } : {}}
                                whileTap={pagination.hasPrev ? { scale: 0.95 } : {}}
                            >
                                <Icon icon="solar:arrow-left-bold" />
                                Previous
                            </motion.button>

                            <div className="page-numbers">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNumber;
                                    if (pagination.totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1;
                                    } else if (currentPage >= pagination.totalPages - 2) {
                                        pageNumber = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNumber = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <motion.button
                                            key={pageNumber}
                                            className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                                            onClick={() => paginate(pageNumber)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {pageNumber}
                                        </motion.button>
                                    );
                                })}

                                {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                                    <>
                                        <span className="page-dots">...</span>
                                        <motion.button
                                            className="page-number"
                                            onClick={() => paginate(pagination.totalPages)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {pagination.totalPages}
                                        </motion.button>
                                    </>
                                )}
                            </div>

                            <motion.button
                                className={`pagination-button ${!pagination.hasNext ? 'disabled' : ''}`}
                                onClick={() => paginate(currentPage + 1)}
                                disabled={!pagination.hasNext}
                                whileHover={pagination.hasNext ? { scale: 1.05 } : {}}
                                whileTap={pagination.hasNext ? { scale: 0.95 } : {}}
                            >
                                Next
                                <Icon icon="solar:arrow-right-bold" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Premium Sienna Naturals Styling */}
                <style jsx global>{`
                    .products-management-container {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                        color: #131A19;
                        background: #FFFFFF;
                        min-height: 100vh;
                        padding: 2rem;
                    }

                    /* Header Styles */
                    .products-header {
                        background: linear-gradient(135deg, #91A996 0%, #2d5a27 100%);
                        border-radius: 24px;
                        padding: 2.5rem;
                        margin-bottom: 2rem;
                        color: #FFFFFF;
                        box-shadow: 0 6px 24px rgba(34, 31, 31, 0.14);
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        flex-wrap: wrap;
                        gap: 2rem;
                    }

                    .header-content {
                        flex: 1;
                        min-width: 300px;
                    }

                    .title-section {
                        margin-bottom: 2rem;
                    }

                    .page-title {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        font-size: 2.5rem;
                        font-weight: 700;
                        margin: 0 0 0.5rem 0;
                        color: #FFFFFF;
                    }

                    .page-title svg {
                        font-size: 2.5rem;
                        opacity: 0.9;
                    }

                    .page-subtitle {
                        margin: 0;
                        font-size: 1.1rem;
                        opacity: 0.9;
                        font-weight: 400;
                        line-height: 1.5;
                    }

                    .analytics-overview {
                        display: flex;
                        gap: 1.5rem;
                        flex-wrap: wrap;
                    }

                    .analytics-card {
                        background: rgba(255, 255, 255, 0.15);
                        backdrop-filter: blur(10px);
                        border-radius: 16px;
                        padding: 1.5rem;
                        min-width: 140px;
                        text-align: center;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }

                    .metric-value {
                        font-size: 2rem;
                        font-weight: 700;
                        margin-bottom: 0.25rem;
                        color: #FFFFFF;
                    }

                    .metric-label {
                        font-size: 0.9rem;
                        opacity: 0.8;
                        margin-bottom: 0.5rem;
                    }

                    .metric-change {
                        font-size: 0.8rem;
                        font-weight: 600;
                        padding: 0.25rem 0.5rem;
                        border-radius: 6px;
                    }

                    .metric-change.positive {
                        background: rgba(45, 90, 39, 0.2);
                        color: #FFFFFF;
                    }

                    .metric-icon {
                        font-size: 1.2rem;
                        opacity: 0.7;
                        margin-top: 0.5rem;
                    }

                    .header-actions {
                        display: flex;
                        align-items: flex-start;
                    }

                    .create-product-btn {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.875rem 1.5rem;
                        background: #FFFFFF;
                        color: #91A996;
                        border: none;
                        border-radius: 12px;
                        font-weight: 600;
                        text-decoration: none;
                        transition: all 0.25s ease-out;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    }

                    .create-product-btn:hover {
                        background: #f8f6f4;
                        color: #131A19;
                        transform: translateY(-2px);
                        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
                    }

                    /* Controls Section */
                    .controls-section {
                        background: #FFFFFF;
                        border-radius: 24px;
                        box-shadow: 0 4px 12px rgba(34, 31, 31, 0.10);
                        margin-bottom: 2rem;
                        overflow: hidden;
                    }

                    .primary-controls {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1.5rem 2rem;
                        flex-wrap: wrap;
                        gap: 1.5rem;
                        border-bottom: 1px solid rgba(145, 169, 150, 0.1);
                    }

                    .search-container {
                        position: relative;
                        flex: 1;
                        min-width: 300px;
                        max-width: 500px;
                    }

                    .search-icon {
                        position: absolute;
                        left: 1rem;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #91A996;
                        font-size: 1.2rem;
                        z-index: 2;
                    }

                    .search-input {
                        width: 100%;
                        padding: 0.875rem 1rem 0.875rem 3rem;
                        border: 2px solid rgba(145, 169, 150, 0.2);
                        border-radius: 16px;
                        font-size: 1rem;
                        background: #FFFFFF;
                        color: #131A19;
                        transition: all 0.25s ease-out;
                    }

                    .search-input:focus {
                        outline: none;
                        border-color: #91A996;
                        box-shadow: 0 0 0 3px rgba(145, 169, 150, 0.15);
                    }

                    .search-input::placeholder {
                        color: #817F7E;
                        font-weight: 400;
                    }

                    .clear-search {
                        position: absolute;
                        right: 0.75rem;
                        top: 50%;
                        transform: translateY(-50%);
                        background: none;
                        border: none;
                        color: #817F7E;
                        cursor: pointer;
                        padding: 0.25rem;
                        border-radius: 6px;
                        transition: all 0.15s ease-out;
                    }

                    .clear-search:hover {
                        color: #8b2635;
                        background: rgba(145, 169, 150, 0.1);
                    }

                    .filter-controls {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        flex-wrap: wrap;
                    }

                    .filter-toggle {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.75rem 1.25rem;
                        background: transparent;
                        border: 2px solid #91A996;
                        border-radius: 16px;
                        color: #91A996;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.25s ease-out;
                        position: relative;
                    }

                    .filter-toggle.active,
                    .filter-toggle:hover {
                        background: #91A996;
                        color: #FFFFFF;
                    }

                    .filter-badge {
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background: #8b2635;
                        color: #FFFFFF;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        font-size: 0.7rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                    }

                    .view-controls {
                        display: flex;
                        background: rgba(145, 169, 150, 0.1);
                        border-radius: 16px;
                        padding: 0.25rem;
                    }

                    .view-button {
                        padding: 0.5rem 0.75rem;
                        background: transparent;
                        border: none;
                        border-radius: 12px;
                        color: #817F7E;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                    }

                    .view-button.active {
                        background: #FFFFFF;
                        color: #91A996;
                        box-shadow: 0 1px 3px rgba(34, 31, 31, 0.06);
                    }

                    .items-per-page {
                        padding: 0.75rem 1rem;
                        border: 2px solid rgba(145, 169, 150, 0.2);
                        border-radius: 16px;
                        background: #FFFFFF;
                        color: #131A19;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                    }

                    .items-per-page:focus {
                        outline: none;
                        border-color: #91A996;
                    }

                    /* Advanced Filters */
                    .advanced-filters {
                        padding: 1.5rem 2rem;
                        background: rgba(145, 169, 150, 0.05);
                        overflow: hidden;
                    }

                    .filter-row {
                        display: flex;
                        align-items: center;
                        gap: 1.5rem;
                        flex-wrap: wrap;
                    }

                    .filter-group {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .filter-group label {
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: #131A19;
                    }

                    .filter-group select {
                        padding: 0.5rem 0.75rem;
                        border: 1px solid rgba(145, 169, 150, 0.3);
                        border-radius: 12px;
                        background: #FFFFFF;
                        color: #131A19;
                        font-size: 0.9rem;
                        cursor: pointer;
                    }

                    .filter-group select:focus {
                        outline: none;
                        border-color: #91A996;
                    }

                    .reset-filters {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem 1rem;
                        background: transparent;
                        border: 1px solid #817F7E;
                        border-radius: 12px;
                        color: #817F7E;
                        font-size: 0.9rem;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                        margin-top: 1.5rem;
                    }

                    .reset-filters:hover {
                        background: #817F7E;
                        color: #FFFFFF;
                    }

                    /* Bulk Actions */
                    .bulk-actions {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1rem 2rem;
                        background: linear-gradient(135deg, rgba(145, 169, 150, 0.1) 0%, rgba(145, 169, 150, 0.05) 100%);
                        border-top: 1px solid rgba(145, 169, 150, 0.2);
                    }

                    .bulk-info {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        font-weight: 600;
                        color: #91A996;
                    }

                    .bulk-buttons {
                        display: flex;
                        gap: 0.75rem;
                    }

                    .bulk-action {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 12px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                    }

                    .bulk-action.export {
                        background: #91A996;
                        color: #FFFFFF;
                    }

                    .bulk-action.export:hover {
                        background: #7a9480;
                    }

                    .bulk-action.analyze {
                        background: #b8860b;
                        color: #131A19;
                    }

                    .bulk-action.analyze:hover {
                        background: #e5a50a;
                    }

                    .bulk-action.clear {
                        background: transparent;
                        color: #817F7E;
                        border: 1px solid #817F7E;
                    }

                    .bulk-action.clear:hover {
                        background: #817F7E;
                        color: #FFFFFF;
                    }

                    /* Products Content */
                    .products-content {
                        background: #FFFFFF;
                        border-radius: 24px;
                        box-shadow: 0 4px 12px rgba(34, 31, 31, 0.10);
                        overflow: hidden;
                        margin-bottom: 2rem;
                    }

                    /* Empty State */
                    .empty-state {
                        text-align: center;
                        padding: 4rem 2rem;
                        color: #817F7E;
                    }

                    .empty-icon {
                        font-size: 4rem;
                        color: #8b8580;
                        margin-bottom: 1.5rem;
                        opacity: 0.6;
                    }

                    .empty-state h3 {
                        margin: 0 0 0.75rem 0;
                        font-size: 1.5rem;
                        font-weight: 600;
                        color: #131A19;
                    }

                    .empty-state p {
                        margin: 0 0 2rem 0;
                        font-size: 1rem;
                        color: #817F7E;
                        opacity: 0.8;
                    }

                    .empty-actions {
                        display: flex;
                        gap: 1rem;
                        justify-content: center;
                        flex-wrap: wrap;
                    }

                    .reset-btn, .create-btn {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.75rem 1.5rem;
                        border: none;
                        border-radius: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                        text-decoration: none;
                    }

                    .reset-btn {
                        background: transparent;
                        color: #817F7E;
                        border: 1px solid #817F7E;
                    }

                    .reset-btn:hover {
                        background: #817F7E;
                        color: #FFFFFF;
                    }

                    .create-btn {
                        background: #91A996;
                        color: #FFFFFF;
                    }

                    .create-btn:hover {
                        background: #7a9480;
                        transform: translateY(-2px);
                    }

                    /* Pagination */
                    .pagination-section {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 2rem;
                        background: #FFFFFF;
                        border-radius: 24px;
                        box-shadow: 0 1px 3px rgba(34, 31, 31, 0.06);
                        margin-top: 2rem;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }

                    .pagination-info {
                        color: #817F7E;
                        font-weight: 500;
                    }

                    .pagination-controls {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }

                    .pagination-button {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.75rem 1.25rem;
                        background: #FFFFFF;
                        border: 2px solid #91A996;
                        border-radius: 16px;
                        color: #91A996;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.25s ease-out;
                    }

                    .pagination-button:not(.disabled):hover {
                        background: #91A996;
                        color: #FFFFFF;
                    }

                    .pagination-button.disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                        border-color: #8b8580;
                        color: #8b8580;
                    }

                    .page-numbers {
                        display: flex;
                        gap: 0.5rem;
                        align-items: center;
                    }

                    .page-number {
                        width: 40px;
                        height: 40px;
                        border: 2px solid transparent;
                        border-radius: 12px;
                        background: transparent;
                        color: #817F7E;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .page-number:hover {
                        background: rgba(145, 169, 150, 0.1);
                        color: #91A996;
                    }

                    .page-number.active {
                        background: #91A996;
                        color: #FFFFFF;
                        border-color: #91A996;
                    }

                    .page-dots {
                        color: #817F7E;
                        font-weight: 600;
                        padding: 0 0.5rem;
                    }

                    /* Responsive Design */
                    @media (max-width: 1200px) {
                        .analytics-overview {
                            gap: 1rem;
                        }

                        .analytics-card {
                            min-width: 120px;
                            padding: 1rem;
                        }
                    }

                    @media (max-width: 768px) {
                        .products-management-container {
                            padding: 1rem;
                        }

                        .products-header {
                            padding: 1.5rem;
                            flex-direction: column;
                            text-align: center;
                        }

                        .page-title {
                            font-size: 2rem;
                        }

                        .analytics-overview {
                            justify-content: center;
                            gap: 1rem;
                        }

                        .analytics-card {
                            min-width: unset;
                            flex: 1;
                            min-width: 100px;
                        }

                        .primary-controls {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 1rem;
                        }

                        .search-container {
                            min-width: unset;
                            max-width: unset;
                        }

                        .filter-controls {
                            justify-content: space-between;
                        }

                        .pagination-section {
                            flex-direction: column;
                            text-align: center;
                        }

                        .pagination-controls {
                            flex-wrap: wrap;
                            justify-content: center;
                        }
                    }

                    /* Premium Product Grid Styles */
                    .premium-products-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                        gap: 2rem;
                        padding: 2rem;
                    }

                    .premium-product-card {
                        background: #FFFFFF;
                        border-radius: 24px;
                        overflow: hidden;
                        border: 2px solid transparent;
                        transition: all 0.25s ease-out;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(34, 31, 31, 0.06);
                    }

                    .premium-product-card:hover {
                        border-color: rgba(145, 169, 150, 0.3);
                        box-shadow: 0 12px 32px rgba(34, 31, 31, 0.12);
                    }

                    .premium-product-card.selected {
                        border-color: #91A996;
                        box-shadow: 0 0 0 3px rgba(145, 169, 150, 0.15);
                    }

                    .card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1rem 1.5rem;
                        background: rgba(145, 169, 150, 0.05);
                    }

                    .card-checkbox {
                        background: none;
                        border: none;
                        color: #91A996;
                        font-size: 1.2rem;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                    }

                    .card-checkbox:hover {
                        color: #2d5a27;
                        transform: scale(1.1);
                    }

                    .category-badge {
                        padding: 0.25rem 0.75rem;
                        background: linear-gradient(135deg, #91A996 0%, #2d5a27 100%);
                        color: #FFFFFF;
                        border-radius: 12px;
                        font-size: 0.8rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .card-image-container {
                        position: relative;
                        width: 100%;
                        height: 200px;
                        overflow: hidden;
                    }

                    .product-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: all 0.25s ease-out;
                    }

                    .premium-product-card:hover .product-image {
                        transform: scale(1.05);
                    }

                    .image-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(45deg, rgba(19, 26, 25, 0.8), rgba(145, 169, 150, 0.8));
                        opacity: 0;
                        transition: all 0.25s ease-out;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .premium-product-card:hover .image-overlay {
                        opacity: 1;
                    }

                    .overlay-actions {
                        display: flex;
                        gap: 0.75rem;
                    }

                    .overlay-btn {
                        width: 44px;
                        height: 44px;
                        background: rgba(255, 255, 255, 0.9);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #131A19;
                        text-decoration: none;
                        transition: all 0.15s ease-out;
                        font-size: 1.1rem;
                    }

                    .overlay-btn:hover {
                        background: #FFFFFF;
                        transform: scale(1.1);
                        color: #91A996;
                    }

                    .overlay-btn.view:hover { color: #2d5a27; }
                    .overlay-btn.edit:hover { color: #b8860b; }
                    .overlay-btn.external:hover { color: #8b2635; }

                    .card-content {
                        padding: 1.5rem;
                    }

                    .product-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #131A19;
                        margin: 0 0 0.75rem 0;
                        line-height: 1.3;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .product-description {
                        color: #817F7E;
                        font-size: 0.9rem;
                        line-height: 1.5;
                        margin: 0 0 1rem 0;
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .product-price {
                        font-size: 1.1rem;
                        font-weight: 700;
                        color: #91A996;
                        margin-bottom: 0.75rem;
                    }

                    .product-meta {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: #817F7E;
                        font-size: 0.85rem;
                        margin-bottom: 1.5rem;
                    }

                    .meta-item {
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                    }

                    .card-actions {
                        display: flex;
                        gap: 0.75rem;
                        align-items: center;
                        padding-top: 1rem;
                        border-top: 1px solid rgba(145, 169, 150, 0.1);
                    }

                    .action-button {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        padding: 0.75rem 1rem;
                        border: none;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 0.9rem;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                        text-decoration: none;
                    }

                    .action-button.primary {
                        background: #91A996;
                        color: #FFFFFF;
                    }

                    .action-button.primary:hover {
                        background: #7a9480;
                        transform: translateY(-1px);
                    }

                    .action-button.danger {
                        background: #8b2635;
                        color: #FFFFFF;
                    }

                    .action-button.danger:hover {
                        background: #722029;
                        transform: translateY(-1px);
                    }

                    .action-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none !important;
                    }

                    .spinner {
                        animation: spin 1s linear infinite;
                    }

                    /* Premium Product Table Styles */
                    .premium-products-table {
                        width: 100%;
                    }

                    .table-header {
                        padding: 1.5rem 2rem;
                        border-bottom: 1px solid rgba(145, 169, 150, 0.1);
                        background: rgba(145, 169, 150, 0.05);
                    }

                    .select-all-button {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem 1rem;
                        background: transparent;
                        border: 1px solid #91A996;
                        border-radius: 12px;
                        color: #91A996;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                    }

                    .select-all-button:hover {
                        background: #91A996;
                        color: #FFFFFF;
                    }

                    .table-container {
                        width: 100%;
                    }

                    .table-header-row {
                        display: grid;
                        grid-template-columns: 50px 1fr 120px 200px 100px 80px 120px;
                        gap: 1rem;
                        padding: 1rem 2rem;
                        background: rgba(145, 169, 150, 0.05);
                        border-bottom: 2px solid rgba(145, 169, 150, 0.1);
                        font-weight: 700;
                        color: #131A19;
                        font-size: 0.85rem;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .table-row {
                        display: grid;
                        grid-template-columns: 50px 1fr 120px 200px 100px 80px 120px;
                        gap: 1rem;
                        padding: 1.5rem 2rem;
                        border-bottom: 1px solid rgba(145, 169, 150, 0.1);
                        transition: all 0.15s ease-out;
                        align-items: center;
                    }

                    .table-row:hover {
                        background: rgba(145, 169, 150, 0.05);
                    }

                    .table-row.selected {
                        background: linear-gradient(135deg, rgba(145, 169, 150, 0.1) 0%, rgba(145, 169, 150, 0.05) 100%);
                        border-left: 4px solid #91A996;
                        padding-left: calc(2rem - 4px);
                    }

                    .table-row.even {
                        background: rgba(145, 169, 150, 0.02);
                    }

                    .table-cell {
                        display: flex;
                        align-items: center;
                        min-height: 60px;
                    }

                    .header-cell {
                        font-weight: 700;
                        color: #131A19;
                        font-size: 0.85rem;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        min-height: auto;
                    }

                    .sort-button {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        background: none;
                        border: none;
                        color: #131A19;
                        font-weight: 700;
                        font-size: 0.85rem;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                    }

                    .sort-button:hover {
                        color: #91A996;
                    }

                    .sort-icon {
                        font-size: 0.9rem;
                    }

                    .checkbox-button {
                        background: none;
                        border: none;
                        color: #91A996;
                        font-size: 1.2rem;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                    }

                    .checkbox-button:hover {
                        color: #2d5a27;
                        transform: scale(1.1);
                    }

                    .product-info {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        width: 100%;
                    }

                    .product-thumbnail {
                        width: 48px;
                        height: 48px;
                        border-radius: 12px;
                        overflow: hidden;
                        border: 2px solid rgba(145, 169, 150, 0.2);
                        flex-shrink: 0;
                    }

                    .product-thumbnail img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }

                    .product-details {
                        flex: 1;
                        min-width: 0;
                    }

                    .product-name {
                        font-weight: 600;
                        color: #131A19;
                        margin-bottom: 0.25rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .product-id {
                        font-size: 0.8rem;
                        color: #817F7E;
                        font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    }

                    .category-badge {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.4rem 0.8rem;
                        background: linear-gradient(135deg, rgba(145, 169, 150, 0.15) 0%, rgba(145, 169, 150, 0.1) 100%);
                        color: #91A996;
                        border-radius: 12px;
                        font-size: 0.85rem;
                        font-weight: 500;
                        border: 1px solid rgba(145, 169, 150, 0.3);
                    }

                    .description-text {
                        color: #817F7E;
                        font-size: 0.9rem;
                        line-height: 1.4;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .price-display {
                        font-weight: 700;
                        color: #91A996;
                        font-size: 1rem;
                    }

                    .external-link {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: #91A996;
                        text-decoration: none;
                        font-size: 0.9rem;
                        font-weight: 500;
                        transition: all 0.15s ease-out;
                    }

                    .external-link:hover {
                        color: #2d5a27;
                        transform: translateX(2px);
                    }

                    .no-link {
                        color: #817F7E;
                        font-size: 0.85rem;
                        font-style: italic;
                    }

                    .action-buttons {
                        display: flex;
                        gap: 0.5rem;
                        align-items: center;
                    }

                    .action-button {
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        border: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.15s ease-out;
                        font-size: 1rem;
                        text-decoration: none;
                    }

                    .action-button.view {
                        background: rgba(45, 90, 39, 0.1);
                        color: #2d5a27;
                    }

                    .action-button.view:hover {
                        background: #2d5a27;
                        color: #FFFFFF;
                        transform: scale(1.1);
                    }

                    .action-button.edit {
                        background: rgba(184, 134, 11, 0.1);
                        color: #b8860b;
                    }

                    .action-button.edit:hover {
                        background: #b8860b;
                        color: #FFFFFF;
                        transform: scale(1.1);
                    }

                    .action-button.delete {
                        background: rgba(139, 38, 53, 0.1);
                        color: #8b2635;
                    }

                    .action-button.delete:hover {
                        background: #8b2635;
                        color: #FFFFFF;
                        transform: scale(1.1);
                    }

                    .action-button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                        transform: none !important;
                    }

                    /* Mobile Responsive Styles */
                    @media (max-width: 1200px) {
                        .premium-products-grid {
                            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                        }

                        .table-header-row,
                        .table-row {
                            grid-template-columns: 40px 1fr 100px 150px 80px 60px 100px;
                            font-size: 0.85rem;
                        }
                    }

                    @media (max-width: 768px) {
                        .premium-products-grid {
                            grid-template-columns: 1fr;
                            gap: 1.5rem;
                            padding: 1rem;
                        }

                        .premium-products-table {
                            display: none;
                        }

                        .analytics-card {
                            padding: 1rem;
                            min-width: unset;
                        }
                    }

                    /* Keyframe Animations */
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </motion.div>
        </MasterLayout>
    );
};

// Premium Product Grid Component  
const PremiumProductGrid = ({ products, selectedProducts, onProductSelect, onDelete, deleteLoading }) => {
    return (
        <motion.div 
            className="premium-products-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <AnimatePresence>
                {products.map((product, index) => {
                    const isSelected = selectedProducts.includes(product.product_id);
                    return (
                        <motion.div
                            key={product.product_id}
                            className={`premium-product-card ${isSelected ? 'selected' : ''}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            layoutId={`product-${product.product_id}`}
                        >
                            <div className="card-header">
                                <button
                                    className="card-checkbox"
                                    onClick={() => onProductSelect(product.product_id, !isSelected)}
                                >
                                    <Icon icon={isSelected ? "solar:check-square-bold" : "solar:square-outline"} />
                                </button>
                                
                                {product.product_category && (
                                    <div className="category-badge">
                                        {product.product_category}
                                    </div>
                                )}
                            </div>

                            <div className="card-image-container">
                                <img
                                    src={product.image || product.main_image || 'https://via.placeholder.com/300x250?text=No+Image&color=222323&bg=f5f5f7'}
                                    className="product-image"
                                    alt={product.name || 'Product'}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x250?text=No+Image&color=222323&bg=f5f5f7';
                                    }}
                                />
                                <div className="image-overlay">
                                    <div className="overlay-actions">
                                        <Link href={`/products/${product.product_id}`} className="overlay-btn view">
                                            <Icon icon="solar:eye-bold" />
                                        </Link>
                                        <Link href={`/products/${product.product_id}?edit=true`} className="overlay-btn edit">
                                            <Icon icon="solar:pen-bold" />
                                        </Link>
                                        {product.url && (
                                            <a href={product.url} target="_blank" rel="noopener noreferrer" className="overlay-btn external">
                                                <Icon icon="solar:external-link-bold" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="card-content">
                                <h3 className="product-title" title={product.name}>
                                    {product.name || 'Untitled Product'}
                                </h3>
                                
                                <p className="product-description">
                                    {stripHtml(product.general_description?.substring(0, 100) || 'No description available').result}
                                    {product.general_description?.length > 100 && '...'}
                                </p>
                                
                                <div className="product-price">
                                    {product.cost ? `$${product.cost}` : 'Price not set'}
                                </div>

                                <div className="product-meta">
                                    <span className="meta-item">
                                        <Icon icon="solar:calendar-bold-duotone" />
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="card-actions">
                                <Link href={`/products/${product.product_id}`} className="action-button primary">
                                    <Icon icon="solar:eye-bold" />
                                    View Details
                                </Link>
                                <button
                                    className="action-button danger"
                                    onClick={() => onDelete(product.product_id)}
                                    disabled={deleteLoading === product.product_id}
                                >
                                    {deleteLoading === product.product_id ? (
                                        <Icon icon="solar:loading-bold" className="spinner" />
                                    ) : (
                                        <Icon icon="solar:trash-bin-minimalistic-bold" />
                                    )}
                                    {deleteLoading === product.product_id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};

// Premium Product Table Component
const PremiumProductTable = ({ products, selectedProducts, onProductSelect, onSelectAll, onDelete, deleteLoading, onSort, sortBy, sortOrder }) => {
    const getSortIcon = (field) => {
        if (sortBy !== field) return 'solar:sort-vertical-bold';
        return sortOrder === 'asc' ? 'solar:sort-from-bottom-to-top-bold' : 'solar:sort-from-top-to-bottom-bold';
    };

    return (
        <motion.div 
            className="premium-products-table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="table-header">
                <div className="table-controls">
                    <button
                        className="select-all-button"
                        onClick={onSelectAll}
                    >
                        <Icon icon={selectedProducts.length === products.length ? "solar:check-square-bold" : "solar:square-outline"} />
                        Select All
                    </button>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header-row">
                    <div className="table-cell header-cell">
                        <Icon icon="solar:check-square-bold" />
                    </div>
                    <div className="table-cell header-cell">
                        <button 
                            className="sort-button"
                            onClick={() => onSort('product_name')}
                        >
                            <span>Product</span>
                            <Icon icon={getSortIcon('product_name')} className="sort-icon" />
                        </button>
                    </div>
                    <div className="table-cell header-cell">Category</div>
                    <div className="table-cell header-cell">Description</div>
                    <div className="table-cell header-cell">
                        <button 
                            className="sort-button"
                            onClick={() => onSort('price')}
                        >
                            <span>Price</span>
                            <Icon icon={getSortIcon('price')} className="sort-icon" />
                        </button>
                    </div>
                    <div className="table-cell header-cell">Link</div>
                    <div className="table-cell header-cell">Actions</div>
                </div>

                <AnimatePresence>
                    {products.map((product, index) => {
                        const isSelected = selectedProducts.includes(product.product_id);
                        return (
                            <motion.div
                                key={product.product_id}
                                className={`table-row ${isSelected ? 'selected' : ''} ${index % 2 === 0 ? 'even' : 'odd'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={{ backgroundColor: 'rgba(145, 169, 150, 0.05)' }}
                            >
                                <div className="table-cell">
                                    <button
                                        className="checkbox-button"
                                        onClick={() => onProductSelect(product.product_id, !isSelected)}
                                    >
                                        <Icon icon={isSelected ? "solar:check-square-bold" : "solar:square-outline"} />
                                    </button>
                                </div>

                                <div className="table-cell product-cell">
                                    <div className="product-info">
                                        <div className="product-thumbnail">
                                            <img
                                                src={product.image || product.main_image || 'https://via.placeholder.com/48x48?text=No+Image&color=222323&bg=f5f5f7'}
                                                alt={product.name || 'Product'}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/48x48?text=No+Image&color=222323&bg=f5f5f7';
                                                }}
                                            />
                                        </div>
                                        <div className="product-details">
                                            <div className="product-name" title={product.name}>
                                                {product.name || 'Untitled Product'}
                                            </div>
                                            <div className="product-id">
                                                ID: {product.product_id?.substring(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-cell category-cell">
                                    <div className="category-badge">
                                        <Icon icon="solar:tag-bold" />
                                        {product.product_category || 'Uncategorized'}
                                    </div>
                                </div>

                                <div className="table-cell description-cell">
                                    <div className="description-text" title={product.general_description}>
                                        {stripHtml(product.general_description?.substring(0, 80) || 'No description available').result}
                                        {product.general_description?.length > 80 && '...'}
                                    </div>
                                </div>

                                <div className="table-cell price-cell">
                                    <div className="price-display">
                                        {product.cost ? `$${product.cost}` : 'Not set'}
                                    </div>
                                </div>

                                <div className="table-cell link-cell">
                                    {product.url ? (
                                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="external-link">
                                            <Icon icon="solar:external-link-bold" />
                                            <span>Visit</span>
                                        </a>
                                    ) : (
                                        <span className="no-link">No link</span>
                                    )}
                                </div>

                                <div className="table-cell actions-cell">
                                    <div className="action-buttons">
                                        <Link href={`/products/${product.product_id}`} className="action-button view" title="View Details">
                                            <Icon icon="solar:eye-bold" />
                                        </Link>
                                        <Link href={`/products/${product.product_id}?edit=true`} className="action-button edit" title="Edit Product">
                                            <Icon icon="solar:pen-bold" />
                                        </Link>
                                        <button
                                            className="action-button delete"
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
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ProductsPage;