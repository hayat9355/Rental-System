import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();

  const config: Record<string, { bg: string; text: string; label: string }> = {
    PAID: { bg: 'bg-green-100', text: 'text-green-700', label: t('common.status.paid') },
    UNPAID: { bg: 'bg-red-100', text: 'text-red-700', label: t('common.status.unpaid') },
    PARTIAL: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t('common.status.partial') },
    Paid: { bg: 'bg-green-100', text: 'text-green-700', label: t('common.status.paid') },
    Partial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t('common.status.partial') },
    Cash: { bg: 'bg-blue-100', text: 'text-blue-700', label: t('common.paymentMethod.cash') },
    'Bank Transfer': { bg: 'bg-purple-100', text: 'text-purple-700', label: t('common.paymentMethod.bankTransfer') },
    'Mobile Money': { bg: 'bg-orange-100', text: 'text-orange-700', label: t('common.paymentMethod.mobileMoney') },
    'occupied-paid': { bg: 'bg-green-100', text: 'text-green-700', label: t('common.status.paid') },
    'occupied-unpaid': { bg: 'bg-red-100', text: 'text-red-700', label: t('common.status.unpaid') },
    vacant: { bg: 'bg-gray-100', text: 'text-gray-600', label: t('common.status.vacant') },
  };

  const badgeConfig = config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        badgeConfig.bg,
        badgeConfig.text,
        className
      )}
    >
      {badgeConfig.label}
    </span>
  );
}
