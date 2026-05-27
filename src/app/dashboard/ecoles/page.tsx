'use client';

import { useState, useEffect } from 'react';
import { School, Plus, Search, Filter, Pencil, Trash2, X, GraduationCap, MapPin } from 'lucide-react';
import { getEcoles, addEcole, updateEcole, deleteEcole, Ecole } from '@/lib/db';

export default function EcolesPage() {
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Toutes');
  const [selectedType, setSelectedType] = useState('Tous');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEcole, setEditingEcole] = useState<Ecole | null>(null);

  // Form states
  const [nom, setNom] = useState('');
  const [province, setProvince] = useState('Kinshasa');
  const [commune, setCommune] = useState('');
  const [adresse, setAdresse] = useState('');
  const [type, setType] = useState<'Public' | 'Privé agréé'>('Public');
  const [codeDirect, setCodeDirect] = useState('');

  useEffect(() => {
    setEcoles(getEcoles());
  }, []);

  const refreshList = () => {
    setEcoles(getEcoles());
  };

  const handleOpenAddModal = () => {
    setEditingEcole(null);
    setNom('');
    setProvince('Kinshasa');
    setCommune('');
    setAdresse('');
    setType('Public');
    setCodeDirect('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ecole: Ecole) => {
    setEditingEcole(ecole);
    setNom(ecole.nom);
    setProvince(ecole.province);
    setCommune(ecole.commune);
    setAdresse(ecole.adresse);
    setType(ecole.type);
    setCodeDirect(ecole.codeDirect);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEcole) {
      updateEcole(editingEcole.id, { nom, province, commune, adresse, type, codeDirect });
    } else {
      addEcole({ nom, province, commune, adresse, type, codeDirect });
    }
    setIsModalOpen(false);
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette école ?')) {
      deleteEcole(id);
      refreshList();
    }
  };

  // Filter & Search logic
  const filteredEcoles = ecoles.filter((e) => {
    const matchesSearch =
      e.nom.toLowerCase().includes(search.toLowerCase()) ||
      e.codeDirect.toLowerCase().includes(search.toLowerCase()) ||
      e.commune.toLowerCase().includes(search.toLowerCase());
    const matchesProvince = selectedProvince === 'Toutes' || e.province === selectedProvince;
    const matchesType = selectedType === 'Tous' || e.type === selectedType;
    return matchesSearch && matchesProvince && matchesType;
  });

  const provinces = Array.from(new Set(ecoles.map((e) => e.province)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4c6ef5] to-[#748ffc] flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            Gestion des Écoles
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gérez la liste de référence nationale des établissements d&apos;enseignement
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          Ajouter une école
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
              placeholder="Rechercher par nom, code, commune..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="Toutes">Toutes les provinces</option>
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="Tous">Tous les types</option>
            <option value="Public">Public</option>
            <option value="Privé agréé">Privé agréé</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {filteredEcoles.length > 0 ? (
          filteredEcoles.map((ecole) => (
            <div
              key={ecole.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:border-[var(--color-border)] rounded-2xl p-5 hover:shadow-[var(--shadow-card-hover)] transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditModal(ecole)}
                    className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-primary-50 hover:text-primary-600 transition-all"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ecole.id)}
                    className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-[var(--color-text-primary)] text-lg mb-1">{ecole.nom}</h3>
              <p className="text-xs text-[var(--color-text-muted)] font-mono mb-4">{ecole.codeDirect}</p>

              <div className="space-y-2 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border-light)] pt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span>
                    {ecole.province} — {ecole.commune}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      ecole.type === 'Public'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                  >
                    {ecole.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-[var(--color-text-muted)]">
            Aucune école trouvée avec ces critères.
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
              <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
                {editingEcole ? 'Modifier l\'école' : 'Ajouter une école'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                  Nom de l&apos;école
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex: Institut Bosangani"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                    Province
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    <option value="Kinshasa">Kinshasa</option>
                    <option value="Haut-Katanga">Haut-Katanga</option>
                    <option value="Nord-Kivu">Nord-Kivu</option>
                    <option value="Sud-Kivu">Sud-Kivu</option>
                    <option value="Kongo-Central">Kongo-Central</option>
                    <option value="Kasaï-Central">Kasaï-Central</option>
                    <option value="Équateur">Équateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                    Commune / Ville
                  </label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="ex: Gombe"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                  Adresse physique
                </label>
                <input
                  type="text"
                  required
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="ex: Avenue de la Justice n°12"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                    Type de gestion
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Public' | 'Privé agréé')}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    <option value="Public">Public</option>
                    <option value="Privé agréé">Privé agréé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                    Code direct (EPST)
                  </label>
                  <input
                    type="text"
                    required
                    value={codeDirect}
                    onChange={(e) => setCodeDirect(e.target.value)}
                    placeholder="ex: KIN-BOS-001"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
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
                  {editingEcole ? 'Sauvegarder' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
