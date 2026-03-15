import { useState, useEffect, useMemo, FC } from 'react';
import { categoriesAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { Category } from '../types';
import { Table, Button, Card, Typography, Space, Modal, Form, Input, Upload, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import type { ColumnsType } from 'antd/es/table';
import { useDebounce } from '../hooks/useDebounce';
import { getImageUrl } from '../utils/imageUrl';
import { useImageUpload } from '../hooks/useImageUpload';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const PAGE_SIZE = 5;

const getCatName = (cat: any): string => cat.name || cat.title || '';

const Categories: FC = () => {
  const {
    categories, setCategories,
    addCategory, updateCategory, deleteCategory,
  } = useDataStore();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { message } = App.useApp();
  const { uploading, imageUrl, setImageUrl, uploadImage, reset: resetImage } = useImageUpload();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.list();
      const data = res.data.data || res.data.categories || (Array.isArray(res.data) ? res.data : []);
      setCategories(data);
    } catch {
      message.error('Kateqoriyalar yüklənərkən xəta baş verdi');
      if (categories.length === 0) setCategories([]);
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

  const filteredCategories = useMemo(() => {
    return categories.filter((c: Category) =>
      getCatName(c).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [categories, debouncedSearch]);

  const handleOpenForm = (item: Category | null = null) => {
    setSelectedCategory(item);
    if (item) {
      const raw = item as any;
      form.setFieldsValue({
        name: getCatName(item),
        description: item.description,
      });
      setImageUrl(raw.img_url || raw.image || '');
    } else {
      form.resetFields();
      resetImage();
    }
    setShowFormModal(true);
  };

  const handleUpload = async (file: File) => {
    try {
      await uploadImage(file);
      message.success('Şəkil yükləndi');
    } catch {
      message.error('Şəkil yüklənərkən xəta baş verdi');
    }
    return false;
  };

  const handleSaveCategory = async () => {
    try {
      const values = await form.validateFields();

      if (!imageUrl) {
        message.warning('Zəhmət olmasa şəkil yükləyin');
        return;
      }

      setSubmitting(true);
      const payload = {
        name: values.name,
        description: values.description || '',
        img_url: imageUrl,
      };

      if (selectedCategory?.id) {
        await categoriesAPI.update(selectedCategory.id, payload);
        updateCategory(selectedCategory.id, { ...payload, id: selectedCategory.id } as any);
        message.success('Kateqoriya uğurla yeniləndi');
      } else {
        await categoriesAPI.create(payload);
        await fetchData();
        message.success('Yeni kateqoriya əlavə edildi');
      }
      setShowFormModal(false);
      form.resetFields();
      resetImage();
    } catch (err: any) {
      if (err?.errorFields) return;
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error || '';
      message.error(apiMsg || 'Gözlənilməz xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item: Category) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoriesAPI.remove(deleteTarget.id);
      deleteCategory(deleteTarget.id);
      message.success('Kateqoriya silindi');
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

  const columns: ColumnsType<Category> = [
    {
      title: 'Sıra',
      key: 'index',
      width: 50,
      render: (_: unknown, __: Category, index: number) => index + 1,
    },
    {
      title: 'Şəkil',
      key: 'image',
      width: 60,
      render: (_: unknown, record: Category) => {
        const raw = record as any;
        const imgSrc = raw.img_url || raw.image || raw.photo || '';
        const url = imgSrc.startsWith('http') ? imgSrc : getImageUrl(imgSrc);
        return (
          <img
            src={url || '/logo-mock.png'}
            alt=""
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = '/logo-mock.png'; }}
          />
        );
      },
    },
    {
      title: 'Ad',
      key: 'name',
      width: 160,
      sorter: (a: Category, b: Category) => getCatName(a).localeCompare(getCatName(b)),
      render: (_: unknown, record: Category) => <strong>{getCatName(record)}</strong>,
    },
    {
      title: 'Açıqlama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <span style={{ color: '#595959' }}>{desc || '-'}</span>
      ),
    },
    {
      title: 'Tarix',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Əməliyyat',
      key: 'actions',
      align: 'center' as const,
      width: 90,
      render: (_: unknown, record: Category) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenForm(record)}
            style={{ color: '#1890ff' }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ color: '#ff4d4f' }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card variant="borderless" style={{ borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#2b3043' }}>Kateqoriyalar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenForm(null)}>
          Yeni Kateqoriya
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCategories}
        rowKey={(record) => String(record.id)}
        loading={loading}
        pagination={{
          pageSize: PAGE_SIZE,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nəticə`,
          showSizeChanger: false,
        }}
        size="middle"
        tableLayout="fixed"
      />

      <Modal
        title={selectedCategory ? 'Kateqoriyanı düzəlt' : 'Yeni Kateqoriya'}
        open={showFormModal}
        onCancel={() => { setShowFormModal(false); form.resetFields(); resetImage(); }}
        onOk={handleSaveCategory}
        okText="Yadda saxla"
        cancelText="İmtina"
        confirmLoading={submitting || uploading}
        centered
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Kateqoriya adı mütləqdir' }]}>
            <Input placeholder="Kateqoriyanın adı" />
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
                beforeUpload={(file) => { handleUpload(file); return false; }}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {imageUrl ? 'Dəyişdir' : 'Şəkil yüklə'}
                </Button>
              </Upload>
            </div>
          </Form.Item>
          <Form.Item name="description" label="Açıqlama">
            <TextArea rows={3} placeholder="Məzmun haqqında məlumat..." />
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

export default Categories;
