import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortButton } from './SortButton.jsx';

describe('SortButton', () => {
  it('renders "Sort With AI" when isSorting is false', () => {
    render(<SortButton onClick={vi.fn()} isSorting={false} disabled={false} />);
    expect(screen.getByRole('button', { name: /sort with ai/i })).toBeTruthy();
  });

  it('renders "Sorting…" when isSorting is true', () => {
    render(<SortButton onClick={vi.fn()} isSorting={true} disabled={false} />);
    expect(screen.getByRole('button', { name: /sorting/i })).toBeTruthy();
  });

  it('button is disabled when disabled prop is true', () => {
    render(<SortButton onClick={vi.fn()} isSorting={false} disabled={true} />);
    const btn = screen.getByRole('button');
    expect(btn.disabled).toBe(true);
  });

  it('button is not disabled when disabled prop is false', () => {
    render(<SortButton onClick={vi.fn()} isSorting={false} disabled={false} />);
    const btn = screen.getByRole('button');
    expect(btn.disabled).toBe(false);
  });

  it('calls onClick when clicked and not disabled', async () => {
    const onClick = vi.fn();
    render(<SortButton onClick={onClick} isSorting={false} disabled={false} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<SortButton onClick={onClick} isSorting={false} disabled={true} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
