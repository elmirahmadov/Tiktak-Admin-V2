import { FC, useRef } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { Order } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../utils/cn';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export const OrderDetailsModal: FC<OrderDetailsModalProps> = ({ order, onClose, onUpdateStatus }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose);

  if (!order) return null;

  const match = order.id.match(/\d+/);
  const orderIdNumber = match ? match[0] : '0';

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'Gözləyir': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Təsdiqləndi': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Çatdırıldı': return 'bg-green-100 text-green-800 border-green-200';
      case 'Ləğv edildi': return 'bg-red-100 text-red-800 border-red-200';
      case 'Yoldadır': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                0
              </span>
              <h2 className="text-xl font-bold text-gray-900">ORD-{orderIdNumber}</h2>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <select 
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-full border cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                  getStatusClass(order.status)
                )}
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
              >
                <option value="Gözləyir" className="bg-white text-gray-900">Gözləyir</option>
                <option value="Təsdiqləndi" className="bg-white text-gray-900">Təsdiqləndi</option>
                <option value="Çatdırıldı" className="bg-white text-gray-900">Çatdırıldı</option>
                <option value="Ləğv edildi" className="bg-white text-gray-900">Ləğv edildi</option>
                <option value="Yoldadır" className="bg-white text-gray-900">Yoldadır</option>
              </select>
              <div className="text-lg font-bold text-accent">
                {order.total} ₼
              </div>
            </div>
          </div>
          
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
            onClick={onClose}
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto hidden-scrollbar flex-1 bg-white">
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Sifariş Məlumatları
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-50">
              <div>
                <span className="block text-gray-500 mb-1">Tarix:</span>
                <span className="font-medium text-gray-900">{order.date} {order.time}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Çatdırılma Ünvanı:</span>
                <span className="font-medium text-gray-900">{order.address}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Telefon:</span>
                <span className="font-medium text-gray-900">+994517044018</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Ödəmə Metodu:</span>
                <span className="font-medium text-gray-900">Kart</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Məhsullar (1)
            </h3>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img src="/logo-mock.png" alt="Product" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Təbii Xiyar</div>
                  <div className="text-sm text-gray-500">Meyvələr və tərəvəzlər • 5 kq</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-accent text-lg">6.00 ₼</div>
                <div className="text-sm text-gray-500 mt-0.5">1.20 ₼/kq</div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium border border-green-100">
                Çatdırılma: Pulsuz
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
