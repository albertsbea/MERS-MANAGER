import { IconPlus, IconEdit, IconTrash, IconBuilding, IconMapPin } from './../components/icons'
import { useEffect, useState } from 'react'
import { branchesApi } from '../lib/api'
import { STATUT_BRANCHE } from '../lib/utils'
import {
  PageHeader, Button, Card, CardBody, Badge,
  Modal, Input, Select, Spinner, EmptyState
} from '../components/ui'

const EMPTY = { nom: '', region: '', adresse: '', telephone: '', pasteur_nom: '', statut: 'active' }

const REGIONS = [
  'Conakry','Kindia','Boké','Mamou','Labé',
  'Faranah','Kankan','Nzérékoré','Coyah','Dubreka'
]

export default function Branches() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await branchesApi.getAll()
    setBranches(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew  = ()  => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (b) => { setEditing(b); setForm({ ...b }); setModal(true) }
  const close    = ()  => { setModal(false); setEditing(null) }

  const save = async () => {
    if (!form.nom || !form.region) return
    setSaving(true)
    if (editing) {
      await branchesApi.update(editing.id, form)
    } else {
      await branchesApi.create(form)
    }
    setSaving(false)
    close()
    load()
  }

  const del = async (id) => {
    if (!confirm('Supprimer cette branche ?')) return
    await branchesApi.delete(id)
    load()
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle={`${branches.length} branche(s) enregistrée(s)`}
        action={<Button onClick={openNew} variant="gold"><IconPlus size={14} color="white"/> Nouvelle branche</Button>}
      />

      {loading ? <Spinner /> : branches.length === 0 ? (
        <EmptyState icon={<IconBuilding size={22} color="#9AA5B4"/>} title="Aucune branche" description="Créez votre première branche pour commencer." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map(b => (
            <Card key={b.id} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#0D2B5E] leading-tight">{b.nom}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">📍 {b.region}</p>
                  </div>
                  <Badge color={b.statut === 'active' ? 'green' : b.statut === 'suspendue' ? 'yellow' : 'red'}>
                    {STATUT_BRANCHE[b.statut]?.label || b.statut}
                  </Badge>
                </div>

                {b.pasteur_nom && (
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="text-slate-400">Pasteur : </span>{b.pasteur_nom}
                  </p>
                )}
                {b.telephone && (
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="text-slate-400">Tél : </span>{b.telephone}
                  </p>
                )}
                {b.adresse && (
                  <p className="text-xs text-slate-400 mt-2 truncate">{b.adresse}</p>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(b)}><IconEdit size={13}/>Modifier</Button>
                  <Button size="sm" variant="ghost" onClick={() => del(b.id)} className="text-red-500 hover:bg-red-50"><IconTrash size={13}/></Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal création/édition */}
      <Modal isOpen={modal} onClose={close} title={editing ? 'Modifier la branche' : 'Nouvelle branche'}>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Nom de la branche *" value={form.nom} onChange={f('nom')} placeholder="Ex : MERS Conakry Centre" />
          <Select label="Région *" value={form.region} onChange={f('region')}>
            <option value="">— Choisir une région —</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Input label="Adresse" value={form.adresse} onChange={f('adresse')} placeholder="Commune, quartier..." />
          <Input label="Pasteur responsable" value={form.pasteur_nom} onChange={f('pasteur_nom')} placeholder="Nom du pasteur titulaire" />
          <Input label="Téléphone" value={form.telephone} onChange={f('telephone')} placeholder="+224 6XX XXX XXX" />
          <Select label="Statut" value={form.statut} onChange={f('statut')}>
            <option value="active">Active</option>
            <option value="suspendue">Suspendue</option>
            <option value="fermee">Fermée</option>
          </Select>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving || !form.nom || !form.region}>
              {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer la branche'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
