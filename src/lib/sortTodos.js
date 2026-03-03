export function sortTodos(todos) {
  return [...todos].sort((a, b) => {
    const aOrdered = a.sortOrder !== undefined && a.sortOrder !== null;
    const bOrdered = b.sortOrder !== undefined && b.sortOrder !== null;
    if (aOrdered && bOrdered) return a.sortOrder - b.sortOrder;
    if (!aOrdered && !bOrdered) return b.createdAt - a.createdAt;
    return aOrdered ? 1 : -1;
  });
}
