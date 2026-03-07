import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Button from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it("applies correct variant class for 'primary'", () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-brand-600');
  });

  it("applies correct variant class for 'danger'", () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-error');
  });

  it("applies correct size class for 'sm'", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('px-4');
    expect(button.className).toContain('py-2');
    expect(button.className).toContain('text-sm');
  });

  it("applies correct size class for 'lg'", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('px-6');
    expect(button.className).toContain('py-3');
    expect(button.className).toContain('text-base');
  });

  it('shows spinner when loading=true', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('is disabled when loading=true', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled=true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows icon on left by default', () => {
    const icon = <span data-testid="test-icon">icon</span>;
    render(<Button icon={icon}>With Icon</Button>);
    const button = screen.getByRole('button');
    const iconEl = screen.getByTestId('test-icon');
    const textEl = screen.getByText('With Icon');
    // Icon should come before the text in DOM order
    const children = Array.from(button.childNodes);
    const iconIndex = children.findIndex((node) => node.contains(iconEl));
    const textIndex = children.findIndex((node) => node.contains(textEl));
    expect(iconIndex).toBeLessThan(textIndex);
  });

  it("shows icon on right when iconPosition='right'", () => {
    const icon = <span data-testid="test-icon">icon</span>;
    render(
      <Button icon={icon} iconPosition="right">
        With Icon
      </Button>
    );
    const button = screen.getByRole('button');
    const iconEl = screen.getByTestId('test-icon');
    const textEl = screen.getByText('With Icon');
    const children = Array.from(button.childNodes);
    const iconIndex = children.findIndex((node) => node.contains(iconEl));
    const textIndex = children.findIndex((node) => node.contains(textEl));
    expect(iconIndex).toBeGreaterThan(textIndex);
  });

  it('does not show icon when loading (shows spinner instead)', () => {
    const icon = <span data-testid="test-icon">icon</span>;
    render(
      <Button icon={icon} loading>
        Loading
      </Button>
    );
    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('passes additional HTML attributes (onClick, type, aria-label)', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} type="submit" aria-label="Submit form">
        Submit
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('icon-only mode (no children, just icon) uses different padding', () => {
    const icon = <span data-testid="test-icon">icon</span>;
    const { rerender } = render(<Button icon={icon} size="md" />);
    const iconOnlyButton = screen.getByRole('button');
    // Icon-only mode uses 'p-2.5' for md size
    expect(iconOnlyButton.className).toContain('p-2.5');
    expect(iconOnlyButton.className).not.toContain('px-5');

    // With children uses 'px-5 py-2.5' for md size
    rerender(
      <Button icon={icon} size="md">
        Text
      </Button>
    );
    const withChildrenButton = screen.getByRole('button');
    expect(withChildrenButton.className).toContain('px-5');
  });
});
