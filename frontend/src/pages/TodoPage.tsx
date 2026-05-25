import React, { useState } from 'react';
import { TabType } from '../types';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import TodoInput from '../components/todo/TodoInput';
import TodoList from '../components/todo/TodoList';
import TodoFilters from '../components/todo/TodoFilters';
import LongtermList from '../components/todo/LongtermList';
import LongtermModal from '../components/todo/LongtermModal';
import CalendarView from '../components/todo/CalendarView';
import './TodoPage.css';

const TodoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [showLongtermModal, setShowLongtermModal] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(v => {
      document.documentElement.setAttribute('data-theme', v ? 'light' : 'dark');
      return !v;
    });
  };

  return (
    <div className="app-layout">
      <Header onThemeToggle={toggleTheme} isDark={isDark} />
      <div className="app-body">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className={`main-content${activeTab === 'calendar' ? ' calendar-mode' : ''}`}>
          <div className="page-header">
            <div className="page-header-left">
              <h1 className="page-title">
                {activeTab === 'daily' ? '🗒️ 오늘 할 일' : activeTab === 'longterm' ? '🎯 장기 목표' : '📅 캘린더'}
              </h1>
              <p className="page-subtitle">
                {activeTab === 'daily'
                  ? '오늘 할 일을 관리하고, 지난 기록을 날짜별로 확인하세요'
                  : activeTab === 'longterm'
                  ? '기간이 정해진 장기 목표를 설정하고 진행률을 확인하세요'
                  : '날짜별 할 일과 완료 현황을 한눈에 확인하세요'}
              </p>
            </div>

            {activeTab === 'longterm' && (
              <button
                id="add-longterm-btn"
                className="btn btn-primary"
                onClick={() => setShowLongtermModal(true)}
              >
                + 목표 추가
              </button>
            )}
          </div>

          {activeTab !== 'calendar' && <TodoFilters />}

          {activeTab === 'calendar' ? (
            <CalendarView />
          ) : activeTab === 'daily' ? (
            <>
              <TodoInput />
              <TodoList />
            </>
          ) : (
            <LongtermList onAdd={() => setShowLongtermModal(true)} />
          )}
        </main>
      </div>

      {showLongtermModal && (
        <LongtermModal onClose={() => setShowLongtermModal(false)} />
      )}
    </div>
  );
};

export default TodoPage;
