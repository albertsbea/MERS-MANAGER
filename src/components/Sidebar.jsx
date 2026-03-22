import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',          icon: '📊', label: 'Tableau de bord' },
  { to: '/branches',  icon: '🏛️', label: 'Branches' },
  { to: '/fideles',   icon: '👥', label: 'Fidèles' },
  { to: '/cultes',    icon: '📖', label: 'Cultes & Présences' },
  { to: '/finances',  icon: '💰', label: 'Finances' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-[#0D2B5E] flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C8880A] rounded-full flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MERS Manager</p>
            <p className="text-blue-300 text-xs">Rocher de Sion</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-white/15 text-white font-semibold border-l-2 border-[#C8880A]'
                  : 'text-blue-200 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-blue-400 text-xs">Version MVP 1.0</p>
        <p className="text-blue-500 text-xs">Équipe Média MERS</p>
      </div>
    </aside>
  )
}
