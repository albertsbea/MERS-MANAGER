import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [mode,     setMode]     = useState('login') // login | reset

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message)
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/?reset=1'
    })
    if (err) setError(err.message)
    else setError('✅ Email de réinitialisation envoyé !')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0D2B5E] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 relative">
            M
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#C8880A] rounded-full"/>
          </div>
          <h1 className="text-2xl font-bold text-[#0D2B5E]">MERS Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Mission Évangélique le Rocher de Sion</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-bold text-[#0D2B5E] mb-5">
            {mode === 'login' ? 'Connexion' : 'Réinitialiser le mot de passe'}
          </h2>

          <form onSubmit={mode === 'login' ? handleLogin : handleReset} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]"
                placeholder="vous@mers.gn"/>
            </div>

            {mode === 'login' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5EA8]/20 focus:border-[#1A5EA8]"
                  placeholder="••••••••"/>
              </div>
            )}

            {error && (
              <div className={`px-3 py-2 rounded-lg text-xs font-medium ${error.startsWith('✅') ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-[#FCEBEB] text-[#791F1F]'}`}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#0D2B5E] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1A5EA8] transition-colors disabled:opacity-50 text-sm">
              {loading ? 'Connexion...' : mode === 'login' ? 'Se connecter' : 'Envoyer le lien'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => { setMode(mode === 'login' ? 'reset' : 'login'); setError('') }}
              className="text-xs text-[#1A5EA8] hover:underline">
              {mode === 'login' ? 'Mot de passe oublié ?' : '← Retour à la connexion'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Équipe Média MERS · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
