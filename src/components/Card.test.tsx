import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Card from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it("applies correct variant classes for 'default'", () => {
    render(<Card variant="default">Default</Card>);
    const card = screen.getByText('Default').closest('div')!;
    expect(card.className).toContain('bg-zinc-900');
    expect(card.className).toContain('border-zinc-800');
    expect(card.className).toContain('shadow-card');
  });

  it("applies correct variant classes for 'glass'", () => {
    render(<Card variant="glass">Glass</Card>);
    const card = screen.getByText('Glass').closest('div')!;
    expect(card.className).toContain('backdrop-blur-xl');
    expect(card.className).toContain('border-white/[0.06]');
  });

  it("applies correct variant classes for 'bordered'", () => {
    render(<Card variant="bordered">Bordered</Card>);
    const card = screen.getByText('Bordered').closest('div')!;
    expect(card.className).toContain('bg-transparent');
    expect(card.className).toContain('border-2');
    expect(card.className).toContain('border-zinc-700');
  });

  it('applies hover styles by default', () => {
    render(<Card variant="default">Hover</Card>);
    const card = screen.getByText('Hover').closest('div')!;
    expect(card.className).toContain('hover:shadow-hover');
  });

  it('no hover styles when hover=false', () => {
    render(
      <Card variant="default" hover={false}>
        No Hover
      </Card>
    );
    const card = screen.getByText('No Hover').closest('div')!;
    expect(card.className).not.toContain('hover:shadow-hover');
    expect(card.className).not.toContain('hover:-translate-y');
  });

  it("applies padding class 'none' (empty)", () => {
    render(<Card padding="none">None</Card>);
    const card = screen.getByText('None').closest('div')!;
    expect(card.className).not.toContain('p-4');
    expect(card.className).not.toContain('p-6');
    expect(card.className).not.toContain('p-8');
  });

  it("applies padding class 'sm'", () => {
    render(<Card padding="sm">Small</Card>);
    const card = screen.getByText('Small').closest('div')!;
    expect(card.className).toContain('p-4');
  });

  it("applies padding class 'md'", () => {
    render(<Card padding="md">Medium</Card>);
    const card = screen.getByText('Medium').closest('div')!;
    expect(card.className).toContain('p-6');
  });

  it("applies padding class 'lg'", () => {
    render(<Card padding="lg">Large</Card>);
    const card = screen.getByText('Large').closest('div')!;
    expect(card.className).toContain('p-8');
  });

  it('adds role="button" and tabIndex when onClick provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('handles keyboard Enter when onClick provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard Space when onClick provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does NOT add role="button" when no onClick', () => {
    render(<Card>Static</Card>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
