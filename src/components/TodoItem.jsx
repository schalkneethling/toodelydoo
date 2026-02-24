import { useState, useRef, useEffect } from "react";
import "./TodoItem.css";

export function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editInputRef = useRef(null);

  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editing]);

  function startEditing() {
    setEditText(todo.text);
    setEditing(true);
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo.id, trimmed);
    }
    setEditing(false);
  }

  function handleEditKeyDown(e) {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      setEditText(todo.text);
      setEditing(false);
    }
  }

  return (
    <li className={`todo-item ${todo.completed ? "todo-item--completed" : ""}`}>
      <span className="todo-item__checkbox-wrapper">
        <input
          className="todo-item__checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          id={`todo-${todo.id}`}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? "active" : "completed"}`}
        />
        <span className="todo-item__check" aria-hidden="true">
          {todo.completed && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 12 10 18 20 6" />
            </svg>
          )}
        </span>
      </span>
      {editing ? (
        <input
          className="todo-item__edit"
          ref={editInputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleEditKeyDown}
          aria-label="Edit todo text"
        />
      ) : (
        <label
          className="todo-item__label"
          htmlFor={`todo-${todo.id}`}
          onDoubleClick={startEditing}
        >
          {todo.text}
        </label>
      )}
      <button
        className="todo-item__delete"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.text}"`}
      >
        ×
      </button>
    </li>
  );
}
