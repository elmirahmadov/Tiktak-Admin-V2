import { useState, useEffect, useMemo, FC } from 'react';
import { ordersAPI } from '../api';
import { useDataStore } from '../store/dataStore';
import { OrderDetailsModal } from '../components/ui/OrderDetailsModal';
import { 
  HiOutlineShoppingBag, 
  HiOutlineCurrencyDollar, 
  HiOutlineClock, 
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineMagnifyingGlass
} from 'react-icons/hi2';
import { Order } from '../types';
import toast from 'react-hot-toast';

// Atomic UI Components
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/TableSkeleton';

// Advanced Hooks
import { useDebounce } from '../hooks/useDebounce';
import { cn } from '../utils/cn';

const PAGE_SIZE = 10;

const Orders: FC = () => {
  const { orders, setOrders } = useDataStore();
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.list();
      const rawData = res.data.data || res.data.orders || res.data.items || (Array.isArray(res.data) ? res.data : []);
      // Ensure all objects have the expected fields for the filter/UI
      const data = rawData.map((item: any) => ({
        ...item,
        address: item.address || item.delivery_address || 'Ünvan qeyd olunmayıb',
        date: item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString() : ''),
        time: item.time || (item.created_at ? new Date(item.created_at).toLocaleTimeString().substring(0, 5) : ''),
      }));
      setOrders(data);
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Sifarişlər yüklənərkən xəta baş verdi');
      if (orders.length === 0) setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map((o: Order) => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    toast.success('Sifarişin statusu yeniləndi');
    // Here you would also call an API to update the status in the backend
    // await ordersAPI.update(orderId, { status: newStatus });
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'Gözləyir': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Təsdiqləndi': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Çatdırıldı': return 'bg-green-50 text-green-700 border-green-200';
      case 'Ləğv edildi': return 'bg-red-50 text-red-700 border-red-200';
      case 'Yoldadır': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o: Order) => 
      (o.address || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (o.id || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [orders, debouncedSearch]);

  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return filteredOrders.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const stats = [
    { label: 'Ümumi sifarişlər', value: filteredOrders.length.toString(), icon: <HiOutlineShoppingBag className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Gözləyən', value: filteredOrders.filter((o: Order) => o.status === 'Gözləyir').length.toString(), icon: <HiOutlineClock className="w-6 h-6 text-yellow-500" />, bg: 'bg-yellow-50' },
    { label: 'Hazırlanır', value: filteredOrders.filter((o: Order) => o.status === 'Təsdiqləndi').length.toString(), icon: <HiOutlineTruck className="w-6 h-6 text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Çatdırılan', value: filteredOrders.filter((o: Order) => o.status === 'Çatdırıldı').length.toString(), icon: <HiOutlineCheckCircle className="w-6 h-6 text-green-500" />, bg: 'bg-green-50' },
    { label: 'Ləğv edilən', value: filteredOrders.filter((o: Order) => o.status === 'Ləğv edildi').length.toString(), icon: <HiOutlineXCircle className="w-6 h-6 text-red-500" />, bg: 'bg-red-50' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Sifarişlər İdarəetməsi</h2>
          
          <div className="w-full sm:w-72">
            <Input 
              placeholder="Sifariş ID və ya Ünvanla axtarış..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<HiOutlineMagnifyingGlass className="w-5 h-5" />}
              className="w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading && orders.length === 0 ? (
            <TableSkeleton columns={8} rows={PAGE_SIZE} />
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50/50">
                  <th className="p-4 font-medium uppercase tracking-wider text-xs">No</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-xs">Tarix</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-xs">Saat</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-xs">Çatdırılma Ünvanı</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-xs">Məhsul sayı</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-xs">Məbləğ / Çatdırılma</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-xs">Status</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-xs text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-12 text-gray-400">
                      Siyahıda ən azı bir sifariş tapılmadı.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item: Order, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">#{item.id}</td>
                      <td className="p-4 text-gray-600">{item.date}</td>
                      <td className="p-4 text-gray-600 font-mono bg-gray-50 text-xs text-center rounded-lg mt-3 inline-block">{item.time}</td>
                      <td className="p-4 text-gray-800 truncate max-w-[200px]">{item.address}</td>
                      <td className="p-4 text-center">
                        <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-sm font-medium">
                          {item.itemCount}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{item.total} ₼</span>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                            {item.deliveryFee}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", getStatusClass(item.status))}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow"
                            title="Ətraflı Bax" 
                            onClick={() => setSelectedOrder(item)}
                          >
                            <HiOutlineEye className="w-5 h-5" />
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

        {!loading && filteredOrders.length > 0 && (
          <Pagination
            className="mt-6"
            currentPage={currentPage}
            totalCount={filteredOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default Orders;
