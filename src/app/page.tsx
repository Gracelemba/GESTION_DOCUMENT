'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  BookOpen,
} from 'lucide-react';
import { getUtilisateurs } from '@/lib/db';
import { ensureHydrated } from '@/lib/db';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Attend le chargement des utilisateurs (Firestore) avant comparaison.
    await ensureHydrated();

    const users = getUtilisateurs();
    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        (u.motDePasse ?? '') === password
    );

    if (matchedUser) {
      localStorage.setItem('currentUser', JSON.stringify(matchedUser));
      router.push('/dashboard');
    } else {
      setError('Adresse e-mail ou mot de passe incorrect.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden items-center justify-center">
        {/* Modern ambient glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px]" />
        
        {/* Decorative thin circles */}
        <div className="absolute w-[600px] h-[600px] rounded-full border border-white/5" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-white/10" />

        <div className="relative z-10 max-w-lg text-center px-10 py-12 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
          {/* Logo container with glassmorphism */}
          <div className="mx-auto mb-8 w-32 h-32 rounded-full bg-white flex items-center justify-center p-3 shadow-2xl border border-white/20 transition-transform duration-500 hover:scale-105">
            <img src="/LOGO1-removebg-preview.png" alt="Logo RDC - MINEDU-NC / EPST" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight uppercase">
            MINEDU-NC / EPST
          </h1>
          <h2 className="text-2xl font-bold text-amber-300 mb-6 tracking-wide">
            Gestion Documentaire Scolaire
          </h2>
          
          <p className="text-blue-100/90 text-sm leading-relaxed max-w-md mx-auto">
            Plateforme officielle de numérisation, d&apos;archivage et de vérification des documents d&apos;enseignement primaire, secondaire et technique.
          </p>

          <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Serveur Sécurisé — Accès restreint aux agents autorisés</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--color-surface)]">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center flex flex-col items-center">
            <div className="mb-4 w-24 h-24 rounded-full bg-white flex items-center justify-center p-2 border border-[var(--color-border-light)] shadow-lg">
              <img src="/LOGO1-removebg-preview.png" alt="Logo RDC - MINEDU-NC / EPST" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">MINEDU-NC / EPST</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">Gestion Documentaire Scolaire</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              Connexion
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2 font-medium">
              Accédez à votre espace d&apos;administration sécurisé
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 animate-scale-in">
              <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
              >
                Adresse e-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@epst.gouv.cd"
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--color-border)] text-primary-600 focus:ring-primary-500"
                />
                <span className="text-[var(--color-text-secondary)] text-xs font-medium">Se souvenir de moi</span>
              </label>
              <button type="button" className="text-primary-600 hover:text-primary-700 font-semibold text-xs transition-colors">
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authentification...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-semibold">
            © 2026 MINEDU-NC / EPST — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
