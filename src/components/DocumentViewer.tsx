'use client';

import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Printer, Download, Maximize2, ShieldCheck, FileText, Calendar, Landmark, Settings } from 'lucide-react';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    type: 'bulletin' | 'fiche' | 'souche' | 'courrier';
    eleveNom?: string;
    ecole: string;
    province: string;
    classe: string;
    anneeScolaire: string;
    fileNom: string;
    fileSize: string;
    filePath: string;
    dateCreation: string;
    statut: 'Archivé' | 'En attente';
    metierOption?: string;
  } | null;
}

export default function DocumentViewer({ isOpen, onClose, document }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoom(100);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !document) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression Document — MINEDU-NC / EPST</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fff; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${document.filePath && document.filePath !== '#' ? document.filePath : createFallbackDoc()}" />
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.filePath && document.filePath !== '#' ? document.filePath : createFallbackDoc();
    link.download = document.fileNom || `document_minedu_epst_${document.id}.png`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  // Helper to dynamically bake standard high-fidelity certificate image
  const createFallbackDoc = () => {
    const canvas = window.document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw parchment
      ctx.fillStyle = '#fafbfc';
      ctx.fillRect(0, 0, 800, 1100);
      
      // Frame
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 12;
      ctx.strokeRect(20, 20, 760, 1060);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, 736, 1036);

      // Header text
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RÉPUBLIQUE DÉMOCRATIQUE DU CONGO', 400, 100);
      
      ctx.fillStyle = '#ef4444';
      ctx.font = 'semibold 13px sans-serif';
      ctx.fillText("MINEDU-NC / EPST", 400, 130);

      // Seal Stamp watermark
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(400, 820, 90, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('ARCHIVES NATIONALES MINEDU-NC / EPST', 400, 815);

      // Document title
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText((document.type === 'courrier' ? 'CARNET DE L\'ÉTUDIANT' : document.type.toUpperCase() + ' SCOLAIRE'), 400, 240);

      // Underline bar
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(250, 270, 300, 4);

      // Data display
      ctx.textAlign = 'left';
      ctx.fillStyle = '#334155';
      
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("Nom complet de l'Élève :", 120, 360);
      ctx.font = 'normal 18px sans-serif';
      ctx.fillText(document.eleveNom || 'Non spécifié', 360, 360);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("Option / Métier :", 120, 420);
      ctx.font = 'normal 18px sans-serif';
      ctx.fillText(document.metierOption || 'Enseignement Général', 360, 420);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("Établissement / École :", 120, 480);
      ctx.font = 'normal 18px sans-serif';
      ctx.fillText(document.ecole, 360, 480);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("Province Éducationnelle :", 120, 540);
      ctx.font = 'normal 18px sans-serif';
      ctx.fillText(document.province, 360, 540);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("Classe de l'Élève :", 120, 600);
      ctx.font = 'normal 18px sans-serif';
      ctx.fillText(document.classe, 360, 600);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("Année Scolaire :", 120, 660);
      ctx.font = 'normal 18px sans-serif';
      ctx.fillText(document.anneeScolaire, 360, 660);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("Statut du Document :", 120, 720);
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(document.statut.toUpperCase() + ' (ARCHIVÉ AUTOMATIQUEMENT)', 360, 720);

      // Signature section
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 13px sans-serif';
      ctx.fillText('Direction Nationale des Archives Éducatives RDC', 420, 960);
      
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(420, 985);
      ctx.lineTo(700, 985);
      ctx.stroke();

      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const imageSrc = document.filePath && document.filePath !== '#' ? document.filePath : createFallbackDoc();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background glassmorphic backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      
      {/* Container */}
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-6xl h-[88vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col lg:flex-row">
        
        {/* Left Section: Real Document Preview Area */}
        <div className="flex-1 bg-slate-950 p-4 flex flex-col relative group overflow-hidden">
          
          {/* Top Bar inside Preview */}
          <div className="absolute top-4 left-4 right-4 z-40 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-semibold font-mono truncate max-w-[200px]">
              {document.fileNom} ({document.fileSize})
            </span>
            
            {/* Integrated Toolbar */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleZoomOut}
                title="Zoom arrière"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white text-xs font-semibold px-1 min-w-[36px] text-center font-mono">
                {zoom}%
              </span>
              <button 
                onClick={handleZoomIn}
                title="Zoom avant"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={handleResetZoom}
                title="Ajuster la taille"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-800 mx-1" />
              <button 
                onClick={handleRotate}
                title="Pivoter à 90°"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Render Area with Zoom & Rotate */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-8 mt-12">
            <div 
              className="transition-all duration-300 shadow-2xl rounded-lg origin-center"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageSrc} 
                alt="Document Preview" 
                className="max-h-[72vh] object-contain rounded border border-slate-800 shadow-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Metadata Sidebar */}
        <div className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-[var(--color-border)] p-6 flex flex-col justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          
          <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-1">
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {document.statut}
                </span>
                <h3 className="font-bold text-xl text-[var(--color-text-primary)] mt-3">
                  Détails de l&apos;Archive
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions at Bottom of Sidebar */}
          <div className="space-y-2 border-t pt-4 border-[var(--color-border-light)] shrink-0">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimer le document
            </button>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary-500/20"
            >
              <Download className="w-4 h-4" />
              Télécharger l&apos;archive
            </button>
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
            >
              <X className="w-4 h-4" />
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
