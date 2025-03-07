"use client";
import React, {useState, useEffect, useRef} from 'react';
import { useRouter } from 'next/navigation';
import TermsConditionLayer from "@/components/TermsConditionLayer";
import { Icon } from '@iconify/react/dist/iconify.js'
import {Hearts} from "react-loader-spinner";
import ImagesPreviewCarousel from "@/components/child/ImagesPreviewCarousel";
import ImageUrlRepeater from "@/components/child/ImageUrlRepeater";
import CarouselWithArrows from "@/components/child/CarouselWithArrows";


const EditProductPage = ({ params }) => {
    const router = useRouter();
    const [product, setProduct] = useState({
        image_url: '',
        product_name: '',
        description: '',
        price: '',
        url: '',
        formula: '',
        madeFor: '',
        performance: '', // editor
        howToUse: '', // editor
        relatedProducts: '', //textarea
        image_urls: null // eg {"caption": "Product Comparison", "url": "https://thekingdomeconomy.com/wp-content/uploads/2024/07/Product-Comparison_16-1.jpg"}. users must also be able to edit caption.
    });
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    // Refs for the editors
    const formulaEditorRef = useRef(null);
    const descriptionEditorRef = useRef(null);
    const perfomanceEditorRef = useRef(null);
    const howToUseEditorRef = useRef(null);

    // Unwrap params using React.use()
    const { productId } = React.use(params);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${productId}`);
                if (!response.ok) {
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

        fetchProduct();
    }, [productId]);


    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };
    // Handle editor changes
    const handleEditorChange = (value, name) => {
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    // Handle formula editor change
    const handleFormulaChange = (value) => {
        setProduct((prev) => ({ ...prev, formula: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // Map product state fields to API fields
            const updatedProduct = {
                ...product,
                image_urls: product.image_urls.filter((item) => item.url && item.caption), // Remove empty entries
            };
    
            console.log("Updated Product:", updatedProduct); // Debugging
    
            const response = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedProduct),
            });
    
            const responseData = await response.json(); // Parse the response JSON
            //alert("API Response:", responseData); // Debugging
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            router.push("/products"); // Redirect to product list after update
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };


    return (
        <section>
            {loading? 
            <div className='d-flex align-items-center justify-content-between gap-8 pb-24' 
            style={{
                display:'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            >
                <p><strong>Loading Product</strong></p>
                    <Hearts
                        height="80"
                        width="80"
                        color="#4fa94d"
                        ariaLabel="hearts-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                    />
                </div>:
                <div className="row gy-4">
                    <div className='col-xxl-9 col-lg-8'>
                        <div className='card h-100 p-0 radius-12'>
                            <div className='card-body px-24 py-32'>
                                <div className='d-flex align-items-center justify-content-between mb-24'>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={product.product_name}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label">Image URL</label>
                                            <input
                                                type="text"
                                                name="image"
                                                value={product.image_url}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label">Description</label>
                                            <TermsConditionLayer
                                                value={product.description}
                                                onChange={handleEditorChange}
                                                name="description" // Field name to update
                                                ref={descriptionEditorRef}
                                                id="description-toolbar"
                                            />

                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label">Price</label>
                                            <input
                                                type="text"
                                                name="price"
                                                value={product.price}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label">URL</label>
                                            <input
                                                type="text"
                                                name="url"
                                                value={product.url}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            />
                                        </div>
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
                                        {product?.howToUse && (
                                           <div className="mb-4">
                                           <label className="form-label">How To Use</label>

                                           <TermsConditionLayer
                                               value={product.howToUse}
                                               onChange={handleEditorChange}
                                               name="howToUse" // Field name to update
                                               ref={howToUseEditorRef}
                                               id="howToUse-toolbar"
                                           />
                                       </div> 
                                        )}
                                        {product?.performance && (
                                           <div className="mb-4">
                                           <label className="form-label">Perfomance</label>

                                           <TermsConditionLayer
                                               value={product.performance}
                                               onChange={handleEditorChange}
                                               name="performance" // Field name to update
                                               ref={perfomanceEditorRef}
                                               id="performance-toolbar"
                                           />
                                       </div> 
                                        )}
                                        {product?.formula && (
                                            <div className="mb-4">
                                                <label className="form-label">Formula</label>

                                                <TermsConditionLayer
                                                    value={product.formula}
                                                    onChange={handleEditorChange}
                                                    name="formula" // Field name to update
                                                    ref={formulaEditorRef}
                                                    id="formula-toolbar"
                                                />
                                            </div>
                                        )}
                                        
                                        {product?.image_urls && product?.image_urls.length > 0 && (
                                            <div>
                                                <div className="mb-4">
                                                    <label className="form-label">Image URLs</label>
                                                    <ImageUrlRepeater
                                                        imageUrls={product.image_urls}
                                                        setImageUrls={(image_urls) =>
                                                            setProduct((prev) => ({ ...prev, image_urls }))
                                                        }
                                                    />
                                                </div>
                                                
                                                
                                            </div>
                                        )}
                                        
                                        <button
                                            type="submit"
                                            className="btn rounded-pill btn-primary-600 radius-8 px-20 py-11 d-flex align-items-center gap-2"
                                        >
                                            Save Changes
                                        </button>

                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-xxl-3 col-lg-4'>
                        <div className='card h-100'>
                        
                            <div className='card-body p-0'>
                            <div className='p-24 border-bottom'>
                                <h6 className="text-lg mb-0">Image Url Preview</h6>
                                <img
                                    src={product.image_url??'assets/images/card-component/card-img1.png'}
                                    className='card-img-top'
                                    alt=''
                                />
                            </div>
                                <div className='p-24 border-bottom'>
                                    {product?.image_urls && product?.image_urls.length > 0 && (
                                        <div>
                                            <div style={{width: '100%', maxWidth:'420px'}}>
                                                <ImagesPreviewCarousel imageUrls={product.image_urls} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className='px-24 py-20'>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

        </section>
    );
};

export default EditProductPage;