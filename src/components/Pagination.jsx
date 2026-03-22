// Composant Pagination réutilisable
export default function Pagination({ total, perPage, page, onPage }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const start = (page - 1) * perPage + 1
  const end   = Math.min(page * perPage, total)

  // Générer les numéros de pages visibles avec "..."
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
      <p className="text-xs text-slate-400">
        <span className="font-semibold text-slate-600">{start}–{end}</span> sur <span className="font-semibold text-slate-600">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        {/* Précédent */}
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-[#0D2B5E] disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-slate-200">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        {/* Numéros */}
        {pages.map((p, i) => p === '...' ? (
          <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-300">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
              page === p
                ? 'bg-[#0D2B5E] text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-[#0D2B5E] border border-transparent hover:border-slate-200'
            }`}>
            {p}
          </button>
        ))}

        {/* Suivant */}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-[#0D2B5E] disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-slate-200">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Sélecteur par page */}
      <select value={perPage} onChange={e => { onPage(1); onPage._setPerPage?.(Number(e.target.value)) }}
        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20">
        {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
      </select>
    </div>
  )
}
