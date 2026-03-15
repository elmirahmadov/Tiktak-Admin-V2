import { FC, useState, useEffect } from 'react';
import { Category } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { toast } from 'react-hot-toast';

interface CategoryFormProps {
  initialData?: Category | null;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id' | 'created_at'>, id?: string | number) => Promise<void>;
}

export const CategoryForm: FC<CategoryFormProps> = ({ initialData, onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        image: initialData.image || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Kateqoriya adı mütləqdir');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        image: formData.image
      }, initialData?.id);
    } catch (err) {
      console.error(err);
      toast.error('Gözlənilməz xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={initialData ? 'Kateqoriyanı düzəlt' : 'Yeni Kateqoriya'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>İmtina</Button>
          <Button variant="primary" form="category-form" type="submit" isLoading={isSubmitting}>
            Yadda saxla
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad <span className="text-red-500">*</span></label>
          <Input 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
            placeholder="Kateqoriyanın adı"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıqlama</label>
          <Textarea 
            rows={3}
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Məzmun haqqında məlumat..."
          />
        </div>
      </form>
    </Modal>
  );
};
