import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  getTokenFromHeader,
  JWTPayload
} from '@/lib/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock external dependencies
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Auth utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable - auth.ts uses 'your-secret-key' as default
    delete process.env.JWT_SECRET;
  });

  describe('generateToken', () => {
    it('should generate a JWT token with correct payload and options', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com'
      };
      const expectedToken = 'mock-jwt-token';

      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        'your-secret-key',
        { expiresIn: '24h' }
      );
      expect(result).toBe(expectedToken);
    });

    it('should use default secret when JWT_SECRET is not provided', () => {
      delete process.env.JWT_SECRET;
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com'
      };

      generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        'your-secret-key',
        { expiresIn: '24h' }
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', () => {
      const token = 'valid-token';
      const expectedPayload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com'
      };

      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'your-secret-key');
      expect(result).toEqual(expectedPayload);
    });

    it('should return null for invalid token', () => {
      const token = 'invalid-token';

      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'your-secret-key');
      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const token = 'expired-token';

      mockedJwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const result = verifyToken(token);

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed-password';

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as any);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should handle bcrypt errors', async () => {
      const password = 'password123';

      mockedBcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(hashPassword(password)).rejects.toThrow('Hashing failed');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed-password';

      mockedBcrypt.compare.mockResolvedValue(true as any);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed-password';

      mockedBcrypt.compare.mockResolvedValue(false as any);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle bcrypt comparison errors', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed-password';

      mockedBcrypt.compare.mockRejectedValue(new Error('Comparison failed'));

      await expect(comparePassword(password, hashedPassword)).rejects.toThrow('Comparison failed');
    });
  });

  describe('getTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const authHeader = 'Bearer valid-jwt-token';
      const result = getTokenFromHeader(authHeader);

      expect(result).toBe('valid-jwt-token');
    });

    it('should return null for null header', () => {
      const result = getTokenFromHeader(null);
      expect(result).toBeNull();
    });

    it('should return null for empty header', () => {
      const result = getTokenFromHeader('');
      expect(result).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const authHeader = 'valid-jwt-token';
      const result = getTokenFromHeader(authHeader);

      expect(result).toBeNull();
    });

    it('should return empty string for malformed Bearer header', () => {
      const authHeader = 'Bearer ';
      const result = getTokenFromHeader(authHeader);

      expect(result).toBe('');
    });

    it('should handle Bearer header with extra spaces', () => {
      const authHeader = 'Bearer  token-with-spaces  ';
      const result = getTokenFromHeader(authHeader);

      expect(result).toBe(' token-with-spaces  ');
    });
  });
});
