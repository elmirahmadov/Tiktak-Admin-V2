import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  HiOutlineShoppingBag, 
  HiOutlineTag, 
  HiOutlineQueueList, 
  HiOutlineUsers, 
  HiOutlineFlag, 
  HiOutlineArrowRightOnRectangle 
} from 'react-icons/hi2';

const Sidebar: FC = () => {
  const logout = useAuthStore(state => state.logout);

  const menuItems = [
    { name: 'Kampaniyalar', path: '/campaigns', icon: <HiOutlineFlag /> },
    { name: 'Kateqoriyalar', path: '/categories', icon: <HiOutlineTag /> },
    { name: 'Məhsullar', path: '/products', icon: <HiOutlineQueueList /> },
    { name: 'İstifadəçilər', path: '/users', icon: <HiOutlineUsers /> },
    { name: 'Sifarişlər', path: '/orders', icon: <HiOutlineShoppingBag /> },
  ];

  return (
    <aside className="sidebar-container">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
        
        <button 
          className="sidebar-link logout-btn" 
          onClick={logout} 
          style={{ 
            marginTop: 'auto', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left', 
            background: 'none', 
            cursor: 'pointer' 
          }}
        >
          <span className="nav-icon"><HiOutlineArrowRightOnRectangle /></span>
          <span className="nav-text">Çıxış</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
