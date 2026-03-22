import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/utils'
import { Link } from 'react-router-dom'

const typeColor = { info:'#1A5EA8', urgent:'#E24B4A', evenement:'#534AB7', priere:'#1D9E75' }
const typeBg    = { info:'#E6F1FB', urgent:'#FCEBEB', evenement:'#EEEDFE', priere:'#E1F5EE' }
const typeLabel = { info:'Info', urgent:'Urgent', evenement:'Événement', priere:'Prière' }

const STORAGE_KEY = 'mers_read_notifs_v2'

function getRead() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
  catch { return new Set() }
}
function saveRead(set) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])) }
  catch {}
}

// Hook global — charge les notifs au démarrage et écoute en temps réel
export function useNotifications() {
  const [notifs,  setNotifs]  = useState([])
  const [sysNot,  setSysNot]  = useState([])
  const [read,    setRead]    = useState(getRead)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const [
      { data: annonces },
      { data: fideles },
      { data: cultes },
    ] = await Promise.all([
      supabase.from('annonces').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('fideles').select('id, created_at, statut').order('created_at', { ascending: false }),
      supabase.from('cultes').select('id, date_culte, presences(id)'),
    ])

    setNotifs(annonces || [])

    // Alertes système dynamiques
    const now = new Date()
    const sys = []

    const newThisMonth = (fideles||[]).filter(f => {
      const d = new Date(f.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && f.statut === 'actif'
    }).length
    if (newThisMonth > 0) sys.push({
      id: 'sys-new-members',
      type: 'info',
      titre: `${newThisMonth} nouveau${newThisMonth > 1 ? 'x' : ''} fidèle${newThisMonth > 1 ? 's' : ''} ce mois`,
      contenu: `${newThisMonth} membre${newThisMonth > 1 ? 's ont' : ' a'} rejoint la communauté ce mois-ci.`,
      created_at: new Date().toISOString(),
      link: '/fideles',
      isSystem: true,
    })

    const missingPres = (cultes||[]).filter(c => !c.presences || c.presences.length === 0).length
    if (missingPres > 0) sys.push({
      id: 'sys-missing-presences',
      type: 'urgent',
      titre: `${missingPres} culte${missingPres > 1 ? 's' : ''} sans présences`,
      contenu: `${missingPres} culte${missingPres > 1 ? 's n\'ont' : ' n\'a'} pas encore de présences enregistrées.`,
      created_at: new Date().toISOString(),
      link: '/cultes',
      isSystem: true,
    })

    setSysNot(sys)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()

    // Realtime — écoute les nouvelles annonces
    const channel = supabase
      .channel('annonces-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'annonces',
      }, (payload) => {
        setNotifs(prev => [payload.new, ...prev].slice(0, 10))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [loadData])

  const allNotifs  = [...sysNot, ...notifs]
  const unreadCount = allNotifs.filter(n => !read.has(n.id)).length

  const markRead = (id) => {
    setRead(prev => {
      const next = new Set([...prev, id])
      saveRead(next)
      return next
    })
  }

  const markAllRead = () => {
    const next = new Set(allNotifs.map(n => n.id))
    saveRead(next)
    setRead(next)
  }

  return { allNotifs, sysNot, notifs, read, unreadCount, markRead, markAllRead, loading, reload: loadData }
}

export default function NotifPanel({ isOpen, onClose, notifState }) {
  const { allNotifs, sysNot, notifs, read, unreadCount, markRead, markAllRead, loading } = notifState
  const ref = useRef()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    if (isOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div ref={ref}
      className="absolute top-14 right-0 md:right-4 z-50 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
      style={{maxHeight:'85vh'}}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0D2B5E]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <button onClick={markAllRead} className="text-xs text-[#7AABDC] hover:text-white font-medium transition-colors">
          Tout lu
        </button>
      </div>

      <div className="overflow-y-auto" style={{maxHeight:'calc(85vh - 100px)'}}>
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <div className="w-4 h-4 border-2 border-[#1A5EA8] border-t-transparent rounded-full animate-spin"/>
            <span className="text-xs text-slate-400">Chargement...</span>
          </div>
        ) : allNotifs.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9AA5B4" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p className="text-sm text-slate-400 font-medium">Tout est à jour</p>
            <p className="text-xs text-slate-300 mt-1">Aucune notification</p>
          </div>
        ) : (
          <>
            {sysNot.length > 0 && (
              <div>
                <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Alertes système</p>
                </div>
                {sysNot.map(n => <NotifItem key={n.id} n={n} isRead={read.has(n.id)} onRead={() => markRead(n.id)} onClose={onClose}/>)}
              </div>
            )}
            {notifs.length > 0 && (
              <div>
                <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annonces</p>
                </div>
                {notifs.map(n => <NotifItem key={n.id} n={n} isRead={read.has(n.id)} onRead={() => markRead(n.id)} onClose={onClose}/>)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/80">
        <Link to="/communication" onClick={onClose}
          className="text-xs text-[#1A5EA8] hover:underline font-medium flex items-center gap-1">
          Gérer les annonces
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      </div>
    </div>
  )
}

function NotifItem({ n, isRead, onRead, onClose }) {
  return (
    <div onClick={onRead}
      className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!isRead ? 'bg-[#EBF3FC]/30' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{background:typeBg[n.type]||'#E6F1FB'}}>
          <NotifIcon type={n.type}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs leading-tight ${!isRead ? 'font-semibold text-[#0D2B5E]' : 'text-slate-600'}`}>{n.titre}</p>
            <div className="flex items-center gap-1 shrink-0">
              {!isRead && <div className="w-2 h-2 bg-[#1A5EA8] rounded-full"/>}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.contenu}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[9px] text-slate-300">{formatDate(n.created_at)}</p>
            {n.link && (
              <Link to={n.link} onClick={e => { e.stopPropagation(); onRead(); onClose() }}
                className="text-[10px] text-[#1A5EA8] hover:underline font-medium">Voir →</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NotifIcon({ type }) {
  const c = typeColor[type] || '#1A5EA8'
  if (type==='urgent')    return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
  if (type==='evenement') return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  if (type==='priere')    return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
