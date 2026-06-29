import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Mail,
  Home,
  Calendar,
  CreditCard,
  Edit,
  UserX,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockTenants, mockPayments } from '../data/mockData';
import type { Tenant } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatCurrency, formatDate, getDaysUntil, getInitials } from '../lib/utils';
import { cn } from '../lib/utils';

export function TenantProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenants] = useLocalStorage<Tenant[]>('rental-tenants', mockTenants);
  const [payments] = useLocalStorage('rental-payments', mockPayments);
  const { t } = useTranslation();

  const tenant = tenants.find((t) => t.id === id);

  const tenantPayments = useMemo(() => {
    return payments
      .filter((p) => p.tenantId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, id]);

  const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOwed = tenant ? tenant.monthlyRent * 6 - totalPaid : 0;
  const nextDueDate = tenant
    ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]
    : '';

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{t('tenants.noTenants')}</p>
        <button
          onClick={() => navigate('/tenants')}
          className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  const daysUntilEnd = getDaysUntil(tenant.contractEnd);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/tenants')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-900">{tenant.name}</h1>
            <StatusBadge status={tenant.status} />
          </div>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            {t('common.room')} {tenant.roomNumber}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {getInitials(tenant.name)}
              </div>
              <div>
                <h2 className="font-semibold text-navy-900">{tenant.name}</h2>
                <p className="text-sm text-gray-500">{t('tenantProfile.tenantSince')} {formatDate(tenant.moveInDate)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <InfoRow icon={Phone} label={t('common.phone')} value={tenant.phone} />
              <InfoRow icon={Mail} label={t('common.email')} value={tenant.email || t('common.notProvided')} />
              <InfoRow icon={Home} label={t('common.room')} value={`${t('common.room')} ${tenant.roomNumber}`} />
              <InfoRow icon={DollarSign} label={t('common.monthlyRent')} value={formatCurrency(tenant.monthlyRent)} />
              <InfoRow icon={Calendar} label={t('common.contractStart')} value={formatDate(tenant.contractStart)} />
              <InfoRow icon={Calendar} label={t('common.contractEnd')} value={formatDate(tenant.contractEnd)} />
              {tenant.emergencyContact && (
                <InfoRow icon={Phone} label={t('common.emergencyContact')} value={tenant.emergencyContact} />
              )}
            </div>

            {tenant.notes && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                <p className="text-xs font-medium text-yellow-700 mb-1">{t('common.notes')}</p>
                <p className="text-sm text-yellow-800">{tenant.notes}</p>
              </div>
            )}

            <div className={cn(
              'mt-4 p-3 rounded-xl flex items-center gap-2',
              daysUntilEnd <= 30 ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'
            )}>
              {daysUntilEnd <= 30 ? (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              )}
              <p className={cn('text-sm font-medium', daysUntilEnd <= 30 ? 'text-red-700' : 'text-green-700')}>
                {daysUntilEnd <= 0
                  ? t('tenantProfile.contractStatus.expired')
                  : `${daysUntilEnd} ${t('tenantProfile.contractStatus.daysLeft')}`}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-navy-900 mb-4">{t('tenantProfile.paymentSummary')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <SummaryCard
                icon={DollarSign}
                label={t('tenantProfile.totalPaid')}
                value={formatCurrency(totalPaid)}
                color="text-green-600"
              />
              <SummaryCard
                icon={AlertCircle}
                label={t('tenantProfile.totalOwed')}
                value={formatCurrency(Math.max(0, totalOwed))}
                color="text-red-600"
              />
              <SummaryCard
                icon={Clock}
                label={t('tenantProfile.nextDue')}
                value={nextDueDate ? formatDate(nextDueDate) : 'N/A'}
                color="text-primary-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 no-print">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/record-payment')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-icon-bg text-white text-sm font-semibold shadow-lg shadow-primary-500/20"
            >
              <CreditCard className="w-4 h-4" />
              {t('tenantProfile.actions.recordPayment')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/tenants`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-navy-900 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              {t('tenantProfile.actions.editTenant')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <UserX className="w-4 h-4" />
              {t('tenantProfile.actions.moveOut')}
            </motion.button>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-navy-900">{t('tenantProfile.paymentHistory')}</h3>
            </div>
            {tenantPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('common.date')}</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('common.month')}</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('common.amount')}</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('common.method')}</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('common.lateFee')}</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tenantPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 text-sm text-gray-600">{payment.date}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">{payment.month} {payment.year}</td>
                        <td className="px-6 py-3.5 text-sm font-medium text-navy-900">{formatCurrency(payment.amount)}</td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={payment.method} />
                        </td>
                        <td className="px-6 py-3.5">
                          {payment.lateFee > 0 ? (
                            <span className="text-sm font-medium text-red-600">{formatCurrency(payment.lateFee)}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={payment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">{t('tenantProfile.noHistory')}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-navy-900">{value}</p>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center p-4 rounded-xl bg-gray-50/50">
      <Icon className={cn('w-5 h-5 mx-auto mb-2', color)} />
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={cn('text-lg font-bold', color)}>{value}</p>
    </div>
  );
}
