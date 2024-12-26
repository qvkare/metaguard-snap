import { render } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import App from '../../App';

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn()
  })),
}));

describe('Index', () => {
  let div: HTMLDivElement;
  let mockRoot: ReturnType<typeof createRoot>;

  beforeEach(() => {
    div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);
    mockRoot = createRoot(div);
    (createRoot as jest.Mock).mockReturnValue(mockRoot);
  });

  afterEach(() => {
    document.body.removeChild(div);
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    require('../../index');
    expect(createRoot).toHaveBeenCalledWith(div);
  });

  it('renders App component', () => {
    render(<App />);
    expect(mockRoot.render).toHaveBeenCalled();
  });
});
