import { useState, useEffect, useMemo, FC } from 'react';
import { campaignsAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { HiOutlinePencilSquare, HiOutlineTrash, HiPlus, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { Campaign } from '../types';
import toast from 'react-hot-toast';

// Atomic UI Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { DeleteModal } from '../components/ui/DeleteModal';
import { CampaignForm } from '../components/forms/CampaignForm';

// Advanced Hooks
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 10;

const Campaigns: FC = () => {
  const {
    campaigns, setCampaigns,
    addCampaign, updateCampaign, deleteCampaign,
  } = useDataStore();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await campaignsAPI.list();
      const data = res.data.data || res.data.campaigns || (Array.isArray(res.data) ? res.data : []);
      setCampaigns(data);
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Kampaniyalar yüklənərkən xəta baş verdi');
      if (campaigns.length === 0) setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter campaigns based on debounced search
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c: Campaign) =>
      (c.title || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [campaigns, debouncedSearch]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return filteredCampaigns.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredCampaigns]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleOpenForm = (item: Campaign | null = null) => {
    setSelectedCampaign(item);
    setShowFormModal(true);
  };

  const handleSaveCampaign = async (payload: Omit<Campaign, 'id'>, id?: string | number) => {
    if (id) {
      await campaignsAPI.update(id, payload);
      updateCampaign(id, { ...payload, id });
      toast.success('Kampaniya uğurla yeniləndi');
    } else {
      const newId = Math.floor(Math.random() * 900000) + 100000;
      const newItem: Campaign = { id: newId, ...payload };
      await campaignsAPI.create(payload);
      addCampaign(newItem);
      toast.success('Yeni kampaniya əlavə edildi');
    }
    setShowFormModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCampaign) return;
    try {
      await campaignsAPI.remove(selectedCampaign.id);
      deleteCampaign(selectedCampaign.id);
      toast.success('Kampaniya silindi');
      setShowDeleteModal(false);
      setSelectedCampaign(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Silinmə zamanı xəta baş verdi');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Kampaniyalar</h2>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Axtarış..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<HiOutlineMagnifyingGlass className="w-5 h-5" />}
            className="w-full sm:w-64"
          />
          <Button onClick={() => handleOpenForm(null)}>
            <HiPlus className="w-5 h-5 mr-1" /> Yeni Kampaniya
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {loading && campaigns.length === 0 ? (
          <TableSkeleton columns={4} rows={PAGE_SIZE} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50/50">
                <th className="p-4 font-medium">Başlıq</th>
                <th className="p-4 font-medium w-1/2">Açıqlama</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-12 text-gray-400">
                    Siyahıda kampaniya tapılmadı.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: Campaign) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">
                      {item.title}
                    </td>
                    <td className="p-4 text-sm text-gray-500 truncate max-w-sm">
                      {item.description || '-'}
                    </td>
                    <td className="p-4">
                      {item.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Passiv
                        </span>
                      )}
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
                            setSelectedCampaign(item);
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

      {!loading && filteredCampaigns.length > 0 && (
        <Pagination
          className="mt-6"
          currentPage={currentPage}
          totalCount={filteredCampaigns.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {showFormModal && (
        <CampaignForm 
          initialData={selectedCampaign}
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveCampaign}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCampaign(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Kampaniyanı Sil"
          message={`"${selectedCampaign?.title}" adlı kampaniyanı silmək istədiyinizə əminsiniz?`}
        />
      )}
    </div>
  );
};

export default Campaigns;
