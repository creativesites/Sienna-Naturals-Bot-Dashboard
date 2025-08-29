"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from 'react-toastify';
import Link from 'next/link';

import ImageUrlRepeater from "@/components/child/ImageUrlRepeater";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

const EditProductPage = ({ params }) => {
    const router = useRouter();
    
    const [product, setProduct] = useState({
        name: '',
        general_description: '',
        product_category: '',
        cost: '',
        details: {},
        main_image: '',
        images: [],
        url: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const { productId } = params;

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/products/${productId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error('Product not found');
                        router.push('/products');
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                setProduct({
                    ...data.product,
                    details: data.product.details || {},
                    images: data.product.images || []
                });

            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, router]);

    // Validation rules
    const validateForm = () => {
        const newErrors = {};
        
        if (!product.name?.trim()) {
            newErrors.name = 'Product name is required';
        } else if (product.name.length < 2) {
            newErrors.name = 'Product name must be at least 2 characters';
        } else if (product.name.length > 255) {
            newErrors.name = 'Product name must be less than 255 characters';
        }
        
        if (!product.general_description?.trim()) {
            newErrors.general_description = 'Description is required';
        } else if (product.general_description.length < 10) {
            newErrors.general_description = 'Description must be at least 10 characters';
        } else if (product.general_description.length > 2000) {
            newErrors.general_description = 'Description must be less than 2000 characters';
        }
        
        if (!product.product_category?.trim()) {
            newErrors.product_category = 'Category is required';
        } else if (product.product_category.length > 100) {
            newErrors.product_category = 'Category must be less than 100 characters';
        }
        
        if (!product.cost?.trim()) {
            newErrors.cost = 'Cost is required';
        }
        
        if (product.main_image && !isValidUrl(product.main_image)) {
            newErrors.main_image = 'Please enter a valid URL';
        }
        
        if (product.url && !isValidUrl(product.url)) {
            newErrors.url = 'Please enter a valid URL';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            details: {
                ...prevProduct.details,
                [name]: value
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors before submitting');
            return;
        }
        
        setSaving(true);

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(product),
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                if (responseData.details && Array.isArray(responseData.details)) {
                    // Handle validation errors from API
                    const validationErrors = {};
                    responseData.details.forEach(error => {
                        validationErrors[error.path[0]] = error.message;
                    });
                    setErrors(validationErrors);
                    toast.error('Please fix the validation errors');
                } else {
                    toast.error(responseData.error || 'Failed to update product');
                }
                return;
            }

            toast.success('Product updated successfully!');
            router.push("/products");
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error('Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    // Common categories for dropdown
    const commonCategories = [
        'Hair Care',
        'Skin Care', 
        'Beauty Tools',
        'Supplements',
        'Styling Products',
        'Treatment Products',
        'Accessories'
    ];

    if (loading) {
        return (
            <MasterLayout>
                <Breadcrumb title="Edit Product" />
                <div className="d-flex align-items-center justify-content-center py-5">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Loading product details...</p>
                    </div>
                </div>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <Breadcrumb title={`Edit ${product.name}`} />
            
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <img
                                                src={product.main_image || 'https://via.placeholder.com/60x60?text=No+Image'}
                                                alt={product.name}
                                                className="rounded"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="mb-1 fw-bold text-dark">
                                                <Icon icon="material-symbols:edit" className="me-2 text-primary" />
                                                Edit Product
                                            </h4>
                                            <p className="text-muted mb-0">
                                                Update product information and details
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 text-md-end">
                                    <Link href={`/products/${productId}`} className="btn btn-outline-secondary me-2">
                                        <Icon icon="material-symbols:visibility" className="me-2" />
                                        View Product
                                    </Link>
                                    <Link href="/products" className="btn btn-outline-primary">
                                        <Icon icon="material-symbols:arrow-back" className="me-2" />
                                        Back to Products
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className='col-lg-8'>
                    <div className='card border-0 shadow-sm'>
                        <div className='card-body p-4'>
                            <form onSubmit={handleSubmit}>
                                {/* Product Name */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Product Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={product.name}
                                        onChange={handleInputChange}
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        placeholder="Enter product name"
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                {/* Main Image URL */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Main Image URL</label>
                                    <input
                                        type="url"
                                        name="main_image"
                                        value={product.main_image}
                                        onChange={handleInputChange}
                                        className={`form-control ${errors.main_image ? 'is-invalid' : ''}`}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.main_image && <div className="invalid-feedback">{errors.main_image}</div>}
                                    {product.main_image && (
                                        <div className="mt-2">
                                            <img 
                                                src={product.main_image} 
                                                alt="Preview" 
                                                className="img-thumbnail" 
                                                style={{ maxWidth: '150px', maxHeight: '150px' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* Description */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Description <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        name="general_description"
                                        value={product.general_description}
                                        onChange={handleInputChange}
                                        className={`form-control ${errors.general_description ? 'is-invalid' : ''}`}
                                        rows="6"
                                        placeholder="Describe your product in detail..."
                                    />
                                    <div className="form-text">
                                        {(product.general_description || '').length}/2000 characters
                                    </div>
                                    {errors.general_description && <div className="invalid-feedback">{errors.general_description}</div>}
                                </div>
                                {/* Category and Cost Row */}
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Category <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                name="product_category"
                                                value={product.product_category}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.product_category ? 'is-invalid' : ''}`}
                                                placeholder="Enter category"
                                                list="category-suggestions"
                                            />
                                            <datalist id="category-suggestions">
                                                {commonCategories.map(cat => (
                                                    <option key={cat} value={cat} />
                                                ))}
                                            </datalist>
                                        </div>
                                        {errors.product_category && <div className="invalid-feedback">{errors.product_category}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Cost <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="cost"
                                            value={product.cost}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.cost ? 'is-invalid' : ''}`}
                                            placeholder="$29.99"
                                        />
                                        {errors.cost && <div className="invalid-feedback">{errors.cost}</div>}
                                    </div>
                                </div>
                                {/* Additional Details */}
                                <div className="card bg-light border-0 mb-4">
                                    <div className="card-header bg-transparent border-0 pb-0">
                                        <h6 className="fw-semibold mb-0">
                                            <Icon icon="material-symbols:info" className="me-2" />
                                            Additional Details
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Details Text</label>
                                            <textarea
                                                rows={4}
                                                name="text"
                                                value={product.details?.text || ''}
                                                onChange={handleDetailsChange}
                                                className="form-control"
                                                placeholder="Additional product details..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Product URL */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Product URL</label>
                                    <input
                                        type="url"
                                        name="url"
                                        value={product.url}
                                        onChange={handleInputChange}
                                        className={`form-control ${errors.url ? 'is-invalid' : ''}`}
                                        placeholder="https://example.com/product"
                                    />
                                    {errors.url && <div className="invalid-feedback">{errors.url}</div>}
                                    <div className="form-text">Link to where customers can purchase this product</div>
                                </div>
                                {/* Additional Images */}
                                {product?.images && (
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Additional Images</label>
                                        <ImageUrlRepeater
                                            imageUrls={product.images}
                                            setImageUrls={(images) =>
                                                setProduct((prev) => ({ ...prev, images }))
                                            }
                                        />
                                        <div className="form-text">Add additional product images with captions</div>
                                    </div>
                                )}
                                {/* Form Actions */}
                                <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                                    <Link href={`/products/${productId}`} className="btn btn-outline-secondary">
                                        <Icon icon="material-symbols:arrow-back" className="me-2" />
                                        Cancel
                                    </Link>
                                    
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="material-symbols:save" className="me-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* Sidebar with preview */}
                <div className='col-lg-4'>
                    <div className='card border-0 shadow-sm'>
                        <div className='card-body'>
                            <h6 className="fw-bold mb-3">
                                <Icon icon="material-symbols:image" className="me-2 text-primary" />
                                Image Preview
                            </h6>
                            
                            {product?.main_image ? (
                                <img
                                    src={product.main_image}
                                    className='img-fluid rounded shadow-sm mb-3'
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="bg-light rounded d-flex align-items-center justify-content-center mb-3" style={{ height: '200px' }}>
                                    <Icon icon="material-symbols:image" className="display-4 text-muted" />
                                </div>
                            )}
                            
                            <div className="small text-muted">
                                <p className="mb-2"><strong>Product ID:</strong> {product.product_id}</p>
                                {product.created_at && (
                                    <p className="mb-0"><strong>Created:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Additional images preview */}
                    {product.images && product.images.length > 0 && (
                        <div className='card border-0 shadow-sm mt-4'>
                            <div className='card-body'>
                                <h6 className="fw-bold mb-3">
                                    <Icon icon="material-symbols:photo-library" className="me-2 text-primary" />
                                    Additional Images ({product.images.length})
                                </h6>
                                <div className="row g-2">
                                    {product.images.slice(0, 4).map((image, index) => (
                                        <div key={index} className="col-6">
                                            <img
                                                src={typeof image === 'string' ? image : image.url}
                                                alt={typeof image === 'object' ? image.caption : `Image ${index + 1}`}
                                                className="img-fluid rounded"
                                                style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {product.images.length > 4 && (
                                    <p className="small text-muted mt-2 mb-0">
                                        +{product.images.length - 4} more images
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MasterLayout>
        
    );
};

export default EditProductPage;