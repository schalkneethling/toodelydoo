import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast.jsx';

describe('Toast', () => {
  const defaultProps = {
    toast: { message: 'Something happened', type: 'info' },
    onDismiss: vi.fn(),
  };

  it('renders the message text', () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText('Something happened')).toBeTruthy();
  });

  it('has role="alert" when type is "error"', () => {
    render(
      <Toast
        toast={{ message: 'Oops', type: 'error' }}
        onDismiss={vi.fn()}
      />
    );
    // hidden: true because jsdom applies display:none to popover="auto" elements
    expect(screen.getByRole('alert', { hidden: true })).toBeTruthy();
  });

  it('has role="status" when type is "success"', () => {
    render(
      <Toast
        toast={{ message: 'Done!', type: 'success' }}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByRole('status', { hidden: true })).toBeTruthy();
  });

  it('has role="status" when type is "info"', () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByRole('status', { hidden: true })).toBeTruthy();
  });

  it('close button is present and calls onDismiss when clicked', async () => {
    const onDismiss = vi.fn();
    render(<Toast toast={{ message: 'Hi', type: 'info' }} onDismiss={onDismiss} />);

    const closeBtn = screen.getByRole('button', { name: /dismiss/i, hidden: true });
    await userEvent.click(closeBtn);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when toast is null', () => {
    const { container } = render(<Toast toast={null} onDismiss={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
