import { IconX } from './icons'

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>{children}</div>
}
export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-slate-50 ${className}`}>{children}</div>
}
export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, type = 'button', className = '' }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed select-none'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary:   'bg-[#0D2B5E] text-white hover:bg-[#1A5EA8] focus:ring-[#1A5EA8] active:scale-95',
    secondary: 'bg-white text-[#344861] border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
    gold:      'bg-[#C8880A] text-white hover:bg-[#a36d07] focus:ring-[#C8880A] active:scale-95',
    danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 active:scale-95',
    ghost:     'text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-200',
    success:   'bg-[#1D9E75] text-white hover:bg-[#0F6E56] focus:ring-[#1D9E75] active:scale-95',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
      <input className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8] transition-colors bg-white ${error ? 'border-red-400' : ''} ${className}`} {...props} />
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
      <select className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8] transition-colors bg-white cursor-pointer ${error ? 'border-red-400' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Badge({ children, color = 'blue', size = 'sm' }) {
  const colors = {
    blue:   'bg-[#E6F1FB] text-[#0C447C]',
    green:  'bg-[#EAF3DE] text-[#3B6D11]',
    yellow: 'bg-[#FAEEDA] text-[#633806]',
    red:    'bg-[#FCEBEB] text-[#791F1F]',
    slate:  'bg-slate-100 text-slate-600',
    purple: 'bg-[#EEEDFE] text-[#3C3489]',
    teal:   'bg-[#E1F5EE] text-[#0F6E56]',
    navy:   'bg-[#EBF3FC] text-[#0D2B5E]',
    gold:   'bg-[#FEF6E7] text-[#854F0B]',
    pink:   'bg-[#FBEAF0] text-[#72243E]',
  }
  const sizes = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' }
  return (
    <span className={`inline-flex items-center rounded-md font-medium ${colors[color] || colors.blue} ${sizes[size] || sizes.sm}`}>
      {children}
    </span>
  )
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0D2B5E]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col border border-slate-100`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <h2 className="text-base font-bold text-[#0D2B5E]">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <IconX size={15}/>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function StatCard({ label, value, sub, icon, accent = 'blue', trend, trendLabel }) {
  const accents = {
    blue:   { bar: 'bg-[#1A5EA8]', iconBg: 'bg-[#E6F1FB]', ic: '#1A5EA8' },
    gold:   { bar: 'bg-[#C8880A]', iconBg: 'bg-[#FEF6E7]', ic: '#C8880A' },
    green:  { bar: 'bg-[#1D9E75]', iconBg: 'bg-[#E1F5EE]', ic: '#1D9E75' },
    purple: { bar: 'bg-[#534AB7]', iconBg: 'bg-[#EEEDFE]', ic: '#534AB7' },
    red:    { bar: 'bg-red-500',   iconBg: 'bg-red-50',     ic: '#ef4444' },
    navy:   { bar: 'bg-[#0D2B5E]', iconBg: 'bg-[#EBF3FC]', ic: '#0D2B5E' },
  }
  const a = accents[accent] || accents.blue
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`h-1 w-full ${a.bar}`} />
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-[#0D2B5E] leading-tight truncate">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          {trend !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${trend >= 0 ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-[#FCEBEB] text-[#791F1F]'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span><span>{trendLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-11 h-11 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0`}>
            {icon(a.ic)}
          </div>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">{icon}</div>}
      <p className="font-semibold text-slate-600 text-base">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-[3px] border-[#1A5EA8]/20 border-t-[#1A5EA8] rounded-full animate-spin" />
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-xl font-bold text-[#0D2B5E] leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Th({ children, right = false }) {
  return <th className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/80 ${right ? 'text-right' : 'text-left'}`}>{children}</th>
}

export function Td({ children, right = false, bold = false, className = '' }) {
  return <td className={`px-4 py-3.5 ${right ? 'text-right' : ''} ${bold ? 'font-semibold text-[#0D2B5E]' : 'text-slate-600'} ${className}`}>{children}</td>
}
