import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export interface Eleve { id: string; nom: string; postnom: string; prenom: string; ecole: string; province: string; classe: string; anneeScolaire: string; }
export interface Document {
  id: string;
  type: 'bulletin' | 'fiche' | 'souche' | 'courrier';
  eleveId?: string;
  eleveNom?: string;
  fileNom: string;
  fileSize: string;
  filePath: string;
  province: string;
  ecole: string;
  classe: string;
  anneeScolaire: string;
  dateCreation: string;
  statut: 'Archivé' | 'En attente';
  metierOption?: string;
  trimestre?: string;
  photoUrl?: string;
  numeroSerie?: string;
  referenceCourrier?: string;
  direction?: 'Entrant' | 'Sortant';
}
export interface Utilisateur { id: string; nom: string; email: string; role: 'Administrateur' | 'Gestionnaire' | 'Lecteur'; province: string; statut: 'Actif' | 'Nouveau'; derniereConnexion: string; motDePasse?: string; }
export interface Ecole { id: string; nom: string; province: string; commune: string; adresse: string; type: 'Public' | 'Privé agréé'; codeDirect: string; }
export interface Notification { id: string; title: string; content: string; type: 'info' | 'warning' | 'success'; time: string; read: boolean; }
export interface Activite { id: string; user: string; action: string; target: string; time: string; type: 'create' | 'update' | 'delete' | 'download' | 'admin' | 'system'; }

type OptionsData = { provinces: string[]; classes: string[]; anneesScolaires: string[]; metiersOptions: string[] };

const INITIAL_ECOLES: Ecole[] = [
  { id: 'ec-1', nom: 'Institut Bosangani', province: 'Kinshasa', commune: 'Gombe', adresse: 'Avenue de la Justice', type: 'Public', codeDirect: 'KIN-BOS-001' },
  { id: 'ec-2', nom: 'EP Lumumba', province: 'Haut-Katanga', commune: 'Lubumbashi', adresse: 'Avenue Lumumba', type: 'Public', codeDirect: 'HK-LUM-002' },
  { id: 'ec-3', nom: 'CS Saint-Joseph', province: 'Kasaï-Central', commune: 'Kananga', adresse: 'Avenue du Commerce', type: 'Privé agréé', codeDirect: 'KC-STJ-003' },
];
const INITIAL_DOCUMENTS: Document[] = [
  { id: 'doc-1', type: 'bulletin', eleveNom: 'Mukendi Jean-Pierre', fileNom: 'bulletin_mukendi_jp.pdf', fileSize: '1.2 MB', filePath: '#', province: 'Kinshasa', ecole: 'Institut Bosangani', classe: '6ème Primaire', anneeScolaire: '2025-2026', dateCreation: '15/01/2026', statut: 'Archivé', trimestre: '1er', metierOption: 'Enseignement Général' },
];
const INITIAL_UTILISATEURS: Utilisateur[] = [
  { id: 'u-1', nom: 'Admin EPST', email: 'admin@epst.gouv.cd', role: 'Administrateur', province: 'Toutes', statut: 'Actif', derniereConnexion: '18/05/2026 15:30', motDePasse: 'admin123' },
  { id: 'u-2', nom: 'Gestionnaire EPST', email: 'gestionnaire@epst.gouv.cd', role: 'Gestionnaire', province: 'Kinshasa', statut: 'Actif', derniereConnexion: '18/05/2026 16:00', motDePasse: 'gestion123' },
];
const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', title: 'Mise à jour système', content: 'Une nouvelle version de la plateforme est disponible.', type: 'info', time: 'Il y a 1h', read: false },
];
const INITIAL_ACTIVITES: Activite[] = [
  { id: 'act-1', user: 'Système', action: 'initialisation des données', target: 'Base Firestore', time: 'À l\'instant', type: 'system' },
];
const DEFAULT_OPTIONS: OptionsData = {
  provinces: [
    'Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele', 'Ituri',
    'Kasaï', 'Kasaï-Central', 'Kasaï-Oriental', 'Kinshasa', 'Kongo-Central', 'Kwango',
    'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe', 'Maniema', 'Mongala',
    'Nord-Kivu', 'Nord-Ubangi', 'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika',
    'Tshopo', 'Tshuapa'
  ],
  classes: [
    '1 Primaire', '2 Primaire', '3 Primaire', '4 Primaire', '5 Primaire', '6 Primaire', '7 Primaire', '8 Primaire',
    '1 Secondaire', '2 Secondaire',
    '3 Humanités Scientifiques', '4 Humanités Scientifiques', '5 Humanités Scientifiques', '6 Humanités Scientifiques',
    '3 Humanités Littéraires', '4 Humanités Littéraires', '5 Humanités Littéraires', '6 Humanités Littéraires',
    '2 Humanités Administratives', '3 Humanités Administratives', '4 Humanités Administratives', '5 Humanités Administratives', '6 Humanités Administratives',
    '3 Humanités Commerciales', '4 Humanités Commerciales', '5 Humanités Commerciales', '6 Humanités Commerciales',
    '3 Humanités Pédagogiques', '4 Humanités Pédagogiques', '5 Humanités Pédagogiques', '6 Humanités Pédagogiques',
    '3 Humanités Techniques', '4 Humanités Techniques', '5 Humanités Techniques', '6 Humanités Techniques',
    '3 Mécanique Générale', '4 Mécanique Générale', '5 Mécanique Générale', '6 Mécanique Générale',
    '3 Électricité', '4 Électricité', '5 Électricité', '6 Électricité',
    '3 Électronique', '4 Électronique', '5 Électronique', '6 Électronique',
    '3 Construction', '4 Construction', '5 Construction', '6 Construction',
    '3 Coupe et Couture', '4 Coupe et Couture', '5 Coupe et Couture', '6 Coupe et Couture',
    '3 Nutrition', '4 Nutrition', '5 Nutrition', '6 Nutrition',
    '3 Hôtellerie et Restauration', '4 Hôtellerie et Restauration', '5 Hôtellerie et Restauration', '6 Hôtellerie et Restauration',
    '3 Agriculture', '4 Agriculture', '5 Agriculture', '6 Agriculture',
    '3 Vétérinaire', '4 Vétérinaire', '5 Vétérinaire', '6 Vétérinaire',
    '3 Informatique', '4 Informatique', '5 Informatique', '6 Informatique'
  ],
  anneesScolaires: ['2025-2026', '2024-2025', '2023-2024', '2022-2023'],
  metiersOptions: ['Enseignement Général', 'Option Science', 'Option Commerciale & Gestion', 'Option Technique Industrielle', 'Option Coupe & Couture', 'Option Agriculture & Élevage'],
};

