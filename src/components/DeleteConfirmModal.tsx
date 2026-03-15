import { FC } from 'react';
import { Modal, Button } from 'antd';

interface DeleteConfirmModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  open,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
      destroyOnHidden
      width={400}
      styles={{ body: { padding: '32px 24px 24px' } }}
    >
      <div style={{ textAlign: 'center' }}>
        <img
          src="/deletemodal.png"
          alt=""
          style={{ width: 180, marginBottom: 20 }}
        />
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#2b3043',
            marginBottom: 28,
            lineHeight: 1.4,
          }}
        >
          Məlumatı silməyə
          <br />
          əminsinizmi?
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            onClick={onConfirm}
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            Təsdiqlə
          </Button>
          <Button
            block
            size="large"
            onClick={onCancel}
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            İndi yox
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
