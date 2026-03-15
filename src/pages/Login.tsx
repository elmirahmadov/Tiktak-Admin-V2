import { useState, FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api';
import { HiOutlineExclamationTriangle, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const Login: FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        
        // Extract based on confirmed backend structure
        const user = data.profile || res.data.user || { id: 1, full_name: 'Admin', phone: loginPhone, role: 'admin' };
        const token = data.tokens?.access_token || res.data.token || data.token || 'mock_token';
        
        setAuth(user, token);
        navigate('/orders');
      } else {
        setError(res.data.message || 'Giriş uğursuz oldu');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback message for testing
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
            <img src="/adminlogin.png" alt="Admin Control Panel Illustration" />
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2>Admin Panel</h2>

          {error && (
            <div className="login-error">
              <HiOutlineExclamationTriangle />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Telefon</label>
              <input
                type="text"
                placeholder="telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div className="form-group">
              <label>Parol</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-add" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }}>
              {loading ? 'Daxil olunur...' : 'Daxil ol'}
            </button>
            <button 
              type="button" 
              className="btn-outline-grey" 
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.9rem' }}
              onClick={() => {
                setAuth({ id: 1, full_name: 'Admin', phone: 'bypass', role: 'admin' }, 'mock_token');
                navigate('/orders');
              }}
            >
              Dizaynı yoxla (Bunu keç)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
