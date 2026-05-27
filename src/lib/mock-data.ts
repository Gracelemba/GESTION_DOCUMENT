// Données fictives pour le dashboard — Phase 2 du plan de développement

export const statsCards = [
  {
    id: 'total-documents',
    label: 'Total Documents',
    value: '12 847',
    change: '+234',
    changePercent: '+1.8%',
    trend: 'up' as const,
    color: 'primary',
  },
  {
    id: 'bulletins',
    label: 'Bulletins',
    value: '5 632',
    change: '+89',
    changePercent: '+1.6%',
    trend: 'up' as const,
    color: 'info',
  },
  {
    id: 'fiches',
    label: 'Fiches',
    value: '3 421',
    change: '+56',
    changePercent: '+1.7%',
    trend: 'up' as const,
    color: 'accent',
  },
  {
    id: 'souches',
    label: 'Souches',
    value: '2 108',
    change: '+42',
    changePercent: '+2.0%',
    trend: 'up' as const,
    color: 'warning',
  },
  {
    id: 'courriers',
    label: 'Courriers',
    value: '1 686',
    change: '+47',
    changePercent: '+2.9%',
    trend: 'up' as const,
    color: 'error',
  },
];

export const chartDataMonthly = [
  { mois: 'Jan', bulletins: 320, fiches: 200, souches: 150, courriers: 100 },
  { mois: 'Fév', bulletins: 410, fiches: 240, souches: 180, courriers: 120 },
  { mois: 'Mar', bulletins: 380, fiches: 310, souches: 200, courriers: 140 },
  { mois: 'Avr', bulletins: 520, fiches: 350, souches: 220, courriers: 160 },
  { mois: 'Mai', bulletins: 490, fiches: 280, souches: 190, courriers: 180 },
  { mois: 'Jun', bulletins: 600, fiches: 320, souches: 240, courriers: 200 },
  { mois: 'Jul', bulletins: 450, fiches: 260, souches: 170, courriers: 150 },
  { mois: 'Aoû', bulletins: 380, fiches: 230, souches: 160, courriers: 130 },
  { mois: 'Sep', bulletins: 550, fiches: 340, souches: 250, courriers: 190 },
  { mois: 'Oct', bulletins: 620, fiches: 380, souches: 270, courriers: 210 },
  { mois: 'Nov', bulletins: 580, fiches: 350, souches: 230, courriers: 180 },
  { mois: 'Déc', bulletins: 530, fiches: 310, souches: 210, courriers: 170 },
];

export const documentsByProvince = [
  { province: 'Kinshasa', count: 3200, percent: 24.9 },
  { province: 'Haut-Katanga', count: 1850, percent: 14.4 },
  { province: 'Nord-Kivu', count: 1520, percent: 11.8 },
  { province: 'Sud-Kivu', count: 1280, percent: 10.0 },
  { province: 'Kongo-Central', count: 1100, percent: 8.6 },
  { province: 'Kasaï-Central', count: 980, percent: 7.6 },
  { province: 'Équateur', count: 870, percent: 6.8 },
  { province: 'Ituri', count: 750, percent: 5.8 },
  { province: 'Tshopo', count: 680, percent: 5.3 },
  { province: 'Autres', count: 617, percent: 4.8 },
];

export const recentActivities = [
  {
    id: 'a1',
    user: 'Marie Kabanga',
    action: 'a ajouté un bulletin',
    target: 'Jean-Pierre Mukendi — 6ème Primaire',
    time: 'Il y a 5 min',
    type: 'create' as const,
  },
  {
    id: 'a2',
    user: 'Patrick Lukusa',
    action: 'a modifié une fiche',
    target: 'Institut Bosangani — Kinshasa',
    time: 'Il y a 12 min',
    type: 'update' as const,
  },
  {
    id: 'a3',
    user: 'Système',
    action: 'sauvegarde automatique effectuée',
    target: 'Base de données complète',
    time: 'Il y a 30 min',
    type: 'system' as const,
  },
  {
    id: 'a4',
    user: 'Alice Mutombo',
    action: 'a téléchargé un courrier',
    target: 'Réf. CR-2026-0847',
    time: 'Il y a 45 min',
    type: 'download' as const,
  },
  {
    id: 'a5',
    user: 'Jean Kasongo',
    action: 'a créé une souche',
    target: 'Série SOC-2026-KIN-0123',
    time: 'Il y a 1h',
    type: 'create' as const,
  },
  {
    id: 'a6',
    user: 'Admin EPST',
    action: 'a ajouté un utilisateur',
    target: 'Grâce Mwamba — Gestionnaire',
    time: 'Il y a 2h',
    type: 'admin' as const,
  },
];

export const notifications = [
  {
    id: 'n1',
    title: 'Mise à jour système',
    content: 'Une nouvelle version de la plateforme est disponible avec des améliorations de performance.',
    type: 'info' as const,
    time: 'Il y a 1h',
    read: false,
  },
  {
    id: 'n2',
    title: 'Rappel d\'archivage',
    content: '156 documents de la province du Haut-Katanga sont en attente d\'archivage.',
    type: 'warning' as const,
    time: 'Il y a 3h',
    read: false,
  },
  {
    id: 'n3',
    title: 'Sauvegarde réussie',
    content: 'La sauvegarde quotidienne de la base de données a été effectuée avec succès.',
    type: 'success' as const,
    time: 'Il y a 6h',
    read: true,
  },
  {
    id: 'n4',
    title: 'Nouveau gestionnaire',
    content: 'Grâce Mwamba a été ajoutée comme gestionnaire pour la province de l\'Équateur.',
    type: 'info' as const,
    time: 'Hier',
    read: true,
  },
];

export const documentTypeDistribution = [
  { name: 'Bulletins', value: 5632, color: '#4c6ef5' },
  { name: 'Fiches', value: 3421, color: '#20c997' },
  { name: 'Souches', value: 2108, color: '#f59e0b' },
  { name: 'Courriers', value: 1686, color: '#ef4444' },
];
