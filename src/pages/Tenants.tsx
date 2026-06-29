import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockTenants, mockRooms } from '../data/mockData';
import type { Tenant } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatCurrency, formatDate, getInitials, generateId } from '../lib/utils';

const tenantSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(5, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  roomNumber: z.string().min(1, 'Room is required'),
  monthlyRent: z.number().min(1, 'Rent must be greater than 0'),
  contractStart: z.string().min(1, 'Start date is required'),
  contractEnd: z.string().min(1, 'End date is required'),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

const filterOptions = ['All', 'Active', 'Inactive', 'Overdue'] as const;
type FilterOption = (typeof filterOptions)[number];

const pageSizeOptions = [10, 20, 50];

export function Tenants() {
  const [tenants, setTenants] = useLocalStorage<Tenant[]>('rental-tenants', mockTenants);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOption>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const debouncedSearch = useDebounce(search, 300);

  const filteredTenants = useMemo(() => {
    let result = [...tenants];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.roomNumber.toLowerCase().includes(q) ||
          t.phone.includes(q)
      );
    }

    if (filter === 'Active') {
      result = result.filter((t) => t.status === 'PAID');
    } else if (filter === 'Inactive') {
      result = result.filter((t) => t.status === 'UNPAID');
    } else if (filter === 'Overdue') {
      result = result.filter((t) => t.status === 'UNPAID');
    }

    return result;
  }, [tenants, debouncedSearch, filter]);

  const totalPages = Math.ceil(filteredTenants.length / pageSize);
  const paginatedTenants = filteredTenants.slice((page - 1) * pageSize, page * pageSize);

  const handleAdd = async (data: TenantFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newTenant: Tenant = {
      id: generateId(),
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      roomNumber: data.roomNumber,
      monthlyRent: Number(data.monthlyRent),
      contractStart: data.contractStart,
      contractEnd: data.contractEnd,
      emergencyContact: data.emergencyContact || undefined,
      notes: data.notes || undefined,
      status: 'UNPAID',
      moveInDate: data.contractStart,
    };

    setTenants((prev) => [...prev, newTenant]);
    setIsSubmitting(false);
    setIsAddModalOpen(false);
  };

  const handleEdit = async (data: TenantFormData) => {
    if (!selectedTenant) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    setTenants((prev) =>
      prev.map((t) =>
        t.id === selectedTenant.id
          ? {
              ...t,
              name: data.name,
              phone: data.phone,
              email: data.email || undefined,
              roomNumber: data.roomNumber,
              monthlyRent: Number(data.monthlyRent),
              contractStart: data.contractStart,
              contractEnd: data.contractEnd,
              emergencyContact: data.emergencyContact || undefined,
              notes: data.notes || undefined,
              moveInDate: data.contractStart,
            }
          : t
      )
    );
    setIsSubmitting(false);
    setIsEditModalOpen(false);
    setSelectedTenant(null);
  };

  const handleDelete = async () => {
    if (!selectedTenant) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setTenants((prev) => prev.filter((t) => t.id !== selectedTenant.id));
    setIsSubmitting(false);
    setIsDeleteModalOpen(false);
    setSelectedTenant(null);
  };

  const filterLabels: Record<string, string> = {
    All: t('tenants.filter.all'),
    Active: t('tenants.filter.active'),
    Inactive: t('tenants.filter.inactive'),
    Overdue: t('tenants.filter.overdue'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-900">{t('tenants.title')}</h1>
          <span className="px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
            {filteredTenants.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-icon-bg text-white text-sm font-semibold shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          {t('tenants.addTenant')}
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('common.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as FilterOption);
              setPage(1);
            }}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm appearance-none cursor-pointer"
          >
            {filterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {filterLabels[opt]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('tenants.table.room')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('tenants.table.tenant')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('tenants.table.phone')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('tenants.table.rent')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('tenants.table.status')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('tenants.table.contractEnd')}</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('tenants.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {paginatedTenants.map((tenant) => (
                  <motion.tr
                    key={tenant.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                  >
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                        {tenant.roomNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                          {getInitials(tenant.name)}
                        </div>
                        <span className="font-medium text-navy-900 text-sm">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell">{tenant.phone}</td>
                    <td className="px-5 py-4 text-sm font-medium text-navy-900">{formatCurrency(tenant.monthlyRent)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden lg:table-cell">{formatDate(tenant.contractEnd)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tenants/${tenant.id}`);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTenant(tenant);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTenant(tenant);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {paginatedTenants.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t('tenants.noTenants')}</p>
          </div>
        )}

        {filteredTenants.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('tenants.pagination.show')}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-gray-200 text-sm bg-white"
              >
                {pageSizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">{t('tenants.pagination.entries')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {t('common.pagination.page')} {page} {t('common.pagination.of')} {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('tenants.addModal.title')}>
        <TenantFormComponent
          onSubmit={handleAdd}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('tenants.addModal.editTitle')}>
        {selectedTenant && (
          <TenantFormComponent
            tenant={selectedTenant}
            onSubmit={handleEdit}
            onCancel={() => setIsEditModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('tenants.deleteModal.title')} size="sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('tenants.deleteModal.title')}</h3>
          <p className="text-sm text-gray-500 mb-6">
            {t('tenants.deleteModal.confirm')}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TenantFormComponent({
  tenant,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  tenant?: Tenant;
  onSubmit: (data: TenantFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant
      ? {
          name: tenant.name,
          phone: tenant.phone,
          email: tenant.email || '',
          roomNumber: tenant.roomNumber,
          monthlyRent: tenant.monthlyRent,
          contractStart: tenant.contractStart,
          contractEnd: tenant.contractEnd,
          emergencyContact: tenant.emergencyContact || '',
          notes: tenant.notes || '',
        }
      : {
          name: '',
          phone: '',
          email: '',
          roomNumber: '',
          monthlyRent: 0,
          contractStart: '',
          contractEnd: '',
          emergencyContact: '',
          notes: '',
        },
  });

  const onFormSubmit = (data: TenantFormData) => {
    onSubmit(data);
  };

  const vacantRooms = mockRooms.filter((r) => r.status === 'vacant');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.fullName')}</label>
          <input {...register('name')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.phone')}</label>
          <input {...register('phone')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm" />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.email')}</label>
        <input {...register('email')} type="email" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm" />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.room')}</label>
          <select {...register('roomNumber')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm">
            <option value="">{t('common.selectRoom')}</option>
            {vacantRooms.map((r) => (
              <option key={r.id} value={r.number}>
                {r.number} - {r.type} (${r.monthlyRent})
              </option>
            ))}
            {tenant && <option value={tenant.roomNumber}>{tenant.roomNumber} (current)</option>}
          </select>
          {errors.roomNumber && <p className="mt-1 text-xs text-red-500">{errors.roomNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.monthlyRent')}</label>
          <input {...register('monthlyRent', { valueAsNumber: true })} type="number" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm" />
          {errors.monthlyRent && <p className="mt-1 text-xs text-red-500">{errors.monthlyRent.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.contractStart')}</label>
          <input {...register('contractStart')} type="date" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm" />
          {errors.contractStart && <p className="mt-1 text-xs text-red-500">{errors.contractStart.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.contractEnd')}</label>
          <input {...register('contractEnd')} type="date" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm" />
          {errors.contractEnd && <p className="mt-1 text-xs text-red-500">{errors.contractEnd.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.emergencyContact')}</label>
        <input {...register('emergencyContact')} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('tenants.addModal.notes')}</label>
        <textarea {...register('notes')} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm resize-none" />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl gradient-icon-bg text-white font-medium text-sm hover:shadow-lg transition-shadow disabled:opacity-70 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {tenant ? t('common.save') : t('common.add')}
        </button>
      </div>
    </form>
  );
}
