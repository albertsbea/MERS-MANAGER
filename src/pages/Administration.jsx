import ConfirmModal from '../components/ConfirmModal'
import { useEffect, useState } from 'react'
import { utilisateursApi, branchesApi } from '../lib/api'
import { ROLES } from '../lib/utils'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconUsers, IconCheck, IconX } from '../components/icons'
import {
  PageHeader, Button, Card, CardHeader, CardBody,
  Badge, Modal, Input, Select, Spinner, EmptyState, StatCard, Th, Td
} from '../components/ui'

const EMPTY = { nom: '', prenom: '', email: '', role: 'secretaire', branch_id: '', actif: true }

const IconShield = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconKey    = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
const IconLock   = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>

const rolePermissions = {
  administrateur:    ['Branches', 'Fidèles', 'Cultes', 'Finances', 'Communication', 'Ressources', 'Rapports', 'Administration'],
  directeur:         ['Branches', 'Fidèles', 'Cultes', 'Finances', 'Communication', 'Ressources', 'Rapports'],
  pasteur_titulaire: ['Fidèles', 'Cultes', 'Finances (branche)', 'Communication', 'Ressources'],
  pasteur_assistant: ['Fidèles', 'Cultes', 'Communication'],
  secretaire:        ['Fidèles', 'Cultes'],
  tresorier:         ['Finances (branche)', 'Rapports financiers'],
}

