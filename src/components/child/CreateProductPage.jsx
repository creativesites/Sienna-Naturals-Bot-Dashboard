"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TermsConditionLayer from "@/components/TermsConditionLayer";
import ImageUrlRepeater from "@/components/child/ImageUrlRepeater";
import { Icon } from "@iconify/react/dist/iconify.js";

const CreateProductPage = () => {
    const router = useRouter();

    // State for the product form
    const [product, setProduct] = useState({
        image_url: "",
        product_name: "",
        description: "",
        price: "",
        url: "",
        formula: "",
        madeFor: "",
        performance: "",
        howToUse: "",
        relatedProducts: "",
        imageUrls: [], // Array for image URLs and captions
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    // Handle editor changes
    const handleEditorChange = (value, name) => {
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare the product data for submission
            const productData = {
                ...product,
                imageUrls: product.imageUrls.filter((item) => item.url && item.caption), // Remove empty entries
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
                throw new Error(responseData.error || "Failed to create product");
            }

            // Redirect to the products list page after successful creation
            router.push("/products");
        } catch (error) {
            setError(error.message);
            console.error("Error creating product:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
            <form onSubmit={handleSubmit}>
                {/* Product Name */}
                <div className="mb-4">
                    <label className="form-label">Product Name</label>
                    <input
                        type="text"
                        name="product_name"
                        value={product.product_name}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* Image URL */}
                <div className="mb-4">
                    <label className="form-label">Image URL</label>
                    <input
                        type="text"
                        name="image_url"
                        value={product.image_url}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="form-label">Description</label>
                    <TermsConditionLayer
                        value={product.description}
                        onChange={(value) => handleEditorChange(value, "description")}
                        name="description"
                        id="description-toolbar"
                    />
                </div>

                {/* Price */}
                <div className="mb-4">
                    <label className="form-label">Price</label>
                    <input
                        type="text"
                        name="price"
                        value={product.price}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* URL */}
                <div className="mb-4">
                    <label className="form-label">Product URL</label>
                    <input
                        type="text"
                        name="url"
                        value={product.url}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* Formula */}
                <div className="mb-4">
                    <label className="form-label">Formula</label>
                    <TermsConditionLayer
                        value={product.formula}
                        onChange={(value) => handleEditorChange(value, "formula")}
                        name="formula"
                        id="formula-toolbar"
                    />
                </div>

                {/* Image URLs and Captions */}
                <div className="mb-4">
                    <label className="form-label">Image URLs</label>
                    <ImageUrlRepeater
                        imageUrls={product.imageUrls}
                        setImageUrls={(imageUrls) =>
                            setProduct((prev) => ({ ...prev, imageUrls }))
                        }
                    />
                </div>

                {/* Made For */}
                <div className="mb-4">
                    <label className="form-label">Made For</label>
                    <input
                        type="text"
                        name="madeFor"
                        value={product.madeFor}
                        onChange={handleInputChange}
                        className="form-control"
                    />
                </div>

                {/* Performance */}
                <div className="mb-4">
                    <label className="form-label">Performance</label>
                    <input
                        type="text"
                        name="performance"
                        value={product.performance}
                        onChange={handleInputChange}
                        className="form-control"
                    />
                </div>

                {/* How To Use */}
                <div className="mb-4">
                    <label className="form-label">How To Use</label>
                    <input
                        type="text"
                        name="howToUse"
                        value={product.howToUse}
                        onChange={handleInputChange}
                        className="form-control"
                    />
                </div>

                {/* Related Products */}
                <div className="mb-4">
                    <label className="form-label">Related Products</label>
                    <input
                        type="text"
                        name="relatedProducts"
                        value={product.relatedProducts}
                        onChange={handleInputChange}
                        className="form-control"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                     className="btn rounded-pill btn-primary-600 radius-8 px-20 py-11 d-flex align-items-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="d-flex align-items-center gap-2">
                            <Icon icon="eos-icons:loading" className="icon" />
                            Creating...
                        </span>
                    ) : (
                        "Create Product"
                    )}
                </button>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 text-danger">
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreateProductPage;