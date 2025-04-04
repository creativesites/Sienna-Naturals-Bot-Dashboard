// app/api/products/[productId]/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database'; 
// GET - Get a single product by ID
export async function GET(request, { params }) {
    const productId = params.productId;

    try {
        const result = await pgClient.query('SELECT * FROM products WHERE product_id = $1', [productId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 }); // 404 Not Found if no product
        }

        return NextResponse.json({ product: result.rows[0] });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ error: 'Failed to fetch product', details: error.message }, { status: 500 });
    }
}

// PUT - Update an existing product
// PUT - Update an existing product
export async function PUT(request, { params }) {
    const productId = params.productId; // Correct parameter name
    const productData = await request.json();
    console.log("Received Data:", productData); // Debugging

    try {
        const {
            image_url, product_name, description, price, url, formula
        } = productData;

        const query = `
            UPDATE products
            SET image_url = $1, product_name = $2, description = $3, price = $4, url = $5, formula = $6
            WHERE product_id = $7
            RETURNING *;
        `;

        const values = [
            image_url || null,
            product_name,
            description || null,
            price !== undefined && price !== null ? String(price) : null,
            url || null,
            formula || null,
            productId
        ];

        const result = await pgClient.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Product not found for update' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product updated successfully', product: result.rows[0] });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: 'Failed to update product', details: error.message }, { status: 500 });
    }
}

// DELETE - Delete a product by ID
export async function DELETE(request, { params }) {
    const productId = params.productId;

    try {
        const result = await pgClient.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [productId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Product not found for deletion' }, { status: 404 }); // 404 if no product to delete
        }

        return NextResponse.json({ message: 'Product deleted successfully', product: result.rows[0] }); // Return deleted product

    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: 'Failed to delete product', details: error.message }, { status: 500 });
    }
}