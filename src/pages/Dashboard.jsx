import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { statsApi } from '../lib/api'
import { formatGNF, formatDateShort, TYPE_CULTE } from '../lib/utils'
import { StatCard, Card, CardHeader, CardBody, Spinner, Badge } from '../components/ui'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.getDashboard().then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const typeBadge = {
    dimanche: 'indigo',
    semaine:  'slate',
    special:  'amber',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D2B5E]">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vue nationale — Mission Évangélique le Rocher de Sion</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Fidèles actifs"
          value={stats.totalFideles || 0}
          sub="membres inscrits"
          icon="👥"
          accent="navy"
        />
        <StatCard
          label="Branches actives"
          value={stats.totalBranches || 0}
          sub="à travers la Guinée"
          icon="🏛️"
          accent="blue"
        />
        <StatCard
          label="Total collectes"
          value={formatGNF(stats.totalCollectes)}
          sub="toutes branches"
          icon="💰"
          accent="gold"
        />
        <StatCard
          label="Solde net"
          value={formatGNF(stats.solde)}
          sub={`Dépenses : ${formatGNF(stats.totalDepenses)}`}
          icon="📊"
          accent={stats.solde >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Section bas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Cultes récents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#0D2B5E]">Cultes récents</h2>
              <Link to="/cultes" className="text-xs text-[#1A5EA8] hover:underline">Voir tout →</Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {stats.recentCultes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucun culte enregistré</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                    <th className="text-left px-5 py-2.5 font-semibold">Date</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Branche</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Type</th>
                    <th className="text-right px-5 py-2.5 font-semibold">Présents</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCultes.map((c, i) => (
                    <tr key={c.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                      <td className="px-5 py-3 text-slate-700">{formatDateShort(c.date_culte)}</td>
                      <td className="px-5 py-3 text-slate-700">{c.branches?.nom || '—'}</td>
                      <td className="px-5 py-3">
                        <Badge color={typeBadge[c.type_culte] || 'slate'}>
                          {TYPE_CULTE[c.type_culte]?.label || c.type_culte}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[#0D2B5E]">
                        {c.presences?.[0]?.total ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        {/* Accès rapides */}
        <Card>
          <CardHeader>
            <h2 className="font-bold text-[#0D2B5E]">Accès rapides</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {[
                { to: '/branches/new',  emoji: '🏛️', label: 'Nouvelle branche' },
                { to: '/fideles/new',   emoji: '👤', label: 'Nouveau fidèle' },
                { to: '/cultes/new',    emoji: '📖', label: 'Enregistrer un culte' },
                { to: '/finances/new',  emoji: '💰', label: 'Saisir une collecte' },
              ].map(({ to, emoji, label }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:border-[#1A5EA8] hover:bg-blue-50 transition-all group">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm text-slate-700 group-hover:text-[#0D2B5E] font-medium">{label}</span>
                  <span className="ml-auto text-slate-300 group-hover:text-[#1A5EA8]">→</span>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
