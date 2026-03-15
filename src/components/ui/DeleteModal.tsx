import { FC } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { Modal } from './Modal';
import { Button } from './Button';

export interface DeleteModalProps {
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

export const DeleteModal: FC<DeleteModalProps> = ({ 
  onConfirm, 
  onClose, 
  title = "Silinməni Təsdiqləyin", 
  message = "Bu elementi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.",
  isDeleting = false
}) => {
  return (
    <Modal 
      title={title} 
      onClose={onClose}
      className="max-w-sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>İmtina</Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>Bəli, Sil</Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <HiOutlineExclamationTriangle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-gray-600 leading-relaxed text-sm">
          {message}
        </p>
      </div>
    </Modal>
  );
};
