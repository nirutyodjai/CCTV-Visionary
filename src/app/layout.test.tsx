import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

// Mock globals.css
jest.mock('./globals.css', () => ({}));

describe('RootLayout', () => {
  it('renders the children', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child-element">Hello, world!</div>
      </RootLayout>
    );

    // Check if the child element is rendered
    const childElement = screen.getByTestId('child-element');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Hello, world!');

    // Check if HTML and body elements are present
    const htmlElement = container.querySelector('html');
    const bodyElement = container.querySelector('body');
    
    expect(htmlElement).toBeInTheDocument();
    expect(bodyElement).toBeInTheDocument();
  });
});
