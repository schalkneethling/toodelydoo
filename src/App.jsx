import { useState } from "react";
import { useTodos } from "./hooks/useTodos.js";
import { useToast } from "./hooks/useToast.js";
import { Header } from "./components/Header.jsx";
import { TodoInput } from "./components/TodoInput.jsx";
import { FilterBar } from "./components/FilterBar.jsx";
import { TodoList } from "./components/TodoList.jsx";
import { SortButton } from "./components/SortButton.jsx";
import { Toast } from "./components/Toast.jsx";
import "./App.css";

function App() {
  const { todos, addTodo, toggleTodo, editTodo, removeTodo, clearCompleted, isSorting, sortWithAI, hasPendingSort, saveSortOrder, discardSortOrder } =
    useTodos();
  const { toast, showToast, dismissToast } = useToast();
  const [filter, setFilter] = useState("all");

  const activeCount = todos.filter((t) => !t.completed).length;
  const hasCompleted = todos.some((t) => t.completed);

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  async function handleSort() {
    try {
      await sortWithAI();
      showToast("AI sort ready — save to keep or undo to revert.", "success");
    } catch (err) {
      showToast(err.message || "Failed to sort todos.", "error");
    }
  }

  async function handleSaveSortOrder() {
    await saveSortOrder();
    showToast("Sort saved!", "success");
  }

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
        sortAction={
          hasPendingSort ? (
            <div className="sort-actions">
              <button className="sort-actions__save" onClick={handleSaveSortOrder}>
                Save Sort
              </button>
              <button className="sort-actions__undo" onClick={discardSortOrder}>
                Undo Sort
              </button>
            </div>
          ) : (
            <SortButton
              onClick={handleSort}
              isSorting={isSorting}
              disabled={todos.length === 0}
            />
          )
        }
      />
      <TodoList
        todos={filteredTodos}
        onToggle={toggleTodo}
        onEdit={editTodo}
        onDelete={removeTodo}
      />
      <Toast toast={toast} onDismiss={dismissToast} />
    </main>
  );
}

export default App;
