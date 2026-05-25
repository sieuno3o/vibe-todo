import React from 'react';
import { useTodo } from '../../contexts/TodoContext';
import LongtermCard from './LongtermCard';

interface Props {
  onAdd: () => void;
}

const LongtermList: React.FC<Props> = ({ onAdd }) => {
  const { getFilteredTodos, state } = useTodo();
  const todos = getFilteredTodos('LONGTERM');

  if (state.isLoading) {
    return (
      <div className="todo-list-empty">
        <div className="todo-list-spinner" />
        <p>불러오는 중...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="todo-list-empty longterm-empty">
        <div className="todo-list-empty-icon">🎯</div>
        <p className="todo-list-empty-title">
          {state.searchQuery ? '검색 결과가 없습니다' : '아직 장기 목표가 없습니다'}
        </p>
        <p className="todo-list-empty-sub">
          {state.searchQuery ? '다른 키워드로 검색해보세요' : '달성하고 싶은 장기 목표를 추가해보세요!'}
        </p>
        {!state.searchQuery && (
          <button id="longterm-empty-add-btn" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={onAdd}>
            🎯 첫 번째 목표 추가
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <LongtermCard key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default LongtermList;
