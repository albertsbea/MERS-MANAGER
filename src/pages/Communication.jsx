import ConfirmModal from '../components/ConfirmModal'
import { useEffect, useState } from 'react'
import { annoncesApi, branchesApi } from '../lib/api'
import { formatDate, TYPE_ANNONCE } from '../lib/utils'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'
import {
  PageHeader, Button, Card, CardHeader, CardBody,
  Badge, Modal, Input, Select, Spinner, EmptyState, StatCard
} from '../components/ui'

const EMPTY = { titre: '', contenu: '', type: 'info', cible: 'toutes', auteur: 'Administration', publiee: true }

const IconMegaphone = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const CIBLES = {
  toutes:         'Toutes les branches',
  basse_guinee:   'Basse Guinée',
  moyenne_guinee: 'Moyenne Guinée',
  haute_guinee:   'Haute Guinée',
  forestiere:     'Guinée Forestière',
}

const typeColor = { info:'blue', urgent:'red', evenement:'purple', priere:'teal' }
const typeIcon  = {
  info:      ({ size, color }) => <svg width={size||14} height={size||14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  urgent:    ({ size, color }) => <svg width={size||14} height={size||14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  evenement: ({ size, color }) => <svg width={size||14} height={size||14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  priere:    ({ size, color }) => <svg width={size||14} height={size||14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
}

export default function Communication() {
  const [annonces,  setAnnonces]  = useState([])
  const [branches,  setBranches]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [detail,    setDetail]    = useState(null)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [delId,    setDelId]    = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filterType, setFilterType] = useState('')

  const load = async () => {
    setLoading(true)
    const [{ data: a }, { data: b }] = await Promise.all([annoncesApi.getAll(), branchesApi.getAll()])
    setAnnonces(a || [])
    setBranches(b || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = filterType ? annonces.filter(a => a.type === filterType) : annonces
  const stats = {
    total:    annonces.length,
    urgent:   annonces.filter(a => a.type === 'urgent').length,
    event:    annonces.filter(a => a.type === 'evenement').length,
    publiees: annonces.filter(a => a.publiee).length,
  }

  const openNew   = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit  = (a) => { setEditing(a); setForm({ ...a }); setModal(true) }
  const close     = () => { setModal(false); setEditing(null) }

  const save = async () => {
    if (!form.titre || !form.contenu) return
    setSaving(true)
    editing ? await annoncesApi.update(editing.id, form) : await annoncesApi.create(form)
    setSaving(false); close(); load()
  }
  const del = async (id) => {
    setDelId(id)
  }
  const confirmDel = async () => {
    setDeleting(true)
    await annoncesApi.delete(delId)
    setDeleting(false); setDelId(null); load()
  }
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <PageHeader
        title="Communication"
        subtitle="Annonces et messages pour les branches"
        action={<Button variant="gold" onClick={openNew}><IconPlus size={14} color="white"/> Nouvelle annonce</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total annonces" value={stats.total}    accent="blue"   icon={(c)=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>}/>
        <StatCard label="Publiées"       value={stats.publiees} accent="green"  icon={(c)=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}/>
        <StatCard label="Urgentes"       value={stats.urgent}   accent="red"    icon={(c)=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>}/>
        <StatCard label="Événements"     value={stats.event}    accent="purple" icon={(c)=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}/>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-5">
        {['', 'info', 'urgent', 'evenement', 'priere'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === t ? 'bg-[#0D2B5E] text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}>
            {t === '' ? 'Toutes' : TYPE_ANNONCE[t]?.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#9AA5B4" strokeWidth="1.8" strokeLinecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>}
          title="Aucune annonce" description="Créez votre première annonce."
          action={<Button variant="gold" onClick={openNew}><IconPlus size={13} color="white"/> Créer une annonce</Button>}/>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const Icon = typeIcon[a.type]
            const colors = { info:'#1A5EA8', urgent:'#E24B4A', evenement:'#534AB7', priere:'#1D9E75' }
            const bgs    = { info:'#E6F1FB', urgent:'#FCEBEB', evenement:'#EEEDFE', priere:'#E1F5EE' }
            return (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardBody className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: bgs[a.type] }}>
                      <Icon size={18} color={colors[a.type]}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-[#0D2B5E] text-sm">{a.titre}</h3>
                            <Badge color={typeColor[a.type]} size="xs">{TYPE_ANNONCE[a.type]?.label}</Badge>
                            {!a.publiee && <Badge color="slate" size="xs">Brouillon</Badge>}
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{a.contenu}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>Par {a.auteur}</span>
                            <span>•</span>
                            <span>{CIBLES[a.cible] || a.cible}</span>
                            <span>•</span>
                            <span>{formatDate(a.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setDetail(a)}
                            className="px-3 py-1.5 text-xs text-[#1A5EA8] bg-[#E6F1FB] rounded-lg hover:bg-[#B5D4F4] transition-colors font-medium">
                            Lire
                          </button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><IconEdit size={13}/></Button>
                          <Button size="sm" variant="ghost" onClick={() => del(a.id)} className="text-red-400 hover:bg-red-50"><IconTrash size={13}/></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal détail */}
      {detail && (
        <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail.titre} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge color={typeColor[detail.type]}>{TYPE_ANNONCE[detail.type]?.label}</Badge>
              <Badge color="slate">{CIBLES[detail.cible]}</Badge>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{detail.contenu}</p>
            <div className="pt-3 border-t border-slate-50 text-xs text-slate-400 flex justify-between">
              <span>Par {detail.auteur}</span>
              <span>{formatDate(detail.created_at)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal création/édition */}
      <Modal isOpen={modal} onClose={close} title={editing ? 'Modifier l\'annonce' : 'Nouvelle annonce'} size="lg">
        <div className="space-y-4">
          <Input label="Titre *" value={form.titre} onChange={f('titre')} placeholder="Titre de l'annonce" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={f('type')}>
              <option value="info">Information</option>
              <option value="urgent">Urgent</option>
              <option value="evenement">Événement</option>
              <option value="priere">Prière</option>
            </Select>
            <Select label="Destinataires" value={form.cible} onChange={f('cible')}>
              <option value="toutes">Toutes les branches</option>
              <option value="basse_guinee">Basse Guinée</option>
              <option value="moyenne_guinee">Moyenne Guinée</option>
              <option value="haute_guinee">Haute Guinée</option>
              <option value="forestiere">Guinée Forestière</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contenu *</label>
            <textarea value={form.contenu} onChange={f('contenu')} rows={6}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8] resize-none"
              placeholder="Rédigez le message de l'annonce..." />
          </div>
          <Input label="Auteur" value={form.auteur} onChange={f('auteur')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="publiee" checked={form.publiee} onChange={f('publiee')} className="w-4 h-4 accent-[#0D2B5E]"/>
            <label htmlFor="publiee" className="text-sm text-slate-700">Publier immédiatement</label>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving || !form.titre || !form.contenu}>
              {saving ? 'Publication...' : editing ? 'Mettre à jour' : 'Publier l\'annonce'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!delId}
        onClose={()=>setDelId(null)}
        onConfirm={confirmDel}
        loading={deleting}
        title="Supprimer ce annonce"
        message="Cette annonce sera définitivement supprimée."
        type="danger"
      />
    </div>
  )
}
