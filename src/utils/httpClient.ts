import axios, { AxiosResponse } from 'axios';

export class HttpClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async get<T>(endpoint: string): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const response = await axios.get<T>(`${this.baseUrl}${endpoint}`, {
          headers: this.apiKey ? { 'X-API-Key': this.apiKey } : undefined,
        });
        resolve(response.data);
      }, 1000);
    });
  }

  async post<T, D>(endpoint: string, data: D): Promise<T> {
    const response: AxiosResponse<T> = await axios.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.apiKey ? { 'X-API-Key': this.apiKey } : undefined,
    });
    return response.data;
  }
}
