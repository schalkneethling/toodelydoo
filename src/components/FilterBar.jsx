import "./FilterBar.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

export function FilterBar({
  filter,
  onFilterChange,
  activeCount,
  hasCompleted,
  onClearCompleted,
  sortAction,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__top">
        <div className="filter-bar__filters">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`filter-bar__button ${filter === key ? "filter-bar__button--active" : ""}`}
              onClick={() => onFilterChange(key)}
              aria-pressed={filter === key}
            >
              {label}
            </button>
          ))}
        </div>
        {sortAction}
      </div>
      <div className="filter-bar__bottom">
        <span className="filter-bar__count">
          {activeCount} {activeCount === 1 ? "item" : "items"} left
        </span>
        {hasCompleted && (
          <button className="filter-bar__clear" onClick={onClearCompleted}>
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
}
