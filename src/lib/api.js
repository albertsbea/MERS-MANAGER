import { supabase } from './supabase'

// ── BRANCHES ─────────────────────────────────────────────────
export const branchesApi = {
  getAll: () =>
    supabase.from('branches').select('*').order('nom'),

  getById: (id) =>
    supabase.from('branches').select('*').eq('id', id).single(),

  create: (data) =>
    supabase.from('branches').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('branches').update(data).eq('id', id).select().single(),

  delete: (id) =>
    supabase.from('branches').delete().eq('id', id),
}

// ── FIDÈLES ───────────────────────────────────────────────────
export const fidelesApi = {
  getAll: (branchId = null) => {
    let q = supabase.from('fideles')
      .select('*, branches(nom)')
      .order('nom')
    if (branchId) q = q.eq('branch_id', branchId)
    return q
  },

  getById: (id) =>
    supabase.from('fideles').select('*, branches(nom)').eq('id', id).single(),

  create: (data) =>
    supabase.from('fideles').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('fideles').update(data).eq('id', id).select().single(),

  delete: (id) =>
    supabase.from('fideles').delete().eq('id', id),

  countByBranch: (branchId) =>
    supabase.from('fideles')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branchId)
      .eq('statut', 'actif'),
}

// ── CULTES ────────────────────────────────────────────────────
export const cultesApi = {
  getAll: (branchId = null) => {
    let q = supabase.from('cultes')
      .select('*, branches(nom), presences(*), collectes(*)')
      .order('date_culte', { ascending: false })
    if (branchId) q = q.eq('branch_id', branchId)
    return q
  },

  create: (data) =>
    supabase.from('cultes').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('cultes').update(data).eq('id', id).select().single(),

  delete: (id) =>
    supabase.from('cultes').delete().eq('id', id),
}

// ── PRÉSENCES ─────────────────────────────────────────────────
export const presencesApi = {
  getByCulte: (culteId) =>
    supabase.from('presences').select('*').eq('culte_id', culteId).single(),

  upsert: (data) =>
    supabase.from('presences').upsert(data, { onConflict: 'culte_id' }).select().single(),
}

// ── COLLECTES ─────────────────────────────────────────────────
export const collectesApi = {
  getAll: (branchId = null) => {
    let q = supabase.from('collectes')
      .select('*, branches(nom), cultes(date_culte, type_culte)')
      .order('created_at', { ascending: false })
    if (branchId) q = q.eq('branch_id', branchId)
    return q
  },

  getByCulte: (culteId) =>
    supabase.from('collectes').select('*').eq('culte_id', culteId).single(),

  upsert: (data) =>
    supabase.from('collectes').upsert(data, { onConflict: 'culte_id' }).select().single(),

  create: (data) =>
    supabase.from('collectes').insert(data).select().single(),

  getTotalByBranch: async (branchId) => {
    const { data } = await supabase.from('collectes')
      .select('total')
      .eq('branch_id', branchId)
    return data?.reduce((s, r) => s + (r.total || 0), 0) || 0
  },
}

// ── DÉPENSES ─────────────────────────────────────────────────
export const depensesApi = {
  getAll: (branchId = null) => {
    let q = supabase.from('depenses')
      .select('*, branches(nom)')
      .order('date_dep', { ascending: false })
    if (branchId) q = q.eq('branch_id', branchId)
    return q
  },

  create: (data) =>
    supabase.from('depenses').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('depenses').update(data).eq('id', id).select().single(),

  delete: (id) =>
    supabase.from('depenses').delete().eq('id', id),
}

// ── STATISTIQUES TABLEAU DE BORD ─────────────────────────────
export const statsApi = {
  getDashboard: async () => {
    const [
      { count: totalFideles },
      { count: totalBranches },
      { data: collectes },
      { data: depenses },
      { data: recentCultes },
    ] = await Promise.all([
      supabase.from('fideles').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
      supabase.from('branches').select('*', { count: 'exact', head: true }).eq('statut', 'active'),
      supabase.from('collectes').select('total'),
      supabase.from('depenses').select('montant'),
      supabase.from('cultes')
        .select('*, branches(nom), presences(*)')
        .order('date_culte', { ascending: false })
        .limit(5),
    ])

    const totalCollectes = collectes?.reduce((s, r) => s + (r.total || 0), 0) || 0
    const totalDepenses  = depenses?.reduce((s, r) => s + (r.montant || 0), 0) || 0

    return {
      totalFideles,
      totalBranches,
      totalCollectes,
      totalDepenses,
      solde: totalCollectes - totalDepenses,
      recentCultes: recentCultes || [],
    }
  }
}
