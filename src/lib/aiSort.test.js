import { describe, it, expect } from 'vitest';
import { buildPrompt, parseAISortResponse } from './aiSort.js';

describe('buildPrompt', () => {
  const todos = [
    { id: 'a', text: 'Buy milk' },
    { id: 'b', text: 'Fix bug #42' },
    { id: 'c', text: 'Call dentist' },
  ];

  it('includes all todo IDs in output', () => {
    const prompt = buildPrompt(todos);
    expect(prompt).toContain('a');
    expect(prompt).toContain('b');
    expect(prompt).toContain('c');
  });

  it('includes all todo texts in output', () => {
    const prompt = buildPrompt(todos);
    expect(prompt).toContain('Buy milk');
    expect(prompt).toContain('Fix bug #42');
    expect(prompt).toContain('Call dentist');
  });

  it('formats todos as expected lines', () => {
    const prompt = buildPrompt(todos);
    expect(prompt).toContain('a: Buy milk');
    expect(prompt).toContain('b: Fix bug #42');
    expect(prompt).toContain('c: Call dentist');
  });

  it('handles empty array without error', () => {
    expect(() => buildPrompt([])).not.toThrow();
  });
});

describe('parseAISortResponse', () => {
  it('parses clean JSON', () => {
    const result = parseAISortResponse('{"sortedIds":["a","b","c"]}');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('strips ```json ... ``` code fences before parsing', () => {
    const raw = '```json\n{"sortedIds":["a","b"]}\n```';
    const result = parseAISortResponse(raw);
    expect(result).toEqual(['a', 'b']);
  });

  it('strips bare ``` fences', () => {
    const raw = '```\n{"sortedIds":["x","y"]}\n```';
    const result = parseAISortResponse(raw);
    expect(result).toEqual(['x', 'y']);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAISortResponse('not-json')).toThrow();
  });

  it('throws when sortedIds is missing from parsed object', () => {
    expect(() => parseAISortResponse('{"ids":["a"]}')).toThrow();
  });

  it('throws when sortedIds is not an array', () => {
    expect(() => parseAISortResponse('{"sortedIds":"a,b"}')).toThrow();
  });
});
