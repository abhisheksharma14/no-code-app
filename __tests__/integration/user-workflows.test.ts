/**
 * Integration tests for complete user workflows
 * These tests simulate real user journeys through the application
 */

// Mock the database FIRST
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock the auth functions FIRST
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(() => 'mock-jwt-token'),
}));

// Now import everything after mocks are set up
import { POST as createUser } from '@/app/api/v1/users/route';
import { POST as loginUser } from '@/app/api/v1/auth/login/route';
import { db } from '@/lib/db';
import { hashPassword, comparePassword, generateToken } from '@/lib/auth';
import { 
  createMockRequest, 
  createMockUser, 
  testData,
  HTTP_STATUS,
  ERROR_MESSAGES,
  setupGlobalMocks,
  cleanupMocks
} from '../support/test-helpers';

// Setup global mocks
setupGlobalMocks();

describe('User Workflows Integration Tests', () => {
  beforeEach(() => {
    cleanupMocks();
    // Ensure generateToken mock is properly set
    (generateToken as jest.Mock).mockReturnValue('mock-jwt-token');
  });

  describe('Complete User Registration and Login Flow', () => {
    it('should allow a new user to register and then login', async () => {
      // Step 1: User Registration
      const userData = testData.validUserCreation;
      const hashedPassword = 'hashed-password';
      const mockUser = createMockUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
      });

      // Mock database responses for registration
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null); // User doesn't exist
      (db.user.create as jest.Mock).mockResolvedValueOnce(mockUser);
      (hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      (generateToken as jest.Mock).mockReturnValueOnce('mock-jwt-token');

      // Create user
      const registrationRequest = createMockRequest(userData);
      const registrationResponse = await createUser(registrationRequest as any);
      const registrationData = await registrationResponse.json();

      // Verify registration
      expect(registrationResponse.status).toBe(HTTP_STATUS.CREATED);
      expect(registrationData.user.email).toBe(userData.email);
      expect(registrationData.user.firstName).toBe(userData.firstName);
      expect(registrationData.user.lastName).toBe(userData.lastName);
      expect(registrationData.token).toBe('mock-jwt-token');
      expect(registrationData.user.password).toBeUndefined();

      // Step 2: User Login
      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      // Mock database responses for login
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(true);
      (generateToken as jest.Mock).mockReturnValueOnce('mock-jwt-token');

      // Login user
      const loginRequest = createMockRequest(loginData);
      const loginResponse = await loginUser(loginRequest as any);
      const loginResponseData = await loginResponse.json();

      // Verify login
      expect(loginResponse.status).toBe(HTTP_STATUS.OK);
      expect(loginResponseData.user.email).toBe(userData.email);
      expect(loginResponseData.token).toBe('mock-jwt-token');
      expect(loginResponseData.user.password).toBeUndefined();
    });

    it('should prevent duplicate user registration', async () => {
      const userData = testData.validUserCreation;
      const existingUser = createMockUser({ email: userData.email });

      // Mock database to return existing user
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(existingUser);

      const registrationRequest = createMockRequest(userData);
      const response = await createUser(registrationRequest as any);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.error).toBe(ERROR_MESSAGES.USER_EXISTS);
    });

    it('should reject login with wrong password', async () => {
      const userData = testData.validUserCreation;
      const mockUser = createMockUser({
        email: userData.email,
        password: 'hashed-password',
      });

      // Mock database to return user but password comparison fails
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(false);

      const loginRequest = createMockRequest({
        email: userData.email,
        password: 'wrong-password',
      });

      const response = await loginUser(loginRequest as any);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.error).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
    });

    it('should reject login for non-existent user', async () => {
      // Mock database to return no user
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const loginRequest = createMockRequest({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      const response = await loginUser(loginRequest as any);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.error).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
    });
  });

  describe('User Data Validation Workflows', () => {
    it('should handle registration with invalid email format', async () => {
      const invalidUserData = {
        ...testData.validUserCreation,
        email: 'invalid-email-format',
      };

      const registrationRequest = createMockRequest(invalidUserData);
      const response = await createUser(registrationRequest as any);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it('should handle registration with short password', async () => {
      const invalidUserData = {
        ...testData.validUserCreation,
        password: '123', // Too short
      };

      const registrationRequest = createMockRequest(invalidUserData);
      const response = await createUser(registrationRequest as any);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it('should handle registration with missing required fields', async () => {
      const invalidUserData = {
        email: 'test@example.com',
        // Missing firstName, lastName, password
      };

      const registrationRequest = createMockRequest(invalidUserData);
      const response = await createUser(registrationRequest as any);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it('should accept registration with only required fields', async () => {
      const minimalUserData = {
        email: 'minimal@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const mockUser = createMockUser(minimalUserData);

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (db.user.create as jest.Mock).mockResolvedValueOnce(mockUser);
      (hashPassword as jest.Mock).mockResolvedValueOnce('hashed-password');

      const registrationRequest = createMockRequest(minimalUserData);
      const response = await createUser(registrationRequest as any);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle database errors gracefully during registration', async () => {
      const userData = testData.validUserCreation;

      // Mock database to throw error
      (db.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const registrationRequest = createMockRequest(userData);
      const response = await createUser(registrationRequest as any);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it('should handle database errors gracefully during login', async () => {
      const loginData = testData.validLogin;

      // Mock database to throw error
      (db.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const loginRequest = createMockRequest(loginData);
      const response = await loginUser(loginRequest as any);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it('should handle password hashing errors during registration', async () => {
      const userData = testData.validUserCreation;

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (hashPassword as jest.Mock).mockRejectedValueOnce(new Error('Hashing failed'));

      const registrationRequest = createMockRequest(userData);
      const response = await createUser(registrationRequest as any);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it('should handle password comparison errors during login', async () => {
      const loginData = testData.validLogin;
      const mockUser = createMockUser({ email: loginData.email });

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockRejectedValueOnce(new Error('Comparison failed'));

      const loginRequest = createMockRequest(loginData);
      const response = await loginUser(loginRequest as any);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Security Workflows', () => {
    it('should not expose password in registration response', async () => {
      const userData = testData.validUserCreation;
      const mockUser = createMockUser({
        ...userData,
        password: 'hashed-password',
      });

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (db.user.create as jest.Mock).mockResolvedValueOnce(mockUser);
      (hashPassword as jest.Mock).mockResolvedValueOnce('hashed-password');

      const registrationRequest = createMockRequest(userData);
      const response = await createUser(registrationRequest as any);
      const data = await response.json();

      expect(data.user.password).toBeUndefined();
      expect(data.user).not.toHaveProperty('password');
    });

    it('should not expose password in login response', async () => {
      const loginData = testData.validLogin;
      const mockUser = createMockUser({
        email: loginData.email,
        password: 'hashed-password',
      });

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(true);

      const loginRequest = createMockRequest(loginData);
      const response = await loginUser(loginRequest as any);
      const data = await response.json();

      expect(data.user.password).toBeUndefined();
      expect(data.user).not.toHaveProperty('password');
    });

    it('should hash password before storing in database', async () => {
      const userData = testData.validUserCreation;
      const hashedPassword = 'securely-hashed-password';

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      (db.user.create as jest.Mock).mockResolvedValueOnce(
        createMockUser({ password: hashedPassword })
      );

      const registrationRequest = createMockRequest(userData);
      await createUser(registrationRequest as any);

      expect(hashPassword).toHaveBeenCalledWith(userData.password);
      expect(db.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: hashedPassword,
        }),
      });
    });
  });

  describe('Data Consistency Workflows', () => {
    it('should maintain data consistency between registration and login', async () => {
      const userData = testData.validUserCreation;
      const hashedPassword = 'hashed-password';
      const mockUser = createMockUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
      });

      // Registration
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (db.user.create as jest.Mock).mockResolvedValueOnce(mockUser);
      (hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);

      const registrationRequest = createMockRequest(userData);
      const registrationResponse = await createUser(registrationRequest as any);
      const registrationData = await registrationResponse.json();

      // Login with same credentials
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(true);

      const loginRequest = createMockRequest({
        email: userData.email,
        password: userData.password,
      });
      const loginResponse = await loginUser(loginRequest as any);
      const loginData = await loginResponse.json();

      // Verify data consistency
      expect(registrationData.user.id).toBe(loginData.user.id);
      expect(registrationData.user.email).toBe(loginData.user.email);
      expect(registrationData.user.firstName).toBe(loginData.user.firstName);
      expect(registrationData.user.lastName).toBe(loginData.user.lastName);
    });
  });
});
