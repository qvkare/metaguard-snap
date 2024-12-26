import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Component Tests', () => {
  beforeEach(() => {
    render(<App />);
  });

  test('ana başlık doğru şekilde render ediliyor', () => {
    const headerElement = screen.getByRole('heading', { level: 1 });
    expect(headerElement).toBeInTheDocument();
  });

  test('logo doğru şekilde yükleniyor', () => {
    const logoElement = screen.getByAltText(/react logo/i);
    expect(logoElement).toBeInTheDocument();
    expect(logoElement).toHaveAttribute('src', 'logo.svg');
  });

  test('link doğru URL\'ye yönlendiriyor', () => {
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toHaveAttribute('href', 'https://reactjs.org');
  });

  test('counter artırma işlevi çalışıyor', async () => {
    const user = userEvent.setup();
    const countButton = screen.getByRole('button', { name: /count/i });
    
    const initialCount = screen.getByText(/count is/i);
    expect(initialCount).toHaveTextContent('count is 0');

    await user.click(countButton);
    expect(screen.getByText(/count is/i)).toHaveTextContent('count is 1');
  });
}); 