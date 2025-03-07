import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    try {
        const offset = (page - 1) * limit;

        // Fetch products
        const productsQuery = await pgClient.query(
            `SELECT product_id, image_url AS image, product_name AS name, description AS desc, price, url
             FROM products
             WHERE product_name ILIKE $1
             ORDER BY created_at DESC
                 LIMIT $2 OFFSET $3`,
            [`%${search}%`, limit, offset]
        );

        // Fetch total count
        const totalQuery = await pgClient.query(
            `SELECT COUNT(*) FROM products
             WHERE product_name ILIKE $1`,
            [`%${search}%`]
        );

        return NextResponse.json({
            products: productsQuery.rows,
            total: parseInt(totalQuery.rows[0].count),
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const productData = await request.json();
    console.log("Received Data:", productData); // Debugging

    try {
        const {
            image_url,
            product_name,
            description,
            price,
            url,
            formula,
            madeFor,
            performance,
            howToUse,
            relatedProducts,
            imageUrls,
        } = productData;

        const query = `
            INSERT INTO products (
                image_url, product_name, description, price, url, formula,
                madeFor, performance, howToUse, relatedProducts, imageUrls
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

        const values = [
            image_url || null,
            product_name,
            description || null,
            price !== undefined && price !== null ? String(price) : null,
            url || null,
            formula || null,
            madeFor || null,
            performance || null,
            howToUse || null,
            relatedProducts || null,
            JSON.stringify(imageUrls) || null, // Store as JSON
        ];

        const result = await pgClient.query(query, values);

        return NextResponse.json({ message: "Product created successfully", product: result.rows[0] });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Failed to create product", details: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { productId } = params;
    const product = await request.json();

    try {
        const result = await pgClient.query(
            `UPDATE products
             SET image_url = $1, product_name = $2, description = $3, price = $4, url = $5
             WHERE product_id = $6
                 RETURNING *`,
            [product.image, product.name, product.desc, product.price, product.url, productId]
        );
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}