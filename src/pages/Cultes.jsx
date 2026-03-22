import { IconPlus, IconEdit, IconBook, IconCalendar } from './../components/icons'
import { useEffect, useState } from 'react'
import { cultesApi, branchesApi, presencesApi } from '../lib/api'
import { TYPE_CULTE, formatDate } from '../lib/utils'
import {
  PageHeader, Button, Card, CardBody, CardHeader,
  Badge, Modal, Input, Select, Spinner, EmptyState
} from '../components/ui'

const EMPTY_CULTE = { branch_id: '', date_culte: new Date().toISOString().slice(0,10), type_culte: 'dimanche', predicateur: '', texte_biblique: '', theme: '' }
const EMPTY_PRES  = { papas: 0, mamans: 0, jeunes: 0, enfants: 0, visiteurs: 0 }

export default function Cultes() {
  const [cultes,   setCultes]   = useState([])
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filterBranch, setFilterBranch] = useState('')

  const [culteModal, setCulteModal] = useState(false)
  const [presModal,  setPresModal]  = useState(false)
  const [editingCulte, setEditingCulte] = useState(null)
  const [activeCulte,  setActiveCulte]  = useState(null)

  const [culteForm, setCulteForm] = useState(EMPTY_CULTE)
  const [presForm,  setPresForm]  = useState(EMPTY_PRES)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: c }, { data: b }] = await Promise.all([
      cultesApi.getAll(),
      branchesApi.getAll(),
    ])
    setCultes(c || [])
    setBranches(b || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filterBranch
    ? cultes.filter(c => c.branch_id === filterBranch)
    : cultes

  // Culte modal
  const openNewCulte  = ()  => { setEditingCulte(null); setCulteForm(EMPTY_CULTE); setCulteModal(true) }
  const openEditCulte = (c) => { setEditingCulte(c); setCulteForm({ ...c }); setCulteModal(true) }
  const closeCulte    = ()  => { setCulteModal(false); setEditingCulte(null) }

  const saveCulte = async () => {
    if (!culteForm.branch_id || !culteForm.date_culte) return
    setSaving(true)
    if (editingCulte) {
      await cultesApi.update(editingCulte.id, culteForm)
    } else {
      await cultesApi.create(culteForm)
    }
    setSaving(false)
    closeCulte()
    load()
  }

  // Présences modal
  const openPres = async (culte) => {
    setActiveCulte(culte)
    const { data } = await presencesApi.getByCulte(culte.id)
    setPresForm(data ? {
      papas: data.papas, mamans: data.mamans,
      jeunes: data.jeunes, enfants: data.enfants, visiteurs: data.visiteurs
    } : EMPTY_PRES)
    setPresModal(true)
  }
  const closePres = () => { setPresModal(false); setActiveCulte(null) }

  const savePres = async () => {
    setSaving(true)
    await presencesApi.upsert({ culte_id: activeCulte.id, ...presForm })
    setSaving(false)
    closePres()
    load()
  }

  const cf  = (k) => (e) => setCulteForm(p => ({ ...p, [k]: e.target.value }))
  const pf  = (k) => (e) => setPresForm(p => ({ ...p, [k]: parseInt(e.target.value) || 0 }))
  const total = Object.values(presForm).reduce((s, v) => s + (parseInt(v) || 0), 0)

  const typeBadge = { dimanche:'indigo', semaine:'slate', special:'amber' }

  return (
    <div>
      <PageHeader
        title="Cultes & Présences"
        subtitle={`${cultes.length} culte(s) enregistré(s)`}
        action={<Button onClick={openNewCulte} variant="gold"><IconPlus size={14} color="white"/> Nouveau culte</Button>}
      />

      <div className="flex gap-3 mb-5">
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]"
          value={filterBranch}
          onChange={e => setFilterBranch(e.target.value)}
        >
          <option value="">Toutes les branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={<IconBook size={22} color="#9AA5B4"/>} title="Aucun culte" description="Enregistrez votre premier culte." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Branche</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Prédicateur</th>
                  <th className="text-left px-4 py-3 font-semibold">Thème</th>
                  <th className="text-right px-4 py-3 font-semibold">Présents</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const pres = c.presences?.[0]
                  return (
                    <tr key={c.id} className={`border-b border-slate-50 hover:bg-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                      <td className="px-4 py-3 font-medium text-[#0D2B5E]">{formatDate(c.date_culte)}</td>
                      <td className="px-4 py-3 text-slate-600">{c.branches?.nom || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge color={typeBadge[c.type_culte] || 'slate'}>
                          {TYPE_CULTE[c.type_culte]?.label || c.type_culte}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.predicateur || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[160px] truncate">{c.theme || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {pres ? (
                          <span className="font-bold text-[#0D2B5E]">{pres.total}</span>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => openPres(c)}>
                            Saisir
                          </Button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {pres && (
                            <Button size="sm" variant="ghost" onClick={() => openPres(c)}><IconCalendar size={13}/></Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => openEditCulte(c)}><IconEdit size={13}/></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal culte */}
      <Modal isOpen={culteModal} onClose={closeCulte} title={editingCulte ? 'Modifier le culte' : 'Nouveau culte'}>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Branche *" value={culteForm.branch_id} onChange={cf('branch_id')} className="col-span-2">
            <option value="">— Choisir une branche —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </Select>
          <Input label="Date *" type="date" value={culteForm.date_culte} onChange={cf('date_culte')} />
          <Select label="Type de culte" value={culteForm.type_culte} onChange={cf('type_culte')}>
            <option value="dimanche">Culte du dimanche</option>
            <option value="semaine">Culte de semaine</option>
            <option value="special">Culte spécial</option>
          </Select>
          <Input label="Prédicateur" value={culteForm.predicateur} onChange={cf('predicateur')} className="col-span-2" />
          <Input label="Texte biblique" value={culteForm.texte_biblique} onChange={cf('texte_biblique')} placeholder="Ex : Jean 3:16" />
          <Input label="Thème du message" value={culteForm.theme} onChange={cf('theme')} />

          <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={closeCulte}>Annuler</Button>
            <Button variant="gold" onClick={saveCulte} disabled={saving || !culteForm.branch_id || !culteForm.date_culte}>
              {saving ? 'Enregistrement...' : editingCulte ? 'Mettre à jour' : 'Créer le culte'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal présences */}
      <Modal isOpen={presModal} onClose={closePres} title="Saisie des présences">
        {activeCulte && (
          <div>
            <div className="bg-[#EBF3FC] rounded-lg px-4 py-3 mb-5">
              <p className="text-sm font-semibold text-[#0D2B5E]">{activeCulte.branches?.nom}</p>
              <p className="text-xs text-slate-500">{formatDate(activeCulte.date_culte)} · {TYPE_CULTE[activeCulte.type_culte]?.label}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { key: 'papas',    label: 'Papas' },
                { key: 'mamans',   label: 'Mamans' },
                { key: 'jeunes',   label: 'Jeunes' },
                { key: 'enfants',  label: 'Enfants' },
                { key: 'visiteurs',label: 'Visiteurs' },
              ].map(({ key, label }) => (
                <Input key={key} label={label} type="number" min="0"
                  value={presForm[key]} onChange={pf(key)} />
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</label>
                <div className="border-2 border-[#0D2B5E] rounded-md px-3 py-2 text-lg font-bold text-[#0D2B5E] bg-[#EBF3FC]">
                  {total}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={closePres}>Annuler</Button>
              <Button variant="gold" onClick={savePres} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les présences'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
