import { IconPlus, IconTrash, IconTrendUp, IconWallet } from './../components/icons'
import { useEffect, useState } from 'react'
import { collectesApi, depensesApi, branchesApi, cultesApi } from '../lib/api'
import { formatGNF, formatDateShort, CATEGORIES_DEPENSE } from '../lib/utils'
import {
  PageHeader, Button, Card, CardHeader, CardBody,
  StatCard, Badge, Modal, Input, Select, Spinner, EmptyState
} from '../components/ui'

const EMPTY_COLLECTE = {
  branch_id: '', culte_id: '',
  dimes: 0, offrandes_ordinaires: 0, offrande_speciale: 0, autres_dons: 0,
  mode_reception: 'especes', notes: ''
}
const EMPTY_DEPENSE = {
  branch_id: '', date_dep: new Date().toISOString().slice(0,10),
  description: '', montant: '', categorie: 'fonctionnement'
}

export default function Finances() {
  const [tab,       setTab]       = useState('collectes')
  const [collectes, setCollectes] = useState([])
  const [depenses,  setDepenses]  = useState([])
  const [branches,  setBranches]  = useState([])
  const [cultes,    setCultes]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filterBranch, setFilterBranch] = useState('')

  const [colModal, setColModal] = useState(false)
  const [depModal, setDepModal] = useState(false)
  const [colForm,  setColForm]  = useState(EMPTY_COLLECTE)
  const [depForm,  setDepForm]  = useState(EMPTY_DEPENSE)
  const [saving,   setSaving]   = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: col }, { data: dep }, { data: br }, { data: cul }] = await Promise.all([
      collectesApi.getAll(),
      depensesApi.getAll(),
      branchesApi.getAll(),
      cultesApi.getAll(),
    ])
    setCollectes(col || [])
    setDepenses(dep || [])
    setBranches(br || [])
    setCultes(cul || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Stats globales
  const totalCollectes = collectes.reduce((s, r) => s + (r.total || 0), 0)
  const totalDepenses  = depenses.reduce((s, r)  => s + (r.montant || 0), 0)
  const solde          = totalCollectes - totalDepenses

  // Filtrage
  const filteredCol = filterBranch ? collectes.filter(c => c.branch_id === filterBranch) : collectes
  const filteredDep = filterBranch ? depenses.filter(d => d.branch_id === filterBranch)  : depenses

  // Cultes filtrés par branche pour le select
  const cultesFiltered = colForm.branch_id
    ? cultes.filter(c => c.branch_id === colForm.branch_id)
    : cultes

  // Collecte modal
  const openCol = () => { setColForm(EMPTY_COLLECTE); setColModal(true) }
  const closeCol = () => { setColModal(false) }
  const saveCol = async () => {
    if (!colForm.branch_id) return
    setSaving(true)
    await collectesApi.create(colForm)
    setSaving(false)
    closeCol()
    load()
  }

  // Dépense modal
  const openDep = () => { setDepForm(EMPTY_DEPENSE); setDepModal(true) }
  const closeDep = () => { setDepModal(false) }
  const saveDep = async () => {
    if (!depForm.branch_id || !depForm.description || !depForm.montant) return
    setSaving(true)
    await depensesApi.create({ ...depForm, montant: parseInt(depForm.montant) })
    setSaving(false)
    closeDep()
    load()
  }

  const delDep = async (id) => {
    if (!confirm('Supprimer cette dépense ?')) return
    await depensesApi.delete(id)
    load()
  }

  const cf = (k) => (e) => setColForm(p => ({ ...p, [k]: e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))
  const df = (k) => (e) => setDepForm(p => ({ ...p, [k]: e.target.value }))

  const colTotal = (colForm.dimes || 0) + (colForm.offrandes_ordinaires || 0) + (colForm.offrande_speciale || 0) + (colForm.autres_dons || 0)

  const catColor = { fonctionnement:'slate', pastoral:'blue', investissement:'indigo', prime_pasteur:'amber', autre:'slate' }

  return (
    <div>
      <PageHeader
        title="Finances"
        subtitle="Collectes, dépenses et solde général"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={openDep}>+ Dépense</Button>
            <Button variant="gold"      onClick={openCol}>+ Collecte</Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total collectes"  value={formatGNF(totalCollectes)} icon="📥" accent="gold" />
        <StatCard label="Total dépenses"   value={formatGNF(totalDepenses)}  icon="📤" accent="red" />
        <StatCard
          label="Solde net"
          value={formatGNF(solde)}
          icon="💰"
          accent={solde >= 0 ? 'green' : 'red'}
          sub={solde >= 0 ? 'Excédent' : 'Déficit'}
        />
      </div>

      {/* Filtre branche */}
      <div className="flex items-center gap-3 mb-5">
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]"
          value={filterBranch}
          onChange={e => setFilterBranch(e.target.value)}
        >
          <option value="">Toutes les branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
        {filterBranch && (
          <button onClick={() => setFilterBranch('')} className="text-xs text-slate-400 hover:text-slate-600">
            ✕ Effacer le filtre
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {[
          { key: 'collectes', label: `Collectes (${filteredCol.length})` },
          { key: 'depenses',  label: `Dépenses (${filteredDep.length})` },
          { key: 'bilan',     label: 'Bilan par branche' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-[#C8880A] text-[#0D2B5E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* ── COLLECTES ── */}
          {tab === 'collectes' && (
            filteredCol.length === 0 ? (
              <EmptyState icon="📥" title="Aucune collecte" description="Enregistrez votre première collecte." />
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-4 py-3 font-semibold">Date</th>
                        <th className="text-left px-4 py-3 font-semibold">Branche</th>
                        <th className="text-right px-4 py-3 font-semibold">Dîmes</th>
                        <th className="text-right px-4 py-3 font-semibold">Offrandes</th>
                        <th className="text-right px-4 py-3 font-semibold">Off. spéciale</th>
                        <th className="text-right px-4 py-3 font-semibold text-[#C8880A]">Total</th>
                        <th className="text-left px-4 py-3 font-semibold">Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCol.map((c, i) => (
                        <tr key={c.id} className={`border-b border-slate-50 hover:bg-slate-50 ${i%2===0?'':'bg-slate-50/30'}`}>
                          <td className="px-4 py-3 text-slate-600">{formatDateShort(c.cultes?.date_culte || c.created_at)}</td>
                          <td className="px-4 py-3 font-medium text-[#0D2B5E]">{c.branches?.nom || '—'}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{formatGNF(c.dimes)}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{formatGNF(c.offrandes_ordinaires)}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{formatGNF(c.offrande_speciale)}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#C8880A]">{formatGNF(c.total)}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs capitalize">{c.mode_reception?.replace('_',' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#0D2B5E]/5 border-t-2 border-[#0D2B5E]/20">
                        <td colSpan={5} className="px-4 py-3 font-bold text-[#0D2B5E] text-right">TOTAL</td>
                        <td className="px-4 py-3 text-right font-bold text-[#C8880A] text-base">
                          {formatGNF(filteredCol.reduce((s, r) => s + (r.total || 0), 0))}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            )
          )}

          {/* ── DÉPENSES ── */}
          {tab === 'depenses' && (
            filteredDep.length === 0 ? (
              <EmptyState icon="📤" title="Aucune dépense" description="Aucune dépense enregistrée." />
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-4 py-3 font-semibold">Date</th>
                        <th className="text-left px-4 py-3 font-semibold">Branche</th>
                        <th className="text-left px-4 py-3 font-semibold">Description</th>
                        <th className="text-left px-4 py-3 font-semibold">Catégorie</th>
                        <th className="text-right px-4 py-3 font-semibold text-red-600">Montant</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDep.map((d, i) => (
                        <tr key={d.id} className={`border-b border-slate-50 hover:bg-slate-50 ${i%2===0?'':'bg-slate-50/30'}`}>
                          <td className="px-4 py-3 text-slate-600">{formatDateShort(d.date_dep)}</td>
                          <td className="px-4 py-3 font-medium text-[#0D2B5E]">{d.branches?.nom || '—'}</td>
                          <td className="px-4 py-3 text-slate-700">{d.description}</td>
                          <td className="px-4 py-3">
                            <Badge color={catColor[d.categorie] || 'slate'}>
                              {CATEGORIES_DEPENSE[d.categorie] || d.categorie}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-red-600">{formatGNF(d.montant)}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="ghost" onClick={() => delDep(d.id)} className="text-red-400 hover:bg-red-50"><IconTrash size={13}/></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-red-50 border-t-2 border-red-200">
                        <td colSpan={4} className="px-4 py-3 font-bold text-red-700 text-right">TOTAL DÉPENSES</td>
                        <td className="px-4 py-3 text-right font-bold text-red-700 text-base">
                          {formatGNF(filteredDep.reduce((s, r) => s + (r.montant || 0), 0))}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            )
          )}

          {/* ── BILAN PAR BRANCHE ── */}
          {tab === 'bilan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {branches.map(b => {
                const recettes = collectes.filter(c => c.branch_id === b.id).reduce((s, r) => s + (r.total || 0), 0)
                const charges  = depenses.filter(d => d.branch_id === b.id).reduce((s, r) => s + (r.montant || 0), 0)
                const net      = recettes - charges
                return (
                  <Card key={b.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <h3 className="font-bold text-[#0D2B5E] text-sm">{b.nom}</h3>
                      <p className="text-xs text-slate-400">{b.region}</p>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Recettes</span>
                          <span className="font-semibold text-[#C8880A]">{formatGNF(recettes)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Dépenses</span>
                          <span className="font-semibold text-red-500">{formatGNF(charges)}</span>
                        </div>
                        <div className="h-px bg-slate-100" />
                        <div className="flex justify-between">
                          <span className="text-sm font-bold text-[#0D2B5E]">Solde</span>
                          <span className={`font-bold text-base ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatGNF(net)}
                          </span>
                        </div>
                        {/* Barre visuelle */}
                        {recettes > 0 && (
                          <div className="w-full h-1.5 bg-red-100 rounded-full mt-2">
                            <div
                              className="h-1.5 bg-green-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (recettes - charges) / recettes * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Modal collecte ── */}
      <Modal isOpen={colModal} onClose={closeCol} title="Nouvelle collecte" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Branche *" value={colForm.branch_id} onChange={cf('branch_id')} className="col-span-2">
            <option value="">— Choisir une branche —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </Select>
          <Select label="Culte associé (optionnel)" value={colForm.culte_id} onChange={cf('culte_id')} className="col-span-2">
            <option value="">— Sélectionner un culte —</option>
            {cultesFiltered.map(c => (
              <option key={c.id} value={c.id}>
                {formatDateShort(c.date_culte)} — {c.type_culte} {c.theme ? `· ${c.theme}` : ''}
              </option>
            ))}
          </Select>

          <div className="col-span-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Répartition des recettes</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'dimes',                label: 'Dîmes' },
                { k: 'offrandes_ordinaires', label: 'Offrandes ordinaires' },
                { k: 'offrande_speciale',    label: 'Offrande spéciale' },
                { k: 'autres_dons',          label: 'Autres dons' },
              ].map(({ k, label }) => (
                <Input key={k} label={label} type="number" min="0"
                  value={colForm[k]} onChange={cf(k)} />
              ))}
            </div>
          </div>

          {/* Total dynamique */}
          <div className="col-span-2 flex items-center justify-between bg-[#EBF3FC] rounded-lg px-4 py-3">
            <span className="text-sm font-semibold text-[#0D2B5E]">Total de la collecte</span>
            <span className="text-xl font-bold text-[#C8880A]">{formatGNF(colTotal)}</span>
          </div>

          <Select label="Mode de réception" value={colForm.mode_reception} onChange={cf('mode_reception')}>
            <option value="especes">Espèces</option>
            <option value="orange_money">Orange Money</option>
            <option value="mtn_momo">MTN MoMo</option>
            <option value="virement">Virement</option>
          </Select>
          <Input label="Notes (optionnel)" value={colForm.notes} onChange={cf('notes')} />

          <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={closeCol}>Annuler</Button>
            <Button variant="gold" onClick={saveCol} disabled={saving || !colForm.branch_id}>
              {saving ? 'Enregistrement...' : 'Enregistrer la collecte'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal dépense ── */}
      <Modal isOpen={depModal} onClose={closeDep} title="Nouvelle dépense">
        <div className="grid grid-cols-1 gap-4">
          <Select label="Branche *" value={depForm.branch_id} onChange={df('branch_id')}>
            <option value="">— Choisir une branche —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </Select>
          <Input label="Date *" type="date" value={depForm.date_dep} onChange={df('date_dep')} />
          <Input label="Description *" value={depForm.description} onChange={df('description')} placeholder="Ex : Achat de chaises, Prime pasteur..." />
          <Input label="Montant (GNF) *" type="number" min="0" value={depForm.montant} onChange={df('montant')} placeholder="Ex : 500000" />
          <Select label="Catégorie" value={depForm.categorie} onChange={df('categorie')}>
            {Object.entries(CATEGORIES_DEPENSE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={closeDep}>Annuler</Button>
            <Button variant="danger" onClick={saveDep}
              disabled={saving || !depForm.branch_id || !depForm.description || !depForm.montant}>
              {saving ? 'Enregistrement...' : 'Enregistrer la dépense'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
