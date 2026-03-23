import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PageHeader, Button, Card, CardHeader, CardBody, Input, Select, Badge } from '../components/ui'
import { ROLES } from '../lib/utils'

const IUser    = ({c='currentColor'})=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IShield  = ({c='currentColor'})=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IBell    = ({c='currentColor'})=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const ILogout  = ({c='currentColor'})=><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const ICheck   = ({c='currentColor'})=><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>

export default function Profil() {
  const [user,    setUser]    = useState(null)
  const [tab,     setTab]     = useState('profil')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [profile, setProfile] = useState({ displayName:'', phone:'', role:'administrateur', region:'' })
  const [pwForm,  setPwForm]  = useState({ current:'', newPw:'', confirm:'' })
  const [pwError, setPwError] = useState('')
  const [notifs,  setNotifs]  = useState({
    nouveauMembre: true, nouvelleCommunication: true,
    rapportMensuel: true, alerteFinance: true, rappelCulte: false
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setProfile(p => ({ ...p,
          displayName: user.user_metadata?.full_name || '',
          phone:       user.user_metadata?.phone || '',
          role:        user.user_metadata?.role || 'administrateur',
          region:      user.user_metadata?.region || '',
        }))
      }
    })
  }, [])

  const saveProfil = async () => {
    setSaving(true)
    await supabase.auth.updateUser({ data: { full_name: profile.displayName, phone: profile.phone, role: profile.role, region: profile.region } })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  const savePassword = async () => {
    setPwError('')
    if (pwForm.newPw !== pwForm.confirm) return setPwError('Les mots de passe ne correspondent pas.')
    if (pwForm.newPw.length < 8) return setPwError('Minimum 8 caractères.')
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw })
    if (error) setPwError(error.message)
    else { setPwForm({ current:'', newPw:'', confirm:'' }); setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const fp = k => e => setProfile(p => ({...p,[k]:e.target.value}))
  const fq = k => e => setPwForm(p => ({...p,[k]:e.target.value}))
  const fn = k => setNotifs(p => ({...p,[k]:!p[k]}))

  const initials = profile.displayName
    ? profile.displayName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  const roleColorMap = { administrateur:'purple', directeur:'navy', pasteur_titulaire:'blue', pasteur_assistant:'teal', secretaire:'slate', tresorier:'gold' }

  return (
    <div>
      <PageHeader title="Profil & Paramètres" subtitle="Gérez votre compte et vos préférences"/>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar profil */}
        <div className="xl:w-64 space-y-3 shrink-0">
          {/* Avatar card */}
          <Card>
            <CardBody className="text-center py-6">
              <div className="w-20 h-20 rounded-2xl bg-[#0D2B5E] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {initials}
              </div>
              <p className="font-bold text-[#0D2B5E]">{profile.displayName || 'Mon compte'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <div className="mt-2">
                <Badge color={roleColorMap[profile.role] || 'slate'}>
                  {ROLES[profile.role]?.label || profile.role}
                </Badge>
              </div>
            </CardBody>
          </Card>

          {/* Menu nav */}
          <Card>
            <CardBody className="p-2">
              {[
                { key:'profil',         Icon:IUser,   label:'Infos personnelles' },
                { key:'securite',       Icon:IShield, label:'Sécurité ' },
                { key:'notifications',  Icon:IBell,   label:'Notifications' },
              ].map(({ key, Icon, label }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    tab === key ? 'bg-[#EBF3FC] text-[#0D2B5E] font-semibold' : 'text-slate-500 hover:bg-slate-50'
                  }`}>
                  <Icon c={tab===key?'#1A5EA8':'#9AA5B4'}/>
                  {label}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all">
                  <ILogout c="#ef4444"/>
                  Déconnexion
                </button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {saved && (
            <div className="flex items-center gap-2 bg-[#EAF3DE] text-[#3B6D11] px-4 py-2.5 rounded-xl mb-4 text-sm font-medium">
              <ICheck c="#3B6D11"/> Modifications enregistrées !
            </div>
          )}

          {/* Profil */}
          {tab === 'profil' && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Informations personnelles</h2>
                <p className="text-xs text-slate-400 mt-0.5">Ces informations sont visibles par les administrateurs</p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nom complet" value={profile.displayName} onChange={fp('displayName')} placeholder="Prénom Nom" className="md:col-span-2"/>
                  <Input label="Email" value={user?.email||''} disabled className="opacity-60 cursor-not-allowed"/>
                  <Input label="Téléphone" value={profile.phone} onChange={fp('phone')} placeholder="+224 6XX XXX XXX"/>
                  <Select label="Rôle" value={profile.role} onChange={fp('role')}>
                    {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </Select>
                  <Select label="Région de rattachement" value={profile.region} onChange={fp('region')}>
                    <option value="">— Nationale —</option>
                    <option value="Basse Guinée">Basse Guinée</option>
                    <option value="Moyenne Guinée">Moyenne Guinée</option>
                    <option value="Haute Guinée">Haute Guinée</option>
                    <option value="Guinée Forestière">Guinée Forestière</option>
                  </Select>
                  <div className="md:col-span-2 flex justify-end pt-2 border-t border-slate-50">
                    <Button variant="gold" onClick={saveProfil} disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Sécurité */}
          {tab === 'securite' && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Sécurité & Mot de passe</h2>
                <p className="text-xs text-slate-400 mt-0.5">Votre compte est géré par Supabase Auth</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4 max-w-sm">
                  <Input label="Nouveau mot de passe" type="password" value={pwForm.newPw} onChange={fq('newPw')} placeholder="Minimum 8 caractères"/>
                  <Input label="Confirmer le mot de passe" type="password" value={pwForm.confirm} onChange={fq('confirm')} placeholder="Répéter le mot de passe"/>
                  {pwError && (
                    <div className={`px-3 py-2 rounded-lg text-xs font-medium ${pwError.startsWith('Les')?' bg-[#FCEBEB] text-[#791F1F]':'bg-[#EAF3DE] text-[#3B6D11]'}`}>
                      {pwError}
                    </div>
                  )}
                  <Button variant="primary" onClick={savePassword} disabled={saving||!pwForm.newPw}>
                    {saving ? 'Mise à jour...' : 'Changer le mot de passe'}
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-[#0D2B5E] mb-3">Informations de session</h3>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4">
                    <div><p className="text-xs text-slate-400">Email</p><p className="text-sm font-medium text-[#0D2B5E]">{user?.email}</p></div>
                    <div><p className="text-xs text-slate-400">Dernière connexion</p><p className="text-sm font-medium text-[#0D2B5E]">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Compte créé le</p><p className="text-sm font-medium text-[#0D2B5E]">{user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Statut</p><Badge color="green">Actif</Badge></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Préférences de notifications</h2>
                <p className="text-xs text-slate-400 mt-0.5">Choisissez quand vous souhaitez être alerté</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-1">
                  {[
                    { key:'nouveauMembre',         label:'Nouveau fidèle inscrit',          desc:'Quand un nouveau membre rejoint une branche' },
                    { key:'nouvelleCommunication',  label:'Nouvelle annonce publiée',        desc:'Quand une annonce est créée par la direction' },
                    { key:'rapportMensuel',          label:'Rappel rapport mensuel',          desc:'Début de chaque mois' },
                    { key:'alerteFinance',           label:'Alerte solde branche',            desc:'Quand le solde d\'une branche devient négatif' },
                    { key:'rappelCulte',             label:'Rappel avant un culte spécial',   desc:'24h avant un culte spécial programmé' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#0D2B5E]">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                      </div>
                      <button onClick={() => fn(key)}
                        className={`w-11 h-6 rounded-full transition-all relative ${notifs[key] ? 'bg-[#1A5EA8]' : 'bg-slate-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${notifs[key] ? 'left-6' : 'left-1'}`}/>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-50 mt-2">
                  <Button variant="gold" onClick={() => { setSaved(true); setTimeout(()=>setSaved(false),2500) }}>
                    Enregistrer les préférences
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
