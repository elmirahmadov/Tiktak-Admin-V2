import { FC, useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { toast } from 'react-hot-toast';

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Omit<Product, 'id'>, id?: string | number) => Promise<void>;
}

export const ProductForm: FC<ProductFormProps> = ({ initialData, categories, onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    image: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: String(initialData.price ?? ''),
        category_id: String(initialData.category_id ?? ''),
        image: initialData.image || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category_id) {
      toast.error('Bütün zəruri sahələri doldurun');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category_id: Number(formData.category_id),
        image: formData.image
      }, initialData?.id);
    } catch (err) {
      console.error(err);
      toast.error('Gözlənilməz xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map(c => ({
    label: c.title,
    value: c.id.toString()
  }));

  return (
    <Modal
      title={initialData ? 'Məhsulu düzəlt' : 'Yeni Məhsul'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>İmtina</Button>
          <Button variant="primary" form="product-form" type="submit" isLoading={isSubmitting}>
            Yadda saxla
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad <span className="text-red-500">*</span></label>
          <Input 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
            placeholder="Məhsulun adı"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kateqoriya <span className="text-red-500">*</span></label>
          <Select 
            options={categoryOptions}
            value={formData.category_id}
            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
            placeholder="Kateqoriya seçin"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qiymət (₼) <span className="text-red-500">*</span></label>
          <Input 
            type="number" 
            step="0.01" 
            value={formData.price} 
            onChange={e => setFormData({ ...formData, price: e.target.value })} 
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıqlama</label>
          <Textarea 
            rows={3}
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Məhsul haqqında məlumat..."
          />
        </div>
      </form>
    </Modal>
  );
};
