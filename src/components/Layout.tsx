import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  History,
  AlertTriangle,
  DoorOpen,
  Search,
  Menu,
  LogOut,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { GlobalSearch } from './GlobalSearch';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '../lib/utils';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', label: t('common.nav.dashboard'), icon: LayoutDashboard },
    { path: '/tenants', label: t('common.nav.tenants'), icon: Users },
    { path: '/record-payment', label: t('common.nav.recordPayment'), icon: CreditCard },
    { path: '/payment-history', label: t('common.nav.paymentHistory'), icon: History },
    { path: '/unpaid-report', label: t('common.nav.unpaidReport'), icon: AlertTriangle },
    { path: '/rooms', label: t('common.nav.rooms'), icon: DoorOpen },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 z-50 glass-card-strong border-r border-white/30 flex flex-col',
          'lg:translate-x-0 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl gradient-icon-bg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-navy-900 text-lg leading-tight">{t('sidebar.appName')}</h1>
            <p className="text-xs text-gray-500">{t('sidebar.appSubtitle')}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-navy-900'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500')} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute right-3">
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-600">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-900 truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@rental.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {t('sidebar.signOut')}
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass-card-strong border-b border-white/30 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-500 border border-gray-200"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.search')}...</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs text-gray-400 font-mono">
                  Ctrl K
                </kbd>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
