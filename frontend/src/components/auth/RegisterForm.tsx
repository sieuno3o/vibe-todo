import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  onSuccess: () => void;
}

const RegisterForm: React.FC<Props> = ({ onSuccess }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="register-form" className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      <div className="input-group">
        <label htmlFor="register-username">사용자명</label>
        <input
          id="register-username"
          className="input"
          type="text"
          placeholder="사용자명을 입력하세요"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          minLength={2}
          autoComplete="username"
        />
      </div>

      <div className="input-group">
        <label htmlFor="register-email">이메일</label>
        <input
          id="register-email"
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
        <label htmlFor="register-password">비밀번호</label>
        <input
          id="register-password"
          className="input"
          type="password"
          placeholder="비밀번호 (최소 6자)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="input-group">
        <label htmlFor="register-confirm">비밀번호 확인</label>
        <input
          id="register-confirm"
          className="input"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <button
        id="register-submit"
        type="submit"
        className="btn btn-primary auth-submit-btn"
        disabled={isLoading}
      >
        {isLoading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
};

export default RegisterForm;
