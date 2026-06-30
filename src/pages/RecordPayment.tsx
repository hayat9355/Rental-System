import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Check,
  Printer,
  X,
  Loader2,
  Banknote,
  Landmark,
  Smartphone,
  Receipt,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockTenants } from '../data/mockData';
import type { Payment, PaymentMethod } from '../types';
import { Modal } from '../components/Modal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatCurrency, getMonthName, generateId } from '../lib/utils';
import { cn } from '../lib/utils';

const paymentMethods: { value: PaymentMethod; icon: typeof Banknote; labelKey: string }[] = [
  { value: 'Cash', icon: Banknote, labelKey: 'common.paymentMethod.cash' },
  { value: 'Bank Transfer', icon: Landmark, labelKey: 'common.paymentMethod.bankTransfer' },
  { value: 'Mobile Money', icon: Smartphone, labelKey: 'common.paymentMethod.mobileMoney' },
];

export function RecordPayment() {
  const [tenants] = useLocalStorage('rental-tenants', mockTenants);
  const [, setPayments] = useLocalStorage<Payment[]>('rental-payments', []);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  const currentDay = new Date().getDate();
  const lateFee = currentDay > 5 ? 10 : 0;
  const rentAmount = selectedTenant ? selectedTenant.monthlyRent : 0;
  const totalAmount = (Number(amount) || rentAmount) + lateFee;

  const filteredTenants = useMemo(() => {
    if (!searchQuery) return tenants;
    const q = searchQuery.toLowerCase();
    return tenants.filter((t) => t.name.toLowerCase().includes(q) || t.roomNumber.includes(q));
  }, [tenants, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const paymentAmount = Number(amount) || rentAmount;
    const payment: Payment = {
      id: generateId(),
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
      roomNumber: selectedTenant.roomNumber,
      amount: paymentAmount,
      month: getMonthName(month),
      year,
      method,
      date: new Date().toISOString().split('T')[0],
      lateFee,
      status: paymentAmount >= rentAmount ? 'Paid' : 'Partial',
      notes: notes || undefined,
    };

    setPayments((prev) => [payment, ...prev]);
    setLastPayment(payment);
    setIsSubmitting(false);
    setShowReceipt(true);

    setSelectedTenantId('');
    setAmount('');
    setNotes('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{t('recordPayment.title')}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t('recordPayment.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <label className="block text-sm font-medium text-navy-900">{t('recordPayment.selectTenant')}</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setSearchQuery('');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white/60 hover:bg-white transition-colors text-left"
            >
              {selectedTenant ? (
                <>
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                    {selectedTenant.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-navy-900 text-sm">{selectedTenant.name}</p>
                    <p className="text-xs text-gray-500">{t('common.room')} {selectedTenant.roomNumber} - {formatCurrency(selectedTenant.monthlyRent)}/{t('common.month')}</p>
                  </div>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-sm">{t('recordPayment.searchTenant')}</span>
                </>
              )}
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 top-full left-0 right-0 mt-2 glass-card-strong rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('recordPayment.searchTenant')}
                        className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-primary-400"
                      />
                      <button
                        type="button"
                        onClick={() => setSearchOpen(false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredTenants.map((tenant) => (
                      <button
                        key={tenant.id}
                        type="button"
                        onClick={() => {
                          setSelectedTenantId(tenant.id);
                          setAmount(String(tenant.monthlyRent));
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                          {tenant.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-navy-900">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{t('common.room')} {tenant.roomNumber}</p>
                        </div>
                        <span className="text-sm font-medium text-navy-900">{formatCurrency(tenant.monthlyRent)}</span>
                      </button>
                    ))}
                    {filteredTenants.length === 0 && (
                      <p className="py-4 text-center text-sm text-gray-500">{t('tenants.noTenants')}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-navy-900 text-sm">{t('recordPayment.paymentDetails')}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('recordPayment.month')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-sm outline-none focus:border-primary-400"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>{getMonthName(i)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('recordPayment.year')}</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/60 text-sm outline-none focus:border-primary-400"
              >
                {[year - 1, year, year + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('recordPayment.amount')}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={selectedTenant ? String(selectedTenant.monthlyRent) : '0.00'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm"
              />
            </div>
            {selectedTenant && Number(amount) < selectedTenant.monthlyRent && Number(amount) > 0 && (
              <p className="mt-1.5 text-xs text-yellow-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t('recordPayment.partialPayment')} - {formatCurrency(selectedTenant.monthlyRent - Number(amount))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-2">{t('recordPayment.paymentMethod')}</label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const isSelected = method === pm.value;
                return (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setMethod(pm.value)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white/60 hover:border-gray-300'
                    )}
                  >
                    <Icon className={cn('w-6 h-6', isSelected ? 'text-primary-600' : 'text-gray-400')} />
                    <span className={cn('text-xs font-medium', isSelected ? 'text-primary-700' : 'text-gray-500')}>
                      {t(pm.labelKey)}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 1.2, opacity: 1 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {lateFee > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100"
            >
              <Clock className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">
                {t('recordPayment.lateFeeApplied')}
              </p>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('recordPayment.notes')}</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={t('recordPayment.notes')}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:border-primary-400 outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-navy-900 text-sm mb-4">{t('recordPayment.summary')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('recordPayment.rentAmount')}</span>
              <span className="font-medium text-navy-900">{formatCurrency(Number(amount) || rentAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('common.lateFee')}</span>
              <span className="font-medium text-red-600">{formatCurrency(lateFee)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-navy-900">{t('recordPayment.total')}</span>
                <span className="font-bold text-lg text-navy-900">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={!selectedTenant || isSubmitting}
          className="w-full py-3.5 rounded-xl gradient-icon-bg text-white font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('recordPayment.recording')}
            </>
          ) : (
            <>
              <Receipt className="w-5 h-5" />
              {t('recordPayment.record')}
            </>
          )}
        </motion.button>
      </form>

      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title={t('recordPayment.receipt.title')} size="md">
        {lastPayment && (
          <div className="print-only">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">{t('recordPayment.receipt.success')}</h3>
              <p className="text-sm text-gray-500">{t('recordPayment.receipt.receiptNumber')} #{lastPayment.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('recordPayment.receipt.tenant')}</span>
                <span className="font-medium text-navy-900">{lastPayment.tenantName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('recordPayment.receipt.room')}</span>
                <span className="font-medium text-navy-900">{lastPayment.roomNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('recordPayment.receipt.period')}</span>
                <span className="font-medium text-navy-900">{lastPayment.month} {lastPayment.year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('recordPayment.amount')}</span>
                <span className="font-medium text-navy-900">{formatCurrency(lastPayment.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('recordPayment.receipt.method')}</span>
                <span className="font-medium text-navy-900">{lastPayment.method}</span>
              </div>
              {lastPayment.lateFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('common.lateFee')}</span>
                  <span className="font-medium text-red-600">{formatCurrency(lastPayment.lateFee)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold text-navy-900">{t('recordPayment.total')}</span>
                <span className="font-bold text-navy-900">{formatCurrency(lastPayment.amount + lastPayment.lateFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('recordPayment.receipt.date')}</span>
                <span className="font-medium text-navy-900">{lastPayment.date}</span>
              </div>
            </div>

            <div className="flex gap-3 no-print">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                {t('recordPayment.receipt.print')}
              </button>
              <button
                onClick={() => {
                  setShowReceipt(false);
                  navigate('/payment-history');
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-icon-bg text-white font-medium text-sm"
              >
                <Receipt className="w-4 h-4" />
                {t('recordPayment.receipt.viewHistory')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
