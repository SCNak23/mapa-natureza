'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PARK_AMENITIES, SUITABLE_FOR } from '@/lib/types'

interface Props {
  initialLat?: number
  initialLng?: number
  onDone: () => void
}

interface GeoResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
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
    email: '',
  })
  const [amenities, setAmenities] = useState<string[]>([])
  const [suitableFor, setSuitableFor] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  const [locationQuery, setLocationQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<GeoResult[]>([])
  const [locationLabel, setLocationLabel] = useState(
    initialLat ? `${initialLat.toFixed(5)}, ${initialLng?.toFixed(5)}` : ''
  )
  const [showManual, setShowManual] = useState(false)

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const toggleSuitableFor = (id: string) => {
    setSuitableFor((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const searchLocation = async () => {
    if (!locationQuery.trim()) return
    setSearchLoading(true)
    setSearchResults([])
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=5&countrycodes=br`,
        { headers: { 'User-Agent': 'mapa-natureza-scn/1.0' } }
      )
      const data: GeoResult[] = await res.json()
      setSearchResults(data)
    } catch {
      // silently fail — user can use manual input
    }
    setSearchLoading(false)
  }

  const selectResult = (result: GeoResult) => {
    const shortName = result.display_name.split(',').slice(0, 3).join(',')
    setForm((f) => ({
      ...f,
      latitude: parseFloat(result.lat).toFixed(6),
      longitude: parseFloat(result.lon).toFixed(6),
      address: f.address || shortName,
    }))
    setLocationLabel(result.display_name.split(',').slice(0, 4).join(','))
    setSearchResults([])
    setLocationQuery('')
  }

  const useMyLocation = () => {
    setGeoLoading(true)
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        set('latitude', lat)
        set('longitude', lng)
        setLocationLabel(`${lat}, ${lng}`)
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
      amenities,
      suitable_for: suitableFor,
      suggested_by: form.suggested_by,
      email: form.email,
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

  const hasCoords = form.latitude && form.longitude

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

        {/* Localização */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Localização no mapa *</label>

          {/* Busca por nome/endereço */}
          <div className="flex gap-2 mb-2">
            <input
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
              placeholder="Buscar por nome ou endereço..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="button"
              onClick={searchLocation}
              disabled={searchLoading}
              className="bg-green-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {searchLoading ? '...' : '🔍 Buscar'}
            </button>
          </div>

          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-2 shadow-sm">
              {searchResults.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-green-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <span className="text-green-700 mr-1">📍</span>
                  {r.display_name}
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && locationQuery === '' && !hasCoords && (
            <p className="text-xs text-gray-400 mb-2">
              Digite o nome ou endereço da praça e clique em Buscar.
            </p>
          )}

          {searchResults.length === 0 && locationQuery !== '' && !searchLoading && (
            <p className="text-xs text-amber-600 mb-2">
              Nenhum resultado. Tente um nome diferente ou use as opções abaixo.
            </p>
          )}

          {/* Localização confirmada */}
          {hasCoords && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-2">
              <span className="text-green-600 text-sm">✓</span>
              <div className="flex-1 min-w-0">
                {locationLabel && <p className="text-xs text-green-800 font-medium truncate">{locationLabel}</p>}
                <p className="text-xs text-green-600">{form.latitude}, {form.longitude}</p>
              </div>
              <button
                type="button"
                onClick={() => { set('latitude', ''); set('longitude', ''); setLocationLabel('') }}
                className="text-green-400 hover:text-green-600 text-lg leading-none"
              >×</button>
            </div>
          )}

          {/* GPS */}
          <button
            type="button"
            onClick={useMyLocation}
            className="text-xs text-green-700 font-medium hover:underline mr-4"
          >
            {geoLoading ? 'Obtendo localização...' : '📍 Usar minha localização atual'}
          </button>

          {/* Manual toggle */}
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {showManual ? 'Ocultar coordenadas' : 'Inserir coordenadas manualmente'}
          </button>

          {showManual && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input
                value={form.latitude}
                onChange={(e) => { set('latitude', e.target.value); setLocationLabel('') }}
                placeholder="Latitude"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                value={form.longitude}
                onChange={(e) => { set('longitude', e.target.value); setLocationLabel('') }}
                placeholder="Longitude"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          )}

          {/* Hidden required inputs to trigger validation */}
          <input
            required
            readOnly
            tabIndex={-1}
            value={form.latitude}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
            onFocus={(e) => e.target.blur()}
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Descrição — como você descreveria esse lugar?</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Ex: Um cantinho cheio de figueiras centenárias, ótimo para deitar na grama e observar os pássaros..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        {/* Ótimo para */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Ótimo para</label>
          <div className="flex gap-3">
            {SUITABLE_FOR.map((item) => {
              const selected = suitableFor.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleSuitableFor(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    selected
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Amenidades */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">O que tem nesse parque?</label>
          <div className="flex flex-wrap gap-2">
            {PARK_AMENITIES.map((item) => {
              const selected = amenities.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleAmenity(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selected
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Seu nome *</label>
          <input
            required
            value={form.suggested_by}
            onChange={(e) => set('suggested_by', e.target.value)}
            placeholder="Como você quer ser chamado?"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Seu e-mail *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="Para contato, se precisarmos de mais informações"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <p className="text-xs text-gray-400 mt-1">Não será exibido publicamente.</p>
        </div>

        <button
          type="submit"
          disabled={loading || !hasCoords}
          className="w-full bg-green-700 text-white rounded-xl py-3 font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enviando...' : '🌱 Enviar praça'}
        </button>
      </form>
    </div>
  )
}
