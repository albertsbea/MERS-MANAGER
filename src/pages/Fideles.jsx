import ConfirmModal from '../components/ConfirmModal'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconUsers } from './../components/icons'
import { useEffect, useState } from 'react'
import { fidelesApi, branchesApi } from '../lib/api'
import { DEPARTEMENTS, DISCIPOLAT, formatDate } from '../lib/utils'
import Pagination from '../components/Pagination'
import {
  PageHeader, Button, Card, CardBody, Badge,
  Modal, Input, Select, Spinner, EmptyState, StatCard
} from '../components/ui'

const EMPTY = {
  branch_id:'', nom:'', prenom:'', date_naissance:'',
  genre:'M', telephone:'', adresse:'', profession:'',
  situation:'celibataire', departement:'papas',
  baptise:false, discipolat:'non_commence', statut:'actif'
}

const deptColor = { papas:'blue', mamans:'pink', jeunes:'green', enfants:'yellow' }
const discColor = { non_commence:'red', en_cours:'yellow', complete:'green' }

const ICheck = ({c='currentColor'})=><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IClose = ({c='currentColor'})=><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

const PER_PAGE_OPTIONS = [10, 20, 50]

export default function Fideles() {
  const [fideles,      setFideles]      = useState([])
  const [branches,     setBranches]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterDept,   setFilterDept]   = useState('')
  const [filterBaptise,setFilterBaptise]= useState('')
  const [modal,        setModal]        = useState(false)
  const [detail,       setDetail]       = useState(null)
  const [editing,      setEditing]      = useState(null)
  const [form,         setForm]         = useState(EMPTY)
  const [saving,       setSaving]       = useState(false)
  const [delId,    setDelId]    = useState(null)
  const [deleting, setDeleting] = useState(false)
  // Pagination
  const [page,    setPage]    = useState(1)
  const [perPage, setPerPage] = useState(20)

  const load = async () => {
    setLoading(true)
    const [{ data: f }, { data: b }] = await Promise.all([fidelesApi.getAll(), branchesApi.getAll()])
    setFideles(f || [])
    setBranches(b || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // Reset page quand filtres changent
  useEffect(() => { setPage(1) }, [search, filterBranch, filterDept, filterBaptise])

  const filtered = fideles.filter(f => {
    const q = `${f.nom} ${f.prenom}`.toLowerCase()
    return (!search       || q.includes(search.toLowerCase()))
      &&   (!filterBranch || f.branch_id   === filterBranch)
      &&   (!filterDept   || f.departement === filterDept)
      &&   (!filterBaptise|| String(f.baptise) === filterBaptise)
  })

  // Pagination
  const totalPages  = Math.ceil(filtered.length / perPage)
  const paginated   = filtered.slice((page - 1) * perPage, page * perPage)

  // Wrapper pour Pagination — passe setPerPage
  const handlePage = (p) => setPage(p)
  handlePage._setPerPage = (n) => { setPerPage(n); setPage(1) }

  // Stats
  const stats = {
    total:    fideles.length,
    actifs:   fideles.filter(f => f.statut === 'actif').length,
    baptises: fideles.filter(f => f.baptise).length,
    disc:     fideles.filter(f => f.discipolat === 'complete').length,
  }

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (f) => { setEditing(f); setForm({ ...f }); setModal(true) }
  const close    = () => { setModal(false); setEditing(null) }

  const save = async () => {
    if (!form.nom || !form.prenom) return
    setSaving(true)
    editing ? await fidelesApi.update(editing.id, form) : await fidelesApi.create(form)
    setSaving(false); close(); load()
  }
  const del = async (id) => {
    setDelId(id)
  }
  const confirmDel = async () => {
    setDeleting(true)
    await fidelessApi.delete(delId)
    setDeleting(false); setDelId(null); load()
  }
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <PageHeader
        title="Fidèles"
        subtitle={`${stats.actifs} membres actifs sur ${stats.total}`}
        action={<Button onClick={openNew} variant="gold"><IconPlus size={14} color="white"/> Nouveau fidèle</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total"          value={stats.total}    accent="navy"   icon={c=><IconUsers size={20} color={c}/>}/>
        <StatCard label="Actifs"         value={stats.actifs}   accent="green"  icon={c=><ICheck c={c}/>}/>
        <StatCard label="Baptisés"       value={stats.baptises} accent="blue"   icon={c=><ICheck c={c}/>}/>
        <StatCard label="Disc. complété" value={stats.disc}     accent="purple" icon={c=><ICheck c={c}/>}/>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <IconSearch size={13} color="#9AA5B4"/>
          </div>
          <input
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]"
            placeholder="Rechercher par nom..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
          value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
          <option value="">Toutes les branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
          value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">Tous les départements</option>
          {Object.entries(DEPARTEMENTS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
          value={filterBaptise} onChange={e => setFilterBaptise(e.target.value)}>
          <option value="">Tous (baptême)</option>
          <option value="true">Baptisés</option>
          <option value="false">Non baptisés</option>
        </select>
      </div>

      {/* Résultat filtré info */}
      {(search || filterBranch || filterDept || filterBaptise) && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-400">{filtered.length} résultat(s)</span>
          <button onClick={() => { setSearch(''); setFilterBranch(''); setFilterDept(''); setFilterBaptise('') }}
            className="text-xs text-[#1A5EA8] hover:underline">Effacer les filtres</button>
        </div>
      )}

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={22} color="#9AA5B4"/>}
          title="Aucun fidèle trouvé"
          description="Ajoutez votre premier fidèle ou ajustez les filtres."
          action={<Button onClick={openNew} variant="gold"><IconPlus size={13} color="white"/> Nouveau fidèle</Button>}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-semibold">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Branche</th>
                  <th className="text-left px-4 py-3 font-semibold">Département</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Baptême</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Discipolat</th>
                  <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">Tél</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((f, i) => (
                  <tr key={f.id}
                    className={`border-b border-slate-50 hover:bg-[#EBF3FC]/30 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                    onClick={() => setDetail(f)}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] flex items-center justify-center text-[#1A5EA8] text-xs font-bold shrink-0">
                          {f.prenom?.[0]}{f.nom?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0D2B5E] text-sm">{f.prenom} {f.nom}</div>
                          <div className="text-xs text-slate-400">{f.genre === 'M' ? 'Homme' : 'Femme'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{f.branches?.nom || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge color={deptColor[f.departement] || 'slate'} size="xs">
                        {DEPARTEMENTS[f.departement]?.label || f.departement}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${f.baptise ? 'text-[#1D9E75]' : 'text-slate-400'}`}>
                        {f.baptise ? <ICheck c="#1D9E75"/> : <IClose c="#9AA5B4"/>}
                        {f.baptise ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge color={discColor[f.discipolat] || 'slate'} size="xs">
                        {DISCIPOLAT[f.discipolat]?.label || f.discipolat}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden xl:table-cell">{f.telephone || '—'}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(f)}><IconEdit size={13}/></Button>
                        <Button size="sm" variant="ghost" onClick={() => del(f.id)} className="text-red-400 hover:bg-red-50"><IconTrash size={13}/></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            total={filtered.length}
            perPage={perPage}
            page={page}
            onPage={handlePage}
          />
        </Card>
      )}

      {/* Modal détail fidèle */}
      {detail && (
        <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Fiche du fidèle" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF3FC] flex items-center justify-center text-[#1A5EA8] text-xl font-bold">
                {detail.prenom?.[0]}{detail.nom?.[0]}
              </div>
              <div>
                <h3 className="font-bold text-[#0D2B5E] text-lg">{detail.prenom} {detail.nom}</h3>
                <p className="text-sm text-slate-400">{detail.genre === 'M' ? 'Homme' : 'Femme'} · {detail.situation}</p>
                <Badge color={deptColor[detail.departement] || 'slate'} size="xs" className="mt-1">
                  {DEPARTEMENTS[detail.departement]?.label}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4">
              {[
                {l:'Branche',    v: detail.branches?.nom || '—'},
                {l:'Téléphone',  v: detail.telephone || '—'},
                {l:'Baptisé(e)', v: detail.baptise ? 'Oui' : 'Non'},
                {l:'Discipolat', v: DISCIPOLAT[detail.discipolat]?.label || '—'},
                {l:'Profession', v: detail.profession || '—'},
                {l:'Adresse',    v: detail.adresse || '—'},
              ].map(({l,v}) => (
                <div key={l}>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{l}</p>
                  <p className="text-sm font-medium text-[#0D2B5E] mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
              <Button variant="secondary" onClick={() => { setDetail(null); openEdit(detail) }}>
                <IconEdit size={13}/> Modifier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal création/édition */}
      <Modal isOpen={modal} onClose={close} title={editing ? 'Modifier le fidèle' : 'Nouveau fidèle'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom *" value={form.prenom} onChange={f('prenom')}/>
          <Input label="Nom *"    value={form.nom}    onChange={f('nom')}/>
          <Select label="Genre" value={form.genre} onChange={f('genre')}>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </Select>
          <Input label="Date de naissance" type="date" value={form.date_naissance} onChange={f('date_naissance')}/>
          <Select label="Branche" value={form.branch_id} onChange={f('branch_id')} className="col-span-2">
            <option value="">— Choisir une branche —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </Select>
          <Select label="Département" value={form.departement} onChange={f('departement')}>
            {Object.entries(DEPARTEMENTS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Select label="Situation matrimoniale" value={form.situation} onChange={f('situation')}>
            <option value="celibataire">Célibataire</option>
            <option value="marie">Marié(e)</option>
            <option value="divorce">Divorcé(e)</option>
            <option value="veuf">Veuf/Veuve</option>
          </Select>
          <Input label="Téléphone" value={form.telephone} onChange={f('telephone')}/>
          <Input label="Profession" value={form.profession} onChange={f('profession')}/>
          <Input label="Adresse" value={form.adresse} onChange={f('adresse')} className="col-span-2"/>
          <Select label="Discipolat" value={form.discipolat} onChange={f('discipolat')}>
            <option value="non_commence">Non commencé</option>
            <option value="en_cours">En cours</option>
            <option value="complete">Complété</option>
          </Select>
          <Select label="Statut" value={form.statut} onChange={f('statut')}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </Select>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="baptise" checked={form.baptise} onChange={f('baptise')} className="w-4 h-4 accent-[#0D2B5E]"/>
            <label htmlFor="baptise" className="text-sm text-slate-700">Membre baptisé</label>
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-50">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving || !form.nom || !form.prenom}>
              {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Inscrire le fidèle'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!delId}
        onClose={()=>setDelId(null)}
        onConfirm={confirmDel}
        loading={deleting}
        title="Supprimer ce fidèle"
        message="Ce fidèle sera définitivement supprimé de la base de données."
        type="danger"
      />
    </div>
  )
}
