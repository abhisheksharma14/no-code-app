import { POST } from '@/app/api/v1/auth/login/route';
import { db } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

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
    },
  },
}));

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  comparePassword: jest.fn(),
  generateToken: jest.fn(() => 'mock-token'),
}));

describe('/api/v1/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should login user with valid credentials', async () => {
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

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      const mockRequest = {
        json: async () => ({
          email: 'test@example.com',
          password: 'password123',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.email).toBe('test@example.com');
      expect(data.token).toBe('mock-token');
      expect(data.user.password).toBeUndefined();
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(comparePassword).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(generateToken).toHaveBeenCalledWith({
        userId: 'user-1',
        email: 'test@example.com'
      });
    });

    it('should return 401 for non-existent user', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      const mockRequest = {
        json: async () => ({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
    });

    it('should return 401 for incorrect password', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      const mockRequest = {
        json: async () => ({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
    });

    it('should return 400 for invalid email format', async () => {
      const mockRequest = {
        json: async () => ({
          email: 'invalid-email',
          password: 'password123',
        }),
      } as any;

      const response = await POST(mockRequest);
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const mockRequest = {
        json: async () => ({
          email: 'test@example.com',
          password: '',
        }),
      } as any;

      const response = await POST(mockRequest);
      expect(response.status).toBe(400);
    });

    it('should handle database errors gracefully', async () => {
      (db.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const mockRequest = {
        json: async () => ({
          email: 'test@example.com',
          password: 'password123',
        }),
      } as any;

      const response = await POST(mockRequest);
      expect(response.status).toBe(500);
    });
  });
});
