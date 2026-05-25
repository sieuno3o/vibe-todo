import React, { useState } from 'react';
import { useTodo } from '../../contexts/TodoContext';
import { TabType, FilterType } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const PRESET_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#10b981','#06b6d4','#3b82f6'];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { state, setFilter, createCategory, deleteCategory, getFilteredTodos } = useTodo();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [showCatInput, setShowCatInput] = useState(false);

  const dailyTodos = state.todos.filter(t => t.type === 'DAILY');
  const longtermTodos = state.todos.filter(t => t.type === 'LONGTERM');
  const completedCount = dailyTodos.filter(t => t.completed).length;
  const totalCount = dailyTodos.length;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory(newCatName.trim(), newCatColor);
      setNewCatName('');
      setShowCatInput(false);
    } catch {
      // toast handled in context
    }
  };

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'active', label: '진행 중' },
    { key: 'completed', label: '완료' },
  ];

  return (
    <aside className="sidebar glass-card">
      {/* Navigation Tabs */}
      <div className="sidebar-section">
        <div className="sidebar-label">보기</div>
        <nav className="sidebar-nav">
          <button
            id="tab-daily"
            className={`sidebar-nav-item ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => onTabChange('daily')}
          >
            <span className="sidebar-nav-icon">🗒️</span>
            <span>오늘 할 일</span>
            <span className="sidebar-nav-count">{dailyTodos.length}</span>
          </button>
          <button
            id="tab-longterm"
            className={`sidebar-nav-item ${activeTab === 'longterm' ? 'active' : ''}`}
            onClick={() => onTabChange('longterm')}
          >
            <span className="sidebar-nav-icon">🎯</span>
            <span>장기 목표</span>
            <span className="sidebar-nav-count">{longtermTodos.length}</span>
          </button>
          <button
            id="tab-calendar"
            className={`sidebar-nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => onTabChange('calendar')}
          >
            <span className="sidebar-nav-icon">📅</span>
            <span>캘린더</span>
            <span className="sidebar-nav-count">{state.todos.length}</span>
          </button>
        </nav>
      </div>

      {/* Filter - hide on calendar tab */}
      {activeTab !== 'calendar' && (
        <div className="sidebar-section">
          <div className="sidebar-label">필터</div>
          <div className="sidebar-filters">
            {filterLabels.map(({ key, label }) => (
              <button
                key={key}
                id={`filter-${key}`}
                className={`sidebar-filter-btn ${state.filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress (Daily only) */}
      {activeTab === 'daily' && totalCount > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-label">오늘의 진행률</div>
          <div className="sidebar-progress">
            <div className="sidebar-progress-bar">
              <div
                className="sidebar-progress-fill"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <div className="sidebar-progress-text">
              {completedCount} / {totalCount} 완료
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="sidebar-section sidebar-section-grow">
        <div className="sidebar-label-row">
          <div className="sidebar-label">카테고리</div>
          <button
            id="add-category-btn"
            className="btn btn-ghost btn-icon"
            onClick={() => setShowCatInput(v => !v)}
            title="카테고리 추가"
          >
            +
          </button>
        </div>

        {showCatInput && (
          <form className="sidebar-cat-form" onSubmit={handleAddCategory}>
            <input
              id="category-name-input"
              className="input"
              placeholder="카테고리 이름"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              autoFocus
            />
            <div className="sidebar-color-picker">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`sidebar-color-dot ${newCatColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setNewCatColor(color)}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: 'var(--font-size-sm)' }}>
              추가
            </button>
          </form>
        )}

        <div className="sidebar-categories">
          {state.categories.length === 0 ? (
            <p className="sidebar-empty">카테고리 없음</p>
          ) : (
            state.categories.map(cat => (
              <div key={cat.id} className="sidebar-cat-item">
                <span className="sidebar-cat-dot" style={{ background: cat.color }} />
                <span className="sidebar-cat-name">{cat.name}</span>
                <span className="sidebar-cat-count">{cat._count?.todos || 0}</span>
                <button
                  className="sidebar-cat-delete"
                  onClick={() => deleteCategory(cat.id)}
                  title="삭제"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
