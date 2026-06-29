import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Home,
  DollarSign,
  AlertCircle,
  Clock,
  CreditCard,
  UserPlus,
  FileText,
  TrendingUp,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockTenants, mockPayments, mockRooms } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/Skeleton';
import { formatCurrency, formatDate, getDaysUntil } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const totalTenants = mockTenants.length;
  const vacantRooms = mockRooms.filter((r) => r.status === 'vacant').length;
  const totalCollected = mockPayments.reduce((sum, p) => sum + p.amount, 0);
  const unpaidAmount = mockTenants
    .filter((t) => t.status === 'UNPAID')
    .reduce((sum, t) => sum + t.monthlyRent, 0);
  const overdueTenants = mockTenants.filter((t) => t.status === 'UNPAID').length;

  const recentPayments = [...mockPayments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const upcomingContracts = mockTenants
    .filter((t) => {
      const days = getDaysUntil(t.contractEnd);
      return days <= 30 && days >= 0;
    })
    .sort((a, b) => new Date(a.contractEnd).getTime() - new Date(b.contractEnd).getTime())
    .slice(0, 5);

  const now = new Date();
  const dateTimeString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = [
    { label: t('dashboard.stats.totalTenants'), value: totalTenants, icon: Users, color: 'from-blue-400 to-blue-600' },
    { label: t('dashboard.stats.vacantRooms'), value: vacantRooms, icon: Home, color: 'from-gray-400 to-gray-600' },
    { label: t('dashboard.stats.totalCollected'), value: formatCurrency(totalCollected), icon: DollarSign, color: 'from-green-400 to-green-600' },
    { label: t('dashboard.stats.unpaidAmount'), value: formatCurrency(unpaidAmount), icon: AlertCircle, color: 'from-red-400 to-red-600', isRed: true },
    { label: t('dashboard.stats.overdueTenants'), value: overdueTenants, icon: Clock, color: 'from-orange-400 to-orange-600', isRed: true },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{t('dashboard.title')}</h1>
          <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            {dateTimeString}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass-card rounded-xl p-5 cursor-default"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                </motion.div>
              );
            })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <h2 className="text-lg font-semibold text-navy-900 mb-4">{t('dashboard.quickActions.title')}</h2>
          <div className="space-y-3">
            <QuickActionCard
              icon={CreditCard}
              title={t('dashboard.quickActions.recordPayment')}
              description={t('recordPayment.subtitle')}
              color="bg-blue-500"
              onClick={() => navigate('/record-payment')}
            />
            <QuickActionCard
              icon={UserPlus}
              title={t('dashboard.quickActions.addTenant')}
              description={t('tenants.addTenant')}
              color="bg-green-500"
              onClick={() => navigate('/tenants')}
            />
            <QuickActionCard
              icon={FileText}
              title={t('dashboard.quickActions.generateReport')}
              description={t('paymentHistory.subtitle')}
              color="bg-purple-500"
              onClick={() => navigate('/payment-history')}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-900">{t('dashboard.recentPayments')}</h2>
            <button
              onClick={() => navigate('/payment-history')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              {t('dashboard.viewAll')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900">{payment.tenantName}</p>
                        <p className="text-xs text-gray-500">
                          {t('common.room')} {payment.roomNumber} - {payment.month} {payment.year}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-navy-900">{formatCurrency(payment.amount)}</p>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-navy-900 mb-4">{t('dashboard.upcomingContracts')}</h2>
        <div className="glass-card rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : upcomingContracts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {upcomingContracts.map((tenant) => {
                const daysLeft = getDaysUntil(tenant.contractEnd);
                return (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">{t('common.room')} {tenant.roomNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{t('common.contractEnd')}</p>
                        <p className="text-sm font-medium text-navy-900">{formatDate(tenant.contractEnd)}</p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          daysLeft <= 7
                            ? 'bg-red-100 text-red-700'
                            : daysLeft <= 14
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {daysLeft} {t('dashboard.daysLeft')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{t('dashboard.noContracts')}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: typeof CreditCard;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full glass-card rounded-xl p-4 flex items-center gap-4 text-left hover:shadow-lg transition-shadow group"
    >
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-navy-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
    </motion.button>
  );
}
