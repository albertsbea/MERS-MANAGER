import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { cultesApi, branchesApi, presencesApi } from '../lib/api'
import { formatDate, formatGNF } from '../lib/utils'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconBook, IconUsers } from '../components/icons'
import { PageHeader, Button, Card, CardBody, Badge, Modal, Input, Select, Spinner, EmptyState, StatCard } from '../components/ui'

const EMPTY_C = { branch_id:'', date_culte: new Date().toISOString().slice(0,10), type_culte:'dimanche', predicateur:'', texte_biblique:'', theme:'' }
const EMPTY_P = { papas:0, mamans:0, jeunes:0, enfants:0, visiteurs:0 }

const IconPeople = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconCheck2 = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>

const typeMeta = {
  dimanche: { label:'Dimanche', color:'blue',  bg:'#E6F1FB', ic:'#1A5EA8' },
  semaine:  { label:'Semaine',  color:'slate', bg:'#F1EFE8', ic:'#5F5E5A' },
  special:  { label:'Spécial', color:'gold',  bg:'#FEF6E7', ic:'#C8880A' },
}

export default function Cultes() {
  const [cultes,   setCultes]   = useState([])
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filterB,  setFilterB]  = useState('')
  const [filterT,  setFilterT]  = useState('')
  const [culteModal, setCulteModal] = useState(false)
  const [presModal,  setPresModal]  = useState(false)
  const [detailModal,setDetailModal] = useState(false)
  const [editingC,  setEditingC]  = useState(null)
  const [activeC,   setActiveC]   = useState(null)
  const [culteForm, setCulteForm] = useState(EMPTY_C)
  const [presForm,  setPresForm]  = useState(EMPTY_P)
  const [saving,    setSaving]    = useState(false)
  const [delId,    setDelId]    = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [page,    setPage]    = useState(1)
  const [perPage, setPerPage] = useState(10)

  const load = async () => {
    setLoading(true)
    const [{ data: c }, { data: b }] = await Promise.all([cultesApi.getAll(), branchesApi.getAll()])
    setCultes(c || [])
    setBranches(b || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  useEffect(() => { setPage(1) }, [search, filterB, filterT])

  const filtered = cultes.filter(c => {
    const q = search.toLowerCase()
    return (!search || `${c.branches?.nom||''} ${c.predicateur||''} ${c.theme||''}`.toLowerCase().includes(q))
      && (!filterB || c.branch_id === filterB)
      && (!filterT || c.type_culte === filterT)
  })

  const paginated = filtered.slice((page-1)*perPage, page*perPage)
  const handlePage = (p) => setPage(p)
  handlePage._setPerPage = (n) => { setPerPage(n); setPage(1) }

  const totalPresents  = cultes.reduce((s,c) => s + (c.presences?.[0]?.total||0), 0)
  const avgPresents    = cultes.filter(c=>c.presences?.[0]).length > 0
    ? Math.round(totalPresents / cultes.filter(c=>c.presences?.[0]).length) : 0
  const sansPresences  = cultes.filter(c=>!c.presences?.[0]).length

  const openNewC  = () => { setEditingC(null); setCulteForm(EMPTY_C); setCulteModal(true) }
  const openEditC = (c) => { setEditingC(c); setCulteForm({...c}); setCulteModal(true) }
  const closeC    = () => { setCulteModal(false); setEditingC(null) }

  const saveC = async () => {
    if (!culteForm.branch_id || !culteForm.date_culte) return
    setSaving(true)
    editingC ? await cultesApi.update(editingC.id, culteForm) : await cultesApi.create(culteForm)
    setSaving(false); closeC(); load()
  }
  const delC = (id) => setDelId(id)
  const confirmDel = async () => {
    setDeleting(true)
    await cultesApi.delete(delId)
    setDeleting(false); setDelId(null); load()
  }

  const openPres = async (c) => {
    setActiveC(c)
    const { data } = await presencesApi.getByCulte(c.id)
    setPresForm(data ? { papas:data.papas, mamans:data.mamans, jeunes:data.jeunes, enfants:data.enfants, visiteurs:data.visiteurs } : EMPTY_P)
    setPresModal(true)
  }
  const savePres = async () => {
    setSaving(true)
    // "total" est une colonne GENEREE par Supabase (GENERATED ALWAYS) — ne jamais l'inclure
    const fields = {
      papas:     parseInt(presForm.papas)     || 0,
      mamans:    parseInt(presForm.mamans)    || 0,
      jeunes:    parseInt(presForm.jeunes)    || 0,
      enfants:   parseInt(presForm.enfants)   || 0,
      visiteurs: parseInt(presForm.visiteurs) || 0,
    }
    const { data: existing } = await presencesApi.getByCulte(activeC.id)
    let error
    if (existing?.id) {
      const res = await supabase.from('presences').update(fields).eq('id', existing.id)
      error = res.error
    } else {
      const res = await supabase.from('presences').insert({ culte_id: activeC.id, ...fields })
      error = res.error
    }
    if (error) console.error('Presences save error:', error)
    setSaving(false); setPresModal(false); setActiveC(null); load()
  }

  const cf = k => e => setCulteForm(p => ({...p,[k]:e.target.value}))
  const pf = k => e => setPresForm(p => ({...p,[k]:parseInt(e.target.value)||0}))
  const totalPres = Object.values(presForm).reduce((s,v)=>s+(parseInt(v)||0),0)

  return (
    <div>
      <PageHeader
        title="Cultes & Présences"
        subtitle={`${cultes.length} culte(s) — ${totalPresents.toLocaleString('fr-FR')} présences cumulées`}
        action={<Button variant="gold" onClick={openNewC}><IconPlus size={14} color="white"/> Nouveau culte</Button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Cultes"         value={cultes.length}  accent="navy"  icon={(c)=><IconBook    size={20} color={c}/>}/>
        <StatCard label="Total présents" value={totalPresents.toLocaleString('fr-FR')} accent="blue" icon={(c)=><IconPeople size={20} color={c}/>}/>
        <StatCard label="Moy. par culte" value={avgPresents}    accent="gold"  icon={(c)=><IconUsers   size={20} color={c}/>}/>
        <StatCard label="À compléter"    value={sansPresences}  accent={sansPresences>0?'red':'green'} sub={sansPresences>0?'Sans présences':'Tout à jour'} icon={(c)=><IconCheck2 size={20} color={c}/>}/>
      </div>

      {cultes.length < 5 && (
        <div className="bg-[#EBF3FC] border border-[#B5D4F4] rounded-xl px-5 py-4 mb-5">
          <p className="text-sm font-bold text-[#0D2B5E] mb-2">Comment utiliser ce module ?</p>
          <div className="flex flex-wrap gap-4">
            {[
              {n:'1',t:'Créer un culte',d:'Cliquez "+ Nouveau culte", renseignez la date, la branche et le type.'},
              {n:'2',t:'Saisir les présences',d:'Sur la carte du culte, cliquez "Saisir présences" pour enregistrer par catégorie.'},
              {n:'3',t:'Voir le détail',d:'Cliquez "Détails" pour voir le résumé complet du culte et sa collecte.'},
            ].map(s=>(
              <div key={s.n} className="flex items-start gap-3 flex-1 min-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-[#1A5EA8] flex items-center justify-center text-white text-xs font-bold shrink-0">{s.n}</div>
                <div><p className="text-xs font-semibold text-[#0D2B5E]">{s.t}</p><p className="text-xs text-[#4A7FAA]">{s.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2"><IconSearch size={13} color="#9AA5B4"/></div>
          <input className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20" value={filterB} onChange={e=>setFilterB(e.target.value)}>
          <option value="">Toutes les branches</option>
          {branches.map(b=><option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
        <div className="flex gap-1">
          {['','dimanche','semaine','special'].map(t=>(
            <button key={t} onClick={()=>setFilterT(t)} className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${filterT===t?'bg-[#0D2B5E] text-white border-[#0D2B5E]':'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {t===''?'Tous':typeMeta[t]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={<IconBook size={22} color="#9AA5B4"/>} title="Aucun culte" description="Enregistrez votre premier culte."
          action={<Button variant="gold" onClick={openNewC}><IconPlus size={13} color="white"/> Créer un culte</Button>}/>
      ) : (
        <>
          <div className="space-y-3 mb-3">
            {paginated.map(c => {
              const pres = c.presences?.[0]
              const col  = c.collectes?.[0]
              const tm   = typeMeta[c.type_culte] || typeMeta.dimanche
              return (
                <Card key={c.id} className="hover:shadow-md transition-all">
                  <CardBody className="py-4">
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{background:tm.bg}}>
                        <IconBook size={18} color={tm.ic}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start flex-wrap gap-2 mb-0.5">
                          <span className="font-bold text-[#0D2B5E] text-sm">{formatDate(c.date_culte)}</span>
                          <Badge color={tm.color} size="xs">{tm.label}</Badge>
                          {!pres && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">Présences manquantes</span>}
                        </div>
                        <p className="text-sm text-slate-500 mb-1">{c.branches?.nom||'—'}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                          {c.predicateur    && <span><span className="text-slate-300">Par </span>{c.predicateur}</span>}
                          {c.theme          && <span className="truncate max-w-[200px]">«{c.theme}»</span>}
                          {c.texte_biblique && <span>{c.texte_biblique}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {pres ? (
                          <div className="text-center bg-[#EBF3FC] rounded-xl px-3 py-2">
                            <p className="text-2xl font-bold text-[#0D2B5E]">{pres.total}</p>
                            <p className="text-[10px] text-[#7AABDC] font-semibold uppercase">présents</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{pres.papas}P · {pres.mamans}M · {pres.jeunes}J · {pres.enfants}E{pres.visiteurs>0?` · ${pres.visiteurs}V`:''}</p>
                          </div>
                        ) : (
                          <div className="text-center border-2 border-dashed border-slate-200 rounded-xl px-3 py-2">
                            <p className="text-xs text-slate-300">Aucune</p><p className="text-[10px] text-slate-300">présence</p>
                          </div>
                        )}
                        {col && (
                          <div className="text-center bg-[#FEF6E7] rounded-xl px-3 py-2">
                            <p className="text-sm font-bold text-[#C8880A]">{formatGNF(col.total)}</p>
                            <p className="text-[10px] text-[#C8880A] font-semibold uppercase">collecte</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0 min-w-[130px]">
                        <Button size="sm" variant={pres?'secondary':'primary'} onClick={()=>openPres(c)}>
                          <IconPeople size={12}/>{pres?'Modifier présences':'Saisir présences'}
                        </Button>
                        <div className="flex gap-1">
                          <button onClick={()=>{setActiveC(c);setDetailModal(true)}} className="flex-1 px-2 py-1.5 text-xs text-[#1A5EA8] bg-[#E6F1FB] rounded-lg hover:bg-[#B5D4F4] font-medium text-center">Détails</button>
                          <Button size="sm" variant="ghost" onClick={()=>openEditC(c)}><IconEdit size={12}/></Button>
                          <Button size="sm" variant="ghost" onClick={()=>delC(c.id)} className="text-red-400 hover:bg-red-50"><IconTrash size={12}/></Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
          <div className="bg-white rounded-xl border border-slate-100">
            <Pagination total={filtered.length} perPage={perPage} page={page} onPage={handlePage}/>
          </div>
        </>
      )}

      {/* Modal culte */}
      <Modal isOpen={culteModal} onClose={closeC} title={editingC?'Modifier le culte':'Nouveau culte'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Branche *" value={culteForm.branch_id} onChange={cf('branch_id')} className="col-span-2">
            <option value="">— Choisir une branche —</option>
            {branches.map(b=><option key={b.id} value={b.id}>{b.nom} ({b.region})</option>)}
          </Select>
          <Input label="Date *" type="date" value={culteForm.date_culte} onChange={cf('date_culte')}/>
          <Select label="Type" value={culteForm.type_culte} onChange={cf('type_culte')}>
            <option value="dimanche">Culte du dimanche</option>
            <option value="semaine">Culte de semaine</option>
            <option value="special">Culte spécial</option>
          </Select>
          <Input label="Prédicateur" value={culteForm.predicateur} onChange={cf('predicateur')} className="col-span-2"/>
          <Input label="Texte biblique" value={culteForm.texte_biblique} onChange={cf('texte_biblique')} placeholder="Ex : Jean 3:16"/>
          <Input label="Thème" value={culteForm.theme} onChange={cf('theme')}/>
          <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-50">
            <Button variant="secondary" onClick={closeC}>Annuler</Button>
            <Button variant="gold" onClick={saveC} disabled={saving||!culteForm.branch_id||!culteForm.date_culte}>
              {saving?'Enregistrement...':editingC?'Mettre à jour':'Créer le culte'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal présences */}
      <Modal isOpen={presModal} onClose={()=>{setPresModal(false);setActiveC(null)}} title="Saisie des présences">
        {activeC && (
          <div>
            <div className="bg-[#EBF3FC] rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1A5EA8] flex items-center justify-center"><IconBook size={16} color="white"/></div>
              <div>
                <p className="text-sm font-bold text-[#0D2B5E]">{activeC.branches?.nom}</p>
                <p className="text-xs text-slate-500">{formatDate(activeC.date_culte)} · {typeMeta[activeC.type_culte]?.label}</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Nombre de présents par catégorie</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[{k:'papas',l:'Papas',c:'#1A5EA8'},{k:'mamans',l:'Mamans',c:'#D4537E'},{k:'jeunes',l:'Jeunes',c:'#1D9E75'},{k:'enfants',l:'Enfants',c:'#C8880A'},{k:'visiteurs',l:'Visiteurs',c:'#534AB7'}].map(({k,l,c})=>(
                <div key={k} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{color:c}}>{l}</label>
                  <input type="number" min="0" value={presForm[k]} onChange={pf(k)} className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]"/>
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</label>
                <div className="border-2 border-[#0D2B5E] rounded-lg px-3 py-2.5 text-xl font-bold text-[#0D2B5E] bg-[#EBF3FC]">{totalPres}</div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
              <Button variant="secondary" onClick={()=>{setPresModal(false);setActiveC(null)}}>Annuler</Button>
              <Button variant="gold" onClick={savePres} disabled={saving}>{saving?'Enregistrement...':'Enregistrer les présences'}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal détail */}
      {activeC && (
        <Modal isOpen={detailModal} onClose={()=>{setDetailModal(false);setActiveC(null)}} title="Détail du culte">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4">
              {[{l:'Date',v:formatDate(activeC.date_culte)},{l:'Branche',v:activeC.branches?.nom||'—'},{l:'Type',v:typeMeta[activeC.type_culte]?.label},{l:'Prédicateur',v:activeC.predicateur||'—'},{l:'Texte',v:activeC.texte_biblique||'—'},{l:'Thème',v:activeC.theme||'—'}].map(({l,v})=>(
                <div key={l}><p className="text-xs text-slate-400 uppercase tracking-wide">{l}</p><p className="text-sm font-medium text-[#0D2B5E] mt-0.5">{v}</p></div>
              ))}
            </div>
            {activeC.presences?.[0] && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Présences</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{l:'Papas',v:activeC.presences[0].papas},{l:'Mamans',v:activeC.presences[0].mamans},{l:'Jeunes',v:activeC.presences[0].jeunes},{l:'Enfants',v:activeC.presences[0].enfants},{l:'Visiteurs',v:activeC.presences[0].visiteurs},{l:'TOTAL',v:activeC.presences[0].total,b:true}].map(({l,v,b})=>(
                    <div key={l} className={`text-center rounded-xl py-2 ${b?'bg-[#EBF3FC]':'bg-slate-50'}`}>
                      <p className={`${b?'text-xl':'text-lg'} font-bold text-[#0D2B5E]`}>{v}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeC.collectes?.[0] && (
              <div className="bg-[#FEF6E7] rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-slate-500">Collecte</span>
                <span className="text-lg font-bold text-[#C8880A]">{formatGNF(activeC.collectes[0].total)}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!delId}
        onClose={()=>setDelId(null)}
        onConfirm={confirmDel}
        loading={deleting}
        title="Supprimer ce culte"
        message="Ce culte et ses présences associées seront définitivement supprimés."
        type="danger"
      />
    </div>
  )
}

