'use client';

import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2, Check, Trash2 } from 'lucide-react';
import { getNotifications, saveNotifications, markAllNotificationsRead, Notification } from '@/lib/db';

const iconMap: Record<string, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
};

const colorMap: Record<string, string> = {
  info: 'bg-blue-100 text-blue-600 border-blue-200',
  warning: 'bg-amber-100 text-amber-600 border-amber-200',
  success: 'bg-green-100 text-green-600 border-green-200',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  };

  const handleClearAll = () => {
    if (confirm('Voulez-vous vraiment supprimer toutes les notifications ?')) {
      saveNotifications([]);
      setNotifications([]);
    }
  };

  const handleToggleRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    saveNotifications(updated);
    setNotifications(updated);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#f87171] flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Centre de Notifications
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gérez vos alertes système et messages administratifs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
          >
            <Check className="w-4 h-4" />
            Tout marquer lu
          </button>
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Tout effacer
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 animate-fade-in">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Info;
            return (
              <div
                key={notif.id}
                onClick={() => handleToggleRead(notif.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  notif.read
                    ? 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-border)] shadow-sm'
                    : 'border-primary-200 bg-primary-50/50 shadow-md'
                }`}
              >
                {!notif.read && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary-500" />
                )}
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[notif.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-bold text-[var(--color-text-primary)] text-base">{notif.title}</h3>
                      <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">{notif.content}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[notif.type]}`}>
                        {notif.type.toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const filtered = notifications.filter(n => n.id !== notif.id);
                          saveNotifications(filtered);
                          setNotifications(filtered);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Aucune notification</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Vous êtes à jour ! Aucune nouvelle notification pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
