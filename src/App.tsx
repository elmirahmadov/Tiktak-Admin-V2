import { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import azAZ from 'antd/locale/az_AZ';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Campaigns from './pages/Campaigns';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Users from './pages/Users';
import Orders from './pages/Orders';

const App: FC = () => {
  return (
    <ConfigProvider
      locale={azAZ}
      theme={{
        token: {
          colorPrimary: '#52c41a',
          borderRadius: 8,
          fontFamily: "'Roboto', sans-serif",
          colorBgContainer: '#ffffff',
        },
        components: {
          Table: {
            headerBg: '#fafafa',
            rowHoverBg: '#fafff5',
          },
          Menu: {
            itemSelectedColor: '#52c41a',
            itemSelectedBg: 'transparent',
          },
          Button: {
            primaryColor: '#ffffff',
            colorPrimary: '#52c41a',
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/orders" replace />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<Products />} />
              <Route path="users" element={<Users />} />
              <Route path="orders" element={<Orders />} />
            </Route>
            <Route path="*" element={<Navigate to="/orders" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
