import { NavLink } from "react-router-dom"

function cn(...cls) { return cls.filter(Boolean).join(' ') }

const IC = {
  grid:     <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  building: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M16 11h.01"/></svg>,
  user_tie: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11l-1 5 1 2 1-2-1-5"/></svg>,
  users:    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  book:     <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  trend:    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  msg:      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  file:     <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chart:    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  shield:   <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  help:     <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  x:        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevron:  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
}

const SECTIONS = [
  { label: 'Principal', links: [
    { to: '/',              icon: 'grid',     label: 'Tableau de bord' },
    { to: '/branches',      icon: 'building', label: 'Branches' },
    { to: '/pasteurs',      icon: 'user_tie', label: 'Pasteurs' },
    { to: '/fideles',       icon: 'users',    label: 'Fidèles' },
    { to: '/cultes',        icon: 'book',     label: 'Cultes & Présences' },
    { to: '/finances',      icon: 'trend',    label: 'Finances' },
  ]},
  { label: 'Outils', links: [
    { to: '/communication', icon: 'msg',    label: 'Communication' },
    { to: '/ressources',    icon: 'file',   label: 'Ressources' },
    { to: '/rapports',      icon: 'chart',  label: 'Rapports' },
    { to: '/administration',icon: 'shield', label: 'Administration' },
    { to: '/guide',         icon: 'help',   label: 'FAQ' },
  ]},
]

export function AppSidebar({ onClose }) {
  return (
    <aside className="flex h-full w-[240px] min-h-screen flex-col bg-[#0D2B5E] select-none">
      {/* Accent doré */}
      <div className="h-[3px] shrink-0" style={{ background: 'linear-gradient(90deg, #C8880A, #E5A830, #C8880A)' }} />

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8880A] text-sm font-bold text-white shadow-md shrink-0">
            M
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">MERS Manager</p>
            <p className="text-[10px]" style={{ color: 'rgba(122,171,220,0.6)' }}>Rocher de Sion</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="md:hidden flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ color: 'rgba(122,171,220,0.6)' }}>
            {IC.x}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {SECTIONS.map(({ label, links }) => (
          <div key={label}>
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(122,171,220,0.4)' }}>
              {label}
            </p>
            <ul className="space-y-0.5">
              {links.map(({ to, icon, label: lbl }) => (
                <li key={to}>
                  <NavLink to={to} end={to === '/'} onClick={onClose}
                    className={({ isActive }) => [
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all relative",
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-[rgba(122,171,220,0.7)] hover:bg-white/7 hover:text-white"
                    ].join(' ')}>
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#C8880A]" />
                        )}
                        <span style={{ color: isActive ? '#C8880A' : undefined }}
                          className={isActive ? '' : 'text-[rgba(74,127,170,1)] group-hover:text-white transition-colors'}>
                          {IC[icon]}
                        </span>
                        <span className="truncate">{lbl}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profil */}
      <div className="shrink-0 border-t border-white/[0.07] px-3 py-3">
        <NavLink to="/profil" onClick={onClose}
          className={({ isActive }) => [
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            isActive ? "bg-white/10" : "hover:bg-white/7"
          ].join(' ')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C8880A] text-xs font-bold text-white">
            AB
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-white">Albert Béavogui</p>
            <p className="text-[10px]" style={{ color: 'rgba(122,171,220,0.5)' }}>Administrateur</p>
          </div>
          <span style={{ color: 'rgba(122,171,220,0.3)' }}>{IC.chevron}</span>
        </NavLink>
      </div>
    </aside>
  )
}
