import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/v1/users/route';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(),
  generateToken: jest.fn(() => 'mock-token'),
}));

describe('/api/v1/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: null,
        address: null,
        dateOfBirth: null,
        password: 'hashed-password',
        hasBankAccount: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockResolvedValue(mockUser);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-password');

      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe('test@example.com');
      expect(data.token).toBe('mock-token');
      expect(data.user.password).toBeUndefined();
    });

    it('should return 400 if user already exists', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User with this email already exists');
    });

    it('should return 400 for invalid data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'invalid-email',
          firstName: '',
          lastName: 'Doe',
          password: '123', // Too short
        },
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });
  });
});
