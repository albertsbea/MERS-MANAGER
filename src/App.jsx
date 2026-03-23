import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Sidebar        from './components/Sidebar'
import NotifPanel, { useNotifications } from './components/NotifPanel'
import Login          from './pages/Login'
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
import Profil         from './pages/Profil'
import Guide          from './pages/Guide'

// Breadcrumb map
const PAGE_TITLES = {
  '/':               { label: 'Tableau de bord', sub: 'Vue d\'ensemble de l\'activité' },
  '/branches':       { label: 'Branches',         sub: 'Gestion des assemblées locales' },
  '/pasteurs':       { label: 'Pasteurs',          sub: 'Corps pastoral de la MERS' },
  '/fideles':        { label: 'Fidèles',           sub: 'Registre des membres' },
  '/cultes':         { label: 'Cultes',            sub: 'Célébrations et présences' },
  '/finances':       { label: 'Finances',          sub: 'Collectes et dépenses' },
  '/communication':  { label: 'Communication',     sub: 'Annonces et notifications' },
  '/ressources':     { label: 'Ressources',        sub: 'Bibliothèque numérique' },
  '/rapports':       { label: 'Rapports',          sub: 'Analyses et exports PDF' },
  '/administration': { label: 'Administration',    sub: 'Comptes et permissions' },
  '/profil':         { label: 'Mon Profil',        sub: 'Paramètres du compte' },
  '/guide':          { label: 'FAQ',               sub: 'Aide et documentation' },
}

const IBell   = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const ISearch = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IMenu   = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IHelp   = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

function TopBar({ onMenuClick, unread, onBellClick, notifOpen, notifState, user }) {
  const location = useLocation()
  const page = PAGE_TITLES[location.pathname] || { label: 'MERS Manager', sub: '' }
  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 md:px-7 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Gauche — titre page */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <IMenu/>
        </button>
        <div className="hidden md:block">
          <h2 className="text-[15px] font-bold text-[#0D2B5E] leading-tight">{page.label}</h2>
          {page.sub && <p className="text-xs text-slate-400 leading-none mt-0.5">{page.sub}</p>}
        </div>
      </div>

      {/* Droite — actions */}
      <div className="flex items-center gap-2">
        {/* Recherche */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-48 lg:w-56 transition-all focus-within:border-[#1A5EA8] focus-within:bg-white focus-within:w-56 lg:focus-within:w-64">
          <span className="text-slate-400 shrink-0"><ISearch/></span>
          <input placeholder="Rechercher..."
            className="bg-transparent text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none w-full"/>
        </div>

        {/* FAQ */}
        <Link to="/guide"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#0D2B5E] transition-all"
          title="FAQ">
          <IHelp/>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button onClick={onBellClick}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#0D2B5E] transition-all">
            <IBell/>
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <NotifPanel isOpen={notifOpen} onClose={onBellClick} notifState={notifState}/>
        </div>

        {/* Séparateur */}
        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"/>

        {/* Avatar */}
        <Link to="/profil"
          className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition-all group">
          <div className="w-8 h-8 rounded-xl bg-[#0D2B5E] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-700 leading-tight group-hover:text-[#0D2B5E]">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
            </p>
            <p className="text-[10px] text-slate-400">Administrateur</p>
          </div>
        </Link>
      </div>
    </header>
  )
}

function AppShell({ session }) {
  const [sideOpen,  setSideOpen]  = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifState = useNotifications()

  return (
    <div className="flex min-h-screen bg-[#F4F7FE]">
      {/* Overlay mobile */}
      {sideOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSideOpen(false)}/>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-out md:static md:translate-x-0 md:z-auto ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSideOpen(false)}/>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onMenuClick={() => setSideOpen(p => !p)}
          unread={notifState.unreadCount}
          onBellClick={() => setNotifOpen(p => !p)}
          notifOpen={notifOpen}
          notifState={notifState}
          user={session.user}
        />

        <main className="flex-1 px-4 md:px-7 py-6 md:py-7 max-w-screen-2xl w-full">
          <Routes>
            <Route path="/"                element={<Dashboard />}/>
            <Route path="/branches"        element={<Branches />}/>
            <Route path="/pasteurs"        element={<Pasteurs />}/>
            <Route path="/fideles"         element={<Fideles />}/>
            <Route path="/cultes"          element={<Cultes />}/>
            <Route path="/finances"        element={<Finances />}/>
            <Route path="/communication"   element={<Communication />}/>
            <Route path="/ressources"      element={<Ressources />}/>
            <Route path="/rapports"        element={<Rapports />}/>
            <Route path="/administration"  element={<Administration />}/>
            <Route path="/profil"          element={<Profil />}/>
            <Route path="/guide"           element={<Guide />}/>
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [session,  setSession]  = useState(null)
  const [authLoad, setAuthLoad] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoad(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (authLoad) return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0D2B5E]/20 border-t-[#0D2B5E] rounded-full animate-spin"/>
        <p className="text-sm text-slate-400 font-medium">MERS Manager</p>
      </div>
    </div>
  )

  if (!session) return <Login/>

  return (
    <BrowserRouter>
      <AppShell session={session}/>
    </BrowserRouter>
  )
}
