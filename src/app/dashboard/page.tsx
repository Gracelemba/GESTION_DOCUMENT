'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  FileText,
  ClipboardList,
  BookCopy,
  BookOpen,
  ArrowUpRight,
  Plus,
  Pencil,
  Download,
  Shield,
  Server,
  Info,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  getDocuments,
  getNotifications,
  getActivites,
  getEcoles,
  markAllNotificationsRead,
} from '@/lib/db';

/* ===== Helpers ===== */
const iconMap: Record<string, React.ElementType> = {
  bulletin: FileText,
  fiche: ClipboardList,
  souche: BookCopy,
  courrier: BookOpen,
};

const colorMap: Record<string, string> = {
  bulletin: 'from-[#3b82f6] to-[#60a5fa]',
  fiche: 'from-[#12b886] to-[#38d9a9]',
  souche: 'from-[#f59e0b] to-[#fbbf24]',
  courrier: 'from-[#ef4444] to-[#f87171]',
};

const activityIconMap: Record<string, React.ElementType> = {
  create: Plus,
  update: Pencil,
  download: Download,
  admin: Shield,
  system: Server,
  delete: AlertTriangle,
};

const activityColorMap: Record<string, string> = {
  create: 'bg-green-100 text-green-600',
  update: 'bg-blue-100 text-blue-600',
  download: 'bg-purple-100 text-purple-600',
  admin: 'bg-amber-100 text-amber-600',
  system: 'bg-gray-100 text-gray-500',
  delete: 'bg-red-100 text-red-600',
};

const notifIconMap: Record<string, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
};

const notifColorMap: Record<string, string> = {
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-green-100 text-green-600',
};

/* ===== Custom Tooltip ===== */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-[var(--color-border)] p-3 min-w-[160px]">
      <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-xs py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activites, setActivites] = useState<any[]>([]);

  useEffect(() => {
    setDocuments(getDocuments());
    setNotifications(getNotifications());
    setActivites(getActivites());
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  };

  const countByType = (type: string) => documents.filter((d) => d.type === type).length;

  const stats = [
    { label: 'Total Documents', value: documents.length, change: '+1.8%', trend: 'up', color: 'bulletin', icon: FileText },
    { label: 'Bulletins scolaires', value: countByType('bulletin'), change: '+1.6%', trend: 'up', color: 'bulletin', icon: FileText },
    { label: 'Fiches élèves', value: countByType('fiche'), change: '+1.7%', trend: 'up', color: 'fiche', icon: ClipboardList },
    { label: 'Souches de série', value: countByType('souche'), change: '+2.0%', trend: 'up', color: 'souche', icon: BookCopy },
    { label: 'Carnet des Étudiants', value: countByType('courrier'), change: '+2.9%', trend: 'up', color: 'courrier', icon: BookOpen },
  ];

  // Static chart data (can be replaced dynamically later)
  const chartDataMonthly = [
    { mois: 'Jan', bulletins: 400, fiches: 240, souches: 200, carnets: 120 },
    { mois: 'Fév', bulletins: 450, fiches: 280, souches: 220, carnets: 140 },
    { mois: 'Mar', bulletins: 420, fiches: 320, souches: 210, carnets: 130 },
    { mois: 'Avr', bulletins: 500, fiches: 380, souches: 240, carnets: 180 },
    { mois: 'Mai', bulletins: 560, fiches: 340, souches: 260, carnets: 200 },
    { mois: 'Jun', bulletins: 640, fiches: 400, souches: 300, carnets: 220 },
  ];

  const distribution = [
    { name: 'Bulletins', value: countByType('bulletin'), color: '#3b82f6' },
    { name: 'Fiches', value: countByType('fiche'), color: '#12b886' },
    { name: 'Souches', value: countByType('souche'), color: '#f59e0b' },
    { name: 'Carnets Étudiants', value: countByType('courrier'), color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Group by province
  const provinceCounts: Record<string, number> = {};
  documents.forEach((d) => {
    provinceCounts[d.province] = (provinceCounts[d.province] || 0) + 1;
  });

  const provincesData = Object.entries(provinceCounts)
    .map(([province, count]) => ({
      province,
      count,
      percent: documents.length > 0 ? (count / documents.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Tableau de bord
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Vue d&apos;ensemble de la gestion documentaire - Année scolaire 2025-2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all">
            <Calendar className="w-4 h-4" />
            <span>Mai 2026</span>
          </button>
          <button 
            onClick={() => router.push('/dashboard/bulletins')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau document</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 stagger-children">
        {stats.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group relative bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border-light)] hover:border-[var(--color-border)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[card.color]} opacity-80`} />

              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[card.color]} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{card.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{card.label}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">+12 ce mois</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area Chart - Evolution */}
        <div className="xl:col-span-2 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                Évolution des importations
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Nombre de documents par mois</p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-semibold">+12.5%</span>
              <span className="text-[var(--color-text-muted)] ml-1">vs année précédente</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartDataMonthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBulletins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4c6ef5" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4c6ef5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFiches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#20c997" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#20c997" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSouches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCarnets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bulletins" name="Bulletins" stroke="#4c6ef5" strokeWidth={2} fill="url(#gradBulletins)" />
              <Area type="monotone" dataKey="fiches" name="Fiches" stroke="#20c997" strokeWidth={2} fill="url(#gradFiches)" />
              <Area type="monotone" dataKey="souches" name="Souches" stroke="#f59e0b" strokeWidth={2} fill="url(#gradSouches)" />
              <Area type="monotone" dataKey="carnets" name="Carnets des Étudiants" stroke="#ef4444" strokeWidth={2} fill="url(#gradCarnets)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Distribution */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6 animate-fade-in">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
            Répartition par type
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">Distribution des documents</p>
          {distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [Number(value || 0).toLocaleString('fr-FR'), '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-xs text-[var(--color-text-secondary)]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
              Aucun document importé.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Province + Activity + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Province distribution */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Par province</h2>
            <Link href="/dashboard/bulletins" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5">
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {provincesData.slice(0, 7).map((item) => (
              <div key={item.province}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[var(--color-text-secondary)] text-xs">{item.province}</span>
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {item.count.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--color-surface-alt)] overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-700 ease-out"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
            {provincesData.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-6">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Activités récentes</h2>
            <Link href="/dashboard/historique" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5">
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {activites.slice(0, 5).map((activity) => {
              const Icon = activityIconMap[activity.type] || Plus;
              const colorClass = activityColorMap[activity.type] || 'bg-gray-100 text-gray-500';
              return (
                <div key={activity.id} className="flex items-start gap-3 group">
                  <div className={`shrink-0 w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)] leading-snug">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      <span className="text-[var(--color-text-secondary)]">{activity.action}</span>
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{activity.target}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-[var(--color-text-muted)] whitespace-nowrap pt-0.5">{activity.time}</span>
                </div>
              );
            })}
            {activites.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-6">Aucune activité récente</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Notifications</h2>
              <span className="text-[10px] font-bold text-white bg-[var(--color-error)] rounded-full px-1.5 py-0.5 leading-none">
                {notifications.filter((n) => !n.read).length}
              </span>
            </div>
            <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Tout marquer lu</button>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => {
              const Icon = notifIconMap[notif.type] || Info;
              const colorClass = notifColorMap[notif.type] || 'bg-blue-100 text-blue-600';
              return (
                <div
                  key={notif.id}
                  onClick={() => router.push('/dashboard/notifications')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                    notif.read
                      ? 'border-[var(--color-border-light)] bg-[var(--color-surface)]'
                      : 'border-primary-200 bg-primary-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{notif.title}</p>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">{notif.content}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-6">Aucune notification</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
