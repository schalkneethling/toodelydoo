import { describe, it, expect } from 'vitest';
import { sortTodos } from './sortTodos.js';

describe('sortTodos', () => {
  it('returns empty array for empty input', () => {
    expect(sortTodos([])).toEqual([]);
  });

  it('all items with sortOrder defined: returns ascending by sortOrder', () => {
    const todos = [
      { id: 'c', text: 'C', sortOrder: 2, createdAt: 100 },
      { id: 'a', text: 'A', sortOrder: 0, createdAt: 300 },
      { id: 'b', text: 'B', sortOrder: 1, createdAt: 200 },
    ];
    const result = sortTodos(todos);
    expect(result.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('all items without sortOrder: returns descending by createdAt (newest first)', () => {
    const todos = [
      { id: 'a', text: 'A', createdAt: 100 },
      { id: 'b', text: 'B', createdAt: 300 },
      { id: 'c', text: 'C', createdAt: 200 },
    ];
    const result = sortTodos(todos);
    expect(result.map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('mixed: unsorted items appear first (descending createdAt), sorted items follow (ascending sortOrder)', () => {
    const todos = [
      { id: 'sorted1', text: 'S1', sortOrder: 0, createdAt: 50 },
      { id: 'new2', text: 'N2', createdAt: 400 },
      { id: 'sorted2', text: 'S2', sortOrder: 1, createdAt: 100 },
      { id: 'new1', text: 'N1', createdAt: 500 },
    ];
    const result = sortTodos(todos);
    // new items (no sortOrder) come first, newest first
    // then sorted items, ascending sortOrder
    expect(result.map((t) => t.id)).toEqual(['new1', 'new2', 'sorted1', 'sorted2']);
  });

  it('does not mutate the original array', () => {
    const todos = [
      { id: 'b', text: 'B', sortOrder: 1, createdAt: 100 },
      { id: 'a', text: 'A', sortOrder: 0, createdAt: 200 },
    ];
    const original = [...todos];
    sortTodos(todos);
    expect(todos).toEqual(original);
  });
});
