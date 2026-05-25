import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTodo } from '../../contexts/TodoContext';
import './Header.css';

interface HeaderProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

const Header: React.FC<HeaderProps> = ({ onThemeToggle, isDark }) => {
  const { user, logout } = useAuth();
  const { state } = useTodo();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalTodos = state.todos.length;
  const completedTodos = state.todos.filter(t => t.completed).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header className="header glass-card">
      <div className="header-left">
        <div className="header-logo">
          <div className="header-logo-icon">✓</div>
          <span className="header-logo-text">VibeTask</span>
        </div>
      </div>

      <div className="header-right">
        <button
          id="theme-toggle"
          className="btn btn-ghost btn-icon"
          onClick={onThemeToggle}
          title={isDark ? '라이트 모드' : '다크 모드'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <div className="header-user" ref={menuRef}>
          <div className="header-avatar" onClick={() => setShowMenu(v => !v)}>
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="header-username" onClick={() => setShowMenu(v => !v)}>
            {user?.username}
          </span>
          <span className="header-chevron" onClick={() => setShowMenu(v => !v)}>▾</span>

          {showMenu && (
            <div className="header-menu glass-card">
              <div className="header-menu-header">
                <div className="header-menu-avatar-lg">
                  {user?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="header-menu-info">
                  <div className="header-menu-name">{user?.username}</div>
                  <div className="header-menu-email">{user?.email}</div>
                  {user?.createdAt && (
                    <div className="header-menu-date">
                      가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="header-menu-stats">
                <div className="header-menu-stat">
                  <span className="header-stat-val">{totalTodos}</span>
                  <span className="header-stat-lbl">총 할 일</span>
                </div>
                <div className="header-menu-stat">
                  <span className="header-stat-val success">{completedTodos}</span>
                  <span className="header-stat-lbl">완료함</span>
                </div>
              </div>

              <hr className="header-menu-divider" />
              <button
                id="logout-btn"
                className="header-menu-item header-menu-logout"
                onClick={logout}
              >
                🚪 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
