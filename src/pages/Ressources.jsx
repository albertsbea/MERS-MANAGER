import { useEffect, useState } from 'react'
import { ressourcesApi, branchesApi } from '../lib/api'
import { formatDate, TYPE_RESSOURCE } from '../lib/utils'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconDownload } from '../components/icons'
import {
  PageHeader, Button, Card, CardBody,
  Badge, Modal, Input, Select, Spinner, EmptyState, StatCard
} from '../components/ui'

const EMPTY = { titre: '', description: '', type: 'document', url: '', taille: '', auteur: '', branch_id: '' }

const IconFile    = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconMic     = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
const IconClip    = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
const IconVideo   = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>

const typeIconMap   = { predication: IconMic, document: IconFile, formulaire: IconClip, media: IconVideo }
const typeBgColors  = { predication:'#E6F1FB', document:'#F1EFE8', formulaire:'#FEF6E7', media:'#EEEDFE' }
const typeIconColors = { predication:'#1A5EA8', document:'#5F5E5A', formulaire:'#C8880A', media:'#534AB7' }
const typeBadge     = { predication:'blue', document:'slate', formulaire:'gold', media:'purple' }

export default function Ressources() {
  const [items,    setItems]    = useState([])
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filterType, setFilterType] = useState('')
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: r }, { data: b }] = await Promise.all([ressourcesApi.getAll(), branchesApi.getAll()])
    setItems(r || [])
    setBranches(b || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = items.filter(i => {
    const q = search.toLowerCase()
    const matchS = !search || i.titre?.toLowerCase().includes(q) || i.auteur?.toLowerCase().includes(q)
    const matchT = !filterType || i.type === filterType
    return matchS && matchT
  })

  const stats = {
    total:       items.length,
    predications: items.filter(i => i.type === 'predication').length,
    documents:   items.filter(i => i.type === 'document').length,
    formulaires: items.filter(i => i.type === 'formulaire').length,
  }

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (r) => { setEditing(r); setForm({ ...r }); setModal(true) }
  const close    = () => { setModal(false); setEditing(null) }

  const save = async () => {
    if (!form.titre) return
    setSaving(true)
    editing ? await ressourcesApi.update(editing.id, form) : await ressourcesApi.create(form)
    setSaving(false); close(); load()
  }
  const del = async (id) => {
    if (!confirm('Supprimer cette ressource ?')) return
    await ressourcesApi.delete(id); load()
  }
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <PageHeader
        title="Ressources & Bibliothèque"
        subtitle={`${items.length} ressource(s) disponible(s)`}
        action={<Button variant="gold" onClick={openNew}><IconPlus size={14} color="white"/> Ajouter une ressource</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total"        value={stats.total}        accent="navy"   icon={(c)=><IconFile size={20} color={c}/>}/>
        <StatCard label="Prédications" value={stats.predications} accent="blue"   icon={(c)=><IconMic  size={20} color={c}/>}/>
        <StatCard label="Documents"    value={stats.documents}    accent="gold"   icon={(c)=><IconFile size={20} color={c}/>}/>
        <StatCard label="Formulaires"  value={stats.formulaires}  accent="purple" icon={(c)=><IconClip size={20} color={c}/>}/>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2"><IconSearch size={13} color="#9AA5B4"/></div>
          <input className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]"
            placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-2">
          {['', 'predication', 'document', 'formulaire', 'media'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                filterType === t ? 'bg-[#0D2B5E] text-white border-[#0D2B5E]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>
              {t === '' ? 'Tout' : TYPE_RESSOURCE[t]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={<IconFile size={22} color="#9AA5B4"/>}
          title="Aucune ressource" description="Ajoutez votre première ressource."
          action={<Button variant="gold" onClick={openNew}><IconPlus size={13} color="white"/> Ajouter</Button>}/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(r => {
            const Icon = typeIconMap[r.type] || IconFile
            const bg   = typeBgColors[r.type]
            const ic   = typeIconColors[r.type]
            return (
              <Card key={r.id} className="hover:shadow-md transition-all group">
                <CardBody>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                      <Icon size={18} color={ic}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#0D2B5E] text-sm leading-tight line-clamp-2">{r.titre}</h3>
                        <Badge color={typeBadge[r.type]} size="xs" className="shrink-0">
                          {TYPE_RESSOURCE[r.type]?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {r.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{r.description}</p>
                  )}

                  <div className="text-xs text-slate-400 space-y-0.5 mb-4">
                    {r.auteur && <div className="flex items-center gap-1"><span className="text-slate-300">Par</span> {r.auteur}</div>}
                    {r.taille && <div>{r.taille}</div>}
                    <div>{formatDate(r.created_at)}</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A5EA8] hover:underline">
                        <IconDownload size={12} color="#1A5EA8"/> Télécharger
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300">Aucun fichier joint</span>
                    )}
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><IconEdit size={12}/></Button>
                      <Button size="sm" variant="ghost" onClick={() => del(r.id)} className="text-red-400 hover:bg-red-50"><IconTrash size={12}/></Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={close} title={editing ? 'Modifier la ressource' : 'Nouvelle ressource'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Titre *" value={form.titre} onChange={f('titre')} className="col-span-2" placeholder="Nom de la ressource"/>
          <Select label="Type" value={form.type} onChange={f('type')}>
            <option value="predication">Prédication</option>
            <option value="document">Document</option>
            <option value="formulaire">Formulaire</option>
            <option value="media">Média</option>
          </Select>
          <Input label="Auteur" value={form.auteur} onChange={f('auteur')} placeholder="Nom de l'auteur"/>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={f('description')} rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8] resize-none"
              placeholder="Description courte..."/>
          </div>
          <Input label="Lien URL (Google Drive, etc.)" value={form.url} onChange={f('url')} className="col-span-2" placeholder="https://drive.google.com/..."/>
          <Input label="Taille du fichier" value={form.taille} onChange={f('taille')} placeholder="Ex : 2.4 Mo"/>
          <Select label="Branche associée (optionnel)" value={form.branch_id} onChange={f('branch_id')}>
            <option value="">Toutes les branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </Select>
          <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-50">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving || !form.titre}>
              {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Ajouter la ressource'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
