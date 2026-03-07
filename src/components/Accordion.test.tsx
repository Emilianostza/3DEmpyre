import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Accordion, { AccordionItem } from './Accordion';

const sampleItems = [
  { title: 'Section One', content: 'Content of section one' },
  { title: 'Section Two', content: 'Content of section two' },
  { title: 'Section Three', content: 'Content of section three' },
];

describe('Accordion', () => {
  it('renders all item titles', () => {
    render(<Accordion items={sampleItems} />);
    expect(screen.getByText('Section One')).toBeInTheDocument();
    expect(screen.getByText('Section Two')).toBeInTheDocument();
    expect(screen.getByText('Section Three')).toBeInTheDocument();
  });

  it('first item is collapsed by default', () => {
    render(<Accordion items={sampleItems} />);
    const buttons = screen.getAllByRole('button');
    // All items should be collapsed initially (aria-expanded=false)
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('clicking an item title opens it (content becomes visible)', () => {
    render(<Accordion items={sampleItems} />);
    const firstButton = screen.getByText('Section One').closest('button')!;
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('in single mode (default): opening one item closes the previously open one', () => {
    render(<Accordion items={sampleItems} />);
    const firstButton = screen.getByText('Section One').closest('button')!;
    const secondButton = screen.getByText('Section Two').closest('button')!;

    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    expect(secondButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(secondButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('in allowMultiple mode: multiple items can be open simultaneously', () => {
    render(<Accordion items={sampleItems} allowMultiple />);
    const firstButton = screen.getByText('Section One').closest('button')!;
    const secondButton = screen.getByText('Section Two').closest('button')!;

    fireEvent.click(firstButton);
    fireEvent.click(secondButton);

    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('AccordionItem', () => {
  it('sets aria-expanded correctly', () => {
    const { rerender } = render(
      <AccordionItem title="Test Item" content="Test content" isOpen={false} onToggle={vi.fn()} />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <AccordionItem title="Test Item" content="Test content" isOpen={true} onToggle={vi.fn()} />
    );
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
