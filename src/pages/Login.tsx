import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoginError('');
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/');
    } else {
      setLoginError(result.error || t('login.error'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl gradient-icon-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20"
            >
              <Building2 className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-navy-900 mb-1">{t('login.title')}</h1>
            <p className="text-gray-500 text-sm">{t('login.subtitle')}</p>
          </div>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {loginError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('login.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@rental.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">{t('login.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="password123"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">{t('login.rememberMe')}</span>
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                {t('login.forgotPassword')}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl gradient-icon-bg text-white font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('login.signingIn')}
                </>
              ) : (
                t('login.signIn')
              )}
            </motion.button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
            <p className="text-xs text-center text-gray-500">
              {t('login.demo')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
