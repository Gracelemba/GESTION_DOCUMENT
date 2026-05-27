-- Table: ecoles
CREATE TABLE public.ecoles (
    id text PRIMARY KEY,
    nom text NOT NULL,
    province text,
    commune text,
    adresse text,
    type text,
    code_direct text
);

-- Table: utilisateurs
CREATE TABLE public.utilisateurs (
    id text PRIMARY KEY,
    nom text NOT NULL,
    email text UNIQUE NOT NULL,
    role text,
    province text,
    statut text,
    derniere_connexion text
);

-- Table: documents
CREATE TABLE public.documents (
    id text PRIMARY KEY,
    type text NOT NULL,
    eleve_id text,
    eleve_nom text,
    file_nom text NOT NULL,
    file_size text,
    file_path text NOT NULL,
    province text,
    ecole text,
    classe text,
    annee_scolaire text,
    date_creation text,
    statut text,
    metier_option text,
    trimestre text,
    photo_url text,
    numero_serie text,
    reference_courrier text,
    direction text
);

-- Table: notifications
CREATE TABLE public.notifications (
    id text PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    type text,
    time text,
    read boolean DEFAULT false
);

-- Table: activites
CREATE TABLE public.activites (
    id text PRIMARY KEY,
    "user" text NOT NULL,
    action text NOT NULL,
    target text NOT NULL,
    time text,
    type text
);

-- Table: options
CREATE TABLE public.options (
    id text PRIMARY KEY DEFAULT 'options_default',
    provinces text[] DEFAULT '{}',
    classes text[] DEFAULT '{}',
    annees_scolaires text[] DEFAULT '{}',
    metiers_options text[] DEFAULT '{}'
);
