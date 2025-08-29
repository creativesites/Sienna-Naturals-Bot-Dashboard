import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';
import { z } from 'zod';

// Validation schemas
const productQuerySchema = z.object({
    search: z.string().optional(),
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).optional(),
    category: z.string().optional(),
    sortBy: z.enum(['product_name', 'price', 'created_at', 'product_id']).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const searchParams = Object.fromEntries(url.searchParams);
        
        const validatedParams = productQuerySchema.parse(searchParams);
        const { search, page = 1, limit = 10, category, sortBy = 'created_at', sortOrder = 'desc' } = validatedParams;
        
        const offset = (page - 1) * limit;
        
        // Build dynamic query
        let whereClause = 'WHERE 1=1';
        let queryParams = [];
        let paramIndex = 1;
        
        if (search) {
            whereClause += ` AND (product_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
            queryParams.push(`%${search}%`, `%${search}%`);
            paramIndex += 2;
        }
        
        if (category) {
            whereClause += ` AND category ILIKE $${paramIndex}`;
            queryParams.push(`%${category}%`);
            paramIndex++;
        }
        
        // Count query for pagination
        const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
        const countResult = await pgClient.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);
        
        // Main query with pagination and sorting
        const query = `
            SELECT 
                product_id, 
                product_name AS name, 
                description AS general_description,
                category,
                price AS cost, 
                formula AS details, 
                image_url AS image,
                imageUrls AS images,
                url,
                created_at
            FROM products
            ${whereClause}
            ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        queryParams.push(limit, offset);
        const result = await pgClient.query(query, queryParams);
        
        const totalPages = Math.ceil(total / limit);
        
        return NextResponse.json({ 
            products: result.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                search,
                category,
                sortBy,
                sortOrder
            }
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                error: 'Invalid query parameters',
                details: error.errors 
            }, { status: 400 });
        }
        
        return NextResponse.json({ 
            error: 'Failed to fetch products',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}

const productCreateSchema = z.object({
    product_name: z.string().min(1, 'Product name is required').max(255, 'Name too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
    category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
    price: z.string().min(1, 'Price is required'),
    formula: z.any().optional(),
    image_url: z.string().url('Main image must be a valid URL').optional(),
    imageUrls: z.array(z.any()).optional().default([]),
    url: z.string().url('URL must be valid').optional(),
    madeFor: z.string().optional(),
    performance: z.string().optional(),
    howToUse: z.string().optional(),
    relatedProducts: z.string().optional()
});

export async function POST(request) {
    try {
        const productData = await request.json();
        
        // Validate input data
        const validatedData = productCreateSchema.parse(productData);
        
        const {
            product_name,
            description,
            category,
            price,
            formula = {},
            image_url,
            imageUrls = [],
            url,
            madeFor,
            performance,
            howToUse,
            relatedProducts
        } = validatedData;

        // Check for duplicate name
        const duplicateCheck = await pgClient.query(
            'SELECT product_id FROM products WHERE LOWER(product_name) = LOWER($1)',
            [product_name]
        );
        
        if (duplicateCheck.rows.length > 0) {
            return NextResponse.json({ 
                error: 'Product with this name already exists' 
            }, { status: 409 });
        }

        const query = `
            INSERT INTO products (
                product_name, 
                description, 
                category, 
                price, 
                formula, 
                image_url, 
                imageUrls, 
                url,
                madeFor,
                performance,
                howToUse,
                relatedProducts,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            RETURNING *;
        `;

        const values = [
            product_name,
            description,
            category,
            price,
            JSON.stringify(formula),
            image_url,
            JSON.stringify(imageUrls),
            url,
            madeFor,
            performance,
            howToUse,
            relatedProducts
        ];

        const result = await pgClient.query(query, values);
        
        return NextResponse.json({ 
            message: "Product created successfully", 
            product: result.rows[0] 
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating product:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                error: 'Validation failed',
                details: error.errors 
            }, { status: 400 });
        }
        
        if (error.code === '23505') { // PostgreSQL unique violation
            return NextResponse.json({ 
                error: 'Product with this name already exists' 
            }, { status: 409 });
        }
        
        return NextResponse.json({ 
            error: "Failed to create product", 
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        }, { status: 500 });
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