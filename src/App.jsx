import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar        from './components/Sidebar'
import Dashboard      from './pages/Dashboard'
import Branches       from './pages/Branches'
import Pasteurs       from './pages/Pasteurs'
import Fideles        from './pages/Fideles'
import Cultes         from './pages/Cultes'
import Finances       from './pages/Finances'
import Communication  from './pages/Communication'
import Ressources     from './pages/Ressources'
import Rapports       from './pages/Rapports'
import Administration from './pages/Administration'

const IconBell   = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconSearch = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9AA5B4" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconMenu   = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>

export default function App() {
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#F5F8FC] relative">

        {/* Overlay mobile */}
        <div className={`sidebar-overlay ${sideOpen ? 'open' : ''}`} onClick={() => setSideOpen(false)} />

        {/* Sidebar — fixe sur desktop, slide sur mobile */}
        <div className={`
          fixed inset-y-0 left-0 z-40 transition-transform duration-300
          md:static md:translate-x-0 md:z-auto
          ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setSideOpen(false)} />
        </div>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto min-w-0 md:ml-0">

          {/* Topbar */}
          <header className="bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 h-14">
            <div className="flex items-center gap-3">
              {/* Bouton menu mobile */}
              <button onClick={() => setSideOpen(true)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                <IconMenu />
              </button>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-0.5 h-5 bg-[#C8880A] rounded-full" />
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest hidden lg:block">
                  Mission Évangélique le Rocher de Sion — Guinée
                </p>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest lg:hidden">
                  MERS — Guinée
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative hidden sm:block">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><IconSearch /></div>
                <input placeholder="Rechercher..." className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8] w-36 md:w-44 transition-all focus:w-44 md:focus:w-56"/>
              </div>
              <button className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-[#6B7A8D]">
                <IconBell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-[#0D2B5E] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer hover:bg-[#1A5EA8] transition-colors">
                AB
              </div>
            </div>
          </header>

          {/* Pages */}
          <div className="px-4 md:px-8 py-5 md:py-7 max-w-screen-xl">
            <Routes>
              <Route path="/"                element={<Dashboard />}      />
              <Route path="/branches"        element={<Branches />}       />
              <Route path="/branches/new"    element={<Branches />}       />
              <Route path="/pasteurs"        element={<Pasteurs />}       />
              <Route path="/fideles"         element={<Fideles />}        />
              <Route path="/fideles/new"     element={<Fideles />}        />
              <Route path="/cultes"          element={<Cultes />}         />
              <Route path="/cultes/new"      element={<Cultes />}         />
              <Route path="/finances"        element={<Finances />}       />
              <Route path="/finances/new"    element={<Finances />}       />
              <Route path="/communication"   element={<Communication />}  />
              <Route path="/ressources"      element={<Ressources />}     />
              <Route path="/rapports"        element={<Rapports />}       />
              <Route path="/administration"  element={<Administration />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
