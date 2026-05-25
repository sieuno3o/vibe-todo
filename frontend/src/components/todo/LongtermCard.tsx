import React, { useState } from 'react';
import { useTodo } from '../../contexts/TodoContext';
import { Todo, Priority } from '../../types';
import TimelineBar from './TimelineBar';
import './LongtermCard.css';

interface Props { todo: Todo; }

const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: '높음', MEDIUM: '보통', LOW: '낮음',
};

const LongtermCard: React.FC<Props> = ({ todo }) => {
  const { toggleTodo, updateTodo, deleteTodo, state } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editStartDate, setEditStartDate] = useState(todo.startDate?.split('T')[0] || '');
  const [editEndDate, setEditEndDate] = useState(todo.endDate?.split('T')[0] || '');
  const [editMemo, setEditMemo] = useState(todo.memo || '');
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);

  const handleSave = async () => {
    if (!editTitle.trim() || !editStartDate || !editEndDate) return;
    await updateTodo(todo.id, {
      title: editTitle.trim(),
      startDate: editStartDate,
      endDate: editEndDate,
      memo: editMemo || null,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  return (
    <div className={`longterm-card glass-card ${todo.completed ? 'completed' : ''}`}>
      {/* Priority stripe */}
      <div className={`longterm-stripe priority-stripe-${todo.priority.toLowerCase()}`} />

      <div className="longterm-header">
        <button
          id={`longterm-check-${todo.id}`}
          className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => toggleTodo(todo.id)}
          style={{ flexShrink: 0 }}
          aria-label="완료 토글"
        >
          {todo.completed && (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,8 6,12 14,4" />
            </svg>
          )}
        </button>

        <div className="longterm-title-area">
          {isEditing ? (
            <input
              className="input longterm-edit-title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              autoFocus
            />
          ) : (
            <h3
              className="longterm-title"
              onDoubleClick={() => setIsEditing(true)}
            >
              📌 {todo.title}
            </h3>
          )}
        </div>

        <div className="longterm-header-actions">
          <span className={`badge badge-${todo.priority.toLowerCase()}`}>
            {PRIORITY_LABEL[todo.priority]}
          </span>
          {todo.category && (
            <span className="todo-category-tag" style={{ color: todo.category.color, borderColor: `${todo.category.color}40` }}>
              {todo.category.name}
            </span>
          )}
          <button
            id={`longterm-edit-${todo.id}`}
            className="btn btn-ghost btn-icon"
            onClick={() => setIsEditing(v => !v)}
            title="수정"
          >
            ✏️
          </button>
          <button
            id={`longterm-delete-${todo.id}`}
            className="btn btn-danger btn-icon"
            onClick={() => deleteTodo(todo.id)}
            title="삭제"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Timeline */}
      {todo.startDate && todo.endDate && (
        <TimelineBar
          startDate={todo.startDate}
          endDate={todo.endDate}
          completed={todo.completed}
        />
      )}

      {/* Memo */}
      {(todo.memo && !isEditing) && (
        <p className="longterm-memo">{todo.memo}</p>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="longterm-edit-form">
          <div className="longterm-edit-dates">
            <div className="input-group">
              <label htmlFor={`edit-start-${todo.id}`}>시작일 *</label>
              <input
                id={`edit-start-${todo.id}`}
                className="input"
                type="date"
                value={editStartDate}
                onChange={e => setEditStartDate(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor={`edit-end-${todo.id}`}>종료일 *</label>
              <input
                id={`edit-end-${todo.id}`}
                className="input"
                type="date"
                value={editEndDate}
                onChange={e => setEditEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>우선순위</label>
            <div className="priority-btns">
              {(['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn priority-${p.toLowerCase()} ${editPriority === p ? 'active' : ''}`}
                  onClick={() => setEditPriority(p)}
                >
                  {p === 'HIGH' ? '🔴 높음' : p === 'MEDIUM' ? '🟡 보통' : '🟢 낮음'}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor={`edit-memo-${todo.id}`}>메모</label>
            <textarea
              id={`edit-memo-${todo.id}`}
              className="input"
              rows={2}
              placeholder="메모를 입력하세요..."
              value={editMemo}
              onChange={e => setEditMemo(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="longterm-edit-actions">
            <button className="btn btn-primary" onClick={handleSave}>저장</button>
            <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LongtermCard;
