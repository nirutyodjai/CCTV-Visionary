import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

describe('RootLayout', () => {
  it('renders the children and applies the correct styles', () => {
    render(
      <RootLayout>
        <div data-testid="child-element">Hello, world!</div>
      </RootLayout>
    );

    // Check if the child element is rendered
    const childElement = screen.getByTestId('child-element');
    expect(childElement).toBeInTheDocument();

    // Check if the body has the correct classes applied from globals.css
    const bodyElement = document.body;
    expect(bodyElement).toHaveClass('font-sans');
    expect(bodyElement).toHaveClass('antialiased');
  });
});
