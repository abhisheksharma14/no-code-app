import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/v1/users/route';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Mock global Response
global.Response = {
  json: (data: any, init?: ResponseInit) => ({
    json: async () => data,
    status: init?.status || 200,
    ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
  }),
} as any;

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

      const mockRequest = {
        json: async () => ({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe('test@example.com');
      expect(data.token).toBe('mock-token');
      expect(data.user.password).toBeUndefined();
    });

    it('should return 400 if user already exists', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

      const mockRequest = {
        json: async () => ({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User with this email already exists');
    });

    it('should return 400 for invalid data', async () => {
      const mockRequest = {
        json: async () => ({
          email: 'invalid-email',
          firstName: '',
          lastName: 'Doe',
          password: '123', // Too short
        }),
      } as any;

      const response = await POST(mockRequest);
      expect(response.status).toBe(400);
    });
  });
});
