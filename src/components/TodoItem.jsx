import React, { useState, useRef, useEffect } from "react";
import { EllipsisVertical, Copy, Trash2 } from "lucide-react";
import "./TodoItem.css";

export function TodoItem({ todo, onToggle, onEdit, onDelete, onCopy }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editInputRef = useRef(null);
  const menuRef = useRef(null);

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

  async function handleCopy() {
    await navigator.clipboard.writeText(todo.text);
    onCopy?.(todo.text);
    menuRef.current?.hidePopover();
  }

  return (
    <li className={`todo-item ${todo.completed ? "todo-item--completed" : ""}`}>
      <label className="todo-item__checkbox-wrapper" htmlFor={`todo-${todo.id}`}>
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
      </label>
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

      {/* Kebab trigger — implicit anchor via popoverTarget */}
      <button
        className="todo-item__menu-trigger"
        popoverTarget={`todo-menu-${todo.id}`}
        aria-label={`Actions for "${todo.text}"`}
      >
        <EllipsisVertical size={16} aria-hidden="true" />
      </button>

      {/* Menu popover */}
      <div
        id={`todo-menu-${todo.id}`}
        ref={menuRef}
        popover="auto"
        className="todo-item__menu"
      >
        <button className="todo-item__menu-item" onClick={handleCopy}>
          <Copy size={14} aria-hidden="true" />
          Copy
        </button>
        <button
          className="todo-item__menu-item todo-item__menu-item--delete"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 size={14} aria-hidden="true" />
          Delete
        </button>
      </div>
    </li>
  );
}
