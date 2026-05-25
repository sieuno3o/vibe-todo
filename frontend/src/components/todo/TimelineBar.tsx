import React from 'react';
import './TimelineBar.css';

interface Props {
  startDate: string;
  endDate: string;
  completed: boolean;
}

const TimelineBar: React.FC<Props> = ({ startDate, endDate, completed }) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const progress = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)));

  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isUrgent = !isOverdue && daysLeft <= 7;

  const formatDate = (d: Date) =>
    d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="timeline-bar-wrap">
      <div className="timeline-dates">
        <span className="timeline-date-label">
          📅 {formatDate(start)}
        </span>
        <span className="timeline-date-label timeline-date-end">
          🏁 {formatDate(end)}
        </span>
      </div>

      <div className="timeline-bar-track">
        <div
          className={`timeline-bar-fill ${completed ? 'completed' : isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}`}
          style={{ width: completed ? '100%' : `${progress}%` }}
        />
        <div className="timeline-bar-now" style={{ left: `${Math.min(99, progress)}%` }} />
      </div>

      <div className="timeline-stats">
        <span className="timeline-stat">
          전체 {totalDays}일 중 {Math.min(elapsedDays, totalDays)}일 경과
        </span>
        <span className={`timeline-dday ${isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}`}>
          {completed ? '✅ 완료' : isOverdue ? `D+${Math.abs(daysLeft)} 초과` : daysLeft === 0 ? 'D-Day!' : `D-${daysLeft}`}
        </span>
      </div>

      <div className="timeline-progress-label">
        <span>{completed ? 100 : Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default TimelineBar;
