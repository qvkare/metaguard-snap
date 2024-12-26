import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';

function render(ui: ReactElement, { ...renderOptions } = {}) {
  return rtlRender(ui, { ...renderOptions });
}

export * from '@testing-library/react';
export { render };
