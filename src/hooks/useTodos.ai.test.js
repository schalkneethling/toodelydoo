import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos.js';

// Mock the db module
vi.mock('../db.js', () => ({
  getAllTodos: vi.fn().mockResolvedValue([]),
  addTodo: vi.fn().mockResolvedValue(),
  updateTodo: vi.fn().mockResolvedValue(),
  deleteTodo: vi.fn().mockResolvedValue(),
  clearCompletedTodos: vi.fn().mockResolvedValue(),
  persistSortOrder: vi.fn().mockResolvedValue(),
}));

import * as db from '../db.js';

const TODOS = [
  { id: 'a', text: 'Buy milk', completed: false, createdAt: 100 },
  { id: 'b', text: 'Fix bug', completed: false, createdAt: 200 },
  { id: 'c', text: 'Call dentist', completed: false, createdAt: 300 },
];

function mockFetchSuccess(sortedIds) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ sortedIds }),
  });
}

function mockFetchErrorResponse(message, status = 500) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    text: () => Promise.resolve(message),
    status,
  });
}

function mockFetchNetworkError(message) {
  global.fetch = vi.fn().mockRejectedValue(new Error(message));
}

beforeEach(() => {
  vi.clearAllMocks();
  db.getAllTodos.mockResolvedValue([...TODOS]);
});

describe('useTodos – sortWithAI', () => {
  it('on successful response: todos state is reordered to match sortedIds', async () => {
    mockFetchSuccess(['c', 'a', 'b']);
    const { result } = renderHook(() => useTodos());

    // Wait for initial load
    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    expect(result.current.todos.map((t) => t.id)).toEqual(['c', 'a', 'b']);
  });

  it('on successful response: each reordered todo has sortOrder set to its index', async () => {
    mockFetchSuccess(['b', 'c', 'a']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    const todos = result.current.todos;
    expect(todos[0].sortOrder).toBe(0);
    expect(todos[1].sortOrder).toBe(1);
    expect(todos[2].sortOrder).toBe(2);
  });

  it('on successful response: db.persistSortOrder is NOT called', async () => {
    mockFetchSuccess(['c', 'a', 'b']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    expect(db.persistSortOrder).not.toHaveBeenCalled();
  });

  it('on successful response: hasPendingSort is set to true', async () => {
    mockFetchSuccess(['c', 'a', 'b']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    expect(result.current.hasPendingSort).toBe(true);
  });

  it('hasPendingSort starts as false', async () => {
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    expect(result.current.hasPendingSort).toBe(false);
  });

  it('on successful response: isSorting returns to false', async () => {
    mockFetchSuccess(['a', 'b', 'c']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    expect(result.current.isSorting).toBe(false);
  });

  it('on non-ok response: throws with error message from response body', async () => {
    mockFetchErrorResponse('Invalid API key');
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await expect(
      act(async () => {
        await result.current.sortWithAI();
      })
    ).rejects.toThrow();
  });

  it('on network failure: throws', async () => {
    mockFetchNetworkError('Network error');
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await expect(
      act(async () => {
        await result.current.sortWithAI();
      })
    ).rejects.toThrow();
  });

  it('on malformed response (missing sortedIds): throws', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ wrongKey: [] }),
    });
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await expect(
      act(async () => {
        await result.current.sortWithAI();
      })
    ).rejects.toThrow();
  });

  it('when called while already sorting: returns early (no second fetch)', async () => {
    // Slow fetch that we can control
    let resolveFetch;
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = () =>
          resolve({
            ok: true,
            json: () => Promise.resolve({ sortedIds: ['a', 'b', 'c'] }),
          });
      })
    );

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    // Start first sort (don't await it)
    act(() => {
      result.current.sortWithAI();
    });

    // isSorting should be true
    expect(result.current.isSorting).toBe(true);

    // Try to start second sort while first is in progress
    await act(async () => {
      await result.current.sortWithAI();
    });

    // fetch should only have been called once
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Resolve the first fetch
    await act(async () => {
      resolveFetch();
    });
  });
});

describe('useTodos – saveSortOrder', () => {
  it('calls db.persistSortOrder with the current todos', async () => {
    mockFetchSuccess(['c', 'a', 'b']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    await act(async () => {
      await result.current.saveSortOrder();
    });

    expect(db.persistSortOrder).toHaveBeenCalledTimes(1);
    const calledWith = db.persistSortOrder.mock.calls[0][0];
    expect(calledWith.map((t) => t.id)).toEqual(['c', 'a', 'b']);
  });

  it('sets hasPendingSort to false', async () => {
    mockFetchSuccess(['c', 'a', 'b']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    expect(result.current.hasPendingSort).toBe(true);

    await act(async () => {
      await result.current.saveSortOrder();
    });

    expect(result.current.hasPendingSort).toBe(false);
  });
});

describe('useTodos – discardSortOrder', () => {
  it('calls db.getAllTodos()', async () => {
    mockFetchSuccess(['c', 'a', 'b']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    db.getAllTodos.mockClear();

    await act(async () => {
      await result.current.discardSortOrder();
    });

    expect(db.getAllTodos).toHaveBeenCalledTimes(1);
  });

  it('restores todos to the DB state', async () => {
    mockFetchSuccess(['c', 'a', 'b']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    // After sort, order is c, a, b
    expect(result.current.todos.map((t) => t.id)).toEqual(['c', 'a', 'b']);

    // DB still has original order
    db.getAllTodos.mockResolvedValue([...TODOS]);

    await act(async () => {
      await result.current.discardSortOrder();
    });

    expect(result.current.todos.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('sets hasPendingSort to false', async () => {
    mockFetchSuccess(['c', 'a', 'b']);
    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    await act(async () => {
      await result.current.sortWithAI();
    });

    expect(result.current.hasPendingSort).toBe(true);

    await act(async () => {
      await result.current.discardSortOrder();
    });

    expect(result.current.hasPendingSort).toBe(false);
  });
});
