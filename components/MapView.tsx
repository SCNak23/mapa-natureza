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

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([-23.55052, -46.633308]) // São Paulo fallback
    )
  }, [])

  useEffect(() => {
    if (!mapRef.current || !userPos || mapInstanceRef.current) return

    import('leaflet').then((L) => {
      // Fix default icon path issue with webpack
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

      // User location marker
      const userIcon = L.divIcon({
        html: '<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '',
      })
      L.marker(userPos, { icon: userIcon }).addTo(map).bindPopup('Você está aqui')

      if (onMapClick) {
        map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng)
        })
      }
    })
  }, [userPos, onMapClick])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    import('leaflet').then((L) => {
      // Remove old markers
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
    })
  }, [parks, onParkClick])

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl" />
  )
}
