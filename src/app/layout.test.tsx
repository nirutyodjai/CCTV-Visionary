import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

    // Check if the html element has the correct classes applied from globals.css
    const htmlElement = document.documentElement;
    expect(htmlElement).toHaveClass('font-sans');
    expect(htmlElement).toHaveClass('antialiased');
  });
});
