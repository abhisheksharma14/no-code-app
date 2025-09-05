/**
 * Test utilities for common testing patterns and mock data generation
 */

// This file contains only utility functions and should not be executed as a test

// Mock user data factory
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  address: '123 Main St',
  dateOfBirth: new Date('1990-01-01'),
  hasBankAccount: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mock JWT payload factory
export const createMockJWTPayload = (overrides: Partial<any> = {}) => ({
  userId: 'mock-user-id',
  email: 'test@example.com',
  ...overrides,
});

// Mock request factory for API testing
export const createMockRequest = (data: any) => ({
  json: async () => data,
});

// Mock response factory
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

// Mock fetch response helper
export const mockFetchResponse = (data: any, status = 200) => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  mockFetch.mockResolvedValueOnce(createMockResponse(data, status) as any);
};

// Mock fetch rejection helper
export const mockFetchRejection = (error: Error) => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  mockFetch.mockRejectedValueOnce(error);
};

// Setup global mocks for tests
export const setupGlobalMocks = () => {
  // Mock fetch
  global.fetch = jest.fn();

  // Mock Response
  global.Response = {
    json: (data: any, init?: ResponseInit) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    }),
  } as any;

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
};

// Clean up mocks after tests
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

// Wait for async operations to complete
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock database operations
export const mockDatabaseOperations = () => {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
};

// Test data generators
export const testData = {
  validUserCreation: {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    address: '123 Main St',
    dateOfBirth: '1990-01-01T00:00:00.000Z',
    password: 'password123',
  },

  validUserUpdate: {
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+1987654321',
    address: '456 Oak Ave',
    dateOfBirth: '1985-05-15T00:00:00.000Z',
  },

  validLogin: {
    email: 'test@example.com',
    password: 'password123',
  },

  invalidEmail: {
    email: 'invalid-email',
    password: 'password123',
  },

  shortPassword: {
    email: 'test@example.com',
    password: '123',
  },

  emptyFields: {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  },
};

// HTTP status codes for tests
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages used in the application
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized',
  INTERNAL_ERROR: 'Internal server error',
  BANK_ACCOUNT_RESTRICTION: 'Cannot delete account while you have an active bank account',
} as const;

// Common test assertions
export const expectValidUserResponse = (user: any) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('firstName');
  expect(user).toHaveProperty('lastName');
  expect(user).toHaveProperty('createdAt');
  expect(user).toHaveProperty('updatedAt');
  expect(user).not.toHaveProperty('password'); // Should not include password
};

export const expectValidAuthResponse = (response: any) => {
  expect(response).toHaveProperty('user');
  expect(response).toHaveProperty('token');
  expectValidUserResponse(response.user);
  expect(typeof response.token).toBe('string');
};

// Database test helpers
export const createTestDatabase = async () => {
  // In a real scenario, you might want to create a test database
  // For now, we'll just return mock functions
  return mockDatabaseOperations();
};

export const cleanupTestDatabase = async () => {
  // Cleanup test database if needed
  // For mocked tests, this is a no-op
};

// API test helpers
export const apiTestHelpers = {
  expectErrorResponse: (response: any, expectedStatus: number, expectedMessage?: string) => {
    expect(response.status).toBe(expectedStatus);
    if (expectedMessage) {
      expect(response.json()).resolves.toHaveProperty('error', expectedMessage);
    }
  },

  expectSuccessResponse: (response: any, expectedStatus = 200) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.ok).toBe(true);
  },
};

// Component test helpers
export const componentTestHelpers = {
  expectFormField: (fieldName: string, type = 'text') => {
    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    expect(field).toBeInTheDocument();
    expect(field.type).toBe(type);
    return field;
  },

  expectButton: (buttonText: string) => {
    const button = document.querySelector(`button:contains("${buttonText}")`) as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    return button;
  },
};

export default {
  createMockUser,
  createMockJWTPayload,
  createMockRequest,
  createMockResponse,
  mockFetchResponse,
  mockFetchRejection,
  setupGlobalMocks,
  cleanupMocks,
  waitForAsync,
  mockDatabaseOperations,
  testData,
  HTTP_STATUS,
  ERROR_MESSAGES,
  expectValidUserResponse,
  expectValidAuthResponse,
  createTestDatabase,
  cleanupTestDatabase,
  apiTestHelpers,
  componentTestHelpers,
};
