// app/api/hair-profiles/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const hairType = searchParams.get('hairType') || '';
        const hairTexture = searchParams.get('hairTexture') || '';
        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        
        const offset = (page - 1) * limit;

        // Complex query to get comprehensive hair profile data
        let countQuery = `
            SELECT COUNT(DISTINCT u.user_id) as total
            FROM users u
            WHERE u.hair_type IS NOT NULL
        `;

        let query = `
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.created_at,
                u.hair_type,
                u.hair_texture,
                u.hair_color,
                u.scalp_condition,
                u.hair_length,
                u.hair_porosity,
                u.hair_density,
                u.styling_preference,
                
                -- Hair issues aggregation
                COUNT(DISTINCT hi.issue_id) as total_issues,
                ARRAY_AGG(DISTINCT hi.issue_description) FILTER (WHERE hi.issue_description IS NOT NULL) as common_issues,
                MAX(hi.reported_at) as last_issue_reported,
                
                -- Conversation stats
                COUNT(DISTINCT c.conversation_id) as total_conversations,
                MAX(c.created_at) as last_conversation,
                
                -- Product recommendations
                COUNT(DISTINCT pr.recommendation_id) as total_recommendations,
                ARRAY_AGG(DISTINCT pr.product_name) FILTER (WHERE pr.product_name IS NOT NULL) as recommended_products,
                
                -- Calculate hair health score (custom metric)
                CASE 
                    WHEN COUNT(DISTINCT hi.issue_id) = 0 THEN 100
                    WHEN COUNT(DISTINCT hi.issue_id) <= 2 THEN 85
                    WHEN COUNT(DISTINCT hi.issue_id) <= 5 THEN 70
                    ELSE 50
                END as hair_health_score
                
            FROM users u
            LEFT JOIN hair_issues hi ON u.user_id = hi.user_id
            LEFT JOIN conversations c ON u.user_id = c.user_id
            LEFT JOIN product_recommendations pr ON u.user_id = pr.user_id
            WHERE u.hair_type IS NOT NULL
        `;

        const queryParams = [];
        const countParams = [];

        // Build WHERE conditions
        const conditions = [];
        
        if (search) {
            conditions.push(`(
                u.name ILIKE $${queryParams.length + 1} OR 
                u.email ILIKE $${queryParams.length + 1} OR 
                u.hair_type ILIKE $${queryParams.length + 1} OR
                u.hair_texture ILIKE $${queryParams.length + 1} OR
                u.hair_color ILIKE $${queryParams.length + 1} OR
                u.scalp_condition ILIKE $${queryParams.length + 1}
            )`);
            queryParams.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }

        if (hairType) {
            conditions.push(`u.hair_type = $${queryParams.length + 1}`);
            queryParams.push(hairType);
            countParams.push(hairType);
        }

        if (hairTexture) {
            conditions.push(`u.hair_texture = $${queryParams.length + 1}`);
            queryParams.push(hairTexture);
            countParams.push(hairTexture);
        }

        // Add conditions to queries
        if (conditions.length > 0) {
            const whereClause = ` AND (${conditions.join(' AND ')})`;
            query += whereClause;
            countQuery += whereClause.replace('u.hair_type IS NOT NULL AND', 'u.hair_type IS NOT NULL AND');
        }

        // Add grouping
        query += `
            GROUP BY u.user_id, u.name, u.email, u.created_at, u.hair_type, 
                     u.hair_texture, u.hair_color, u.scalp_condition, u.hair_length, 
                     u.hair_porosity, u.hair_density, u.styling_preference
        `;

        // Add sorting
        const validSortColumns = {
            'created_at': 'u.created_at',
            'name': 'u.name',
            'hair_health_score': 'hair_health_score',
            'total_issues': 'total_issues',
            'total_conversations': 'total_conversations',
            'last_conversation': 'last_conversation'
        };

        const sortColumn = validSortColumns[sortBy] || 'u.created_at';
        const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortColumn} ${order}`;

        // Add pagination
        query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        // Execute queries
        const [profilesResult, countResult] = await Promise.all([
            pgClient.query(query, queryParams),
            pgClient.query(countQuery, countParams)
        ]);

        const profiles = profilesResult.rows.map(profile => ({
            ...profile,
            common_issues: profile.common_issues ? profile.common_issues.filter(issue => issue !== null) : [],
            recommended_products: profile.recommended_products ? profile.recommended_products.filter(product => product !== null) : []
        }));

        const total = parseInt(countResult.rows[0]?.total || 0);
        const totalPages = Math.ceil(total / limit);

        // Get statistics for the overview
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT u.user_id) as total_profiles,
                COUNT(DISTINCT u.hair_type) as unique_hair_types,
                COUNT(DISTINCT u.hair_texture) as unique_hair_textures,
                AVG(CASE 
                    WHEN COUNT(DISTINCT hi.issue_id) = 0 THEN 100
                    WHEN COUNT(DISTINCT hi.issue_id) <= 2 THEN 85
                    WHEN COUNT(DISTINCT hi.issue_id) <= 5 THEN 70
                    ELSE 50
                END) as avg_hair_health_score
            FROM users u
            LEFT JOIN hair_issues hi ON u.user_id = hi.user_id
            WHERE u.hair_type IS NOT NULL
            GROUP BY u.user_id
        `;

        const statsResult = await pgClient.query(`
            SELECT 
                COUNT(*) as total_profiles,
                COUNT(DISTINCT hair_type) as unique_hair_types,
                COUNT(DISTINCT hair_texture) as unique_hair_textures,
                ROUND(AVG(
                    CASE 
                        WHEN hair_issue_count = 0 THEN 100
                        WHEN hair_issue_count <= 2 THEN 85
                        WHEN hair_issue_count <= 5 THEN 70
                        ELSE 50
                    END
                ), 1) as avg_hair_health_score
            FROM (
                SELECT 
                    u.user_id,
                    u.hair_type,
                    u.hair_texture,
                    COUNT(DISTINCT hi.issue_id) as hair_issue_count
                FROM users u
                LEFT JOIN hair_issues hi ON u.user_id = hi.user_id
                WHERE u.hair_type IS NOT NULL
                GROUP BY u.user_id, u.hair_type, u.hair_texture
            ) as profile_stats
        `);

        return NextResponse.json({
            profiles,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            statistics: statsResult.rows[0] || {
                total_profiles: 0,
                unique_hair_types: 0,
                unique_hair_textures: 0,
                avg_hair_health_score: 0
            }
        });

    } catch (error) {
        console.error('Error fetching hair profiles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hair profiles', details: error.message },
            { status: 500 }
        );
    }
}