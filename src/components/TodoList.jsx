import { TodoItem } from "./TodoItem.jsx";
import "./TodoList.css";

export function TodoList({ todos, onToggle, onEdit, onDelete, onCopy }) {
  if (todos.length === 0) {
    return <p className="todo-list__empty">No todos to show.</p>;
  }

  return (
    <ul className="todo-list" aria-live="polite" aria-label="Todo list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      ))}
    </ul>
  );
}