const mergeUnique = (base: string[], incoming: string[]) => Array.from(new Set([...base, ...incoming]));

const state = {
  documents: [...INITIAL_DOCUMENTS],
  ecoles: [...INITIAL_ECOLES],
  utilisateurs: [...INITIAL_UTILISATEURS],
  notifications: [...INITIAL_NOTIFICATIONS],
  activites: [...INITIAL_ACTIVITES],
  options: { ...DEFAULT_OPTIONS },
};

const id = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
let seeded = false;
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;

async function seedIfNeeded() {
  if (seeded) return;
  seeded = true;

  const ensure = async <T extends { id: string }>(name: string, rows: T[]) => {
    const snap = await getDocs(collection(firestore, name));
    if (!snap.empty) return;
    await Promise.all(rows.map((row) => setDoc(doc(firestore, name, row.id), row)));
  };

  await ensure('documents', INITIAL_DOCUMENTS);
  await ensure('ecoles', INITIAL_ECOLES);
  await ensure('utilisateurs', INITIAL_UTILISATEURS);
  await ensure('notifications', INITIAL_NOTIFICATIONS);
  await ensure('activites', INITIAL_ACTIVITES);

  const optRef = doc(firestore, 'settings', 'options');
  const optSnap = await getDoc(optRef);
  if (!optSnap.exists()) {
    await setDoc(optRef, DEFAULT_OPTIONS);
  } else {
    const existing = (optSnap.data() as OptionsData) || DEFAULT_OPTIONS;
    await setDoc(optRef, {
      provinces: mergeUnique(DEFAULT_OPTIONS.provinces, existing.provinces || []),
      classes: mergeUnique(DEFAULT_OPTIONS.classes, existing.classes || []),
      anneesScolaires: mergeUnique(DEFAULT_OPTIONS.anneesScolaires, existing.anneesScolaires || []),
      metiersOptions: mergeUnique(DEFAULT_OPTIONS.metiersOptions, existing.metiersOptions || []),
    });
  }
}

