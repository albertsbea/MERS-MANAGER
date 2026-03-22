// Modal de confirmation réutilisable pour toutes les suppressions
// Usage: <ConfirmModal isOpen onConfirm={fn} onClose={fn} title="..." message="..." type="danger|warning|info" />

const ICONS = {
  danger: (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  warning: (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#C8880A" strokeWidth="1.8" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#1A5EA8" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
}

const STYLES = {
  danger:  { iconBg:'#FCEBEB', btnClass:'bg-red-500 hover:bg-red-600 text-white', btnLabel:'Supprimer' },
  warning: { iconBg:'#FEF6E7', btnClass:'bg-[#C8880A] hover:bg-[#a36d07] text-white', btnLabel:'Confirmer' },
  info:    { iconBg:'#E6F1FB', btnClass:'bg-[#1A5EA8] hover:bg-[#0D2B5E] text-white', btnLabel:'Confirmer' },
}

export default function ConfirmModal({
  isOpen, onClose, onConfirm,
  title       = 'Confirmer la suppression',
  message     = 'Cette action est irréversible.',
  detail,
  type        = 'danger',
  confirmLabel,
  loading     = false,
}) {
  if (!isOpen) return null
  const s = STYLES[type] || STYLES.danger

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0D2B5E]/25 backdrop-blur-[2px]" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden">

        {/* Bande couleur top */}
        <div className={`h-1 w-full ${type === 'danger' ? 'bg-red-500' : type === 'warning' ? 'bg-[#C8880A]' : 'bg-[#1A5EA8]'}`}/>

        <div className="px-6 py-6">
          {/* Icône */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{background: s.iconBg}}>
              {ICONS[type]}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-bold text-[#0D2B5E] text-base leading-tight">{title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
              {detail && (
                <div className="mt-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                  <p className="text-xs text-slate-600 font-medium">{detail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2.5">
            <button onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-40">
              Annuler
            </button>
            <button onClick={onConfirm} disabled={loading}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 ${s.btnClass}`}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Suppression...
                </>
              ) : (
                confirmLabel || s.btnLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
