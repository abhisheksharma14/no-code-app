import {
  createUserSchema,
  updateUserSchema,
  loginSchema,
  userIdSchema
} from '@/lib/validations';

describe('Validation schemas', () => {
  describe('createUserSchema', () => {
    it('should validate valid user creation data', () => {
      const validData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        address: '123 Main St',
        dateOfBirth: '1990-01-01T00:00:00.000Z',
        password: 'password123'
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate minimum required fields', () => {
      const minimalData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      const result = createUserSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Invalid email address',
              path: ['email']
            })
          ])
        );
      }
    });

    it('should reject empty first name', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: '',
        lastName: 'Doe',
        password: 'password123'
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'First name is required',
              path: ['firstName']
            })
          ])
        );
      }
    });

    it('should reject empty last name', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: '',
        password: 'password123'
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Last name is required',
              path: ['lastName']
            })
          ])
        );
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '123'
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Password must be at least 8 characters long',
              path: ['password']
            })
          ])
        );
      }
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(101);
      const invalidData = {
        email: 'test@example.com',
        firstName: longName,
        lastName: 'Doe',
        password: 'password123'
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields as undefined', () => {
      const dataWithUndefined = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: undefined,
        address: undefined,
        dateOfBirth: undefined,
        password: 'password123'
      };

      const result = createUserSchema.safeParse(dataWithUndefined);
      expect(result.success).toBe(true);
    });
  });

  describe('updateUserSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1987654321',
        address: '456 Oak Ave',
        dateOfBirth: '1985-05-15T00:00:00.000Z'
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow empty object (no updates)', () => {
      const result = updateUserSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const partialData = {
        firstName: 'Jane'
      };

      const result = updateUserSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should reject empty strings for firstName', () => {
      const invalidData = {
        firstName: ''
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty strings for lastName', () => {
      const invalidData = {
        lastName: ''
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(101);
      const invalidData = {
        firstName: longName
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Invalid email address',
              path: ['email']
            })
          ])
        );
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Password is required',
              path: ['password']
            })
          ])
        );
      }
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('userIdSchema', () => {
    it('should validate valid user ID', () => {
      const validData = {
        userId: 'user-123'
      };

      const result = userIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty user ID', () => {
      const invalidData = {
        userId: ''
      };

      const result = userIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'User ID is required',
              path: ['userId']
            })
          ])
        );
      }
    });

    it('should reject missing user ID', () => {
      const invalidData = {};

      const result = userIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
