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

// ── ANNONCES ─────────────────────────────────────────────────
export const annoncesApi = {
  getAll: () =>
    supabase.from('annonces').select('*, branches(nom)').order('created_at', { ascending: false }),
  create: (data) =>
    supabase.from('annonces').insert(data).select().single(),
  update: (id, data) =>
    supabase.from('annonces').update(data).eq('id', id).select().single(),
  delete: (id) =>
    supabase.from('annonces').delete().eq('id', id),
}

// ── RESSOURCES ───────────────────────────────────────────────
export const ressourcesApi = {
  getAll: () =>
    supabase.from('ressources').select('*, branches(nom)').order('created_at', { ascending: false }),
  create: (data) =>
    supabase.from('ressources').insert(data).select().single(),
  update: (id, data) =>
    supabase.from('ressources').update(data).eq('id', id).select().single(),
  delete: (id) =>
    supabase.from('ressources').delete().eq('id', id),
}

// ── UTILISATEURS ─────────────────────────────────────────────
export const utilisateursApi = {
  getAll: () =>
    supabase.from('utilisateurs').select('*, branches(nom)').order('nom'),
  create: (data) =>
    supabase.from('utilisateurs').insert(data).select().single(),
  update: (id, data) =>
    supabase.from('utilisateurs').update(data).eq('id', id).select().single(),
  delete: (id) =>
    supabase.from('utilisateurs').delete().eq('id', id),
}

// ── STATS ANALYTICS ──────────────────────────────────────────
export const analyticsApi = {
  getFullStats: async () => {
    const [
      { data: fideles },
      { data: branches },
      { data: collectes },
      { data: depenses },
      { data: cultes },
      { data: presences },
    ] = await Promise.all([
      supabase.from('fideles').select('departement, statut, baptise, discipolat, branch_id, created_at'),
      supabase.from('branches').select('id, nom, region, statut'),
      supabase.from('collectes').select('total, dimes, offrandes_ordinaires, offrande_speciale, created_at, branch_id'),
      supabase.from('depenses').select('montant, categorie, created_at, branch_id'),
      supabase.from('cultes').select('type_culte, date_culte, branch_id'),
      supabase.from('presences').select('total, culte_id'),
    ])
    return { fideles: fideles||[], branches: branches||[], collectes: collectes||[], depenses: depenses||[], cultes: cultes||[], presences: presences||[] }
  }
}

// ── PASTEURS ─────────────────────────────────────────────────
export const pasteursApi = {
  getAll: (branchId = null) => {
    let q = supabase.from('pasteurs').select('*, branches(nom, region)').order('nom')
    if (branchId) q = q.eq('branch_id', branchId)
    return q
  },
  getById: (id) =>
    supabase.from('pasteurs').select('*, branches(nom, region)').eq('id', id).single(),
  create: (data) =>
    supabase.from('pasteurs').insert(data).select().single(),
  update: (id, data) =>
    supabase.from('pasteurs').update(data).eq('id', id).select().single(),
  delete: (id) =>
    supabase.from('pasteurs').delete().eq('id', id),
}

// ── UPLOAD FICHIER SUPABASE STORAGE ──────────────────────────
export const storageApi = {
  upload: async (file, folder = 'ressources') => {
    const ext  = file.name.split('.').pop()
    const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from('mers-files').upload(name, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('mers-files').getPublicUrl(name)
    return { path: name, url: publicUrl, size: `${(file.size / 1024).toFixed(0)} Ko` }
  },
  delete: async (path) => {
    return supabase.storage.from('mers-files').remove([path])
  }
}
