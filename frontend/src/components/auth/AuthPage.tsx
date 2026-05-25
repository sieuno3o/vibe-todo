import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './Auth.css';

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-card glass-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✓</div>
          <h1 className="auth-logo-text">VibeTask</h1>
          <p className="auth-logo-sub">스마트한 할 일 관리</p>
        </div>

        <div className="auth-tabs">
          <button
            id="tab-login"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            로그인
          </button>
          <button
            id="tab-register"
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            회원가입
          </button>
          <div className={`auth-tab-indicator ${tab === 'register' ? 'right' : ''}`} />
        </div>

        <div className="auth-form-container">
          {tab === 'login' ? <LoginForm /> : <RegisterForm onSuccess={() => setTab('login')} />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
