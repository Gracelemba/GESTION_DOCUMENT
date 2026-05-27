'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import DataChatbox from '@/components/DataChatbox';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-alt)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-[260px] h-full">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[var(--color-text-primary)] shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-[260px] transition-all duration-300">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 h-12 sm:h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center px-3 sm:px-4 gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center hover:bg-[var(--color-surface-alt)] transition-colors flex-shrink-0"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-text-primary)]" />
          </button>
          <div className="flex items-center gap-2 truncate">
            <img src="/LOGO1-removebg-preview.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="text-xs sm:text-sm font-extrabold text-[var(--color-text-primary)] tracking-tight">MINEDU-NC / EPST</span>
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
      </div>
      <DataChatbox />
    </div>
  );
}
