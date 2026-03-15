import { FC, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
    <div className="admin-wrapper">
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>TİK TAK ADMİN</h1>
        <div className="search-input-wrapper" style={{ margin: '0', maxWidth: '300px' }}>
          <input 
            type="text" 
            placeholder="Axtarılan" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: '150px' }}></div>
      </header>

      <div className="admin-main">
        <Sidebar />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
