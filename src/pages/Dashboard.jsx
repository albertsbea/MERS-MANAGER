import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { statsApi, branchesApi } from '../lib/api'
import { formatGNF, formatDateShort } from '../lib/utils'
import { Spinner, Badge } from '../components/ui'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Separator } from '../components/ui/separator'
import { cn } from '../lib/cn'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import {
  Users, Building2, TrendingUp, Wallet,
  ArrowRight, Plus, BookOpen, ChevronRight,
  Calendar, Activity
} from 'lucide-react'

const REGIONS = {
  'Basse Guinée':      { color: 'hsl(var(--primary))',       light: '#EBF3FC' },
  'Moyenne Guinée':    { color: '#C8880A',                   light: '#FEF6E7' },
  'Haute Guinée':      { color: '#1D9E75',                   light: '#E1F5EE' },
  'Guinée Forestière': { color: '#534AB7',                   light: '#EEEDFE' },
}

const REGION_KEYWORDS = {
  'Basse Guinée':      ['conakry','kindia','coyah','dubreka','forecariah','basse'],
  'Moyenne Guinée':    ['labe','mamou','pita','dalaba','mali','koubia','tougue','moyenne'],
  'Haute Guinée':      ['kankan','siguiri','kouroussa','mandiana','kerouane','haute'],
  'Guinée Forestière': ['nzerekore','gueckedou','macenta','kissidougou','beyla','lola','yomou','forest'],
}

const typeBadge = { dimanche:'blue', semaine:'slate', special:'gold' }
const typeLabel = { dimanche:'Dimanche', semaine:'Semaine', special:'Spécial' }

