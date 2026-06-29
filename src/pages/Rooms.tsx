import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DoorOpen,
  Users,
  Home,
  CheckCircle,
  AlertCircle,
  MinusCircle,
  Eye,
  UserPlus,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockRooms, mockTenants } from '../data/mockData';
import type { Room } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal } from '../components/Modal';
import { cn } from '../lib/utils';

export function Rooms() {
  const [rooms, setRooms] = useLocalStorage<Room[]>('rental-rooms', mockRooms);
  const [tenants] = useLocalStorage('rental-tenants', mockTenants);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isVacantModalOpen, setIsVacantModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const totalRooms = rooms.length;
  const occupiedPaid = rooms.filter((r) => r.status === 'occupied-paid').length;
  const occupiedUnpaid = rooms.filter((r) => r.status === 'occupied-unpaid').length;
  const vacant = rooms.filter((r) => r.status === 'vacant').length;
  const vacancyRate = totalRooms > 0 ? ((vacant / totalRooms) * 100).toFixed(1) : '0';

  const floors = [...new Set(rooms.map((r) => r.floor))].sort();

  const handleMarkVacant = async () => {
    if (!selectedRoom) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? { ...r, status: 'vacant', tenantId: undefined, tenantName: undefined }
          : r
      )
    );
    setIsSubmitting(false);
    setIsVacantModalOpen(false);
    setSelectedRoom(null);
  };

  const handleAssignTenant = async () => {
    if (!selectedRoom || !selectedTenantId) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const tenant = tenants.find((t) => t.id === selectedTenantId);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              status: 'occupied-unpaid',
              tenantId: selectedTenantId,
              tenantName: tenant?.name,
            }
          : r
      )
    );
    setIsSubmitting(false);
    setIsAssignModalOpen(false);
    setSelectedRoom(null);
    setSelectedTenantId('');
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'occupied-paid':
        return 'border-green-400 bg-green-50/50';
      case 'occupied-unpaid':
        return 'border-red-400 bg-red-50/50';
      case 'vacant':
        return 'border-gray-300 bg-gray-50/50';
    }
  };

  const getStatusIcon = (status: Room['status']) => {
    switch (status) {
      case 'occupied-paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'occupied-unpaid':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'vacant':
        return <MinusCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: Room['status']) => {
    switch (status) {
      case 'occupied-paid':
        return t('common.status.paid');
      case 'occupied-unpaid':
        return t('common.status.unpaid');
      case 'vacant':
        return t('common.status.vacant');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{t('rooms.title')}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t('rooms.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Home} label={t('rooms.stats.totalRooms')} value={String(totalRooms)} color="from-blue-400 to-blue-600" />
        <StatCard icon={Users} label={t('rooms.stats.occupied')} value={String(occupiedPaid + occupiedUnpaid)} color="from-green-400 to-green-600" />
        <StatCard icon={DoorOpen} label={t('rooms.stats.vacant')} value={String(vacant)} color="from-gray-400 to-gray-600" />
        <StatCard icon={Home} label={t('rooms.stats.vacancyRate')} value={`${vacancyRate}%`} color="from-orange-400 to-orange-600" />
      </div>

      <div className="space-y-8">
        {floors.map((floor) => (
          <div key={floor}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('rooms.floor')} {floor}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {rooms
                .filter((r) => r.floor === floor)
                .map((room) => (
                  <motion.button
                    key={room.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsRoomModalOpen(true);
                    }}
                    className={cn(
                      'relative p-5 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-md',
                      getStatusColor(room.status)
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-navy-900">{room.number}</span>
                      {getStatusIcon(room.status)}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{room.type}</p>
                    <p className="text-sm font-medium text-navy-900">
                      {room.tenantName || t('common.status.vacant')}
                    </p>
                    {room.status !== 'vacant' && (
                      <p className="text-xs text-gray-400 mt-1">${room.monthlyRent}/{t('common.month')}</p>
                    )}
                  </motion.button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} title={`${t('rooms.roomOptions.title')} ${selectedRoom?.number}`} size="sm">
        {selectedRoom && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  selectedRoom.status === 'occupied-paid'
                    ? 'bg-green-100'
                    : selectedRoom.status === 'occupied-unpaid'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                )}
              >
                <DoorOpen
                  className={cn(
                    'w-6 h-6',
                    selectedRoom.status === 'occupied-paid'
                      ? 'text-green-600'
                      : selectedRoom.status === 'occupied-unpaid'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  )}
                />
              </div>
              <div>
                <p className="font-semibold text-navy-900">{t('rooms.roomOptions.title')} {selectedRoom.number}</p>
                <p className="text-sm text-gray-500">{selectedRoom.type} - {getStatusLabel(selectedRoom.status)}</p>
              </div>
            </div>

            {selectedRoom.tenantName && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">{t('common.tenant')}</p>
                <p className="text-sm font-medium text-navy-900">{selectedRoom.tenantName}</p>
                <p className="text-xs text-gray-500">${selectedRoom.monthlyRent}/{t('common.month')}</p>
              </div>
            )}

            <div className="space-y-2">
              {selectedRoom.status !== 'vacant' && selectedRoom.tenantId && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setIsRoomModalOpen(false);
                    navigate(`/tenants/${selectedRoom.tenantId}`);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors text-left"
                >
                  <Eye className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">{t('rooms.roomOptions.viewTenant')}</span>
                </motion.button>
              )}

              {selectedRoom.status !== 'vacant' && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setIsRoomModalOpen(false);
                    setIsVacantModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left"
                >
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700">{t('rooms.roomOptions.markVacant')}</span>
                </motion.button>
              )}

              {selectedRoom.status === 'vacant' && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setIsRoomModalOpen(false);
                    setIsAssignModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-left"
                >
                  <UserPlus className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{t('rooms.roomOptions.assignTenant')}</span>
                </motion.button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isVacantModalOpen} onClose={() => setIsVacantModalOpen(false)} title={t('rooms.roomOptions.markVacant')} size="sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('rooms.roomOptions.markVacant')}</h3>
          <p className="text-sm text-gray-500 mb-6">
            {t('rooms.markVacantConfirm')}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsVacantModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleMarkVacant}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('rooms.roomOptions.markVacant')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={t('rooms.assignTenant')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{t('rooms.selectTenant')} {selectedRoom?.number}</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tenants
              .filter((t) => !rooms.some((r) => r.tenantId === t.id))
              .map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => setSelectedTenantId(tenant.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left',
                    selectedTenantId === tenant.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                    {tenant.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-900">{tenant.name}</p>
                    <p className="text-xs text-gray-500">{t('common.room')} {tenant.roomNumber}</p>
                  </div>
                  {selectedTenantId === tenant.id && (
                    <Check className="w-5 h-5 text-primary-500" />
                  )}
                </button>
              ))}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleAssignTenant}
              disabled={!selectedTenantId || isSubmitting}
              className="px-5 py-2.5 rounded-xl gradient-icon-bg text-white font-medium text-sm hover:shadow-lg transition-shadow disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('rooms.assignTenant')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Home;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card rounded-xl p-5"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </motion.div>
  );
}