async function hydrate() {
  if (hydrated) return;
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = (async () => {
    hydrated = true;
  try {
    await seedIfNeeded();

    const [docsSnap, ecolesSnap, usersSnap, notifSnap, actSnap, optionsSnap] = await Promise.all([
      getDocs(collection(firestore, 'documents')),
      getDocs(collection(firestore, 'ecoles')),
      getDocs(collection(firestore, 'utilisateurs')),
      getDocs(collection(firestore, 'notifications')),
      getDocs(collection(firestore, 'activites')),
      getDoc(doc(firestore, 'settings', 'options')),
    ]);

    state.documents = docsSnap.docs.map((d) => d.data() as Document);
    state.ecoles = ecolesSnap.docs.map((d) => d.data() as Ecole);
    state.utilisateurs = usersSnap.docs.map((d) => d.data() as Utilisateur);
    state.notifications = notifSnap.docs.map((d) => d.data() as Notification);
    state.activites = actSnap.docs.map((d) => d.data() as Activite);
    const remote = (optionsSnap.data() as OptionsData) || DEFAULT_OPTIONS;
    state.options = {
      provinces: mergeUnique(DEFAULT_OPTIONS.provinces, remote.provinces || []),
      classes: mergeUnique(DEFAULT_OPTIONS.classes, remote.classes || []),
      anneesScolaires: mergeUnique(DEFAULT_OPTIONS.anneesScolaires, remote.anneesScolaires || []),
      metiersOptions: mergeUnique(DEFAULT_OPTIONS.metiersOptions, remote.metiersOptions || []),
    };
  } catch (error) {
    console.error('Hydration Firebase échouée, fallback local en mémoire', error);
  }
  })();
  return hydrationPromise;
}
void hydrate();

export async function ensureHydrated() {
  await hydrate();
}

const persistOptions = () => void setDoc(doc(firestore, 'settings', 'options'), state.options).catch(console.error);
const pushActivite = (a: Activite) => {
  state.activites.unshift(a);
  void setDoc(doc(firestore, 'activites', a.id), a).catch(console.error);
};

export const getDocuments = (): Document[] => [...state.documents];
export const saveDocuments = (docs: Document[]) => {
  state.documents = [...docs];
  void Promise.all(docs.map((row) => setDoc(doc(firestore, 'documents', row.id), row))).catch(console.error);
};
export const addDocument = (docInput: Omit<Document, 'id' | 'dateCreation'>) => {
  const newDoc: Document = { ...docInput, id: id('doc'), dateCreation: new Date().toLocaleDateString('fr-FR') };
  state.documents.unshift(newDoc);
  void setDoc(doc(firestore, 'documents', newDoc.id), newDoc).catch(console.error);
  addProvince(docInput.province); addClasse(docInput.classe); addAnneeScolaire(docInput.anneeScolaire); if (docInput.metierOption) addMetierOption(docInput.metierOption);
  if (!state.ecoles.some((s) => s.nom.toLowerCase() === docInput.ecole.toLowerCase())) addEcole({ nom: docInput.ecole, province: docInput.province, commune: 'Non précisée', adresse: 'Non précisée', type: 'Public', codeDirect: `CODE-${Date.now()}` });
  addActivite('Admin EPST', `a ajouté un ${docInput.type === 'courrier' ? 'carnet d\'étudiant' : docInput.type}`, docInput.eleveNom || docInput.fileNom, 'create');
  return newDoc;
};
export const updateDocument = (rowId: string, updated: Partial<Document>) => {
  state.documents = state.documents.map((d) => d.id === rowId ? { ...d, ...updated } : d);
  void updateDoc(doc(firestore, 'documents', rowId), updated as Record<string, unknown>).catch(console.error);
  const curr = state.documents.find((d) => d.id === rowId);
  if (curr) addActivite('Admin EPST', `a modifié un ${curr.type === 'courrier' ? 'carnet d\'étudiant' : curr.type}`, curr.eleveNom || curr.fileNom, 'update');
};
export const deleteDocument = (rowId: string) => {
  const curr = state.documents.find((d) => d.id === rowId);
  state.documents = state.documents.filter((d) => d.id !== rowId);
  void deleteDoc(doc(firestore, 'documents', rowId)).catch(console.error);
  if (curr) addActivite('Admin EPST', `a supprimé un ${curr.type === 'courrier' ? 'carnet d\'étudiant' : curr.type}`, curr.eleveNom || curr.fileNom, 'delete');
};

