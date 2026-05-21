'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Park, PlayIdea, ParkSuggestion } from '@/lib/types'
import { PARK_AMENITIES, SUITABLE_FOR } from '@/lib/types'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'scn2024'

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [parks, setParks] = useState<Park[]>([])
  const [ideas, setIdeas] = useState<PlayIdea[]>([])
  const [suggestions, setSuggestions] = useState<ParkSuggestion[]>([])
  const [tab, setTab] = useState<'parks' | 'ideas' | 'suggestions'>('parks')
  const [editingPark, setEditingPark] = useState<Park | null>(null)

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) setAuth(true)
    else alert('Senha incorreta')
  }

  const loadData = async () => {
    const [{ data: p }, { data: i }, { data: s }] = await Promise.all([
      supabase.from('parks').select('*').order('created_at', { ascending: false }),
      supabase.from('play_ideas').select('*').order('created_at', { ascending: false }),
      supabase.from('park_suggestions').select('*').order('created_at', { ascending: false }),
    ])
    setParks(p ?? [])
    setIdeas(i ?? [])
    setSuggestions(s ?? [])
  }

  useEffect(() => { if (auth) loadData() }, [auth])

  const approvePark = async (id: string) => {
    await supabase.from('parks').update({ status: 'approved' }).eq('id', id)
    setParks((ps) => ps.map((p) => (p.id === id ? { ...p, status: 'approved' } : p)))
  }

  const rejectPark = async (id: string) => {
    await supabase.from('parks').delete().eq('id', id)
    setParks((ps) => ps.filter((p) => p.id !== id))
  }

  const approveIdea = async (id: string) => {
    await supabase.from('play_ideas').update({ status: 'approved' }).eq('id', id)
    setIdeas((is) => is.map((i) => (i.id === id ? { ...i, status: 'approved' } : i)))
  }

  const rejectIdea = async (id: string) => {
    await supabase.from('play_ideas').delete().eq('id', id)
    setIdeas((is) => is.filter((i) => i.id !== id))
  }

  const markSuggestionReviewed = async (id: string) => {
    await supabase.from('park_suggestions').update({ status: 'reviewed' }).eq('id', id)
    setSuggestions((ss) => ss.map((s) => (s.id === id ? { ...s, status: 'reviewed' } : s)))
  }

  const rejectSuggestion = async (id: string) => {
    await supabase.from('park_suggestions').delete().eq('id', id)
    setSuggestions((ss) => ss.filter((s) => s.id !== id))
  }

  const saveParkEdit = async () => {
    if (!editingPark) return
    const trees = typeof editingPark.trees === 'string'
      ? (editingPark.trees as unknown as string).split(',').map((t) => t.trim()).filter(Boolean)
      : editingPark.trees
    await supabase.from('parks').update({
      name: editingPark.name,
      description: editingPark.description,
      address: editingPark.address,
      trees,
      amenities: editingPark.amenities ?? [],
      suitable_for: editingPark.suitable_for ?? [],
    }).eq('id', editingPark.id)
    setParks((ps) => ps.map((p) => (p.id === editingPark.id ? { ...editingPark, trees } : p)))
    setEditingPark(null)
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-green-800 mb-6 text-center">🌳 Painel Admin</h1>
          <form onSubmit={login} className="space-y-4">
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Senha"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <button type="submit" className="w-full bg-green-700 text-white rounded-xl py-3 font-semibold hover:bg-green-800 transition-colors">
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  const pendingParks = parks.filter((p) => p.status === 'pending')
  const pendingIdeas = ideas.filter((i) => i.status === 'pending')
  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: '#2d6a4f' }} className="text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">🌳 Admin — Natureza Perto de Mim</h1>
        <div className="flex gap-3 text-xs">
          {pendingParks.length > 0 && <span className="bg-white/20 px-2 py-1 rounded-lg">{pendingParks.length} praças</span>}
          {pendingIdeas.length > 0 && <span className="bg-white/20 px-2 py-1 rounded-lg">{pendingIdeas.length} brincadeiras</span>}
          {pendingSuggestions.length > 0 && <span className="bg-amber-400/80 px-2 py-1 rounded-lg">{pendingSuggestions.length} sugestões</span>}
        </div>
      </div>

      <div className="flex border-b bg-white">
        {(['parks', 'ideas', 'suggestions'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'parks' ? `Praças (${parks.length})` : t === 'ideas' ? `Brincadeiras (${ideas.length})` : `Sugestões (${suggestions.length})`}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-4">

        {/* PRAÇAS */}
        {tab === 'parks' && parks.map((park) => (
          <div key={park.id} className="bg-white rounded-xl shadow-sm border p-4">
            {editingPark?.id === park.id ? (
              <div className="space-y-3">
                <input value={editingPark.name} onChange={(e) => setEditingPark({ ...editingPark, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-semibold" placeholder="Nome" />
                <input value={editingPark.address ?? ''} onChange={(e) => setEditingPark({ ...editingPark, address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Endereço" />
                <textarea value={editingPark.description ?? ''} onChange={(e) => setEditingPark({ ...editingPark, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={2} placeholder="Descrição" />
                <input value={Array.isArray(editingPark.trees) ? editingPark.trees.join(', ') : editingPark.trees ?? ''}
                  onChange={(e) => setEditingPark({ ...editingPark, trees: e.target.value as unknown as string[] })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Árvores (separadas por vírgula)" />
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Ótimo para</p>
                  <div className="flex gap-2 mb-3">
                    {SUITABLE_FOR.map((item) => {
                      const selected = (editingPark.suitable_for ?? []).includes(item.id)
                      return (
                        <button key={item.id} type="button"
                          onClick={() => {
                            const current = editingPark.suitable_for ?? []
                            const updated = selected ? current.filter((a) => a !== item.id) : [...current, item.id]
                            setEditingPark({ ...editingPark, suitable_for: updated })
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors ${selected ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
                        >
                          {item.emoji} {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">O que tem nesse parque?</p>
                  <div className="flex flex-wrap gap-2">
                    {PARK_AMENITIES.map((item) => {
                      const selected = (editingPark.amenities ?? []).includes(item.id)
                      return (
                        <button key={item.id} type="button"
                          onClick={() => {
                            const current = editingPark.amenities ?? []
                            const updated = selected ? current.filter((a) => a !== item.id) : [...current, item.id]
                            setEditingPark({ ...editingPark, amenities: updated })
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${selected ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
                        >
                          {item.emoji} {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveParkEdit} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 transition-colors">
                    💾 Salvar
                  </button>
                  <button onClick={() => setEditingPark(null)} className="flex-1 border text-gray-500 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                </div>
                <button
                  onClick={() => { if (confirm(`Excluir "${editingPark.name}"? Esta ação não pode ser desfeita.`)) { rejectPark(editingPark.id); setEditingPark(null) } }}
                  className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  🗑️ Excluir esta praça
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{park.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${park.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {park.status === 'approved' ? 'Aprovada' : 'Pendente'}
                    </span>
                  </div>
                  {park.address && <p className="text-sm text-gray-500">{park.address}</p>}
                  {park.description && <p className="text-sm text-gray-600 mt-1">{park.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {park.latitude?.toFixed(5)}, {park.longitude?.toFixed(5)}
                    {park.suggested_by && ` · por ${park.suggested_by}`}
                    {park.email && <span className="ml-1 text-blue-400">· {park.email}</span>}
                  </p>
                  {park.trees?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {park.trees.map((t) => <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setEditingPark(park)} className="bg-blue-50 text-blue-600 border border-blue-200 text-sm px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    ✏️ Editar
                  </button>
                  {park.status === 'pending' && <>
                    <button onClick={() => approvePark(park.id)} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                      ✓ Aprovar
                    </button>
                    <button onClick={() => rejectPark(park.id)} className="bg-red-50 text-red-600 border border-red-200 text-sm px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      ✕ Recusar
                    </button>
                  </>}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* BRINCADEIRAS */}
        {tab === 'ideas' && ideas.map((idea) => (
          <div key={idea.id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${idea.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {idea.status === 'approved' ? 'Aprovada' : 'Pendente'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{idea.description}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  {idea.age_range && <span>🌿 {idea.age_range}</span>}
                  {idea.materials && <span>🍃 {idea.materials}</span>}
                  {idea.suggested_by && <span>· {idea.suggested_by}</span>}
                  {idea.email && <span className="text-blue-400">· {idea.email}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {idea.status === 'pending' && <>
                  <button onClick={() => approveIdea(idea.id)} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">✓ Aprovar</button>
                  <button onClick={() => rejectIdea(idea.id)} className="bg-red-50 text-red-600 border border-red-200 text-sm px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">✕ Recusar</button>
                </>}
                {idea.status === 'approved' && (
                  <button onClick={() => { if (confirm('Excluir esta brincadeira?')) rejectIdea(idea.id) }} className="bg-red-50 text-red-600 border border-red-200 text-sm px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    🗑️ Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* SUGESTÕES DE ATUALIZAÇÃO */}
        {tab === 'suggestions' && suggestions.map((s) => {
          const park = parks.find((p) => p.id === s.park_id)
          return (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{park?.name ?? 'Praça desconhecida'}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'reviewed' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'}`}>
                      {s.status === 'reviewed' ? 'Revisada' : 'Nova'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3 mt-1">{s.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {s.suggested_by && `por ${s.suggested_by} · `}
                    {new Date(s.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {s.status === 'pending' && <>
                    <button onClick={() => { setTab('parks'); setEditingPark(park ?? null); markSuggestionReviewed(s.id) }}
                      className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                      ✏️ Aplicar edição
                    </button>
                    <button onClick={() => rejectSuggestion(s.id)}
                      className="bg-red-50 text-red-600 border border-red-200 text-sm px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">
                      ✕ Recusar
                    </button>
                  </>}
                  {s.status === 'reviewed' && (
                    <span className="text-xs text-gray-400 italic">Aplicada</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {tab === 'parks' && parks.length === 0 && <p className="text-gray-400 text-center py-12">Nenhuma praça ainda.</p>}
        {tab === 'ideas' && ideas.length === 0 && <p className="text-gray-400 text-center py-12">Nenhuma brincadeira ainda.</p>}
        {tab === 'suggestions' && suggestions.length === 0 && <p className="text-gray-400 text-center py-12">Nenhuma sugestão ainda.</p>}
      </div>
    </div>
  )
}
