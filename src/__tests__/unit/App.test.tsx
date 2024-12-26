import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('App Component Tests', () => {
  beforeEach(() => {
    render(<App />);
  });

  test('renders main heading correctly', () => {
    const headerElement = screen.getByRole('heading', { level: 1 });
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveTextContent('MetaGuard Snap');
  });

  test('renders description text correctly', () => {
    const description = screen.getByText(
      /A MetaMask snap for enhanced transaction security analysis/i,
    );
    expect(description).toBeInTheDocument();
  });
});
