import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem.jsx';

const todo = { id: 'abc', text: 'Buy groceries', completed: false };

function renderItem(props = {}) {
  return render(
    <TodoItem
      todo={todo}
      onToggle={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onCopy={vi.fn()}
      {...props}
    />
  );
}

describe('TodoItem kebab menu', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders kebab trigger with correct aria-label', () => {
    renderItem();
    expect(
      screen.getByRole('button', { name: `Actions for "${todo.text}"` })
    ).toBeTruthy();
  });

  it('menu popover has correct id and popover attribute', () => {
    const { container } = renderItem();
    const menu = container.querySelector(`#todo-menu-${todo.id}`);
    expect(menu).toBeTruthy();
    expect(menu.getAttribute('popover')).toBe('auto');
  });

  it('clicking Copy calls clipboard.writeText with todo text and calls onCopy', async () => {
    const onCopy = vi.fn();
    renderItem({ onCopy });

    const copyBtn = screen.getByRole('button', { name: /copy/i, hidden: true });
    await userEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(todo.text);
    expect(onCopy).toHaveBeenCalledWith(todo.text);
  });

  it('clicking Delete calls onDelete with the todo id', async () => {
    const onDelete = vi.fn();
    renderItem({ onDelete });

    const deleteBtn = screen.getByRole('button', { name: /delete/i, hidden: true });
    await userEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(todo.id);
  });
});
