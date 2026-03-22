import { NavLink } from 'react-router-dom'

const IconGrid     = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
const IconBuilding = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M16 11h.01"/></svg>
const IconUsers    = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconBook     = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconTrend    = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const IconMsg      = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconFile     = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconChart    = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconShield   = ({ s, c }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

const SECTIONS = [
  {
    label: 'Principal',
    links: [
      { to: '/',            Icon: IconGrid,     label: 'Tableau de bord' },
      { to: '/branches',    Icon: IconBuilding, label: 'Branches' },
      { to: '/fideles',     Icon: IconUsers,    label: 'Fidèles' },
      { to: '/cultes',      Icon: IconBook,     label: 'Cultes & Présences' },
      { to: '/finances',    Icon: IconTrend,    label: 'Finances' },
    ]
  },
  {
    label: 'Outils',
    links: [
      { to: '/communication', Icon: IconMsg,    label: 'Communication' },
      { to: '/ressources',    Icon: IconFile,   label: 'Ressources' },
      { to: '/rapports',      Icon: IconChart,  label: 'Rapports & Analytics' },
      { to: '/administration',Icon: IconShield, label: 'Administration' },
    ]
  }
]

export default function Sidebar() {
  return (
    <aside className="w-[220px] min-h-screen bg-[#0D2B5E] flex flex-col shrink-0 relative">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C8880A]" />

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C8880A] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">M</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MERS Manager</p>
            <p className="text-[#4A7FAA] text-[10px] mt-0.5">Rocher de Sion</p>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 pt-3 pb-2 overflow-y-auto">
        {SECTIONS.map(({ label, links }) => (
          <div key={label} className="mb-4">
            <p className="px-3 text-[9px] font-semibold text-[#3A6A9A] uppercase tracking-[0.12em] mb-1.5">{label}</p>
            <div className="space-y-0.5">
              {links.map(({ to, Icon, label: lbl }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 relative ${
                      isActive ? 'bg-[#1A5EA8] text-white font-semibold' : 'text-[#7AABDC] hover:bg-white/8 hover:text-white'
                    }`
                  }>
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C8880A] rounded-full" />}
                      <Icon s={15} c={isActive ? 'white' : '#7AABDC'}/>
                      <span className="truncate">{lbl}</span>
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
