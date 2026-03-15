import { useState, useEffect, useMemo, FC } from 'react';
import { campaignsAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { Campaign } from '../types';
import { Table, Button, Card, Typography, Space, Modal, Form, Input, Switch, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import type { ColumnsType } from 'antd/es/table';
import { useDebounce } from '../hooks/useDebounce';
import { getImageUrl } from '../utils/imageUrl';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const PAGE_SIZE = 10;

const Campaigns: FC = () => {
  const {
    campaigns, setCampaigns,
    addCampaign, updateCampaign, deleteCampaign,
  } = useDataStore();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await campaignsAPI.list();
      const data = res.data.data || res.data.campaigns || (Array.isArray(res.data) ? res.data : []);
      setCampaigns(data);
    } catch {
      message.error('Kampaniyalar yüklənərkən xəta baş verdi');
      if (campaigns.length === 0) setCampaigns([]);
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

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c: Campaign) =>
      (c.title || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [campaigns, debouncedSearch]);

  const handleOpenForm = (item: Campaign | null = null) => {
    setSelectedCampaign(item);
    if (item) {
      form.setFieldsValue({
        title: item.title,
        description: item.description,
        is_active: item.is_active !== undefined ? item.is_active : true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true });
    }
    setShowFormModal(true);
  };

  const handleSaveCampaign = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        title: values.title,
        description: values.description || '',
        image: '',
        is_active: values.is_active,
      };

      if (selectedCampaign?.id) {
        await campaignsAPI.update(selectedCampaign.id, payload);
        updateCampaign(selectedCampaign.id, { ...payload, id: selectedCampaign.id });
        message.success('Kampaniya uğurla yeniləndi');
      } else {
        const newId = Math.floor(Math.random() * 900000) + 100000;
        await campaignsAPI.create(payload);
        addCampaign({ id: newId, ...payload });
        message.success('Yeni kampaniya əlavə edildi');
      }
      setShowFormModal(false);
      form.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error('Gözlənilməz xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item: Campaign) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await campaignsAPI.remove(deleteTarget.id);
      deleteCampaign(deleteTarget.id);
      message.success('Kampaniya silindi');
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

  const columns: ColumnsType<Campaign> = [
    {
      title: 'Sıra',
      key: 'index',
      width: 50,
      render: (_: unknown, __: Campaign, index: number) => index + 1,
    },
    {
      title: 'Şəkil',
      key: 'image',
      width: 60,
      render: (_: unknown, record: Campaign) => {
        const raw = record as any;
        const imgSrc = raw.img_url || raw.image || raw.photo || '';
        const url = imgSrc.startsWith('http') ? imgSrc : getImageUrl(imgSrc);
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
      title: 'Başlıq',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: Campaign, b: Campaign) => (a.title || '').localeCompare(b.title || ''),
      render: (title: string) => <strong>{title}</strong>,
    },
    {
      title: 'Açıqlama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || '-',
    },
    {
      title: 'Tarix',
      key: 'date',
      width: 110,
      render: (_: unknown, record: Campaign) => formatDate((record as any).created_at),
    },
    {
      title: 'Əməliyyat',
      key: 'actions',
      align: 'center' as const,
      width: 100,
      render: (_: unknown, record: Campaign) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenForm(record)}
            style={{ color: '#52c41a' }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <Card variant="borderless" style={{ borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#2b3043' }}>Kampaniyalar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenForm(null)}>
          Yeni Kampaniya
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCampaigns}
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
        title={selectedCampaign ? 'Kampaniyanı düzəlt' : 'Yeni Kampaniya'}
        open={showFormModal}
        onCancel={() => { setShowFormModal(false); form.resetFields(); }}
        onOk={handleSaveCampaign}
        okText="Yadda saxla"
        cancelText="İmtina"
        confirmLoading={submitting}
        centered
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Ad" rules={[{ required: true, message: 'Kampaniya adı mütləqdir' }]}>
            <Input placeholder="Kampaniyanın adı" />
          </Form.Item>
          <Form.Item name="description" label="Açıqlama">
            <TextArea rows={3} placeholder="Kampaniya haqqında məlumat..." />
          </Form.Item>
          <Form.Item name="is_active" label="Aktivdir" valuePropName="checked">
            <Switch />
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

export default Campaigns;
