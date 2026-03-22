import { NavLink } from 'react-router-dom'

const IC = {
  grid:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  building:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M16 11h.01"/></svg>,
  user_tie:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11l-1 5 1 2 1-2-1-5"/></svg>,
  users:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  book:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  trend:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  msg:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  file:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chart:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  shield:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  help:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  x:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

function Icon({ name, active }) {
  return (
    <span className="shrink-0" style={{ width:16, height:16, display:'flex', color: active ? 'white' : '#7AABDC' }}>
      {IC[name]}
    </span>
  )
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
    { to: '/guide',         icon: 'help',   label: 'Guide' },
  ]},
]

export default function Sidebar({ onClose }) {
  return (
    <aside className="w-[220px] h-full min-h-screen bg-[#0D2B5E] flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C8880A]" />

      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C8880A] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">M</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MERS Manager</p>
            <p className="text-[#4A7FAA] text-[10px] mt-0.5">Rocher de Sion</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-[#4A7FAA] hover:text-white hover:bg-white/10">
            <span style={{width:15,height:15,display:'flex',color:'currentColor'}}>{IC.x}</span>
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 pt-3 pb-2 overflow-y-auto">
        {SECTIONS.map(({ label, links }) => (
          <div key={label} className="mb-4">
            <p className="px-3 text-[9px] font-semibold text-[#3A6A9A] uppercase tracking-[0.15em] mb-1.5">{label}</p>
            <div className="space-y-0.5">
              {links.map(({ to, icon, label: lbl }) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 relative ${
                      isActive ? 'bg-[#1A5EA8] text-white font-semibold' : 'text-[#7AABDC] hover:bg-white/10 hover:text-white'
                    }`
                  }>
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C8880A] rounded-full"/>}
                      <Icon name={icon} active={isActive} />
                      <span className="truncate">{lbl}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-[#1A3F6F] flex items-center justify-center text-white text-xs font-bold shrink-0">AB</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Albert Béavogui</p>
            <p className="text-[#4A7FAA] text-[10px]">Administrateur</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
