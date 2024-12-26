import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';
import axios from 'axios';

// Setup global variables
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables
process.env = {
  ...process.env,
  ETHERSCAN_API_KEY: 'test-api-key',
  NETWORK: 'mainnet',
  MODEL_ENCRYPTION_KEY: 'test-encryption-key',
  API_TIMEOUT: '5000',
  MAX_CACHE_SIZE: '1000',
  RATE_LIMIT_DELAY: '1000',
  NODE_ENV: 'test',
};

// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock WebSocket
class MockWebSocket {
  onopen: () => void = () => {};
  onclose: () => void = () => {};
  onmessage: (event: any) => void = () => {};
  onerror: (error: any) => void = () => {};
  readyState: number = WebSocket.CONNECTING;

  constructor(url: string, protocols?: string | string[]) {}

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {}
  close(code?: number, reason?: string): void {}
}

global.WebSocket = MockWebSocket as any;

// Mock crypto for browser environment
const mockCrypto = {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {
    digest: async (algorithm: string, data: Uint8Array) => {
      return new Uint8Array(32);
    },
    encrypt: async (algorithm: any, key: CryptoKey, data: Uint8Array) => {
      return new Uint8Array(data.length + 16);
    },
    decrypt: async (algorithm: any, key: CryptoKey, data: Uint8Array) => {
      return new Uint8Array(Math.max(0, data.length - 16));
    },
    importKey: async (
      format: string,
      keyData: Uint8Array,
      algorithm: any,
      extractable: boolean,
      keyUsages: string[],
    ) => {
      return {} as CryptoKey;
    },
    generateKey: async (algorithm: any, extractable: boolean, keyUsages: string[]) => {
      return {} as CryptoKey;
    },
  },
};

global.crypto = mockCrypto as unknown as Crypto;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

global.localStorage = localStorageMock as unknown as Storage;

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  }),
) as unknown as typeof fetch;

// Mock axios
const mockAxiosGet = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
const mockAxiosPost = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));

const mockAxios = {
  get: mockAxiosGet,
  post: mockAxiosPost,
  create: () => ({
    get: mockAxiosGet,
    post: mockAxiosPost,
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  }),
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

jest.mock('axios', () => mockAxios);

export const mockedAxios = mockAxios;
