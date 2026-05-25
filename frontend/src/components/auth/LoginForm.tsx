import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      <div className="input-group">
        <label htmlFor="login-email">이메일</label>
        <input
          id="login-email"
          className="input"
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="input-group">
        <label htmlFor="login-password">비밀번호</label>
        <input
          id="login-password"
          className="input"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <button
        id="login-submit"
        type="submit"
        className="btn btn-primary auth-submit-btn"
        disabled={isLoading}
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};

export default LoginForm;
