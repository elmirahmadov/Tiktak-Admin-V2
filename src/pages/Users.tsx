import { useState, useEffect, useMemo, FC } from 'react';
import { usersAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { User } from '../types';
import { Table, Avatar, Tag, Card, Typography, Button, Modal, App } from 'antd';
import {
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDebounce } from '../hooks/useDebounce';
import { getImageUrl } from '../utils/imageUrl';
import dayjs from 'dayjs';

const { Title } = Typography;
const PAGE_SIZE = 5;

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { loading, setLoading } = useDataStore();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.list();
      const data = res.data.data || res.data.users || (Array.isArray(res.data) ? res.data : []);
      setUsers(data);
    } catch {
      message.error('İstifadəçilər yüklənərkən xəta baş verdi');
      if (users.length === 0) setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSearch(customEvent.detail || '');
    };
    window.addEventListener('globalSearch', handler);
    return () => window.removeEventListener('globalSearch', handler);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u: User) =>
      (u.full_name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [users, debouncedSearch]);

  const handleShowDetail = (user: User) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = dayjs(dateStr);
    return d.isValid() ? d.format('DD MMMM YYYY, HH:mm') : dateStr;
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Sıra',
      key: 'index',
      width: 50,
      render: (_: unknown, __: User, index: number) => index + 1,
    },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: (avatar: string, record: User) => {
        const url = getImageUrl(avatar);
        return (
          <Avatar
            src={url || undefined}
            style={{ backgroundColor: '#52c41a', fontWeight: 700 }}
          >
            {getInitials(record.full_name)}
          </Avatar>
        );
      },
    },
    {
      title: 'Ad Soyad',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a: User, b: User) => (a.full_name || '').localeCompare(b.full_name || ''),
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ünvan',
      key: 'address',
      ellipsis: true,
      render: (_: unknown, record: User) => {
        const addr = (record as any).address || (record as any).delivery_address;
        return addr
          ? <span>{addr}</span>
          : <span style={{ color: '#bfbfbf' }}>Qeyd olunmayıb</span>;
      },
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color="green" style={{ borderRadius: 12 }}>
          {(role || 'COMMERCE').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Əməliyyat',
      key: 'actions',
      align: 'center' as const,
      width: 90,
      render: (_: unknown, record: User) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          style={{ color: '#52c41a', padding: 0 }}
          onClick={() => handleShowDetail(record)}
        >
          Göstər
        </Button>
      ),
    },
  ];

  const userAddr = selectedUser
    ? (selectedUser as any).address || (selectedUser as any).delivery_address || null
    : null;

  const userDate = selectedUser
    ? (selectedUser as any).created_at || (selectedUser as any).createdAt || null
    : null;

  return (
    <Card variant="borderless" style={{ borderRadius: 16 }}>
      <Title level={4} style={{ marginBottom: 24, color: '#2b3043' }}>İstifadəçilər</Title>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey={(record) => String(record.id)}
        loading={loading}
        pagination={{
          pageSize: PAGE_SIZE,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nəticə`,
          showSizeChanger: false,
        }}
        size="small"
        tableLayout="fixed"
      />

      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        closable={false}
        centered
        destroyOnHidden
        width={420}
        styles={{ body: { padding: 0 } }}
      >
        {/* Green header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3a3f47 0%, #2b3043 100%)',
            borderRadius: '8px 8px 0 0',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserOutlined style={{ color: '#fff', fontSize: 20 }} />
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
              İstifadəçi Detayları
            </span>
          </div>
          <Button
            type="text"
            size="small"
            onClick={() => setDetailOpen(false)}
            style={{ color: '#fff', fontSize: 18, lineHeight: 1 }}
          >
            ✕
          </Button>
        </div>

        {/* Avatar + Name + Role */}
        <div style={{ textAlign: 'center', padding: '28px 20px 16px' }}>
          <Avatar
            src={selectedUser?.avatar ? getImageUrl(selectedUser.avatar) : undefined}
            size={72}
            style={{
              backgroundColor: '#52c41a',
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            {getInitials(selectedUser?.full_name)}
          </Avatar>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#2b3043', marginBottom: 8 }}>
            {selectedUser?.full_name || '-'}
          </div>
          <Tag
            color="green"
            style={{ borderRadius: 12, fontSize: 12, padding: '2px 14px' }}
          >
            {(selectedUser?.role || 'COMMERCE').toUpperCase()}
          </Tag>
        </div>

        {/* Info card */}
        <div style={{ padding: '0 20px 24px' }}>
          <div
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {/* Telefon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PhoneOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Telefon</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#2b3043' }}>
                  {selectedUser?.phone || '-'}
                </div>
              </div>
            </div>

            {/* Ünvan */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <EnvironmentOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Ünvan</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#2b3043' }}>
                  {userAddr || 'Ünvan yoxdur'}
                </div>
              </div>
            </div>

            {/* Yaradılma tarixi */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CalendarOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Yaradılma tarixi</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#2b3043' }}>
                  {formatDate(userDate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default Users;
