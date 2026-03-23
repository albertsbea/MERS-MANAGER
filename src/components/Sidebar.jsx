import { NavLink, useLocation } from 'react-router-dom'

// ── Icônes SVG ───────────────────────────────────────────────
const IC = {
  grid:     <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  building: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M16 11h.01"/></svg>,
  user_tie: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11l-1 5 1 2 1-2-1-5"/></svg>,
  users:    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  book:     <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  trend:    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  msg:      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  file:     <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chart:    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  shield:   <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  help:     <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  x:        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

const SECTIONS = [
  {
    label: 'Principal',
    links: [
      { to: '/',              icon: 'grid',     label: 'Tableau de bord' },
      { to: '/branches',      icon: 'building', label: 'Branches' },
      { to: '/pasteurs',      icon: 'user_tie', label: 'Pasteurs' },
      { to: '/fideles',       icon: 'users',    label: 'Fidèles' },
      { to: '/cultes',        icon: 'book',     label: 'Cultes & Présences' },
      { to: '/finances',      icon: 'trend',    label: 'Finances' },
    ],
  },
  {
    label: 'Outils',
    links: [
      { to: '/communication', icon: 'msg',    label: 'Communication' },
      { to: '/ressources',    icon: 'file',   label: 'Ressources' },
      { to: '/rapports',      icon: 'chart',  label: 'Rapports' },
      { to: '/administration',icon: 'shield', label: 'Administration' },
      { to: '/guide',         icon: 'help',   label: 'FAQ' },
    ],
  },
]

export default function Sidebar({ onClose }) {
  return (
    <aside className="w-[230px] h-full min-h-screen bg-[#0D2B5E] flex flex-col select-none">
      {/* Trait doré en haut */}
      <div className="h-[3px] bg-gradient-to-r from-[#C8880A] via-[#E5A830] to-[#C8880A] shrink-0"/>

      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C8880A] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
            M
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MERS Manager</p>
            <p className="text-[#4A7FAA] text-[10px] mt-0.5">Rocher de Sion</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-[#4A7FAA] hover:text-white hover:bg-white/10 transition-colors">
            {IC.x}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto">
        {SECTIONS.map(({ label, links }) => (
          <div key={label} className="mb-5">
            <p className="px-3 mb-1.5 text-[10px] font-bold text-[#2A5080] uppercase tracking-[0.18em]">
              {label}
            </p>
            <div className="space-y-0.5">
              {links.map(({ to, icon, label: lbl }) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 relative ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-[#6A9EC0] hover:bg-white/7 hover:text-white'
                    }`
                  }>
                  {({ isActive }) => (
                    <>
                      {/* Indicateur actif */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#C8880A] rounded-r-full"/>
                      )}
                      {/* Icône */}
                      <span className={`shrink-0 transition-colors ${isActive ? 'text-[#C8880A]' : 'text-[#4A7FAA] group-hover:text-white'}`}
                        style={{width:18, height:18, display:'flex', alignItems:'center'}}>
                        {IC[icon]}
                      </span>
                      <span className="truncate">{lbl}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Profil bas */}
      <div className="px-3 pb-4 pt-3 border-t border-white/[0.07] shrink-0">
        <NavLink to="/profil" onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-white/10' : 'hover:bg-white/7'}`
          }>
          <div className="w-8 h-8 rounded-xl bg-[#C8880A] flex items-center justify-center text-white text-xs font-bold shrink-0">
            AB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Albert Béavogui</p>
            <p className="text-[#4A7FAA] text-[10px]">Administrateur</p>
          </div>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#4A7FAA" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </NavLink>
      </div>
    </aside>
  )
}

