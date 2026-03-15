import { useState, useEffect, useMemo, FC } from 'react';
import { productsAPI, categoriesAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { Product, Category } from '../types';
import { Table, Button, Card, Typography, Space, Tag, Modal, Form, Input, Select, InputNumber, Upload, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import type { ColumnsType } from 'antd/es/table';
import { useDebounce } from '../hooks/useDebounce';
import { useImageUpload } from '../hooks/useImageUpload';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const PAGE_SIZE = 5;

const resolveImg = (record: any): string => {
  const raw = record.img_url || record.image || record.photo || record.thumbnail || '';
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  return `https://api.sarkhanrahimli.dev${raw.startsWith('/') ? '' : '/'}${raw}`;
};

const Products: FC = () => {
  const {
    products, setProducts,
    categories, setCategories,
    addProduct, updateProduct, deleteProduct,
  } = useDataStore();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { message } = App.useApp();
  const { uploading, imageUrl, setImageUrl, uploadImage, reset: resetImage } = useImageUpload();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productsAPI.list(),
        categoriesAPI.list()
      ]);
      const productData = prodRes.data.data || prodRes.data.products || (Array.isArray(prodRes.data) ? prodRes.data : []);
      const categoryData = catRes.data.data || catRes.data.categories || (Array.isArray(catRes.data) ? catRes.data : []);
      setProducts(productData);
      setCategories(categoryData);
    } catch {
      message.error('Məlumatlar yüklənərkən xəta baş verdi');
      if (products.length === 0) setProducts([]);
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

  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) =>
      (p.title || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  const handleOpenForm = (item: Product | null = null) => {
    setSelectedProduct(item);
    if (item) {
      const raw = item as any;
      form.setFieldsValue({
        title: item.title,
        description: item.description,
        price: Number(item.price),
        category_id: raw.category?.id ? String(raw.category.id) : String(item.category_id || ''),
        type: raw.type || 'ədəd',
      });
      setImageUrl(raw.img_url || raw.image || '');
    } else {
      form.resetFields();
      resetImage();
    }
    setShowFormModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (!imageUrl) {
        message.warning('Zəhmət olmasa şəkil yükləyin');
        return;
      }

      const payload: Record<string, any> = {
        title: values.title,
        description: values.description || '',
        price: String(values.price),
        category_id: Number(values.category_id),
        type: values.type || 'ədəd',
        img_url: imageUrl,
      };

      if (selectedProduct?.id) {
        await productsAPI.update(selectedProduct.id, payload);
        updateProduct(selectedProduct.id, { ...payload, id: selectedProduct.id });
        message.success('Məhsul uğurla yeniləndi');
      } else {
        await productsAPI.create(payload);
        await fetchData();
        message.success('Yeni məhsul əlavə edildi');
      }
      setShowFormModal(false);
      form.resetFields();
      resetImage();
    } catch (err: any) {
      if (err?.errorFields) return;
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error || '';
      console.error('[Product Save] Error:', err?.response?.data || err);
      message.error(apiMsg || 'Gözlənilməz xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item: Product) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsAPI.remove(deleteTarget.id);
      deleteProduct(deleteTarget.id);
      message.success('Məhsul silindi');
      setDeleteTarget(null);
    } catch {
      message.error('Silinmə zamanı xəta baş verdi');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = dayjs(dateStr);
    return d.isValid() ? d.format('DD.MM.YYYY') : dateStr;
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Sıra',
      key: 'index',
      width: 45,
      render: (_: unknown, __: Product, index: number) => index + 1,
    },
    {
      title: 'Şəkil',
      key: 'image',
      width: 55,
      render: (_: unknown, record: Product) => {
        const url = resolveImg(record);
        return (
          <img
            src={url || '/logo-mock.png'}
            alt=""
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = '/logo-mock.png'; }}
          />
        );
      },
    },
    {
      title: 'Ad',
      dataIndex: 'title',
      key: 'title',
      width: 120,
      ellipsis: true,
      sorter: (a: Product, b: Product) => (a.title || '').localeCompare(b.title || ''),
      render: (title: string) => <strong>{title || 'Adsız məhsul'}</strong>,
    },
    {
      title: 'Açıqlama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => <span style={{ color: '#8c8c8c' }}>{desc || '-'}</span>,
    },
    {
      title: 'Qiymət',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      sorter: (a: Product, b: Product) => Number(a.price || 0) - Number(b.price || 0),
      render: (price: number | string) => <strong>{Number(price || 0).toFixed(2)} ₼</strong>,
    },
    {
      title: 'Kateqoriya',
      key: 'category',
      width: 130,
      render: (_: unknown, record: Product) => {
        const raw = record as any;
        const name = raw.category?.name || raw.category?.title || '';
        return name
          ? <Tag color="green" style={{ borderRadius: 12 }}>{name}</Tag>
          : <span style={{ color: '#bfbfbf' }}>-</span>;
      },
    },
    {
      title: 'Tip',
      key: 'type',
      width: 60,
      render: (_: unknown, record: Product) => {
        const t = (record as any).type;
        return t ? <Tag color="blue" style={{ borderRadius: 12 }}>{t}</Tag> : '-';
      },
    },
    {
      title: 'Tarix',
      key: 'date',
      width: 90,
      render: (_: unknown, record: Product) => formatDate((record as any).created_at),
    },
    {
      title: 'Əməliyyat',
      key: 'actions',
      align: 'center' as const,
      width: 140,
      render: (_: unknown, record: Product) => (
        <Space size={4}>
          <Tag
            color="green"
            style={{ borderRadius: 12, cursor: 'pointer', marginRight: 0 }}
            icon={<CheckOutlined />}
          >
            Deaktiv
          </Tag>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenForm(record)}
            style={{ color: '#52c41a' }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            danger
          />
        </Space>
      ),
    },
  ];

  const categoryOptions = useMemo(() => {
    return categories.map((c: any) => ({
      label: c.name || c.title || `Kateqoriya #${c.id}`,
      value: String(c.id),
    }));
  }, [categories]);

  return (
    <Card variant="borderless" style={{ borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#2b3043' }}>Məhsullar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenForm(null)}>
          Yeni Məhsul
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
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
        title={selectedProduct ? 'Məhsulu düzəlt' : 'Yeni Məhsul'}
        open={showFormModal}
        onCancel={() => { setShowFormModal(false); form.resetFields(); resetImage(); }}
        onOk={handleSaveProduct}
        okText="Yadda saxla"
        cancelText="İmtina"
        confirmLoading={submitting || uploading}
        centered
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Ad" rules={[{ required: true, message: 'Məhsul adı mütləqdir' }]}>
            <Input placeholder="Məhsulun adı" />
          </Form.Item>
          <Form.Item name="category_id" label="Kateqoriya" rules={[{ required: true, message: 'Kateqoriya seçin' }]}>
            <Select
              placeholder="Kateqoriya seçin"
              options={categoryOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="price" label="Qiymət (₼)" rules={[{ required: true, message: 'Qiymət daxil edin' }]}>
            <InputNumber placeholder="0.00" step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="type" label="Tip">
            <Select
              placeholder="Ölçü tipi seçin"
              options={[
                { label: 'kq', value: 'kg' },
                { label: 'ədəd', value: 'ədəd' },
                { label: 'litr', value: 'litr' },
                { label: 'paket', value: 'paket' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Şəkil" required>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }}
                />
              )}
              <Upload
                showUploadList={false}
                accept="image/*"
                beforeUpload={(file) => {
                  uploadImage(file)
                    .then(() => message.success('Şəkil yükləndi'))
                    .catch(() => message.error('Şəkil yüklənərkən xəta'));
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {imageUrl ? 'Dəyişdir' : 'Şəkil yüklə'}
                </Button>
              </Upload>
            </div>
          </Form.Item>
          <Form.Item name="description" label="Açıqlama">
            <TextArea rows={3} placeholder="Məhsul haqqında məlumat..." />
          </Form.Item>
        </Form>
      </Modal>

      <DeleteConfirmModal
        open={!!deleteTarget}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Card>
  );
};

export default Products;
