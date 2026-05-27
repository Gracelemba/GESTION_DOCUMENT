'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Database,
  FileSearch,
  GraduationCap,
  MessageSquareText,
  Minimize2,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getActivites,
  getDocuments,
  getEcoles,
  getUtilisateurs,
  type Activite,
  type Document,
  type Ecole,
  type Utilisateur,
} from '@/lib/db';

type AgentId = 'scolarite' | 'documents' | 'administration' | 'general';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  agent?: AgentId;
  text: string;
};

type DataSnapshot = {
  documents: Document[];
  ecoles: Ecole[];
  utilisateurs: Utilisateur[];
  activites: Activite[];
};

const agents: Record<AgentId, { name: string; icon: React.ElementType; color: string }> = {
  scolarite: {
    name: 'Agent Scolarité',
    icon: GraduationCap,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  documents: {
    name: 'Agent Documents',
    icon: FileSearch,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  administration: {
    name: 'Agent Admin',
    icon: ShieldCheck,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  general: {
    name: 'Agent Données',
    icon: Database,
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

const quickPrompts = [
  "Aujourd'hui, combien de documents ont été stockés ?",
  "Aujourd'hui, combien de bulletins ont été stockés ?",
  'Donne-moi la liste des élèves pour l’école Institut Bosangani',
  'Combien de documents par province ?',
  'Liste des écoles',
  'Quels sont les utilisateurs actifs ?',
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const unique = <T,>(items: T[]) => Array.from(new Set(items));

function getStudentName(document: Document) {
  if (document.eleveNom?.trim()) return document.eleveNom.trim();
  return document.fileNom.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
}

function findSchoolName(question: string, ecoles: Ecole[], documents: Document[]) {
  const normalizedQuestion = normalize(question);
  const names = unique([...ecoles.map((e) => e.nom), ...documents.map((d) => d.ecole)]).filter(Boolean);
  const direct = names.find((name) => normalizedQuestion.includes(normalize(name)));
  if (direct) return direct;

  const match = normalizedQuestion.match(/(?:ecole|etablissement|institut|cs|ep)\s+(.+)$/);
  if (!match?.[1]) return '';

  const wanted = match[1].replace(/^(x|de|du|des|l)\s+/, '').trim();
  const fuzzy = names.find((name) => normalize(name).includes(wanted) || wanted.includes(normalize(name)));
  return fuzzy || wanted;
}

function formatList(items: string[], empty: string, limit = 10) {
  if (!items.length) return empty;
  const visible = items.slice(0, limit).map((item) => `- ${item}`).join('\n');
  const remaining = items.length > limit ? `\n+ ${items.length - limit} autre(s) résultat(s).` : '';
  return `${visible}${remaining}`;
}

function parseFrDate(value: string) {
  // Expected: dd/mm/yyyy (from toLocaleDateString('fr-FR') and seeded data)
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfLocalDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfLocalDay(date: Date) {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfLocalWeek(date: Date) {
  // Monday as first day of week
  const day = date.getDay(); // 0 Sunday .. 6 Saturday
  const delta = (day + 6) % 7;
  const start = startOfLocalDay(date);
  start.setDate(start.getDate() - delta);
  return start;
}

function isInLocalRange(value: string, from: Date, to: Date) {
  const date = parseFrDate(value);
  if (!date) return false;
  const ts = date.getTime();
  return ts >= from.getTime() && ts <= to.getTime();
}

const typeLabels: Record<Document['type'], string> = {
  bulletin: 'Bulletins',
  fiche: 'Fiches',
  souche: 'Souches',
  courrier: 'Carnets',
};

function summarizeDocuments(documents: Document[]) {
  const byType = documents.reduce<Record<Document['type'], number>>((acc, document) => {
    acc[document.type] = (acc[document.type] || 0) + 1;
    return acc;
  }, {} as Record<Document['type'], number>);

  const lines = (Object.keys(typeLabels) as Array<Document['type']>)
    .filter((type) => (byType[type] || 0) > 0)
    .map((type) => `${typeLabels[type]}: ${byType[type] || 0}`);

  return { total: documents.length, lines };
}

function pickAgent(question: string): AgentId {
  const q = normalize(question);
  if (/(eleve|eleves|ecole|classe|province|annee scolaire)/.test(q)) return 'scolarite';
  if (/(document|bulletin|fiche|souche|carnet|archive|import)/.test(q)) return 'documents';
  if (/(utilisateur|agent|admin|role|permission|actif|connexion)/.test(q)) return 'administration';
  return 'general';
}

function answerQuestion(question: string, data: DataSnapshot): { agent: AgentId; text: string } {
  const q = normalize(question);
  const agent = pickAgent(question);

  if (/(aide|exemple|quoi demander|commandes)/.test(q)) {
    return {
      agent: 'general',
      text: [
        'Je peux interroger les données visibles dans l’application. Exemples :',
        "- Aujourd'hui, combien de bulletins ont été stockés ?",
        "- Aujourd'hui, combien de documents ont été stockés ?",
        '- Donne-moi la liste des élèves pour l’école Institut Bosangani',
        '- Combien de documents par province ?',
        '- Liste des écoles',
        '- Quels sont les utilisateurs actifs ?',
      ].join('\n'),
    };
  }

  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const todayEnd = endOfLocalDay(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = startOfLocalDay(yesterday);
  const yesterdayEnd = endOfLocalDay(yesterday);

  const wantsToday = /(aujourdhui|aujourd hui|today)/.test(q);
  const wantsYesterday = /(hier|yesterday)/.test(q);
  const wantsWeek = /(cette semaine|semaine)/.test(q);
  const wantsMonth = /(ce mois)/.test(q);

  const wantsCount = /(combien|nombre|count|stats|statistiques)/.test(q);
  const mentionsStore = /(stocke|stockes|stockee|stocke(e|s)?|enregistre|enregistres|ajoute|imports?)/.test(q);

  const mentionsBulletins = /(bulletin|bulletins)/.test(q);
  const mentionsFiches = /(fiche|fiches)/.test(q);
  const mentionsSouches = /(souche|souches)/.test(q);
  const mentionsCarnets = /(carnet|carnets)/.test(q);

  const asksForSingleType =
    Number(mentionsBulletins) + Number(mentionsFiches) + Number(mentionsSouches) + Number(mentionsCarnets) === 1;

  const singleType: Document['type'] | null = asksForSingleType
    ? mentionsBulletins
      ? 'bulletin'
      : mentionsFiches
        ? 'fiche'
        : mentionsSouches
          ? 'souche'
          : 'courrier'
    : null;

  const isDocumentQuestion = /(document|documents|bulletin|bulletins|fiche|fiches|souche|souches|carnet|carnets|archive)/.test(q);

  if (isDocumentQuestion && (wantsCount || mentionsStore || wantsToday || wantsYesterday || wantsWeek || wantsMonth)) {
    let label = 'au total';
    let from: Date | null = null;
    let to: Date | null = null;

    if (wantsToday || (mentionsStore && !wantsYesterday && !wantsWeek && !wantsMonth)) {
      label = "aujourd'hui";
      from = todayStart;
      to = todayEnd;
    } else if (wantsYesterday) {
      label = 'hier';
      from = yesterdayStart;
      to = yesterdayEnd;
    } else if (wantsWeek) {
      label = 'cette semaine';
      from = startOfLocalWeek(now);
      to = todayEnd;
    } else if (wantsMonth) {
      label = 'ce mois';
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      from = startOfLocalDay(from);
      to = todayEnd;
    }

    let filtered = data.documents;
    if (from && to) {
      filtered = filtered.filter((d) => isInLocalRange(d.dateCreation, from, to));
    }
    if (singleType) filtered = filtered.filter((d) => d.type === singleType);

    const summary = summarizeDocuments(filtered);
    const title = singleType ? `${typeLabels[singleType]} stockés ${label}` : `Documents stockés ${label}`;

    if (!filtered.length) {
      return {
        agent: 'documents',
        text: `${title}: 0\nAstuce: “Aujourd'hui, combien de bulletins ont été stockés ?”`,
      };
    }

    const details =
      !singleType && summary.lines.length ? `\nDétail:\n${formatList(summary.lines, '')}` : '';

    return {
      agent: 'documents',
      text: `${title}: ${summary.total}${details}`,
    };
  }

  if (/(eleve|eleves|etudiant|etudiants)/.test(q)) {
    const schoolName = findSchoolName(question, data.ecoles, data.documents);
    if (!schoolName) {
      const schools = unique([...data.ecoles.map((e) => e.nom), ...data.documents.map((d) => d.ecole)]).filter(Boolean);
      return {
        agent: 'scolarite',
        text: [
          "Pour quelle école ? Donne le nom exact (ou une partie). Exemples :",
          formatList(schools.slice(0, 8), 'Aucune école enregistrée.'),
        ].join('\n'),
      };
    }
    const rows = data.documents.filter((document) => {
      return normalize(document.ecole).includes(normalize(schoolName));
    });
    const students = unique(rows.map(getStudentName).filter(Boolean));
    const scope = schoolName ? ` pour ${schoolName}` : '';

    return {
      agent: 'scolarite',
      text: students.length
        ? `J’ai trouvé ${students.length} élève(s)${scope}, à partir des documents enregistrés:\n${formatList(students, '')}`
        : `Je n’ai trouvé aucun élève${scope}. Les élèves sont déduits des documents enregistrés; ajoute un bulletin, une fiche ou une carte pour les faire apparaître ici.`,
    };
  }

  if (/(ecole|ecoles|etablissement|etablissements)/.test(q)) {
    const schools = data.ecoles.map((ecole) => `${ecole.nom} - ${ecole.province}, ${ecole.commune}`);
    return {
      agent: 'scolarite',
      text: `Voici les écoles enregistrées (${schools.length}):\n${formatList(schools, 'Aucune école enregistrée.')}`,
    };
  }

  if (/(province|provinces)/.test(q)) {
    const counts = data.documents.reduce<Record<string, number>>((acc, document) => {
      acc[document.province] = (acc[document.province] || 0) + 1;
      return acc;
    }, {});
    const lines = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([province, count]) => `${province}: ${count} document(s)`);
    return {
      agent: 'scolarite',
      text: `Répartition par province:\n${formatList(lines, 'Aucun document enregistré par province.')}`,
    };
  }

  if (/(utilisateur|utilisateurs|agent|agents|role|roles|actif|actifs)/.test(q)) {
    const activeOnly = /(actif|actifs)/.test(q);
    const users = data.utilisateurs
      .filter((user) => !activeOnly || user.statut === 'Actif')
      .map((user) => `${user.nom} - ${user.role} (${user.province})`);
    return {
      agent: 'administration',
      text: `${activeOnly ? 'Utilisateurs actifs' : 'Utilisateurs enregistrés'} (${users.length}):\n${formatList(users, 'Aucun utilisateur trouvé.')}`,
    };
  }

  if (/(activite|activites|historique|recent)/.test(q)) {
    const lines = data.activites.slice(0, 8).map((activity) => `${activity.user} ${activity.action} - ${activity.target}`);
    return {
      agent: 'administration',
      text: `Dernières activités:\n${formatList(lines, 'Aucune activité récente.')}`,
    };
  }

  if (/(document|documents|bulletin|bulletins|fiche|fiches|souche|souches|carnet|carnets|archive)/.test(q)) {
    const byType = data.documents.reduce<Record<string, number>>((acc, document) => {
      acc[document.type] = (acc[document.type] || 0) + 1;
      return acc;
    }, {});
    const lines = Object.entries(byType).map(([type, count]) => `${type}: ${count}`);
    return {
      agent: 'documents',
      text: [
        `Total documents: ${data.documents.length}`,
        lines.length ? `Par type:\n${formatList(lines, '')}` : 'Aucun document enregistré.',
      ].join('\n'),
    };
  }

  return {
    agent,
    text: [
      'Je peux répondre aux questions sur les élèves, écoles, documents, provinces, utilisateurs et activités.',
      "Exemple: “Aujourd'hui, combien de bulletins ont été stockés ?”",
    ].join('\n'),
  };
}

export default function DataChatbox() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      agent: 'general',
      text: 'Bonjour. Je suis votre assistant de données EPST. Posez une question sur les élèves, écoles, documents ou utilisateurs.',
    },
  ]);

  const data = useMemo<DataSnapshot>(
    () => ({
      documents: getDocuments(),
      ecoles: getEcoles(),
      utilisateurs: getUtilisateurs(),
      activites: getActivites(),
    }),
    [messages.length, open]
  );

  const submitQuestion = (value = input) => {
    const question = value.trim();
    if (!question) return;

    const response = answerQuestion(question, data);
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', text: question },
      { id: `a-${Date.now()}`, role: 'assistant', agent: response.agent, text: response.text },
    ]);
    setInput('');
    setOpen(true);
    setMinimized(false);
  };

  useEffect(() => {
    if (!open || minimized) return;
    scrollAnchorRef.current?.scrollIntoView({ block: 'end' });
  }, [open, minimized, messages.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-white shadow-2xl shadow-primary-900/25 transition-transform hover:scale-105"
        aria-label="Ouvrir l'assistant de données"
      >
        <MessageSquareText className="h-6 w-6" />
      </button>
    );
  }

  return (
    <section className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-[420px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
      <header className="flex items-center justify-between border-b border-[var(--color-border-light)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Assistant de données</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Agents EPST connectés aux données locales</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
            aria-label={minimized ? 'Agrandir le chat' : 'Réduire le chat'}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600"
            aria-label="Fermer le chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {!minimized && (
        <>
          <div className="max-h-[420px] min-h-[320px] space-y-3 overflow-y-auto bg-[var(--color-surface-alt)] p-4">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(agents)
                .filter(([id]) => id !== 'general')
                .map(([id, agent]) => {
                  const Icon = agent.icon;
                  return (
                    <div key={id} className={`rounded-xl border px-2 py-2 text-center text-[11px] font-semibold ${agent.color}`}>
                      <Icon className="mx-auto mb-1 h-4 w-4" />
                      {agent.name.replace('Agent ', '')}
                    </div>
                  );
                })}
            </div>

            {messages.map((message) => {
              const agent = message.agent ? agents[message.agent] : undefined;
              const Icon = agent?.icon || Sparkles;
              return (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'border border-[var(--color-border-light)] bg-white text-[var(--color-text-primary)]'
                    }`}
                  >
                    {agent && (
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-muted)]">
                        <Icon className="h-3.5 w-3.5" />
                        {agent.name}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={scrollAnchorRef} />
          </div>

          <div className="border-t border-[var(--color-border-light)] p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => submitQuestion(prompt)}
                  className="shrink-0 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitQuestion();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ex: liste des élèves pour l’école Institut Bosangani"
                className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-white hover:opacity-90"
                aria-label="Envoyer la question"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </section>
  );
}
