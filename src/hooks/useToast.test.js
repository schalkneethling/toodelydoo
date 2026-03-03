import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast.js';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('showToast: sets toast.message and toast.type', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Hello world', 'success');
    });

    expect(result.current.toast).toEqual({ message: 'Hello world', type: 'success' });
  });

  it('showToast: calling twice replaces the first toast (no double-timer leak)', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('First', 'info');
    });

    act(() => {
      result.current.showToast('Second', 'error');
    });

    expect(result.current.toast).toEqual({ message: 'Second', type: 'error' });
  });

  it('dismissToast: sets toast to null', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Hello', 'info');
    });

    act(() => {
      result.current.dismissToast();
    });

    expect(result.current.toast).toBeNull();
  });

  it('auto-dismiss: after 5000ms, toast is null', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Auto bye', 'success');
    });

    expect(result.current.toast).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toast).toBeNull();
  });

  it('auto-dismiss is cancelled when dismissToast is called before timer fires', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Cancel me', 'info');
    });

    act(() => {
      result.current.dismissToast();
    });

    // Advance past the 5s mark — should not throw or cause double-dismiss
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toast).toBeNull();
  });
});
