import { useState } from 'react';
import { uploadAPI } from '../api';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadAPI.upload(formData);
      const url =
        res.data?.url ||
        res.data?.data?.url ||
        res.data?.img_url ||
        res.data?.data?.img_url ||
        res.data?.path ||
        res.data?.data?.path ||
        '';
      setImageUrl(url);
      return url;
    } catch (err) {
      console.error('[Upload] Error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => setImageUrl('');

  return { uploading, imageUrl, setImageUrl, uploadImage, reset };
};
