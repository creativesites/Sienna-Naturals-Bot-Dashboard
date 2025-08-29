"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from 'react-toastify';
import Link from 'next/link';

import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import ImageUrlRepeater from "@/components/child/ImageUrlRepeater";

const CreateProductPage = () => {
    const router = useRouter();

    // State for the product form
    const [product, setProduct] = useState({
        name: "",
        general_description: "",
        product_category: "",
        cost: "",
        main_image: "",
        url: "",
        details: {
            formula: "",
            madeFor: "",
            performance: "",
            howToUse: "",
            relatedProducts: ""
        },
        images: [], // Array for additional images
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    // Validation rules
    const validateForm = () => {
        const newErrors = {};
        
        if (!product.name.trim()) {
            newErrors.name = 'Product name is required';
        } else if (product.name.length < 2) {
            newErrors.name = 'Product name must be at least 2 characters';
        } else if (product.name.length > 255) {
            newErrors.name = 'Product name must be less than 255 characters';
        }
        
        if (!product.general_description.trim()) {
            newErrors.general_description = 'Description is required';
        } else if (product.general_description.length < 10) {
            newErrors.general_description = 'Description must be at least 10 characters';
        } else if (product.general_description.length > 2000) {
            newErrors.general_description = 'Description must be less than 2000 characters';
        }
        
        if (!product.product_category.trim()) {
            newErrors.product_category = 'Category is required';
        } else if (product.product_category.length > 100) {
            newErrors.product_category = 'Category must be less than 100 characters';
        }
        
        if (!product.cost.trim()) {
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

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    // Handle details input changes
    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({
            ...prev,
            details: {
                ...prev.details,
                [name]: value
            }
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors before submitting');
            return;
        }
        
        setLoading(true);

        try {
            // Prepare the product data for submission
            const productData = {
                ...product,
                images: product.images.filter((item) => item && (item.url || typeof item === 'string')), // Remove empty entries
            };

            // Send a POST request to create the product
            const response = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
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
                    toast.error(responseData.error || "Failed to create product");
                }
                return;
            }

            toast.success('Product created successfully!');
            // Redirect to the products list page after successful creation
            router.push("/products");
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error(error.message || 'Failed to create product');
        } finally {
            setLoading(false);
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

    return (
        <MasterLayout>
            <Breadcrumb title="Create New Product" />
            
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <h4 className="mb-0 fw-bold text-dark">
                                        <Icon icon="material-symbols:add-circle" className="me-2 text-primary" />
                                        Create New Product
                                    </h4>
                                    <p className="text-muted mb-0 mt-1">
                                        Add a new product to your catalog
                                    </p>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className={`btn ${showPreview ? 'btn-outline-primary' : 'btn-primary'}`}
                                            onClick={() => setShowPreview(false)}
                                        >
                                            <Icon icon="material-symbols:edit" className="me-2" />
                                            Edit Mode
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${showPreview ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setShowPreview(true)}
                                        >
                                            <Icon icon="material-symbols:visibility" className="me-2" />
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            {!showPreview ? (
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
                                            rows="4"
                                            placeholder="Describe your product in detail..."
                                        />
                                        <div className="form-text">
                                            {product.general_description.length}/2000 characters
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

                                    {/* Additional Details */}
                                    <div className="card bg-light border-0 mb-4">
                                        <div className="card-header bg-transparent border-0 pb-0">
                                            <h6 className="fw-semibold mb-0">
                                                <Icon icon="material-symbols:info" className="me-2" />
                                                Additional Details (Optional)
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            {/* Formula */}
                                            <div className="mb-3">
                                                <label className="form-label">Formula</label>
                                                <textarea
                                                    name="formula"
                                                    value={product.details.formula}
                                                    onChange={handleDetailsChange}
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Product formula or ingredients..."
                                                />
                                            </div>
                                            
                                            {/* Made For */}
                                            <div className="mb-3">
                                                <label className="form-label">Made For</label>
                                                <input
                                                    type="text"
                                                    name="madeFor"
                                                    value={product.details.madeFor}
                                                    onChange={handleDetailsChange}
                                                    className="form-control"
                                                    placeholder="Target audience or hair type..."
                                                />
                                            </div>
                                            
                                            {/* Performance */}
                                            <div className="mb-3">
                                                <label className="form-label">Performance</label>
                                                <input
                                                    type="text"
                                                    name="performance"
                                                    value={product.details.performance}
                                                    onChange={handleDetailsChange}
                                                    className="form-control"
                                                    placeholder="Expected results or benefits..."
                                                />
                                            </div>
                                            
                                            {/* How To Use */}
                                            <div className="mb-3">
                                                <label className="form-label">How To Use</label>
                                                <textarea
                                                    name="howToUse"
                                                    value={product.details.howToUse}
                                                    onChange={handleDetailsChange}
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Usage instructions..."
                                                />
                                            </div>
                                            
                                            {/* Related Products */}
                                            <div className="mb-0">
                                                <label className="form-label">Related Products</label>
                                                <input
                                                    type="text"
                                                    name="relatedProducts"
                                                    value={product.details.relatedProducts}
                                                    onChange={handleDetailsChange}
                                                    className="form-control"
                                                    placeholder="Comma-separated list of related products..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Images */}
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


                                    {/* Form Actions */}
                                    <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                                        <Link href="/products" className="btn btn-outline-secondary">
                                            <Icon icon="material-symbols:arrow-back" className="me-2" />
                                            Cancel
                                        </Link>
                                        
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="material-symbols:save" className="me-2" />
                                                    Create Product
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <ProductPreview product={product} />
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Sidebar with tips */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">
                                <Icon icon="material-symbols:lightbulb" className="me-2 text-warning" />
                                Tips for Better Products
                            </h6>
                            
                            <div className="list-group list-group-flush">
                                <div className="list-group-item border-0 px-0">
                                    <small className="text-muted d-block mb-1">Product Name</small>
                                    <small>Use clear, descriptive names that customers will search for</small>
                                </div>
                                <div className="list-group-item border-0 px-0">
                                    <small className="text-muted d-block mb-1">Description</small>
                                    <small>Include key benefits, ingredients, and what makes your product unique</small>
                                </div>
                                <div className="list-group-item border-0 px-0">
                                    <small className="text-muted d-block mb-1">Images</small>
                                    <small>Use high-quality images that show the product clearly</small>
                                </div>
                                <div className="list-group-item border-0 px-0">
                                    <small className="text-muted d-block mb-1">Category</small>
                                    <small>Choose the most relevant category to help customers find your product</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Preview card */}
                    {product.main_image && (
                        <div className="card border-0 shadow-sm mt-4">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">
                                    <Icon icon="material-symbols:image" className="me-2 text-primary" />
                                    Image Preview
                                </h6>
                                <img 
                                    src={product.main_image} 
                                    alt="Product preview" 
                                    className="img-fluid rounded"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MasterLayout>
    );
};

// Product Preview Component
const ProductPreview = ({ product }) => {
    return (
        <div className="product-preview">
            <h5 className="fw-bold mb-4">
                <Icon icon="material-symbols:visibility" className="me-2 text-primary" />
                Product Preview
            </h5>
            
            <div className="row">
                <div className="col-md-4">
                    {product.main_image ? (
                        <img 
                            src={product.main_image} 
                            alt={product.name} 
                            className="img-fluid rounded shadow-sm"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                            }}
                        />
                    ) : (
                        <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                            <Icon icon="material-symbols:image" className="display-4 text-muted" />
                        </div>
                    )}
                </div>
                <div className="col-md-8">
                    <h4 className="fw-bold">{product.name || 'Product Name'}</h4>
                    {product.product_category && (
                        <span className="badge bg-primary mb-3">{product.product_category}</span>
                    )}
                    {product.cost && (
                        <p className="fw-bold text-primary fs-4 mb-3">{product.cost}</p>
                    )}
                    <div className="mb-3">
                        <h6 className="fw-semibold">Description</h6>
                        <p className="text-muted">
                            {product.general_description || 'No description provided'}
                        </p>
                    </div>
                    
                    {/* Additional details */}
                    {Object.values(product.details).some(value => value) && (
                        <div className="mb-3">
                            <h6 className="fw-semibold">Additional Details</h6>
                            {product.details.formula && <p className="small mb-1"><strong>Formula:</strong> {product.details.formula}</p>}
                            {product.details.madeFor && <p className="small mb-1"><strong>Made For:</strong> {product.details.madeFor}</p>}
                            {product.details.performance && <p className="small mb-1"><strong>Performance:</strong> {product.details.performance}</p>}
                            {product.details.howToUse && <p className="small mb-1"><strong>How To Use:</strong> {product.details.howToUse}</p>}
                            {product.details.relatedProducts && <p className="small mb-1"><strong>Related Products:</strong> {product.details.relatedProducts}</p>}
                        </div>
                    )}
                    
                    {product.url && (
                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                            <Icon icon="material-symbols:open-in-new" className="me-2" />
                            View Product
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateProductPage;