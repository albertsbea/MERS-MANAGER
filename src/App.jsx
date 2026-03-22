import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar    from './components/Sidebar'
import Dashboard  from './pages/Dashboard'
import Branches   from './pages/Branches'
import Fideles    from './pages/Fideles'
import Cultes     from './pages/Cultes'
import Finances   from './pages/Finances'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#F5F8FC]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <header className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-[#C8880A] rounded-full" />
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                Mission Évangélique le Rocher de Sion
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0D2B5E] rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
              <span className="text-sm text-slate-600 font-medium">Admin</span>
            </div>
          </header>
          <div className="px-8 py-6 max-w-7xl">
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/branches" element={<Branches />}  />
              <Route path="/fideles"  element={<Fideles />}   />
              <Route path="/cultes"   element={<Cultes />}    />
              <Route path="/finances" element={<Finances />}  />
              <Route path="/branches/new" element={<Branches />} />
              <Route path="/fideles/new"  element={<Fideles />}  />
              <Route path="/cultes/new"   element={<Cultes />}   />
              <Route path="/finances/new" element={<Finances />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
