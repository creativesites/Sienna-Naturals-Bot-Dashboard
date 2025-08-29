"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from 'react-toastify';
import Link from 'next/link';

import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

const ProductDetailPage = ({ params }) => {
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    
    const { productId } = params;

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/products/${productId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Product not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setProduct(data.product);
            
        } catch (error) {
            setError(error.message);
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }
        
        setDeleteLoading(true);
        
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete product');
            }
            
            toast.success('Product deleted successfully');
            router.push('/products');
            
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error(error.message || 'Failed to delete product');
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get all available images
    const getAllImages = () => {
        const images = [];
        if (product?.main_image) {
            images.push({ url: product.main_image, caption: 'Main Image' });
        }
        if (product?.images && Array.isArray(product.images)) {
            product.images.forEach((img, index) => {
                if (img.url || typeof img === 'string') {
                    images.push({
                        url: typeof img === 'string' ? img : img.url,
                        caption: typeof img === 'object' ? img.caption || `Image ${index + 1}` : `Image ${index + 1}`
                    });
                }
            });
        }
        return images;
    };

    const allImages = product ? getAllImages() : [];

    // Premium Loading component
    if (loading) {
        return (
            <MasterLayout>
                <Breadcrumb title="Product Details" />
                <div className="myavana-loading-container">
                    <div className="loading-content">
                        <div className="loading-animation">
                            <Icon icon="solar:loading-bold" className="loading-icon spinner" />
                        </div>
                        <div className="loading-text">
                            <h4 className="loading-title">LOADING PRODUCT</h4>
                            <p className="loading-subtitle">Retrieving your premium product details...</p>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    // Premium Error component
    if (error) {
        return (
            <MasterLayout>
                <Breadcrumb title="Product Details" />
                <div className="myavana-error-container">
                    <div className="error-content">
                        <div className="error-icon-wrapper">
                            <Icon icon="solar:danger-bold-duotone" className="error-icon" />
                        </div>
                        <div className="error-text">
                            <h4 className="error-title">PRODUCT LOADING FAILED</h4>
                            <p className="error-message">{error}</p>
                            <p className="error-subtitle">We couldn't retrieve the product details. Please try again or return to the catalog.</p>
                        </div>
                        <div className="action-group">
                            <button 
                                className="myavana-btn-secondary"
                                onClick={fetchProduct}
                            >
                                <Icon icon="solar:refresh-bold" className="btn-icon" />
                                Try Again
                            </button>
                            <Link href="/products" className="myavana-btn-primary">
                                <Icon icon="solar:arrow-left-bold" className="btn-icon" />
                                Back to Catalog
                            </Link>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    if (!product) {
        return (
            <MasterLayout>
                <Breadcrumb title="Product Details" />
                <div className="myavana-empty-container">
                    <div className="empty-content">
                        <div className="empty-illustration">
                            <Icon icon="solar:box-bold-duotone" className="empty-icon" />
                        </div>
                        <div className="empty-text">
                            <h3 className="empty-title">PRODUCT NOT FOUND</h3>
                            <p className="empty-message">
                                The requested product could not be found in your catalog. It may have been removed or the link may be incorrect.
                            </p>
                        </div>
                        <Link href="/products" className="myavana-btn-primary">
                            <Icon icon="solar:arrow-left-bold" className="btn-icon" />
                            Return to Catalog
                        </Link>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <Breadcrumb title={product.name} />
            
            {/* Premium Header Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="myavana-product-detail-header">
                        <div className="premium-card">
                            <div className="card-body p-5">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <div className="product-header-info">
                                            <div className="product-thumbnail">
                                                <img
                                                    src={product.main_image || 'https://via.placeholder.com/80x80?text=No+Image&color=222323&bg=f5f5f7'}
                                                    alt={product.name}
                                                    className="header-product-image"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image&color=222323&bg=f5f5f7';
                                                    }}
                                                />
                                            </div>
                                            <div className="product-title-section">
                                                <h1 className="product-detail-title">{product.name}</h1>
                                                <div className="product-meta-tags">
                                                    {product.product_category && (
                                                        <span className="category-badge">
                                                            <Icon icon="solar:tag-bold" className="category-icon" />
                                                            {product.product_category}
                                                        </span>
                                                    )}
                                                    <span className="product-id-tag">
                                                        <Icon icon="solar:hashtag-bold" className="id-icon" />
                                                        {product.product_id.substring(0, 8)}...
                                                    </span>
                                                </div>
                                                {product.cost && (
                                                    <div className="product-price-display">
                                                        {product.cost}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-md-end">
                                        <div className="product-actions-group">
                                            <Link href={`/products/${productId}?edit=true`} className="myavana-btn-secondary">
                                                <Icon icon="solar:pen-bold" className="btn-icon" />
                                                Edit Product
                                            </Link>
                                            <button
                                                className="delete-product-btn"
                                                onClick={handleDeleteProduct}
                                                disabled={deleteLoading}
                                            >
                                                {deleteLoading ? (
                                                    <>
                                                        <Icon icon="solar:loading-bold" className="btn-icon spinner" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Icon icon="solar:trash-bin-minimalistic-bold" className="btn-icon" />
                                                        Delete
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Column - Premium Image Gallery */}
                <div className="col-lg-6">
                    <div className="myavana-image-gallery">
                        <div className="gallery-card">
                            {/* Main Image Display */}
                            <div className="main-image-container">
                                <img
                                    src={allImages[selectedImageIndex]?.url || 'https://via.placeholder.com/600x450?text=No+Image&color=222323&bg=f5f5f7'}
                                    alt={allImages[selectedImageIndex]?.caption || product.name}
                                    className="main-product-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x450?text=No+Image&color=222323&bg=f5f5f7';
                                    }}
                                />
                                
                                {/* Image Navigation Controls */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            className="gallery-nav-btn nav-prev-btn"
                                            onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                                            disabled={selectedImageIndex === 0}
                                            title="Previous Image"
                                        >
                                            <Icon icon="solar:arrow-left-bold" />
                                        </button>
                                        <button
                                            className="gallery-nav-btn nav-next-btn"
                                            onClick={() => setSelectedImageIndex(Math.min(allImages.length - 1, selectedImageIndex + 1))}
                                            disabled={selectedImageIndex === allImages.length - 1}
                                            title="Next Image"
                                        >
                                            <Icon icon="solar:arrow-right-bold" />
                                        </button>
                                        
                                        {/* Image Counter */}
                                        <div className="image-counter">
                                            <span className="counter-text">
                                                {selectedImageIndex + 1} / {allImages.length}
                                            </span>
                                        </div>
                                    </>
                                )}
                                
                                {/* Image Caption */}
                                <div className="image-caption">
                                    <span className="caption-text">
                                        {allImages[selectedImageIndex]?.caption || product.name}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Premium Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="thumbnails-container">
                                    <h6 className="thumbnails-title">
                                        <Icon icon="solar:gallery-bold-duotone" className="me-2" />
                                        Gallery ({allImages.length} images)
                                    </h6>
                                    <div className="thumbnails-grid">
                                        {allImages.map((image, index) => (
                                            <div 
                                                key={index} 
                                                className={`thumbnail-item ${selectedImageIndex === index ? 'active' : ''}`}
                                                onClick={() => setSelectedImageIndex(index)}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.caption}
                                                    className="thumbnail-image"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image&color=222323&bg=f5f5f7';
                                                    }}
                                                />
                                                {selectedImageIndex === index && (
                                                    <div className="thumbnail-overlay">
                                                        <Icon icon="solar:eye-bold" className="overlay-icon" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Premium Product Details */}
                <div className="col-lg-6">
                    <div className="product-details-panel">
                        {/* Basic Information */}
                        <div className="detail-section">
                            <div className="myavana-detail-card">
                                <div className="detail-card-header">
                                    <h5 className="detail-card-title">
                                        <Icon icon="solar:info-circle-bold-duotone" className="title-icon" />
                                        ESSENTIAL DETAILS
                                    </h5>
                                </div>
                                <div className="detail-card-body">
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label className="detail-label">Product Name</label>
                                            <div className="detail-value primary">{product.name}</div>
                                        </div>
                                        <div className="detail-item">
                                            <label className="detail-label">Category</label>
                                            <div className="detail-value">
                                                <span className="category-badge">
                                                    <Icon icon="solar:tag-bold" className="category-icon" />
                                                    {product.product_category || 'Uncategorized'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <label className="detail-label">Price</label>
                                            <div className="detail-value price">
                                                {product.cost || 'Price not set'}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <label className="detail-label">Product Link</label>
                                            {product.url ? (
                                                <div className="detail-value">
                                                    <a 
                                                        href={product.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="external-link"
                                                    >
                                                        <Icon icon="solar:external-link-bold" className="me-1" />
                                                        <span className="link-text">Visit Product</span>
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="detail-value muted">No link provided</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="detail-section">
                            <div className="myavana-detail-card">
                                <div className="detail-card-header">
                                    <h5 className="detail-card-title">
                                        <Icon icon="solar:document-text-bold-duotone" className="title-icon" />
                                        PRODUCT DESCRIPTION
                                    </h5>
                                </div>
                                <div className="detail-card-body">
                                    <div 
                                        className="product-description-content"
                                        dangerouslySetInnerHTML={{
                                            __html: product.general_description || '<p class="no-description">No description provided for this product.</p>'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        {product.details && Object.keys(product.details).length > 0 && (
                            <div className="detail-section">
                                <div className="myavana-detail-card">
                                    <div className="detail-card-header">
                                        <h5 className="detail-card-title">
                                            <Icon icon="solar:list-bold-duotone" className="title-icon" />
                                            ADDITIONAL INFORMATION
                                        </h5>
                                    </div>
                                    <div className="detail-card-body">
                                        <div 
                                            className="additional-details-content"
                                            dangerouslySetInnerHTML={{
                                                __html: product.details.text || `<pre class="details-json">${JSON.stringify(product.details, null, 2)}</pre>`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="detail-section">
                            <div className="myavana-detail-card">
                                <div className="detail-card-header">
                                    <h5 className="detail-card-title">
                                        <Icon icon="solar:clock-circle-bold-duotone" className="title-icon" />
                                        PRODUCT METADATA
                                    </h5>
                                </div>
                                <div className="detail-card-body">
                                    <div className="metadata-grid">
                                        <div className="metadata-item">
                                            <label className="metadata-label">
                                                <Icon icon="solar:calendar-add-bold" className="label-icon" />
                                                Created Date
                                            </label>
                                            <div className="metadata-value">
                                                {product.created_at ? formatDate(product.created_at) : 'Unknown'}
                                            </div>
                                        </div>
                                        <div className="metadata-item">
                                            <label className="metadata-label">
                                                <Icon icon="solar:hashtag-bold" className="label-icon" />
                                                Product ID
                                            </label>
                                            <div className="metadata-value monospace">
                                                {product.product_id}
                                            </div>
                                        </div>
                                        {product.url && (
                                            <div className="metadata-item full-width">
                                                <label className="metadata-label">
                                                    <Icon icon="solar:link-bold" className="label-icon" />
                                                    Full URL
                                                </label>
                                                <div className="metadata-value url-value">
                                                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="full-url-link">
                                                        {product.url}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Action Bar */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="myavana-action-bar">
                        <div className="action-bar-card">
                            <div className="action-bar-content">
                                <div className="nav-section">
                                    <Link href="/products" className="myavana-btn-secondary back-btn">
                                        <Icon icon="solar:arrow-left-bold" className="btn-icon" />
                                        <span className="btn-text">Back to Catalog</span>
                                    </Link>
                                </div>
                                
                                <div className="actions-section">
                                    <div className="primary-actions">
                                        <Link href={`/products/${productId}?edit=true`} className="myavana-btn-primary edit-btn">
                                            <Icon icon="solar:pen-bold" className="btn-icon" />
                                            <span className="btn-text">Edit Product</span>
                                        </Link>
                                        
                                        {product.url && (
                                            <a 
                                                href={product.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="myavana-btn-secondary visit-btn"
                                            >
                                                <Icon icon="solar:external-link-bold" className="btn-icon" />
                                                <span className="btn-text">Visit Product</span>
                                            </a>
                                        )}
                                    </div>
                                    
                                    <div className="danger-actions">
                                        <button
                                            className="delete-product-btn-main"
                                            onClick={handleDeleteProduct}
                                            disabled={deleteLoading}
                                            title="Delete Product"
                                        >
                                            {deleteLoading ? (
                                                <>
                                                    <Icon icon="solar:loading-bold" className="btn-icon spinner" />
                                                    <span className="btn-text">Deleting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="solar:trash-bin-minimalistic-bold" className="btn-icon" />
                                                    <span className="btn-text">Delete Product</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default ProductDetailPage;