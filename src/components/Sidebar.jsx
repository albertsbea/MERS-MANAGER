import { NavLink } from 'react-router-dom'
import { IconGrid, IconBuilding, IconUsers, IconBook, IconTrendUp, IconLogOut } from './icons'

const links = [
  { to: '/',         icon: IconGrid,     label: 'Tableau de bord' },
  { to: '/branches', icon: IconBuilding, label: 'Branches' },
  { to: '/fideles',  icon: IconUsers,    label: 'Fidèles' },
  { to: '/cultes',   icon: IconBook,     label: 'Cultes & Présences' },
  { to: '/finances', icon: IconTrendUp,  label: 'Finances' },
]

export default function Sidebar() {
  return (
    <aside className="w-[220px] min-h-screen bg-[#0D2B5E] flex flex-col shrink-0 relative">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C8880A]" />
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C8880A] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">M</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MERS Manager</p>
            <p className="text-[#4A7FAA] text-[10px] mt-0.5">Rocher de Sion</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-3 pb-1">
        <p className="px-3 text-[9px] font-semibold text-[#3A6A9A] uppercase tracking-[0.12em] mb-2">Navigation</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group relative ${
                isActive
                  ? 'bg-[#1A5EA8] text-white font-semibold'
                  : 'text-[#7AABDC] hover:bg-white/8 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C8880A] rounded-full" />}
                <Icon size={16} color={isActive ? 'white' : '#7AABDC'} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-white/8 mt-auto">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 cursor-pointer group">
          <div className="w-8 h-8 rounded-xl bg-[#1A3F6F] flex items-center justify-center text-white text-xs font-bold shrink-0">
            AB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Albert Béavogui</p>
            <p className="text-[#4A7FAA] text-[10px]">Administrateur</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
