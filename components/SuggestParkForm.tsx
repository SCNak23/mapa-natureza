'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  initialLat?: number
  initialLng?: number
  onDone: () => void
}

export default function SuggestParkForm({ initialLat, initialLng, onDone }: Props) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    latitude: initialLat?.toString() ?? '',
    longitude: initialLng?.toString() ?? '',
    trees: '',
    suggested_by: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const useMyLocation = () => {
    setGeoLoading(true)
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        set('latitude', pos.coords.latitude.toString())
        set('longitude', pos.coords.longitude.toString())
        setGeoLoading(false)
      },
      () => setGeoLoading(false)
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const trees = form.trees
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    await supabase.from('parks').insert({
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      trees,
      suggested_by: form.suggested_by || null,
      status: 'pending',
    })
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="p-6 text-center">
        <div className="text-5xl mb-3">🌳</div>
        <p className="text-green-800 font-semibold text-lg">Praça enviada!</p>
        <p className="text-gray-500 text-sm mt-2 mb-4">
          Obrigado pela contribuição. Ela será revisada e aparecerá no mapa em breve.
        </p>
        <button onClick={onDone} className="bg-green-700 text-white rounded-xl px-6 py-2 text-sm font-medium hover:bg-green-800 transition-colors">
          Voltar ao mapa
        </button>
      </div>
    )
  }

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={onDone} className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</button>
        <h2 className="text-lg font-bold text-green-800">Sugerir uma praça</h2>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nome da praça / parque *</label>
          <input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ex: Praça das Árvores"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Endereço (referência)</label>
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Ex: Rua das Flores, 100 – Bairro"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Localização no mapa *</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              required
              value={form.latitude}
              onChange={(e) => set('latitude', e.target.value)}
              placeholder="Latitude"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              required
              value={form.longitude}
              onChange={(e) => set('longitude', e.target.value)}
              placeholder="Longitude"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="text-xs text-green-700 font-medium hover:underline"
          >
            {geoLoading ? 'Obtendo localização...' : '📍 Usar minha localização atual'}
          </button>
          <p className="text-xs text-gray-400 mt-1">
            Dica: abra o Google Maps na praça, segure o pin e copie as coordenadas.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Descreva o espaço: tem sombra? banco? espaço aberto?..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Árvores que você viu (separadas por vírgula)</label>
          <input
            value={form.trees}
            onChange={(e) => set('trees', e.target.value)}
            placeholder="Ex: ipê amarelo, figueira, jacarandá"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Seu nome (opcional)</label>
          <input
            value={form.suggested_by}
            onChange={(e) => set('suggested_by', e.target.value)}
            placeholder="Como você quer ser chamado?"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white rounded-xl py-3 font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enviando...' : '🌱 Enviar praça'}
        </button>
      </form>
    </div>
  )
}
