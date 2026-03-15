import { useState, FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api';
import { Input, Button, Alert } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

const Login: FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const loginPhone = phone.trim();
    const loginPassword = password.trim();

    if (!loginPhone || !loginPassword) {
      setError('Telefon və parol daxil edin');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login(loginPhone, loginPassword);
      if (res.data.success || res.status === 200 || res.data.result) {
        const data = res.data.data || {};
        const user = data.profile || res.data.user || { id: 1, full_name: 'Admin', phone: loginPhone, role: 'admin' };
        const token = data.tokens?.access_token || res.data.token || data.token || 'mock_token';
        setAuth(user, token);
        navigate('/orders');
      } else {
        setError(res.data.message || 'Giriş uğursuz oldu');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Parol yanlışdır!');
      } else {
        setError('Xəta baş verdi. Yenidən cəhd edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-header">
          <h1>TIK TAK ADMİN</h1>
        </div>
        <div className="login-illustration-container">
          <div className="login-illustration">
            <img src="/adminlogin.png" alt="Admin Illustration" />
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 24 }}
              onClose={() => setError('')}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13, color: '#6b7280' }}>
                Telefon
              </label>
              <Input
                size="large"
                placeholder="Telefon nömrənizi daxil edin"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                style={{ borderRadius: 8, background: '#f7f8fc' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13, color: '#6b7280' }}>
                Parol
              </label>
              <Input.Password
                size="large"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                style={{ borderRadius: 8, background: '#f7f8fc' }}
              />
            </div>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ borderRadius: 8, height: 48, fontWeight: 600 }}
            >
              Daxil ol
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
