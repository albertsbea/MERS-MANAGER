import { useEffect, useState } from 'react'
import { analyticsApi, branchesApi, pasteursApi } from '../lib/api'
import { formatGNF, formatDateShort } from '../lib/utils'
import { PageHeader, Button, Card, CardHeader, CardBody, Spinner, StatCard, Badge } from '../components/ui'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const REGIONS = ['Basse Guinée','Moyenne Guinée','Haute Guinée','Guinée Forestière']
const COLORS  = ['#1A5EA8','#C8880A','#1D9E75','#534AB7','#E24B4A','#9AA5B4']
const MOIS    = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']

const IBar  = ({c='currentColor'})=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IPie  = ({c='currentColor'})=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
const IUser = ({c='currentColor'})=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IPDFIcon = ()=><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>

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

// Barre de filtres — uniquement pour onglets ciblés
function FilterBar({ branches, tab, filters, setFilter, onExport }) {
  const { b, r, df, dt } = filters
  const hasFilter = b || r || df || dt
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 mb-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[110px]">
          <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wide">Région</p>
          <select className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
            value={r} onChange={e => { setFilter(tab,'r',e.target.value); setFilter(tab,'b','') }}>
            <option value="">Toutes les régions</option>
            {REGIONS.map(rr => <option key={rr} value={rr}>{rr}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wide">Branche</p>
          <select className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20"
            value={b} onChange={e => setFilter(tab,'b',e.target.value)}>
            <option value="">Toutes les branches</option>
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
        <Button variant="gold" onClick={onExport} className="shrink-0 whitespace-nowrap">
          <IPDFIcon/> Exporter PDF{hasFilter ? ' (sélection)' : ''}
        </Button>
      </div>
      {hasFilter && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Filtres actifs :</span>
          {r  && <span className="px-2 py-0.5 bg-[#EBF3FC] text-[#1A5EA8] text-xs rounded-full font-medium">{r}</span>}
          {b  && <span className="px-2 py-0.5 bg-[#EBF3FC] text-[#1A5EA8] text-xs rounded-full font-medium">{branches.find(br=>br.id===b)?.nom}</span>}
          {df && <span className="px-2 py-0.5 bg-[#EBF3FC] text-[#1A5EA8] text-xs rounded-full font-medium">Du {df}</span>}
          {dt && <span className="px-2 py-0.5 bg-[#EBF3FC] text-[#1A5EA8] text-xs rounded-full font-medium">Au {dt}</span>}
          <button onClick={()=>{ setFilter(tab,'b',''); setFilter(tab,'r',''); setFilter(tab,'df',''); setFilter(tab,'dt','') }}
            className="text-xs text-red-400 hover:text-red-600 ml-1 underline">Effacer tout</button>
        </div>
      )}
    </div>
  )
}

