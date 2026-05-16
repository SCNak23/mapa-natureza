'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Park, PlayIdea } from '@/lib/types'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'scn2024'

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [parks, setParks] = useState<Park[]>([])
  const [ideas, setIdeas] = useState<PlayIdea[]>([])
  const [tab, setTab] = useState<'parks' | 'ideas'>('parks')

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) setAuth(true)
    else alert('Senha incorreta')
  }

  const loadData = async () => {
    const [{ data: p }, { data: i }] = await Promise.all([
      supabase.from('parks').select('*').order('created_at', { ascending: false }),
      supabase.from('play_ideas').select('*').order('created_at', { ascending: false }),
    ])
    setParks(p ?? [])
    setIdeas(i ?? [])
  }

  useEffect(() => {
    if (auth) loadData()
  }, [auth])

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

  if (!auth) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-green-800 mb-6 text-center">🌳 Painel Admin</h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Senha"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">🌳 Admin — Mapa Natureza</h1>
        <div className="flex gap-4 text-sm">
          <span className="bg-white/20 px-2 py-1 rounded-lg">{pendingParks.length} praças pendentes</span>
          <span className="bg-white/20 px-2 py-1 rounded-lg">{pendingIdeas.length} brincadeiras pendentes</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        <button
          onClick={() => setTab('parks')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'parks' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Praças ({parks.length})
        </button>
        <button
          onClick={() => setTab('ideas')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'ideas' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Brincadeiras ({ideas.length})
        </button>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-4">
        {tab === 'parks' && parks.map((park) => (
          <div key={park.id} className="bg-white rounded-xl shadow-sm border p-4">
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
                  📍 {park.latitude.toFixed(5)}, {park.longitude.toFixed(5)}
                  {park.suggested_by && ` · sugerido por ${park.suggested_by}`}
                </p>
                {park.trees?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {park.trees.map((t) => (
                      <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              {park.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => approvePark(park.id)} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                    ✓ Aprovar
                  </button>
                  <button onClick={() => rejectPark(park.id)} className="bg-red-50 text-red-600 border border-red-200 text-sm px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    ✕ Recusar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

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
                  {idea.age_range && <span>👶 {idea.age_range}</span>}
                  {idea.materials && <span>🧺 {idea.materials}</span>}
                  {idea.suggested_by && <span>· {idea.suggested_by}</span>}
                </div>
              </div>
              {idea.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => approveIdea(idea.id)} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                    ✓ Aprovar
                  </button>
                  <button onClick={() => rejectIdea(idea.id)} className="bg-red-50 text-red-600 border border-red-200 text-sm px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    ✕ Recusar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {tab === 'parks' && parks.length === 0 && (
          <p className="text-gray-400 text-center py-12">Nenhuma praça ainda.</p>
        )}
        {tab === 'ideas' && ideas.length === 0 && (
          <p className="text-gray-400 text-center py-12">Nenhuma brincadeira ainda.</p>
        )}
      </div>
    </div>
  )
}
