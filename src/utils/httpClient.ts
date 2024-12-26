import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class HttpClient {
  private readonly client: AxiosInstance;

  constructor(baseURL?: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      timeout: parseInt(process.env.API_TIMEOUT || '5000'),
      ...config
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      const delay = parseInt(process.env.RATE_LIMIT_DELAY || '1000');
      await new Promise(resolve => setTimeout(resolve, delay));
      return config;
    });
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
} 