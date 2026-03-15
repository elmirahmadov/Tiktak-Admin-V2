import { useState, useEffect, useMemo, FC } from 'react';
import { ordersAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { Order } from '../types';
import { Table, Card, Typography, Tag, Button, Select, Modal, Avatar, Divider, App } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDebounce } from '../hooks/useDebounce';
import dayjs from 'dayjs';

const { Text } = Typography;
const PAGE_SIZE = 5;

const Orders: FC = () => {
  const { orders, setOrders } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.list();
      const rawData = res.data.data || res.data.orders || res.data.items || (Array.isArray(res.data) ? res.data : []);
      // Konsolda API cavabını yoxlamaq üçün: F12 → Console
      if (rawData.length > 0) console.log('Orders API cavabı (ilk sifariş):', rawData[0]);
      const data = rawData.map((item: any) => {
        const rawDate = item.date || item.created_at || item.createdAt || item.order_date || item.updatedAt || item.updated_at || '';
        const parsed = rawDate ? dayjs(rawDate) : null;
        const itemCount =
          item.itemCount ??
          item.items_count ??
          item.order_items_count ??
          item.product_count ??
          (Array.isArray(item.order_items) ? item.order_items.length : null) ??
          (Array.isArray(item.items) ? item.items.length : null) ??
          (Array.isArray(item.products) ? item.products.length : null);
        return {
          ...item,
          address: item.address || item.delivery_address || item.deliveryAddress || 'Ünvan qeyd olunmayıb',
          date: parsed?.isValid() ? parsed.format('DD.MM.YYYY') : '',
          dateDisplay: parsed?.isValid() ? parsed.format('DD/MM') : '', // 06/03 formatı
          time: item.time || (parsed?.isValid() ? parsed.format('HH:mm') : ''),
          itemCount: itemCount ?? 0,
        };
      });
      setOrders(data);
    } catch {
      message.error('Sifarişlər yüklənərkən xəta baş verdi');
      if (orders.length === 0) setOrders([]);
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

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map((o: Order) => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    message.success('Sifarişin statusu yeniləndi');
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o: Order) =>
      (o.address || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      String(o.id || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [orders, debouncedSearch]);

  const getStatusTag = (status: string) => {
    const key = (status || '').toUpperCase();
    const map: Record<string, { color: string; label: string }> = {
      'PENDING': { color: 'orange', label: 'Gözləyir' },
      'GÖZLƏYIR': { color: 'orange', label: 'Gözləyir' },
      'CONFIRMED': { color: 'green', label: 'Təsdiqləndi' },
      'TƏSDIQLƏNDI': { color: 'green', label: 'Təsdiqləndi' },
      'DELIVERED': { color: 'blue', label: 'Çatdırıldı' },
      'ÇATDIRILDI': { color: 'blue', label: 'Çatdırıldı' },
      'CANCELLED': { color: 'red', label: 'Ləğv edildi' },
      'LƏĞV EDILDI': { color: 'red', label: 'Ləğv edildi' },
      'PREPARING': { color: 'purple', label: 'Hazırlanır' },
      'YOLDADIR': { color: 'purple', label: 'Yoldadır' },
    };
    const config = map[key] || { color: 'default', label: status };
    return <Tag color={config.color} style={{ borderRadius: 12 }}>{config.label}</Tag>;
  };

  const totalAmount = useMemo(() => {
    return filteredOrders.reduce((sum: number, o: Order) => sum + Number(o.total || 0), 0).toFixed(2);
  }, [filteredOrders]);

  const stats = [
    {
      label: 'Ümumi sifarişlər',
      value: filteredOrders.length,
      icon: <ShoppingCartOutlined style={{ fontSize: 16, color: '#1890ff' }} />,
    },
    {
      label: 'Ümumi satış',
      value: totalAmount,
      icon: <DollarOutlined style={{ fontSize: 16, color: '#52c41a' }} />,
      prefix: '₼',
    },
    {
      label: 'Gözləyən',
      value: filteredOrders.filter((o: Order) => ['PENDING'].includes(String(o.status).toUpperCase())).length,
      icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#faad14' }} />,
    },
    {
      label: 'Hazırlanır',
      value: filteredOrders.filter((o: Order) => ['CONFIRMED', 'PREPARING'].includes(String(o.status).toUpperCase())).length,
      icon: <CarOutlined style={{ fontSize: 16, color: '#722ed1' }} />,
    },
    {
      label: 'Çatdırılan',
      value: filteredOrders.filter((o: Order) => ['DELIVERED'].includes(String(o.status).toUpperCase())).length,
      icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a' }} />,
    },
    {
      label: 'Ləğv edilən',
      value: filteredOrders.filter((o: Order) => ['CANCELLED'].includes(String(o.status).toUpperCase())).length,
      icon: <CloseCircleOutlined style={{ fontSize: 16, color: '#ff4d4f' }} />,
    },
  ];

  const columns: ColumnsType<Order> = [
    {
      title: 'No',
      key: 'id',
      width: 100,
      render: (_: unknown, record: Order) => (
        <Text strong style={{ fontSize: 13 }}>ORD-{String(record.id).slice(0, 2)}...</Text>
      ),
    },
    {
      title: 'Tarix',
      key: 'date',
      width: 90,
      sorter: true,
      render: (_: unknown, record: Order) => (
        <span style={{ fontSize: 13 }}>{(record as any).dateDisplay || record.date || '-'}</span>
      ),
    },
    {
      title: 'Çatdırılma ünvanı',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 200,
      render: (addr: string) => <span style={{ fontSize: 13 }}>{addr}</span>,
    },
    {
      title: 'Məhsul sayı',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 110,
      align: 'center' as const,
      sorter: true,
      render: (count: number) => <span style={{ fontSize: 13 }}>{typeof count === 'number' ? count : '-'}</span>,
    },
    {
      title: 'Subtotal/Çatdırılma',
      key: 'total',
      width: 170,
      sorter: true,
      render: (_: unknown, record: Order) => (
        <span style={{ fontSize: 13 }}>
          <Text strong>{Number(record.total || 0).toFixed(2)} ₼</Text>
          <Text type="secondary" style={{ fontSize: 11 }}> · Pulsuz</Text>
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Gözləyir', value: 'PENDING' },
        { text: 'Təsdiqləndi', value: 'CONFIRMED' },
        { text: 'Çatdırıldı', value: 'DELIVERED' },
        { text: 'Ləğv edildi', value: 'CANCELLED' },
        { text: 'Hazırlanır', value: 'PREPARING' },
      ],
      onFilter: (value, record) => String(record.status).toUpperCase() === String(value).toUpperCase(),
      render: (status: Order['status']) => getStatusTag(status),
    },
    {
      title: 'Əməliyyat',
      key: 'actions',
      align: 'center' as const,
      width: 110,
      render: (_: unknown, record: Order) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => setSelectedOrder(record)}
          style={{ color: '#52c41a', padding: 0, fontSize: 13 }}
        >
          Göstər
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card variant="borderless" style={{ borderRadius: 16, padding: '4px 0' }}>
        <Text strong style={{ fontSize: 20, color: '#2b3043', display: 'block', marginBottom: 16 }}>
          Sifarişlər
        </Text>
        <div className="stat-cards-row">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card-item">
              <div className="stat-label">
                {stat.icon}
                <span style={{ marginLeft: 6 }}>{stat.label}</span>
              </div>
              <div className="stat-value">
                {stat.prefix && <span style={{ fontSize: 14, marginRight: 2 }}>{stat.prefix}</span>}
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="borderless" style={{ borderRadius: 16 }} className="orders-table-card">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey={(record) => String(record.id)}
          loading={loading}
          pagination={{
            pageSize: PAGE_SIZE,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nəticə`,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
          }}
          size="middle"
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={null}
        centered
        width={600}
        title={null}
        closable
        styles={{ body: { padding: 0 } }}
      >
        {selectedOrder && (
          <>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar style={{ backgroundColor: '#52c41a', fontWeight: 700 }} size={32}>
                {String(selectedOrder.id).slice(-1) || '0'}
              </Avatar>
              <Text strong style={{ fontSize: 16 }}>ORD-{selectedOrder.id}</Text>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Status</Text>
                  <Select
                    value={selectedOrder.status}
                    onChange={(val) => handleUpdateStatus(selectedOrder.id, val as Order['status'])}
                    size="small"
                    style={{ width: 130 }}
                    options={[
                      { value: 'PENDING', label: 'Gözləyir' },
                      { value: 'CONFIRMED', label: 'Təsdiqləndi' },
                      { value: 'DELIVERED', label: 'Çatdırıldı' },
                      { value: 'CANCELLED', label: 'Ləğv edildi' },
                      { value: 'PREPARING', label: 'Hazırlanır' },
                    ]}
                  />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ümumi məbləğ</Text>
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{selectedOrder.total} ₼</Text>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <Text strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Sifariş Məlumatları
              </Text>
              <div style={{ marginTop: 16, background: '#fafafa', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: 13 }}>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 2 }}>Tarix:</Text>
                    <Text strong>{selectedOrder.date} {selectedOrder.time}</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 2 }}>Çatdırılma Ünvanı:</Text>
                    <Text strong>{selectedOrder.address}</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 2 }}>Telefon:</Text>
                    <Text strong>{(selectedOrder as any).phone || '+994XXXXXXXXX'}</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 2 }}>Ödəmə Metodu:</Text>
                    <Text strong>{(selectedOrder as any).payment_method || 'Kart'}</Text>
                  </div>
                </div>
              </div>

              <Divider style={{ margin: '20px 0 16px' }} />

              <Text strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Məhsullar ({selectedOrder.itemCount || 1})
              </Text>
              <div style={{ marginTop: 12 }}>
                {((selectedOrder as any).items || [(selectedOrder as any)]).slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 12, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, marginBottom: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={item.img_url || item.image || item.photo || '/logo-mock.png'}
                        alt=""
                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', background: '#f5f5f5' }}
                        onError={(e) => { e.currentTarget.src = '/logo-mock.png'; }}
                      />
                      <div>
                        <Text strong style={{ display: 'block' }}>{item.title || item.product_name || 'Məhsul'}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.category?.name || item.category || ''}{item.weight ? ` · ${item.weight}` : ''}{item.type ? ` · ${item.type}` : ''}
                        </Text>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong style={{ color: '#52c41a', display: 'block' }}>
                        {item.price || item.total || selectedOrder.total} ₼
                      </Text>
                      {item.unit_price && (
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.unit_price} ₼/kq</Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <Tag color="green" style={{ borderRadius: 8, padding: '4px 12px', fontSize: 13 }}>
                  Çatdırılma: {selectedOrder.deliveryFee || 'Pulsuz'}
                </Tag>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
