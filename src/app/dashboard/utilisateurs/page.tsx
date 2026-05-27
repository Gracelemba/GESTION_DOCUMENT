'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Shield, Eye, UserCog, Trash2, X } from 'lucide-react';
import { getUtilisateurs, addUtilisateur, deleteUtilisateur, Utilisateur } from '@/lib/db';

const roleColors: Record<string, string> = {
  'Administrateur': 'bg-purple-50 text-purple-700 border-purple-200',
  'Gestionnaire': 'bg-blue-50 text-blue-700 border-blue-200',
  'Lecteur': 'bg-gray-50 text-gray-600 border-gray-200',
};

const roleIcons: Record<string, React.ElementType> = {
  'Administrateur': Shield,
  'Gestionnaire': UserCog,
  'Lecteur': Eye,
};

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Tous');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  useEffect(() => {
    loadUtilisateurs();
  }, []);

  const loadUtilisateurs = () => {
    setUtilisateurs(getUtilisateurs());
  };

  const handleOpenAdd = () => {
    setEmail('');
    setMotDePasse('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = email.split('@')[0];
    const derivedNom = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    addUtilisateur({
      nom: derivedNom,
      email,
      role: 'Gestionnaire',
      province: 'Kinshasa',
      statut: 'Actif',
      motDePasse,
    });
    setIsModalOpen(false);
    loadUtilisateurs();
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      deleteUtilisateur(id);
      loadUtilisateurs();
    }
  };

  // Filter & Search Logic
  const filteredUsers = utilisateurs.filter(u => {
    const matchesSearch = 
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.province.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = selectedRole === 'Tous' || u.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gérez les comptes, rôles et permissions des agents
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          Inviter un utilisateur
        </button>
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
              placeholder="Rechercher par nom, email, province..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="Tous">Tous les rôles</option>
            <option value="Administrateur">Administrateur</option>
            <option value="Gestionnaire">Gestionnaire</option>
            <option value="Lecteur">Lecteur</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-light)] bg-[var(--color-surface-alt)]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Rôle</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Mot de passe</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Province</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Dernière connexion</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const RoleIcon = roleIcons[u.role] || Eye;
                  return (
                    <tr key={u.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--color-text-primary)]">{u.nom}</p>
                            <p className="text-xs text-[var(--color-text-muted)] font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[u.role]}`}>
                          <RoleIcon className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[var(--color-text-secondary)]">
                        {u.motDePasse || '—'}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-secondary)]">{u.province}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.statut === 'Actif'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.statut === 'Actif' ? 'bg-green-500' : 'bg-amber-500'}`} />
                          {u.statut}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-muted)] text-xs">{u.derniereConnexion}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                    Aucun utilisateur ne correspond aux critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
              <h2 className="font-bold text-lg text-[var(--color-text-primary)]">Inviter un Utilisateur</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: jean.mukendi@epst.gouv.cd"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-border-light)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary-500/20"
                >
                  Inviter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
