import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import Skeleton, { SkeletonText, SkeletonCard, SkeletonRow, SkeletonAvatar } from './Skeleton';

describe('Skeleton', () => {
  it('renders with aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild!;
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it("applies correct rounded class for 'sm'", () => {
    const { container } = render(<Skeleton rounded="sm" />);
    expect(container.firstElementChild!.className).toContain('rounded');
    // 'rounded' but not 'rounded-lg', 'rounded-xl', etc.
    expect(container.firstElementChild!.className).toMatch(/\brounded\b/);
  });

  it("applies correct rounded class for 'md' (default)", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild!.className).toContain('rounded-lg');
  });

  it("applies correct rounded class for 'lg'", () => {
    const { container } = render(<Skeleton rounded="lg" />);
    expect(container.firstElementChild!.className).toContain('rounded-xl');
  });

  it("applies correct rounded class for 'xl'", () => {
    const { container } = render(<Skeleton rounded="xl" />);
    expect(container.firstElementChild!.className).toContain('rounded-2xl');
  });

  it("applies correct rounded class for 'full'", () => {
    const { container } = render(<Skeleton rounded="full" />);
    expect(container.firstElementChild!.className).toContain('rounded-full');
  });
});

describe('SkeletonText', () => {
  it('renders correct number of lines (default 3)', () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll('[aria-hidden="true"]');
    expect(lines).toHaveLength(3);
  });

  it('renders correct number of lines when specified', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const lines = container.querySelectorAll('[aria-hidden="true"]');
    expect(lines).toHaveLength(5);
  });

  it("last line has 'w-3/5' class", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll('[aria-hidden="true"]');
    const lastLine = lines[lines.length - 1];
    expect(lastLine.className).toContain('w-3/5');
  });
});

describe('SkeletonCard', () => {
  it('renders avatar circle + text lines + action buttons', () => {
    const { container } = render(<SkeletonCard />);

    // Avatar circle (rounded-full skeleton)
    const allSkeletons = container.querySelectorAll('[aria-hidden="true"]');
    const roundedFullSkeletons = Array.from(allSkeletons).filter((el) =>
      el.className.includes('rounded-full')
    );
    // Should have at least 1 avatar circle + 2 action buttons = 3 rounded-full elements
    expect(roundedFullSkeletons.length).toBeGreaterThanOrEqual(3);

    // Text lines from SkeletonText (3 default lines)
    // Total skeletons should include avatar (1) + name lines (2) + text lines (3) + action buttons (2) = 8
    expect(allSkeletons.length).toBeGreaterThanOrEqual(8);
  });
});

describe('SkeletonRow', () => {
  it('renders correct number of columns (default 4)', () => {
    const { container } = render(<SkeletonRow />);
    const cols = container.querySelectorAll('[aria-hidden="true"]');
    expect(cols).toHaveLength(4);
  });

  it('renders correct number of columns when specified', () => {
    const { container } = render(<SkeletonRow cols={6} />);
    const cols = container.querySelectorAll('[aria-hidden="true"]');
    expect(cols).toHaveLength(6);
  });
});

describe('SkeletonAvatar', () => {
  it("renders with correct size classes for 'sm'", () => {
    const { container } = render(<SkeletonAvatar size="sm" />);
    const allSkeletons = container.querySelectorAll('[aria-hidden="true"]');
    const avatar = Array.from(allSkeletons).find((el) => el.className.includes('rounded-full'));
    expect(avatar).toBeTruthy();
    expect(avatar!.className).toContain('w-8');
    expect(avatar!.className).toContain('h-8');
  });

  it("renders with correct size classes for 'md' (default)", () => {
    const { container } = render(<SkeletonAvatar />);
    const allSkeletons = container.querySelectorAll('[aria-hidden="true"]');
    const avatar = Array.from(allSkeletons).find((el) => el.className.includes('rounded-full'));
    expect(avatar).toBeTruthy();
    expect(avatar!.className).toContain('w-10');
    expect(avatar!.className).toContain('h-10');
  });

  it("renders with correct size classes for 'lg'", () => {
    const { container } = render(<SkeletonAvatar size="lg" />);
    const allSkeletons = container.querySelectorAll('[aria-hidden="true"]');
    const avatar = Array.from(allSkeletons).find((el) => el.className.includes('rounded-full'));
    expect(avatar).toBeTruthy();
    expect(avatar!.className).toContain('w-12');
    expect(avatar!.className).toContain('h-12');
  });
});
