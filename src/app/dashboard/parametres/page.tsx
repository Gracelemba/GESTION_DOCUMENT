'use client';

import { useRouter } from 'next/navigation';
import { Settings, MapPin, School, GraduationCap, CalendarDays } from 'lucide-react';

const provinces = [
  'Kinshasa', 'Haut-Katanga', 'Nord-Kivu', 'Sud-Kivu', 'Kongo-Central',
  'Kasaï-Central', 'Kasaï-Oriental', 'Équateur', 'Ituri', 'Tshopo',
  'Maniema', 'Tanganyika', 'Haut-Lomami', 'Lomami', 'Lualaba',
  'Sankuru', 'Bas-Uélé', 'Haut-Uélé', 'Mongala', 'Nord-Ubangi',
  'Sud-Ubangi', 'Tshuapa', 'Kwango', 'Kwilu', 'Maï-Ndombe', 'Kasaï',
];

const anneesScolaires = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];

const classes = [
  '1ère Primaire', '2ème Primaire', '3ème Primaire', '4ème Primaire', '5ème Primaire', '6ème Primaire',
  '1ère Secondaire', '2ème Secondaire', '3ème Secondaire', '4ème Secondaire', '5ème Secondaire', '6ème Secondaire',
];

export default function ParametresPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#64748b] to-[#94a3b8] flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          Paramètres généraux
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Configuration des listes de référence — provinces, écoles, classes, années scolaires
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provinces */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Provinces</h2>
              <p className="text-xs text-[var(--color-text-muted)]">{provinces.length} provinces enregistrées</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {provinces.map((p) => (
              <span key={p} className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)] hover:border-primary-300 hover:text-primary-600 transition-all cursor-default">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Classes */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Classes</h2>
              <p className="text-xs text-[var(--color-text-muted)]">{classes.length} niveaux configurés</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {classes.map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)] hover:border-green-300 hover:text-green-600 transition-all cursor-default">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Années scolaires */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Années scolaires</h2>
              <p className="text-xs text-[var(--color-text-muted)]">{anneesScolaires.length} années enregistrées</p>
            </div>
          </div>
          <div className="space-y-2">
            {anneesScolaires.map((a, i) => (
              <div key={a} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                i === 0
                  ? 'border-primary-200 bg-primary-50/50'
                  : 'border-[var(--color-border-light)] bg-[var(--color-surface-alt)]'
              }`}>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{a}</span>
                {i === 0 && (
                  <span className="text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
                    EN COURS
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
