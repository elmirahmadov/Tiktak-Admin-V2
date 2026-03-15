import { useState, useEffect, useMemo, FC } from 'react';
import { productsAPI, categoriesAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { HiOutlinePencilSquare, HiOutlineTrash, HiPlus, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { Product, Category } from '../types';
import toast from 'react-hot-toast';

// Atomic UI Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { DeleteModal } from '../components/ui/DeleteModal';
import { ProductForm } from '../components/forms/ProductForm';

// Advanced Hooks
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 10;

const Products: FC = () => {
  const {
    products, setProducts,
    categories, setCategories,
    addProduct, updateProduct, deleteProduct,
  } = useDataStore();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
      if (products.length === 0) setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products based on debounced search
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) =>
      (p.title || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return filteredProducts.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredProducts]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleOpenForm = (item: Product | null = null) => {
    setSelectedProduct(item);
    setShowFormModal(true);
  };

  const handleSaveProduct = async (payload: Omit<Product, 'id'>, id?: string | number) => {
    if (id) {
      await productsAPI.update(id, payload);
      updateProduct(id, { ...payload, id });
      toast.success('Məhsul uğurla yeniləndi');
    } else {
      const newId = Math.floor(Math.random() * 900000) + 100000;
      const newItem: Product = { id: newId, ...payload };
      await productsAPI.create(payload);
      addProduct(newItem);
      toast.success('Yeni məhsul əlavə edildi');
    }
    setShowFormModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await productsAPI.remove(selectedProduct.id);
      deleteProduct(selectedProduct.id);
      toast.success('Məhsul silindi');
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Silinmə zamanı xəta baş verdi');
    }
  };

  const getCategoryName = (id: string | number) => {
    const cat = categories.find((c: Category) => String(c.id) === String(id));
    return cat?.title || 'Kateqoriyasız';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Məhsullar</h2>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Axtarış..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<HiOutlineMagnifyingGlass className="w-5 h-5" />}
            className="w-full sm:w-64"
          />
          <Button onClick={() => handleOpenForm(null)}>
            <HiPlus className="w-5 h-5 mr-1" /> Yeni Məhsul
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {loading && products.length === 0 ? (
          <TableSkeleton columns={5} rows={PAGE_SIZE} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50/50">
                <th className="p-4 font-medium">Şəkil</th>
                <th className="p-4 font-medium">Ad</th>
                <th className="p-4 font-medium">Kateqoriya</th>
                <th className="p-4 font-medium">Qiymət</th>
                <th className="p-4 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-12 text-gray-400">
                    Siyahıda məhsul tapılmadı.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: Product) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img 
                          src={item.image || '/logo-mock.png'} 
                          alt={item.title || 'product'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      {item.title || 'Adsız məhsul'}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {getCategoryName(item.category_id)}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-accent">
                      {Number(item.price || 0).toFixed(2)} ₼
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
                            setSelectedProduct(item);
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

      {!loading && filteredProducts.length > 0 && (
        <Pagination
          className="mt-6"
          currentPage={currentPage}
          totalCount={filteredProducts.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {showFormModal && (
        <ProductForm 
          initialData={selectedProduct}
          categories={categories}
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveProduct}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Məhsulu Sil"
          message={`"${selectedProduct?.title}" adlı məhsulu silmək istədiyinizə əminsiniz?`}
        />
      )}
    </div>
  );
};

export default Products;