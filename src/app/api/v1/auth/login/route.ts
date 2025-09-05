import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { generateToken, comparePassword } from '@/lib/auth';
import { createErrorResponse, handleValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return handleValidationError(validationResult.error);
    }
    
    const { email, password } = validationResult.data;
    
    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return createErrorResponse('Invalid email or password', 401);
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return createErrorResponse('Invalid email or password', 401);
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });
    
    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    return Response.json({
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
