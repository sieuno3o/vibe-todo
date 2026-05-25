import React, { useState } from 'react';
import { useTodo } from '../../contexts/TodoContext';
import { Priority } from '../../types';
import './LongtermModal.css';

interface Props {
  onClose: () => void;
}

const LongtermModal: React.FC<Props> = ({ onClose }) => {
  const { createTodo, state } = useTodo();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [categoryId, setCategoryId] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!startDate) { setError('시작일을 입력해주세요.'); return; }
    if (!endDate) { setError('종료일을 입력해주세요.'); return; }
    if (endDate <= startDate) { setError('종료일은 시작일보다 이후여야 합니다.'); return; }

    setIsLoading(true);
    try {
      await createTodo({
        title: title.trim(),
        type: 'LONGTERM',
        priority,
        startDate,
        endDate,
        categoryId: categoryId || undefined,
        memo: memo || undefined,
      });
      onClose();
    } catch {
      setError('장기 목표를 추가하지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal longterm-modal">
        <div className="modal-header">
          <h2 className="modal-title">🎯 새 장기 목표 추가</h2>
          <button id="longterm-modal-close" className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <label htmlFor="longterm-title">목표 제목 *</label>
            <input
              id="longterm-title"
              className="input"
              placeholder="달성하고 싶은 목표를 입력하세요"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="longterm-modal-dates">
            <div className="input-group">
              <label htmlFor="longterm-start">시작일 *</label>
              <input
                id="longterm-start"
                className="input"
                type="date"
                value={startDate}
                min={today}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="longterm-dates-arrow">→</div>
            <div className="input-group">
              <label htmlFor="longterm-end">종료일 *</label>
              <input
                id="longterm-end"
                className="input"
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration Preview */}
          {startDate && endDate && endDate > startDate && (
            <div className="longterm-duration-preview">
              📊 총 {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}일간의 목표
            </div>
          )}

          <div className="input-group">
            <label>우선순위</label>
            <div className="priority-btns">
              {(['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn priority-${p.toLowerCase()} ${priority === p ? 'active' : ''}`}
                  onClick={() => setPriority(p)}
                >
                  {p === 'HIGH' ? '🔴 높음' : p === 'MEDIUM' ? '🟡 보통' : '🟢 낮음'}
                </button>
              ))}
            </div>
          </div>

          {state.categories.length > 0 && (
            <div className="input-group">
              <label htmlFor="longterm-category">카테고리</label>
              <select
                id="longterm-category"
                className="input"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">없음</option>
                {state.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="longterm-memo">메모 (선택)</label>
            <textarea
              id="longterm-memo"
              className="input"
              rows={3}
              placeholder="목표에 대한 메모를 남기세요..."
              value={memo}
              onChange={e => setMemo(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>취소</button>
            <button
              id="longterm-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '추가 중...' : '🎯 목표 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LongtermModal;
