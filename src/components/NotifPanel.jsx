import { useState, useEffect, useRef } from 'react'
import { annoncesApi } from '../lib/api'
import { formatDate } from '../lib/utils'

const typeColor = { info:'#1A5EA8', urgent:'#E24B4A', evenement:'#534AB7', priere:'#1D9E75' }
const typeBg    = { info:'#E6F1FB', urgent:'#FCEBEB', evenement:'#EEEDFE', priere:'#E1F5EE' }

export default function NotifPanel({ isOpen, onClose }) {
  const [notifs, setNotifs] = useState([])
  const [read,   setRead]   = useState(new Set())
  const ref = useRef()

  useEffect(() => {
    if (isOpen) {
      annoncesApi.getAll().then(({ data }) => setNotifs((data||[]).slice(0,8)))
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    if (isOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  const unread = notifs.filter(n => !read.has(n.id)).length

  if (!isOpen) return null

  return (
    <div ref={ref} className="absolute top-12 right-16 z-50 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#0D2B5E]">Notifications</h3>
          {unread > 0 && (
            <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {unread}
            </span>
          )}
        </div>
        <button onClick={() => setRead(new Set(notifs.map(n=>n.id)))}
          className="text-xs text-[#1A5EA8] hover:underline font-medium">
          Tout marquer lu
        </button>
      </div>

      <div className="overflow-y-auto max-h-96">
        {notifs.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-300">Aucune notification</div>
        ) : (
          notifs.map(n => (
            <div key={n.id}
              className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!read.has(n.id)?'bg-blue-50/30':''}`}
              onClick={() => setRead(p => new Set([...p, n.id]))}>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{background:typeBg[n.type]}}>
                  <div className="w-2 h-2 rounded-full" style={{background:typeColor[n.type]}}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className={`text-xs leading-tight ${!read.has(n.id)?'font-semibold text-[#0D2B5E]':'text-slate-600'}`}>
                      {n.titre}
                    </p>
                    {!read.has(n.id) && <div className="w-2 h-2 bg-[#1A5EA8] rounded-full shrink-0 mt-1"/>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{n.contenu}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">{formatDate(n.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
