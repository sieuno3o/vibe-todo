import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

const Header: React.FC<HeaderProps> = ({ onThemeToggle, isDark }) => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

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

        <div className="header-user" onClick={() => setShowMenu(v => !v)}>
          <div className="header-avatar">
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="header-username">{user?.username}</span>
          <span className="header-chevron">▾</span>

          {showMenu && (
            <div className="header-menu glass-card">
              <div className="header-menu-info">
                <div className="header-menu-name">{user?.username}</div>
                <div className="header-menu-email">{user?.email}</div>
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
