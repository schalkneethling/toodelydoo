import { useState, useEffect } from "react";
import * as db from "../db.js";

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [hasPendingSort, setHasPendingSort] = useState(false);

  useEffect(() => {
    db.getAllTodos().then(setTodos);
  }, []);

  async function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const todo = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [todo, ...prev]);
    await db.addTodo(todo);
  }

  async function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      await db.updateTodo({ ...todo, completed: !todo.completed });
    }
  }

  async function editTodo(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) return;

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t))
    );
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      await db.updateTodo({ ...todo, text: trimmed });
    }
  }

  async function removeTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await db.deleteTodo(id);
  }

  async function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
    await db.clearCompletedTodos();
  }

  async function sortWithAI() {
    if (isSorting) return;

    setIsSorting(true);
    try {
      const currentTodos = todos;
      const response = await fetch('/api/ai/sort', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ todos: currentTodos }),
      });

      if (!response.ok) {
        let message;
        try {
          const errData = await response.json();
          message = errData.error || `Sort failed with status ${response.status}`;
        } catch {
          const errText = await response.text();
          message = errText || `Sort failed with status ${response.status}`;
        }
        throw new Error(message);
      }

      const { sortedIds } = await response.json();

      if (!sortedIds || !Array.isArray(sortedIds)) {
        throw new Error('Invalid response: missing sortedIds array');
      }

      const todoMap = new Map(currentTodos.map((t) => [t.id, t]));
      const orderedTodos = sortedIds
        .filter((id) => todoMap.has(id))
        .map((id, index) => ({ ...todoMap.get(id), sortOrder: index }));

      setTodos(orderedTodos);
      setHasPendingSort(true);
    } finally {
      setIsSorting(false);
    }
  }

  async function saveSortOrder() {
    await db.persistSortOrder(todos);
    setHasPendingSort(false);
  }

  async function discardSortOrder() {
    const restored = await db.getAllTodos();
    setTodos(restored);
    setHasPendingSort(false);
  }

  return {
    todos,
    addTodo,
    toggleTodo,
    editTodo,
    removeTodo,
    clearCompleted,
    isSorting,
    sortWithAI,
    hasPendingSort,
    saveSortOrder,
    discardSortOrder,
  };
}
