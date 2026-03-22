// ── Formatters ───────────────────────────────────────────────
export const formatGNF = (amount) =>
  new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', minimumFractionDigits: 0 })
    .format(amount || 0)

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

// ── Constantes ───────────────────────────────────────────────
export const DEPARTEMENTS = {
  papas:   { label: 'Papas',   color: 'bg-blue-100 text-blue-800' },
  mamans:  { label: 'Mamans',  color: 'bg-pink-100 text-pink-800' },
  jeunes:  { label: 'Jeunes',  color: 'bg-green-100 text-green-800' },
  enfants: { label: 'Enfants', color: 'bg-yellow-100 text-yellow-800' },
}

export const TYPE_CULTE = {
  dimanche: { label: 'Dimanche', color: 'bg-indigo-100 text-indigo-800' },
  semaine:  { label: 'Semaine',  color: 'bg-slate-100 text-slate-700' },
  special:  { label: 'Spécial',  color: 'bg-amber-100 text-amber-800' },
}

export const DISCIPOLAT = {
  non_commence: { label: 'Non commencé', color: 'bg-red-100 text-red-700' },
  en_cours:     { label: 'En cours',     color: 'bg-yellow-100 text-yellow-700' },
  complete:     { label: 'Complété',     color: 'bg-green-100 text-green-700' },
}

export const STATUT_BRANCHE = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  suspendue: { label: 'Suspendue', color: 'bg-yellow-100 text-yellow-700' },
  fermee:    { label: 'Fermée',    color: 'bg-red-100 text-red-700' },
}

export const CATEGORIES_DEPENSE = {
  fonctionnement: 'Fonctionnement',
  pastoral:       'Pastoral',
  investissement: 'Investissement',
  prime_pasteur:  'Prime pasteur',
  autre:          'Autre',
}

export const ROLES = {
  administrateur:    { label: 'Administrateur',    color: 'purple', desc: 'Accès total à la plateforme' },
  directeur:         { label: 'Directeur National', color: 'navy',   desc: 'Vue nationale en lecture' },
  pasteur_titulaire: { label: 'Pasteur Titulaire',  color: 'blue',   desc: 'Gestion de sa branche' },
  pasteur_assistant: { label: 'Pasteur Assistant',  color: 'teal',   desc: 'Sa branche en lecture' },
  secretaire:        { label: 'Secrétaire',          color: 'slate',  desc: 'Fidèles et cultes' },
  tresorier:         { label: 'Trésorier',           color: 'gold',   desc: 'Finances uniquement' },
}

export const TYPE_ANNONCE = {
  info:      { label: 'Information', color: 'blue' },
  urgent:    { label: 'Urgent',      color: 'red' },
  evenement: { label: 'Événement',   color: 'purple' },
  priere:    { label: 'Prière',      color: 'teal' },
}

export const TYPE_RESSOURCE = {
  predication: { label: 'Prédication', color: 'blue' },
  document:    { label: 'Document',    color: 'slate' },
  formulaire:  { label: 'Formulaire',  color: 'gold' },
  media:       { label: 'Média',       color: 'purple' },
}
