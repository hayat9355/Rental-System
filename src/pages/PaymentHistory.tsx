import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockPayments } from '../data/mockData';
import type { Payment } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

type SortField = 'date' | 'tenantName' | 'amount' | 'month';
type SortDir = 'asc' | 'desc';

const pageSizeOptions = [10, 20, 50];
const monthOptions = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const methodOptions = ['All', 'Cash', 'Bank Transfer', 'Mobile Money'];

export function PaymentHistory() {
  const [payments] = useLocalStorage<Payment[]>('rental-payments', mockPayments);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { t } = useTranslation();

  const debouncedSearch = useDebounce(search, 300);

  const years = useMemo(() => {
    const uniqueYears = [...new Set(payments.map((p) => p.year))].sort((a, b) => b - a);
    return ['All', ...uniqueYears.map(String)];
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) => p.tenantName.toLowerCase().includes(q));
    }

    if (monthFilter !== 'All') {
      result = result.filter((p) => p.month === monthFilter);
    }

    if (yearFilter !== 'All') {
      result = result.filter((p) => String(p.year) === yearFilter);
    }

    if (methodFilter !== 'All') {
      result = result.filter((p) => p.method === methodFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'tenantName':
          comparison = a.tenantName.localeCompare(b.tenantName);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'month':
          comparison = a.month.localeCompare(b.month);
          break;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [payments, debouncedSearch, monthFilter, yearFilter, methodFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = filteredPayments.length;
  const avgPayment = totalPayments > 0 ? totalCollected / totalPayments : 0;
  const totalLateFees = filteredPayments.reduce((sum, p) => sum + p.lateFee, 0);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const exportCSV = () => {
    const headers = [
      t('paymentHistory.table.date'),
      t('paymentHistory.table.tenant'),
      t('paymentHistory.table.room'),
      t('paymentHistory.table.month'),
      t('paymentHistory.table.amount'),
      t('paymentHistory.table.method'),
      t('paymentHistory.table.lateFee'),
      t('paymentHistory.table.status'),
    ];
    const rows = filteredPayments.map((p) => [
      p.date,
      p.tenantName,
      p.roomNumber,
      `${p.month} ${p.year}`,
      p.amount,
      p.method,
      p.lateFee,
      p.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
    return <ArrowUpDown className={cn('w-3.5 h-3.5', sortDir === 'asc' ? 'text-primary-500 rotate-180' : 'text-primary-500')} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{t('paymentHistory.title')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('paymentHistory.subtitle')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-navy-900 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('paymentHistory.exportCSV')}
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label={t('paymentHistory.stats.totalCollected')} value={formatCurrency(totalCollected)} color="from-green-400 to-green-600" />
        <StatCard icon={CreditCard} label={t('paymentHistory.stats.totalPayments')} value={String(totalPayments)} color="from-blue-400 to-blue-600" />
        <StatCard icon={DollarSign} label={t('paymentHistory.stats.avgPayment')} value={formatCurrency(avgPayment)} color="from-purple-400 to-purple-600" />
        <StatCard icon={DollarSign} label={t('paymentHistory.stats.lateFees')} value={formatCurrency(totalLateFees)} color="from-red-400 to-red-600" />
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-sm outline-none focus:border-primary-400"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>{m === 'All' ? t('paymentHistory.filters.allMonths') : m}</option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-sm outline-none focus:border-primary-400"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y === 'All' ? t('paymentHistory.filters.allYears') : y}</option>
            ))}
          </select>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-sm outline-none focus:border-primary-400"
          >
            {methodOptions.map((m) => (
              <option key={m} value={m}>{m === 'All' ? t('paymentHistory.filters.allMethods') : m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => handleSort('date')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-navy-900">
                    {t('paymentHistory.table.date')} <SortIcon field="date" />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => handleSort('tenantName')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-navy-900">
                    {t('paymentHistory.table.tenant')} <SortIcon field="tenantName" />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('paymentHistory.table.room')}</th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => handleSort('month')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-navy-900">
                    {t('paymentHistory.table.month')} <SortIcon field="month" />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => handleSort('amount')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-navy-900">
                    {t('paymentHistory.table.amount')} <SortIcon field="amount" />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('paymentHistory.table.method')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('paymentHistory.table.lateFee')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('paymentHistory.table.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPayments.map((payment) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-4 text-sm text-gray-600">{payment.date}</td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-navy-900 text-sm">{payment.tenantName}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{payment.roomNumber}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{payment.month} {payment.year}</td>
                  <td className="px-5 py-4 text-sm font-medium text-navy-900">{formatCurrency(payment.amount)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={payment.method} />
                  </td>
                  <td className="px-5 py-4">
                    {payment.lateFee > 0 ? (
                      <span className="text-sm font-medium text-red-600">{formatCurrency(payment.lateFee)}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={payment.status} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedPayments.length === 0 && (
          <div className="py-12 text-center">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t('paymentHistory.noPayments')}</p>
          </div>
        )}

        {filteredPayments.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('tenants.pagination.show')}</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 rounded-lg border border-gray-200 text-sm bg-white"
              >
                {pageSizeOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
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
              <span className="text-sm text-gray-600">{t('common.pagination.page')} {page} {t('common.pagination.of')} {totalPages}</span>
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
    </div>
  );
}

function StatCard({
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
