import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
    try {
        // Check if user is authenticated and has admin access
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all users from Clerk
        const users = await clerkClient.users.getUserList({
            limit: 100, // Adjust as needed
            orderBy: '-created_at'
        });

        // Transform Clerk users to our format
        const transformedUsers = users.data.map(user => ({
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
        }));

        return NextResponse.json(transformedUsers);

    } catch (error) {
        console.error('Error fetching team users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team users' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        // Check if user is authenticated and has admin access
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, firstName, lastName, role = 'user' } = body;

        // Validate required fields
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Create user in Clerk
        const newUser = await clerkClient.users.createUser({
            emailAddress: [email],
            firstName: firstName || '',
            lastName: lastName || '',
            publicMetadata: {
                role: role,
                createdBy: userId,
                invitedAt: new Date().toISOString()
            },
            skipPasswordRequirement: true // User will set password on first login
        });

        // Send invitation email
        await clerkClient.invitations.createInvitation({
            emailAddress: email,
            publicMetadata: {
                role: role,
                invitedBy: userId
            }
        });

        // Transform response
        const transformedUser = {
            id: newUser.id,
            email: newUser.emailAddresses[0]?.emailAddress || email,
            firstName: newUser.firstName || firstName,
            lastName: newUser.lastName || lastName,
            fullName: `${newUser.firstName || firstName || ''} ${newUser.lastName || lastName || ''}`.trim(),
            imageUrl: newUser.imageUrl,
            role: newUser.publicMetadata?.role || role,
            status: 'active',
            createdAt: newUser.createdAt,
            username: newUser.username
        };

        return NextResponse.json(transformedUser, { status: 201 });

    } catch (error) {
        console.error('Error creating team user:', error);
        
        // Handle specific Clerk errors
        if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create team user' },
            { status: 500 }
        );
    }
}