import { useState, useEffect, useMemo, FC } from 'react';
import { categoriesAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { HiOutlinePencilSquare, HiOutlineTrash, HiPlus, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { Category } from '../types';
import toast from 'react-hot-toast';

// Atomic UI Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { DeleteModal } from '../components/ui/DeleteModal';
import { CategoryForm } from '../components/forms/CategoryForm';

// Advanced Hooks
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 10;

const Categories: FC = () => {
  const {
    categories, setCategories,
    addCategory, updateCategory, deleteCategory,
  } = useDataStore();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.list();
      const data = res.data.data || res.data.categories || (Array.isArray(res.data) ? res.data : []);
      setCategories(data);
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
      if (categories.length === 0) setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter categories based on debounced search
  const filteredCategories = useMemo(() => {
    return categories.filter((c: Category) =>
      (c.title || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [categories, debouncedSearch]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return filteredCategories.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredCategories]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleOpenForm = (item: Category | null = null) => {
    setSelectedCategory(item);
    setShowFormModal(true);
  };

  const handleSaveCategory = async (payload: Omit<Category, 'id' | 'created_at'>, id?: string | number) => {
    if (id) {
      await categoriesAPI.update(id, payload);
      updateCategory(id, { ...payload, id });
      toast.success('Kateqoriya uğurla yeniləndi');
    } else {
      const newId = Math.floor(Math.random() * 900000) + 100000;
      const newItem: Category = { id: newId, created_at: new Date().toLocaleDateString('az-AZ'), ...payload };
      await categoriesAPI.create(payload);
      addCategory(newItem);
      toast.success('Yeni kateqoriya əlavə edildi');
    }
    setShowFormModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    try {
      await categoriesAPI.remove(selectedCategory.id);
      deleteCategory(selectedCategory.id);
      toast.success('Kateqoriya silindi');
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Silinmə zamanı xəta baş verdi');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Kateqoriyalar</h2>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Axtarış..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<HiOutlineMagnifyingGlass className="w-5 h-5" />}
            className="w-full sm:w-64"
          />
          <Button onClick={() => handleOpenForm(null)}>
            <HiPlus className="w-5 h-5 mr-1" /> Yeni Kateqoriya
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {loading && categories.length === 0 ? (
          <TableSkeleton columns={6} rows={PAGE_SIZE} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50/50">
                <th className="p-4 font-medium w-16">Sıra</th>
                <th className="p-4 font-medium w-20">Şəkil</th>
                <th className="p-4 font-medium">Ad</th>
                <th className="p-4 font-medium w-1/3">Açıqlama</th>
                <th className="p-4 font-medium">Tarix</th>
                <th className="p-4 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-gray-400">
                    Siyahıda kateqoriya tapılmadı.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: Category, index: number) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-500">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img 
                          src={item.image || '/logo-mock.png'} 
                          alt={item.title || 'category'} 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = '/logo-mock.png')}
                        />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      {item.title}
                    </td>
                    <td className="p-4 text-sm text-gray-500 truncate max-w-[200px]">
                      {item.description || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {item.created_at || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzəlt"
                          onClick={() => handleOpenForm(item)}
                        >
                          <HiOutlinePencilSquare className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                          onClick={() => {
                            setSelectedCategory(item);
                            setShowDeleteModal(true);
                          }}
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filteredCategories.length > 0 && (
        <Pagination
          className="mt-6"
          currentPage={currentPage}
          totalCount={filteredCategories.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {showFormModal && (
        <CategoryForm 
          initialData={selectedCategory}
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveCategory}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCategory(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Kateqoriyanı Sil"
          message={`"${selectedCategory?.title}" adlı kateqoriyanı silmək istədiyinizə əminsiniz?`}
        />
      )}
    </div>
  );
};

export default Categories;
