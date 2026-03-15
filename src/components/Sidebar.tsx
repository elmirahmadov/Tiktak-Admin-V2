import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  ShoppingCartOutlined,
  TagsOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';

const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const currentKey = location.pathname.replace('/', '') || 'orders';

  const menuItems = [
    { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Sifarişlər' },
    { key: 'campaigns', icon: <TagsOutlined />, label: 'Kampaniyalar' },
    { key: 'categories', icon: <AppstoreOutlined />, label: 'Kateqoriyalar' },
    { key: 'products', icon: <ShoppingOutlined />, label: 'Məhsullar' },
    { key: 'users', icon: <UserOutlined />, label: 'İstifadəçilər' },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıxış',
      danger: true,
    },
  ];

  const handleClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      return;
    }
    navigate(`/${key}`);
  };

  return (
    <div className="sidebar-menu">
      <Menu
        mode="inline"
        selectedKeys={[currentKey]}
        onClick={handleClick}
        items={menuItems}
        style={{ border: 'none', background: 'transparent', fontSize: 14 }}
      />
    </div>
  );
};

export default Sidebar;
