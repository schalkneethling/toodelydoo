import { useState } from "react";
import { useTodos } from "./hooks/useTodos.js";
import { Header } from "./components/Header.jsx";
import { TodoInput } from "./components/TodoInput.jsx";
import { FilterBar } from "./components/FilterBar.jsx";
import { TodoList } from "./components/TodoList.jsx";
import "./App.css";

function App() {
  const { todos, addTodo, toggleTodo, editTodo, removeTodo, clearCompleted } =
    useTodos();
  const [filter, setFilter] = useState("all");

  const activeCount = todos.filter((t) => !t.completed).length;
  const hasCompleted = todos.some((t) => t.completed);

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <main className="app">
      <Header />
      <TodoInput onAdd={addTodo} />
      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        activeCount={activeCount}
        hasCompleted={hasCompleted}
        onClearCompleted={clearCompleted}
      />
      <TodoList
        todos={filteredTodos}
        onToggle={toggleTodo}
        onEdit={editTodo}
        onDelete={removeTodo}
      />
    </main>
  );
}

export default App;
