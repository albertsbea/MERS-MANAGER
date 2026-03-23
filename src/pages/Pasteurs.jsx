import ConfirmModal from '../components/ConfirmModal'
import { useEffect, useState } from 'react'
import { pasteursApi, branchesApi } from '../lib/api'
import { formatDate } from '../lib/utils'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconUsers, IconCheck } from '../components/icons'
import { PageHeader, Button, Card, CardBody, Badge, Modal, Input, Select, Spinner, EmptyState, StatCard } from '../components/ui'

const EMPTY = { branch_id:'', nom:'', prenom:'', telephone:'', email:'', ministere:'Pasteur', role_eglise:'Pasteur Titulaire', date_ordination:'', bio:'', actif:true }
const MINISTERES   = ['Apôtre','Prophète','Évangéliste','Pasteur','Docteur']
const ROLES_EGLISE = ['Pasteur Titulaire','Pasteur Assistant']
const REGIONS      = ['Basse Guinée','Moyenne Guinée','Haute Guinée','Guinée Forestière']

const ministreBadge = { 'Apôtre':'purple','Prophète':'teal','Évangéliste':'blue','Pasteur':'navy','Docteur':'gold' }
const initials = p => `${p.prenom?.[0]||''}${p.nom?.[0]||''}`.toUpperCase()

const IcTie    = ({c='currentColor'}) => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11l-1 5 1 2 1-2-1-5"/></svg>
const IcCross  = ({c='currentColor'}) => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M10 2v6L7 12l3 4v6M14 2v6l3 4-3 4v6M7 12h10"/></svg>
const IcEdit   = ({c='currentColor'}) => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcTrash  = ({c='currentColor'}) => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IcMap    = ({c='currentColor'}) => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>

