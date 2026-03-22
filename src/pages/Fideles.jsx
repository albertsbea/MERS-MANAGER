import { IconPlus, IconEdit, IconTrash, IconSearch, IconFilter, IconUsers } from './../components/icons'
import { useEffect, useState } from 'react'
import { fidelesApi, branchesApi } from '../lib/api'
import { DEPARTEMENTS, DISCIPOLAT, formatDate } from '../lib/utils'
import {
  PageHeader, Button, Card, CardBody, Badge,
  Modal, Input, Select, Spinner, EmptyState
} from '../components/ui'

const EMPTY = {
  branch_id: '', nom: '', prenom: '', date_naissance: '',
  genre: 'M', telephone: '', adresse: '', profession: '',
  situation: 'celibataire', departement: 'papas',
  baptise: false, discipolat: 'non_commence', statut: 'actif'
}

export default function Fideles() {
  const [fideles,   setFideles]   = useState([])
  const [branches,  setBranches]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterDept,   setFilterDept]   = useState('')
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: f }, { data: b }] = await Promise.all([
      fidelesApi.getAll(),
      branchesApi.getAll(),
    ])
    setFideles(f || [])
    setBranches(b || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = fideles.filter(f => {
    const full = `${f.nom} ${f.prenom}`.toLowerCase()
    const matchSearch = !search || full.includes(search.toLowerCase())
    const matchBranch = !filterBranch || f.branch_id === filterBranch
    const matchDept   = !filterDept   || f.departement === filterDept
    return matchSearch && matchBranch && matchDept
  })

  const openNew  = ()  => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (f) => { setEditing(f); setForm({ ...f, baptise: f.baptise ?? false }); setModal(true) }
  const close    = ()  => { setModal(false); setEditing(null) }

  const save = async () => {
    if (!form.nom || !form.prenom || !form.branch_id) return
    setSaving(true)
    if (editing) {
      await fidelesApi.update(editing.id, form)
    } else {
      await fidelesApi.create(form)
    }
    setSaving(false)
    close()
    load()
  }

  const del = async (id) => {
    if (!confirm('Supprimer ce fidèle ?')) return
    await fidelesApi.delete(id)
    load()
  }

  const f = (k) => (e) => setForm(p => ({
    ...p,
    [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }))

  const deptColor = { papas:'blue', mamans:'pink', jeunes:'green', enfants:'yellow' }
  const discColor = { non_commence:'red', en_cours:'yellow', complete:'green' }

  return (
    <div>
      <PageHeader
        title="Fidèles"
        subtitle={`${fideles.filter(f => f.statut === 'actif').length} membres actifs`}
        action={<Button onClick={openNew} variant="gold"><IconPlus size={14} color="white"/> Nouveau fidèle</Button>}
      />

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8] min-w-[200px]"
          placeholder="🔍  Rechercher par nom..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]"
          value={filterBranch}
          onChange={e => setFilterBranch(e.target.value)}
        >
          <option value="">Toutes les branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]"
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
        >
          <option value="">Tous les départements</option>
          {Object.entries(DEPARTEMENTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="👥" title="Aucun fidèle trouvé" description="Ajoutez votre premier fidèle ou ajustez les filtres." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-semibold">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold">Branche</th>
                  <th className="text-left px-4 py-3 font-semibold">Département</th>
                  <th className="text-left px-4 py-3 font-semibold">Baptême</th>
                  <th className="text-left px-4 py-3 font-semibold">Discipolat</th>
                  <th className="text-left px-4 py-3 font-semibold">Tél</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr key={f.id} className={`border-b border-slate-50 hover:bg-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#0D2B5E]">{f.prenom} {f.nom}</div>
                      <div className="text-xs text-slate-400">{f.genre === 'M' ? 'Masculin' : 'Féminin'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{f.branches?.nom || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge color={deptColor[f.departement] || 'slate'}>
                        {DEPARTEMENTS[f.departement]?.label || f.departement}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${f.baptise ? 'text-green-600' : 'text-red-500'}`}>
                        {f.baptise ? '✓ Oui' : '✗ Non'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={discColor[f.discipolat] || 'slate'}>
                        {DISCIPOLAT[f.discipolat]?.label || f.discipolat}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{f.telephone || '—'}</td>
                    <td className="px-4 py-3">
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
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={close} title={editing ? 'Modifier le fidèle' : 'Nouveau fidèle'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nom *" value={form.nom} onChange={f('nom')} />
          <Input label="Prénom *" value={form.prenom} onChange={f('prenom')} />
          <Input label="Date de naissance" type="date" value={form.date_naissance} onChange={f('date_naissance')} />
          <Select label="Genre" value={form.genre} onChange={f('genre')}>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </Select>
          <Select label="Branche *" value={form.branch_id} onChange={f('branch_id')} className="col-span-2">
            <option value="">— Choisir une branche —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </Select>
          <Input label="Téléphone" value={form.telephone} onChange={f('telephone')} />
          <Input label="Profession" value={form.profession} onChange={f('profession')} />
          <Input label="Adresse / Quartier" value={form.adresse} onChange={f('adresse')} className="col-span-2" />
          <Select label="Situation matrimoniale" value={form.situation} onChange={f('situation')}>
            <option value="celibataire">Célibataire</option>
            <option value="marie">Marié(e)</option>
            <option value="veuf">Veuf / Veuve</option>
          </Select>
          <Select label="Département" value={form.departement} onChange={f('departement')}>
            {Object.entries(DEPARTEMENTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
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
            <input type="checkbox" id="baptise" checked={form.baptise} onChange={f('baptise')}
              className="w-4 h-4 accent-[#0D2B5E]" />
            <label htmlFor="baptise" className="text-sm text-slate-700">Membre baptisé</label>
          </div>

          <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving || !form.nom || !form.prenom || !form.branch_id}>
              {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Ajouter le fidèle'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
