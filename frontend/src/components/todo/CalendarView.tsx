import React, { useState, useMemo } from 'react';
import { useTodo } from '../../contexts/TodoContext';
import { Todo } from '../../types';
import './CalendarView.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const KO_MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

function formatDetailDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = WEEKDAYS[d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${day})`;
}

// ── Mapping todos to calendar dates ──────────────────────────────────────────

interface DayData {
  dateStr: string;
  todos: Todo[];
  completed: number;
  total: number;
}

function buildCalendarMap(todos: Todo[]): Map<string, Todo[]> {
  const map = new Map<string, Todo[]>();

  const addTo = (key: string, todo: Todo) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(todo);
  };

  todos.forEach(todo => {
    if (todo.type === 'DAILY') {
      // Use dueDate if set, else createdAt
      const raw = todo.dueDate ?? todo.createdAt;
      const d = new Date(raw);
      addTo(toDateStr(d), todo);
    } else {
      // LONGTERM: show on every day in [startDate, endDate]
      if (!todo.startDate || !todo.endDate) {
        addTo(toDateStr(new Date(todo.createdAt)), todo);
        return;
      }
      const start = new Date(todo.startDate);
      const end = new Date(todo.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const cur = new Date(start);
      // limit range to 365 days max to avoid performance issues
      let limit = 365;
      while (cur <= end && limit-- > 0) {
        addTo(toDateStr(cur), todo);
        cur.setDate(cur.getDate() + 1);
      }
    }
  });

  return map;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const DayDetailPanel: React.FC<{
  data: DayData;
  onClose: () => void;
}> = ({ data, onClose }) => {
  const { completed, total, todos, dateStr } = data;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="calendar-detail-panel">
      <div className="calendar-detail-header">
        <div className="calendar-detail-date">{formatDetailDate(dateStr)}</div>
        <div className="calendar-detail-summary">
          <span className="detail-stat">
            <span className="detail-stat-dot done" />
            완료 {completed}
          </span>
          <span className="detail-stat">
            <span className="detail-stat-dot pending" />
            미완료 {total - completed}
          </span>
        </div>
        <button className="calendar-detail-close" onClick={onClose}>✕</button>
      </div>

      <div className="calendar-detail-progress">
        <div
          className={`calendar-detail-progress-fill${pct === 100 ? ' all-done' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {todos.length === 0 ? (
        <div className="calendar-detail-empty">이 날의 할 일이 없습니다.</div>
      ) : (
        <div className="calendar-detail-list">
          {todos.map(t => (
            <div key={t.id} className="calendar-detail-item">
              <div className={`calendar-detail-check${t.completed ? ' done' : ''}`}>
                {t.completed && '✓'}
              </div>
              <div className="calendar-detail-info">
                <div className={`calendar-detail-title${t.completed ? ' done' : ''}`}>
                  {t.title}
                </div>
                <div className="calendar-detail-meta">
                  <span className={`calendar-detail-type ${t.type === 'DAILY' ? 'daily' : 'longterm'}`}>
                    {t.type === 'DAILY' ? '일일' : '장기'}
                  </span>
                  {t.category && (
                    <span className="calendar-detail-cat">
                      <span
                        className="calendar-detail-cat-dot"
                        style={{ background: t.category.color }}
                      />
                      {t.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const CalendarView: React.FC = () => {
  const { state } = useTodo();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Build date → todos map
  const calMap = useMemo(() => buildCalendarMap(state.todos), [state.todos]);

  // Month stats
  const monthStats = useMemo(() => {
    let totalMonth = 0, completedMonth = 0;
    calMap.forEach((todos, key) => {
      const [y, m] = key.split('-').map(Number);
      if (y === viewYear && m - 1 === viewMonth) {
        // deduplicate todos (longterm spans many days)
        const unique = new Set(todos.map(t => t.id));
        totalMonth += unique.size;
        completedMonth += todos.filter(t => t.completed).length;
      }
    });
    return { totalMonth, completedMonth };
  }, [calMap, viewYear, viewMonth]);

  // Build grid cells
  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    // days from prev month to fill leading blank cells
    const startDow = firstDay.getDay(); // 0=Sun
    const cells: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(firstDay);
      d.setDate(d.getDate() - i - 1);
      cells.push({ date: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push({ date: new Date(viewYear, viewMonth, d), isCurrentMonth: true });
    }
    // fill trailing cells
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(lastDay);
      d.setDate(d.getDate() + i);
      cells.push({ date: d, isCurrentMonth: false });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDay(toDateStr(today));
  };

  const selectedData: DayData | null = useMemo(() => {
    if (!selectedDay) return null;
    const todos = calMap.get(selectedDay) ?? [];
    // deduplicate by id (longterm may repeat across days)
    const seen = new Set<string>();
    const unique = todos.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
    return {
      dateStr: selectedDay,
      todos: unique,
      completed: unique.filter(t => t.completed).length,
      total: unique.length,
    };
  }, [selectedDay, calMap]);

  return (
    <div className="calendar-wrapper">
      {/* ── Header ── */}
      <div className="calendar-header">
        <div className="calendar-nav-group">
          <button className="calendar-nav-btn" onClick={prevMonth} id="cal-prev">‹</button>
          <span className="calendar-month-label">{viewYear}년 {KO_MONTH_NAMES[viewMonth]}</span>
          <button className="calendar-nav-btn" onClick={nextMonth} id="cal-next">›</button>
        </div>

        <button className="calendar-today-btn" onClick={goToday} id="cal-today">오늘</button>

        <div className="calendar-header-stats">
          <div className="cal-stat-item">
            <span className="cal-stat-value">{monthStats.totalMonth}</span>
            <span className="cal-stat-label">이달 총 할 일</span>
          </div>
          <div className="cal-stat-item">
            <span className="cal-stat-value" style={{ color: 'var(--color-success)' }}>
              {monthStats.completedMonth}
            </span>
            <span className="cal-stat-label">완료</span>
          </div>
          <div className="cal-stat-item">
            <span className="cal-stat-value" style={{ color: 'var(--color-warning)' }}>
              {monthStats.totalMonth - monthStats.completedMonth}
            </span>
            <span className="cal-stat-label">미완료</span>
          </div>
        </div>
      </div>

      {/* ── Calendar Grid ── */}
      <div className="calendar-body">
        {/* Weekday labels */}
        <div className="calendar-weekdays">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`calendar-weekday${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="calendar-grid">
          {cells.map((cell, idx) => {
            const ds = toDateStr(cell.date);
            const todos = calMap.get(ds) ?? [];

            // deduplicate
            const seen = new Set<string>();
            const uniqueTodos = todos.filter(t => {
              if (seen.has(t.id)) return false;
              seen.add(t.id);
              return true;
            });

            const total = uniqueTodos.length;
            const completed = uniqueTodos.filter(t => t.completed).length;
            const isToday = ds === toDateStr(today);
            const isSel = ds === selectedDay;
            const dow = cell.date.getDay();
            const hasLongtermRange = uniqueTodos.some(t => t.type === 'LONGTERM');

            const MAX_CHIPS = 3;
            const visible = uniqueTodos.slice(0, MAX_CHIPS);
            const overflow = total - MAX_CHIPS;

            // Badge label
            let badgeClass = '';
            let badgeText = '';
            if (total > 0) {
              if (completed === total) { badgeClass = 'all-done'; badgeText = '완료'; }
              else if (completed > 0) { badgeClass = 'partial'; badgeText = `${completed}/${total}`; }
              else { badgeClass = 'none-done'; badgeText = `${total}개`; }
            }

            return (
              <div
                key={idx}
                id={`cal-day-${ds}`}
                className={[
                  'calendar-day',
                  !cell.isCurrentMonth ? 'other-month' : '',
                  isToday ? 'is-today' : '',
                  isSel ? 'selected' : '',
                  dow === 0 ? 'sun-col' : dow === 6 ? 'sat-col' : '',
                  hasLongtermRange && total > 0 ? 'has-longterm-range' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setSelectedDay(isSel ? null : ds)}
              >
                <div className="calendar-day-top">
                  <div className="calendar-day-num">{cell.date.getDate()}</div>
                  {total > 0 && (
                    <span className={`calendar-day-badge ${badgeClass}`}>{badgeText}</span>
                  )}
                </div>

                <div className="calendar-day-todos">
                  {visible.map(t => (
                    <div
                      key={t.id}
                      className={[
                        'calendar-todo-chip',
                        t.completed ? 'completed' : '',
                        `type-${t.type === 'DAILY' ? 'daily' : 'longterm'}`,
                      ].join(' ')}
                      title={t.title}
                    >
                      <span className="calendar-chip-dot" />
                      <span className="calendar-chip-text">{t.title}</span>
                    </div>
                  ))}
                  {overflow > 0 && (
                    <div className="calendar-day-more">+{overflow}개 더</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      {selectedData && selectedData.total > 0 && (
        <DayDetailPanel
          data={selectedData}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
};

export default CalendarView;
