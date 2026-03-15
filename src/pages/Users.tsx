import { useState, useEffect, useMemo, FC } from 'react';
import { usersAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { HiOutlineUsers, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { User } from '../types';
import toast from 'react-hot-toast';

// Atomic UI Components
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/TableSkeleton';

// Advanced Hooks
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 10;

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { loading, setLoading } = useDataStore();
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.list();
      const data = res.data.data || res.data.users || (Array.isArray(res.data) ? res.data : []);
      setUsers(data);
    } catch (err) {
      console.error('API Error:', err);
      toast.error('İstifadəçilər yüklənərkən xəta baş verdi');
      if (users.length === 0) setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u: User) =>
      (u.full_name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [users, debouncedSearch]);

  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return filteredUsers.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">İstifadəçilər</h2>
        
        <div className="w-full sm:w-72">
          <Input 
            placeholder="Ad və ya telefonla axtarış..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<HiOutlineMagnifyingGlass className="w-5 h-5" />}
            className="w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {loading && users.length === 0 ? (
          <TableSkeleton columns={4} rows={PAGE_SIZE} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50/50">
                <th className="p-4 font-medium">İstifadəçi</th>
                <th className="p-4 font-medium">Telefon</th>
                <th className="p-4 font-medium">Rol</th>
                <th className="p-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-12 text-gray-400">
                    Siyahıda istifadəçi tapılmadı.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: User) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 overflow-hidden flex-shrink-0">
                          {item.avatar ? (
                            <img src={item.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <HiOutlineUsers className="w-5 h-5" />
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{item.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {item.phone}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                        {item.role || 'user'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        Aktiv
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filteredUsers.length > 0 && (
        <Pagination
          className="mt-6"
          currentPage={currentPage}
          totalCount={filteredUsers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Users;
