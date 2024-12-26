import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class HttpClient {
  private readonly client: AxiosInstance;

  constructor(baseURL?: string, config: AxiosRequestConfig = {}) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      ...config,
    });
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await this.client.get<T>(url, config);
    return { data: response.data };
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const response = await this.client.post<T>(url, data, config);
    return { data: response.data };
  }
} 