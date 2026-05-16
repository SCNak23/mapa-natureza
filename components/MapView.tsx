'use client'

import { useEffect, useRef, useState } from 'react'
import type { Park } from '@/lib/types'

interface Props {
  parks: Park[]
  onParkClick: (park: Park) => void
  onMapClick?: (lat: number, lng: number) => void
}

export default function MapView({ parks, onParkClick, onMapClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<import('leaflet').Marker[]>([])
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([-23.55052, -46.633308])
    )
  }, [])

  // Inicializa o mapa quando userPos estiver disponível
  useEffect(() => {
    if (!mapRef.current || !userPos || mapInstanceRef.current) return

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView(userPos, 14)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const userIcon = L.divIcon({
        html: '<div style="width:14px;height:14px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: '',
      })
      L.marker(userPos, { icon: userIcon }).addTo(map).bindPopup('Você está aqui')

      if (onMapClick) {
        map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng)
        })
      }

      setMapReady(true)
    })
  }, [userPos, onMapClick])

  // Atualiza marcadores sempre que parks ou mapReady mudar
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    import('leaflet').then((L) => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const parkIcon = L.divIcon({
        html: `<div style="
          background:#2d6a4f;
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          width:36px;height:36px;
          box-shadow:0 2px 6px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
        "><span style="transform:rotate(45deg);font-size:18px;line-height:1;">🌳</span></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        className: '',
      })

      parks.forEach((park) => {
        const marker = L.marker([park.latitude, park.longitude], { icon: parkIcon })
          .addTo(mapInstanceRef.current!)
          .on('click', () => onParkClick(park))
        markersRef.current.push(marker)
      })

      // Ajusta o mapa para mostrar todos os pins
      if (parks.length > 0) {
        const bounds = L.latLngBounds(parks.map((p) => [p.latitude, p.longitude]))
        mapInstanceRef.current!.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
      }
    })
  }, [parks, onParkClick, mapReady])

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl" />
  )
}