// Tooltip recharts custom
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-xl text-xs">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ background: p.color }}/>
          <span className="text-muted-foreground">{p.name} :</span>
          <span className="font-semibold text-foreground">
            {p.value > 10000 ? formatGNF(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// KPI Card simple
function KpiCard({ label, value, sub, icon: Icon, color = '#1A5EA8', href }) {
  const content = (
    <div className="flex items-center gap-4 p-5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: color + '18' }}>
        <Icon size={20} style={{ color }} strokeWidth={1.8}/>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-foreground leading-tight truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {href && <ChevronRight size={16} className="shrink-0 text-muted-foreground/40"/>}
    </div>
  )
  return (
    <div className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
      {href ? <Link to={href} className="block">{content}</Link> : content}
    </div>
  )
}

export default function Dashboard() {
  const [stats,    setStats]    = useState(null)
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  useEffect(() => {
    Promise.all([statsApi.getDashboard(), branchesApi.getAll()])
      .then(([s, { data: b }]) => {
        setStats(s); setBranches(b || []); setLoading(false)
      })
  }, [])

  if (loading) return <Spinner/>

  // Régions
  const regionsData = Object.entries(REGIONS).map(([name, meta]) => {
    const kw = REGION_KEYWORDS[name] || []
    const count = branches.filter(b => {
      const r = (b.region || '').toLowerCase()
      const n = (b.nom || '').toLowerCase()
      return r === name.toLowerCase() || kw.some(k => r.includes(k) || n.includes(k))
    }).length
    return { name, count, ...meta }
  })

  // Données graphique finances (simulées + réelles si dispo)
  const chartData = [
    { mois: 'Jan', collectes: 920000,  depenses: 350000 },
    { mois: 'Fév', collectes: 1100000, depenses: 420000 },
    { mois: 'Mar', collectes: 980000,  depenses: 510000 },
    { mois: 'Avr', collectes: 1350000, depenses: 380000 },
    { mois: 'Mai', collectes: 1150000, depenses: 460000 },
    { mois: 'Juin',collectes: 1420000, depenses: 320000 },
  ]

  const solde = (stats?.totalCollectes || 0) - (stats?.totalDepenses || 0)

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tableau de bord</h1>
          <p className="mt-0.5 text-sm text-muted-foreground capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/rapports">
              <Activity size={14}/> Rapports
            </Link>
          </Button>
          <Button size="sm" className="bg-[#C8880A] text-white hover:bg-[#a87209]" asChild>
            <Link to="/fideles">
              <Plus size={14}/> Nouveau fidèle
            </Link>
          </Button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Fidèles actifs" value={stats?.totalFideles?.toLocaleString('fr-FR') || '0'}
          sub="Membres inscrits" icon={Users} color="#1A5EA8" href="/fideles"/>
        <KpiCard
          label="Branches" value={branches.length}
          sub={`${branches.filter(b => b.statut === 'active').length} actives`}
          icon={Building2} color="#C8880A" href="/branches"/>
        <KpiCard
          label="Total collectes" value={formatGNF(stats?.totalCollectes || 0)}
          sub="Toutes branches" icon={Wallet} color="#1D9E75" href="/finances"/>
        <KpiCard
          label="Solde net" value={formatGNF(solde)}
          sub={solde >= 0 ? 'Excédent' : 'Déficit'}
          icon={TrendingUp} color={solde >= 0 ? '#1D9E75' : '#E24B4A'} href="/rapports"/>
      </div>

      {/* ── Graphiques + Cultes récents ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Graphique finances */}
        <Card className="xl:col-span-2 py-0 overflow-hidden">
          <CardHeader className="px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Finances — 6 derniers mois</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Collectes vs Dépenses</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-primary inline-block"/>Collectes
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-[#C8880A] inline-block"/>Dépenses
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pt-4 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A5EA8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1A5EA8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8880A" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#C8880A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false}/>
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v => `${Math.round(v/1000)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={40}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="collectes" name="Collectes" stroke="#1A5EA8" strokeWidth={2} fill="url(#colGrad)" dot={false} activeDot={{ r: 4, fill: '#1A5EA8' }}/>
                <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#C8880A" strokeWidth={2} fill="url(#depGrad)" dot={false} activeDot={{ r: 4, fill: '#C8880A' }}/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Régions */}
        <Card className="py-0 overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Régions naturelles</CardTitle>
              <span className="text-xs text-muted-foreground">{branches.length} branches</span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pt-4 pb-4 space-y-3">
            {regionsData.map(r => (
              <div key={r.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{r.name}</span>
                  <span className="text-xs font-semibold" style={{ color: r.color }}>
                    {r.count} branche{r.count > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${branches.length ? (r.count / branches.length) * 100 : 0}%`, background: r.color }}/>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Cultes récents + Actions rapides ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Cultes récents */}
        <Card className="xl:col-span-2 py-0 overflow-hidden">
          <CardHeader className="px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Cultes récents</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" asChild>
                <Link to="/cultes">Voir tout <ArrowRight size={12}/></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!stats?.recentCultes?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen size={24} className="mb-2 text-muted-foreground/30"/>
                <p className="text-sm text-muted-foreground">Aucun culte enregistré</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/cultes"><Plus size={13}/> Créer un culte</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Branche</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Présents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentCultes.slice(0, 6).map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {formatDateShort(c.date_culte)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.branches?.nom || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeBadge[c.type_culte] || 'slate'} size="xs">
                          {typeLabel[c.type_culte] || c.type_culte}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {c.presences?.[0]?.total ?? (
                          <span className="text-xs text-amber-500 font-medium">À saisir</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card className="py-0 overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-4 border-b border-border">
            <CardTitle className="text-sm">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-4 pb-4 space-y-2">
            {[
              { to: '/fideles',      icon: Users,      label: 'Nouveau fidèle',   sub: 'Inscrire un membre' },
              { to: '/cultes',       icon: Calendar,   label: 'Nouveau culte',    sub: 'Enregistrer une célébration' },
              { to: '/finances',     icon: Wallet,     label: 'Collecte',         sub: 'Saisir une collecte' },
              { to: '/communication',icon: Activity,   label: 'Annonce',          sub: 'Publier une annonce' },
              { to: '/rapports',     icon: TrendingUp, label: 'Rapport global',   sub: 'Exporter les données' },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all hover:border-border hover:bg-accent group">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/8 group-hover:bg-primary/15 transition-colors">
                  <Icon size={15} className="text-primary" strokeWidth={1.8}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground leading-none">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{sub}</p>
                </div>
                <ChevronRight size={14} className="shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors"/>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
