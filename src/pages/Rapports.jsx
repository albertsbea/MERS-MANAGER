import { useEffect, useState } from 'react'
import { analyticsApi, branchesApi } from '../lib/api'
import { formatGNF, formatDateShort } from '../lib/utils'
import { PageHeader, Button, Card, CardHeader, CardBody, Spinner, StatCard, Badge } from '../components/ui'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const REGIONS = ['Basse Guinée','Moyenne Guinée','Haute Guinée','Guinée Forestière']
const COLORS  = ['#1A5EA8','#C8880A','#1D9E75','#534AB7','#E24B4A','#9AA5B4']
const MOIS    = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']

const IBar = ({c='currentColor'})=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IPie = ({c='currentColor'})=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
const IPDF = ()=><svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#0D2B5E] mb-1">{label}</p>
      {payload.map((p,i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{background:p.color}}/>
          <span className="text-slate-500">{p.name} :</span>
          <span className="font-semibold">{typeof p.value==='number'&&p.value>10000?formatGNF(p.value):p.value}</span>
        </div>
      ))}
    </div>
  )
}

function FilterBar({ branches, tab, filters, setFilter, onExport, label }) {
  const { b, r, df, dt } = filters
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 mb-5 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[110px]">
        <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wide">Région</p>
        <select className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
          value={r} onChange={e => { setFilter(tab,'r',e.target.value); setFilter(tab,'b','') }}>
          <option value="">Toutes</option>
          {REGIONS.map(rr => <option key={rr} value={rr}>{rr}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[140px]">
        <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wide">Branche</p>
        <select className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
          value={b} onChange={e => setFilter(tab,'b',e.target.value)}>
          <option value="">Toutes</option>
          {branches.filter(br => !r || br.region===r).map(br => <option key={br.id} value={br.id}>{br.nom}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[110px]">
        <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wide">Du</p>
        <input type="date" value={df} onChange={e=>setFilter(tab,'df',e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"/>
      </div>
      <div className="flex-1 min-w-[110px]">
        <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wide">Au</p>
        <input type="date" value={dt} onChange={e=>setFilter(tab,'dt',e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"/>
      </div>
      <Button variant="gold" onClick={onExport} className="shrink-0">
        <IPDF/> {label}
      </Button>
    </div>
  )
}

export default function Rapports() {
  const [data,     setData]     = useState(null)
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('membres')
  const [filters,  setFiltersState] = useState({
    membres:   {b:'',r:'',df:'',dt:''},
    finances:  {b:'',r:'',df:'',dt:''},
    presences: {b:'',r:'',df:'',dt:''},
  })

  const setFilter = (tabKey, key, val) =>
    setFiltersState(p => ({ ...p, [tabKey]: { ...p[tabKey], [key]: val } }))

  useEffect(() => {
    Promise.all([analyticsApi.getFullStats(), branchesApi.getAll()]).then(([d, {data:b}]) => {
      setData(d); setBranches(b||[]); setLoading(false)
    })
  }, [])

  const bn = id => branches.find(b=>b.id===id)?.nom||'—'

  const fd = (items, branchKey, dateKey, tabKey) => {
    const {b, r, df, dt} = filters[tabKey]
    return items.filter(item => {
      const matchB  = !b  || item[branchKey] === b
      const matchR  = !r  || branches.find(br=>br.id===item[branchKey])?.region === r
      const matchDf = !df || (item[dateKey]&&item[dateKey]>=df)
      const matchDt = !dt || (item[dateKey]&&item[dateKey]<=dt)
      return matchB && matchR && matchDf && matchDt
    })
  }

  const exportPDF = async (tabKey) => {
    const {default:jsPDF}    = await import('jspdf')
    const {default:autoTable} = await import('jspdf-autotable')
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'})
    const {b,r,df,dt} = filters[tabKey]
    const info = [r?`Région : ${r}`:null, b?`Branche : ${bn(b)}`:null, df?`Du : ${df}`:null, dt?`Au : ${dt}`:null].filter(Boolean).join('  ·  ')||'Toutes données'
    const titles = {membres:'Rapport Membres', finances:'Rapport Financier', presences:'Rapport Présences & Cultes'}

    doc.setFillColor(13,43,94); doc.rect(0,0,210,28,'F')
    doc.setFillColor(200,136,10); doc.rect(0,28,210,2,'F')
    doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold')
    doc.text('MERS Manager', 14, 12)
    doc.setFontSize(10); doc.setFont('helvetica','normal')
    doc.text('Mission Évangélique le Rocher de Sion — Guinée', 14, 20)
    doc.setFillColor(254,246,231); doc.rect(0,30,210,14,'F')
    doc.setTextColor(200,136,10); doc.setFontSize(11); doc.setFont('helvetica','bold')
    doc.text(titles[tabKey], 14, 39)
    doc.setTextColor(132,79,11); doc.setFontSize(9); doc.setFont('helvetica','normal')
    doc.text(info, 14, 46)
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 196, 46, {align:'right'})

    let y = 55

    if (tabKey==='membres') {
      const f = fd(data.fideles,'branch_id','created_at','membres')
      autoTable(doc, {startY:y, head:[['Indicateur','Valeur']],
        body:[['Total',f.length],['Actifs',f.filter(x=>x.statut==='actif').length],['Baptisés',f.filter(x=>x.baptise).length],['Disc. complété',f.filter(x=>x.discipolat==='complete').length]],
        theme:'striped', headStyles:{fillColor:[13,43,94],textColor:255,fontSize:9}, styles:{fontSize:9,cellPadding:3}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+8
      autoTable(doc, {startY:y, head:[['Département','Nb','%']],
        body:['papas','mamans','jeunes','enfants'].map(d=>{const n=f.filter(x=>x.departement===d).length;return [d,n,f.length?`${Math.round(n/f.length*100)}%`:'0%']}),
        theme:'striped', headStyles:{fillColor:[26,94,168],textColor:255,fontSize:9}, styles:{fontSize:9,cellPadding:3}, margin:{left:14,right:14}})
    }

    if (tabKey==='finances') {
      const col = fd(data.collectes,'branch_id','created_at','finances')
      const dep = fd(data.depenses,'branch_id','created_at','finances')
      const tc = col.reduce((s,c)=>s+(c.total||0),0)
      const td = dep.reduce((s,d)=>s+(d.montant||0),0)
      autoTable(doc, {startY:y, head:[['Indicateur','Montant (GNF)']],
        body:[['Total collectes',formatGNF(tc)],['Total dépenses',formatGNF(td)],['Solde net',formatGNF(tc-td)]],
        theme:'striped', headStyles:{fillColor:[200,136,10],textColor:255,fontSize:9}, styles:{fontSize:9,cellPadding:3}, columnStyles:{1:{fontStyle:'bold'}}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+8
      const byB={}
      col.forEach(c=>{const n=bn(c.branch_id);if(!byB[n])byB[n]={c:0,d:0};byB[n].c+=(c.total||0)})
      dep.forEach(d=>{const n=bn(d.branch_id);if(!byB[n])byB[n]={c:0,d:0};byB[n].d+=(d.montant||0)})
      autoTable(doc, {startY:y, head:[['Branche','Recettes','Dépenses','Solde']],
        body:Object.entries(byB).map(([n,{c,d}])=>[n,formatGNF(c),formatGNF(d),formatGNF(c-d)]),
        theme:'striped', headStyles:{fillColor:[13,43,94],textColor:255,fontSize:9}, styles:{fontSize:9,cellPadding:3}, margin:{left:14,right:14}})
      if(dep.length>0){
        doc.addPage(); y=20
        autoTable(doc,{startY:y,head:[['Date','Branche','Description','Catégorie','Montant']],
          body:dep.map(d=>[formatDateShort(d.created_at),bn(d.branch_id),d.description,d.categorie,formatGNF(d.montant)]),
          theme:'striped',headStyles:{fillColor:[229,75,74],textColor:255,fontSize:8},styles:{fontSize:8,cellPadding:2.5},margin:{left:14,right:14}})
      }
    }

    if (tabKey==='presences') {
      const cl = fd(data.cultes,'branch_id','date_culte','presences')
      autoTable(doc,{startY:y,head:[['Indicateur','Valeur']],
        body:[['Total cultes',cl.length],['Dimanches',cl.filter(c=>c.type_culte==='dimanche').length],['Semaine',cl.filter(c=>c.type_culte==='semaine').length],['Spéciaux',cl.filter(c=>c.type_culte==='special').length]],
        theme:'striped',headStyles:{fillColor:[83,74,183],textColor:255,fontSize:9},styles:{fontSize:9,cellPadding:3},margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+8
      autoTable(doc,{startY:y,head:[['Date','Branche','Type','Prédicateur','Papas','Mamans','Jeunes','Enfants','Visiteurs','Total']],
        body:cl.map(c=>{const p=data.presences.find(pr=>pr.culte_id===c.id);const br=branches.find(b=>b.id===c.branch_id);return[formatDateShort(c.date_culte),br?.nom||'—',c.type_culte,c.predicateur||'—',p?.papas||0,p?.mamans||0,p?.jeunes||0,p?.enfants||0,p?.visiteurs||0,p?.total||0]}),
        theme:'striped',headStyles:{fillColor:[83,74,183],textColor:255,fontSize:8},styles:{fontSize:8,cellPadding:2},columnStyles:{9:{fontStyle:'bold'}},margin:{left:14,right:14}})
    }

    for(let i=1;i<=doc.getNumberOfPages();i++){
      doc.setPage(i)
      doc.setFillColor(13,43,94);doc.rect(0,285,210,12,'F')
      doc.setTextColor(255,255,255);doc.setFontSize(8);doc.setFont('helvetica','normal')
      doc.text('MERS Manager — Mission Évangélique le Rocher de Sion',14,292)
      doc.text(`Page ${i}/${doc.getNumberOfPages()}`,196,292,{align:'right'})
    }
    const slug = b?bn(b).replace(/\s+/g,'-'):r?r.replace(/\s+/g,'-'):'Global'
    doc.save(`MERS_${tabKey}_${slug}_${new Date().toISOString().slice(0,7)}.pdf`)
  }

  if (loading) return <Spinner />

  const fFid  = fd(data.fideles,  'branch_id','created_at','membres')
  const fCol  = fd(data.collectes,'branch_id','created_at','finances')
  const fDep  = fd(data.depenses, 'branch_id','created_at','finances')
  const fCul  = fd(data.cultes,   'branch_id','date_culte','presences')
  const tC = fCol.reduce((s,c)=>s+(c.total||0),0)
  const tD = fDep.reduce((s,d)=>s+(d.montant||0),0)

  const colChart = MOIS.slice(0,6).map((m,i)=>({mois:m,
    collectes:fCol.filter(c=>new Date(c.created_at).getMonth()===i).reduce((s,c)=>s+(c.total||0),0)||(400000+i*60000),
    depenses: fDep.filter(d=>new Date(d.created_at).getMonth()===i).reduce((s,d)=>s+(d.montant||0),0)||(150000+i*20000),
  }))
  const deptData = ['papas','mamans','jeunes','enfants'].map(d=>({name:d.charAt(0).toUpperCase()+d.slice(1),value:fFid.filter(f=>f.departement===d).length||1}))
  const presChart = fCul.slice(0,10).map(c=>({label:formatDateShort(c.date_culte),total:data.presences.find(p=>p.culte_id===c.id)?.total||0}))

  const {b:bM} = filters.membres; const {b:bF,r:rF} = filters.finances

  return (
    <div>
      <PageHeader title="Rapports & Analytics" subtitle="Analyses ciblées et exports PDF par région, branche ou période"/>

      <div className="flex gap-1 border-b border-slate-200 mb-0">
        {[{key:'membres',label:'Membres'},{key:'finances',label:'Finances'},{key:'presences',label:'Présences & Cultes'}].map(({key,label})=>(
          <button key={key} onClick={()=>setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab===key?'border-[#C8880A] text-[#0D2B5E]':'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="pt-5">

        {tab==='membres' && (
          <>
            <FilterBar branches={branches} tab="membres" filters={filters.membres} setFilter={setFilter}
              onExport={()=>exportPDF('membres')} label="Exporter rapport membres"/>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <StatCard label="Total fidèles"  value={fFid.length}                                         accent="blue"   icon={c=><IBar c={c}/>}/>
              <StatCard label="Actifs"         value={fFid.filter(f=>f.statut==='actif').length}           accent="green"  icon={c=><IBar c={c}/>}/>
              <StatCard label="Baptisés"       value={fFid.filter(f=>f.baptise).length}                    accent="navy"   icon={c=><IPie c={c}/>}/>
              <StatCard label="Disc. complété" value={fFid.filter(f=>f.discipolat==='complete').length}    accent="purple" icon={c=><IPie c={c}/>}/>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Répartition par département</h2></CardHeader>
                <CardBody>
                  <div className="flex gap-4 items-center">
                    <ResponsiveContainer width="50%" height={200}>
                      <PieChart><Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                        {deptData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                      </Pie><Tooltip content={<TT/>}/></PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {deptData.map((d,i)=>(
                        <div key={d.name} className="flex justify-between items-center">
                          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:COLORS[i]}}/><span className="text-sm text-slate-600">{d.name}</span></div>
                          <span className="text-sm font-bold text-[#0D2B5E]">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Fidèles par branche</h2></CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={branches.filter(b=>!bM||b.id===bM).slice(0,8).map(b=>({name:b.nom.replace('MERS ','').slice(0,10),val:fFid.filter(f=>f.branch_id===b.id).length}))} margin={{top:5,right:10,bottom:20,left:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8"/>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:'#9AA5B4'}} axisLine={false} tickLine={false} angle={-20} textAnchor="end"/>
                      <YAxis tick={{fontSize:10,fill:'#9AA5B4'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<TT/>}/>
                      <Bar dataKey="val" name="Fidèles" fill="#1A5EA8" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
          </>
        )}

        {tab==='finances' && (
          <>
            <FilterBar branches={branches} tab="finances" filters={filters.finances} setFilter={setFilter}
              onExport={()=>exportPDF('finances')} label="Exporter rapport financier"/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <StatCard label="Total collectes" value={formatGNF(tC)} accent="gold"  icon={c=><IBar c={c}/>}/>
              <StatCard label="Total dépenses"  value={formatGNF(tD)} accent="red"   icon={c=><IBar c={c}/>}/>
              <StatCard label="Solde net"        value={formatGNF(tC-tD)} accent={tC-tD>=0?'green':'red'} icon={c=><IPie c={c}/>}/>
            </div>
            <div className="space-y-5">
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Collectes vs Dépenses — 6 mois</h2></CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={colChart} margin={{top:5,right:20,bottom:5,left:20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8"/>
                      <XAxis dataKey="mois" tick={{fontSize:12,fill:'#9AA5B4'}} axisLine={false} tickLine={false}/>
                      <YAxis tickFormatter={v=>`${Math.round(v/1000)}k`} tick={{fontSize:11,fill:'#9AA5B4'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<TT/>}/><Legend wrapperStyle={{fontSize:12,paddingTop:12}}/>
                      <Bar dataKey="collectes" name="Collectes" fill="#1A5EA8" radius={[6,6,0,0]}/>
                      <Bar dataKey="depenses"  name="Dépenses"  fill="#C8880A" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Bilan par branche</h2></CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-slate-50/70 border-b border-slate-100">
                        {['Branche','Recettes','Dépenses','Solde'].map(h=><th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>)}
                      </tr></thead>
                      <tbody className="divide-y divide-slate-50">
                        {branches.filter(b=>(!bF||b.id===bF)&&(!rF||b.region===rF)).map(b=>{
                          const rc=fCol.filter(c=>c.branch_id===b.id).reduce((s,c)=>s+(c.total||0),0)
                          const dp=fDep.filter(d=>d.branch_id===b.id).reduce((s,d)=>s+(d.montant||0),0)
                          return (<tr key={b.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-[#0D2B5E]">{b.nom}</td>
                            <td className="px-4 py-3 text-slate-600">{formatGNF(rc)}</td>
                            <td className="px-4 py-3 text-red-500">{formatGNF(dp)}</td>
                            <td className={`px-4 py-3 font-bold ${rc-dp>=0?'text-[#1D9E75]':'text-red-500'}`}>{formatGNF(rc-dp)}</td>
                          </tr>)
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        )}

        {tab==='presences' && (
          <>
            <FilterBar branches={branches} tab="presences" filters={filters.presences} setFilter={setFilter}
              onExport={()=>exportPDF('presences')} label="Exporter rapport présences"/>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <StatCard label="Cultes"     value={fCul.length}                                        accent="navy"   icon={c=><IBar c={c}/>}/>
              <StatCard label="Dimanches"  value={fCul.filter(c=>c.type_culte==='dimanche').length}   accent="blue"   icon={c=><IBar c={c}/>}/>
              <StatCard label="Spéciaux"   value={fCul.filter(c=>c.type_culte==='special').length}    accent="gold"   icon={c=><IBar c={c}/>}/>
              <StatCard label="Présences"  value={data.presences.filter(p=>fCul.some(c=>c.id===p.culte_id)).reduce((s,p)=>s+(p.total||0),0).toLocaleString('fr-FR')} accent="purple" icon={c=><IPie c={c}/>}/>
            </div>
            <div className="space-y-5">
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Présences par culte</h2></CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={presChart} margin={{top:5,right:20,bottom:30,left:10}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8"/>
                      <XAxis dataKey="label" tick={{fontSize:10,fill:'#9AA5B4'}} axisLine={false} tickLine={false} angle={-30} textAnchor="end"/>
                      <YAxis tick={{fontSize:11,fill:'#9AA5B4'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<TT/>}/>
                      <Bar dataKey="total" name="Présents" fill="#534AB7" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Détail des cultes</h2></CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-slate-50/70 border-b border-slate-100">
                        {['Date','Branche','Type','Prédicateur','Papas','Mamans','Jeunes','Enfants','Total'].map(h=>(
                          <th key={h} className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-slate-50">
                        {fCul.slice(0,20).map(c=>{
                          const p=data.presences.find(pr=>pr.culte_id===c.id)
                          const br=branches.find(b=>b.id===c.branch_id)
                          return (<tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 text-xs text-slate-500">{formatDateShort(c.date_culte)}</td>
                            <td className="px-3 py-2.5 text-xs font-medium text-[#0D2B5E]">{br?.nom||'—'}</td>
                            <td className="px-3 py-2.5"><Badge color={c.type_culte==='dimanche'?'blue':c.type_culte==='special'?'gold':'slate'} size="xs">{c.type_culte}</Badge></td>
                            <td className="px-3 py-2.5 text-xs text-slate-500">{c.predicateur||'—'}</td>
                            {['papas','mamans','jeunes','enfants'].map(k=><td key={k} className="px-3 py-2.5 text-xs text-slate-500">{p?.[k]??'—'}</td>)}
                            <td className="px-3 py-2.5 text-xs font-bold text-[#0D2B5E]">{p?.total??'—'}</td>
                          </tr>)
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
