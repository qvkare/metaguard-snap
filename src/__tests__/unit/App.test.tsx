import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('App Component Tests', () => {
  beforeEach(() => {
    render(<App />);
  });

  test('renders main heading correctly', () => {
    const headingElement = screen.getByText(/MetaGuard Snap/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders description text correctly', () => {
    const descriptionElement = screen.getByText(/A MetaMask snap for enhanced transaction security analysis/i);
    expect(descriptionElement).toBeInTheDocument();
  });
});
