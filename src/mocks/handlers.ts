import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/data', () => {
    return HttpResponse.json({
      message: 'Test verisi',
    });
  }),
];