export default function Pasteurs() {
  const [pasteurs,  setPasteurs]  = useState([])
  const [branches,  setBranches]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filterMin, setFilterMin] = useState('')
  const [filterB,   setFilterB]   = useState('')
  const [filterReg, setFilterReg] = useState('')
  const [sortBy,    setSortBy]    = useState('nom') // nom | region | eglise | ministere
  const [modal,     setModal]     = useState(false)
  const [detail,    setDetail]    = useState(null)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [delId,    setDelId]    = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: p }, { data: b }] = await Promise.all([pasteursApi.getAll(), branchesApi.getAll()])
    setPasteurs(p || [])
    setBranches(b || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // Régions uniques extraites des branches
  const regions = [...new Set(branches.map(b => b.region).filter(Boolean))].sort()

  // Filtrage
  const filtered = pasteurs
    .filter(p => {
      const q = search.toLowerCase()
      const ms = !search || `${p.nom} ${p.prenom} ${p.branches?.nom||''}`.toLowerCase().includes(q)
      const mm = !filterMin || p.ministere === filterMin
      const mb = !filterB   || p.branch_id === filterB
      const mr = !filterReg || p.branches?.region === filterReg
      return ms && mm && mb && mr
    })
    .sort((a, b) => {
      if (sortBy === 'region')    return (a.branches?.region||'').localeCompare(b.branches?.region||'')
      if (sortBy === 'eglise')    return (a.branches?.nom||'').localeCompare(b.branches?.nom||'')
      if (sortBy === 'ministere') return (a.ministere||'').localeCompare(b.ministere||'')
      return a.nom.localeCompare(b.nom)
    })

  // Groupement par région si tri = region
  const grouped = sortBy === 'region' || sortBy === 'eglise'
    ? Object.entries(
        filtered.reduce((acc, p) => {
          const key = sortBy === 'region' ? (p.branches?.region || 'Non assigné') : (p.branches?.nom || 'Non assigné')
          if (!acc[key]) acc[key] = []
          acc[key].push(p)
          return acc
        }, {})
      ).sort(([a],[b]) => a.localeCompare(b))
    : null

  const stats = {
    total:     pasteurs.length,
    titulaire: pasteurs.filter(p => p.role_eglise === 'Pasteur Titulaire').length,
    assistant: pasteurs.filter(p => p.role_eglise === 'Pasteur Assistant').length,
    actifs:    pasteurs.filter(p => p.actif).length,
  }

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    // Nettoyer les objets imbriqués (branches, etc.) avant de mettre dans le form
    const clean = Object.fromEntries(
      Object.entries(p).filter(([k]) => !['branches'].includes(k))
    )
    setForm({...EMPTY, ...clean})
    setModal(true)
  }
  const close    = () => { setModal(false); setEditing(null) }
  const save = async () => {
    if (!form.nom || !form.prenom) return
    setSaving(true)
    const payload = {
      nom:             form.nom             || '',
      prenom:          form.prenom          || '',
      ministere:       form.ministere       || 'Pasteur',
      role_eglise:     form.role_eglise     || 'Pasteur Titulaire',
      branch_id:       form.branch_id       || null,
      telephone:       form.telephone       || '',
      email:           form.email           || '',
      date_ordination: form.date_ordination || null,
      bio:             form.bio             || '',
      actif:           form.actif           ?? true,
    }
    const { error } = editing
      ? await pasteursApi.update(editing.id, payload)
      : await pasteursApi.create(payload)
    if (error) console.error('Pasteur save error:', error)
    setSaving(false); close(); load()
  }
  const del = (id) => setDelId(id)
  const confirmDel = async () => {
    setDeleting(true)
    await pasteursApi.delete(delId)
    setDeleting(false); setDelId(null); load()
  }
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  // Carte pasteur réutilisable
  const PasteurCard = ({ p }) => (
    <Card key={p.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setDetail(p)}>
      <CardBody>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[#EBF3FC] flex items-center justify-center text-[#1A5EA8] text-sm font-bold shrink-0">
            {initials(p)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0D2B5E] text-sm leading-tight">{p.ministere} {p.prenom} {p.nom}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.role_eglise}</p>
              </div>
              <Badge color={ministreBadge[p.ministere]||'slate'} size="xs">{p.ministere}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2 bg-slate-50 rounded-lg px-3 py-2">
          <IcMap c="#9AA5B4"/>
          <span className="text-xs text-slate-500">{p.branches?.nom || 'Non assigné'}</span>
          {p.branches?.region && <span className="text-xs text-slate-300">· {p.branches.region}</span>}
        </div>
        {p.telephone && <p className="text-xs text-slate-400 mb-1"><span className="text-slate-300">Tél :</span> {p.telephone}</p>}
        {p.date_ordination && <p className="text-xs text-slate-400 mb-3"><span className="text-slate-300">Ordonné(e) :</span> {formatDate(p.date_ordination)}</p>}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <Badge color={p.actif?'green':'red'} size="xs">{p.actif?'Actif':'Inactif'}</Badge>
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1A5EA8]"><IcEdit/></button>
            <button onClick={() => del(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"><IcTrash/></button>
          </div>
        </div>
      </CardBody>
    </Card>
  )

  return (
    <div>
      <PageHeader
        title="Pasteurs"
        subtitle={`${stats.total} pasteur(s) — ${stats.actifs} actifs`}
        action={<Button variant="gold" onClick={openNew}><IconPlus size={14} color="white"/> Nouveau pasteur</Button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total"      value={stats.total}     accent="navy"  icon={(c)=><IcTie  c={c}/>}/>
        <StatCard label="Titulaires" value={stats.titulaire} accent="blue"  icon={(c)=><IcCross c={c}/>}/>
        <StatCard label="Assistants" value={stats.assistant} accent="gold"  icon={(c)=><IcTie  c={c}/>}/>
        <StatCard label="Actifs"     value={stats.actifs}    accent="green" icon={(c)=><IcTie  c={c}/>}/>
      </div>

      {/* Filtres et tri */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative min-w-[180px] flex-1 max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9AA5B4" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]"
            placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        {/* Filtre Région */}
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
          value={filterReg} onChange={e => { setFilterReg(e.target.value); setFilterB('') }}>
          <option value="">Toutes les régions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Filtre Branche — filtré par région choisie */}
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
          value={filterB} onChange={e => setFilterB(e.target.value)}>
          <option value="">Toutes les branches</option>
          {branches
            .filter(b => !filterReg || b.region === filterReg)
            .map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>

        {/* Filtre ministère */}
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
          value={filterMin} onChange={e => setFilterMin(e.target.value)}>
          <option value="">Tous les ministères</option>
          {MINISTERES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* Tri */}
        <select className="border border-[#C8880A] rounded-lg px-3 py-2 text-sm bg-[#FEF6E7] text-[#854F0B] font-semibold focus:outline-none"
          value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="nom">Trier par nom</option>
          <option value="region">Grouper par région</option>
          <option value="eglise">Grouper par branche</option>
          <option value="ministere">Trier par ministère</option>
        </select>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={<IcTie c="#9AA5B4"/>} title="Aucun pasteur trouvé"
          action={<Button variant="gold" onClick={openNew}><IconPlus size={13} color="white"/> Ajouter</Button>}/>
      ) : grouped ? (
        // Vue groupée par région ou branche
        <div className="space-y-6">
          {grouped.map(([groupKey, items]) => (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#C8880A] rounded-full"/>
                <h3 className="text-sm font-bold text-[#0D2B5E]">{groupKey}</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(p => <PasteurCard key={p.id} p={p}/>)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vue liste simple
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => <PasteurCard key={p.id} p={p}/>)}
        </div>
      )}

      {/* Modal détail */}
      {detail && (
        <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Fiche pastorale" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF3FC] flex items-center justify-center text-[#1A5EA8] text-xl font-bold">{initials(detail)}</div>
              <div>
                <h3 className="font-bold text-[#0D2B5E] text-lg">{detail.ministere} {detail.prenom} {detail.nom}</h3>
                <p className="text-sm text-slate-500">{detail.role_eglise}</p>
                <Badge color={ministreBadge[detail.ministere]||'slate'} size="xs" className="mt-1">{detail.ministere}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4">
              {[
                {l:'Branche',v:detail.branches?.nom||'—'},
                {l:'Région',v:detail.branches?.region||'—'},
                {l:'Téléphone',v:detail.telephone||'—'},
                {l:'Email',v:detail.email||'—'},
                {l:'Ordination',v:detail.date_ordination?formatDate(detail.date_ordination):'—'},
                {l:'Statut',v:detail.actif?'Actif':'Inactif'},
              ].map(({l,v}) => (
                <div key={l}><p className="text-xs text-slate-400 uppercase tracking-wide">{l}</p><p className="text-sm font-medium text-[#0D2B5E] mt-0.5">{v}</p></div>
              ))}
            </div>
            {detail.bio && (
              <div><p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Biographie</p>
              <p className="text-sm text-slate-600 leading-relaxed">{detail.bio}</p></div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
              <Button variant="secondary" onClick={() => { setDetail(null); openEdit(detail) }}><IcEdit/> Modifier</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal création/édition */}
      <Modal isOpen={modal} onClose={close} title={editing?'Modifier le pasteur':'Nouveau pasteur'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom *" value={form.prenom} onChange={f('prenom')}/>
          <Input label="Nom *"    value={form.nom}    onChange={f('nom')}/>
          <Select label="Ministère" value={form.ministere} onChange={f('ministere')}>
            {MINISTERES.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select label="Rôle" value={form.role_eglise} onChange={f('role_eglise')}>
            {ROLES_EGLISE.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select label="Branche" value={form.branch_id} onChange={f('branch_id')} className="col-span-2">
            <option value="">— Non assigné —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom} ({b.region})</option>)}
          </Select>
          <Input label="Téléphone" value={form.telephone} onChange={f('telephone')}/>
          <Input label="Email"     value={form.email}     onChange={f('email')} type="email"/>
          <Input label="Date d'ordination" value={form.date_ordination} onChange={f('date_ordination')} type="date" className="col-span-2"/>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Biographie</label>
            <textarea value={form.bio} onChange={f('bio')} rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8] resize-none"/>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="pasteur_actif" checked={form.actif} onChange={f('actif')} className="w-4 h-4 accent-[#0D2B5E]"/>
            <label htmlFor="pasteur_actif" className="text-sm text-slate-700">Pasteur actif</label>
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-50">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving||!form.nom||!form.prenom}>
              {saving?'Enregistrement...':editing?'Mettre à jour':'Ajouter'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!delId}
        onClose={()=>setDelId(null)}
        onConfirm={confirmDel}
        loading={deleting}
        title="Supprimer ce pasteur"
        message="Ce pasteur sera définitivement supprimé."
        type="danger"
      />
    </div>
  )
}