export default function Administration() {
  const [users,    setUsers]    = useState([])
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(false)
  const [detailRole, setDetailRole] = useState(null)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [delId,    setDelId]    = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [tab,      setTab]      = useState('utilisateurs')

  const load = async () => {
    setLoading(true)
    const [{ data: u }, { data: b }] = await Promise.all([utilisateursApi.getAll(), branchesApi.getAll()])
    setUsers(u || [])
    setBranches(b || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !search || `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(q)
  })

  const roleCount = Object.fromEntries(Object.keys(ROLES).map(r => [r, users.filter(u => u.role === r).length]))

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (u) => {
    setEditing(u)
    const { branches: _, ...clean } = u
    setForm(clean)
    setModal(true)
  }
  const close    = () => { setModal(false); setEditing(null) }

  const save = async () => {
    if (!form.nom || !form.email) return
    setSaving(true)
    const payload = {
      nom:       form.nom       || '',
      prenom:    form.prenom    || '',
      email:     form.email     || '',
      role:      form.role      || 'secretaire',
      branch_id: form.branch_id || null,
      actif:     form.actif     ?? true,
    }
    const { error } = editing
      ? await utilisateursApi.update(editing.id, payload)
      : await utilisateursApi.create(payload)
    if (error) console.error('Administration save error:', error)
    setSaving(false); close(); load()
  }
  const del = async (id) => {
    setDelId(id)
  }
  const confirmDel = async () => {
    setDeleting(true)
    await administrationsApi.delete(delId)
    setDeleting(false); setDelId(null); load()
  }
  const toggleActif = async (u) => {
    await utilisateursApi.update(u.id, { actif: !u.actif }); load()
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const roleColorMap = { administrateur:'purple', directeur:'navy', pasteur_titulaire:'blue', pasteur_assistant:'teal', secretaire:'slate', tresorier:'gold' }

  return (
    <div>
      <PageHeader
        title="Administration"
        subtitle="Utilisateurs et gestion des rôles"
        action={tab === 'utilisateurs' && <Button variant="gold" onClick={openNew}><IconPlus size={14} color="white"/> Nouvel utilisateur</Button>}
      />

      {/* Stats rapides */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Utilisateurs"   value={users.length}                          accent="navy"   icon={(c)=><IconUsers size={20} color={c}/>}/>
        <StatCard label="Actifs"         value={users.filter(u=>u.actif).length}       accent="green"  icon={(c)=><IconCheck size={20} color={c}/>}/>
        <StatCard label="Administrateurs" value={roleCount.administrateur || 0}        accent="purple" icon={(c)=><IconShield size={20} color={c}/>}/>
        <StatCard label="Pasteurs"        value={(roleCount.pasteur_titulaire||0)+(roleCount.pasteur_assistant||0)} accent="blue" icon={(c)=><IconKey size={20} color={c}/>}/>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {[
          { key: 'utilisateurs', label: `Utilisateurs (${users.length})` },
          { key: 'roles',        label: 'Rôles & Permissions' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === key ? 'border-[#C8880A] text-[#0D2B5E]' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* ── UTILISATEURS ── */}
          {tab === 'utilisateurs' && (
            <>
              <div className="relative mb-4 max-w-sm">
                <div className="absolute left-3 top-1/2 -translate-y-1/2"><IconSearch size={13} color="#9AA5B4"/></div>
                <input className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]"
                  placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}/>
              </div>

              {filtered.length === 0 ? (
                <EmptyState icon={<IconUsers size={22} color="#9AA5B4"/>} title="Aucun utilisateur"
                  action={<Button variant="gold" onClick={openNew}><IconPlus size={13} color="white"/> Ajouter</Button>}/>
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                          <Th>Utilisateur</Th>
                          <Th>Rôle</Th>
                          <Th>Branche</Th>
                          <Th>Email</Th>
                          <Th>Statut</Th>
                          <Th></Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filtered.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <Td>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] flex items-center justify-center text-[#1A5EA8] text-xs font-bold shrink-0">
                                  {u.prenom[0]}{u.nom[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#0D2B5E] text-sm">{u.prenom} {u.nom}</p>
                                </div>
                              </div>
                            </Td>
                            <Td>
                              <Badge color={roleColorMap[u.role] || 'slate'}>
                                {ROLES[u.role]?.label || u.role}
                              </Badge>
                            </Td>
                            <Td>{u.branches?.nom || <span className="text-slate-300">—</span>}</Td>
                            <Td><span className="text-xs text-slate-400">{u.email}</span></Td>
                            <Td>
                              <button onClick={() => toggleActif(u)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                  u.actif ? 'bg-[#EAF3DE] text-[#3B6D11] hover:bg-[#C0DD97]' : 'bg-[#FCEBEB] text-[#791F1F] hover:bg-[#F7C1C1]'
                                }`}>
                                {u.actif ? <><IconCheck size={10}/> Actif</> : <><IconX size={10}/> Inactif</>}
                              </button>
                            </Td>
                            <Td>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><IconEdit size={13}/></Button>
                                <Button size="sm" variant="ghost" onClick={() => del(u.id)} className="text-red-400 hover:bg-red-50"><IconTrash size={13}/></Button>
                              </div>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* ── RÔLES ── */}
          {tab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(ROLES).map(([key, role]) => (
                <Card key={key} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailRole(key)}>
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] flex items-center justify-center">
                          <IconShield size={18} color="#1A5EA8"/>
                        </div>
                        <div>
                          <h3 className="font-bold text-[#0D2B5E] text-sm">{role.label}</h3>
                          <p className="text-xs text-slate-400">{role.desc}</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#EBF3FC] flex items-center justify-center text-[#0D2B5E] text-xs font-bold">
                        {roleCount[key] || 0}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-50">
                      <p className="text-xs text-slate-400 mb-2">Modules accessibles :</p>
                      <div className="flex flex-wrap gap-1">
                        {(rolePermissions[key] || []).slice(0, 4).map(p => (
                          <Badge key={p} color="navy" size="xs">{p}</Badge>
                        ))}
                        {(rolePermissions[key] || []).length > 4 && (
                          <Badge color="slate" size="xs">+{rolePermissions[key].length - 4}</Badge>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal détail rôle */}
      {detailRole && (
        <Modal isOpen={!!detailRole} onClose={() => setDetailRole(null)} title={`Rôle : ${ROLES[detailRole]?.label}`}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{ROLES[detailRole]?.desc}</p>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modules accessibles</p>
              <div className="space-y-1.5">
                {(rolePermissions[detailRole] || []).map(p => (
                  <div key={p} className="flex items-center gap-2 text-sm text-[#0D2B5E]">
                    <div className="w-5 h-5 rounded-md bg-[#EAF3DE] flex items-center justify-center">
                      <IconCheck size={11} color="#3B6D11"/>
                    </div>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50">
              <p className="text-xs text-slate-400">{roleCount[detailRole] || 0} utilisateur(s) avec ce rôle</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal utilisateur */}
      <Modal isOpen={modal} onClose={close} title={editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom *" value={form.prenom} onChange={f('prenom')}/>
          <Input label="Nom *"    value={form.nom}    onChange={f('nom')}/>
          <Input label="Email *"  value={form.email}  onChange={f('email')} type="email" className="col-span-2"/>
          <Select label="Rôle" value={form.role} onChange={f('role')}>
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Select label="Branche" value={form.branch_id} onChange={f('branch_id')}>
            <option value="">— Nationale (toutes) —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </Select>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="actif" checked={form.actif} onChange={f('actif')} className="w-4 h-4 accent-[#0D2B5E]"/>
            <label htmlFor="actif" className="text-sm text-slate-700">Compte actif</label>
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-50">
            <Button variant="secondary" onClick={close}>Annuler</Button>
            <Button variant="gold" onClick={save} disabled={saving || !form.nom || !form.email}>
              {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!delId}
        onClose={()=>setDelId(null)}
        onConfirm={confirmDel}
        loading={deleting}
        title="Supprimer ce utilisateur"
        message="Cet utilisateur perdra son accès à la plateforme."
        type="danger"
      />
    </div>
  )
}
