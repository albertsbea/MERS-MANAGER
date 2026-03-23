import { IconX } from './icons'

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  )
}
export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

// ── Button ───────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, type = 'button', className = '' }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]'
  const sizes = {
    sm:  'px-3 py-1.5 text-xs',
    md:  'px-4 py-2.5 text-sm',
    lg:  'px-5 py-3 text-sm',
  }
  const variants = {
    primary:   'bg-[#0D2B5E] text-white hover:bg-[#152f6b] focus:ring-[#1A5EA8] shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 shadow-sm',
    gold:      'bg-[#C8880A] text-white hover:bg-[#a87209] focus:ring-[#C8880A] shadow-sm',
    danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm',
    ghost:     'text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-200',
    success:   'bg-[#1D9E75] text-white hover:bg-[#0F6E56] focus:ring-[#1D9E75] shadow-sm',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────────
export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      )}
      <input
        className={`w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800
          placeholder:text-slate-300 bg-white
          focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]
          transition-all
          ${error ? 'border-red-400 focus:ring-red-200' : ''}
          ${className}`}
        {...props}
      />
      {hint  && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ── Select ───────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      )}
      <select
        className={`w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800
          bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]
          transition-all cursor-pointer
          ${error ? 'border-red-400' : ''}
          ${className}`}
        {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ── Badge ────────────────────────────────────────────────────
export function Badge({ children, color = 'blue', size = 'sm' }) {
  const colors = {
    blue:   'bg-[#EBF3FC] text-[#1A5EA8]',
    green:  'bg-[#E3F5ED] text-[#0F6E56]',
    yellow: 'bg-[#FEF6E7] text-[#854F0B]',
    red:    'bg-[#FEF0F0] text-[#C13333]',
    slate:  'bg-slate-100 text-slate-600',
    purple: 'bg-[#EEF0FE] text-[#4842A8]',
    teal:   'bg-[#E0F5EF] text-[#0F7A5A]',
    navy:   'bg-[#EBF3FC] text-[#0D2B5E]',
    gold:   'bg-[#FEF6E7] text-[#854F0B]',
    pink:   'bg-[#FDE8F0] text-[#92254E]',
  }
  const sizes = {
    xs: 'px-2 py-0.5 text-[10px] rounded-md',
    sm: 'px-2.5 py-0.5 text-xs rounded-md',
    md: 'px-3 py-1 text-xs rounded-lg',
  }
  return (
    <span className={`inline-flex items-center font-semibold ${colors[color] || colors.blue} ${sizes[size] || sizes.sm}`}>
      {children}
    </span>
  )
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
        style={{boxShadow:'0 25px 60px -12px rgba(13,43,94,0.25)'}}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#0D2B5E]">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <IconX size={15}/>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── StatCard ─────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, accent = 'blue', trend, trendLabel }) {
  const accents = {
    blue:   { iconBg: 'bg-[#EBF3FC]', ic: '#1A5EA8' },
    gold:   { iconBg: 'bg-[#FEF6E7]', ic: '#C8880A' },
    green:  { iconBg: 'bg-[#E1F5EE]', ic: '#1D9E75' },
    purple: { iconBg: 'bg-[#EEF0FE]', ic: '#534AB7' },
    red:    { iconBg: 'bg-[#FEF0F0]', ic: '#E24B4A' },
    navy:   { iconBg: 'bg-[#EBF3FC]', ic: '#0D2B5E' },
    teal:   { iconBg: 'bg-[#E0F5EF]', ic: '#0F7A5A' },
  }
  const a = accents[accent] || accents.blue
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      {icon && (
        <div className={`w-12 h-12 rounded-2xl ${a.iconBg} flex items-center justify-center shrink-0`}>
          {icon(a.ic)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#0D2B5E] leading-tight truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold
            ${trend >= 0 ? 'bg-[#E3F5ED] text-[#0F6E56]' : 'bg-[#FEF0F0] text-[#C13333]'}`}>
            <span>{trend >= 0 ? '↑' : '↓'}</span>
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <p className="font-semibold text-slate-700 text-base">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-[3px] border-[#1A5EA8]/15 border-t-[#1A5EA8] rounded-full animate-spin" />
      <p className="text-xs text-slate-400 font-medium">Chargement...</p>
    </div>
  )
}

// ── PageHeader ───────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-7 gap-4">
      <div>
        <h1 className="text-xl font-bold text-[#0D2B5E] leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── Table helpers ────────────────────────────────────────────
export function Th({ children, right = false }) {
  return (
    <th className={`px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}
export function Td({ children, right = false, bold = false, className = '' }) {
  return (
    <td className={`px-5 py-3.5 text-sm ${right ? 'text-right' : ''} ${bold ? 'font-semibold text-[#0D2B5E]' : 'text-slate-600'} ${className}`}>
      {children}
    </td>
  )
}

