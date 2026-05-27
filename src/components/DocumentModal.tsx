'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Check, Scan, Sparkles, Upload, X } from 'lucide-react';
import { getAnneesScolaires, getClasses, getEcoles, getProvinces } from '@/lib/db';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    eleveNom: string;
    ecole: string;
    province: string;
    classe: string;
    anneeScolaire: string;
    fileNom: string;
    fileSize: string;
    filePath: string;
    statut: 'Archivé';
  }) => void;
  docType: 'bulletin' | 'fiche' | 'souche' | 'courrier';
  initialData?: any;
}

function AutocompleteInput({ label, value, onChange, suggestions, placeholder, required = false }: { label: string; value: string; onChange: (val: string) => void; suggestions: string[]; placeholder: string; required?: boolean }) {
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filtered = suggestions.filter((s) => (s || '').toLowerCase().includes((value || '').toLowerCase()) && (s || '').toLowerCase() !== (value || '').toLowerCase());

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-sm transition-all"
      />
      {show && filtered.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          {filtered.map((item, idx) => (
            <button
              key={`${item}-${idx}`}
              type="button"
              onClick={() => {
                onChange(item);
                setShow(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-[var(--color-surface-hover)] border-b last:border-b-0 border-[var(--color-border-light)] text-[var(--color-text-primary)] font-medium"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function fileNameFor(docType: string, prefix: string, ext: string) {
  const p = prefix.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `${p}_${docType}_${Date.now()}.${ext}`;
}

export default function DocumentModal({ isOpen, onClose, onSave, docType, initialData }: DocumentModalProps) {
  const [eleveNom, setEleveNom] = useState('');
  const [ecoleInput, setEcoleInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');
  const [classeInput, setClasseInput] = useState('');
  const [anneeInput, setAnneeInput] = useState('');

  const [provincesList, setProvincesList] = useState<string[]>([]);
  const [classesList, setClassesList] = useState<string[]>([]);
  const [anneesList, setAnneesList] = useState<string[]>([]);
  const [ecolesList, setEcolesList] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'camera' | 'scanner' | 'upload'>('camera');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError('Accès caméra refusé ou indisponible. Vérifie les permissions navigateur.');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setProvincesList(getProvinces());
    setClassesList(getClasses());
    setAnneesList(getAnneesScolaires());
    setEcolesList(getEcoles().map((e) => e.nom));

    if (initialData) {
      setEleveNom(initialData.eleveNom || '');
      setEcoleInput(initialData.ecole || '');
      setProvinceInput(initialData.province || '');
      setClasseInput(initialData.classe || '');
      setAnneeInput(initialData.anneeScolaire || '');
      setFileData(initialData.filePath && initialData.filePath !== '#' ? initialData.filePath : null);
      setFileName(initialData.fileNom || '');
      setFileSize(initialData.fileSize || '');
    } else {
      setEleveNom('');
      setEcoleInput('');
      setProvinceInput('Kinshasa');
      setClasseInput('1 Primaire');
      setAnneeInput('2025-2026');
      setFileData(null);
      setFileName('');
      setFileSize('');
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopCamera();
        onClose();
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'camera' || activeTab === 'scanner') {
      void startCamera();
    } else {
      stopCamera();
    }

    if (activeTab === 'upload') {
      fileInputRef.current?.click();
    }

    return () => {
      if (!isOpen) stopCamera();
    };
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileData(event.target?.result as string);
      setFileName(file.name);
      setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
    };
    reader.readAsDataURL(file);
  };

  const captureFromVideo = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    if (activeTab === 'scanner') {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        const boosted = gray > 140 ? 255 : 35;
        data[i] = boosted;
        data[i + 1] = boosted;
        data[i + 2] = boosted;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    const out = canvas.toDataURL('image/jpeg', 0.95);
    setFileData(out);
    setFileName(fileNameFor(docType, activeTab === 'scanner' ? 'scan' : 'capture', 'jpg'));
    setFileSize('1.1 MB');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData) {
      alert('Veuillez d\'abord joindre ou scanner un fichier.');
      return;
    }

    onSave({
      eleveNom,
      ecole: ecoleInput,
      province: provinceInput,
      classe: classeInput,
      anneeScolaire: anneeInput,
      fileNom: fileName,
      fileSize,
      filePath: fileData,
      statut: 'Archivé',
    });
    stopCamera();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { stopCamera(); onClose(); }} />
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
          <h2 className="font-bold text-xl text-[var(--color-text-primary)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            {initialData ? 'Modifier le document' : 'Nouvel enregistrement'}
          </h2>
          <button
            type="button"
            onClick={() => { stopCamera(); onClose(); }}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <AutocompleteInput label="Nom complet de l'élève" value={eleveNom} onChange={setEleveNom} suggestions={[]} placeholder="ex: KABILA Moise" required />
            <AutocompleteInput label="Établissement scolaire" value={ecoleInput} onChange={setEcoleInput} suggestions={ecolesList} placeholder="Saisissez l'école" required />
            <AutocompleteInput label="Province" value={provinceInput} onChange={setProvinceInput} suggestions={provincesList} placeholder="Kinshasa" required />
            <AutocompleteInput label="Classe" value={classeInput} onChange={setClasseInput} suggestions={classesList} placeholder="1 Primaire" required />
            <AutocompleteInput label="Année scolaire" value={anneeInput} onChange={setAnneeInput} suggestions={anneesList} placeholder="2025-2026" required />
          </div>

          <div className="space-y-4 flex flex-col">
            <div className="flex rounded-xl bg-slate-100 p-1 shrink-0">
              <button type="button" onClick={() => setActiveTab('camera')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold ${activeTab === 'camera' ? 'bg-white shadow-sm' : 'text-[var(--color-text-muted)]'}`}><Camera className="w-3.5 h-3.5" />Appareil photo</button>
              <button type="button" onClick={() => setActiveTab('scanner')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold ${activeTab === 'scanner' ? 'bg-white shadow-sm' : 'text-[var(--color-text-muted)]'}`}><Scan className="w-3.5 h-3.5" />Scanner</button>
              <button type="button" onClick={() => setActiveTab('upload')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold ${activeTab === 'upload' ? 'bg-white shadow-sm' : 'text-[var(--color-text-muted)]'}`}><Upload className="w-3.5 h-3.5" />Importer</button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />

            <div className="flex-1 min-h-[260px] border border-dashed border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 relative bg-black">
              {(activeTab === 'camera' || activeTab === 'scanner') && (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                  {activeTab === 'scanner' && <div className="absolute left-0 right-0 h-[2px] bg-green-400 shadow-[0_0_10px_#4ade80] animate-pulse" style={{ top: '48%' }} />}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="text-white/90 text-[11px] bg-black/40 px-2 py-1 rounded">
                      {activeTab === 'scanner' ? 'Mode scanner' : 'Mode appareil photo'}
                    </span>
                    <button type="button" onClick={captureFromVideo} className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold">
                      {activeTab === 'scanner' ? 'Scanner maintenant' : 'Prendre la capture'}
                    </button>
                  </div>
                </>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-black/75 text-red-200 text-xs p-4 flex items-center justify-center text-center">
                  {cameraError}
                </div>
              )}

              {activeTab === 'upload' && !fileData && (
                <p className="text-xs text-[var(--color-text-secondary)] text-center bg-white/90 rounded px-3 py-2">
                  Sélectionne un fichier depuis ton appareil.
                </p>
              )}

              {fileData && (
                <div className="absolute inset-0 bg-green-500/90 text-white flex flex-col items-center justify-center gap-2 p-4">
                  <Check className="w-7 h-7" />
                  <p className="text-sm font-bold">Fichier prêt</p>
                  <p className="text-xs truncate max-w-[280px]">{fileName}</p>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-[10px] font-semibold"
                    onClick={() => {
                      setFileData(null);
                      setFileName('');
                      setFileSize('');
                    }}
                  >
                    Changer de fichier
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {!fileData && (
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Le fichier est obligatoire.</span>
              </div>
            )}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[var(--color-border-light)] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => { stopCamera(); onClose(); }}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          >
            Fermer
          </button>
          <button type="submit" onClick={(e) => handleSubmit(e as unknown as React.FormEvent)} disabled={!fileData} className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-50">
            Valider & Archiver
          </button>
        </div>
      </div>
    </div>
  );
}
