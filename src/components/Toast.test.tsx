import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Toast, { ToastContainer } from './Toast';

// Define Toast type locally to avoid importing from context (which may have side effects)
interface ToastType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

describe('Toast', () => {
  it('renders toast message text', () => {
    const toast: ToastType = { id: '1', type: 'info', message: 'Hello toast' };
    render(<Toast toast={toast} onClose={vi.fn()} />);
    expect(screen.getByText('Hello toast')).toBeInTheDocument();
  });

  it('renders success icon and green colors for type=success', () => {
    const toast: ToastType = { id: '1', type: 'success', message: 'Success!' };
    const { container } = render(<Toast toast={toast} onClose={vi.fn()} />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('bg-green-900/20');
    expect(wrapper.className).toContain('border-green-800');
    expect(wrapper.className).toContain('text-green-200');
  });

  it('renders error icon and red colors for type=error', () => {
    const toast: ToastType = { id: '1', type: 'error', message: 'Error!' };
    const { container } = render(<Toast toast={toast} onClose={vi.fn()} />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('bg-red-900/20');
    expect(wrapper.className).toContain('border-red-800');
    expect(wrapper.className).toContain('text-red-200');
  });

  it('calls onClose with toast id when close button clicked', () => {
    const onClose = vi.fn();
    const toast: ToastType = { id: 'abc-123', type: 'info', message: 'Close me' };
    render(<Toast toast={toast} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close notification'));
    expect(onClose).toHaveBeenCalledWith('abc-123');
  });
});

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    const toasts: ToastType[] = [
      { id: '1', type: 'success', message: 'First toast' },
      { id: '2', type: 'error', message: 'Second toast' },
      { id: '3', type: 'info', message: 'Third toast' },
    ];
    render(<ToastContainer toasts={toasts} onClose={vi.fn()} />);
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
    expect(screen.getByText('Third toast')).toBeInTheDocument();
  });

  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<ToastContainer toasts={[]} onClose={vi.fn()} />);
    // The container div is always rendered, but it should have no toast children
    const wrapper = container.firstElementChild!;
    expect(wrapper.children).toHaveLength(0);
  });
});
