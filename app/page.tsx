'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Park } from '@/lib/types'
import ParkModal from '@/components/ParkModal'
import SuggestParkForm from '@/components/SuggestParkForm'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function Home() {
  const [parks, setParks] = useState<Park[]>([])
  const [selectedPark, setSelectedPark] = useState<Park | null>(null)
  const [showSuggest, setShowSuggest] = useState(false)
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    supabase
      .from('parks')
      .select('*')
      .eq('status', 'approved')
      .then(({ data }) => setParks(data ?? []))
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    setClickedCoords({ lat, lng })
  }

  return (
    <div className="relative flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <header style={{ background: '#E8C84A', color: '#3B2E1E' }} className="relative z-10 px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Natureza Perto de Mim" width={48} height={48} className="rounded-lg object-contain" />
          <div>
            <h1 className="font-bold text-base leading-tight">Natureza Perto de Mim</h1>
            <p className="text-xs opacity-70">
              áreas naturais e brincadeiras com a natureza{' '}
              <span className="opacity-50">|</span>{' '}
              criado por{' '}
              <a
                href="https://www.sercriancaenatural.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3B2E1E' }}
                className="underline hover:opacity-80"
              >
                Ser Criança é Natural
              </a>
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowSuggest(true); setClickedCoords(null) }}
          style={{ background: 'rgba(59,46,30,0.12)', color: '#3B2E1E' }}
          className="text-xs font-medium px-3 py-2 rounded-xl hover:opacity-80 transition-opacity"
        >
          + Sugerir lugar
        </button>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          parks={parks}
          onParkClick={setSelectedPark}
          onMapClick={handleMapClick}
        />

        {/* Tap hint */}
        {parks.length === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-xl px-4 py-2 text-sm text-gray-600 shadow pointer-events-none">
            Carregando praças...
          </div>
        )}

        {/* Click to suggest nudge */}
        {clickedCoords && !showSuggest && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <p className="text-sm font-medium text-gray-800">Tem uma praça aqui?</p>
              <p className="text-xs text-gray-500">Localização marcada no mapa</p>
            </div>
            <button
              onClick={() => setShowSuggest(true)}
              className="bg-green-700 text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-green-800 transition-colors"
            >
              Sugerir
            </button>
          </div>
        )}
      </div>

      {/* Bottom legend */}
      <div className="relative z-10 bg-white border-t px-4 py-2 flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">
          {parks.length} lugar{parks.length !== 1 ? 'es' : ''} mapeado{parks.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400">Toque em um pin para ver brincadeiras</p>
      </div>

      {/* Park modal */}
      {selectedPark && (
        <ParkModal park={selectedPark} onClose={() => setSelectedPark(null)} />
      )}

      {/* Suggest park drawer */}
      {showSuggest && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSuggest(false)}
        >
          <div
            style={{ background: 'white', borderRadius: '1.25rem 1.25rem 0 0', width: '100%', maxWidth: '32rem', maxHeight: '90dvh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <SuggestParkForm
              initialLat={clickedCoords?.lat}
              initialLng={clickedCoords?.lng}
              onDone={() => { setShowSuggest(false); setClickedCoords(null) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
