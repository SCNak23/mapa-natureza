'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  parkId: string
  parkName: string
  onDone: () => void
}

export default function SuggestParkUpdateForm({ parkId, parkName, onDone }: Props) {
  const [message, setMessage] = useState('')
  const [suggestedBy, setSuggestedBy] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('park_suggestions').insert({
      park_id: parkId,
      message,
      suggested_by: suggestedBy || null,
      status: 'pending',
    })
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-800 font-medium">✅ Sugestão enviada!</p>
        <p className="text-green-600 text-sm mt-1">Obrigado por ajudar a melhorar o mapa.</p>
        <button onClick={onDone} className="mt-3 text-sm text-green-700 underline">Fechar</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
      <h4 className="font-semibold text-amber-900">Sugerir atualização — {parkName}</h4>
      <p className="text-xs text-amber-700">Encontrou uma espécie nova? Algo errado? Conte aqui!</p>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">O que você quer atualizar? *</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: Vi um ipê roxo que não estava listado. / O nome correto da espécie é Ficus benjamina."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Seu nome (opcional)</label>
        <input
          value={suggestedBy}
          onChange={(e) => setSuggestedBy(e.target.value)}
          placeholder="Como você quer ser chamado?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onDone} className="flex-1 border border-gray-200 text-gray-500 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 bg-amber-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors">
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  )
}
