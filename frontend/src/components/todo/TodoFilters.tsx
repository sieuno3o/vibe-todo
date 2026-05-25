import React from 'react';
import { useTodo } from '../../contexts/TodoContext';
import './TodoFilters.css';

const TodoFilters: React.FC = () => {
  const { state, setSearch } = useTodo();

  return (
    <div className="todo-filters">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          id="todo-search"
          className="search-input"
          placeholder="할 일 검색..."
          value={state.searchQuery}
          onChange={e => setSearch(e.target.value)}
        />
        {state.searchQuery && (
          <button className="search-clear btn btn-ghost btn-icon" onClick={() => setSearch('')}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default TodoFilters;
