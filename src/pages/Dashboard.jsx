import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { statsApi, branchesApi } from '../lib/api'
import { formatGNF, formatDateShort, TYPE_CULTE } from '../lib/utils'
import { StatCard, Card, CardHeader, CardBody, Spinner, Badge } from '../components/ui'
import {
  IconUsers, IconBuilding, IconTrendUp, IconWallet,
  IconArrowRight, IconPlus, IconUser, IconBook, IconBarChart, IconCalendar
} from '../components/icons'

const REGIONS = {
  'Basse Guinée':    { color: '#1A5EA8', bg: '#E6F1FB', branches: ['Conakry','Coyah','Dubréka','Forécariah','Coyah','Kindia'] },
  'Moyenne Guinée':  { color: '#C8880A', bg: '#FEF6E7', branches: ['Labé','Pita','Mamou','Dalaba','Mali','Koubia','Tougué','Lélouma'] },
  'Haute Guinée':    { color: '#1D9E75', bg: '#E1F5EE', branches: ['Kankan','Siguiri','Kouroussa','Mandiana','Kérouané'] },
  'Guinée Forestière': { color: '#534AB7', bg: '#EEEDFE', branches: ['Nzérékoré','Guéckédou','Macenta','Kissidougou','Beyla','Lola','Yomou'] },
}

const typeBadge = { dimanche: 'blue', semaine: 'slate', special: 'gold' }
const typeLabel = { dimanche: 'Dimanche', semaine: 'Semaine', special: 'Spécial' }

function MiniBarChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-32 text-xs text-slate-300">Aucune donnée</div>
  )
  const max = Math.max(...data.map(d => Math.max(d.col, d.dep)), 1)
  return (
    <div className="flex items-end gap-2 h-28 pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: '80px' }}>
            <div className="w-2/5 rounded-t-sm bg-[#1A5EA8]" style={{ height: `${(d.col / max) * 80}px`, minHeight: 2 }} />
            <div className="w-2/5 rounded-t-sm bg-[#C8880A]/60" style={{ height: `${(d.dep / max) * 80}px`, minHeight: 2 }} />
          </div>
          <span className="text-[9px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats,    setStats]    = useState(null)
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  useEffect(() => {
    Promise.all([
      statsApi.getDashboard(),
      branchesApi.getAll(),
    ]).then(([s, { data: b }]) => {
      setStats(s)
      setBranches(b || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const regionsData = Object.entries(REGIONS).map(([name, meta]) => {
    const count = branches.filter(b =>
      meta.branches.some(r => b.region?.toLowerCase().includes(r.toLowerCase()) || b.nom?.toLowerCase().includes(r.toLowerCase()))
    ).length
    return { name, count, ...meta }
  })
  const totalBranches = branches.length
  const maxBranches   = Math.max(...regionsData.map(r => r.count), 1)

  const chartData = [
    { label: 'S1', col: 820000, dep: 350000 },
    { label: 'S2', col: 1100000, dep: 420000 },
    { label: 'S3', col: 950000, dep: 480000 },
    { label: 'S4', col: 1380000, dep: 310000 },
    { label: 'S5', col: 600000, dep: 170000 },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-[#0D2B5E]">Tableau de bord</h1>
          <p className="text-sm text-slate-400 mt-0.5 capitalize">{today}</p>
        </div>
        <Link to="/cultes/new">
          <button className="inline-flex items-center gap-2 bg-[#0D2B5E] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1A5EA8] transition-colors active:scale-95">
            <IconPlus size={14} color="white"/> Nouveau culte
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Fidèles actifs"
          value={stats.totalFideles ?? 0}
          sub="membres inscrits"
          accent="blue"
          icon={(c) => <IconUsers size={20} color={c}/>}
          trend={12} trendLabel="+12 ce mois"
        />
        <StatCard
          label="Branches actives"
          value={stats.totalBranches ?? 0}
          sub="4 régions naturelles"
          accent="gold"
          icon={(c) => <IconBuilding size={20} color={c}/>}
        />
        <StatCard
          label="Total collectes"
          value={formatGNF(stats.totalCollectes)}
          sub="toutes branches"
          accent="green"
          icon={(c) => <IconTrendUp size={20} color={c}/>}
          trend={8} trendLabel="+8% vs mois passé"
        />
        <StatCard
          label="Solde net"
          value={formatGNF(stats.solde)}
          sub={`Dépenses : ${formatGNF(stats.totalDepenses)}`}
          accent={stats.solde >= 0 ? 'purple' : 'red'}
          icon={(c) => <IconWallet size={20} color={c}/>}
        />
      </div>

      {/* Ligne 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

        {/* Cultes récents */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#E6F1FB] flex items-center justify-center">
                  <IconBook size={12} color="#1A5EA8"/>
                </div>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Cultes récents</h2>
              </div>
              <Link to="/cultes" className="text-xs text-[#1A5EA8] hover:underline flex items-center gap-1 font-medium">
                Voir tout <IconArrowRight size={11} color="#1A5EA8"/>
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {stats.recentCultes.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-slate-300">Aucun culte enregistré</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Branche</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Présents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recentCultes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDateShort(c.date_culte)}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0D2B5E] text-sm">{c.branches?.nom || '—'}</td>
                      <td className="px-5 py-3.5">
                        <Badge color={typeBadge[c.type_culte] || 'slate'} size="xs">
                          {typeLabel[c.type_culte] || c.type_culte}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#0D2B5E]">
                        {c.presences?.[0]?.total ?? <span className="text-slate-300 font-normal text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#FEF6E7] flex items-center justify-center">
                <IconBarChart size={12} color="#C8880A"/>
              </div>
              <h2 className="text-sm font-bold text-[#0D2B5E]">Actions rapides</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {[
                { to: '/fideles/new',  Icon: IconUser,     bg: 'bg-[#E6F1FB]', ic: '#1A5EA8', label: 'Nouveau fidèle',   sub: 'Inscrire un membre' },
                { to: '/cultes/new',   Icon: IconBook,     bg: 'bg-[#E1F5EE]', ic: '#1D9E75', label: 'Nouveau culte',    sub: 'Enregistrer un culte' },
                { to: '/finances/new', Icon: IconTrendUp,  bg: 'bg-[#FEF6E7]', ic: '#C8880A', label: 'Saisir collecte',  sub: 'Enregistrer les recettes' },
                { to: '/branches/new', Icon: IconBuilding, bg: 'bg-[#EEEDFE]', ic: '#534AB7', label: 'Nouvelle branche', sub: 'Ajouter une implantation' },
              ].map(({ to, Icon, bg, ic, label, sub }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={15} color={ic}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D2B5E] leading-tight">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                  <IconArrowRight size={13} color="#CBD5E0"/>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Ligne 3 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Branches par région naturelle */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#FEF6E7] flex items-center justify-center">
                <IconBuilding size={12} color="#C8880A"/>
              </div>
              <h2 className="text-sm font-bold text-[#0D2B5E]">Branches par région naturelle</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {regionsData.map(({ name, count, color, bg }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-sm font-medium text-[#344861]">{name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#0D2B5E]">{count} branche{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalBranches > 0 ? (count / Math.max(totalBranches, 1)) * 100 : 0}%`, background: color }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total national</span>
                <span className="text-sm font-bold text-[#0D2B5E]">{totalBranches} branches</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Graphique finances */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#E1F5EE] flex items-center justify-center">
                  <IconTrendUp size={12} color="#1D9E75"/>
                </div>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Résumé financier — Mars 2026</h2>
              </div>
              <Link to="/finances" className="text-xs text-[#1A5EA8] hover:underline flex items-center gap-1 font-medium">
                Détails <IconArrowRight size={11} color="#1A5EA8"/>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1A5EA8]"/>
                <span className="text-xs text-slate-400">Collectes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#C8880A]/60"/>
                <span className="text-xs text-slate-400">Dépenses</span>
              </div>
            </div>
            <MiniBarChart data={chartData} />
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-50">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-0.5">Collectes</p>
                <p className="text-sm font-bold text-[#0D2B5E]">{formatGNF(stats.totalCollectes)}</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">Dépenses</p>
                <p className="text-sm font-bold text-red-500">{formatGNF(stats.totalDepenses)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-0.5">Solde</p>
                <p className={`text-sm font-bold ${stats.solde >= 0 ? 'text-[#1D9E75]' : 'text-red-500'}`}>
                  {formatGNF(stats.solde)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  )
}
