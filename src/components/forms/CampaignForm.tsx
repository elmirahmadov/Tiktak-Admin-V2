import { FC, useState, useEffect } from 'react';
import { Campaign } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { toast } from 'react-hot-toast';

interface CampaignFormProps {
  initialData?: Campaign | null;
  onClose: () => void;
  onSave: (data: Omit<Campaign, 'id'>, id?: string | number) => Promise<void>;
}

export const CampaignForm: FC<CampaignFormProps> = ({ initialData, onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        image: initialData.image || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Kampaniya adı mütləqdir');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        image: formData.image,
        is_active: formData.is_active
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
      title={initialData ? 'Kampaniyanı düzəlt' : 'Yeni Kampaniya'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>İmtina</Button>
          <Button variant="primary" form="campaign-form" type="submit" isLoading={isSubmitting}>
            Yadda saxla
          </Button>
        </>
      }
    >
      <form id="campaign-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad <span className="text-red-500">*</span></label>
          <Input 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
            placeholder="Kampaniyanın adı"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıqlama</label>
          <Textarea 
            rows={3}
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Kampaniya haqqında məlumat..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
            Aktivdir
          </label>
        </div>
      </form>
    </Modal>
  );
};
