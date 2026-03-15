import { FC, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';

const Layout: FC = () => {
  const [search, setSearch] = useState('');
  const location = useLocation();

  useEffect(() => {
    setSearch('');
  }, [location.pathname]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const event = new CustomEvent('globalSearch', { detail: search });
      window.dispatchEvent(event);
    }, 600);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="admin-layout-wrapper">
      <div className="admin-header-bar">
        <h1>TIK TAK ADMİN</h1>
        <Input
          placeholder="Axtarış..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300, borderRadius: 20, background: '#f7f8fc', borderColor: '#f0f0f0' }}
          allowClear
        />
        <div style={{ width: 100 }} />
      </div>

      <div className="admin-body">
        <Sidebar />
        <div className="page-content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
