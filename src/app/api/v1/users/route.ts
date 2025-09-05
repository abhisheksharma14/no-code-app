import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { createUserSchema } from '@/lib/validations';
import { generateToken, hashPassword } from '@/lib/auth';
import { createErrorResponse, handleValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      return handleValidationError(validationResult.error);
    }
    
    const { email, firstName, lastName, phoneNumber, address, dateOfBirth, password } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return createErrorResponse('User with this email already exists', 400);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await db.user.create({
      data: {
        email,
        firstName,
        lastName,
        phoneNumber,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        password: hashedPassword,
      }
    });
    
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
    }, { status: 201 });
    
  } catch (error) {
    console.error('User creation error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
