import React, { useRef, useMemo } from 'react';
import { useTodo } from '../../contexts/TodoContext';
import { todoApi } from '../../api/todo.api';
import { Todo } from '../../types';
import TodoItem from './TodoItem';
import './TodoList.css';

// ── Date helpers ─────────────────────────────────────────────────────────────

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Returns YYYY-MM-DD key for a todo (dueDate → createdAt fallback) */
const getDateKey = (todo: Todo): string => {
  const raw = todo.dueDate ?? todo.createdAt;
  const d = new Date(raw);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatGroupLabel = (dateKey: string): string => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${y}년 ${m}월 ${d}일 (${weekdays[date.getDay()]})`;
};

// ── Section Header ────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  label: string;
  count: number;
  completed: number;
  isToday?: boolean;
  isPast?: boolean;
}> = ({ label, count, completed, isToday, isPast }) => (
  <div className={`todo-section-header ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}>
    <div className="todo-section-header-left">
      <span className="todo-section-dot" />
      <span className="todo-section-label">{label}</span>
      {isToday && <span className="todo-section-badge today-badge">오늘</span>}
      {isPast && <span className="todo-section-badge past-badge">지난 날</span>}
    </div>
    <div className="todo-section-meta">
      <span className="todo-section-count">
        <span className="todo-section-done">{completed}</span>
        <span className="todo-section-sep">/</span>
        <span>{count}</span>
        <span className="todo-section-unit">완료</span>
      </span>
      {count > 0 && (
        <div className="todo-section-mini-bar">
          <div
            className="todo-section-mini-fill"
            style={{ width: `${Math.round((completed / count) * 100)}%` }}
          />
        </div>
      )}
    </div>
  </div>
);

// ── Past Date Group ───────────────────────────────────────────────────────────

const PastGroup: React.FC<{
  dateKey: string;
  todos: Todo[];
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
}> = ({ dateKey, todos, onDragStart, onDrop }) => {
  const [open, setOpen] = React.useState(false);
  const completed = todos.filter(t => t.completed).length;

  return (
    <div className="past-group">
      <button className="past-group-toggle" onClick={() => setOpen(v => !v)}>
        <SectionHeader
          label={formatGroupLabel(dateKey)}
          count={todos.length}
          completed={completed}
          isPast
        />
        <span className={`past-group-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="past-group-items">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const TodoList: React.FC = () => {
  const { getFilteredTodos, state, fetchTodos } = useTodo();
  const dragIdRef = useRef<string | null>(null);
  const today = todayStr();

  const allTodos = getFilteredTodos('DAILY');

  const handleDragStart = (id: string) => { dragIdRef.current = id; };

  const handleDrop = async (targetId: string) => {
    if (!dragIdRef.current || dragIdRef.current === targetId) return;
    const fromIdx = allTodos.findIndex(t => t.id === dragIdRef.current);
    const toIdx = allTodos.findIndex(t => t.id === targetId);
    const reordered = [...allTodos];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    try {
      await todoApi.reorder(reordered.map(t => t.id));
      await fetchTodos();
    } catch { /* silent */ }
  };

  // ── Split todos into today vs past ──
  const { todayTodos, pastGroups } = useMemo(() => {
    const todayList: Todo[] = [];
    const pastMap = new Map<string, Todo[]>();

    allTodos.forEach(todo => {
      const key = getDateKey(todo);
      if (key >= today) {
        // today or future (no dueDate or dueDate >= today)
        todayList.push(todo);
      } else {
        if (!pastMap.has(key)) pastMap.set(key, []);
        pastMap.get(key)!.push(todo);
      }
    });

    // Sort past keys newest → oldest
    const pastGroups = [...pastMap.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    return { todayTodos: todayList, pastGroups };
  }, [allTodos, today]);

  if (state.isLoading) {
    return (
      <div className="todo-list-empty">
        <div className="todo-list-spinner" />
        <p>불러오는 중...</p>
      </div>
    );
  }

  if (allTodos.length === 0) {
    return (
      <div className="todo-list-empty">
        <div className="todo-list-empty-icon">✨</div>
        <p className="todo-list-empty-title">
          {state.searchQuery ? '검색 결과가 없습니다' : '할 일이 없습니다!'}
        </p>
        <p className="todo-list-empty-sub">
          {state.searchQuery ? '다른 키워드로 검색해보세요' : '새로운 할 일을 추가해보세요'}
        </p>
      </div>
    );
  }

  const todayCompleted = todayTodos.filter(t => t.completed).length;

  return (
    <div className="todo-list-container">
      {/* ── 오늘 섹션 ── */}
      <div className="todo-section">
        <SectionHeader
          label="오늘 할 일"
          count={todayTodos.length}
          completed={todayCompleted}
          isToday
        />
        {todayTodos.length === 0 ? (
          <div className="todo-section-empty">
            <span>🎉 오늘 할 일이 없습니다</span>
          </div>
        ) : (
          <div className="todo-list">
            {todayTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 과거 섹션 ── */}
      {pastGroups.length > 0 && (
        <div className="todo-section past-section">
          <div className="past-section-divider">
            <span className="past-section-divider-label">📂 지난 기록</span>
          </div>

          <div className="past-groups-list">
            {pastGroups.map(([dateKey, todos]) => (
              <PastGroup
                key={dateKey}
                dateKey={dateKey}
                todos={todos}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
