import { render, screen } from '@testing-library/react';
import RootLayout from "./layout";

jest.mock('next/font/google', () => ({
  Sarabun: () => ({
    variable: '--font-sarabun',
  }),
}));
describe('RootLayout', () => {
  it('renders children', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('includes the Toaster component', () => {
    render(
      <RootLayout>
        <div />
      </RootLayout>
    );
    // You might need to adjust this selector based on the actual output of the Toaster component
    expect(screen.getByRole('log')).toBeInTheDocument();
  });
});
