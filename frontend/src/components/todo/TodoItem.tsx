import React, { useState } from 'react';
import { useTodo } from '../../contexts/TodoContext';
import { Todo, Priority } from '../../types';
import './TodoItem.css';

interface Props {
  todo: Todo;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
}

const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: '높음', MEDIUM: '보통', LOW: '낮음',
};

const getDaysDiff = (dateStr: string) => {
  const now = new Date(); now.setHours(0,0,0,0);
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

const TodoItem: React.FC<Props> = ({ todo, onDragStart, onDrop }) => {
  const { toggleTodo, updateTodo, deleteTodo } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    await updateTodo(todo.id, { title: editTitle.trim() });
    setIsEditing(false);
  };

  const daysDiff = todo.dueDate ? getDaysDiff(todo.dueDate) : null;
  const isOverdue = daysDiff !== null && daysDiff < 0;
  const isUrgent = daysDiff !== null && daysDiff >= 0 && daysDiff <= 3;

  return (
    <div
      className={`todo-item ${todo.completed ? 'completed' : ''} ${isDraggingOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={() => onDragStart(todo.id)}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={() => { setIsDraggingOver(false); onDrop(todo.id); }}
    >
      {/* Category color stripe */}
      {todo.category && (
        <div className="todo-item-stripe" style={{ background: todo.category.color }} />
      )}

      <button
        id={`todo-check-${todo.id}`}
        className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
        onClick={() => toggleTodo(todo.id)}
        aria-label="완료 토글"
      >
        {todo.completed && (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,8 6,12 14,4" strokeDasharray="50" strokeDashoffset="0" className="checkmark-path" />
          </svg>
        )}
      </button>

      <div className="todo-item-body">
        {isEditing ? (
          <div className="todo-edit-row">
            <input
              className="input todo-edit-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false); }}
              autoFocus
            />
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={handleSave}>저장</button>
            <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setIsEditing(false)}>취소</button>
          </div>
        ) : (
          <>
            <span
              className="todo-title"
              onDoubleClick={() => { setIsEditing(true); setEditTitle(todo.title); }}
            >
              {todo.title}
            </span>

            <div className="todo-meta">
              <span className={`badge badge-${todo.priority.toLowerCase()}`}>
                {PRIORITY_LABEL[todo.priority]}
              </span>

              {todo.category && (
                <span className="todo-category-tag" style={{ color: todo.category.color, borderColor: `${todo.category.color}40` }}>
                  {todo.category.name}
                </span>
              )}

              {todo.dueDate && (
                <span className={`todo-duedate ${isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}`}>
                  📅 {formatDate(todo.dueDate)}
                  {daysDiff === 0 ? ' · 오늘!' : daysDiff !== null && daysDiff > 0 ? ` · D-${daysDiff}` : daysDiff !== null ? ` · D+${Math.abs(daysDiff)}` : ''}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="todo-actions">
          <button
            id={`todo-edit-${todo.id}`}
            className="btn btn-ghost btn-icon"
            onClick={() => { setIsEditing(true); setEditTitle(todo.title); }}
            title="수정"
          >
            ✏️
          </button>
          <button
            id={`todo-delete-${todo.id}`}
            className="btn btn-danger btn-icon"
            onClick={() => deleteTodo(todo.id)}
            title="삭제"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
