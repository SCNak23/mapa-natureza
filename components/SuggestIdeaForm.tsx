'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TREE_PARTS } from '@/lib/types'

interface Props {
  parkId: string
  onDone: () => void
}

export default function SuggestIdeaForm({ parkId, onDone }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    age_range: '',
    materials: '',
    suggested_by: '',
  })
  const [treeParts, setTreeParts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const togglePart = (id: string) => {
    setTreeParts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('play_ideas').insert({
      park_id: parkId,
      title: form.title,
      description: form.description,
      age_range: form.age_range || null,
      materials: form.materials || null,
      tree_parts: treeParts,
      suggested_by: form.suggested_by || null,
      status: 'pending',
    })
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-800 font-medium">✅ Sugestão enviada!</p>
        <p className="text-green-600 text-sm mt-1">Será revisada antes de aparecer no mapa.</p>
        <button onClick={onDone} className="mt-3 text-sm text-green-700 underline">Fechar</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-green-50 border border-green-100 rounded-xl p-4">
      <h4 className="font-semibold text-green-800">Nova brincadeira</h4>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nome da brincadeira *</label>
        <input
          required
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Ex: Corrida das folhas"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Como se brinca? *</label>
        <textarea
          required
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Descreva como fazer a brincadeira com as crianças..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
        />
      </div>

      {/* Partes da árvore */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Partes da árvore usadas</label>
        <div className="flex flex-wrap gap-2">
          {TREE_PARTS.map((part) => {
            const selected = treeParts.includes(part.id)
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => togglePart(part.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selected
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                }`}
              >
                <span>{part.emoji}</span>
                <span>{part.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Faixa etária</label>
          <input
            value={form.age_range}
            onChange={(e) => set('age_range', e.target.value)}
            placeholder="Ex: 3–8 anos"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Materiais</label>
          <input
            value={form.materials}
            onChange={(e) => set('materials', e.target.value)}
            placeholder="Ex: potes, luvas"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Seu nome (opcional)</label>
        <input
          value={form.suggested_by}
          onChange={(e) => set('suggested_by', e.target.value)}
          placeholder="Como você quer ser chamado?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 border border-gray-200 text-gray-500 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-700 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enviando...' : 'Enviar sugestão'}
        </button>
      </div>
    </form>
  )
}
