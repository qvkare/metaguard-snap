import axios from 'axios';

export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async get<T>(url: string): Promise<T> {
    const response = await axios.get<T>(`${this.baseUrl}${url}`);
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await axios.post<T>(`${this.baseUrl}${url}`, data);
    return response.data;
  }
}