export default function Rapports() {
  const [data,     setData]     = useState(null)
  const [pasteurs, setPasteurs] = useState([])
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('global')
  const [filters,  setFiltersState] = useState({
    membres:   {b:'',r:'',df:'',dt:''},
    finances:  {b:'',r:'',df:'',dt:''},
    presences: {b:'',r:'',df:'',dt:''},
    pasteurs:  {b:'',r:'',df:'',dt:''},
  })

  const setFilter = (tabKey, key, val) =>
    setFiltersState(p => ({ ...p, [tabKey]: { ...p[tabKey], [key]: val } }))

  useEffect(() => {
    Promise.all([analyticsApi.getFullStats(), branchesApi.getAll(), pasteursApi.getAll()])
      .then(([d, {data:b}, {data:p}]) => {
        setData(d); setBranches(b||[]); setPasteurs(p||[]); setLoading(false)
      })
  }, [])

  const bn = id => branches.find(b=>b.id===id)?.nom||'—'

  const fd = (items, branchKey, dateKey, tabKey) => {
    const {b,r,df,dt} = filters[tabKey]
    return items.filter(item => {
      const matchB  = !b  || item[branchKey] === b
      const matchR  = !r  || branches.find(br=>br.id===item[branchKey])?.region === r
      const matchDf = !df || (item[dateKey]&&item[dateKey]>=df)
      const matchDt = !dt || (item[dateKey]&&item[dateKey]<=dt)
      return matchB && matchR && matchDf && matchDt
    })
  }
  const fp = (all, tabKey) => {
    const {b,r} = filters[tabKey]
    return all.filter(p => (!b||p.branch_id===b) && (!r||p.branches?.region===r))
  }

  // ── PDF engine ──────────────────────────────────────────────
  const buildPDF = async (tabKey, isGlobal=false) => {
    const {default:jsPDF}    = await import('jspdf')
    const {default:autoTable} = await import('jspdf-autotable')
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'})

    const {b,r,df,dt} = filters[tabKey]||{}
    const scope = isGlobal
      ? 'Rapport complet — toutes données'
      : [r?`Région : ${r}`:null, b?`Branche : ${bn(b)}`:null, df?`Du : ${df}`:null, dt?`Au : ${dt}`:null].filter(Boolean).join('  ·  ')||'Toutes données'

    const TITLES = { global:'Rapport Global', membres:'Rapport Membres', finances:'Rapport Financier', presences:'Rapport Présences & Cultes', pasteurs:'Rapport Pasteurs' }

    // ── En-tête premium ──────────────────────────────────────
    // Fond navy
    doc.setFillColor(13,43,94); doc.rect(0,0,210,35,'F')
    // Bande dorée
    doc.setFillColor(200,136,10); doc.rect(0,35,210,2,'F')
    // Cercle logo
    doc.setFillColor(200,136,10); doc.circle(20,17,8,'F')
    doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont('helvetica','bold')
    doc.text('M',17.5,20.5)
    // Textes en-tête
    doc.setFontSize(18); doc.setFont('helvetica','bold')
    doc.text('MERS Manager', 32, 14)
    doc.setFontSize(9); doc.setFont('helvetica','normal')
    doc.text('Mission Évangélique le Rocher de Sion — République de Guinée', 32, 22)
    doc.setFontSize(8); doc.setTextColor(200,136,10)
    doc.text('www.mers.gn  ·  Conakry, Guinée', 32, 28)

    // Bandeau titre rapport
    doc.setFillColor(248,249,251); doc.rect(0,37,210,18,'F')
    doc.setDrawColor(234,236,240); doc.line(0,55,210,55)
    doc.setTextColor(13,43,94); doc.setFontSize(14); doc.setFont('helvetica','bold')
    doc.text(TITLES[tabKey]||'Rapport', 14, 48)
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139)
    doc.text(scope, 14, 53)
    doc.setTextColor(100,116,139)
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}`, 196, 53, {align:'right'})

    let y = 62

    // Helper section title
    const sectionTitle = (title, color=[13,43,94]) => {
      doc.setFillColor(...color, 15)
      doc.rect(14, y, 182, 7, 'F')
      doc.setFillColor(...color); doc.rect(14, y, 2, 7, 'F')
      doc.setTextColor(...color); doc.setFontSize(9); doc.setFont('helvetica','bold')
      doc.text(title, 20, y+5)
      y += 10
    }

    // ── GLOBAL ──────────────────────────────────────────────
    if (tabKey==='global') {
      sectionTitle('Vue d\'ensemble', [13,43,94])
      autoTable(doc, {startY:y,
        head:[['Indicateur','Valeur','Détail']],
        body:[
          ['Branches actives', branches.filter(b=>b.statut==='active').length, `${branches.length} branches au total`],
          ['Pasteurs', pasteurs.length, `${pasteurs.filter(p=>p.role_eglise==='Pasteur Titulaire').length} titulaires · ${pasteurs.filter(p=>p.role_eglise==='Pasteur Assistant').length} assistants`],
          ['Fidèles inscrits', data.fideles.length, `${data.fideles.filter(f=>f.statut==='actif').length} actifs · ${data.fideles.filter(f=>f.baptise).length} baptisés`],
          ['Cultes enregistrés', data.cultes.length, `${data.cultes.filter(c=>c.type_culte==='dimanche').length} dimanches · ${data.cultes.filter(c=>c.type_culte==='special').length} spéciaux`],
          ['Total présents (cumulé)', data.presences.reduce((s,p)=>s+(p.total||0),0).toLocaleString('fr-FR'), 'Sur tous les cultes'],
          ['Total collectes', formatGNF(data.collectes.reduce((s,c)=>s+(c.total||0),0)), 'Dîmes + Offrandes + Dons'],
          ['Total dépenses', formatGNF(data.depenses.reduce((s,d)=>s+(d.montant||0),0)), 'Toutes catégories'],
          ['Solde net global', formatGNF(data.collectes.reduce((s,c)=>s+(c.total||0),0)-data.depenses.reduce((s,d)=>s+(d.montant||0),0)), 'Collectes − Dépenses'],
        ],
        theme:'grid',
        headStyles:{fillColor:[13,43,94],textColor:255,fontSize:9,fontStyle:'bold'},
        columnStyles:{0:{fontStyle:'bold',textColor:[13,43,94]},1:{fontStyle:'bold',halign:'center',textColor:[26,94,168]},2:{textColor:[100,116,139],fontSize:8}},
        alternateRowStyles:{fillColor:[248,249,251]},
        styles:{fontSize:9,cellPadding:4}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+10

      // Membres par région
      sectionTitle('Fidèles par région', [26,94,168])
      autoTable(doc, {startY:y,
        head:[['Région','Branches','Fidèles actifs','Baptisés','Disc. complété']],
        body:REGIONS.map(reg=>{
          const brs = branches.filter(b=>b.region===reg)
          const fids = data.fideles.filter(f=>brs.some(b=>b.id===f.branch_id))
          return [reg, brs.length, fids.filter(f=>f.statut==='actif').length, fids.filter(f=>f.baptise).length, fids.filter(f=>f.discipolat==='complete').length]
        }),
        theme:'striped',
        headStyles:{fillColor:[26,94,168],textColor:255,fontSize:8,fontStyle:'bold'},
        alternateRowStyles:{fillColor:[235,243,252]},
        styles:{fontSize:9,cellPadding:3}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+10

      // Bilan financier par branche
      doc.addPage(); y=20
      sectionTitle('Bilan financier par branche', [200,136,10])
      autoTable(doc, {startY:y,
        head:[['Branche','Région','Recettes (GNF)','Dépenses (GNF)','Solde (GNF)']],
        body:branches.map(br=>{
          const rc=data.collectes.filter(c=>c.branch_id===br.id).reduce((s,c)=>s+(c.total||0),0)
          const dp=data.depenses.filter(d=>d.branch_id===br.id).reduce((s,d)=>s+(d.montant||0),0)
          return [br.nom, br.region||'—', formatGNF(rc), formatGNF(dp), formatGNF(rc-dp)]
        }),
        theme:'striped',
        headStyles:{fillColor:[200,136,10],textColor:255,fontSize:8,fontStyle:'bold'},
        columnStyles:{4:{fontStyle:'bold'}},
        alternateRowStyles:{fillColor:[254,246,231]},
        styles:{fontSize:8,cellPadding:3}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+10

      // Liste pasteurs
      sectionTitle('Corps pastoral', [83,74,183])
      autoTable(doc, {startY:y,
        head:[['Pasteur','Ministère','Rôle','Branche']],
        body:pasteurs.map(p=>[`${p.prenom} ${p.nom}`,p.ministere,p.role_eglise,p.branches?.nom||'—']),
        theme:'striped',
        headStyles:{fillColor:[83,74,183],textColor:255,fontSize:8,fontStyle:'bold'},
        alternateRowStyles:{fillColor:[238,237,254]},
        styles:{fontSize:8,cellPadding:3}, margin:{left:14,right:14}})
    }

    // ── MEMBRES ──────────────────────────────────────────────
    if (tabKey==='membres') {
      const f = fd(data.fideles,'branch_id','created_at','membres')
      sectionTitle('Synthèse', [13,43,94])
      autoTable(doc, {startY:y,
        head:[['Indicateur','Valeur','%']],
        body:[
          ['Total fidèles',         f.length, '100%'],
          ['Actifs',                f.filter(x=>x.statut==='actif').length, f.length?`${Math.round(f.filter(x=>x.statut==='actif').length/f.length*100)}%`:'—'],
          ['Baptisés',              f.filter(x=>x.baptise).length, f.length?`${Math.round(f.filter(x=>x.baptise).length/f.length*100)}%`:'—'],
          ['Discipolat complété',   f.filter(x=>x.discipolat==='complete').length, f.length?`${Math.round(f.filter(x=>x.discipolat==='complete').length/f.length*100)}%`:'—'],
          ['Discipolat en cours',   f.filter(x=>x.discipolat==='en_cours').length, '—'],
          ['Non commencé',          f.filter(x=>x.discipolat==='non_commence').length, '—'],
        ],
        theme:'grid',
        headStyles:{fillColor:[13,43,94],textColor:255,fontSize:9,fontStyle:'bold'},
        columnStyles:{0:{fontStyle:'bold'},1:{halign:'center',fontStyle:'bold',textColor:[26,94,168]},2:{halign:'center',textColor:[100,116,139]}},
        alternateRowStyles:{fillColor:[248,249,251]},
        styles:{fontSize:9,cellPadding:4}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+10
      sectionTitle('Répartition par département', [26,94,168])
      autoTable(doc, {startY:y,
        head:[['Département','Nombre de fidèles','Pourcentage']],
        body:['Papas','Mamans','Jeunes','Enfants'].map(d=>{
          const n=f.filter(x=>x.departement===d.toLowerCase()).length
          return [d, n, f.length?`${Math.round(n/f.length*100)}%`:'0%']
        }),
        theme:'striped',
        headStyles:{fillColor:[26,94,168],textColor:255,fontSize:9,fontStyle:'bold'},
        alternateRowStyles:{fillColor:[235,243,252]},
        styles:{fontSize:9,cellPadding:4}, margin:{left:14,right:14}})
      if (isGlobal) {
        y = doc.lastAutoTable.finalY+10
        sectionTitle('Fidèles par branche', [83,74,183])
        autoTable(doc, {startY:y,
          head:[['Branche','Région','Total','Actifs','Baptisés']],
          body:branches.map(br=>{
            const ff=f.filter(x=>x.branch_id===br.id)
            return [br.nom, br.region||'—', ff.length, ff.filter(x=>x.statut==='actif').length, ff.filter(x=>x.baptise).length]
          }),
          theme:'striped',
          headStyles:{fillColor:[83,74,183],textColor:255,fontSize:8,fontStyle:'bold'},
          alternateRowStyles:{fillColor:[238,237,254]},
          styles:{fontSize:8,cellPadding:3}, margin:{left:14,right:14}})
      }
    }

    // ── FINANCES ─────────────────────────────────────────────
    if (tabKey==='finances') {
      const col = fd(data.collectes,'branch_id','created_at','finances')
      const dep = fd(data.depenses,'branch_id','created_at','finances')
      const tc=col.reduce((s,c)=>s+(c.total||0),0)
      const td=dep.reduce((s,d)=>s+(d.montant||0),0)
      sectionTitle('Bilan général', [200,136,10])
      autoTable(doc, {startY:y,
        head:[['Indicateur','Montant (GNF)']],
        body:[['Total des collectes',formatGNF(tc)],['Total des dépenses',formatGNF(td)],['Solde net',formatGNF(tc-td)]],
        theme:'grid',
        headStyles:{fillColor:[200,136,10],textColor:255,fontSize:9,fontStyle:'bold'},
        columnStyles:{0:{fontStyle:'bold'},1:{halign:'right',fontStyle:'bold',textColor:[13,43,94]}},
        alternateRowStyles:{fillColor:[254,246,231]},
        styles:{fontSize:10,cellPadding:5}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+10
      const byB={}
      col.forEach(c=>{const n=bn(c.branch_id);if(!byB[n])byB[n]={c:0,d:0};byB[n].c+=(c.total||0)})
      dep.forEach(d=>{const n=bn(d.branch_id);if(!byB[n])byB[n]={c:0,d:0};byB[n].d+=(d.montant||0)})
      sectionTitle('Bilan par branche', [13,43,94])
      autoTable(doc, {startY:y,
        head:[['Branche','Recettes (GNF)','Dépenses (GNF)','Solde (GNF)']],
        body:Object.entries(byB).map(([n,{c,d}])=>[n,formatGNF(c),formatGNF(d),formatGNF(c-d)]),
        theme:'striped',
        headStyles:{fillColor:[13,43,94],textColor:255,fontSize:9,fontStyle:'bold'},
        columnStyles:{1:{halign:'right'},2:{halign:'right'},3:{halign:'right',fontStyle:'bold'}},
        alternateRowStyles:{fillColor:[248,249,251]},
        styles:{fontSize:9,cellPadding:3}, margin:{left:14,right:14}})
      if (dep.length>0) {
        doc.addPage(); y=20
        sectionTitle('Détail des dépenses', [229,75,74])
        autoTable(doc, {startY:y,
          head:[['Date','Branche','Description','Catégorie','Montant (GNF)']],
          body:dep.map(d=>[formatDateShort(d.created_at),bn(d.branch_id),d.description,d.categorie,formatGNF(d.montant)]),
          theme:'striped',
          headStyles:{fillColor:[229,75,74],textColor:255,fontSize:8,fontStyle:'bold'},
          columnStyles:{4:{halign:'right',fontStyle:'bold'}},
          alternateRowStyles:{fillColor:[252,235,235]},
          styles:{fontSize:8,cellPadding:3}, margin:{left:14,right:14}})
      }
    }

    // ── PRÉSENCES ────────────────────────────────────────────
    if (tabKey==='presences') {
      const cl=fd(data.cultes,'branch_id','date_culte','presences')
      const presFiltered=data.presences.filter(p=>cl.some(c=>c.id===p.culte_id))
      sectionTitle('Statistiques des cultes', [83,74,183])
      autoTable(doc, {startY:y,
        head:[['Indicateur','Valeur']],
        body:[
          ['Total cultes', cl.length],
          ['Cultes du dimanche', cl.filter(c=>c.type_culte==='dimanche').length],
          ['Cultes de semaine',  cl.filter(c=>c.type_culte==='semaine').length],
          ['Cultes spéciaux',   cl.filter(c=>c.type_culte==='special').length],
          ['Total présents (cumulé)', presFiltered.reduce((s,p)=>s+(p.total||0),0).toLocaleString('fr-FR')],
          ['Moyenne par culte', presFiltered.length?Math.round(presFiltered.reduce((s,p)=>s+(p.total||0),0)/presFiltered.length):'—'],
        ],
        theme:'grid',
        headStyles:{fillColor:[83,74,183],textColor:255,fontSize:9,fontStyle:'bold'},
        columnStyles:{0:{fontStyle:'bold'},1:{halign:'center',fontStyle:'bold',textColor:[83,74,183]}},
        alternateRowStyles:{fillColor:[238,237,254]},
        styles:{fontSize:9,cellPadding:4}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+10
      sectionTitle('Détail des cultes et présences', [13,43,94])
      autoTable(doc, {startY:y,
        head:[['Date','Branche','Type','Prédicateur','Papas','Mamans','Jeunes','Enfants','Visiteurs','Total']],
        body:cl.map(c=>{
          const p=data.presences.find(pr=>pr.culte_id===c.id)
          const br=branches.find(b=>b.id===c.branch_id)
          return[formatDateShort(c.date_culte),br?.nom||'—',c.type_culte,c.predicateur||'—',p?.papas||0,p?.mamans||0,p?.jeunes||0,p?.enfants||0,p?.visiteurs||0,p?.total||0]
        }),
        theme:'striped',
        headStyles:{fillColor:[13,43,94],textColor:255,fontSize:7.5,fontStyle:'bold'},
        columnStyles:{9:{fontStyle:'bold',textColor:[83,74,183]}},
        alternateRowStyles:{fillColor:[248,249,251]},
        styles:{fontSize:8,cellPadding:2.5}, margin:{left:14,right:14}})
    }

    // ── PASTEURS ──────────────────────────────────────────────
    if (tabKey==='pasteurs') {
      const pp=fp(pasteurs,'pasteurs')
      sectionTitle('Synthèse du corps pastoral', [83,74,183])
      autoTable(doc, {startY:y,
        head:[['Indicateur','Valeur']],
        body:[
          ['Total pasteurs', pp.length],
          ['Pasteurs titulaires', pp.filter(p=>p.role_eglise==='Pasteur Titulaire').length],
          ['Pasteurs assistants', pp.filter(p=>p.role_eglise==='Pasteur Assistant').length],
          ['Pasteurs actifs', pp.filter(p=>p.actif).length],
          ['Apôtres', pp.filter(p=>p.ministere==='Apôtre').length],
          ['Prophètes', pp.filter(p=>p.ministere==='Prophète').length],
          ['Évangélistes', pp.filter(p=>p.ministere==='Évangéliste').length],
          ['Pasteurs (ministère)', pp.filter(p=>p.ministere==='Pasteur').length],
          ['Docteurs', pp.filter(p=>p.ministere==='Docteur').length],
        ],
        theme:'grid',
        headStyles:{fillColor:[83,74,183],textColor:255,fontSize:9,fontStyle:'bold'},
        columnStyles:{0:{fontStyle:'bold'},1:{halign:'center',fontStyle:'bold',textColor:[83,74,183]}},
        alternateRowStyles:{fillColor:[238,237,254]},
        styles:{fontSize:9,cellPadding:4}, margin:{left:14,right:14}})
      y = doc.lastAutoTable.finalY+10
      sectionTitle('Répertoire des pasteurs', [13,43,94])
      autoTable(doc, {startY:y,
        head:[['Nom complet','Ministère','Rôle','Branche','Région','Téléphone','Statut']],
        body:pp.map(p=>[
          `${p.ministere} ${p.prenom} ${p.nom}`,
          p.ministere, p.role_eglise,
          p.branches?.nom||'—', p.branches?.region||'—',
          p.telephone||'—', p.actif?'Actif':'Inactif'
        ]),
        theme:'striped',
        headStyles:{fillColor:[13,43,94],textColor:255,fontSize:8,fontStyle:'bold'},
        columnStyles:{6:{fontStyle:'bold'}},
        alternateRowStyles:{fillColor:[248,249,251]},
        styles:{fontSize:8,cellPadding:2.5}, margin:{left:14,right:14}})
    }

    // Pied de page sur chaque page
    for(let i=1;i<=doc.getNumberOfPages();i++){
      doc.setPage(i)
      doc.setFillColor(13,43,94); doc.rect(0,284,210,13,'F')
      doc.setFillColor(200,136,10); doc.rect(0,284,3,13,'F')
      doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont('helvetica','normal')
      doc.text('MERS Manager  ·  Mission Évangélique le Rocher de Sion  ·  Conakry, Guinée',16,292)
      doc.text(`Page ${i} / ${doc.getNumberOfPages()}`,196,292,{align:'right'})
    }

    const slug = (filters[tabKey]?.b ? bn(filters[tabKey].b).replace(/\s+/g,'-') : filters[tabKey]?.r?.replace(/\s+/g,'-') || 'Global')
    doc.save(`MERS_${TITLES[tabKey]?.replace(/\s+/g,'_')}_${slug}_${new Date().toISOString().slice(0,7)}.pdf`)
  }

  if (loading) return <Spinner />

  const fFid  = fd(data.fideles,  'branch_id','created_at','membres')
  const fCol  = fd(data.collectes,'branch_id','created_at','finances')
  const fDep  = fd(data.depenses, 'branch_id','created_at','finances')
  const fCul  = fd(data.cultes,   'branch_id','date_culte','presences')
  const fPast = fp(pasteurs,'pasteurs')
  const tC=fCol.reduce((s,c)=>s+(c.total||0),0)
  const tD=fDep.reduce((s,d)=>s+(d.montant||0),0)
  const tPresTotal = data.presences.reduce((s,p)=>s+(p.total||0),0)

  const colChart=MOIS.slice(0,6).map((m,i)=>({mois:m,
    collectes:fCol.filter(c=>new Date(c.created_at).getMonth()===i).reduce((s,c)=>s+(c.total||0),0)||(400000+i*60000),
    depenses:fDep.filter(d=>new Date(d.created_at).getMonth()===i).reduce((s,d)=>s+(d.montant||0),0)||(150000+i*20000),
  }))
  const deptData=['papas','mamans','jeunes','enfants'].map(d=>({
    name:d.charAt(0).toUpperCase()+d.slice(1),
    value:fFid.filter(f=>f.departement===d).length||1
  }))
  const presChart=fCul.slice(0,10).map(c=>({
    label:formatDateShort(c.date_culte),
    total:data.presences.find(p=>p.culte_id===c.id)?.total||0
  }))
  const ministereData=['Apôtre','Prophète','Évangéliste','Pasteur','Docteur']
    .map(m=>({name:m,value:fPast.filter(p=>p.ministere===m).length}))
    .filter(m=>m.value>0)

  const TABS = [
    {key:'global',    label:'Vue globale'},
    {key:'membres',   label:'Membres'},
    {key:'finances',  label:'Finances'},
    {key:'presences', label:'Présences & Cultes'},
    {key:'pasteurs',  label:'Pasteurs'},
  ]

  const {b:bF,r:rF}=filters.finances
  const {b:bM}=filters.membres

  return (
    <div>
      <PageHeader title="Rapports & Analytics"
        subtitle="Vue globale ou analyses ciblées — exports PDF professionnels"/>

      <div className="flex gap-0 border-b border-slate-200 mb-0 overflow-x-auto">
        {TABS.map(({key,label})=>(
          <button key={key} onClick={()=>setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab===key
                ? key==='global'
                  ? 'border-[#0D2B5E] text-[#0D2B5E] bg-[#EBF3FC]/50'
                  : 'border-[#C8880A] text-[#0D2B5E]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}>
            {key==='global' && <span className="mr-1.5 inline-flex w-2 h-2 rounded-full bg-[#0D2B5E] align-middle"/>}
            {label}
          </button>
        ))}
      </div>

      <div className="pt-5">

        {/* ── VUE GLOBALE ── */}
        {tab==='global' && (
          <>
            {/* Hero card */}
            <div className="bg-[#0D2B5E] rounded-2xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[#C8880A] text-xs font-bold uppercase tracking-widest mb-1">Rapport complet</p>
                <h2 className="text-white text-xl font-bold">Mission Évangélique le Rocher de Sion</h2>
                <p className="text-[#7AABDC] text-sm mt-0.5">
                  {branches.length} branches · {pasteurs.length} pasteurs · {data.fideles.length} fidèles · {data.cultes.length} cultes
                </p>
              </div>
              <Button variant="gold" onClick={()=>buildPDF('global',true)}>
                <IPDFIcon/> Télécharger le rapport global complet
              </Button>
            </div>

            {/* KPIs globaux */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StatCard label="Fidèles actifs"   value={data.fideles.filter(f=>f.statut==='actif').length}  accent="blue"   icon={c=><IUser c={c}/>}/>
              <StatCard label="Total collectes"  value={formatGNF(data.collectes.reduce((s,c)=>s+(c.total||0),0))} accent="gold" icon={c=><IBar c={c}/>}/>
              <StatCard label="Solde net"        value={formatGNF(data.collectes.reduce((s,c)=>s+(c.total||0),0)-data.depenses.reduce((s,d)=>s+(d.montant||0),0))} accent="green" icon={c=><IPie c={c}/>}/>
              <StatCard label="Présences totales" value={tPresTotal.toLocaleString('fr-FR')} accent="purple" icon={c=><IUser c={c}/>}/>
            </div>

            {/* Résumé par région */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {REGIONS.map((reg,i)=>{
                // Matching flexible : "Basse Guinée" match "Conakry", "Kindia", "Basse Guinée", etc.
                const keywords = {
                  'Basse Guinée':     ['basse','conakry','kindia','coyah','dubreka','forecariah'],
                  'Moyenne Guinée':   ['moyenne','labe','mamou','pita','dalaba','mali','koubi','tougue'],
                  'Haute Guinée':     ['haute','kankan','siguiri','kouroussa','mandiana','keroua'],
                  'Guinée Forestière':['forest','nzerekore','gueckedou','macenta','kissidougou','beyla'],
                }
                const kw = keywords[reg] || [reg.toLowerCase()]
                const brs = branches.filter(b => {
                  const r = (b.region||'').toLowerCase()
                  const n = (b.nom||'').toLowerCase()
                  return r === reg.toLowerCase() || kw.some(k => r.includes(k) || n.includes(k))
                })
                const fids=data.fideles.filter(f=>brs.some(b=>b.id===f.branch_id))
                const past=pasteurs.filter(p=>brs.some(b=>b.id===p.branch_id))
                return (
                  <Card key={reg}>
                    <CardBody>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-8 rounded-full" style={{background:COLORS[i]}}/>
                        <div>
                          <p className="text-xs font-bold text-[#0D2B5E] leading-tight">{reg}</p>
                          <p className="text-[10px] text-slate-400">{brs.length} branches</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          {l:'Fidèles', v:fids.length},
                          {l:'Pasteurs', v:past.length},
                          {l:'Baptisés', v:fids.filter(f=>f.baptise).length},
                        ].map(({l,v})=>(
                          <div key={l} className="flex justify-between text-xs">
                            <span className="text-slate-500">{l}</span>
                            <span className="font-bold text-[#0D2B5E]">{v}</span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>

            {/* Graphiques globaux */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Collectes vs Dépenses — 6 mois</h2></CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={MOIS.slice(0,6).map((m,i)=>({mois:m,
                      collectes:data.collectes.filter(c=>new Date(c.created_at).getMonth()===i).reduce((s,c)=>s+(c.total||0),0)||(400000+i*60000),
                      depenses: data.depenses.filter(d=>new Date(d.created_at).getMonth()===i).reduce((s,d)=>s+(d.montant||0),0)||(150000+i*20000),
                    }))} margin={{top:5,right:10,bottom:5,left:10}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8"/>
                      <XAxis dataKey="mois" tick={{fontSize:11,fill:'#9AA5B4'}} axisLine={false} tickLine={false}/>
                      <YAxis tickFormatter={v=>`${Math.round(v/1000)}k`} tick={{fontSize:10,fill:'#9AA5B4'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<TT/>}/><Legend wrapperStyle={{fontSize:11}}/>
                      <Bar dataKey="collectes" name="Collectes" fill="#1A5EA8" radius={[4,4,0,0]}/>
                      <Bar dataKey="depenses"  name="Dépenses"  fill="#C8880A" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Répartition des fidèles</h2></CardHeader>
                <CardBody>
                  <div className="flex gap-4 items-center">
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart><Pie data={['papas','mamans','jeunes','enfants'].map(d=>({name:d.charAt(0).toUpperCase()+d.slice(1),value:data.fideles.filter(f=>f.departement===d).length||1}))}
                        cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                        {[0,1,2,3].map(i=><Cell key={i} fill={COLORS[i]}/>)}
                      </Pie><Tooltip content={<TT/>}/></PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {['Papas','Mamans','Jeunes','Enfants'].map((d,i)=>{
                        const v=data.fideles.filter(f=>f.departement===d.toLowerCase()).length
                        return (
                          <div key={d} className="flex justify-between items-center">
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:COLORS[i]}}/><span className="text-sm text-slate-600">{d}</span></div>
                            <span className="text-sm font-bold text-[#0D2B5E]">{v}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        )}

        {/* ── MEMBRES ── */}
        {tab==='membres' && (
          <>
            <FilterBar branches={branches} tab="membres" filters={filters.membres} setFilter={setFilter}
              onExport={()=>buildPDF('membres',false)}/>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <StatCard label="Total"          value={fFid.length}                                      accent="blue"   icon={c=><IUser c={c}/>}/>
              <StatCard label="Actifs"         value={fFid.filter(f=>f.statut==='actif').length}         accent="green"  icon={c=><IUser c={c}/>}/>
              <StatCard label="Baptisés"       value={fFid.filter(f=>f.baptise).length}                  accent="navy"   icon={c=><IPie c={c}/>}/>
              <StatCard label="Disc. complété" value={fFid.filter(f=>f.discipolat==='complete').length}  accent="purple" icon={c=><IPie c={c}/>}/>
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
                    <BarChart data={branches.filter(b=>!bM||b.id===bM).slice(0,8).map(b=>({name:b.nom.replace('MERS ','').slice(0,10),val:fFid.filter(f=>f.branch_id===b.id).length}))}
                      margin={{top:5,right:10,bottom:20,left:0}}>
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

        {/* ── FINANCES ── */}
        {tab==='finances' && (
          <>
            <FilterBar branches={branches} tab="finances" filters={filters.finances} setFilter={setFilter}
              onExport={()=>buildPDF('finances',false)}/>
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

        {/* ── PRÉSENCES ── */}
        {tab==='presences' && (
          <>
            <FilterBar branches={branches} tab="presences" filters={filters.presences} setFilter={setFilter}
              onExport={()=>buildPDF('presences',false)}/>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <StatCard label="Cultes"    value={fCul.length}                                       accent="navy"   icon={c=><IBar c={c}/>}/>
              <StatCard label="Dimanches" value={fCul.filter(c=>c.type_culte==='dimanche').length}  accent="blue"   icon={c=><IBar c={c}/>}/>
              <StatCard label="Spéciaux"  value={fCul.filter(c=>c.type_culte==='special').length}   accent="gold"   icon={c=><IBar c={c}/>}/>
              <StatCard label="Présences" value={data.presences.filter(p=>fCul.some(c=>c.id===p.culte_id)).reduce((s,p)=>s+(p.total||0),0).toLocaleString('fr-FR')} accent="purple" icon={c=><IPie c={c}/>}/>
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

        {/* ── PASTEURS ── */}
        {tab==='pasteurs' && (
          <>
            <FilterBar branches={branches} tab="pasteurs" filters={filters.pasteurs} setFilter={setFilter}
              onExport={()=>buildPDF('pasteurs',false)}/>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <StatCard label="Total"      value={fPast.length}                                            accent="navy"   icon={c=><IUser c={c}/>}/>
              <StatCard label="Titulaires" value={fPast.filter(p=>p.role_eglise==='Pasteur Titulaire').length} accent="blue"   icon={c=><IUser c={c}/>}/>
              <StatCard label="Assistants" value={fPast.filter(p=>p.role_eglise==='Pasteur Assistant').length} accent="gold"   icon={c=><IUser c={c}/>}/>
              <StatCard label="Actifs"     value={fPast.filter(p=>p.actif).length}                         accent="green"  icon={c=><IUser c={c}/>}/>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Répartition par ministère</h2></CardHeader>
                <CardBody>
                  {ministereData.length===0 ? <p className="text-sm text-slate-300 text-center py-8">Aucun pasteur</p> : (
                    <div className="flex gap-4 items-center">
                      <ResponsiveContainer width="50%" height={200}>
                        <PieChart><Pie data={ministereData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {ministereData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                        </Pie><Tooltip content={<TT/>}/></PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {ministereData.map((m,i)=>(
                          <div key={m.name} className="flex justify-between items-center">
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:COLORS[i]}}/><span className="text-sm text-slate-600">{m.name}</span></div>
                            <span className="text-sm font-bold text-[#0D2B5E]">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
              <Card>
                <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Pasteurs par région</h2></CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={REGIONS.map(reg=>({name:reg.replace('Guinée','G.').replace('Forestière','For.'),val:fPast.filter(p=>p.branches?.region===reg).length}))}
                      margin={{top:5,right:10,bottom:5,left:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8"/>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:'#9AA5B4'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:'#9AA5B4'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<TT/>}/>
                      <Bar dataKey="val" name="Pasteurs" fill="#534AB7" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
            <Card className="mt-5">
              <CardHeader><h2 className="text-sm font-bold text-[#0D2B5E]">Liste des pasteurs</h2></CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50/70 border-b border-slate-100">
                      {['Pasteur','Ministère','Rôle','Branche','Région','Téléphone','Statut'].map(h=>(
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {fPast.map(p=>(
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-[#0D2B5E]">{p.prenom} {p.nom}</td>
                          <td className="px-4 py-3"><Badge color={{Apôtre:'purple',Prophète:'teal',Évangéliste:'blue',Pasteur:'navy',Docteur:'gold'}[p.ministere]||'slate'} size="xs">{p.ministere}</Badge></td>
                          <td className="px-4 py-3 text-xs text-slate-500">{p.role_eglise}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{p.branches?.nom||'—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{p.branches?.region||'—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{p.telephone||'—'}</td>
                          <td className="px-4 py-3"><Badge color={p.actif?'green':'red'} size="xs">{p.actif?'Actif':'Inactif'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
