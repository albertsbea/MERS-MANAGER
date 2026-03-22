import { useEffect, useState, useRef } from 'react'
import { ressourcesApi, branchesApi, storageApi } from '../lib/api'
import { formatDate, TYPE_RESSOURCE } from '../lib/utils'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconDownload } from '../components/icons'
import { PageHeader, Button, Card, CardBody, Badge, Modal, Input, Select, Spinner, EmptyState, StatCard } from '../components/ui'

const EMPTY = { titre:'', description:'', type:'document', url:'', taille:'', auteur:'', branch_id:'', file_path:'' }

const IconFile   = ({s=18,c='currentColor'})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconMic    = ({s=18,c='currentColor'})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
const IconClip   = ({s=18,c='currentColor'})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
const IconVideo  = ({s=18,c='currentColor'})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
const IconEye    = ({s=16,c='currentColor'})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconUpload = ({s=18,c='currentColor'})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>

const typeIconMap = { predication:IconMic, document:IconFile, formulaire:IconClip, media:IconVideo }
const typeBg      = { predication:'#E6F1FB', document:'#F1EFE8', formulaire:'#FEF6E7', media:'#EEEDFE' }
const typeIc      = { predication:'#1A5EA8', document:'#5F5E5A', formulaire:'#C8880A', media:'#534AB7' }
const typeBadge   = { predication:'blue', document:'slate', formulaire:'gold', media:'purple' }

function isPreviewable(url) {
  if (!url) return false
  const ext = url.split('.').pop().toLowerCase().split('?')[0]
  return ['pdf','jpg','jpeg','png','gif','webp'].includes(ext)
}

