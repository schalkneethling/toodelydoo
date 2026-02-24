import { useState, useEffect } from "react";
import * as db from "../db.js";

export function useTodos() {
  const [todos, setTodos] = useState([]);

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

  return { todos, addTodo, toggleTodo, editTodo, removeTodo, clearCompleted };
}
