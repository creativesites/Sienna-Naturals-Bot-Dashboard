import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const timeframe = searchParams.get('timeframe') || '30d';
        
        // Calculate date range based on timeframe
        const getDateRange = (timeframe) => {
            const now = new Date();
            let days;
            switch (timeframe) {
                case '7d': days = 7; break;
                case '30d': days = 30; break;
                case '90d': days = 90; break;
                case '1y': days = 365; break;
                default: days = 30;
            }
            const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
            return startDate.toISOString();
        };

        const startDate = getDateRange(timeframe);

        // Get conversation and usage data to calculate costs
        const conversationStatsQuery = `
            WITH daily_stats AS (
                SELECT 
                    DATE(c.created_at) as date,
                    COUNT(*) as conversations,
                    COUNT(DISTINCT c.user_id) as unique_users,
                    AVG(
                        CASE 
                            WHEN c.chat_history IS NOT NULL THEN 
                                jsonb_array_length(c.chat_history::jsonb)
                            ELSE 0 
                        END
                    ) as avg_messages_per_conversation,
                    SUM(
                        CASE 
                            WHEN c.chat_history IS NOT NULL THEN 
                                jsonb_array_length(c.chat_history::jsonb)
                            ELSE 0 
                        END
                    ) as total_messages
                FROM conversations c
                WHERE c.created_at >= $1
                GROUP BY DATE(c.created_at)
                ORDER BY date
            )
            SELECT 
                date,
                conversations,
                unique_users,
                ROUND(avg_messages_per_conversation, 1) as avg_messages_per_conversation,
                total_messages
            FROM daily_stats
        `;

        // Execute query
        const statsResult = await pgClient.query(conversationStatsQuery, [startDate]);
        const dailyStats = statsResult.rows;

        // Model pricing (per 1M tokens/requests) - realistic estimates based on actual pricing
        const modelPricing = {
            'Gemini 2.0 Flash Experimental': {
                input_cost_per_1m: 0.075, // $0.075 per 1M input tokens
                output_cost_per_1m: 0.30,  // $0.30 per 1M output tokens
                requests_distribution: 0.6  // 60% of traffic
            },
            'Gemini 1.5 Flash': {
                input_cost_per_1m: 0.075,
                output_cost_per_1m: 0.30,
                requests_distribution: 0.25 // 25% of traffic
            },
            'xAI Grok 3 Mini Fast': {
                input_cost_per_1m: 0.10,  // Estimated pricing
                output_cost_per_1m: 0.40,
                requests_distribution: 0.15 // 15% of traffic
            }
        };

        // Calculate costs for each day and each model
        const dailyCosts = dailyStats.map(day => {
            const totalRequests = day.total_messages;
            const modelCosts = {};
            let totalDayCost = 0;

            Object.entries(modelPricing).forEach(([modelName, pricing]) => {
                const modelRequests = Math.round(totalRequests * pricing.requests_distribution);
                
                // Estimate tokens (avg 50 input tokens, 100 output tokens per message)
                const inputTokens = modelRequests * 50;
                const outputTokens = modelRequests * 100;
                
                const inputCost = (inputTokens / 1000000) * pricing.input_cost_per_1m;
                const outputCost = (outputTokens / 1000000) * pricing.output_cost_per_1m;
                const totalModelCost = inputCost + outputCost;
                
                modelCosts[modelName] = {
                    requests: modelRequests,
                    input_tokens: inputTokens,
                    output_tokens: outputTokens,
                    input_cost: inputCost,
                    output_cost: outputCost,
                    total_cost: totalModelCost
                };
                
                totalDayCost += totalModelCost;
            });

            return {
                date: day.date,
                conversations: day.conversations,
                total_requests: totalRequests,
                daily_cost: totalDayCost,
                cost_per_conversation: totalRequests > 0 ? totalDayCost / day.conversations : 0,
                model_breakdown: modelCosts
            };
        });

        // Calculate total period costs
        const totalCosts = dailyCosts.reduce((acc, day) => ({
            total_cost: acc.total_cost + day.daily_cost,
            total_conversations: acc.total_conversations + day.conversations,
            total_requests: acc.total_requests + day.total_requests
        }), { total_cost: 0, total_conversations: 0, total_requests: 0 });

        // Model cost breakdown
        const modelBreakdown = Object.keys(modelPricing).map(modelName => {
            const modelData = dailyCosts.reduce((acc, day) => {
                const dayModel = day.model_breakdown[modelName];
                return {
                    requests: acc.requests + dayModel.requests,
                    total_cost: acc.total_cost + dayModel.total_cost,
                    input_cost: acc.input_cost + dayModel.input_cost,
                    output_cost: acc.output_cost + dayModel.output_cost
                };
            }, { requests: 0, total_cost: 0, input_cost: 0, output_cost: 0 });

            return {
                model_name: modelName,
                ...modelData,
                percentage: totalCosts.total_cost > 0 ? (modelData.total_cost / totalCosts.total_cost) * 100 : 0
            };
        });

        // Usage efficiency metrics
        const avgCostPerConversation = totalCosts.total_conversations > 0 ? 
            totalCosts.total_cost / totalCosts.total_conversations : 0;
        const avgCostPerMessage = totalCosts.total_requests > 0 ? 
            totalCosts.total_cost / totalCosts.total_requests : 0;

        // Projected costs (next 30 days based on current trend)
        const recentDays = dailyCosts.slice(-7); // Last 7 days
        const avgDailyCost = recentDays.length > 0 ? 
            recentDays.reduce((sum, day) => sum + day.daily_cost, 0) / recentDays.length : 0;
        const projectedMonthlyCost = avgDailyCost * 30;

        // Cost optimization suggestions
        const suggestions = [];
        
        if (avgCostPerConversation > 0.10) {
            suggestions.push({
                type: 'optimization',
                title: 'High Cost Per Conversation',
                description: 'Consider optimizing conversation length or model selection',
                potential_savings: Math.round((avgCostPerConversation - 0.08) * totalCosts.total_conversations * 100) / 100
            });
        }

        if (modelBreakdown[0]?.percentage > 70) {
            suggestions.push({
                type: 'load_balancing',
                title: 'Model Load Imbalance',
                description: 'Consider better distribution across available models',
                potential_savings: Math.round(totalCosts.total_cost * 0.15 * 100) / 100
            });
        }

        const response = {
            timeframe,
            period_summary: {
                total_cost: totalCosts.total_cost,
                total_conversations: totalCosts.total_conversations,
                total_requests: totalCosts.total_requests,
                avg_cost_per_conversation: avgCostPerConversation,
                avg_cost_per_message: avgCostPerMessage,
                projected_monthly_cost: projectedMonthlyCost
            },
            daily_breakdown: dailyCosts,
            model_breakdown: modelBreakdown,
            cost_trends: {
                daily_costs: dailyCosts.map(day => ({
                    date: day.date,
                    cost: day.daily_cost,
                    conversations: day.conversations
                })),
                avg_daily_cost: avgDailyCost,
                trend: recentDays.length >= 2 ? 
                    (recentDays[recentDays.length - 1].daily_cost > recentDays[0].daily_cost ? 'increasing' : 'decreasing') : 'stable'
            },
            optimization_suggestions: suggestions
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching cost analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cost analytics data', details: error.message },
            { status: 500 }
        );
    }
}