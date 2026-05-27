'use client';

import { useState, useEffect } from 'react';
import { History, Search, Filter, Plus, Pencil, Download, Shield, Server, Trash2, AlertTriangle } from 'lucide-react';
import { getActivites } from '@/lib/db';

const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Pencil,
  download: Download,
  admin: Shield,
  system: Server,
  delete: AlertTriangle,
};

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-600',
  update: 'bg-blue-100 text-blue-600',
  download: 'bg-purple-100 text-purple-600',
  admin: 'bg-amber-100 text-amber-600',
  system: 'bg-gray-100 text-gray-500',
  delete: 'bg-red-100 text-red-600',
};

export default function HistoriquePage() {
  const [historique, setHistorique] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('Tous');
  const [selectedAction, setSelectedAction] = useState('Toutes');

  useEffect(() => {
    setHistorique(getActivites());
  }, []);

  // Filter & Search Logic
  const filteredHistory = historique.filter(h => {
    const matchesSearch = 
      h.user.toLowerCase().includes(search.toLowerCase()) ||
      h.action.toLowerCase().includes(search.toLowerCase()) ||
      h.target.toLowerCase().includes(search.toLowerCase());
    
    const matchesUser = selectedUser === 'Tous' || h.user === selectedUser;
    const matchesAction = selectedAction === 'Toutes' || h.type === selectedAction;

    return matchesSearch && matchesUser && matchesAction;
  });

  const users = Array.from(new Set(historique.map(h => h.user)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#4c6ef5] flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          Historique des actions
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Journal complet de toutes les actions effectuées sur la plateforme
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans l'historique..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all" 
            />
          </div>
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="Tous">Tous les utilisateurs</option>
            {users.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <select 
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="Toutes">Toutes les actions</option>
            <option value="create">Création</option>
            <option value="update">Modification</option>
            <option value="delete">Suppression</option>
            <option value="admin">Administration</option>
            <option value="system">Système</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6">
        <div className="space-y-0">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, idx) => {
              const Icon = actionIcons[item.type] || Plus;
              const colorClass = actionColors[item.type] || 'bg-gray-100 text-gray-500';
              return (
                <div key={item.id} className="flex gap-4 group">
                  {/* Timeline line & dot */}
                  <div className="flex flex-col items-center">
                    <div className={`shrink-0 w-9 h-9 rounded-lg ${colorClass} flex items-center justify-center z-10`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {idx < filteredHistory.length - 1 && (
                      <div className="w-px flex-1 bg-[var(--color-border-light)] my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`flex-1 ${idx < filteredHistory.length - 1 ? 'pb-6' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-[var(--color-text-primary)]">
                          <span className="font-semibold">{item.user}</span>
                          <span className="text-[var(--color-text-muted)]"> — </span>
                          <span className="text-[var(--color-text-secondary)]">{item.action}</span>
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.target}</p>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap ml-4">{item.time}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">Aucune action trouvée dans l&apos;historique.</p>
          )}
        </div>
      </div>
    </div>
  );
}
