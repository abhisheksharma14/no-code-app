import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { updateUserSchema } from '@/lib/validations';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { createErrorResponse, handleValidationError } from '@/lib/errors';

// Helper function to authenticate and authorize user
async function authenticateAndAuthorize(request: NextRequest, userId: string) {
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);
  
  if (!token) {
    return { error: createErrorResponse('Authorization token required', 401) };
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return { error: createErrorResponse('Invalid or expired token', 401) };
  }
  
  // Check if user is trying to access their own data
  if (payload.userId !== userId) {
    return { error: createErrorResponse('Forbidden: You can only access your own data', 403) };
  }
  
  return { userId: payload.userId };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // Authenticate and authorize
    const authResult = await authenticateAndAuthorize(request, userId);
    if (authResult.error) {
      return authResult.error;
    }
    
    // Find user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        dateOfBirth: true,
        hasBankAccount: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }
    
    return Response.json({ user });
    
  } catch (error) {
    console.error('Get user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // Authenticate and authorize
    const authResult = await authenticateAndAuthorize(request, userId);
    if (authResult.error) {
      return authResult.error;
    }
    
    const body = await request.json();
    
    // Validate request body
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return handleValidationError(validationResult.error);
    }
    
    const { firstName, lastName, phoneNumber, address, dateOfBirth } = validationResult.data;
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return createErrorResponse('User not found', 404);
    }
    
    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        dateOfBirth: true,
        hasBankAccount: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    return Response.json({ user: updatedUser });
    
  } catch (error) {
    console.error('Update user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // Authenticate and authorize
    const authResult = await authenticateAndAuthorize(request, userId);
    if (authResult.error) {
      return authResult.error;
    }
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return createErrorResponse('User not found', 404);
    }
    
    // Check if user has a bank account
    if (existingUser.hasBankAccount) {
      return createErrorResponse('Cannot delete user with an active bank account', 409);
    }
    
    // Delete user
    await db.user.delete({
      where: { id: userId }
    });
    
    return Response.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Delete user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
