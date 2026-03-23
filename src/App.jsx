import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { AppSidebar } from './components/ui/sidebar'
import NotifPanel, { useNotifications } from './components/NotifPanel'
import { cn } from './lib/cn'
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

const PAGE_TITLES = {
  '/':               { label: 'Tableau de bord',  sub: 'Vue d\'ensemble de l\'activité' },
  '/branches':       { label: 'Branches',          sub: 'Gestion des assemblées locales' },
  '/pasteurs':       { label: 'Pasteurs',           sub: 'Corps pastoral de la MERS' },
  '/fideles':        { label: 'Fidèles',            sub: 'Registre des membres' },
  '/cultes':         { label: 'Cultes & Présences', sub: 'Célébrations et fréquentation' },
  '/finances':       { label: 'Finances',           sub: 'Collectes et dépenses' },
  '/communication':  { label: 'Communication',      sub: 'Annonces et notifications' },
  '/ressources':     { label: 'Ressources',         sub: 'Bibliothèque numérique' },
  '/rapports':       { label: 'Rapports',           sub: 'Analyses et exports PDF' },
  '/administration': { label: 'Administration',     sub: 'Comptes et permissions' },
  '/profil':         { label: 'Mon Profil',         sub: 'Paramètres du compte' },
  '/guide':          { label: 'FAQ',                sub: 'Aide et documentation' },
}

const IBell   = () => <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const ISearch = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IMenu   = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IHelp   = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

function TopBar({ onMenuClick, unread, onBellClick, notifOpen, notifState, user }) {
  const location = useLocation()
  const page = PAGE_TITLES[location.pathname] || { label: 'MERS Manager', sub: '' }
  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="md:hidden flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <IMenu/>
        </button>
        <div className="hidden md:block">
          <h2 className="text-sm font-semibold text-foreground leading-tight">{page.label}</h2>
          {page.sub && <p className="text-xs text-muted-foreground leading-none mt-0.5">{page.sub}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 h-8 rounded-md border border-input bg-muted/50 px-3 w-44 lg:w-52 transition-all focus-within:border-ring focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20">
          <span className="text-muted-foreground/60 shrink-0"><ISearch/></span>
          <input placeholder="Rechercher..."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"/>
        </div>

        {/* FAQ */}
        <Link to="/guide"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title="FAQ">
          <IHelp/>
        </Link>

        {/* Bell */}
        <div className="relative">
          <button onClick={onBellClick}
            className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <IBell/>
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white border-2 border-background px-0.5">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <NotifPanel isOpen={notifOpen} onClose={onBellClick} notifState={notifState}/>
        </div>

        {/* Divider */}
        <div className="mx-1 hidden h-5 w-px bg-border sm:block"/>

        {/* Avatar */}
        <Link to="/profil"
          className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent transition-colors">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="hidden lg:block leading-none">
            <p className="text-xs font-medium text-foreground group-hover:text-accent-foreground truncate max-w-[100px]">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
            </p>
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
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-40 bg-sidebar/80 backdrop-blur-sm md:hidden"
          onClick={() => setSideOpen(false)}/>
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out',
        'md:static md:translate-x-0 md:z-auto',
        sideOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <AppSidebar onClose={() => setSideOpen(false)}/>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-w-0 flex-col">
        <TopBar
          onMenuClick={() => setSideOpen(p => !p)}
          unread={notifState.unreadCount}
          onBellClick={() => setNotifOpen(p => !p)}
          notifOpen={notifOpen}
          notifState={notifState}
          user={session.user}
        />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-7 max-w-screen-2xl w-full">
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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"/>
        <p className="text-sm font-medium text-muted-foreground">MERS Manager</p>
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
