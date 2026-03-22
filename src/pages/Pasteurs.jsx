import { useEffect, useState } from 'react'
import { pasteursApi, branchesApi } from '../lib/api'
import { formatDate } from '../lib/utils'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconUsers, IconCheck, IconX } from '../components/icons'
import {
  PageHeader, Button, Card, CardBody, Badge,
  Modal, Input, Select, Spinner, EmptyState, StatCard
} from '../components/ui'

const EMPTY = {
  branch_id: '', nom: '', prenom: '', telephone: '', email: '',
  ministere: 'Pasteur', role_eglise: 'Pasteur Titulaire',
  date_ordination: '', bio: '', actif: true
}

const MINISTERES   = ['Apôtre','Prophète','Évangéliste','Pasteur','Docteur']
const ROLES_EGLISE = ['Pasteur Titulaire','Pasteur Assistant']

const IconUserTie = ({ size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    <path d="M12 11l-1 5 1 2 1-2-1-5"/>
  </svg>
)
const IconCross = ({ size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <path d="M10 2v6L7 12l3 4v6M14 2v6l3 4-3 4v6M7 12h10"/>
  </svg>
)

const ministreBadge = {
  'Apôtre':      'purple',
  'Prophète':    'teal',
  'Évangéliste': 'blue',
  'Pasteur':     'navy',
  'Docteur':     'gold',
}

const initials = (p) => `${p.prenom?.[0] || ''}${p.nom?.[0] || ''}`.toUpperCase()

export default function Pasteurs() {
  const [pasteurs,  setPasteurs]  = useState([])
  const [branches,  setBranches]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filterMin, setFilterMin] = useState('')
  const [modal,     setModal]     = useState(false)
  const [detail,    setDetail]    = useState(null)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: p }, { data: b }] = await Promise.all([pasteursApi.getAll(), branchesApi.getAll()])
    setPasteurs(p || [])
    setBranches(b || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = pasteurs.filter(p => {
    const q = search.toLowerCase()
    const ms = !search || `${p.nom} ${p.prenom} ${p.branches?.nom || ''}`.toLowerCase().includes(q)
    const mm = !filterMin || p.ministere === filterMin
    return ms && mm
  })

  const stats = {
    total:    pasteurs.length,
    titulaire: pasteurs.filter(p => p.role_eglise === 'Pasteur Titulaire').length,
    assistant: pasteurs.filter(p => p.role_eglise === 'Pasteur Assistant').length,
    actifs:    pasteurs.filter(p => p.actif).length,
  }

  const openNew   = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit  = (p) => { setEditing(p); setForm({ ...p }); setModal(true) }
  const close     = () => { setModal(false); setEditing(null) }

  const save = async () => {
    if (!form.nom || !form.prenom) return
    setSaving(true)
    editing ? await pasteursApi.update(editing.id, form) : await pasteursApi.create(form)
    setSaving(false); close(); load()
  }
  const del = async (id) => {
    if (!confirm('Supprimer ce pasteur ?')) return
    await pasteursApi.delete(id); load()
  }

  const f = k => e => setForm(p => ({
    ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }))

  return (
    <div>
      <PageHeader
        title="Pasteurs"
        subtitle={`${stats.total} pasteur(s) enregistré(s)`}
        action={<Button variant="gold" onClick={openNew}><IconPlus size={14} color="white"/> Nouveau pasteur</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total pasteurs"  value={stats.total}     accent="navy"   icon={(c)=><IconUserTie size={20} color={c}/>}/>
        <StatCard label="Titulaires"      value={stats.titulaire} accent="blue"   icon={(c)=><IconCross   size={20} color={c}/>}/>
        <StatCard label="Assistants"      value={stats.assistant} accent="gold"   icon={(c)=><IconUsers   size={20} color={c}/>}/>
        <StatCard label="Actifs"          value={stats.actifs}    accent="green"  icon={(c)=><IconCheck   size={20} color={c}/>}/>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2"><IconSearch size={13} color="#9AA5B4"/></div>
          <input className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]"
            placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...MINISTERES].map(m => (
            <button key={m} onClick={() => setFilterMin(m)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                filterMin === m ? 'bg-[#0D2B5E] text-white border-[#0D2B5E]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>
              {m === '' ? 'Tous' : m}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={<IconUserTie size={22} color="#9AA5B4"/>}
          title="Aucun pasteur" description="Ajoutez votre premier pasteur."
          action={<Button variant="gold" onClick={openNew}><IconPlus size={13} color="white"/> Ajouter</Button>}/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setDetail(p)}>
              <CardBody>
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-[#EBF3FC] flex items-center justify-center text-[#1A5EA8] text-sm font-bold shrink-0">
                    {initials(p)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#0D2B5E] text-sm leading-tight">{p.ministere} {p.prenom} {p.nom}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.role_eglise}</p>
                      </div>
                      <Badge color={ministreBadge[p.ministere] || 'slate'} size="xs">{p.ministere}</Badge>
                    </div>
                  </div>
                </div>

                {/* Branche */}
                <div className="flex items-center gap-2 mb-2 bg-slate-50 rounded-lg px-3 py-2">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9AA5B4" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/></svg>
                  <span className="text-xs text-slate-500">{p.branches?.nom || 'Non assigné'}</span>
                  {p.branches?.region && <span className="text-xs text-slate-300">· {p.branches.region}</span>}
                </div>

                {/* Contacts */}
                {p.telephone && (
                  <p className="text-xs text-slate-400 mb-0.5">
                    <span className="text-slate-300">Tél :</span> {p.telephone}
                  </p>
                )}
                {p.date_ordination && (
                  <p className="text-xs text-slate-400 mb-3">
                    <span className="text-slate-300">Ordonné(e) le :</span> {formatDate(p.date_ordination)}
                  </p>
                )}

                {/* Status + actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <Badge color={p.actif ? 'green' : 'red'} size="xs">
                    {p.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><IconEdit size={13}/></Button>
                    <Button size="sm" variant="ghost" onClick={() => del(p.id)} className="text-red-400 hover:bg-red-50"><IconTrash size={13}/></Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal détail pasteur */}
      {detail && (
        <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Fiche pastorale" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF3FC] flex items-center justify-center text-[#1A5EA8] text-xl font-bold">
                {initials(detail)}
              </div>
              <div>
                <h3 className="font-bold text-[#0D2B5E] text-lg">{detail.ministere} {detail.prenom} {detail.nom}</h3>
                <p className="text-sm text-slate-500">{detail.role_eglise}</p>
                <Badge color={ministreBadge[detail.ministere] || 'slate'} size="xs" className="mt-1">{detail.ministere}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4">
              {[
                { label: 'Branche',    val: detail.branches?.nom || '—' },
                { label: 'Région',     val: detail.branches?.region || '—' },
                { label: 'Téléphone',  val: detail.telephone || '—' },
                { label: 'Email',      val: detail.email || '—' },
                { label: 'Ordination', val: detail.date_ordination ? formatDate(detail.date_ordination) : '—' },
                { label: 'Statut',     val: detail.actif ? 'Actif' : 'Inactif' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium text-[#0D2B5E] mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            {detail.bio && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Biographie</p>
                <p className="text-sm text-slate-600 leading-relaxed">{detail.bio}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
              <Button variant="secondary" onClick={() => { setDetail(null); openEdit(detail) }}>
                <IconEdit size={13}/> Modifier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal création/édition */}
      <Modal isOpen={modal} onClose={close} title={editing ? 'Modifier le pasteur' : 'Nouveau pasteur'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom *" value={form.prenom} onChange={f('prenom')}/>
          <Input label="Nom *"    value={form.nom}    onChange={f('nom')}/>
          <Select label="Ministère" value={form.ministere} onChange={f('ministere')}>
            {MINISTERES.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select label="Rôle dans l'église" value={form.role_eglise} onChange={f('role_eglise')}>
            {ROLES_EGLISE.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select label="Branche assignée" value={form.branch_id} onChange={f('branch_id')} className="col-span-2">
            <option value="">— Non assigné —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom} ({b.region})</option>)}
          </Select>
          <Input label="Téléphone" value={form.telephone} onChange={f('telephone')} placeholder="+224 6XX XXX XXX"/>
          <Input label="Email"     value={form.email}     onChange={f('email')} type="email"/>
          <Input label="Date d'ordination" value={form.date_ordination} onChange={f('date_ordination')} type="date" className="col-span-2"/>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Biographie (optionnel)</label>
            <textarea value={form.bio} onChange={f('bio')} rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8] resize-none"
              placeholder="Parcours, témoignage, spécialité..."/>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="pasteur_actif" checked={form.actif} onChange={f('actif')} className="w-4 h-4 accent-[#0D2B5E]"/>
            <label htmlFor="pasteur_actif" className="text-sm text-slate-700">Pasteur actif</label>
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-50">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving || !form.nom || !form.prenom}>
              {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Ajouter le pasteur'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
