import { useState } from 'react'

const DOC_URL = '/MERS_Documentation.pdf'

async function downloadDoc() {
  try {
    const res  = await fetch(DOC_URL)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'MERS_Manager_Documentation.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    window.open(DOC_URL, '_blank')
  }
}

const FAQS = [
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    q: 'Par où commencer sur MERS Manager ?',
    a: 'Suivez cet ordre : créez d\'abord vos branches, puis ajoutez les pasteurs, ensuite inscrivez les fidèles, et enfin enregistrez les cultes. Chaque module dépend du précédent.',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    q: 'Comment inscrire un nouveau fidèle ?',
    a: 'Allez dans Fidèles → "+ Nouveau fidèle". Renseignez les informations personnelles, choisissez le département (Papas, Mamans, Jeunes ou Enfants), et indiquez le statut de baptême et du discipolat.',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    q: 'Comment enregistrer les présences d\'un culte ?',
    a: 'Sur la carte du culte dans le module Cultes, cliquez "Saisir présences". Une fenêtre s\'ouvre avec les 5 catégories : Papas, Mamans, Jeunes, Enfants, Visiteurs. Le total se calcule automatiquement.',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>,
    q: 'Comment voir le bilan financier d\'une branche ?',
    a: 'Allez dans Rapports → onglet "Finances" → sélectionnez la branche dans le filtre. Le tableau affiche les recettes, les dépenses et le solde net. Vous pouvez exporter ce bilan en PDF.',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    q: 'Comment uploader un document dans la bibliothèque ?',
    a: 'Ressources → "+ Ajouter" → choisissez le type → cliquez la zone upload et sélectionnez votre fichier (PDF, Word, Excel, Image...). Attendez "Fichier prêt" puis cliquez Enregistrer. Taille max : 50 Mo.',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    q: 'Comment générer un rapport global en PDF ?',
    a: 'Rapports → onglet "Vue globale" → cliquez "Télécharger le rapport global complet". Ce PDF inclut tous les membres, finances, pasteurs et présences de toutes les branches.',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    q: 'Le bouton "Exporter sélection" est grisé, pourquoi ?',
    a: 'Ce bouton ne s\'active que si au moins un filtre est sélectionné (région, branche ou dates). Sans filtre, utilisez directement le rapport global disponible dans l\'onglet "Vue globale".',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    q: 'Les notifications ne s\'affichent pas ?',
    a: 'Vérifiez que des annonces ont été publiées dans le module Communication. Les alertes système (cultes sans présences, nouveaux membres) se génèrent automatiquement. Le badge rouge apparaît en haut à droite.',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    q: 'Comment changer mon mot de passe ?',
    a: 'Cliquez sur votre avatar (initiales en haut à droite) → Profil & Paramètres → onglet "Sécurité" → saisissez le nouveau mot de passe deux fois → "Changer le mot de passe". Minimum 8 caractères.',
  },
  {
    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    q: 'Peut-on modifier les présences après coup ?',
    a: 'Oui, sans limite. Cliquez "Modifier présences" sur la carte du culte concerné. Les nouvelles valeurs remplacent automatiquement les anciennes sans créer de doublon.',
  },
]

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="flex items-start gap-4 py-5 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors"
      onClick={() => setOpen(p => !p)}>
      {/* Icône */}
      <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0 text-slate-500 mt-0.5">
        {item.icon}
      </div>
      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${open ? 'text-[#0D2B5E]' : 'text-slate-800'}`}>
          {item.q}
        </p>
        {open && (
          <p className="text-sm text-slate-500 leading-relaxed mt-2">{item.a}</p>
        )}
      </div>
      {/* Chevron */}
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CBD5E0" strokeWidth="2.5" strokeLinecap="round"
        className={`shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  )
}

export default function Guide() {
  // Diviser en 2 colonnes
  const half = Math.ceil(FAQS.length / 2)
  const col1 = FAQS.slice(0, half)
  const col2 = FAQS.slice(half)

  return (
    <div>
      {/* Header — style image de référence */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D2B5E] mb-2">
            Foire aux Questions
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Réponses rapides aux questions fréquentes. Vous ne trouvez pas ce que vous cherchez ?{' '}
            <a href="https://wa.me/224624228555" target="_blank" rel="noopener noreferrer"
              className="underline underline-offset-2 text-slate-600 hover:text-[#0D2B5E] transition-colors">
              Consultez la documentation complète
            </a>.
          </p>
        </div>
        {/* Bouton Documentation */}
        <button onClick={downloadDoc}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm whitespace-nowrap">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <polyline points="8 13 12 17 16 13"/>
            <line x1="12" y1="17" x2="12" y2="9"/>
          </svg>
          Documentation
        </button>
      </div>

      {/* Grille 2 colonnes FAQ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12">
        <div>{col1.map((item, i) => <FAQItem key={i} item={item}/>)}</div>
        <div>{col2.map((item, i) => <FAQItem key={i} item={item}/>)}</div>
      </div>

      {/* Section Contact */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <h2 className="text-base font-bold text-[#0D2B5E] mb-1">Besoin d'aide supplémentaire ?</h2>
        <p className="text-sm text-slate-500 mb-5">Notre équipe est disponible pour vous accompagner.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          {/* WhatsApp */}
          <a href="https://wa.me/224624228555" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-md hover:border-[#1D9E75]/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center shrink-0">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="#1D9E75">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0D2B5E]">WhatsApp</p>
              <p className="text-xs text-slate-400">+224 624 228 555</p>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#CBD5E0" strokeWidth="2.5" strokeLinecap="round" className="group-hover:stroke-[#1D9E75] transition-colors shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
          </a>

          {/* Documentation PDF */}
          <button onClick={downloadDoc}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-md hover:border-[#1A5EA8]/40 transition-all group text-left w-full">
            <div className="w-10 h-10 rounded-xl bg-[#E6F1FB] flex items-center justify-center shrink-0">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1A5EA8" strokeWidth="1.8" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0D2B5E]">Documentation</p>
              <p className="text-xs text-slate-400">Guide complet PDF</p>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#CBD5E0" strokeWidth="2.5" strokeLinecap="round" className="group-hover:stroke-[#1A5EA8] transition-colors shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
