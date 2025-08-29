import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request, { params }) {
    try {
        // Check if user is authenticated
        const { userId: currentUserId } = await auth();
        if (!currentUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;

        // Get user from Clerk
        const user = await clerkClient.users.getUser(userId);

        // Transform Clerk user to our format
        const transformedUser = {
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || 'No email',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unnamed User',
            imageUrl: user.imageUrl,
            role: user.publicMetadata?.role || 'user',
            status: user.banned ? 'suspended' : (user.locked ? 'inactive' : 'active'),
            createdAt: user.createdAt,
            lastSignInAt: user.lastSignInAt,
            username: user.username,
            publicMetadata: user.publicMetadata
        };

        return NextResponse.json(transformedUser);

    } catch (error) {
        console.error('Error fetching team user:', error);
        
        if (error.status === 404) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch team user' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        // Check if user is authenticated and has admin access
        const { userId: currentUserId } = await auth();
        if (!currentUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;
        const body = await request.json();
        const { firstName, lastName, role, status } = body;

        // Update user in Clerk
        const updateData = {};
        
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;

        // Update public metadata for role
        if (role !== undefined) {
            updateData.publicMetadata = {
                ...((await clerkClient.users.getUser(userId)).publicMetadata || {}),
                role: role,
                updatedBy: currentUserId,
                updatedAt: new Date().toISOString()
            };
        }

        const updatedUser = await clerkClient.users.updateUser(userId, updateData);

        // Handle status changes
        if (status !== undefined) {
            const currentUser = await clerkClient.users.getUser(userId);
            const currentStatus = currentUser.banned ? 'suspended' : (currentUser.locked ? 'inactive' : 'active');
            
            if (status !== currentStatus) {
                switch (status) {
                    case 'suspended':
                        await clerkClient.users.banUser(userId);
                        break;
                    case 'inactive':
                        if (currentUser.banned) {
                            await clerkClient.users.unbanUser(userId);
                        }
                        // Note: Clerk doesn't have a direct "lock" method for inactive status
                        // You might need to implement this via metadata or custom logic
                        break;
                    case 'active':
                        if (currentUser.banned) {
                            await clerkClient.users.unbanUser(userId);
                        }
                        // Unlock user if needed
                        break;
                }
            }
        }

        // Get updated user data
        const finalUser = await clerkClient.users.getUser(userId);

        // Transform response
        const transformedUser = {
            id: finalUser.id,
            email: finalUser.emailAddresses[0]?.emailAddress || 'No email',
            firstName: finalUser.firstName || '',
            lastName: finalUser.lastName || '',
            fullName: `${finalUser.firstName || ''} ${finalUser.lastName || ''}`.trim() || finalUser.username || 'Unnamed User',
            imageUrl: finalUser.imageUrl,
            role: finalUser.publicMetadata?.role || 'user',
            status: finalUser.banned ? 'suspended' : (finalUser.locked ? 'inactive' : 'active'),
            createdAt: finalUser.createdAt,
            lastSignInAt: finalUser.lastSignInAt,
            username: finalUser.username
        };

        return NextResponse.json(transformedUser);

    } catch (error) {
        console.error('Error updating team user:', error);
        
        if (error.status === 404) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update team user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        // Check if user is authenticated and has admin access
        const { userId: currentUserId } = await auth();
        if (!currentUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;

        // Prevent self-deletion
        if (userId === currentUserId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        // Delete user from Clerk
        await clerkClient.users.deleteUser(userId);

        return NextResponse.json(
            { message: 'User deleted successfully', userId: userId }
        );

    } catch (error) {
        console.error('Error deleting team user:', error);
        
        if (error.status === 404) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete team user' },
            { status: 500 }
        );
    }
}