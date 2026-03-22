import { NavLink } from 'react-router-dom'

const G = ({s,c,d}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:d}}/>

const ICONS = {
  grid:     'M3,3h7v7H3V3zm11,0h7v7h-7V3zM3,14h7v7H3v-7zm11,0h7v7h-7v-7z',
  building: 'M4,2h16a2,2,0,0,1,2,2v16a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2zM9,22V12h6v10M8,7h.01M12,7h.01M16,7h.01M8,11h.01M16,11h.01',
  user_tie: 'M20,21v-2a4,4,0,0,0-4-4H8a4,4,0,0,0-4,4v2M12,3a4,4,0,1,0,0,8,4,4,0,0,0,0-8z',
  users:    'M16,21v-2a4,4,0,0,0-4-4H6a4,4,0,0,0-4,4v2M9,7a4,4,0,1,0,0,8,4,4,0,0,0,0-8zM22,21v-2a4,4,0,0,0-3-3.87M16,3.13a4,4,0,0,1,0,7.75',
  book:     'M4,19.5A2.5,2.5,0,0,1,6.5,17H20M6.5,2H20v20H6.5A2.5,2.5,0,0,1,4,19.5v-15A2.5,2.5,0,0,1,6.5,2z',
  trend:    'M22,7L13.5,15.5,8.5,10.5,2,17M16,7h6v6',
  msg:      'M21,15a2,2,0,0,1-2,2H7l-4,4V5a2,2,0,0,1,2-2h14a2,2,0,0,1,2,2z',
  file:     'M14,2H6a2,2,0,0,0-2,2v16a2,2,0,0,0,2,2h12a2,2,0,0,0,2-2V8zM14,2v6h6',
  chart:    'M18,20V10M12,20V4M6,20v-6',
  shield:   'M12,22s8-4,8-10V5l-8-3-8,3v7c0,6,8,10,8,10z',
  x:        'M18,6L6,18M6,6l12,12',
}

const SECTIONS = [
  { label:'Principal', links:[
    { to:'/',             icon:'grid',     label:'Tableau de bord' },
    { to:'/branches',     icon:'building', label:'Branches' },
    { to:'/pasteurs',     icon:'user_tie', label:'Pasteurs' },
    { to:'/fideles',      icon:'users',    label:'Fidèles' },
    { to:'/cultes',       icon:'book',     label:'Cultes & Présences' },
    { to:'/finances',     icon:'trend',    label:'Finances' },
  ]},
  { label:'Outils', links:[
    { to:'/communication', icon:'msg',    label:'Communication' },
    { to:'/ressources',    icon:'file',   label:'Ressources' },
    { to:'/rapports',      icon:'chart',  label:'Rapports' },
    { to:'/administration',icon:'shield', label:'Administration' },
  ]}
]

export default function Sidebar({ onClose }) {
  return (
    <aside className="w-[220px] h-full min-h-screen bg-[#0D2B5E] flex flex-col">
      <div className="absolute top-0 left-0 w-[220px] h-0.5 bg-[#C8880A]" />

      {/* Header */}
      <div className="px-5 py-5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C8880A] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">M</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MERS Manager</p>
            <p className="text-[#4A7FAA] text-[10px] mt-0.5">Rocher de Sion</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-[#4A7FAA] hover:text-white hover:bg-white/10">
            <G s={15} c="currentColor" d={ICONS.x}/>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3 pb-2 overflow-y-auto">
        {SECTIONS.map(({ label, links }) => (
          <div key={label} className="mb-4">
            <p className="px-3 text-[9px] font-semibold text-[#3A6A9A] uppercase tracking-[0.12em] mb-1.5">{label}</p>
            <div className="space-y-0.5">
              {links.map(({ to, icon, label: lbl }) => (
                <NavLink key={to} to={to} end={to==='/'} onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 relative ${
                      isActive ? 'bg-[#1A5EA8] text-white font-semibold' : 'text-[#7AABDC] hover:bg-white/8 hover:text-white'
                    }`
                  }>
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C8880A] rounded-full"/>}
                      <G s={15} c={isActive?'white':'#7AABDC'} d={ICONS[icon]}/>
                      <span className="truncate text-sm">{lbl}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-3 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 cursor-pointer">
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