export const getEcoles = (): Ecole[] => [...state.ecoles];
export const saveEcoles = (ecoles: Ecole[]) => {
  state.ecoles = [...ecoles];
  void Promise.all(ecoles.map((row) => setDoc(doc(firestore, 'ecoles', row.id), row))).catch(console.error);
};
export const addEcole = (ecole: Omit<Ecole, 'id'>) => {
  const created: Ecole = { ...ecole, id: id('ec') };
  state.ecoles.unshift(created);
  void setDoc(doc(firestore, 'ecoles', created.id), created).catch(console.error);
  addActivite('Admin EPST', 'a ajouté l\'école', created.nom, 'create');
  return created;
};
export const updateEcole = (rowId: string, updated: Partial<Ecole>) => {
  state.ecoles = state.ecoles.map((e) => e.id === rowId ? { ...e, ...updated } : e);
  void updateDoc(doc(firestore, 'ecoles', rowId), updated as Record<string, unknown>).catch(console.error);
  const curr = state.ecoles.find((e) => e.id === rowId); if (curr) addActivite('Admin EPST', 'a modifié l\'école', curr.nom, 'update');
};
export const deleteEcole = (rowId: string) => {
  const curr = state.ecoles.find((e) => e.id === rowId);
  state.ecoles = state.ecoles.filter((e) => e.id !== rowId);
  void deleteDoc(doc(firestore, 'ecoles', rowId)).catch(console.error);
  if (curr) addActivite('Admin EPST', 'a supprimé l\'école', curr.nom, 'delete');
};

export const getProvinces = (): string[] => [...state.options.provinces];
export const addProvince = (prov: string) => { if (!prov?.trim() || state.options.provinces.includes(prov)) return; state.options.provinces = [...state.options.provinces, prov]; persistOptions(); };
export const getClasses = (): string[] => [...state.options.classes];
export const addClasse = (c: string) => { if (!c?.trim() || state.options.classes.includes(c)) return; state.options.classes = [...state.options.classes, c]; persistOptions(); };
export const getAnneesScolaires = (): string[] => [...state.options.anneesScolaires];
export const addAnneeScolaire = (a: string) => { if (!a?.trim() || state.options.anneesScolaires.includes(a)) return; state.options.anneesScolaires = [...state.options.anneesScolaires, a]; persistOptions(); };
export const getMetiersOptions = (): string[] => [...state.options.metiersOptions];
export const addMetierOption = (o: string) => { if (!o?.trim() || state.options.metiersOptions.includes(o)) return; state.options.metiersOptions = [...state.options.metiersOptions, o]; persistOptions(); };

export const getUtilisateurs = (): Utilisateur[] => [...state.utilisateurs];
export const saveUtilisateurs = (users: Utilisateur[]) => { state.utilisateurs = [...users]; void Promise.all(users.map((u) => setDoc(doc(firestore, 'utilisateurs', u.id), u))).catch(console.error); };
export const addUtilisateur = (user: Omit<Utilisateur, 'id' | 'derniereConnexion'>) => {
  const created: Utilisateur = { ...user, id: id('u'), derniereConnexion: '—' };
  state.utilisateurs.push(created);
  void setDoc(doc(firestore, 'utilisateurs', created.id), created).catch(console.error);
  addActivite('Admin EPST', 'a invité l\'utilisateur', user.nom, 'admin');
  return created;
};
export const deleteUtilisateur = (rowId: string) => {
  const curr = state.utilisateurs.find((u) => u.id === rowId);
  state.utilisateurs = state.utilisateurs.filter((u) => u.id !== rowId);
  void deleteDoc(doc(firestore, 'utilisateurs', rowId)).catch(console.error);
  if (curr) addActivite('Admin EPST', 'a supprimé l\'utilisateur', curr.nom, 'admin');
};

export const getNotifications = (): Notification[] => [...state.notifications];
export const saveNotifications = (notifs: Notification[]) => { state.notifications = [...notifs]; void Promise.all(notifs.map((n) => setDoc(doc(firestore, 'notifications', n.id), n))).catch(console.error); };
export const markAllNotificationsRead = () => { state.notifications = state.notifications.map((n) => ({ ...n, read: true })); void Promise.all(state.notifications.map((n) => updateDoc(doc(firestore, 'notifications', n.id), { read: true }))).catch(console.error); };
export const addNotification = (title: string, content: string, type: 'info' | 'warning' | 'success') => {
  const created: Notification = { id: id('n'), title, content, type, time: 'À l\'instant', read: false };
  state.notifications.unshift(created);
  void setDoc(doc(firestore, 'notifications', created.id), created).catch(console.error);
};

export const getActivites = (): Activite[] => [...state.activites];
export const saveActivites = (acts: Activite[]) => { state.activites = [...acts]; void Promise.all(acts.map((a) => setDoc(doc(firestore, 'activites', a.id), a))).catch(console.error); };
export const addActivite = (user: string, action: string, target: string, type: Activite['type']) => {
  const created: Activite = { id: id('act'), user, action, target, time: 'À l\'instant', type };
  pushActivite(created);
};
