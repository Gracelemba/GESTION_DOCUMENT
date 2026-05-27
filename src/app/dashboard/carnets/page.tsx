'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { getDocuments, addDocument, updateDocument, deleteDocument, Document, getEcoles } from '@/lib/db';
import DocumentModal from '@/components/DocumentModal';
import DocumentViewer from '@/components/DocumentViewer';

export default function CarnetsPage() {
  const [carnets, setCarnets] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Toutes');
  const [selectedAnnee, setSelectedAnnee] = useState('Toutes');
  const [selectedEcole, setSelectedEcole] = useState('Toutes');

  // Modal & Viewer States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [editingCarnet, setEditingCarnet] = useState<Document | null>(null);
  const [selectedCarnet, setSelectedCarnet] = useState<Document | null>(null);

  useEffect(() => {
    loadCarnets();
  }, []);

  const loadCarnets = () => {
    const allDocs = getDocuments();
    setCarnets(allDocs.filter(d => d.type === 'courrier')); // Uses 'courrier' type internally in database
  };

  const handleOpenAdd = () => {
    setEditingCarnet(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (carnet: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCarnet(carnet);
    setIsModalOpen(true);
  };

  const handleSave = (payload: any) => {
    const docPayload = {
      type: 'courrier' as const,
      ...payload,
    };

    if (editingCarnet) {
      updateDocument(editingCarnet.id, docPayload);
    } else {
      addDocument(docPayload);
    }
    setIsModalOpen(false);
    loadCarnets();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer ce carnet des étudiants ?')) {
      deleteDocument(id);
      loadCarnets();
    }
  };

  const handleOpenViewer = (carnet: Document) => {
    setSelectedCarnet(carnet);
    setIsViewerOpen(true);
  };

  // Search & Filter Logic
  const filteredCarnets = carnets.filter(c => {
    const matchesSearch = 
      (c.eleveNom || '').toLowerCase().includes(search.toLowerCase()) ||
      c.ecole.toLowerCase().includes(search.toLowerCase()) ||
      (c.metierOption || '').toLowerCase().includes(search.toLowerCase()) ||
      c.classe.toLowerCase().includes(search.toLowerCase());
    
    const matchesProvince = selectedProvince === 'Toutes' || c.province === selectedProvince;
    const matchesAnnee = selectedAnnee === 'Toutes' || c.anneeScolaire === selectedAnnee;
    const matchesEcole = selectedEcole === 'Toutes' || c.ecole === selectedEcole;

    return matchesSearch && matchesProvince && matchesAnnee && matchesEcole;
  });

  const provinces = Array.from(new Set(carnets.map(c => c.province)));
  const annees = Array.from(new Set(carnets.map(c => c.anneeScolaire)));
  const ecolesList = Array.from(new Set(getEcoles().map(e => e.nom)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#f87171] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            Carnet des Étudiants
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gérez et consultez les carnets scolaires et options de formation des élèves
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          Ajouter un carnet
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par élève, option/métier, classe..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>

          {/* Ecole filter */}
          <select 
            value={selectedEcole}
            onChange={(e) => setSelectedEcole(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="Toutes">Toutes les écoles</option>
            {ecolesList.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <select 
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="Toutes">Toutes les provinces</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select 
            value={selectedAnnee}
            onChange={(e) => setSelectedAnnee(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="Toutes">Toutes les années</option>
            {annees.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-light)] bg-[var(--color-surface-alt)]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Aperçu</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Élève & Option</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">École</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Province</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Classe</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Année</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Statut</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarnets.length > 0 ? (
                filteredCarnets.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => handleOpenViewer(c)}
                    className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                  >
                    {/* Visualizer Thumbnail Button */}
                    <td className="px-5 py-4 shrink-0">
                      <div 
                        onClick={(e) => { e.stopPropagation(); handleOpenViewer(c); }}
                        className="relative group w-8 h-10 rounded border border-slate-200 dark:border-slate-800 bg-white overflow-hidden shadow-sm flex items-center justify-center transition-all hover:border-primary-400 active:scale-95 shrink-0"
                      >
                        {/* Miniature Document Replica */}
                        <div className="absolute inset-0 bg-slate-50 flex flex-col justify-between p-0.5 text-[3px] select-none">
                          <div className="border-b pb-0.5 font-bold scale-[0.8] text-[2px] text-blue-700">RDC - MINEDU-NC / EPST</div>
                          <div className="w-full h-4 bg-slate-100 rounded-sm border border-slate-200/50" />
                          <div className="w-full h-1 bg-slate-300 rounded-sm" />
                        </div>
                        {/* Hover Overlay Eye */}
                        <div className="absolute inset-0 bg-primary-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--color-text-primary)]">{c.eleveNom}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{c.metierOption || 'Enseignement Général'}</p>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">{c.ecole}</td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">{c.province}</td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">{c.classe}</td>
                    <td className="px-5 py-4 text-[var(--color-text-muted)]">{c.anneeScolaire}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {c.statut}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={(e) => handleOpenEdit(c, e)}
                          title="Modifier" 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-primary-50 hover:text-primary-600 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(c.id, e)}
                          title="Supprimer" 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                    Aucun carnet ne correspond à vos critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Unified Modal Component */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        docType="courrier"
        initialData={editingCarnet}
      />

      {/* Shared Unified Viewer Component */}
      <DocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        document={selectedCarnet}
      />
    </div>
  );
}
