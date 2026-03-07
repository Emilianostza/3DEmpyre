import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useTheme } from '@/contexts/ThemeContext';

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

const mockToggleTheme = vi.fn();
const mockSetTheme = vi.fn();

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    theme: 'dark',
    toggleTheme: mockToggleTheme,
    setTheme: mockSetTheme,
  })),
}));

// lucide-react icons: render as simple SVGs with data-testid for identification
vi.mock('lucide-react', () => ({
  Moon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="moon-icon" {...props} />,
  Sun: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="sun-icon" {...props} />,
}));

const mockedUseTheme = vi.mocked(useTheme);

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('DarkModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default dark theme
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });
  });

  it('renders the toggle button', () => {
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows Sun icon when theme is dark', () => {
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);

    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('shows Moon icon when theme is light', () => {
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);

    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', async () => {
    const user = userEvent.setup();
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label for dark theme ("Switch to light mode")', () => {
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('has correct aria-label for light theme ("Switch to dark mode")', () => {
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });
});
