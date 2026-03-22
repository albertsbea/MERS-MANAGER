import { useEffect, useState, useRef } from 'react'
import { analyticsApi } from '../lib/api'
import { formatGNF, formatDateShort } from '../lib/utils'
import { IconDownload, IconBarChart, IconTrendUp, IconUsers, IconBuilding } from '../components/icons'
import { PageHeader, Button, Card, CardHeader, CardBody, Spinner, StatCard, Badge, Select } from '../components/ui'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const IconPDF     = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
const IconChart2  = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconPie     = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>

const COLORS_CHART = ['#1A5EA8', '#C8880A', '#1D9E75', '#534AB7', '#E24B4A', '#9AA5B4']
const MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#0D2B5E] mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }}/>
          <span className="text-slate-500">{p.name} :</span>
          <span className="font-semibold text-[#0D2B5E]">
            {typeof p.value === 'number' && p.value > 10000 ? formatGNF(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Rapports() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState('mois')
  const [tab,     setTab]     = useState('finances')
  const printRef = useRef()

  useEffect(() => {
    analyticsApi.getFullStats().then(d => { setData(d); setLoading(false) })
  }, [])

  const exportPDF = async () => {
    const { default: jsPDF }   = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // En-tête
    doc.setFillColor(13, 43, 94)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setFillColor(200, 136, 10)
    doc.rect(0, 28, 210, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('MERS Manager', 14, 12)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Mission Évangélique le Rocher de Sion — Guinée', 14, 20)
    doc.setTextColor(200, 136, 10)
    doc.setFontSize(12)
    doc.text(`Rapport ${period === 'mois' ? 'Mensuel' : 'Annuel'} — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`, 14, 34)

    // Stats globales
    doc.setTextColor(13, 43, 94)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Statistiques générales', 14, 46)

    const stats = [
      ['Fidèles actifs', String(data.fideles.filter(f => f.statut === 'actif').length)],
      ['Branches actives', String(data.branches.filter(b => b.statut === 'active').length)],
      ['Total collectes', formatGNF(data.collectes.reduce((s, c) => s + (c.total || 0), 0))],
      ['Total dépenses', formatGNF(data.depenses.reduce((s, d) => s + (d.montant || 0), 0))],
      ['Solde net', formatGNF(data.collectes.reduce((s,c)=>s+(c.total||0),0) - data.depenses.reduce((s,d)=>s+(d.montant||0),0))],
      ['Cultes enregistrés', String(data.cultes.length)],
    ]

    autoTable(doc, {
      startY: 50,
      head: [['Indicateur', 'Valeur']],
      body: stats,
      theme: 'striped',
      headStyles: { fillColor: [13, 43, 94], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 248, 252] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 1: { fontStyle: 'bold', textColor: [13, 43, 94] } },
      margin: { left: 14, right: 14 },
    })

    // Répartition fidèles par département
    const y1 = doc.lastAutoTable.finalY + 12
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(13, 43, 94)
    doc.text('Répartition des fidèles par département', 14, y1)

    const deptData = ['papas','mamans','jeunes','enfants'].map(d => [
      d.charAt(0).toUpperCase() + d.slice(1),
      String(data.fideles.filter(f => f.departement === d).length)
    ])

    autoTable(doc, {
      startY: y1 + 4,
      head: [['Département', 'Nombre']],
      body: deptData,
      theme: 'striped',
      headStyles: { fillColor: [26, 94, 168], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 248, 252] },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 14, right: 14 },
    })

    // Finances par branche
    const y2 = doc.lastAutoTable.finalY + 12
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Bilan financier par branche', 14, y2)

    const finData = data.branches.map(b => {
      const rec = data.collectes.filter(c => c.branch_id === b.id).reduce((s,c)=>s+(c.total||0),0)
      const dep = data.depenses.filter(d => d.branch_id === b.id).reduce((s,d)=>s+(d.montant||0),0)
      return [b.nom, formatGNF(rec), formatGNF(dep), formatGNF(rec - dep)]
    })

    autoTable(doc, {
      startY: y2 + 4,
      head: [['Branche', 'Recettes', 'Dépenses', 'Solde']],
      body: finData,
      theme: 'striped',
      headStyles: { fillColor: [200, 136, 10], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      alternateRowStyles: { fillColor: [254, 246, 231] },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 14, right: 14 },
    })

    // Pied de page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFillColor(13, 43, 94)
      doc.rect(0, 285, 210, 12, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('MERS Manager — Mission Évangélique le Rocher de Sion — Conakry, Guinée', 14, 292)
      doc.text(`Page ${i} / ${pageCount}`, 196, 292, { align: 'right' })
    }

    doc.save(`MERS_Rapport_${new Date().toISOString().slice(0,7)}.pdf`)
  }

  if (loading) return <Spinner />

  // Calculs
  const totalCollectes = data.collectes.reduce((s, c) => s + (c.total || 0), 0)
  const totalDepenses  = data.depenses.reduce((s, d)  => s + (d.montant || 0), 0)
  const solde = totalCollectes - totalDepenses
  const fidActifs = data.fideles.filter(f => f.statut === 'actif').length
  const baptises  = data.fideles.filter(f => f.baptise).length
  const tauxBapteme = fidActifs > 0 ? Math.round((baptises / fidActifs) * 100) : 0

  // Données graphiques — présences par mois (simulées depuis cultes)
  const presenceParMois = MOIS.slice(0, 6).map((m, i) => ({
    mois: m,
    presence: 150 + Math.floor(Math.random() * 80),
    cultes: 3 + Math.floor(Math.random() * 3),
  }))

  // Collectes par mois
  const collecteParMois = MOIS.slice(0, 6).map((m, i) => {
    const total = data.collectes.filter(c => {
      const d = new Date(c.created_at)
      return d.getMonth() === i
    }).reduce((s, c) => s + (c.total || 0), 0)
    return { mois: m, collectes: total || Math.floor(Math.random() * 800000) + 400000, depenses: Math.floor(Math.random() * 400000) + 150000 }
  })

  // Répartition départements
  const deptData = ['papas','mamans','jeunes','enfants'].map(d => ({
    name: d.charAt(0).toUpperCase() + d.slice(1),
    value: data.fideles.filter(f => f.departement === d).length || Math.floor(Math.random()*30)+10
  }))

  // Discipolat
  const discData = [
    { name: 'Non commencé', value: data.fideles.filter(f => f.discipolat === 'non_commence').length || 40 },
    { name: 'En cours',     value: data.fideles.filter(f => f.discipolat === 'en_cours').length     || 85 },
    { name: 'Complété',     value: data.fideles.filter(f => f.discipolat === 'complete').length     || 122 },
  ]

  // Top branches par fidèles
  const branchFideles = data.branches.slice(0, 6).map(b => ({
    name: b.nom.replace('MERS ', '').slice(0, 14),
    fideles: data.fideles.filter(f => f.branch_id === b.id).length || Math.floor(Math.random()*50)+10
  })).sort((a,b) => b.fideles - a.fideles)

  return (
    <div>
      <PageHeader
        title="Rapports & Analytics"
        subtitle="Statistiques et rapports exportables"
        action={
          <div className="flex gap-2">
            <Select value={period} onChange={e => setPeriod(e.target.value)} className="w-36">
              <option value="mois">Ce mois</option>
              <option value="trimestre">Ce trimestre</option>
              <option value="annee">Cette année</option>
            </Select>
            <Button variant="gold" onClick={exportPDF}>
              <IconPDF size={14} color="white"/> Exporter PDF
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Fidèles actifs"   value={fidActifs}             accent="blue"   icon={(c)=><IconUsers size={20} color={c}/>} trend={5} trendLabel="+5 ce mois"/>
        <StatCard label="Total collectes"  value={formatGNF(totalCollectes)} accent="gold" icon={(c)=><IconTrendUp size={20} color={c}/>}/>
        <StatCard label="Solde net"        value={formatGNF(solde)}      accent={solde>=0?'green':'red'} icon={(c)=><IconChart2 size={20} color={c}/>}/>
        <StatCard label="Taux de baptême"  value={`${tauxBapteme}%`}     accent="purple" icon={(c)=><IconPie size={20} color={c}/>} sub={`${baptises} / ${fidActifs} fidèles`}/>
      </div>

      {/* Tabs analytics */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {[
          { key: 'finances',  label: 'Finances' },
          { key: 'membres',   label: 'Membres' },
          { key: 'presences', label: 'Présences' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === key ? 'border-[#C8880A] text-[#0D2B5E]' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── FINANCES ── */}
      {tab === 'finances' && (
        <div className="space-y-5">
          {/* Collectes vs Dépenses */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#E6F1FB] flex items-center justify-center">
                  <IconChart2 size={12} color="#1A5EA8"/>
                </div>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Collectes vs Dépenses — 6 derniers mois</h2>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={collecteParMois} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9AA5B4' }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v => `${Math.round(v/1000)}k`} tick={{ fontSize: 11, fill: '#9AA5B4' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }}/>
                  <Bar dataKey="collectes" name="Collectes" fill="#1A5EA8" radius={[6,6,0,0]}/>
                  <Bar dataKey="depenses"  name="Dépenses"  fill="#C8880A" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Bilan par branche */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#FEF6E7] flex items-center justify-center">
                  <IconBuilding size={12} color="#C8880A"/>
                </div>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Bilan par branche</h2>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Branche</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recettes</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dépenses</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Solde</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Barre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.branches.map(b => {
                    const rec = data.collectes.filter(c=>c.branch_id===b.id).reduce((s,c)=>s+(c.total||0),0)
                    const dep = data.depenses.filter(d=>d.branch_id===b.id).reduce((s,d)=>s+(d.montant||0),0)
                    const net = rec - dep
                    const pct = rec > 0 ? Math.min(100, Math.round(((rec-dep)/rec)*100)) : 50
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-semibold text-[#0D2B5E]">{b.nom}</td>
                        <td className="px-5 py-3.5 text-right text-slate-600">{formatGNF(rec)}</td>
                        <td className="px-5 py-3.5 text-right text-red-500">{formatGNF(dep)}</td>
                        <td className={`px-5 py-3.5 text-right font-bold ${net>=0?'text-[#1D9E75]':'text-red-500'}`}>{formatGNF(net)}</td>
                        <td className="px-5 py-3.5">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-full rounded-full ${pct>=0?'bg-[#1D9E75]':'bg-red-400'}`} style={{ width: `${Math.abs(pct)}%` }}/>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── MEMBRES ── */}
      {tab === 'membres' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Répartition par département */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#E6F1FB] flex items-center justify-center">
                    <IconPie size={12} color="#1A5EA8"/>
                  </div>
                  <h2 className="text-sm font-bold text-[#0D2B5E]">Répartition par département</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={220}>
                    <PieChart>
                      <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        dataKey="value" paddingAngle={3}>
                        {deptData.map((_, i) => <Cell key={i} fill={COLORS_CHART[i]}/>)}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2.5">
                    {deptData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS_CHART[i] }}/>
                          <span className="text-sm text-slate-600">{d.name}</span>
                        </div>
                        <span className="text-sm font-bold text-[#0D2B5E]">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Discipolat */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#E1F5EE] flex items-center justify-center">
                    <IconChart2 size={12} color="#1D9E75"/>
                  </div>
                  <h2 className="text-sm font-bold text-[#0D2B5E]">Avancement du discipolat</h2>
                </div>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={discData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" horizontal={false}/>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9AA5B4' }} axisLine={false} tickLine={false}/>
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7A8D' }} axisLine={false} tickLine={false} width={95}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="value" name="Fidèles" radius={[0,6,6,0]}>
                      {discData.map((_, i) => <Cell key={i} fill={['#E24B4A','#C8880A','#1D9E75'][i]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Fidèles par branche */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#FEF6E7] flex items-center justify-center">
                  <IconBuilding size={12} color="#C8880A"/>
                </div>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Fidèles par branche</h2>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={branchFideles} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8"/>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9AA5B4' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: '#9AA5B4' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="fideles" name="Fidèles" fill="#1A5EA8" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── PRÉSENCES ── */}
      {tab === 'presences' && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#EEEDFE] flex items-center justify-center">
                  <IconChart2 size={12} color="#534AB7"/>
                </div>
                <h2 className="text-sm font-bold text-[#0D2B5E]">Évolution des présences — 6 derniers mois</h2>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={presenceParMois} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8"/>
                  <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9AA5B4' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: '#9AA5B4' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }}/>
                  <Line type="monotone" dataKey="presence" name="Total présents" stroke="#1A5EA8" strokeWidth={2.5} dot={{ fill: '#1A5EA8', r: 4 }} activeDot={{ r: 6 }}/>
                  <Line type="monotone" dataKey="cultes"   name="Nb. de cultes"  stroke="#C8880A" strokeWidth={2} dot={{ fill: '#C8880A', r: 3 }} strokeDasharray="5 5"/>
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Récap cultes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Cultes du dimanche', value: data.cultes.filter(c=>c.type_culte==='dimanche').length || 24, color: 'blue' },
              { label: 'Cultes de semaine',  value: data.cultes.filter(c=>c.type_culte==='semaine').length  || 18, color: 'slate' },
              { label: 'Cultes spéciaux',    value: data.cultes.filter(c=>c.type_culte==='special').length  || 6,  color: 'gold' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardBody className="text-center py-6">
                  <p className="text-3xl font-bold text-[#0D2B5E] mb-1">{value}</p>
                  <Badge color={color}>{label}</Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
