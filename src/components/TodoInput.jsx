import { useState } from "react";
import "./TodoInput.css";

export function TodoInput({ onAdd }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  }

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <input
        className="todo-input__field"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs doing?"
        aria-label="New todo text"
      />
      <button
        className="todo-input__button"
        type="submit"
        disabled={!text.trim()}
      >
        Add
      </button>
    </form>
  );
}
