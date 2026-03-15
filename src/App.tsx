import { FC, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import azAZ from 'antd/locale/az_AZ';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

const Campaigns = lazy(() => import('./pages/Campaigns'));
const Categories = lazy(() => import('./pages/Categories'));
const Products = lazy(() => import('./pages/Products'));
const Users = lazy(() => import('./pages/Users'));
const Orders = lazy(() => import('./pages/Orders'));

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
              <Route path="campaigns" element={<Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>}><Campaigns /></Suspense>} />
              <Route path="categories" element={<Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>}><Categories /></Suspense>} />
              <Route path="products" element={<Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>}><Products /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>}><Users /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>}><Orders /></Suspense>} />
            </Route>
            <Route path="*" element={<Navigate to="/orders" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
