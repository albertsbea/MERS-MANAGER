import { Trash2, AlertTriangle, Info, X } from 'lucide-react'

function cn(...cls) { return cls.filter(Boolean).join(' ') }

const CONFIG = {
  danger:  { Icon: Trash2,        iconCls: 'text-red-500',    bg: 'bg-red-50',    btnCls: 'bg-red-500 text-white hover:bg-red-600',       label: 'Supprimer' },
  warning: { Icon: AlertTriangle, iconCls: 'text-amber-600',  bg: 'bg-amber-50',  btnCls: 'bg-[#C8880A] text-white hover:bg-[#a87209]',   label: 'Confirmer' },
  info:    { Icon: Info,          iconCls: 'text-[#1A5EA8]',  bg: 'bg-[#EBF3FC]', btnCls: 'bg-[#0D2B5E] text-white hover:bg-[#152f6b]',  label: 'Confirmer' },
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirmer', message = 'Cette action est irréversible.', detail, type = 'danger', confirmLabel, loading = false }) {
  if (!isOpen) return null
  const { Icon, iconCls, bg, btnCls, label } = CONFIG[type] || CONFIG.danger

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-50 w-full max-w-sm rounded-xl border border-[#e2e8f0] bg-white shadow-2xl overflow-hidden">
        {/* Barre couleur top */}
        <div className={cn("h-1 w-full", type === 'danger' ? 'bg-red-500' : type === 'warning' ? 'bg-[#C8880A]' : 'bg-[#1A5EA8]')} />

        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start gap-4 mb-5">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bg)}>
              <Icon size={20} className={iconCls} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-base font-semibold text-[#0f172a] leading-tight">{title}</h3>
              <p className="mt-1 text-sm text-[#64748b] leading-relaxed">{message}</p>
              {detail && (
                <div className="mt-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2">
                  <p className="text-xs text-[#64748b] font-medium">{detail}</p>
                </div>
              )}
            </div>
            <button onClick={onClose} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9] transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} disabled={loading}
              className="h-9 rounded-md border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#64748b] shadow-sm hover:bg-[#f8fafc] transition-colors disabled:opacity-40 cursor-pointer">
              Annuler
            </button>
            <button onClick={onConfirm} disabled={loading}
              className={cn("h-9 rounded-md px-4 text-sm font-medium shadow-sm transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-2", btnCls)}>
              {loading ? (
                <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> En cours...</>
              ) : (
                confirmLabel || label
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
