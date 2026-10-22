export const api = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

export const getApiBaseUrl = jest.fn(() => 'http://localhost:3000');
