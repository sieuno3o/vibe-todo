import React, { useState, KeyboardEvent } from 'react';
import { useTodo } from '../../contexts/TodoContext';
import { Priority } from '../../types';
import './TodoInput.css';

const TodoInput: React.FC = () => {
  const { createTodo, state } = useTodo();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await createTodo({
      title: title.trim(),
      type: 'DAILY',
      priority,
      dueDate: dueDate || undefined,
      categoryId: categoryId || undefined,
    });
    setTitle('');
    setDueDate('');
    setCategoryId('');
    setPriority('MEDIUM');
    setShowOptions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="todo-input-wrap glass-card">
      <div className="todo-input-row">
        <div className="todo-input-icon">+</div>
        <input
          id="daily-todo-input"
          className="todo-input"
          placeholder="새로운 할 일을 입력하세요..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowOptions(true)}
        />
        <button
          id="daily-todo-add-btn"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!title.trim()}
        >
          추가
        </button>
      </div>

      {showOptions && (
        <div className="todo-input-options">
          <div className="todo-input-option-group">
            <label>우선순위</label>
            <div className="priority-btns">
              {(['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => (
                <button
                  key={p}
                  className={`priority-btn priority-${p.toLowerCase()} ${priority === p ? 'active' : ''}`}
                  onClick={() => setPriority(p)}
                  type="button"
                >
                  {p === 'HIGH' ? '🔴 높음' : p === 'MEDIUM' ? '🟡 보통' : '🟢 낮음'}
                </button>
              ))}
            </div>
          </div>

          <div className="todo-input-option-row">
            <div className="todo-input-option-group">
              <label htmlFor="daily-duedate">마감일 (선택)</label>
              <input
                id="daily-duedate"
                className="input"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ fontSize: 'var(--font-size-sm)' }}
              />
            </div>

            {state.categories.length > 0 && (
              <div className="todo-input-option-group">
                <label htmlFor="daily-category">카테고리</label>
                <select
                  id="daily-category"
                  className="input"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  style={{ fontSize: 'var(--font-size-sm)' }}
                >
                  <option value="">없음</option>
                  {state.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoInput;
