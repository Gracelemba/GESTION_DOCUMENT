'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BookCopy,
  Mail,
  Users,
  Settings,
  History,
  Bell,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  LogOut,
  Loader2,
  Search,
  School,
} from 'lucide-react';

const navItems = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Bulletins', href: '/dashboard/bulletins', icon: FileText },
  { label: 'Fiches', href: '/dashboard/fiches', icon: ClipboardList },
  { label: 'Souches', href: '/dashboard/souches', icon: BookCopy },
  { label: 'carte eleves', href: '/dashboard/carnets', icon: BookOpen },
];

const adminItems = [
  { label: 'Utilisateurs', href: '/dashboard/utilisateurs', icon: Users },
  { label: 'Historique', href: '/dashboard/historique', icon: History },
  { label: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const filteredAdminItems = adminItems.filter(item => {
    if (currentUser?.role === 'Gestionnaire' && item.label === 'Utilisateurs') {
      return false;
    }
    return true;
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    if (isLoggingOut) return;

    // Déconnexion immédiate, sans confirmation bloquante.
    setIsLoggingOut(true);
    localStorage.removeItem('currentUser');

    // Petit délai pour laisser voir l'animation sans ralentir l'action.
    setTimeout(() => router.push('/'), 150);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen flex flex-col
        bg-[var(--color-surface)] border-r border-[var(--color-border)]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
      style={{ boxShadow: 'var(--shadow-sidebar)' }}
    >
      {/* Header */}
      <div className={`flex items-center h-20 px-4 border-b border-[var(--color-border)] ${collapsed ? 'justify-center' : 'gap-3 bg-gradient-to-r from-slate-50/50 to-transparent'}`}>
        <div className="shrink-0 w-11 h-11 rounded-full bg-white flex items-center justify-center p-1 border border-[var(--color-border-light)] shadow-sm">
          <img src="/LOGO1-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="text-sm font-extrabold text-[var(--color-text-primary)] whitespace-nowrap tracking-tight">MINEDU-NC / EPST</h1>
            <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider whitespace-nowrap">Gestion Documentaire</p>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <p className={`text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 ${collapsed ? 'text-center' : 'px-3'}`}>
          {collapsed ? '-' : 'Navigation'}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${collapsed ? 'justify-center' : ''}
                ${active
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                }
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary-600' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        <div className="my-4 border-t border-[var(--color-border-light)]" />

        <p className={`text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 ${collapsed ? 'text-center' : 'px-3'}`}>
          {collapsed ? '-' : 'Administration'}
        </p>
        {filteredAdminItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${collapsed ? 'justify-center' : ''}
                ${active
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                }
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary-600' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] p-3 space-y-2">
        {/* Notifications shortcut */}
        <Link
          href="/dashboard/notifications"
          onClick={onNavigate}
          title="Notifications"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--color-error)] rounded-full border-2 border-[var(--color-surface)]" />
          </div>
          {!collapsed && <span>Notifications</span>}
        </Link>

        {/* User */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-surface-alt)] ${collapsed ? 'justify-center' : ''}`}>
          <div className="shrink-0 w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-white text-xs font-bold">
            {currentUser?.nom ? currentUser.nom.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{currentUser?.nom || 'Admin EPST'}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] truncate">{currentUser?.email || 'admin@epst.gouv.cd'}</p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            title="Déconnexion"
            aria-disabled={isLoggingOut}
            disabled={isLoggingOut}
            className={`
              relative inline-flex items-center justify-center
              group gap-2 px-3 py-2 rounded-xl transition-all duration-200
              text-[var(--color-text-secondary)]
              hover:text-[var(--color-error)] hover:bg-red-50 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:ring-offset-1
              active:scale-[0.98]
              ${isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {isLoggingOut ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <LogOut className="w-4.5 h-4.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            )}
            {!collapsed && <span className="text-sm font-semibold whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:shadow-md transition-all z-50"
        aria-label={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
