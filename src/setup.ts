import { jest } from '@jest/globals';

// Mock etherscan service
jest.mock('../services/etherscan', () => {
  return {
    getTransaction: jest.fn().mockResolvedValue({ /* mock transaction data */ }),
    // ...other mocked methods
  };
});

// Mock phishingDetector service
jest.mock('../services/phishingDetector', () => {
  return {
    isPhishing: jest.fn().mockResolvedValue(false),
    // ...other mocked methods
  };
});

// ...existing code...
