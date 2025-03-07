"use client";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProductTable from "@/components/child/ProductTable";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {Hearts} from "react-loader-spinner";

const Page = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data.products);
            } catch (error) {
                setError(error.message);
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleEditProduct = (productId) => {
        router.push(`/products/${productId}`);
    };

    const handleDeleteProduct = (productId) => {
        console.log(`Delete product with ID: ${productId}`);
    };


    return (
        <>
            <MasterLayout>
                <Breadcrumb title='Products' />
                {loading? 
                    <div className='d-flex align-items-center justify-content-between gap-8 pb-24' 
                    style={{
                        display:'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    >
                        <p><strong>Loading Products</strong></p>
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
                    <ProductTable
                        products={products}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
                    />
                }
            </MasterLayout>
        </>
    );
};

export default Page;