export default function Ressources() {
  const [items,    setItems]    = useState([])
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filterT,  setFilterT]  = useState('')
  const [modal,    setModal]    = useState(false)
  const [preview,  setPreview]  = useState(null)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const fileRef = useRef()

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
    return (!search || `${i.titre||''} ${i.auteur||''}`.toLowerCase().includes(q)) && (!filterT || i.type === filterT)
  })

  const stats = {
    total:       items.length,
    predications:items.filter(i=>i.type==='predication').length,
    documents:   items.filter(i=>i.type==='document').length,
    formulaires: items.filter(i=>i.type==='formulaire').length,
  }

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (r) => { setEditing(r); setForm({...r}); setModal(true) }
  const close    = () => { setModal(false); setEditing(null) }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url, size } = await storageApi.upload(file)
      setForm(p => ({ ...p, url, taille: size }))
    } catch (err) {
      alert('Erreur upload. Vérifiez le bucket "mers-files" dans Supabase Storage.')
    }
    setUploading(false)
  }

  const save = async () => {
    if (!form.titre) return
    setSaving(true)
    editing ? await ressourcesApi.update(editing.id, form) : await ressourcesApi.create(form)
    setSaving(false); close(); load()
  }
  const del = async (r) => {
    if (!confirm('Supprimer cette ressource ?')) return
    if (r.file_path) await storageApi.delete(r.file_path)
    await ressourcesApi.delete(r.id); load()
  }

  const f = k => e => setForm(p => ({...p,[k]:e.target.value}))

  return (
    <div>
      <PageHeader
        title="Ressources & Bibliothèque"
        subtitle={`${items.length} ressource(s) disponible(s)`}
        action={<Button variant="gold" onClick={openNew}><IconPlus size={14} color="white"/> Ajouter</Button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total"        value={stats.total}        accent="navy"   icon={(c)=><IconFile size={20} color={c}/>}/>
        <StatCard label="Prédications" value={stats.predications} accent="blue"   icon={(c)=><IconMic  size={20} color={c}/>}/>
        <StatCard label="Documents"    value={stats.documents}    accent="gold"   icon={(c)=><IconFile size={20} color={c}/>}/>
        <StatCard label="Formulaires"  value={stats.formulaires}  accent="purple" icon={(c)=><IconClip size={20} color={c}/>}/>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2"><IconSearch size={13} color="#9AA5B4"/></div>
          <input className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['','predication','document','formulaire','media'].map(t=>(
            <button key={t} onClick={()=>setFilterT(t)} className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${filterT===t?'bg-[#0D2B5E] text-white border-[#0D2B5E]':'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {t===''?'Tout':TYPE_RESSOURCE[t]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={<IconFile size={22} color="#9AA5B4"/>} title="Aucune ressource" description="Ajoutez votre première ressource."
          action={<Button variant="gold" onClick={openNew}><IconPlus size={13} color="white"/> Ajouter</Button>}/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(r => {
            const Icon = typeIconMap[r.type] || IconFile
            const bg   = typeBg[r.type]
            const ic   = typeIc[r.type]
            const canPreview = isPreviewable(r.url)
            return (
              <Card key={r.id} className="hover:shadow-md transition-all group">
                <CardBody>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:bg}}>
                      <Icon s={18} c={ic}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#0D2B5E] text-sm leading-tight line-clamp-2">{r.titre}</h3>
                        <Badge color={typeBadge[r.type]} size="xs" className="shrink-0">{TYPE_RESSOURCE[r.type]?.label}</Badge>
                      </div>
                    </div>
                  </div>
                  {r.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{r.description}</p>}
                  <div className="text-xs text-slate-400 space-y-0.5 mb-4">
                    {r.auteur && <div><span className="text-slate-300">Par </span>{r.auteur}</div>}
                    {r.taille && <div>{r.taille}</div>}
                    <div>{formatDate(r.created_at)}</div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 gap-2 flex-wrap">
                    <div className="flex gap-1.5">
                      {r.url && canPreview && (
                        <button onClick={()=>setPreview(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#534AB7] bg-[#EEEDFE] rounded-lg hover:bg-[#CECBF6] transition-colors">
                          <IconEye s={11} c="#534AB7"/> Aperçu
                        </button>
                      )}
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" download
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#1A5EA8] bg-[#E6F1FB] rounded-lg hover:bg-[#B5D4F4] transition-colors">
                          <IconDownload size={11} color="#1A5EA8"/> Télécharger
                        </a>
                      )}
                      {!r.url && <span className="text-xs text-slate-300 italic">Aucun fichier</span>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={()=>openEdit(r)}><IconEdit size={12}/></Button>
                      <Button size="sm" variant="ghost" onClick={()=>del(r)} className="text-red-400 hover:bg-red-50"><IconTrash size={12}/></Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal prévisualisation */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setPreview(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-[#0D2B5E] truncate">{preview.titre}</h2>
              <div className="flex items-center gap-2">
                <a href={preview.url} target="_blank" rel="noopener noreferrer" download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1A5EA8] bg-[#E6F1FB] rounded-lg hover:bg-[#B5D4F4]">
                  <IconDownload size={12} color="#1A5EA8"/> Télécharger
                </a>
                <button onClick={()=>setPreview(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {preview.url.toLowerCase().includes('.pdf') ? (
                <iframe src={preview.url} className="w-full h-[70vh] rounded-lg border border-slate-200" title={preview.titre}/>
              ) : (
                <img src={preview.url} alt={preview.titre} className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"/>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout/édition */}
      <Modal isOpen={modal} onClose={close} title={editing?'Modifier la ressource':'Nouvelle ressource'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Titre *" value={form.titre} onChange={f('titre')} className="col-span-2" placeholder="Nom de la ressource"/>
          <Select label="Type" value={form.type} onChange={f('type')}>
            <option value="predication">Prédication</option>
            <option value="document">Document</option>
            <option value="formulaire">Formulaire</option>
            <option value="media">Média</option>
          </Select>
          <Input label="Auteur" value={form.auteur} onChange={f('auteur')} placeholder="Auteur / source"/>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={f('description')} rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8] resize-none"
              placeholder="Description courte..."/>
          </div>

          {/* Zone upload fichier */}
          <div className="col-span-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fichier à joindre</p>
            <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp3,.mp4"/>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-[#1A5EA8] transition-colors cursor-pointer"
              onClick={()=>fileRef.current?.click()}>
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#1A5EA8] border-t-transparent rounded-full animate-spin"/>
                  <span className="text-sm text-slate-500">Envoi en cours...</span>
                </div>
              ) : form.url ? (
                <div className="flex items-center justify-center gap-2 text-[#1D9E75]">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm font-semibold">Fichier joint</span>
                  <span className="text-xs text-slate-400">{form.taille}</span>
                </div>
              ) : (
                <div>
                  <IconUpload s={24} c="#9AA5B4"/>
                  <p className="text-sm text-slate-400 mt-1">Cliquez pour choisir un fichier</p>
                  <p className="text-xs text-slate-300">PDF, Word, Excel, PowerPoint, Image, Audio, Vidéo</p>
                </div>
              )}
            </div>
          </div>

          <Input label="Ou lien URL (Google Drive, YouTube...)" value={form.url} onChange={f('url')} className="col-span-2" placeholder="https://drive.google.com/..."/>

          <Select label="Branche associée" value={form.branch_id} onChange={f('branch_id')}>
            <option value="">Toutes les branches</option>
            {branches.map(b=><option key={b.id} value={b.id}>{b.nom}</option>)}
          </Select>
          <Input label="Taille du fichier" value={form.taille} onChange={f('taille')} placeholder="Ex : 2.4 Mo"/>

          <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-50">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving||!form.titre||uploading}>
              {saving?'Enregistrement...':editing?'Mettre à jour':'Ajouter la ressource'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
